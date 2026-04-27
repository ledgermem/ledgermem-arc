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
  const stored = (await chrome.storage.sync.get([
    "apiKey",
    "workspaceId",
  ])) as Partial<MemoryCreds>;
  if (!stored.apiKey || !stored.workspaceId) return null;
  return { apiKey: stored.apiKey, workspaceId: stored.workspaceId };
}

export async function saveCreds(creds: MemoryCreds): Promise<void> {
  await chrome.storage.sync.set(creds);
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
