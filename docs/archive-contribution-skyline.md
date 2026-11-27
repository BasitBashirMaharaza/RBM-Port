# Contribution skyline in the archive

The supplied `ContributionSkyline` implementation lives in
`src/components/ui/contribution-skyline.tsx`. This is the existing reusable UI
component directory. The canvas geometry, camera morph, weekly rise wave,
palettes, orbit gestures, keyboard navigation, tooltips, legend filtering and
statistics come from the supplied reference.

`ArchiveContributions.jsx` supplies the existing public GitHub snapshot from
`journal-contributions.json`. The snapshot date is displayed both on the lid and
in the expanded window. No generated demo activity is used for this portfolio.

A non-interactive instance renders the original canvas into the archive lid's
texture. It is hidden from the accessibility tree and cannot take focus. Its
canvas draw callback updates the Three.js texture without React updates per
frame. The chart is a real lid child, so the hinge, camera, depth occlusion and
scroll-driven closing all apply naturally. Clicking the visible lid chart opens
the complete interactive reference component; the same six-entry archive picker provides keyboard/touch selection, without
a standalone contribution button. Hovering lifts the contribution panel and
updates the picker details just like the project tiles. The window traps focus, makes the portfolio inert,
closes on Escape or the backdrop, and restores focus when dismissed.

The chart engine stops requesting animation frames when its morph, orbit and
color changes settle. Resize observers, theme observers, pointer listeners and
animation resources are released on unmount. The original reduced-motion
handling is retained. The lid texture and material are disposed with the scene.

## Existing project conventions

Vite already transpiles TypeScript/TSX, and React is already installed. The app
uses plain CSS rather than Tailwind or shadcn. The reference utility declarations
are translated into component-scoped `contribution-skyline.css`; no global reset
or new runtime dependency is introduced. Theme variables use the archive's
olive metal and paper colors. Other portfolio sections keep their existing styles.

For a future optional shadcn/Tailwind migration:

1. Add development tooling: `npm install -D typescript @types/react @types/react-dom`.
2. Add a TypeScript config with `jsx: react-jsx`, `moduleResolution: bundler`,
   `allowJs: true`, and an `@/*` alias targeting `src/*`. Add the matching Vite alias.
3. Install `tailwindcss` and `@tailwindcss/vite`, register the Vite plugin and add
   Tailwind's CSS import in an isolated stylesheet. Review preflight before loading
   it globally into this existing portfolio.
4. Run `npx shadcn@latest init`, configuring `src/components/ui` as the component
   directory and the existing alias. This integration does not require that migration.

The expanded window combines its identity and title into one header. Its compact
variant keeps the four statistics below the scene in both views on portrait and
desktop layouts. Short landscape windows use compact corner statistics in 3D
and move the view controls into the main header to preserve room for the scene. A ResizeObserver measures the window's
non-chart content and caps the original canvas scene to the remaining viewport
height. The original projection and animation logic are retained, and the lid
preview continues using the original uncapped presentation.
