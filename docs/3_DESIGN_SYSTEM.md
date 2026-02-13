# Sonaraura UI/UX Design System (v3.6)
**Reference:** Sonaraura UI:UX Detaylı Tasarım Dokümantasyonu

## 1. Design System Foundation

### 1.1 Brand Atmosphere
**Style:** Clean Modern Professional.
**Inspiration:** Ease of Epidemic Sound + Modern typography of Artlist.
**Mood:** Trustworthy, technological yet artistic. Not underground.

### 1.2 Color Palette
**Primary:** `#F97316` (Vivid Orange) OR `#2563EB` (Electric Blue). *Decision pending.*
**Secondary (Frequency):**
*   **440Hz:** Purple-500 (`#8b5cf6`)
*   **432Hz:** Emerald-500 (`#10b981`)
*   **528Hz:** Sky-500 (`#0ea5e9`)
**Backgrounds:**
*   **Creator (Dark):** `#0F172A` (Slate 900) - Deep navy-grey.
*   **Admin/Venue (Light):** `#F8FAFC` (Slate 50) + White.
**Feedback:**
*   **Success:** Emerald-500
*   **Error:** Red-500
*   **Warning:** Amber-500

### 1.3 Typography
**Font Family:** Sans-Serif (`Inter` or `DM Sans`).
**Characteristics:** High readability, clean lines. `Bold` + `Tight Tracking` for headings.

## 2. Core UI Components

### 2.1 The Player
**Type:** Interactive Waveform.
**Position:** Sticky Footer.
**Visuals:** Dynamic waveform based on amplitude. Played section bright, unplayed dim.
**Features:** Scrubbing, Volume, Skip (Smart Skip reasons), Frequency Toggle (Crossfade).

### 2.2 Discovery & Filtering
**Layout:** Faceted Search (Sidebar on Desktop, Bottom Sheet on Mobile).
**Components:**
*   **Chips:** Mood/Genre selection.
*   **Range Sliders:** BPM, Duration.
*   **Visual Query Builder:** Logical grouping of filters (AND/OR/NOT).

### 2.3 Venue Schedule
**Visual:** Weekly Grid (Outlook style but simplified).
**Interaction:** Drag & drop blocks.
**Blocks:** "Morning Jazz", "Lunch Pop" colored blocks.

### 2.4 Creator Library
**Views:** Grid (Visual), List (Metadata), Compact.
**Bulk Actions:** Download, License, Add to Collection.

## 3. Admin & Factory UX
**Philosophy:** High Density, Keyboard-First.
**Queues:** Kanban or list view for tracks in QC.
**QC Station:**
*   **Shortcuts:** Space (Play), A (Approve), R (Reject), S (Skip).
*   **Visuals:** Waveform + Spectrogram overlay.
*   **Speed:** SPA transitions, no reloads.

## 4. Mobile Responsiveness
**Breakpoints:** Mobile (<768px), Tablet (<1024px), Desktop (>1024px).
**Mobile Nav:** Bottom Tab Bar (Player, Search, Library, Profile).
**Gestures:** Swipe on player to change tracks.

## 5. Animation & Micro-interactions
**Guidelines:** 60fps, GPU accelerated.
**Transitions:** Fade-in, Slide-in. No harsh cuts.
**Loaders:** Skeletons for content, circular spinners for actions.
**Audio:** Visualizers (Waveform, Bars, Particles) react to audio data.
