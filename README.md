# Basit Bashir — React Portfolio

A deployment-ready Vite + React portfolio centered on `src/App.jsx`.

## Experience

- Responsive editorial layout with deliberate whitespace
- Supplied illustrated portrait integrated into the hero and profile
- High-resolution 1202×1308 portrait restoration for crisp retina rendering
- Continuously rotating pill-orbital hero system with RAG, ML, CARE and DATA elements
- Pointer-responsive 3D depth with touch and reduced-motion fallbacks
- Sticky project stack that creates a snappy layered scroll sequence
- Interactive hanging lamp with a bead chain, pull feedback and theme flicker
- Theme-aware animated ink-ridge canvas background inspired by sumi-e landscapes
- Responsive liquid-glass dynamic-island navigation
- Persisted theme preference with first-visit system detection
- Accessible navigation, semantic sections and keyboard-visible focus
- Original portfolio facts and links preserved without fabricated claims

## Local development

```bash
npm install
npm run dev
```

Vite will print the local preview URL.

## Production build

```bash
npm run build
npm run preview
```

The production files are written to `dist/`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Vercel detects Vite automatically. The included `vercel.json` explicitly configures `npm run build` and the `dist` output directory.
4. Deploy.

No environment variables are required.

## Structure

```text
basit-bashir-portfolio/
├── public/
│   ├── basit-portrait.png
│   └── favicon.svg
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

## Notes

- The contact area uses the supplied GitHub and LinkedIn URLs because the source portfolio did not include a public email address or form endpoint.
- Google Fonts have system-font fallbacks, so the site stays usable if the font request is blocked.
