# Home Chibi Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the homepage Three.js player into a chibi basketball character inspired by the provided reference image.

**Architecture:** Keep the existing procedural Three.js scene and movement/shooting animation. Add tested design tokens in `HomeScene.tsx`, then rebuild `createPlayer()` with chibi proportions, facial details, hair, beard, white number 11 uniform, blue-black trims, and black shoes.

**Tech Stack:** React, Vite, TypeScript, Three.js, Vitest, Playwright.

---

### Task 1: Lock Design Intent

**Files:**
- Test: `src/components/HomeScene.player.test.ts`
- Modify: `src/components/HomeScene.tsx`

- [ ] Add a Vitest test that imports `HOME_PLAYER_DESIGN` and verifies jersey number `11`, white primary uniform, blue/black accents, dark skin, beard, short dread hair, sleepy eyes, basketball, and black shoes.
- [ ] Run `npm test -- HomeScene.player.test.ts` and confirm it fails before production code exports the design token.

### Task 2: Rebuild Procedural Character

**Files:**
- Modify: `src/components/HomeScene.tsx`

- [ ] Replace the old slim player parts with a larger head, smaller body, and stronger silhouette.
- [ ] Add face planes/spheres for eyes, eyelids, brows, nose, mouth, beard, ears, and hair clusters.
- [ ] Replace the gradient 23 jersey texture with a white 11 jersey texture using blue-black trims.
- [ ] Keep `player.userData.leftArm`, `rightArm`, `leftLeg`, and `rightLeg` intact so existing animation still works.

### Task 3: Verify

**Files:**
- No additional code files.

- [ ] Run `npm test -- HomeScene.player.test.ts`.
- [ ] Run `npm run build`.
- [ ] Run Playwright homepage rendering check or a focused screenshot check to confirm the canvas is nonblank and the character is visible.
