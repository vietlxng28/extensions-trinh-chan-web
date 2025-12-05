let currentSiteConfig = null;
let debounceTimer = null;

function patternToRegex(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("^" + escaped.replace(/\*/g, ".*") + "$");
}

function checkAndBlock() {
  if (!currentSiteConfig) return;

  const currentUrl = window.location.href;

  let isAllowed = false;

  if (currentSiteConfig.exceptions && currentSiteConfig.exceptions.length > 0) {
    isAllowed = currentSiteConfig.exceptions.some((pattern) => {
      const regex = patternToRegex(pattern);
      return regex.test(currentUrl);
    });
  }

  if (!isAllowed) {
    if (!currentUrl.includes("trang_chan.html")) {
      window.location.href = chrome.runtime.getURL("trang_chan.html");
    }
  }
}

function setupSPAMonitoring() {
  checkAndBlock();

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(history, args);
    setTimeout(checkAndBlock, 50);
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(history, args);
    setTimeout(checkAndBlock, 50);
  };

  window.addEventListener("popstate", () => {
    setTimeout(checkAndBlock, 50);
  });

  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      checkAndBlock();
    }, 500);
  });

  observer.observe(document, { subtree: true, childList: true });
}

(async function init() {
  const result = await chrome.storage.local.get(["websiteConfigs"]);
  const allConfigs = result.websiteConfigs || [];

  if (allConfigs.length === 0) return;

  const currentHostname = window.location.hostname;

  currentSiteConfig = allConfigs.find((config) => {
    return currentHostname.includes(config.domain);
  });

  if (currentSiteConfig) {
    setupSPAMonitoring();
  }
})();
