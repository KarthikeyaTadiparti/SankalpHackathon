console.log("Dark UX Detector content script loaded.");

let highlights = [];
let findings = [];
let observerActive = false;
let lastScanTime = 0;

// --- Helper: normalize text ---
function normalize(str) {
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
}

// --- Helper: Get a button's text ---
function getButtonText(el) {
    const text = el.textContent || "";
    return text.trim().slice(0, 80);
}

// --- Helper: Check if element is visible ---
function isElementVisible(el) {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        parseFloat(style.opacity) > 0.1
    );
}

// --- Helper: Generate unique selector ---
function generateSelector(el) {
    if (el.id) return `#${el.id}`;
    
    let path = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
        let selector = el.nodeName.toLowerCase();
        if (el.className) {
            selector += '.' + Array.from(el.classList).join('.');
        }
        path.unshift(selector);
        el = el.parentNode;
        if (path.length > 4) break; // Limit depth
    }
    return path.join(' > ');
}

// --- Highlighting functions ---
function applyHighlight(el, type) {
    if (!document.getElementById('darkux-style')) {
        const style = document.createElement('style');
        style.id = 'darkux-style';
        style.textContent = `
            .darkux-highlight {
                outline: 3px solid #ff3b30 !important;
                box-shadow: 0 0 12px rgba(255,59,48,0.6) !important;
                z-index: 2147483647 !important;
                position: relative !important;
                animation: darkux-pulse 2s infinite;
            }
            @keyframes darkux-pulse {
                0% { box-shadow: 0 0 12px rgba(255,59,48,0.6); }
                50% { box-shadow: 0 0 20px rgba(255,59,48,0.9); }
                100% { box-shadow: 0 0 12px rgba(255,59,48,0.6); }
            }
            .darkux-badge {
                position: fixed;
                background: #ff3b30;
                color: white;
                padding: 6px 8px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 2147483648;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.2);
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    el.classList.add('darkux-highlight');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    highlights.push(el);

    const rect = el.getBoundingClientRect();
    const badge = document.createElement('div');
    badge.className = 'darkux-badge';
    badge.textContent = type;
    badge.style.left = Math.max(8, rect.left) + 'px';
    badge.style.top = Math.max(8, rect.top - 36) + 'px';
    document.body.appendChild(badge);
    highlights.push(badge);

    // Auto-remove highlight after 10 seconds
    setTimeout(() => {
        if (el.classList.contains('darkux-highlight')) {
            el.classList.remove('darkux-highlight');
        }
        if (badge.parentNode) {
            badge.remove();
        }
    }, 10000);
}

function clearHighlights() {
    highlights.forEach(el => {
        if (el.remove) {
            el.remove();
        } else {
            el.classList.remove('darkux-highlight');
        }
    });
    highlights = [];
}

// --- Enhanced detection logic ---
function detectDarkPatterns() {
    const now = Date.now();
    if (now - lastScanTime < 2000) return findings; // Throttle scans
    lastScanTime = now;
    
    findings = [];

    // Enhanced regex patterns with more comprehensive detection
    const regexPatterns = {
        "Subscription Trap": /auto[‐\-\s]*renew|recurring\s+billing|charged\s+[₹$€£]|cancel\s+anyway|we\s+will\s+miss\s+you|are\s+you\s+sure.*want.*lose|confirm\s+cancellation|call\s+to\s+cancel|send.*letter.*cancel|trial\s+period\s+ends|billing\s+cycle|subscription\s+fee|membership\s+fee|auto.*charged|will\s+be\s+billed/i,
        
        "Confirmshaming": /no,?\s*i\s+don'?t\s+want|no\s+thanks,?\s*i'?ll|i\s+will\s+pass|i\s+don'?t\s+want.*save.*money|i'?ll\s+pay\s+full\s+price|i'?ll\s+stick.*old\s+price|i\s+prefer.*pay\s+more|no.*not\s+interested|skip.*offer|maybe\s+later|continue\s+without|i\s+don'?t\s+need|no,?\s*keep\s+me\s+poor|i\s+hate\s+saving|i\s+love\s+wasting\s+money/i,
        
        "Urgency/Scarcity": /limited\s+time|only\s+\d+\s+left|hurry,?\s*buy\s+now|don'?t\s+miss\s+out|expires?\s+in|sale\s+ends?\s+in|deal\s+expires?|people?\s+are\s+viewing|offer.*for\s+today\s+only|flash\s+sale|act\s+now|while\s+supplies?\s+last|going\s+fast|almost\s+sold\s+out|\d+\s+people?\s+bought.*last\s+hour|selling\s+fast|stock\s+running\s+low/i,
        
        "Hidden Costs": /shipping.*handling|service\s+fee|convenience\s+fee|processing\s+fee|extra\s+charges?.*apply|additional\s+fees?|taxes?\s+not\s+included|\+\s*tax|\+\s*shipping|handling\s+charge|booking\s+fee|transaction\s+fee|payment\s+processing/i,
        
        "Forced Action": /by\s+continuing.*agree|i\s+accept.*terms|automatically\s+agree|consent.*continue|proceeding.*acceptance|clicking.*agree|using\s+this.*agree|access.*accept/i,
        
        "Misleading Pricing": /was\s+[₹$€£]\d+|save\s+\d+%|originally\s+[₹$€£]\d+|compare\s+at|retail\s+price|msrp|you\s+save|discount.*expires?|special\s+price|limited.*offer|crossed.*out.*price|strike.*through.*price/i,
        
        "Bait and Switch": /switch\s+to|upgrade\s+now|premium\s+version|unlock\s+features?|full\s+version|complete\s+access|get\s+more|additional\s+features?|basic.*limited|pro.*unlimited/i,
        
        "Privacy Zuckering": /share.*data|sell.*information|third\s+party|marketing\s+partners?|data\s+collection|tracking|cookies?\s+required|accept\s+all\s+cookies?|allow\s+all|consent.*all.*cookies|necessary.*cookies/i
    };

    // 1. Pre-checked checkbox detection (enhanced)
    document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(el => {
        if (el.checked && !el.hasAttribute('data-user-checked')) {
            const labelEl = document.querySelector(`label[for="${el.id}"]`) || el.closest('label');
            const parent = el.closest('div, form, fieldset') || el.parentElement;
            const text = labelEl ? labelEl.textContent : (parent ? parent.textContent : "");
            
            // Check if it's related to subscriptions, marketing, or data sharing
            const suspiciousPatterns = /newsletter|marketing|promotional|special\s+offers?|third\s+party|share.*data|updates?|notifications?|advertising|cookies?|tracking/i;
            
            findings.push({
                category: suspiciousPatterns.test(text) ? "Privacy Zuckering" : "Forced Consent",
                detail: "Pre-checked box detected",
                snippet: text.trim().slice(0, 100),
                el: el,
                selector: generateSelector(el),
                severity: suspiciousPatterns.test(text) ? "high" : "medium"
            });
        }
    });

    // 2. Text-based pattern detection with context analysis
    document.querySelectorAll("button, a, p, span, h1, h2, h3, div, label, input[type='submit']").forEach(el => {
        const text = el.textContent || el.value || "";
        if (text.length < 5 || !isElementVisible(el)) return;

        for (const [category, pattern] of Object.entries(regexPatterns)) {
            if (pattern.test(text)) {
                findings.push({
                    category: category,
                    detail: `Detected ${category.toLowerCase()} pattern`,
                    snippet: text.trim().slice(0, 100),
                    el: el,
                    selector: generateSelector(el),
                    severity: getSeverity(category)
                });
                break; // Only assign one category per element
            }
        }
    });

    // 3. Enhanced visual prominence detection for confirmshaming
    document.querySelectorAll("button, a, input[type='submit']").forEach(el => {
        const text = normalize(getButtonText(el) || el.value || "");
        const negativePhrases = [
            "cancel anyway", "no, keep my perks", "no thanks", "i will pass",
            "skip this offer", "maybe later", "continue without", "i don't need this",
            "no, i don't want", "i'll pay full price", "i prefer to pay more"
        ];

        if (negativePhrases.some(phrase => text.includes(phrase))) {
            const container = el.closest('div, form, section');
            if (!container) return;

            const buttons = Array.from(container.querySelectorAll('button, a, input[type="submit"]'))
                .filter(btn => isElementVisible(btn));
            
            if (buttons.length < 2) return;

            const otherButtons = buttons.filter(btn => btn !== el);
            const hasLessProminent = otherButtons.some(other => {
                return isLessProminent(el, other);
            });

            if (hasLessProminent) {
                findings.push({
                    category: "Confirmshaming (Visual)",
                    detail: "Negative option styled less prominently",
                    snippet: `"${text}" vs other options`,
                    el: el,
                    selector: generateSelector(el),
                    severity: "high"
                });
            }
        }
    });

    // 4. Hidden or tiny cancellation/unsubscribe links
    document.querySelectorAll('a, button').forEach(el => {
        const text = normalize(el.textContent || el.innerText || "");
        const cancelPatterns = /cancel|unsubscribe|opt[‐\-\s]*out|remove.*subscription|delete.*account|close.*account|stop.*emails|turn.*off.*notifications/;
        
        if (cancelPatterns.test(text)) {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            
            const isHidden = (
                style.display === "none" ||
                style.visibility === "hidden" ||
                parseFloat(style.opacity) < 0.3 ||
                rect.width < 10 || 
                rect.height < 10 ||
                parseFloat(style.fontSize) < 12
            );
            
            if (isHidden) {
                findings.push({
                    category: "Hidden Cancellation",
                    detail: "Cancellation option is hidden or extremely small",
                    snippet: text.trim().slice(0, 80),
                    el: el,
                    selector: generateSelector(el),
                    severity: "high"
                });
            }
        }
    });

    // 5. Fake countdown timers (detect rapidly changing numbers)
    document.querySelectorAll('[id*="countdown"], [class*="countdown"], [id*="timer"], [class*="timer"]').forEach(el => {
        const text = el.textContent;
        if (/\d{1,2}:\d{2}|\d+\s*(minutes?|hours?|seconds?)/.test(text)) {
            findings.push({
                category: "Fake Urgency",
                detail: "Potential fake countdown timer detected",
                snippet: text.trim().slice(0, 80),
                el: el,
                selector: generateSelector(el),
                severity: "medium"
            });
        }
    });

    // 6. Detect multiple redirect attempts (for roach motel pattern)
    if (window.history.length > 3 && document.referrer) {
        const currentDomain = window.location.hostname;
        try {
            const referrerDomain = new URL(document.referrer).hostname;
            
            if (currentDomain !== referrerDomain) {
                findings.push({
                    category: "Roach Motel",
                    detail: "Multiple redirects detected - potential roach motel pattern",
                    snippet: `From ${referrerDomain} to ${currentDomain}`,
                    el: document.body,
                    selector: "body",
                    severity: "medium"
                });
            }
        } catch (e) {
            // Invalid referrer URL
        }
    }

    // 7. Detect hard-to-find close buttons or modals
    document.querySelectorAll('[role="dialog"], .modal, .popup, .overlay').forEach(modal => {
        const closeButtons = modal.querySelectorAll('button, a, [role="button"]');
        const hasHiddenClose = Array.from(closeButtons).some(btn => {
            const style = window.getComputedStyle(btn);
            const text = normalize(btn.textContent || "");
            
            return (text.includes("close") || text.includes("×") || text.includes("✕")) &&
                   (parseFloat(style.opacity) < 0.5 || parseFloat(style.fontSize) < 12);
        });

        if (hasHiddenClose) {
            findings.push({
                category: "Hard to Close",
                detail: "Modal with hard-to-find close button",
                snippet: "Modal with unclear closing mechanism",
                el: modal,
                selector: generateSelector(modal),
                severity: "medium"
            });
        }
    });

    // 8. Friend spam detection
    document.querySelectorAll('button, input[type="submit"], a').forEach(el => {
        const text = normalize(el.textContent || el.value || "");
        if (/invite.*friends|share.*contacts|import.*contacts|find.*friends|connect.*contacts/.test(text)) {
            findings.push({
                category: "Friend Spam",
                detail: "Potential friend spam mechanism",
                snippet: text.slice(0, 80),
                el: el,
                selector: generateSelector(el),
                severity: "medium"
            });
        }
    });

    // Remove duplicates and sort by severity
    const uniqueFindings = removeDuplicateFindings(findings);
    findings = uniqueFindings.sort((a, b) => {
        const severityOrder = { "high": 3, "medium": 2, "low": 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
    });

    // Update badge
    updateExtensionBadge();

    return findings.map((f, i) => ({
        id: i,
        category: f.category,
        detail: f.detail,
        snippet: f.snippet,
        selector: f.selector,
        severity: f.severity || "medium"
    }));
}

// --- Helper functions ---
function getSeverity(category) {
    const highSeverity = ["Subscription Trap", "Hidden Cancellation", "Privacy Zuckering", "Confirmshaming (Visual)"];
    const lowSeverity = ["Urgency/Scarcity", "Misleading Pricing", "Fake Urgency"];
    
    if (highSeverity.includes(category)) return "high";
    if (lowSeverity.includes(category)) return "low";
    return "medium";
}

function isLessProminent(el1, el2) {
    const style1 = window.getComputedStyle(el1);
    const style2 = window.getComputedStyle(el2);
    
    return (
        parseFloat(style1.fontSize) < parseFloat(style2.fontSize) ||
        (style1.backgroundColor === 'rgba(0, 0, 0, 0)' && style2.backgroundColor !== 'rgba(0, 0, 0, 0)') ||
        parseFloat(style1.opacity) < parseFloat(style2.opacity) ||
        (style1.textDecoration === 'underline' && style2.textDecoration !== 'underline') ||
        (style1.fontWeight === 'normal' && style2.fontWeight !== 'normal')
    );
}

function removeDuplicateFindings(findings) {
    const seen = new Set();
    return findings.filter(finding => {
        const key = `${finding.category}-${finding.selector}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function updateExtensionBadge() {
    const issueCount = findings.length;
    const highSeverityCount = findings.filter(f => f.severity === 'high').length;
    const severity = highSeverityCount > 0 ? 'high' : 
                    findings.some(f => f.severity === 'medium') ? 'medium' : 'low';

    chrome.runtime.sendMessage({
        action: 'updateBadge',
        issueCount: issueCount,
        severity: severity
    }).catch(() => {
        // Background script might not be ready
    });
}

// --- Dynamic content monitoring ---
function startDynamicMonitoring() {
    if (observerActive) return;
    
    const observer = new MutationObserver((mutations) => {
        let shouldRecheck = false;
        
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const text = node.textContent || '';
                        // Check if new content contains potential dark patterns
                        if (text.length > 10 && /cancel|subscription|offer|limited|urgent|cookies|consent|agree/i.test(text)) {
                            shouldRecheck = true;
                        }
                    }
                });
            }
        });
        
        if (shouldRecheck) {
            // Debounce re-detection
            clearTimeout(window.darkUXRecheck);
            window.darkUXRecheck = setTimeout(() => {
                detectDarkPatterns();
            }, 1000);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['checked', 'style', 'class']
    });
    
    observerActive = true;
}

