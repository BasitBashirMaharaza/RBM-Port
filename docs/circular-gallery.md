# Circular gallery integration

The reusable reference component is `src/components/ui/circular-gallery.tsx`.
Its styles live beside it in `circular-gallery.css`; section composition and
styling live in `BeyondCvSection.jsx` and `beyond-circular-gallery.css`.
`src/components/ui` is the existing reusable-component directory, corresponding
to the reference's `/components/ui` path within this Vite project's source root.

Vite already transpiles TSX. This portfolio uses plain CSS rather than Tailwind;
the reference's utilities are implemented as scoped CSS with its perspective,
ring transforms and local wheel input. The refinements add larger,
opaque 16px-deep cards with front/back faces, responsive spacing, faster rotation,
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
Wheel input is attached only to the gallery and consumed only over a card;
there is no global scroll-to-rotation listener.
Images are decoded ahead of entry; the original-resolution local JPGs are reused.
The muted trail video is buffered near entry and plays only when its card faces
the viewer. It pauses offscreen, in hidden tabs, for reduced motion, and while
the gallery or its book viewer is paused.

Phones and desktops use the same `BeyondBookViewer.jsx` and its 180-degree
hinged-sheet animation. Both pages remain visible together on phones.
`responsive-book-spread.css` gives phone pages compact paper proportions, with
separate grid rows for the header, spread, and touch controls. Portrait layouts
keep both pages together; short landscape screens put the controls alongside.
Dense trail pages have slightly more height; detailed information remains
available in their photo-triggered windows. Nested artwork uses flat rotations
on phones to avoid competing 3D layers inside the turning sheet.
Stable small viewport units prevent browser toolbars from resizing the book;
height-only resize events no longer cancel a turn. Swipe and page-click
handlers exclude inputs and music controls. Native pinch zoom remains available.

The collection now fits a single viewport. Its earlier left-aligned handwritten
caption, serif heading, and underline are restored. Cards use viewport-bounded
sizes and a wider responsive ring. Wheel input rotates the gallery only over a
book; the heading, controls, gaps, and surrounding page scroll normally.
Horizontal book dragging remains local, while vertical touch gestures keep
native page scrolling. The pause button is removed; reduced motion, inactive-tab
pausing, and pausing for the open book viewer remain supported.

Browsing uses a critically damped rotation spring that retains velocity when
direction changes. Rapid arrow presses queue from the requested card, and wheel
gestures settle onto a card before automatic rotation resumes. Drag release uses
the same settling motion. Reduced motion keeps immediate selection.

Page turns animate transforms and gate front/back faces with opacity. They do
not measure the rig after mounting a moving sheet. Artwork decodes in small idle
batches so it does not compete with the entrance and initial page turn.
