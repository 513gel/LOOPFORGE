# EMERGENCY CHAT TRANSFER

## Objective

Build LOOPFORGE as a standalone public GitHub repository and local-first generative web application, then expose its tested static build through the 13th Oni website.

## Current milestone

Functional v0.1 foundation complete and locally verified. The static application is ready for parent review and later Website integration; it has not been deployed or copied into the Website repository.

## Project facts

- Local repository: `C:\Users\xxxye\Documents\Codex\2026-08-26\13th-oni-generative-tools\LOOPFORGE`
- Intended GitHub repository: `513gel/LOOPFORGE`
- Default branch: `main`
- Latest application milestone commit: `3a474ca` (`feat: deliver deterministic loopforge v0.1`)
- Working tree: clean after the handoff documentation commit.
- Hosting target: `https://13thoni.com/LOOPFORGE/` as a relative-path static bundle; storage namespace `13os:loopforge:*`. The Website task owns site routing, navigation, and copying the release into `public/LOOPFORGE/`.
- Product constraints: local-first, static-build compatible, deterministic seeds, mathematically verified seams, 9:16-first output, no uploads or tracking by default.

## Completed

- Vite + React + TypeScript static application with `base: './'`.
- 13OS-style responsive editor with fixed 9:16 Canvas 2D preview.
- Particle Orbit, Geometric Tunnel, and Pendulum Array generators.
- Seed, duration, FPS, density, energy, palette, play/pause, scrub, and reset controls.
- 1080×1920 PNG snapshot and validated project JSON import/export.
- Namespaced browser persistence at `13os:loopforge:project:v1`.
- Automated periodicity, determinism, and no-duplicate-terminal-frame tests.

## Verification

- `npm test`: 2 files, 7 tests passed.
- `npm run build`: production build passed with Vite 8.2.2.
- Browser smoke test at desktop width: all controls rendered, Geometric Tunnel switching worked, play/pause worked, and browser console had no errors or warnings.
- Responsive browser check at 390×844: the 9:16 canvas, generator selector, parameter grid, and export actions remained visible and usable.
- `dist/` is intentionally ignored and should be rebuilt before Website handoff.

## Next work

1. Parent agent reviews the v0.1 commit and coordinates the Website-owned copy into `public/LOOPFORGE/`.
2. Render-check the final Website-mounted build at desktop and mobile breakpoints.
3. Add WebM/PNG-sequence export without changing the normalized phase contract.
4. Add Mechanical Linkage and Tile Machine generator families.
5. Add pixel-level first/terminal seam regression coverage for all generators.

## Deployment

- GitHub release: `https://github.com/513gel/LOOPFORGE/releases/tag/v0.1.0`
- Live test route: `https://13thoni.com/LOOPFORGE/`
- Website integration and its 16-route suite passed on 2026-08-26; an external GET returned HTTP 200 with the expected title.
