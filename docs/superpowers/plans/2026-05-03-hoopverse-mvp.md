# HoopVerse MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable MVP for the HoopVerse basketball website with a 3D interactive home scene and five complete content sections.

**Architecture:** Use a Vite React app with focused modules for data, route views, 3D home logic, shared UI, and tests. Static TypeScript data powers the MVP so the product is usable without a backend, while the file structure leaves room for later API or CMS integration.

**Tech Stack:** React, TypeScript, Vite, Three.js, React Router, Vitest, Testing Library, Playwright, CSS modules/global CSS.

---

## File Structure

- `package.json`: scripts and dependencies.
- `index.html`: Vite app shell.
- `src/main.tsx`: React entry point.
- `src/App.tsx`: route and layout composition.
- `src/styles.css`: global responsive styling and visual system.
- `src/data/nba.ts`: teams, players, legends, tutorials, tactics, and classic winners.
- `src/utils/homeLogic.ts`: testable pure logic for player movement, entry detection, and shot path generation.
- `src/components/Layout.tsx`: top navigation and shell.
- `src/components/HomeScene.tsx`: Three.js court, character, controls, and immersive entry navigation.
- `src/components/SectionHeader.tsx`: reusable page heading.
- `src/components/TacticDiagram.tsx`: simplified tactic court diagrams.
- `src/pages/PlayersPage.tsx`: team grid and roster detail.
- `src/pages/HallPage.tsx`: legend wall, filters, and detail panel.
- `src/pages/TrainingPage.tsx`: position tabs and action cards.
- `src/pages/TacticsPage.tsx`: tactic categories, cards, diagrams, and video placeholders.
- `src/pages/ClutchPage.tsx`: player-led classic winner browser.
- `src/test/setup.ts`: DOM test setup.
- `src/utils/homeLogic.test.ts`: movement, zone detection, and shot path tests.
- `src/data/nba.test.ts`: MVP data coverage tests.
- `src/components/App.test.tsx`: route smoke tests.
- `tests/home.spec.ts`: Playwright checks for visible 3D canvas and interactive navigation.

## Task 1: Scaffold Project and Test Harness

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Create Vite React TypeScript project files**

Create a Vite React project in the workspace root with scripts:

```json
{
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview --host 127.0.0.1"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```powershell
npm install
npm install three react-router-dom lucide-react
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom playwright
```

- [ ] **Step 3: Add Vitest setup**

Configure `vite.config.ts` test environment as `jsdom` and load `src/test/setup.ts`.

- [ ] **Step 4: Run initial test command**

Run:

```powershell
npm test
```

Expected: Vitest starts and reports no tests or exits cleanly after test files are added.

## Task 2: Add Testable Home Logic with TDD

**Files:**
- Create: `src/utils/homeLogic.test.ts`
- Create: `src/utils/homeLogic.ts`

- [ ] **Step 1: Write failing movement and zone tests**

Add tests that expect:

- Arrow movement updates `x` and `z`.
- Movement clamps to court bounds.
- Nearby entry detection returns the nearest entry inside its radius.
- Shot path contains multiple arc points and peaks above the start and end.

- [ ] **Step 2: Run test to verify RED**

Run:

```powershell
npm test -- src/utils/homeLogic.test.ts
```

Expected: FAIL because `homeLogic.ts` does not exist yet.

- [ ] **Step 3: Implement pure logic**

Create `homeLogic.ts` with `movePlayer`, `findNearbyEntry`, and `createShotPath`.

- [ ] **Step 4: Run test to verify GREEN**

Run:

```powershell
npm test -- src/utils/homeLogic.test.ts
```

Expected: PASS.

## Task 3: Add MVP Data with TDD

**Files:**
- Create: `src/data/nba.test.ts`
- Create: `src/data/nba.ts`

- [ ] **Step 1: Write failing data coverage tests**

Add tests that expect:

- Exactly 30 NBA teams.
- Each team has at least two MVP roster players.
- Five training positions exist and each has at least three drills.
- Hall of Fame, tactics, and clutch sections contain representative data.

- [ ] **Step 2: Run test to verify RED**

Run:

```powershell
npm test -- src/data/nba.test.ts
```

Expected: FAIL because data exports do not exist yet.

- [ ] **Step 3: Implement static data**

Create typed static data with real team names and MVP sample players. Mark statistics as curated MVP snapshots rather than live data.

- [ ] **Step 4: Run test to verify GREEN**

Run:

```powershell
npm test -- src/data/nba.test.ts
```

Expected: PASS.

## Task 4: Build App Shell and Route Smoke Tests

**Files:**
- Create: `src/components/App.test.tsx`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/components/Layout.tsx`
- Create: `src/components/SectionHeader.tsx`
- Create: `src/styles.css`

