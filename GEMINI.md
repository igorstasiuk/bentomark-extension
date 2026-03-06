# Project Context: BentoMark (Chrome Extension)

## Project Overview

**BentoMark** is a modern, highly visual Google Chrome Extension built on Manifest V3. Its primary function is to replace the browser's default "New Tab" page with a customizable bookmark manager and moodboard.

**Key Features:**
- **Full-Screen Visual Layout:** A responsive flex/masonry grid for bookmark cards that utilizes the entire viewport.
- **Smart Grouping & Nesting:** Groups act as visual folders. You can nest groups within other groups (folders inside folders) to any depth. Users can click to navigate inside them, with a history-based breadcrumb system for navigating back up the tree.
- **Advanced Drag & Drop:**
  - Free sorting on the root board and inside nested groups using `vuedraggable`.
  - Nested dropping: Dragging a bookmark or a group into the center of a Group card moves it inside.
  - Upward extraction: Dragging an item onto the "Back" breadcrumb button extracts it from the current folder to the parent folder (or to the main screen if at the root level).
  - External dropping: Dragging a URL from another tab into the extension opens the "Add Bookmark" modal pre-filled.
- **Search & Filtering:** Real-time global search (by title/URL) and quick filters to show only groups or only bookmarks.
- **Aesthetic Customization:** 
  - Themes: Light / Dark / System.
  - Design Styles: Solid (default) or Liquid Glass (macOS-style frosted glass with backdrop blur).
  - Backgrounds: Users can upload custom images for the main background, group covers, and bookmark covers.
- **Chrome Integration:** One-click import of existing native Chrome bookmarks, maintaining the exact hierarchical folder structure recursively.
- **Data Export/Import:** JSON backup functionality.

**Tech Stack:**
- **Core Framework:** Vue 3 (Composition API, `<script setup>`)
- **State Management:** Pinia
- **Styling:** TailwindCSS (v4) with custom `@custom-variant glass` directives.
- **Drag & Drop:** `vuedraggable` (v4 for Vue 3 support).
- **Build Tool:** Vite with `@crxjs/vite-plugin` for Chrome Extension bundling.
- **Language:** TypeScript

**Architecture & Storage:**
The application utilizes a tiered storage strategy to handle Chrome's limitations:
1.  **`chrome.storage.sync`**: Holds the main application state (JSON structure of groups, bookmark URLs, titles, layout structure, and UI settings). This allows cross-browser syncing via the user's Google account. Limit is ~100KB.
2.  **`chrome.storage.local`**: Acts as a fallback for the main state if the `sync` storage quota is exceeded.
3.  **IndexedDB (via `localforage`)**: Dedicated to heavy media storage. Base64/Blob representations of custom backgrounds and cover images are saved here to prevent hitting standard Chrome API storage quotas. (Note: Images do not sync across devices).

## Building and Running

The project relies on Node.js and NPM for dependency management and execution.

### Installation
```bash
npm install
```

### Development
Starts the Vite dev server with Hot Module Replacement (HMR).
```bash
npm run dev
```

### Production Build
Compiles TypeScript and bundles the extension into the `dist/` folder.
```bash
npm run build
```

### Loading into Chrome
1. Run `npm run build`.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **"Developer mode"** in the top right corner.
4. Click **"Load unpacked"** and select the `dist` directory.

## Development Conventions

- **Component Structure:** The project strictly uses Vue 3 Single File Components (SFCs) adopting the `<script setup lang="ts">` pattern.
- **Styling:** Utility-first styling using TailwindCSS directly within component `<template>` classes. 
- **Type Safety:** TypeScript is used across the application. Custom Chrome API types are provided by `@types/chrome`.
- **State Handling:** Application state is cleanly separated into Pinia stores (`src/stores/settings.ts` and `src/stores/bookmarks.ts`).
- **Drag & Drop Interactions:** Managed carefully using a hybrid approach—`vuedraggable` handles standard sorting, while nested groups use internal dropzones combined with a history stack in the state to allow infinite nesting and level-by-level extraction upwards.
