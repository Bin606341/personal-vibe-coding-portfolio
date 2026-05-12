# Inline Media Playback for Content Pages

## Goal

Turn the media blocks in Training, Tactics, and Classic Winners into embedded inline players backed by local assets. The default view should stay inside each card/module, and a separate expand control should open a larger modal player. No media action should navigate users away from the page.

## Current State

- The three content pages rely on the existing `VideoResourceCard` pattern.
- When a resource has no usable embed, the card becomes a link-style placeholder or black frame.
- Clicking media often leaves the page flow and does not feel like a portfolio showcase.

## Proposed Behavior

- Each card renders a compact inline player inside the module.
- The player uses a local `mp4`/`webm` file from `public/media`.
- A visible expand icon opens a centered modal with the same media at larger size.
- The modal can be closed by the close button, overlay click, or `Esc`.
- If a clip is not suitable as video, the same slot can use a looping `gif` fallback.

## Approach

1. Keep the existing content model, but extend each media entry with a local source path instead of relying on external embeds.
2. Replace `VideoResourceCard` with a reusable inline media component that can render video or GIF.
3. Add a shared modal overlay component for enlarged playback.
4. Reuse the same component on Training, Tactics, and Classic Winners so all three pages behave consistently.

Recommended choice: local video first, GIF fallback second.

## Asset Plan

- Store assets under `public/media/`.
- Keep a small source manifest alongside the assets with the original URL and a short license/provenance note for each file.
- Use short, loop-friendly clips for:
  - Training drills
  - Tactics demos
  - Classic clutch moments
- Keep each item’s label, source note, and local file path in the data layer.

## Component Changes

- Replace the old `VideoResourceCard` with an inline media card.
- Add native video controls plus a dedicated expand button inside the card chrome.
- Add one modal component shared by all three pages.
- Keep the layout responsive so the player never overflows on mobile.

## Fallbacks

- If a media file is unavailable, show a safe poster frame or GIF instead of a black box.
- If both video and GIF fail, show a labeled placeholder explaining that the asset is missing locally.
- The page still stays usable even when one asset fails.

## Testing

- Add/adjust unit tests for the new media card behavior.
- Update route smoke tests to confirm the three pages still render headings and media blocks.
- Add Playwright coverage for:
  - inline media visible on the three sections
  - expand button opens the modal
  - close button dismisses the modal
  - no navigation occurs when media is played

## Non-Goals

- No backend media service.
- No page navigation for playback.
- No redesign of the rest of the site shell.
- No live streaming or transcoding pipeline.
