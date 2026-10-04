# Character Paper — Windows desktop build

Version 1.0.2. Made by ANVA. The v0.9 review archive remains a separate development fallback.

## Build

Install the pinned development dependencies with npm ci, then run npm run dist. The installer is built with Electron and electron-builder's NSIS target for x64 Windows. Generate the icon using build-icon.ps1 if needed. electronDist points at the locally installed Electron runtime.

## Packaged content

The file allowlist includes only the renderer code, core/vault/server modules, static artwork, icon, main process and package metadata. It excludes all profiles, test fixtures, library JSON and backups. The source archive likewise excludes node_modules and save data.

## Desktop behaviour

- A private loopback service starts automatically on an available port within the app process. No external Node installation, browser launcher or separate console is needed.
- Saves go into the profiles folder inside Electron's userData location for Character Paper, separate from installed files. There is no automatic import of previous review libraries. Users can explicitly restore their own backup.
- A single-instance lock avoids accidentally running two desktop copies. Closing autosaves pending changes; manual mode offers Save, Discard and Keep writing. Save failures keep the window open.
- The renderer is sandboxed, context isolated and has no Node integration. Only the approved ANVA website, feedback form, email and optional coffee link open externally. Navigation and permissions are restricted.
- The public appearance preference are persisted across normal closes even though the local port changes.
- The installer leaves application data intact during uninstall. The release is unsigned until an ANVA signing certificate is supplied.

## Checks

The 23 core/vault/export/recovery/optional-protection/formatting/migration/example/Android-compatibility tests pass against the desktop copies. The bundled executable was launched with an isolated test-data folder and its welcome screen verified. The app archive was inspected to confirm it includes no profiles, backups or test files. This is not an independent security audit.

For an isolated startup check, set PAPER_DESKTOP_TEST_DIR to a dedicated scratch folder and PAPER_DESKTOP_SMOKE=1 before launching the executable. It writes a startup report and exits. Never point test storage at real profiles.

References: https://www.electronjs.org/docs/latest/tutorial/security and https://www.electron.build/nsis/

## Version 1.0.1

Password protection is optional and recommended, with a six-character minimum when enabled. Existing profiles remain protected. Unprotected records carry their local data key and are not confidential. Changing protection rotates the data key and preserves both save states and snapshots; existing backups keep their original protection.

The UI separates About Us and FAQ & Tips, consolidates backups in Settings, moves profile editing to the name/picture, uses icon theme/save controls, and adds Markdown formatting and editing shortcuts. The app always begins at the public welcome page.

## Version 1.0.2

Game context, editable original Example Profile with reset/delete/restore, searchable Help, finalized ANVA contact links and shared Android support. See the root release notes for migration, verification and signing status. Android build instructions are in the sibling character-paper-android/BUILDING.md. No profiles or signing keys belong in source or package archives.
