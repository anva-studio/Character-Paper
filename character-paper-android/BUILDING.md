# Character Paper Android 1.0.2

This is a native Android Activity hosting the shared local Character Paper UI/core. It does not use a network server or require internet permission. Application ID is `studio.anva.characterpaper`, version code 102, minimum API 26, target API 36. Existing desktop sources are reused from the sibling `character-paper-desktop` directory.

## Prerequisites

Windows, Node (tested 24.19), JDK 21 and official Android SDK 36/build tools 36.0.0. Run `npm ci` in the sibling desktop folder for the pinned esbuild/yauzl/yazl development tools. Download Google bundletool 1.18.3 from its official release.

By default `build.ps1` expects `../android-tools` containing:

```text
platforms/android-36/android.jar
build-tools/android-16/aapt2.exe
build-tools/android-16/zipalign.exe
build-tools/android-16/lib/d8.jar
build-tools/android-16/lib/apksigner.jar
platform-tools/adb.exe
bundletool-all-1.18.3.jar
```

`android-16` is the extracted directory name of Google's Windows build-tools 36 archive, not the SDK version. You can copy installed 36.0.0 tools into that directory, or supply a separate `-SdkTools` directory with this structure. SDK binaries are excluded from the source archive. `work/download-android.cjs` downloads the pinned official Google ZIPs; expand the archives into the structure above. Bundletool must be downloaded separately from `https://github.com/google/bundletool/releases/tag/1.18.3`.

## Build

```powershell
./work/character-paper-android/build.ps1 -JavaHome 'C:/Program Files/Java/jdk-21'
```

The script copies shared assets, targets Chrome 80-compatible JavaScript syntax, compiles resources/Java/dex, normalizes Windows ZIP path separators, aligns/signs a local-test APK, and builds/validates an unsigned AAB if bundletool is available. APK and AAB are emitted under `outputs/Character-Paper-Android`. No dependencies, SDK files, personal profiles or test provider are packaged in the production app.

The APK uses a standard generated debug key for direct testing. The key stays outside the source archive in the supplied tooling directory. This is not a production signing configuration. Supply a stable ANVA release key when preparing store distribution; do not invent a release identity. The AAB remains unsigned. Windows packaging is independent.

## Tests

Start an isolated emulator with current Android System WebView. Set `ANDROID_USER_HOME` to a writable local SDK working folder if your environment requires it, then run:

```powershell
./work/character-paper-android/test.ps1 -Emulator emulator-5556
```

The instrumentation APK is separate from the app. It has a test-only exported content provider and checks file import using a real test gesture. It also checks export, persistence, sample reset, contexts, Notes privacy, rotation, Back and pause autosaving. It uses app/test scratch files; never point tests at personal storage. The test script fails when instrumentation does not report PASS. Final checks passed on Android 11/API 30 and Android 16/API 36 emulators.

Native profiles live in the app's private files directory with atomic replace after file synchronization. Portable backups use Android's document picker. Automatic OS backup is disabled; uninstall may erase private profiles. Recovery keys and full exports remain the user's portable recovery route.
