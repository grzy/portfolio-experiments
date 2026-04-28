# Lost & Endangered -- Case Story Log

A living log of decisions, pivots, and pattern-setting moments on the L&E case story page. New entries go on top.

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
