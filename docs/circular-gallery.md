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

On phones, `MobileBeyondBookViewer.jsx` presents the existing four content pages
individually instead of shrinking a two-page spread. A full 180-degree hinged
sheet opens the cover and turns pages over their replacements in 560ms, with
separate front and back faces rather than a slide transition. The reader uses a stable small
viewport height so browser toolbar changes do not cancel a page turn. Swipe
gestures exclude links, buttons, inputs, and music controls. Music preview
selection takes the visitor to the full-size turntable page, with play/pause,
seeking and volume preserved. Desktop retains the original two-page reader.
