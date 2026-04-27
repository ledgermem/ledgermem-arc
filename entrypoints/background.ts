import { defineBackground } from "wxt/sandbox";
import { ingestPage } from "../src/memory-client.js";
import { spaceForTab } from "../src/space.js";

export default defineBackground(() => {
  chrome.commands.onCommand.addListener(async (command) => {
    if (command !== "save-boost") return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url || !tab.title) return;
    const spaceName = await spaceForTab(tab);
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText.slice(0, 8000),
    });
    await ingestPage({
      source: "arc-boost",
      url: tab.url,
      title: tab.title,
      text: typeof result === "string" ? result : "",
      capturedAt: new Date().toISOString(),
      spaceName,
    });
  });

  // Tidy tab capture: respond to a popup-triggered request to ingest all tabs in the current window.
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type !== "tidy-tabs") return false;
    void (async () => {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      let count = 0;
      for (const tab of tabs) {
        if (!tab.url || !tab.title || tab.url.startsWith("chrome://")) continue;
        const spaceName = await spaceForTab(tab);
        await ingestPage({
          source: "arc-tab",
          url: tab.url,
          title: tab.title,
          text: "",
          capturedAt: new Date().toISOString(),
          spaceName,
        });
        count += 1;
      }
      sendResponse({ ok: true, count });
    })();
    return true;
  });
});
