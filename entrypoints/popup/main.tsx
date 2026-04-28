import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { loadCreds, saveCreds, ingestPage } from "../../src/memory-client.js";
import { spaceForTab } from "../../src/space.js";

// URLs the scripting / messaging APIs cannot touch. Saving them via the popup
// would create memories whose URL is unrecoverable (chrome://, about:blank,
// data:) — silently skip instead of polluting the workspace with junk entries.
function isUnscriptableUrl(url: string): boolean {
  return (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("arc://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("data:") ||
    url.startsWith("view-source:") ||
    url.startsWith("https://chrome.google.com/webstore")
  );
}

function App(): JSX.Element {
  const [apiKey, setApiKey] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    void (async () => {
      const creds = await loadCreds();
      if (creds) {
        setApiKey(creds.apiKey);
        setWorkspaceId(creds.workspaceId);
      }
    })();
  }, []);

  async function handleSave(): Promise<void> {
    await saveCreds({ apiKey, workspaceId });
    setStatus("Saved.");
  }

  async function handleSavePage(): Promise<void> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url || !tab.title) {
      setStatus("No active tab.");
      return;
    }
    if (isUnscriptableUrl(tab.url)) {
      setStatus("Cannot capture this page (browser-internal URL).");
      return;
    }
    // Tag with the Arc Space the tab belongs to, the same way the
    // background save-boost listener does — without this the popup-captured
    // memory has an empty spaceName and is excluded from per-Space filters.
    const spaceName = await spaceForTab(tab);
    await ingestPage({
      source: "arc-popup",
      url: tab.url,
      title: tab.title,
      text: "",
      capturedAt: new Date().toISOString(),
      spaceName,
    });
    setStatus("Saved current page.");
  }

  async function handleTidy(): Promise<void> {
    const res = await chrome.runtime.sendMessage({ type: "tidy-tabs" });
    setStatus(`Captured ${res?.count ?? 0} tab(s).`);
  }

  return (
    <div style={{ width: 320, padding: 12, fontFamily: "system-ui" }}>
      <h2 style={{ margin: "0 0 8px" }}>LedgerMem for Arc</h2>
      <button onClick={handleSavePage} style={{ width: "100%", marginBottom: 6 }}>
        Save current page
      </button>
      <button onClick={handleTidy} style={{ width: "100%", marginBottom: 12 }}>
        Tidy tabs → memory
      </button>
      <details>
        <summary>Settings</summary>
        <label style={{ display: "block", marginTop: 8 }}>
          API key
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
        <label style={{ display: "block", marginTop: 8 }}>
          Workspace ID
          <input
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            style={{ width: "100%" }}
          />
        </label>
        <button onClick={handleSave} style={{ marginTop: 8 }}>
          Save
        </button>
      </details>
      <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>{status}</p>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<App />);
}