// --- Message listener ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "getIssues") {
        clearHighlights();
        const issues = detectDarkPatterns();
        sendResponse({ 
            issues, 
            url: location.href, 
            title: document.title,
            timestamp: new Date().toISOString()
        });
    } else if (msg.action === "highlightSelector") {
        clearHighlights();
        const finding = findings[msg.id];
        if (finding && finding.el) {
            applyHighlight(finding.el, finding.category);
            sendResponse({ ok: true });
        } else {
            // Fallback: try to find element by selector
            if (msg.selector) {
                try {
                    const el = document.querySelector(msg.selector);
                    if (el) {
                        applyHighlight(el, "Detected Pattern");
                        sendResponse({ ok: true });
                        return;
                    }
                } catch (e) {
                    console.warn("Invalid selector:", msg.selector);
                }
            }
            sendResponse({ ok: false });
        }
    } else if (msg.action === "clearHighlights") {
        clearHighlights();
        sendResponse({ ok: true });
    } else if (msg.action === "startMonitoring" || msg.action === "autoScan") {
        startDynamicMonitoring();
        detectDarkPatterns();
        sendResponse({ ok: true });
    } else if (msg.action === "rescan") {
        clearHighlights();
        detectDarkPatterns();
        sendResponse({ ok: true });
    } else if (msg.action === "reportElement") {
        // Handle element reporting
        sendResponse({ ok: true, message: "Element reported" });
    }

    return true; // Keep message channel open for async response
});

// Auto-start monitoring for dynamic content
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            startDynamicMonitoring();
            detectDarkPatterns();
        }, 1000);
    });
} else {
    setTimeout(() => {
        startDynamicMonitoring();
        detectDarkPatterns();
    }, 1000);
}

// Track user interactions to avoid flagging user-initiated actions
document.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox' || e.target.type === 'radio') {
        e.target.setAttribute('data-user-checked', 'true');
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    clearHighlights();
    observerActive = false;
});