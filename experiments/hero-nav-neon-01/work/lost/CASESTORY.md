# Lost & Endangered -- Case Story Log

A living log of decisions, pivots, and pattern-setting moments on the L&E case story page. New entries go on top.

---

## 2026-04-28 -- Site-wide design system + final L&E polish

**Major: identity decision landed.** Ivy committed to **Design Technologist**
(was deciding between creative / design technologist for two weeks).
Updated landing hero "Design / Technologist", about hero "A Design
Technologist building in the terminal," meta descriptions on both pages.

**Two-tier radius system unified across the site:**
- `--radius: 18px` for chrome (nav, cards, image frames, footer pill, CTA
  buttons, the orchid bloom)
- `--radius-sm: 6px` for small grid tiles (commit calendar cells)
- Tūī internal phone UI not touched (it's design demo, not site chrome)

**Footer architecture rebuilt** -- shared across landing, about, lost, tūī:
- `.foot__content` flex column with `justify-content: flex-start`
- Big gap (`clamp(140px, 22vh, 320px)`) between eyebrow and middle so
  inbox-open sits at the top, "Let's build something w/ soul" + email
  CTA drop down significantly
- `.foot__bottom { margin-top: auto }` keeps linkedin / twitter / github +
  signature pinned to the section bottom
- Orchid bloom container `inset: 0 0 18% 0` leaves clean space below
- Footer signature: "built in the terminal w/ claude code • 2026"
  (• between code + year, no leading symbol)

**Performance pass — kept every ghost effect intact, killed the jank:**
- Stacked `drop-shadow` filters on the orchid bloom (60-160px) collapsed
  to a single 100px shadow. Pulse animation now only animates `transform:
  scale()` (was animating filter every frame — main jank source)
- Bloom paused via Intersection Observer when not in viewport
- Nav `backdrop-filter` blur 20px → 12px (40% cheaper per frame)
- Footer mail pill blur 10px → 8px
- `will-change: transform` on nav + bloom
- Hero specimen image: dual drop-shadow → single
- All chromatic ghost effects, gradient text, hover glitches, hero
  "extinction" timing → untouched

**Nav refactor — fixed the jolt + the hover shift:**
- Anchored from a fixed left edge (`left: calc(50% - var(--nav-half-w))`)
  with JS measuring initial width once
- Nav hidden via `visibility: hidden` until JS adds `.is-measured` class
  → no first-paint jolt
- Hover-reveal contact link grows to the right only (no recentering shift)
- The `gap` between collapsed contact-li and "about" cancelled with
  matching negative `margin-left` so the right edge stays tight
- Scroll shrink uses just `scale(0.97)` with `transform-origin: 50% 0`
  — drops from top-center, never drifts horizontally
- Nav corner radius now `var(--radius)` (18px), no longer a full pill
- Removed the lilac underline animation on links (kept brightening on hover)

**Lilac named** as a palette color (`#c8a2ff` / `#dca0d8`). Saved as
`--lilac` and `--lilac-2` in the stylesheet for future use anywhere.

**L&E case story page tweaks:**
- "What remains" caption restructured: "The ones / still breathing"
  (was "Those who are / still breathing") — chromatic ghost on hover
  applies only to the second line via `.lost-reflect__phrase--ghost`
- Caption is plain (non-italic) display type
- Outro "Last seen 1985. Last heard 1987." line replaced legacy
  `.lost-glitch` (continuous infinite flicker) with the modern
  hover-triggered chromatic ghost (`.lost-outro__line--ghost`)
- Hero "extinction" gradient restored (lime → mint), 60px text-shadow
  glow dropped (was masking the chromatic ghost shudder)
- Hero gradient ghost ::before / ::after explicitly opt out of the
  parent's `-webkit-text-fill-color: transparent` so they render opaque
- 99.9% stat: white digits + decimal, gradient ONLY on the `%` (full
  gradient across all four chars looked muddy)
- Trailer: "listen." has chromatic ghost on hover. Heavy 32px lime glow
  removed for visibility. Element uses `display: inline + isolation:
  isolate` (NOT inline-block — that creates an italic-text bounding
  box artifact)
- Role / Tools / Scope eyebrows: separators changed from `+` to `·`
- Trailer text shifted right (`padding-left: clamp(64px, 9vw, 168px)`),
  bird card stays put. Problem section inner padding bumped + max-width
  on description reduced to 38ch for tighter rag.
- Spotted Owl text padding-left bumped to clamp(64px, 9vw, 168px); image
  position unchanged
- Lost-page footer: bird card sits at `top: 38%`, eyebrow lifted with
  `margin-top: clamp(-32px, -3vh, -16px)`
- Takeaway "Build in code from day one." font dialed in at
  `clamp(20px, 2.4vw, 32px)` (initial 56px was too big, my 16-22px swing
  was too small)

**Word-wrap JS for `.lost-mark`** is non-negotiable. Each underlined
phrase has its words wrapped in `<span class="lost-mark__word">` so the
chromatic ghost lands per-word — without this, anything that wraps onto
multiple lines or sits at the end of a paragraph line loses the effect
on continuation. `display: inline + isolation: isolate` is the only
display mode that works: `inline-block` creates spurious flex-gap wrap
opportunities (broke "last pair, he..." rag in the kauai quote).

**Other cleanups:**
- About page: "Birthday" → "bday" (Claude Code's 1st bday), Opacity
  Design Meetup removed from upcoming events
- Underline accent on "buildin" not "building" so the descender of "g"
  doesn't tangle with the underline
- Tūī card meta: "Automotive UI · Figma" → "Figma MCP · Claude Code"
- Footer link separators ✺ → ✢ → • (dot, no color)

---

## 2026-04-28 -- Product Thinking section + interaction polish

### What shipped

**New section: ❀ Product Thinking**
Sits between *Insight* ("Songs forgotten") and *What Was Built*. The story now goes: problem → insight → **how I thought through it** → what got built. That product-thinking story is what hiring managers are scanning for, and previously it was buried in one line in "What I'd build next."

Subsections (in order):
1. *The original concept* -- L&E started as a shared, immersive room-scale experience, not a website. The four hero cards are a residue of that idea.
2. *Why a projector, not a headset* -- AR/VR is single-person and gear-gated. A projector + Apple trackpad gestures (swipe up / right / down / left) reaches a room without isolation.
3. *Honest about the pivot* -- Ambitious thoughts hit Figma's prototype wall. The real pivot wasn't form factor → form factor; it was *what I wanted to build* → *what the medium would let me build*.
4. *The medium I have now* -- This entire case story page is built in Claude Code in the terminal. So is the rest of the portfolio. The Figma prototype was the medium then. This is the medium now.
5. *What this archive needs to be* -- Existing bird sites are educational and dated. L&E should feel like a public archive: immersive enough to stay, accessible enough that no one needs special hardware.

Image: `images/lost/lost-main.png` (laptop frame with the four cards over the mossy waterfall ecosystem) sits between *original concept* and *why a projector*. Placeholder for a future screen recording (preloader → 4-cards → card selection).

**Reframed AR/VR bullet in *What I'd build next*** (Reflection section)
- Was: "AR/VR: floating UI at home, or a full immersive experience."
- Now: "The projector experience, gesture-controlled, in code. The form factor this was always meant to be."
Reason: AR/VR is now established as the project's *origin* (in Product Thinking), not a future direction.

### Interaction polish

**Hero eyebrow ("case story" ↔ "case study")**
- Removed the auto-loop (was glitching every ~5s, fighting "extinction" decode for attention).
- New behavior: ~9s after page load (lets video + extinction decode + 2s buffer pass), one delayed reveal swap. From then on, each `mouseenter` on the hero grid fires one swap. No continuous bouncing.
- Now uses the same chromatic ::before/::after lime+mint glitch as the section eyebrows -- no more standalone text-shadow flip.

**Section eyebrow glitches (hover-triggered)**
- Trigger via `:has(headline:hover)` per section, not `section:hover`. Hovering images, padding, etc. doesn't fire it.
- Active on: trailer (99.9% stat), problem, product thinking, what was built, kaua'i, spotted owl pivot, reflection, takeaway.
- Pivot eyebrow flipped: `❋ pivot · spotted owl` → `❋ spotted owl · pivot`.
- `✺ what remains` (the figure eyebrow above the mossy-waterfall image) glitches when the image is hovered.

**`.lost-mark` underline glitch**
- Replaced the block-fill flash (was clunky on hover-out) with the same chromatic glitch effect as the eyebrows. Underline stays visible at rest. Hover triggers the lime+mint shudder, returns cleanly.
- JS auto-populates `data-text` on every `<u class="lost-mark">` at page load -- no per-element annotation needed.

### Copy + layout fixes

- All `--` em-dash substitutes removed from the Product Thinking section *and* the reframed projector bullet. Using periods, commas, and colons instead.
- "Its entire family line ended with it." → "Its entire 'ō'ō family line ended with it." (the 'ō'ō is the Moho family's Hawaiian name).
- 99.9% source citation moved *inside* the stat grid as the third row in the right column. Reads "Source: *American Museum of Natural History*" tight under "of all species that have ever lived are extinct." -- mirrors the cite-under-quote pattern used in the Kaua'i section.
- Kaua'i play button + "the L&E listening room" credit + horizon line all centered. Aligns with the centered "Last seen 1985. Last heard 1987." outro below it.
- "Those who are still breathing" caption: permanently bigger (was hover-only swell), nudged up so it sits just above the laptop screen in the image. No transform on hover -- just sits in place.
- "Up next: Tūī" CTA fills with neon green and text turns black on hover (was just outline + glow).

---

## Patterns to repeat across project pages

**Product Thinking is now a required section for every case story.**

Recommended structure:
1. **Eyebrow + headline** -- glyph + 2-clause headline that captures the gap between ambition and execution. (L&E uses "Imagined for the room. *Prototyped on a screen.*")
2. **The original concept** -- what was the bigger ambition? What did you imagine before the constraints showed up?
3. **The pivot** -- what changed direction, and why? Be honest: was it tooling, time, scope, ethics, feasibility?
4. **The honest part** -- what did you have to admit to yourself? This is the section hiring managers care about most.
5. **The medium I have now** -- where does this live, and what's the bridge between intent and current reality?
6. **What this thing needs to be** -- product philosophy. Who is it for, what does it have to feel like?

Place it **between Insight and What Was Built** in the narrative arc. The reader needs to understand *how you thought* before they see *what shipped*.

**Pattern to apply next:**
- [ ] Tūī case story -- needs Product Thinking section before its capability/flow breakdown.
- [ ] Future project pages -- treat Product Thinking as non-optional.

---

## Open TODOs

- [ ] Replace `lost-main.png` in Product Thinking with a screen recording: preloader → 4-cards screen → card selection. Once recorded, swap `<img>` for `<video autoplay muted loop playsinline>`.
- [ ] Consider a 2nd visual in Product Thinking after "the medium I have now" (e.g. a Claude Code terminal moment). Currently text-only there; might benefit from a beat.
- [ ] Apply the Product Thinking pattern to the Tūī case story page.
