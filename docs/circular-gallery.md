# Circular gallery integration

The reusable reference component is `src/components/ui/circular-gallery.tsx`.
Its styles live beside it in `circular-gallery.css`; section composition and
styling live in `BeyondCvSection.jsx` and `beyond-circular-gallery.css`.
`src/components/ui` is the existing reusable-component directory, corresponding
to the reference's `/components/ui` path within this Vite project's source root.

Vite already transpiles TSX. This portfolio uses plain CSS rather than Tailwind;
the reference's utilities are implemented as scoped CSS with its perspective,
ring transforms and scroll runway. The requested refinements add compact,
opaque 16px-deep cards with front/back faces, closer spacing, faster rotation,
and the trail video. No new
runtime dependency is needed. Existing collection data, theme artwork, book
viewers, music previews, keyboard controls, and reduced-motion behavior remain.

For a future fully typed shadcn/Tailwind setup (optional, not required here):

1. Install development types: `npm install -D typescript @types/react @types/react-dom`.
2. Add a Vite-compatible `tsconfig.json` with `jsx: react-jsx`, `moduleResolution: bundler`,
   `allowJs: true`, and an `@/*` alias targeting `src/*`.
3. Install Tailwind: `npm install -D tailwindcss @tailwindcss/vite`; register its
   plugin in `vite.config.js` and import Tailwind in a separate stylesheet.
4. Add the matching `@` Vite resolve alias, then run `npx shadcn@latest init` and
   select `src/components/ui` as the reusable UI directory. Inspect Tailwind's
   preflight before enabling it globally, since it can change existing styles.

The supplied reference's frame-by-frame React state updates are replaced by one
visible-only animation frame loop that updates the ring transform directly.
Scroll geometry is measured on resize, not during scrolling.
Images are decoded ahead of entry; the original-resolution local JPGs are reused.
The muted trail video is buffered near entry and plays only when its card faces
the viewer. It pauses offscreen, in hidden tabs, for reduced motion, and while
the gallery or its book viewer is paused.

Phones and desktops use the same `BeyondBookViewer.jsx` and its 180-degree
hinged-sheet animation. Both pages remain visible together on phones.
`responsive-book-spread.css` maximizes the spread's width, allows more vertical
space for page content, and adjusts text, labels, and controls for phones.
Stable small viewport units prevent browser toolbars from resizing the book;
height-only resize events no longer cancel a turn. Swipe and page-click
handlers exclude inputs and music controls. Native pinch zoom remains available.
