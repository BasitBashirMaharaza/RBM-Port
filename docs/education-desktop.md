# Education desktop

The existing `LearningComputerIntro` and its Three.js computer assembly, boot,
zoom and section-framing rules are preserved. On completion, the screen reveals
`LearningDesktop` instead of the former monitor carousel. Reduced-motion users
reach the desktop directly; the desktop remains inert while the intro is active.

All three education records and all four capability groups still come from the
existing data. They appear as three documents and four folders. Desktop mouse
input selects on click and opens on double-click; Enter opens with a keyboard,
and touch opens with one tap. The file names describe this in-page presentation,
not access to the visitor's operating-system files.

The non-modal file window has an explorer sidebar, breadcrumb, read-only preview,
minimize/restore, maximize, close and bounded pointer dragging. Degree details,
all capability notes and the certificate images are retained. The original
Michigan/Google certificate viewers still open from their document previews.
On phones the sidebar is omitted in favor of the desktop files and the content
scrolls inside the screen. Escape closes the file window; certificate Escape is
left to the existing certificate viewer. Keyboard and reduced-motion opening
skip the spatial transition.

The existing CRT casing, screen treatment, power button and screensaver are
reused. Interaction sounds reuse `learningSound.js`; no library was installed.
The clock updates once per minute only while the section is visible. Observers,
intervals, listeners, pointer state and animations are cleaned up on unmount.

Verified with Chrome at widths 1440, 1024, 768, 390 and 320: all seven files,
certificate originals, minimize/restore, maximize, close, screensaver, and page
width. The normal-motion computer sequence, double-click, dragging and Escape
were tested separately. Physical phone testing remains distinct from emulation.
