# LOOPFORGE

LOOPFORGE is a local-first visual instrument for making mathematically seamless 9:16 loops. Its 13OS interface currently ships with three deterministic generators:

- **Particle Orbit** — layered, phase-locked orbital swarms
- **Geometric Tunnel** — depth-wrapped luminous wireframes
- **Pendulum Array** — harmonic kinetic instruments

Every advertised loop is a pure function of project settings and normalized phase. Export frames use `index / frameCount` for indices `0…frameCount - 1`, so the terminal phase is never duplicated.

## Run locally

Requires Node.js 20 or newer.

```powershell
npm install
npm run dev
```

## Verify and build

```powershell
npm test
npm run build
```

The static build is written to `dist/`. Vite uses `base: './'`, allowing the complete directory to be mounted at `https://13thoni.com/LOOPFORGE/` without rewriting asset paths.

## Features

- Fixed 9:16 live preview and 1080×1920 PNG snapshots
- Duration, frame rate, seed, density, energy, and palette controls
- Play, pause, phase scrub, and reset transport
- Validated JSON project import/export
- Namespaced local persistence at `13os:loopforge:project:v1`
- No accounts, uploads, telemetry, or runtime network dependency

Video/PNG-sequence export, two additional generator families, and deeper per-generator parameters are planned follow-up milestones.
