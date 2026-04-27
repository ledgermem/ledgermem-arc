import { defineContentScript } from "wxt/sandbox";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // Listen for messages from the background script asking for the visible page text.
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg?.type !== "extract-text") return false;
      const sel = window.getSelection()?.toString() ?? "";
      const text = sel.length > 0 ? sel : document.body.innerText;
      sendResponse({ text: text.slice(0, 12000) });
      return true;
    });
  },
});
