import { defineConfig } from "wxt";

export default defineConfig({
  modules: [],
  manifest: {
    name: "LedgerMem for Arc",
    description:
      "Capture Boosts, tidy tabs, and group memories by Arc Space.",
    version: "0.1.0",
    permissions: ["storage", "tabs", "activeTab", "scripting"],
    host_permissions: ["<all_urls>"],
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
