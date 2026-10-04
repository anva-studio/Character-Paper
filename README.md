# Character Paper

**A place for every character.**

Character Paper is a free, local-first character writing and organization app by **ANVA**. It provides a dedicated space for building characters, recording their stories, relationships, personalities, references, private notes, and other details without requiring an account or cloud service.

Character Paper is available for **Windows** and **Android**.

## Features

- Create and organize detailed character profiles
- Structured and freeform character writing
- Character relationships and connections
- Story and project organization
- Personality and character information sections
- Image galleries and references
- Private working notes
- Light and dark themes
- Example profile for exploring the app
- Local-first storage
- No account required
- Windows and Android support

## Privacy

Character Paper is designed as a local-first application.

Your character data is stored on your device rather than requiring an ANVA account or online service. Character Paper does not require you to sign in to use the app.

As with any locally stored data, keeping backups of important work is recommended.

## Repository Structure

The main Character Paper desktop project contains the Android source in its own subdirectory:

```text
Character-Paper/
├── app/
├── build/
├── scripts/
├── character-paper-android/
├── main.cjs
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

### Desktop

The desktop application is built with Electron.

Requirements:

- Node.js
- npm
- Windows x64 for the current packaged release

Install dependencies from the repository root:

```bash
npm install
```

Run Character Paper locally:

```bash
npm start
```

Build the Windows installer:

```bash
npm run dist
```

The Windows build uses Electron Builder and produces an NSIS installer.

### Android

The Android application source is located in:

```text
character-paper-android/
```

Android-specific source, resources, tests, packaging utilities, and the application manifest are maintained in this directory.

## Releases

Prebuilt Windows and Android packages are provided through Character Paper's official releases.

For most users, downloading a release is recommended instead of building the application from source.

## About ANVA

Character Paper is developed by **ANVA**, an independent software project focused on creating useful, accessible tools.

Website: https://anva-studio.github.io/

Email: Anvahq@gmail.com

Feedback: https://forms.gle/W7qtQRmqxgkZkLtS9

## License

Character Paper is currently distributed as proprietary source-available software unless otherwise stated.

The presence of source code in this repository does not grant permission to redistribute, modify, relicense, sell, or create derivative distributions of Character Paper.

See the `LICENSE` file for details.

---

**Character Paper 1.0.2**  
Made by ANVA.
