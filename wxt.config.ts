import { defineConfig } from "wxt";

export default defineConfig({
  modules: [],
  manifest: {
    name: "LedgerMem for Arc",
    description:
      "Capture Boosts, tidy tabs, and group memories by Arc Space.",
    version: "0.1.0",
    permissions: ["storage", "tabs", "activeTab", "scripting"],
    // Restrict to web schemes only — `<all_urls>` would also grant file:// and ftp://
    // access we never use. Narrowing this shrinks the permission warning shown at
    // install time and limits blast radius if the extension is ever compromised.
    host_permissions: ["http://*/*", "https://*/*"],
    minimum_chrome_version: "114",
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
    commands: {
      "save-boost": {
        suggested_key: { default: "Ctrl+Shift+B", mac: "Command+Shift+B" },
        description: "Save the current Arc Boost site to memory",
      },
    },
    action: { default_title: "LedgerMem" },
  },
  srcDir: ".",
});
