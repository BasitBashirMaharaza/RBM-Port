# Beyond the CV: local mood board

Reference inspected in a live browser: https://21st.dev/@sliderrevolution/components/mood-board-carousel

The supplied `SliderRevolutionCarousel` is preserved in
`src/components/ui/mood-board-carousel.tsx`. It embeds an SR Anywhere module;
its demo key contains the author's images and cannot accept the portfolio's
local collection data. A custom hosted module can be used by passing its own
embed key. No demo module or third-party script is loaded by the local gallery.

The portfolio uses `MoodBoardGallery`, a local recreation of the observed
perimeter filmstrip, centered title, progress dots, and outlined action. It is
adapted to the portfolio's light/dark colors and mobile viewport. Each collection
shows only its own artwork. Archive and journal changes remain separate from this section.

`BeyondCvSection.jsx` supplies the existing `beyondBooks` data. Selecting a collection
shows only that collection's images. Earlier book-jacket images are not used.
`MoodCardPreview.jsx` presents exactly one selected item in a central, image-origin
native dialog. There is no book, collection grid, or full-screen collection
window in the card interaction. Longer descriptions and trek routes use compact detail pages inside the preview. Music previews and streaming links,
film/game metadata, and social links remain associated with their own cards.

Four separately clipped filmstrips have fixed gaps and independent transform
animations, so cards do not collide at corners. Image changes use a short stagger;
the title has a word reveal on entry and collection changes. A pointer aura and
small scene parallax update element transforms directly, without React updates
per frame. Touch devices do not run pointer-following effects.

Hover does not pause the filmstrips. Keyboard focus brings the focused card into
view and holds motion; hidden tabs, offscreen state, reduced motion and an open
preview also pause movement. Native wheel/touch scrolling is preserved. Previews animate from the selected image into the central title rectangle. A blurred
modal backdrop makes the rest of the page inactive. Backdrop click or the close button
returns the image to its original card; Escape, resize, and reduced motion close
immediately. Closing restores focus and scrolling, and pauses
audio when closed or when the tab is hidden. Observers, listeners and animations
are released on unmount. The former book components remain in source but are no
longer mounted or bundled by this section.

## Project conventions and optional setup

Vite already supports TSX. The reusable component directory is `src/components/ui`,
the project's equivalent of `/components/ui`. Scoped CSS lives beside the component;
section/dialog styles are in `src/components/beyond-mood-board.css`. No new runtime
dependency or global CSS reset is required.

If adopting TypeScript checking, Tailwind and shadcn later:

1. `npm install -D typescript @types/react @types/react-dom`.
2. Add a TypeScript config with `jsx: react-jsx`, `moduleResolution: bundler`,
   `allowJs: true`, and `@/*` mapped to `src/*`; mirror the alias in Vite.
3. Install `tailwindcss` and `@tailwindcss/vite`, register the Vite plugin and add
   Tailwind's CSS import. Review preflight before applying it to the existing site.
4. Run `npx shadcn@latest init`, choosing `src/components/ui` and that alias.

These optional setup steps are not required for the supplied React wrapper or
this existing portfolio integration.

## Cursor dye and viewport spacing

`MoodFluidCursor.jsx` lazily creates a small WebGL dye-advection field on the
first mouse movement. Two bounded RGBA8 surfaces retain and curl the trail;
the canvas is composited beneath the image and lettering planes. It follows
the active collection color and theme, dissipates after input stops, and clears
on scroll, hidden tabs, an open preview, or a collection transition. Touch and
reduced-motion users do not initialize the GPU effect. No React state updates
occur per frame; shaders, framebuffers, textures and listeners are released on
unmount. Gallery gutters provide breathing room inside the full-height viewport.
