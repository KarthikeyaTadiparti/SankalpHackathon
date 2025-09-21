// --- Enhanced Helper functions ---
function getColor(score) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";  
  if (score >= 40) return "#ef4444";
  return "#dc2626";
}

function getTrustDescription(score) {
  if (score >= 80) return "This site appears trustworthy";
  if (score >= 60) return "Some concerning patterns detected";
  if (score >= 40) return "Multiple dark patterns found";
  return "High risk - many deceptive practices";
}

function drawScoreCircle(score) {
  const canvas = document.getElementById("scoreCircle");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = 60;
  const centerY = 60;
  const radius = 45;

  // Background circle
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Score arc with gradient effect
  const gradient = ctx.createLinearGradient(0, 0, 120, 120);
  gradient.addColorStop(0, getColor(score));
  gradient.addColorStop(1, getColor(score));

  ctx.strokeStyle = gradient;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, (2 * Math.PI) * (score / 100) - Math.PI / 2);
  ctx.stroke();

  // Score text
  ctx.font = "bold 24px -apple-system, sans-serif";
  ctx.fillStyle = "#1e293b";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(score, centerX, centerY);
}

function calculateTrustScore(issues) {
  let score = 100;
  if (!Array.isArray(issues)) return score;
  
  const penalties = {
    "Subscription Trap": 30,
    "Hidden Cancellation": 25,
    "Privacy Zuckering": 25,
    "Confirmshaming": 20,
    "Confirmshaming (Visual)": 20,
    "Forced Consent": 15,
    "Misleading Pricing": 15,
    "Urgency/Scarcity": 10,
    "Fake Urgency": 10,
    "Bait and Switch": 12,
    "Roach Motel": 18,
    "Hidden Costs": 15,
    "Forced Action": 20
  };

  issues.forEach(issue => {
    const penalty = penalties[issue.category] || 10;
    const severityMultiplier = issue.severity === 'high' ? 1.2 : issue.severity === 'low' ? 0.8 : 1;
    score -= Math.round(penalty * severityMultiplier);
  });

  return Math.max(0, score);
}

// --- Render issues with enhanced UI ---
function renderIssues(issues) {
  const container = document.getElementById("issuesList");
  if (!container) return;
  
  container.innerHTML = "";

  if (!Array.isArray(issues) || issues.length === 0) {
    container.innerHTML = `
      <div class="no-issues">
        <div class="icon">✅</div>
        <div><strong>Great news!</strong></div>
        <div>No major dark patterns detected on this page.</div>
      </div>
    `;
    return;
  }

  // Group issues by category
  const grouped = {};
  issues.forEach(issue => {
    if (!grouped[issue.category]) grouped[issue.category] = [];
    grouped[issue.category].push(issue);
  });

  // Sort categories by severity
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const highSeverityA = grouped[a].filter(i => i.severity === 'high').length;
    const highSeverityB = grouped[b].filter(i => i.severity === 'high').length;
    return highSeverityB - highSeverityA;
  });

  sortedCategories.forEach(category => {
    // Category header
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "category-header";
    categoryDiv.innerHTML = `
      <span>${getCategoryIcon(category)} ${category}</span>
      <span style="font-size: 11px; font-weight: normal; opacity: 0.7;">(${grouped[category].length})</span>
    `;
    container.appendChild(categoryDiv);

    // Issues in this category
    grouped[category].forEach((issue, index) => {
      const issueDiv = document.createElement("div");
      issueDiv.className = "issue-item";
      
      issueDiv.innerHTML = `
        <div class="issue-content">
          <div class="issue-snippet">${escapeHtml(issue.snippet || issue.detail || "Detected issue")}</div>
          <div class="issue-detail">
            ${escapeHtml(issue.detail || "")}
            <span class="severity-badge severity-${issue.severity || 'medium'}">${issue.severity || 'medium'}</span>
          </div>
        </div>
        <div class="issue-actions">
          <button class="locate-btn" data-issue-id="${issue.id}">📍 Locate</button>
        </div>
      `;
      
      container.appendChild(issueDiv);
    });
  });

  // Add event listeners for locate buttons
  container.querySelectorAll('.locate-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const issueId = this.getAttribute('data-issue-id');
      highlightIssue(issueId);
    });
  });
}

function getCategoryIcon(category) {
  const icons = {
    "Subscription Trap": "💳",
    "Hidden Cancellation": "❌",
    "Privacy Zuckering": "🔒",
    "Confirmshaming": "😟",
    "Confirmshaming (Visual)": "👁️",
    "Forced Consent": "☑️",
    "Misleading Pricing": "💰",
    "Urgency/Scarcity": "⏰",
    "Fake Urgency": "⚠️",
    "Bait and Switch": "🎣",
    "Roach Motel": "🏠",
    "Hidden Costs": "💸",
    "Forced Action": "⚡"
  };
  return icons[category] || "⚠️";
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateStats(issues) {
  document.getElementById('totalIssues').textContent = issues.length;
  document.getElementById('highSeverity').textContent = issues.filter(i => i.severity === 'high').length;
  document.getElementById('mediumSeverity').textContent = issues.filter(i => i.severity === 'medium').length;
}

// --- Communication with content script ---
function fetchIssues(callback) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (!tabs[0]) {
      callback([]);
      return;
    }
    
    chrome.tabs.sendMessage(tabs[0].id, {action: "getIssues"}, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error fetching issues:", chrome.runtime.lastError);
        callback([]);
        return;
      }
      callback(response && response.issues ? response.issues : []);
    });
  });
}

