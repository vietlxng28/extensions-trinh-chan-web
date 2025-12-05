async function loadConfig() {
  try {
    const response = await fetch(chrome.runtime.getURL("config.json"));
    const data = await response.json();
    return data.websites || [];
  } catch (error) {
    console.error("[Blocker] Failed to load config:", error);
    return [];
  }
}

function shouldBlock(url, websites) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    for (const site of websites) {
      if (hostname.includes(site.domain)) {
        if (site.exceptions && site.exceptions.length > 0) {
          const isException = site.exceptions.some((path) =>
            pathname.startsWith(path)
          );
          if (isException) return false;
        }
        return true;
      }
    }
  } catch (e) {
    console.error("[Blocker] URL parse error:", e);
  }
  return false;
}

let cachedConfig = [];

async function setupNavigationListeners() {
  cachedConfig = await loadConfig();

  chrome.webNavigation.onCompleted.addListener(
    (details) => {
      if (details.frameId === 0 && shouldBlock(details.url, cachedConfig)) {
        chrome.tabs.update(details.tabId, {
          url: chrome.runtime.getURL("trang_chan.html"),
        });
      }
    },
    {
      url: cachedConfig.map((site) => ({
        hostContains: site.domain,
      })),
    }
  );

  chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if (shouldBlock(details.url, cachedConfig)) {
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL("trang_chan.html"),
      });
    }
  });
}

setupNavigationListeners();
console.log("[Blocker] Loaded");
