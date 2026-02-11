# Architecture Boundary

## Source of Truth

- Main process source of truth is root-level files:
  - `main.js`
  - `preload.js`
  - `server-manager.js`
  - `server-runner.js`
  - `tray-manager.js`
  - `logger.js`
- Renderer source of truth is `src/` (React + Vite).

## Entrypoint Rules

- Electron app entrypoint is defined by `package.json`:
  - `"main": "main.js"`
- Packaged app files are defined by `package.json > build.files`.
- `main.js` must load UI from `dist-ui/index.html`.

## Legacy Paths Policy

- `src/main/` is deprecated and must not be reintroduced.
- Root `renderer.js` (legacy DOM renderer) is deprecated and must not be reintroduced.

## Pre-Release Check

Run:

```powershell
npm run verify:entrypoints
```

The check enforces:

- Correct Electron entrypoint value.
- Required main-process files present in `build.files`.
- Deprecated paths absent from repository.
