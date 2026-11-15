# SignBase PSL — Presentation Website

A responsive React + Vite landing page for the SignBase PSL final-year project.

## Features
- Dark, premium AI/accessibility hero section
- Procedural Three.js wireframe human animation
- 3D laptop display cycling through illustrative banking terms
- Problem, solution, workflow, product previews, architecture, research, impact and team sections
- Responsive layouts for desktop, tablet and mobile
- Reduced-motion styling support

## Run locally

1. Install Node.js (LTS).
2. Extract this project.
3. Open a terminal in the project folder.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

## Important notes
- The hero gesture is a procedural illustrative animation, not a trained PSL recognition model.
- The laptop recognition term is a synchronized visual demo cycling through sample terms.
- Replace or refine the sample terms so they exactly match the team's approved 47-sign vocabulary.
- The team names and supervisor details are based on the project information supplied in the conversation. Confirm spellings and roles before public deployment.
- The hero character is generated procedurally with Three.js. For a more anatomically accurate, signer-authentic animation, replace the procedural character with a rigged 3D human model and animation clips created in Blender or sourced with an appropriate license.
- No backend, database, login or ML inference service is connected to this presentation website.
