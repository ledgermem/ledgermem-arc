// Best-effort detection of the current Arc Space.
// Arc exposes group/space info via its tab.groupId; we map it to a label
// that the user has previously associated with that group via popup settings.

export interface SpaceMap {
  [groupId: string]: string;
}

export async function loadSpaceMap(): Promise<SpaceMap> {
  const stored = (await chrome.storage.sync.get(["spaceMap"])) as {
    spaceMap?: SpaceMap;
  };
  return stored.spaceMap ?? {};
}

export async function setSpaceLabel(groupId: string, label: string): Promise<void> {
  const map = await loadSpaceMap();
  await chrome.storage.sync.set({ spaceMap: { ...map, [groupId]: label } });
}

export async function spaceForTab(
  tab: Pick<chrome.tabs.Tab, "groupId">,
): Promise<string | undefined> {
  if (typeof tab.groupId !== "number" || tab.groupId === -1) return undefined;
  const map = await loadSpaceMap();
  return map[String(tab.groupId)];
}
