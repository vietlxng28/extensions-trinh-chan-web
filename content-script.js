let isRedirecting = false;

function checkAndBlock(websites) {
  if (isRedirecting) return;

  const currentUrl = window.location.href;
  const pathname = window.location.pathname;

  const blockedSite = websites.find((site) =>
    currentUrl.includes(site.domain)
  );

  if (!blockedSite) return;

  let isAllowed = blockedSite.exceptions.some((path) =>
    pathname.startsWith(path)
  );

  if (!isAllowed) {
    isRedirecting = true;
    window.location.href = chrome.runtime.getURL("trang_chan.html");
  }
}

async function init() {
  try {
    const response = await fetch(chrome.runtime.getURL("config.json"));
    const data = await response.json();
    const websites = data.websites || [];

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => checkAndBlock(websites));
    } else {
      checkAndBlock(websites);
    }
  } catch (error) {
    console.error("[Blocker] Failed to load config:", error);
  }
}

init();
