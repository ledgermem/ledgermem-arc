# @ledgermem/arc

LedgerMem extension for the [Arc browser](https://arc.net). Built on Manifest V3 via [wxt](https://wxt.dev).

## Features

- **Boost integration**: hotkey (`Cmd+Shift+B` / `Ctrl+Shift+B`) saves the currently-active Boost site, including its visible text, to LedgerMem.
- **Tidy tab capture**: one click in the popup ingests every tab in the current window as a memory.
- **Spaces sync**: tabs are tagged with their Arc Space label so memories are grouped by context.

## Develop

```bash
npm install
npm run dev          # builds + opens a chromium with the extension loaded
npm run build        # production MV3 build → .output/chrome-mv3
```

In Arc: `arc://extensions` → Developer mode → Load unpacked → point at `.output/chrome-mv3`.

## Setup

Open the extension popup → Settings, paste your LedgerMem API key + workspace ID. Both are persisted in `chrome.storage.sync`.

## Storage keys

| Key | Description |
| --- | --- |
| `apiKey` | LedgerMem API key |
| `workspaceId` | LedgerMem workspace ID |
| `spaceMap` | `{ chromeGroupId: spaceLabel }` mapping for Spaces sync |

## Memory metadata

- `source: "arc-boost" | "arc-tab" | "arc-popup"`
- `url`
- `title`
- `capturedAt`
- `spaceName`

## License

MIT
