import { defineContentScript } from "wxt/sandbox";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // Listen for messages from the background script asking for the visible page text.
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      // Only respond to messages from our own extension's background — never to
      // arbitrary web pages or other extensions.
      if (sender.id !== chrome.runtime.id) return false;
      if (msg?.type !== "extract-text") return false;
      const sel = window.getSelection()?.toString() ?? "";
      const text = sel.length > 0 ? sel : document.body.innerText;
      sendResponse({ text: text.slice(0, 12000) });
      return true;
    });
  },
});
