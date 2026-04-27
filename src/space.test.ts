import { describe, it, expect, vi, beforeEach } from "vitest";

interface FakeStorage {
  store: Record<string, unknown>;
  get: (keys: string[]) => Promise<Record<string, unknown>>;
  set: (entries: Record<string, unknown>) => Promise<void>;
}

function makeStorage(): FakeStorage {
  const store: Record<string, unknown> = {};
  return {
    store,
    get: vi.fn(async (keys: string[]) => {
      const out: Record<string, unknown> = {};
      for (const k of keys) out[k] = store[k];
      return out;
    }),
    set: vi.fn(async (entries: Record<string, unknown>) => {
      Object.assign(store, entries);
    }),
  };
}

describe("space mapping (mocked chrome.storage)", () => {
  let storage: FakeStorage;

  beforeEach(() => {
    storage = makeStorage();
    (globalThis as unknown as { chrome: unknown }).chrome = {
      storage: { sync: storage },
    };
  });

  it("returns the mapped label for a tab with a known groupId", async () => {
    const { setSpaceLabel, spaceForTab } = await import("./space.js");
    await setSpaceLabel("17", "Work");
    const label = await spaceForTab({ groupId: 17 });
    expect(label).toBe("Work");
  });

  it("returns undefined for ungrouped tabs", async () => {
    const { spaceForTab } = await import("./space.js");
    expect(await spaceForTab({ groupId: -1 })).toBeUndefined();
  });
});
