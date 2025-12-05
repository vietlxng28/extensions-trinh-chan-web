const WEBSITE_CONFIGS = [
  {
    domain: "facebook.com",
    exceptions: [
      "*://*.facebook.com/messages/*",
      "*://*.facebook.com/login/*",
      "*://*.facebook.com/checkpoint/*",
    ],
  },

  { domain: "tiktok.com", exceptions: [] },
  { domain: "instagram.com", exceptions: [] },
  { domain: "reddit.com", exceptions: [] },
  { domain: "twitch.tv", exceptions: [] },
  { domain: "twitter.com", exceptions: [] },
  { domain: "x.com", exceptions: [] },
  { domain: "pinterest.com", exceptions: [] },
  { domain: "snapchat.com", exceptions: [] },
  { domain: "discord.com", exceptions: [] },
  { domain: "webtoons.com", exceptions: [] },
  { domain: "mangadex.org", exceptions: [] },
  { domain: "roblox.com", exceptions: [] },
  { domain: "steampowered.com", exceptions: [] },
  { domain: "dailymotion.com", exceptions: [] },
  { domain: "netflix.com", exceptions: [] },
  { domain: "primevideo.com", exceptions: [] },
  { domain: "vimeo.com", exceptions: [] },
  { domain: "9gag.com", exceptions: [] },
  { domain: "quora.com", exceptions: [] },
  { domain: "tumblr.com", exceptions: [] },
];

async function setupRules() {
  const rules = [];
  let ruleId = 1;

  WEBSITE_CONFIGS.forEach((site) => {
    if (site.exceptions && site.exceptions.length > 0) {
      site.exceptions.forEach((pattern) => {
        rules.push({
          id: ruleId++,
          priority: 100,
          action: { type: "allow" },
          condition: {
            urlFilter: pattern,
            resourceTypes: ["main_frame"],
          },
        });
      });
    }

    rules.push({
      id: ruleId++,
      priority: 10,
      action: {
        type: "redirect",
        redirect: { extensionPath: "/trang_chan.html" },
      },
      condition: {
        urlFilter: `||${site.domain}`,
        resourceTypes: ["main_frame"],
      },
    });
  });

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map((rule) => rule.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: rules,
  });

  await chrome.storage.local.set({ websiteConfigs: WEBSITE_CONFIGS });

  console.log(`Đã cập nhật chặn ${WEBSITE_CONFIGS.length} trang web.`);
}

chrome.runtime.onInstalled.addListener(setupRules);
chrome.runtime.onStartup.addListener(setupRules);
