# Project Specification: BentoMark (New Tab Bookmark Manager)

## 1. Overview

**BentoMark** is a Chrome browser extension (Manifest V3) that replaces the default New Tab page. It serves as a highly visual, modern bookmark manager. The project combines aesthetics (similar to a Dribbble-style moodboard) with powerful organization tools: grouping, drag-and-drop, appearance customization, and lightning-fast search.

**Tech Stack:**

- **Core:** Vue 3 (Composition API, `<script setup>`)
- **Extension API:** Chrome Manifest V3
- **Bundler:** Vite (with `crxjs/vite-plugin`)
- **Styling:** TailwindCSS or SCSS
- **Drag & Drop:** `vuedraggable` (Sortable.js) or `@vueuse/core`

---

## 2. Visual Layout & UI Structure (Based on Reference)

The interface is designed to be clean, airy, and highly visual.

- **Top Navigation Bar:**
  - Left: Folder/Bookmark toggle icons.
  - Center: "BentoMark" logo and a prominent, rounded Search Bar.
  - Right: "+" (Add) button, Grid view toggle, and Menu icon.
- **Main Grid:**
  - A masonry or responsive flex-grid displaying cards with rounded corners.
  - Cards can have varying visual styles: solid color backgrounds, large icons, or full-cover images.
- **Background:** An abstract, customizable wallpaper (e.g., desert landscape with wavy overlays).

---

## 3. Core Features

### 3.1. Next-Generation Bookmark Groups

- **Entity:** Groups act as visual folders. They contain a title, an item counter (e.g., "4 bookmarks"), and the bookmarks themselves.
- **Covers:** Users can assign a custom cover image to any group card to make it visually distinct.

### 3.2. Drag & Drop Mechanics

- **Free Sorting:** Users can drag to rearrange bookmarks and group cards within the grid.
- **Quick Nesting:** Dragging a bookmark card and dropping it directly onto a group card instantly moves the bookmark into that group.
- **Extraction:** Bookmarks can be dragged out of groups and placed back onto the main dashboard.

### 3.3. Search Functionality

- **Global Search:** Accessible via the top search bar.
- **Deep Filtering:** Instantly filters links by title or URL. The search must "look inside" groups and pull up the required link in seconds, bypassing manual navigation.

### 3.4. Appearance Settings

- **Theme:** Light and Dark mode options.
- **Grid Density:** Adjustable number of columns to fit user preference and monitor size.
- **Backgrounds:** Options for a solid color, gradient, or uploading a custom background image.

### 3.5. Onboarding & Accessibility

- **Onboarding:** A quick interactive guide introducing hotkeys and Drag & Drop features on first launch.
- **Hotkeys:** Keyboard shortcuts for power users (e.g., `/` or `Cmd/Ctrl + F` to focus search).
- **Export/Import:** A robust feature to export the entire bookmark structure (JSON) and import it, allowing users to back up their setup manually.

---

## 4. Data Architecture & Storage Strategy

To ensure high performance and handle Chrome's storage limitations, the data is split across three distinct storage mechanisms.

### 4.1. The Reinstallation Requirement (Settings Recovery)

_Requirement: If a user uninstalls and later reinstalls the extension, their old settings must automatically carry over._

- **Implementation:** `chrome.storage.sync`
- **Details:** Because Chrome completely wipes local storage upon uninstallation, lightweight configurations (theme, column count, hotkey preferences) are saved to the user's Google account via `chrome.storage.sync`. When the extension is reinstalled, it fetches this object to restore the core UX preferences.

### 4.2. Main State (`chrome.storage.local`)

_Requirement: Store the structure locally for speed, without bloating the main object._

- **Implementation:** `chrome.storage.local` (Up to 5MB default limit)
- **Details:** Holds the JSON structure of groups, bookmark URLs, titles, and layout order. It stores _references_ (IDs) to images rather than the images themselves.

### 4.3. Heavy Media (IndexedDB)

_Requirement: Save group cover images and bookmark screenshots separately._

- **Implementation:** IndexedDB (via a wrapper like `localforage`)
- **Details:** Base64 strings or Blobs for custom backgrounds, group covers, and screenshots are saved here. This prevents `chrome.storage.local` from hitting its quota limits and keeps the main state object lightweight and fast to parse.

---

## 5. Development Phases

1. **Phase 1: Setup & UI Skeleton.** Init Vite + Vue 3 + Manifest V3. Build the top bar and responsive card grid.
2. **Phase 2: Storage Architecture.** Set up the Sync, Local, and IndexedDB layers for data separation.
3. **Phase 3: Core CRUD & Search.** Implement creating/editing bookmarks and the instant search filtering.
4. **Phase 4: Drag & Drop.** Integrate D&D for sorting and the complex logic of dropping items into groups.
5. **Phase 5: Customization.** Implement themes, column adjustments, and image uploads for covers/backgrounds.
6. **Phase 6: Export/Import & Polish.** Build the JSON export functionality and the onboarding tutorial.
