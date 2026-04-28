import { LedgerMem } from "@ledgermem/memory";

export interface MemoryCreds {
  apiKey: string;
  workspaceId: string;
}

export interface CapturedPage {
  url: string;
  title: string;
  text: string;
  capturedAt: string;
  spaceName?: string;
  source: "arc-boost" | "arc-tab" | "arc-popup";
}

export async function loadCreds(): Promise<MemoryCreds | null> {
  // Read from local storage first; one-time migrate any legacy values from sync storage,
  // which is replicated to Google's servers in plaintext and is a poor place for API keys.
  const local = (await chrome.storage.local.get([
    "apiKey",
    "workspaceId",
  ])) as Partial<MemoryCreds>;
  if (local.apiKey && local.workspaceId) {
    return { apiKey: local.apiKey, workspaceId: local.workspaceId };
  }
  const synced = (await chrome.storage.sync.get([
    "apiKey",
    "workspaceId",
  ])) as Partial<MemoryCreds>;
  if (synced.apiKey && synced.workspaceId) {
    await chrome.storage.local.set({
      apiKey: synced.apiKey,
      workspaceId: synced.workspaceId,
    });
    await chrome.storage.sync.remove(["apiKey", "workspaceId"]);
    return { apiKey: synced.apiKey, workspaceId: synced.workspaceId };
  }
  return null;
}

export async function saveCreds(creds: MemoryCreds): Promise<void> {
  await chrome.storage.local.set(creds);
  // Make sure no stale plaintext copies sit in sync storage.
  await chrome.storage.sync.remove(["apiKey", "workspaceId"]);
}

export async function ingestPage(page: CapturedPage): Promise<void> {
  const creds = await loadCreds();
  if (!creds) {
    throw new Error(
      "LedgerMem credentials not configured. Open the LedgerMem popup → Settings.",
    );
  }
  const memory = new LedgerMem(creds);
  const content = `${page.title}\n\n${page.url}\n\n${page.text}`.trim();
  await memory.add(content, {
    metadata: {
      source: page.source,
      url: page.url,
      title: page.title,
      capturedAt: page.capturedAt,
      spaceName: page.spaceName ?? "",
    },
  });
}