- [ ] **Step 1: Write failing route smoke tests**

Add tests that render the app in memory and expect navigation labels and page headings.

- [ ] **Step 2: Run route tests to verify RED**

Run:

```powershell
npm test -- src/components/App.test.tsx
```

Expected: FAIL because app components do not exist.

- [ ] **Step 3: Implement shell, layout, and routes**

Create routes for home, current players, Hall of Fame, training, tactics, and classic winners.

- [ ] **Step 4: Run route tests to verify GREEN**

Run:

```powershell
npm test -- src/components/App.test.tsx
```

Expected: PASS.

## Task 5: Implement 3D Home Scene

**Files:**
- Create: `src/components/HomeScene.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Add or extend tests for required home text and controls**

Verify the home route exposes control instructions and five entry labels.

- [ ] **Step 2: Run tests to verify RED if component is missing behavior**

Run:

```powershell
npm test -- src/components/App.test.tsx
```

- [ ] **Step 3: Implement Three.js scene**

Build a full-bleed canvas with:

- Court floor.
- Ocean plane.
- Sunset sky gradient.
- Hoop and backboard.
- Stylized player body.
- Basketball.
- Five glowing entry objects.
- Keyboard movement.
- `D` shot animation.
- `Enter` navigation when an entry is highlighted.

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```powershell
npm test -- src/components/App.test.tsx src/utils/homeLogic.test.ts
```

Expected: PASS.

## Task 6: Implement Five Content Pages

**Files:**
- Create: `src/pages/PlayersPage.tsx`
- Create: `src/pages/HallPage.tsx`
- Create: `src/pages/TrainingPage.tsx`
- Create: `src/pages/TacticsPage.tsx`
- Create: `src/pages/ClutchPage.tsx`
- Create: `src/components/TacticDiagram.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Extend route smoke tests**

Test that key section content appears:

- 30 team grid text.
- Legend filters.
- Position tabs.
- Tactic cards.
- Clutch player filters.

- [ ] **Step 2: Run tests to verify RED for missing pages**

Run:

```powershell
npm test -- src/components/App.test.tsx
```

- [ ] **Step 3: Implement pages using static data**

Build accessible controls, hover-ready cards, and responsive layouts.

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```powershell
npm test -- src/components/App.test.tsx src/data/nba.test.ts
```

Expected: PASS.

## Task 7: Browser Verification

**Files:**
- Create: `tests/home.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Add Playwright script and browser smoke test**

Add script:

```json
{
  "test:e2e": "playwright test"
}
```

Test:

- Home page loads.
- Canvas has non-zero size.
- Screenshot has non-white pixels in the canvas area.
- Navigation reaches each content route.

- [ ] **Step 2: Run build and browser tests**

Run:

```powershell
npm run build
npm run test:e2e
```

Expected: both commands pass.

## Task 8: Final Local Run

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add run instructions**

Document:

```powershell
npm install
npm run dev
npm test
npm run build
```

- [ ] **Step 2: Start dev server**

Run:

```powershell
npm run dev -- --port 5173
```

Expected: local URL is available at `http://127.0.0.1:5173/`.

## Self-Review Notes

- The plan covers the approved PRD: 3D home, movement, shooting, immersive entries, all five sections, static MVP data, tests, build, and browser verification.
- No backend or CMS is included because the approved MVP prioritizes a complete front-end product shape.
- This workspace is not currently a git repository, so commit steps are omitted unless git is initialized later.