function highlightIssue(issueId) {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (!tabs[0]) return;
    
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "highlightSelector", 
      id: parseInt(issueId)
    }, (response) => {
      if (!response || !response.ok) {
        showNotification("Could not locate this element on the page", "error");
      } else {
        showNotification("Element highlighted on page", "success");
      }
    });
  });
}

function clearHighlights() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (!tabs[0]) return;
    
    chrome.tabs.sendMessage(tabs[0].id, {action: "clearHighlights"}, () => {
      showNotification("Highlights cleared", "success");
    });
  });
}

// --- Report generation ---
function generateReport(issues, url, title) {
  const timestamp = new Date().toISOString();
  const score = calculateTrustScore(issues);
  
  let report = `Dark UX Detector Report
${'='.repeat(40)}

Website: ${title}
URL: ${url}
Scan Date: ${new Date().toLocaleString()}
Trust Score: ${score}/100

Summary:
- Total Issues: ${issues.length}
- High Severity: ${issues.filter(i => i.severity === 'high').length}
- Medium Severity: ${issues.filter(i => i.severity === 'medium').length}
- Low Severity: ${issues.filter(i => i.severity === 'low').length}

`;

  if (issues.length === 0) {
    report += "✅ Great news! No dark patterns were detected on this page.\n";
  } else {
    report += "Detected Issues:\n" + "─".repeat(20) + "\n\n";
    
    const grouped = {};
    issues.forEach(issue => {
      if (!grouped[issue.category]) grouped[issue.category] = [];
      grouped[issue.category].push(issue);
    });

    Object.keys(grouped).forEach(category => {
      report += `${getCategoryIcon(category)} ${category} (${grouped[category].length} issues)\n`;
      grouped[category].forEach((issue, index) => {
        report += `  ${index + 1}. ${issue.snippet || issue.detail}\n`;
        if (issue.detail && issue.detail !== issue.snippet) {
          report += `     Details: ${issue.detail}\n`;
        }
        report += `     Severity: ${issue.severity || 'medium'}\n\n`;
      });
      report += "\n";
    });
  }

  report += `
${'='.repeat(40)}
Report generated by Dark UX Detector v1.0
Help protect others by sharing this information!
`;

  return report;
}

function downloadReport(issues, url, title) {
  const report = generateReport(issues, url, title);
  const blob = new Blob([report], {type: "text/plain"});
  const downloadUrl = URL.createObjectURL(blob);
  
  const filename = `dark-ux-report-${new Date().getTime()}.txt`;
  
  // Try chrome.downloads API first, fallback to direct download
  if (chrome.downloads && chrome.downloads.download) {
    chrome.downloads.download({
      url: downloadUrl,
      filename: filename,
      saveAs: true
    }, () => {
      URL.revokeObjectURL(downloadUrl);
      if (chrome.runtime.lastError) {
        // Fallback to direct download
        directDownload(downloadUrl, filename);
      } else {
        showNotification("Report downloaded successfully", "success");
      }
    });
  } else {
    // Direct download fallback
    directDownload(downloadUrl, filename);
  }
}

function directDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotification("Report downloaded successfully", "success");
}

function shareReport(issues, url, title) {
  const score = calculateTrustScore(issues);
  const issueCount = issues.length;
  
  const shareText = `🛡️ Dark UX Detector Report for ${title}

Trust Score: ${score}/100
Issues Found: ${issueCount}

${issues.length > 0 ? 
  `⚠️ This site contains potentially deceptive patterns. Be careful!` : 
  `✅ This site appears trustworthy!`}

Scanned with Dark UX Detector browser extension.`;

  if (navigator.share) {
    navigator.share({
      title: 'Dark UX Detector Report',
      text: shareText,
      url: url
    }).catch(err => console.log('Error sharing:', err));
  } else {
    navigator.clipboard.writeText(shareText).then(() => {
      showNotification("Report copied to clipboard", "success");
    }).catch(() => {
      showNotification("Could not copy report", "error");
    });
  }
}

// --- UI Helper functions ---
function showNotification(message, type = "info") {
  // Simple notification system
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// --- Event listeners ---
document.addEventListener('DOMContentLoaded', function() {
  const loadingEl = document.getElementById('loading');
  const resultsEl = document.getElementById('results');
  
  // Initialize the extension
  fetchIssues((issues) => {
    // Get current tab info
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const currentTab = tabs[0];
      const url = currentTab ? currentTab.url : '';
      const title = currentTab ? currentTab.title : '';
      
      // Calculate and display score
      const score = calculateTrustScore(issues);
      drawScoreCircle(score);
      
      // Update UI elements
      document.getElementById('trustLabel').textContent = `Trust Score: ${score}`;
      document.getElementById('trustDescription').textContent = getTrustDescription(score);
      
      // Update stats and render issues
      updateStats(issues);
      renderIssues(issues);
      
      // Show results, hide loading
      loadingEl.style.display = 'none';
      resultsEl.style.display = 'block';
      
      // Setup event listeners
      document.getElementById('downloadReport').addEventListener('click', () => {
        downloadReport(issues, url, title);
      });
      
      document.getElementById('shareReport').addEventListener('click', () => {
        shareReport(issues, url, title);
      });
      
      document.getElementById('clearHighlights').addEventListener('click', clearHighlights);
      
      document.getElementById('reportFalsePositive').addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({url: 'https://github.com/your-repo/dark-ux-detector/issues'});
      });
    });
  });
});

// Add CSS animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);