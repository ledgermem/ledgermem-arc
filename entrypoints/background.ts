import { defineBackground } from "wxt/sandbox";
import { ingestPage } from "../src/memory-client.js";
import { spaceForTab } from "../src/space.js";

export default defineBackground(() => {
  // URLs the scripting API and most permissions cannot touch. Skip them quietly
  // instead of throwing on chrome.scripting.executeScript.
  const isUnscriptableUrl = (url: string): boolean =>
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("arc://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("view-source:") ||
    url.startsWith("https://chrome.google.com/webstore");

  chrome.commands.onCommand.addListener(async (command) => {
    if (command !== "save-boost") return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url || !tab.title) return;
    if (isUnscriptableUrl(tab.url)) return;
    const spaceName = await spaceForTab(tab);
    let text = "";
    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText.slice(0, 8000),
      });
      text = typeof result === "string" ? result : "";
    } catch {
      // Page may not allow injection (e.g., view-source, file://). Fall back to URL+title only.
      text = "";
    }
    await ingestPage({
      source: "arc-boost",
      url: tab.url,
      title: tab.title,
      text,
      capturedAt: new Date().toISOString(),
      spaceName,
    });
  });

  // Tidy tab capture: respond to a popup-triggered request to ingest all tabs in the current window.
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // Reject messages from web pages or other extensions — only our own code may invoke this.
    if (sender.id !== chrome.runtime.id) return false;
    if (msg?.type !== "tidy-tabs") return false;
    void (async () => {
      const tabs = await chrome.tabs.query({ currentWindow: true });
      let count = 0;
      for (const tab of tabs) {
        if (!tab.url || !tab.title || isUnscriptableUrl(tab.url)) continue;
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
