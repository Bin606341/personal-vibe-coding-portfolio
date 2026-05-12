# Inline Media Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the black external media blocks on Training, Tactics, and Classic Winners with local inline players that play inside each card and expand into a modal.

**Architecture:** Store a few small basketball clips and poster frames under `public/media`, extend the shared media data model with local source fields, then reuse one card component that renders an inline player plus an expand modal. Keep the current page layouts and filters intact so the change is isolated to media presentation and the data plumbing behind it.

**Tech Stack:** React 18, TypeScript, Vite, HTML5 video, CSS, Vitest, Playwright.

---

### Task 1: Add local media assets and manifest

**Files:**
- Create: `public/media/manifest.json`
- Create: `public/media/dribble.webm`
- Create: `public/media/dribble.jpg`
- Create: `public/media/shot.webm`
- Create: `public/media/shot.jpg`
- Create: `public/media/teamwork.webm`
- Create: `public/media/teamwork.jpg`
- Modify: `src/data/nba.ts`

- [ ] **Step 1: Download the clips and posters**

Use these source pages and direct media URLs:

- Dribbling:
  - Source page: `https://commons.wikimedia.org/wiki/File:Basketball-Basic_Types_of_Dribbling.webm`
  - Video: `https://upload.wikimedia.org/wikipedia/commons/transcoded/3/35/Basketball-Basic_Types_of_Dribbling.webm/Basketball-Basic_Types_of_Dribbling.webm.360p.webm?download=`
  - Poster: `https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Basketball-Basic_Types_of_Dribbling.webm/960px--Basketball-Basic_Types_of_Dribbling.webm.jpg`

- Shot:
  - Source page: `https://commons.wikimedia.org/wiki/File:Basketball-Shot-Types-and-Shot-Success-in-Different-Levels-of-Competitive-Basketball-pone.0128885.s001.ogv`
  - Video: `https://upload.wikimedia.org/wikipedia/commons/transcoded/2/2e/Basketball-Shot-Types-and-Shot-Success-in-Different-Levels-of-Competitive-Basketball-pone.0128885.s001.ogv/Basketball-Shot-Types-and-Shot-Success-in-Different-Levels-of-Competitive-Basketball-pone.0128885.s001.ogv.360p.webm?download=`
  - Poster: `https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Basketball-Shot-Types-and-Shot-Success-in-Different-Levels-of-Competitive-Basketball-pone.0128885.s001.ogv/960px--Basketball-Shot-Types-and-Shot-Success-in-Different-Levels-of-Competitive-Basketball-pone.0128885.s001.ogv.jpg`

- Teamwork:
  - Source page: `https://commons.wikimedia.org/wiki/File:VBC-Cajasol(5).webm`
  - Video: `https://upload.wikimedia.org/wikipedia/commons/transcoded/c/cf/VBC-Cajasol%285%29.webm/VBC-Cajasol%285%29.webm.360p.webm?download=`
  - Poster: `https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/VBC-Cajasol%285%29.webm/960px--VBC-Cajasol%285%29.webm.jpg`

Write `public/media/manifest.json` with each asset’s `file`, `sourcePage`, `license`, and a short provenance note.

- [ ] **Step 2: Extend the shared media model**

In `src/data/nba.ts`, keep `url` as the provenance/source page and add `localUrl`, `posterUrl`, and `mediaType` to `VideoResource` so the pages can render local playback without changing the surrounding data shape.

- [ ] **Step 3: Map the three content areas to local assets**

Assign the local files across:

- Training drills by position
- Tactic cards by category
- Classic winner moments by player

Use the three local clips in rotation so every media block has a visible player instead of a blank embed.

- [ ] **Step 4: Verify the manifest and data compile**

Run:

```powershell
npm test -- src/data/nba.test.ts
```

Expected: PASS after the data model and asset mappings are updated.

### Task 2: Replace the media card with inline playback and modal expand

**Files:**
- Modify: `src/components/VideoResourceCard.tsx`
- Modify: `src/styles.css`
- Create: `src/components/VideoResourceCard.test.tsx`

- [ ] **Step 1: Write the failing media interaction test**

Add a test that renders a media card with a local video resource and expects:

- a visible inline `<video>` element
- a play button that calls `HTMLMediaElement.play()`
- an expand button that opens a modal
- a close button that dismisses the modal

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```powershell
npm test -- src/components/VideoResourceCard.test.tsx
```

Expected: FAIL until the inline player and modal exist.

- [ ] **Step 3: Implement the inline player and modal**

Render the media card with:

- an inline `video` element for local clips
- `poster` support so the card shows content before playback
- a play/pause button using icon-only controls
- an expand button that opens a centered modal
- modal close via button, overlay click, or `Esc`

- [ ] **Step 4: Run the focused test and confirm it passes**

Run:

```powershell
npm test -- src/components/VideoResourceCard.test.tsx
```

Expected: PASS.

### Task 3: Update the three pages and browser verification

**Files:**
- Modify: `src/pages/TrainingPage.tsx`
- Modify: `src/pages/TacticsPage.tsx`
- Modify: `src/pages/ClutchPage.tsx`
- Modify: `src/components/App.test.tsx`
- Modify: `tests/home.spec.ts`

- [ ] **Step 1: Keep the page layouts but switch them to the new media card**

Replace the old embed/link behavior with the inline media card on all three pages. Keep the tabs, filters, and page copy unchanged.

- [ ] **Step 2: Update route smoke coverage**

Adjust the route tests to confirm the three pages still render their headings and at least one inline media card each.

- [ ] **Step 3: Update Playwright checks**

Verify in Chromium that:

- the three pages render visible media blocks
- the expand button opens and closes the modal
- playback stays on the current page

- [ ] **Step 4: Run the full verification set**

Run:

```powershell
npm test
npm run build
npm run test:e2e
```

Expected: all pass with the new local media experience.

