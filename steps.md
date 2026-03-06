# Development Roadmap: BentoMark Chrome Extension

This document outlines the step-by-step development process for the BentoMark extension.
**Instructions for AI Agent:** Do not write the entire application at once. Follow these phases sequentially. At the end of each phase, stop, perform the listed validations, check the terminal for build errors, and check the browser console for runtime errors before proceeding to the next phase.

## Phase 1: Project Setup & Extension Manifest

**Goal:** Initialize the Vue 3 project, configure Vite for Chrome Extension development (Manifest V3), and override the New Tab page.

- **Tasks:**
  1. Scaffold a Vue 3 project using Vite (`npm create vite@latest`).
  2. Install `@crxjs/vite-plugin` to handle Manifest V3 building.
  3. Configure `manifest.json` to override the `chrome_url_overrides.newtab` with `index.html`.
  4. Set up permissions in `manifest.json` (`storage`, `unlimitedStorage`).
  5. Install and configure TailwindCSS (or SCSS).
- **Validation / Checkpoint:**
  - [ ] Run `npm run dev`. Ensure the terminal shows no Vite build errors.
  - [ ] Open Chrome, go to `chrome://extensions`, enable "Developer mode", and load the unpacked extension.
  - [ ] Open a New Tab. Verify that the basic Vue template renders instead of the default Chrome New Tab.
  - [ ] Check the Chrome DevTools console for any CSP (Content Security Policy) or manifest errors.

## Phase 2: UI Skeleton & Static Layout

**Goal:** Build the visual foundation of the app without complex logic.

- **Tasks:**
  1. Create `App.vue` as the main wrapper (handling the background).
  2. Create `Header.vue` containing the logo, Search Bar placeholder, and settings buttons.
  3. Create `GridBoard.vue` (the main masonry/flex container).
  4. Create dummy `BookmarkCard.vue` and `GroupCard.vue` components with hardcoded static data to test styling.
- **Validation / Checkpoint:**
  - [ ] Check the UI in the browser. Does it look like the design reference?
  - [ ] Resize the window to ensure the grid is responsive.
  - [ ] Open Vue DevTools to ensure components are registered correctly.
  - [ ] Verify no warnings in the terminal/console regarding missing props or unused variables.

## Phase 3: Storage Architecture & State Management

**Goal:** Implement the 3-layer storage system (Sync, Local, IndexedDB) using Pinia.

- **Tasks:**
  1. Install `pinia` and `localforage` (for IndexedDB).
  2. Create a `useSettingsStore` that syncs with `chrome.storage.sync` (theme, columns).
  3. Create a `useBookmarksStore` that syncs the main JSON tree with `chrome.storage.local`.
  4. Create a utility service for `localforage` to save/load base64 images/Blobs (for covers and backgrounds).
- **Validation / Checkpoint:**
  - [ ] Manually change state in Vue DevTools.
  - [ ] Open Chrome DevTools -> Application tab.
  - [ ] Check `Local Storage` / `Extension Storage` to see if the JSON updates.
  - [ ] Check `IndexedDB` to ensure the database is created.
  - [ ] Refresh the New Tab. Does the state persist?

## Phase 4: Core CRUD (Create, Read, Update, Delete)

**Goal:** Allow users to add, edit, and remove bookmarks and groups.

- **Tasks:**
  1. Create a Modal component for adding/editing items.
  2. Implement "Add Bookmark" logic (saving title, URL).
  3. Implement "Create Group" logic (saving title, cover image).
  4. Wire up the image upload to convert files to Blobs/Base64 and save to IndexedDB, storing only the `imageId` in the local state.
  5. Implement Delete functionality for both.
- **Validation / Checkpoint:**
  - [ ] Add a new bookmark. Verify it appears in the grid.
  - [ ] Create a group and upload a cover image. Check IndexedDB to ensure the image saved correctly.
  - [ ] Delete an item. Ensure it is removed from both the Pinia state and Chrome Storage.
  - [ ] Check console for reactivity warnings (e.g., Vue warning about mutating props).

## Phase 5: Drag & Drop Mechanics

**Goal:** Implement free sorting and nesting (dropping into groups).

- **Tasks:**
  1. Install a D&D library (e.g., `vuedraggable` / Sortable.js).
  2. Wrap `GridBoard.vue` items in the draggable component to allow reordering the `layoutOrder` array.
  3. Implement drop zones on `GroupCard.vue`. If a bookmark is dropped on a group, remove its ID from the root layout and push it to the group's `childrenIds` array.
  4. Implement a way to view inside a group and drag items back out.
- **Validation / Checkpoint:**
  - [ ] Drag card A past card B. Does the state array update its order?
  - [ ] Drop a bookmark into a group. Does the group's counter increment?
  - [ ] Refresh the page. Is the new order and nested structure preserved?
  - [ ] Ensure there are no UI glitches or endless loops in the terminal during dragging.

## Phase 6: Search & Filtering

**Goal:** Implement instant search across the entire structure.

- **Tasks:**
  1. Bind the input in `SearchBar.vue` to a reactive `searchQuery` ref.
  2. Create a computed property in the Pinia store that returns filtered items based on the query.
  3. Ensure the filter checks root bookmarks AND bookmarks inside groups.
  4. If a nested bookmark matches, the UI should either show it flat in the grid or highlight the group.
- **Validation / Checkpoint:**
  - [ ] Type a known bookmark name in the search bar. The grid should instantly update.
  - [ ] Type a name of a bookmark hidden _inside_ a group. It must be found.
  - [ ] Clear the search bar. The grid should return to its original layout smoothly.

## Phase 7: Customization & Appearance

**Goal:** Apply settings from `chrome.storage.sync` to the UI.

- **Tasks:**
  1. Implement a Settings Modal.
  2. Add Dark/Light theme toggling (apply a `.dark` class to the `<html>` or `<body>` tag).
  3. Add a slider/input to change grid column count (bind this to inline CSS grid-template-columns or Tailwind classes).
  4. Add custom background image upload (save to IndexedDB, apply as CSS `background-image` on `App.vue`).
- **Validation / Checkpoint:**
  - [ ] Toggle dark mode. Refresh the page. Does it stay in dark mode? (Testing `storage.sync`).
  - [ ] Change columns from 4 to 6. Does the grid adjust immediately?
  - [ ] Upload a background image. Does it render correctly without throwing CORS or storage quota errors in the console?

## Phase 8: Data Export/Import & Polish

**Goal:** Finalize the extension for user safety and usability.

- **Tasks:**
  1. Add an "Export Data" button in settings. It should gather `storage.local` JSON and package it (optionally fetching IndexedDB images and zipping them, or just exporting a pure JSON tree).
  2. Add an "Import Data" button to parse the JSON and overwrite the Pinia state and Storage.
  3. Build a simple First-Launch Onboarding overlay.
- **Validation / Checkpoint:**
  - [ ] Click Export. Does a file download successfully?
  - [ ] Delete a few bookmarks manually. Click Import with the saved file. Does the grid restore correctly?
  - [ ] Do a final check of the terminal and Chrome Extension errors tab. It must be completely clean.
