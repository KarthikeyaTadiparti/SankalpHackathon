// Background script for Dark UX Detector Extension
console.log('Dark UX Detector background script loaded');

// Extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Dark UX Detector installed:', details.reason);
  
  if (details.reason === 'install') {
    // Set default settings
    try {
      chrome.storage.sync.set({
        enabled: true,
        autoScan: true,
        notifications: true,
        reportData: true
      });
      console.log('Default settings saved');
    } catch (error) {
      console.error('Error setting default settings:', error);
    }
  }
  
  // Create context menus if available
  if (chrome.contextMenus) {
    try {
      chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
          id: 'scanPage',
          title: 'Scan for Dark Patterns',
          contexts: ['page']
        }, () => {
          if (chrome.runtime.lastError) {
            console.log('Context menu creation failed:', chrome.runtime.lastError);
          }
        });
        
        chrome.contextMenus.create({
          id: 'reportElement',
          title: 'Report Suspicious Element',
          contexts: ['selection']
        }, () => {
          if (chrome.runtime.lastError) {
            console.log('Context menu creation failed:', chrome.runtime.lastError);
          }
        });
      });
    } catch (error) {
      console.log('Context menus not available:', error);
    }
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked for tab:', tab.url);
});

// Badge management based on scan results
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.action === 'updateBadge') {
      const tabId = sender.tab?.id;
      if (tabId) {
        updateBadge(tabId, request.issueCount, request.severity);
      }
      sendResponse({ok: true});
    } else if (request.action === 'reportIssue') {
      // Handle issue reporting to backend
      handleIssueReport(request.data);
      sendResponse({ok: true});
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ok: false, error: error.message});
  }
  return true; // Keep message channel open
});

// Update extension badge based on findings
function updateBadge(tabId, issueCount, severity = 'medium') {
  try {
    if (issueCount === 0) {
      chrome.action.setBadgeText({ text: '', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId });
      chrome.action.setTitle({ title: 'Dark UX Detector - No issues found', tabId });
    } else {
      const text = issueCount > 99 ? '99+' : issueCount.toString();
      chrome.action.setBadgeText({ text, tabId });
      
      // Color based on severity
      const colors = {
        'high': '#dc2626',
        'medium': '#f59e0b',
        'low': '#10b981'
      };
      chrome.action.setBadgeBackgroundColor({ color: colors[severity] || colors.medium, tabId });
      chrome.action.setTitle({ 
        title: `Dark UX Detector - ${issueCount} issue${issueCount > 1 ? 's' : ''} found`, 
        tabId 
      });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Handle issue reporting to backend (if implemented)
async function handleIssueReport(data) {
  try {
    // Store locally for now, can be sent to backend later
    const result = await chrome.storage.local.get(['reports']);
    let reports = result.reports || [];
    
    const report = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      url: data.url,
      title: data.title,
      issues: data.issues,
      userAgent: navigator.userAgent
    };
    
    reports.push(report);
    
    // Keep only last 100 reports
    if (reports.length > 100) {
      reports = reports.slice(-100);
    }
    
    await chrome.storage.local.set({ reports: reports });
    console.log('Issue report stored locally:', report.id);
    
  } catch (error) {
    console.error('Error handling issue report:', error);
  }
}

// Handle context menu clicks - only if contextMenus API is available
if (chrome.contextMenus && chrome.contextMenus.onClicked) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    try {
      if (info.menuItemId === 'scanPage') {
        // Trigger a rescan of the current page
        chrome.tabs.sendMessage(tab.id, { action: 'rescan' }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Error sending rescan message:', chrome.runtime.lastError);
          }
        });
      } else if (info.menuItemId === 'reportElement') {
        // Handle reporting of specific elements
        chrome.tabs.sendMessage(tab.id, { 
          action: 'reportElement', 
          selection: info.selectionText 
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Error sending report message:', chrome.runtime.lastError);
          }
        });
      }
    } catch (error) {
      console.error('Error handling context menu click:', error);
    }
  });
}

// Tab updates - rescan when page changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      // Clear badge when page loads
      chrome.action.setBadgeText({ text: '', tabId });
      
      // Auto-scan if enabled
      chrome.storage.sync.get(['autoScan'], (result) => {
        if (result.autoScan !== false) {
          // Small delay to ensure page is fully loaded
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { action: 'autoScan' }, (response) => {
              if (chrome.runtime.lastError) {
                // Content script might not be ready yet, that's okay
                console.log('Auto-scan message failed (normal on some pages):', chrome.runtime.lastError.message);
              }
            });
          }, 2000);
        }
      });
    } catch (error) {
      console.error('Error handling tab update:', error);
    }
  }
});

// Handle extension updates
chrome.runtime.onUpdateAvailable.addListener(() => {
  console.log('Extension update available');
});

// Storage management
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', changes, namespace);
});

// Error handling
chrome.runtime.onSuspend.addListener(() => {
  console.log('Background script suspending...');
});

// Cleanup old reports periodically
chrome.alarms.create('cleanupReports', { periodInMinutes: 60 * 24 }); // Daily

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupReports') {
    cleanupOldReports();
  }
});

async function cleanupOldReports() {
  try {
    const result = await chrome.storage.local.get(['reports']);
    const reports = result.reports;
    
    if (!reports || !Array.isArray(reports)) return;
    
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const cleanedReports = reports.filter(report => {
      return new Date(report.timestamp).getTime() > oneMonthAgo;
    });
    
    await chrome.storage.local.set({ reports: cleanedReports });
    console.log(`Cleaned up ${reports.length - cleanedReports.length} old reports`);
    
  } catch (error) {
    console.error('Error cleaning up reports:', error);
  }
}