# Tūī Build Notes

## Design tokens (from Bakery 1)
- `--fogbound: #dfd9d0` — bg
- `--battery-black: #0e0e0e` — text
- `--pure-air: #f9f9f9` — light highlight (top-left shadow)
- `--carbon-neutral: #b2aea7` — soft shadow (bottom-right)
- `--lichen: #dfff00` — primary CTA gradient start (green-yellow, matches Tūī body)
- `--electric-blue: #3671c7` — primary CTA gradient end + Tūī eye glow color
- Drop shadow recipe: `-1px -1px 1px var(--pure-air), 1px 1px 2px var(--carbon-neutral)` (neumorphic soft)
- Type: Manrope Regular 48 + tracking 9 (eyebrow), Manrope SemiBold 64 (heading)
- Canvas: 1366 × 1024 (4:3 dashboard)
- Subtle noise texture overlay at 3% opacity (luminosity blend)

## Typography rework plan (TODO)
- Eyebrow → mono (JetBrains Mono or IBM Plex Mono), ~20px, tracking ~5
- Heading → keep humanist sans but reduce to 48-52px, line-height 1.15
- Reduce overall scale — current sizes feel shouty for a calm "while charging" moment

## Storybook UI principle (Ivy's words)
"The whole part of it was the storybook UI and the characters coming to life."
→ Mascots need subtle idle motion. Breathing, blinking, micro-reactions to taps. This is the soul of the build.

## "Ribbon image" page concept
Ivy wants the whole experience presented as a long horizontal ribbon — the dashboard hero, then the flows progressing screen-by-screen, then phones at the end. Possibly horizontal-scroll, possibly a stitched panorama. Decide layout once we have all screens.

## Personalization idea
Optional name prompt at first visit → replaces "HELLO HIRO" with visitor's name. Stretch goal, but cute and fits the storybook vibe.

## Talk-to-Tūī CTA evolution
Currently a small 50px gradient circle on Bakery 1. Ivy's vision: it expands into a horizontal pill bar that says "Talk to Tūī" or similar. Reference for built-out version: **Dog Park 4**.

## Copy questions to revisit later
- "Nourishment" / "Nourish" — is it the right word for food + drink? Maybe "Refuel" (EV pun), "Eat & drink", "Snacks", "Bites"? Decide together at copy pass.
- "Hello Hiro" → personalize with visitor name from local prompt.
- "Talk to Tūī about an activity" / "Tell Tūī" / "Ask Tūī" — final phrasing TBD.

## Project timeline (Ivy's history)
Designed September 2024 → November 2024 in a UX Design class. UI was only the last few weeks of the term. Lots of mascot iteration. In hindsight Rive would've been the better tool — that's the "what's next" framing for the case story.

## Case story tone
Lighter than L&E. The whole storybook + sidekick fruit + character-coming-to-life thing IS the topic. Don't over-engineer narrative.

## 🪶 Through-line to Lost & Endangered (case-story gold)
Tūī (this project, Sept-Nov 2024) is the SEED that grew into Lost & Endangered.
- The **Tūī** mascot is named after a real native New Zealand bird (iridescent green-blue plumage, distinctive song — match the gradient palette intentionally or by happy accident)
- The audio in the **Tūī Birdsong flow** is Ivy's own field recording from New Zealand
- That same audio inspired her to build L&E. Original L&E concept: ALL extinct species (whale song, bird song, etc.) → narrowed to Bird Edition because sound was the strongest medium for birds.
- L&E preloader says "Bird Edition" tiny in the corner — the through-line is already wired into that page.
- **For the case story:** the reflection should connect Tūī → L&E as one continuous creative lineage. Past-you didn't know you were planting a seed.

## Three personas (UX class assignment)
Each flow = one persona, one fictional user:
- **Hiro (LEAD PERSONA)** → Bakery flow
- **Marco** → Dog Park flow
- **Camille** → Tūī Birdsong flow

### 🪄 Hiro's full story (locked in 2026-04-26)
Hiro lives in San Francisco with his wife and two daughters. His wife is in Seattle for work, so Hiro and the girls hop in the EV and road-trip up to surprise her. They charge the car as they arrive in Seattle, and decide to grab baked goods from a bakery within walking distance of the charging station — to bring to mom.

**This story is the page's emotional engine.** The product solves a real moment: you're charging anyway, the kids are restless, mom is waiting, and there's a bakery 4 blocks away you wouldn't have known about. Tūī tells you, sends you walking directions, and you arrive with bread and pastries. Family reunion built into a charging stop.

**Use this in the case story copy** — it makes the abstract product ("EV charging activity finder") feel like an actual life moment.

### Persona image strategy
- 2024 AI imagery is inconsistent (people don't look the same across photos)
- Ivy has the **most photos of Hiro** — he's the visual lead too
- **Use only the highest-craft images.** Don't try to show all three personas equally if the photos don't hold up.
- Possible placement: hero photo of Hiro + daughters at a bakery (high-craft only), then small persona cards in the case story body for Marco + Camille if usable.
- The iOS phone wallpaper across all 4 phone frames is already a father+daughter car-window photo — that's likely a Hiro family image and is already serving the brand mood.

## Screens collected
- [x] Bakery 1 (383:1336) — start screen, "HELLO HIRO" greeting + question + Talk-to-Tūī CTA
  - Top-left icons: Home, EV
  - Top-right icons: Tūī, Settings
  - Center: Tūī mascot
  - Bottom-center: 50px gradient ellipse = Talk to Tūī CTA → wire to Web Speech API
- [x] Bakery 2 (383:1236) — **Select an activity** screen
  - Mascot still floating top-center
  - 5 activity cards (198 × 300, 50% white fill, 8px radius, neumorphic shadow)
    - Listen (Tūī bird illustration)
    - Focus (Book)
    - Connect (Heart, gradient)
    - Outside (Outside Dog mascot)
    - Nourish (Tangelo — the sidekick fruit)
  - Card label: 24px Manrope Medium, centered
  - Heading: "Select an activity" 48px Manrope Medium
  - Progress bar at bottom: pill (198 × 38), 5-dot indicator, dot 1 active
  - **Mascot is a real component** (`TuiTailTest`, property1="Tui") — confirms variants exist
- [x] Bakery 3 (383:1237) — **"What type of nourishment are you after?"** sub-category screen
  - 🪄 **Hero animation moment:** The Nourish card from B2 has lifted/centered, Tūī now peeks up from BEHIND the card with bright yellow eyes (Paws asset = his ears). Tangelo sits inside the card. This IS the storybook moment.
  - 6 sub-cards: Grocery, Coffee, Bakery, Takeout, Tacos, Noodles (89×130, 16px label) — **too small for in-car touch, must enlarge in code**
  - "+" overflow button to the right of the row (suggests scrollable / more options)
  - Progress dot 2/5 active
  - "Bakery" sub-card has cursor-pointer (it's the selected path forward)

  **State transition B2→B3 (animate in code):**
  1. User taps Nourish on B2
  2. Card lifts + centers + scales slightly
  3. Tūī mascot rises behind it, eyes flash yellow
  4. Sub-categories slide in below
  5. Progress dot advances
- [x] Bakery 4 (386:1699) — **confirmation step**: "Would you like walking directions for nearby bakeries texted to your phone?"
  - Mascot DISAPPEARS for this screen (decision moment = no character distraction). Pattern: mascot steps aside when user is committing to a choice.
  - Primary CTA: **"Yes, send a map"** — gradient pill (Lichen→Electric-Blue), 416×104, 32px SemiBold
  - Secondary: **"No directions"** — glass pill with marker-off icon, 24px at 60% opacity
  - Progress dot 3/5
  - Consistent gradient identity confirmed: Tūī body, Tangelo, Talk-to-Tūī CTA, primary buttons all share the Lichen→Electric-Blue palette
- [x] Bakery 5 (386:2023) — **charge-level slider**: "How about a text update for your preferred charge level?"
  - **The slider is the show-stopper of this flow.** Track (400×40, glass pill, neumorphic) with an 80px gradient knob.
  - Slider fill is the **signature Lichen→Electric-Blue gradient** revealed as the knob slides
  - Above slider: % number (10/20/30…100). Built in Figma with a vertical text stack inside a 70px clipped frame — number scrolls via translateY as slider moves. **In code this becomes a real `<input type="range">` with a vertical-scrolling number readout.**
  - Below slider: "SLIDE TO ADJUST" — Manrope ExtraBold 20px, tracking 6 (the only place I've seen this style — keep it as a slider-specific affordance hint)
  - No mascot (commitment-screen pattern continues)
  - Secondary button: "No text updates" with no-chat icon
  - Progress dot 4/5
  - **Build note:** Smooth thumb drag, gradient fill, number-tumbler animation, subtle scale-on-drag for haptic feel.
- [x] Bakery 6 (386:2076) — **success state**: "You're all set, Hiro! Enjoy your baked goods while your EV charges."
  - 🪄 **Mascot color shift:** Tūī is now in **grayscale "rest" state** with bright Lichen-yellow eyes glowing. He's done his job — at ease, watching, standing by. This is a major mascot variant we'll need.
  - Mascot is larger here (317px) — he gets to be the star of the success moment
  - Progress dot 5/5 (flow complete)
  - **`Component1` named "Confetti 0"** is in the layer tree but empty — implies a confetti variant set was intended (Confetti 1, 2…). **In code we can build a real confetti burst** on flow completion (canvas-confetti or CSS particles).
  - Pattern: success screens show only mascot + copy. No buttons. Flow ends, hand off happens via the phone (next).

✺ **Bakery flow complete (6/6).** Full user journey: greet → activity → sub-category → confirm → charge level → success.

- [x] Dog Park 1 (499:755) — **same as Bakery 1**, name swapped to **"HELLO MARCO"**.
  - 🎯 **Insight: each flow uses the same greeting template with a different fictional user name.** Hiro (Bakery), Marco (Dog Park), TBD (Birdsong). This validates the personalize-by-name idea — the slot is already there in the design.
  - **In code: single `<StartScreen name="...">` component, name is the only variable.**
- [x] Dog Park 2 (1021:1150) — **identical to Bakery 2.** "Select an activity" with same 5 cards (Listen, Focus, Connect, Outside, Nourish), Tūī floating top-center, progress dot 1/5.
  - 🎯 **Confirmed:** activity-grid screen is shared across all 3 flows (B2 = DP2 = TBS2). **In code: one `<ActivityGrid>` component, three flows use it. The only thing that differs is which card the user taps next.**
- [x] Dog Park 3 (499:647) — **sub-category drill-in for Outside**: "What type of adventure are you after?"
  - Same storybook moment as Bakery 3: Outside card lifted + centered, Tūī peeks up behind it with yellow eyes
  - 6 sub-cards: **Park · Courts · Water · Play · View · Trees** (89×130, same touch-target issue)
  - Icons: Path, Basketball Court, Creek, Playground, Mission, Forest (all 48px black silhouettes — different vibe from food icons which were colored/shaded)
  - "+" overflow button on the right
  - Progress dot 2/5
  - Same enlarge-for-touch fix as Bakery 3 needed
- [x] Dog Park 4 (896:677) — **expanded sub-category state** (after tapping "+" on DP3): 2 rows × 6 cards = 12 sub-cards
  - Row 1 (visible by default): Park · Courts · Water · Play · View · Trees
  - Row 2 (revealed on +): **Trailhead · Boats · Flowers · Bench · Dog Park · Wildlife** ← these are Ivy's hand-drawn icons
  - Outside still lifted with Tūī peeking
  - 🎯 **Talk-to-Tūī CTA evolution captured:**
    - Was: 50px gradient circle on B1/DP1 (decorative, no label)
    - Now (DP4): **glass pill bar "🔊 Tell Tui an Activity"** at bottom-center (sound icon + text, full hint)
    - Below it: small black 50px circle labeled "Coming Soon" with Lichen+Electric-Blue glow shadow (Figma name: "Back button" — past-Ivy used this slot as a placeholder for the unbuilt voice trigger)
  - **In code:** ship the bar as the real Talk-to-Tūī affordance with Web Speech API. Drop the "Coming Soon" placeholder — it isn't anymore.
  - No progress bar on this state (the talk bar takes its visual position)
- [x] Dog Park 5 (1020:654) — **confirmation step**, parallel to Bakery 4. Copy: "Would you like walking directions for nearby **dog parks** texted to your phone?" Same gradient Yes / glass No buttons.
- [x] Dog Park 6 (1021:1000) — **charge slider**, identical to Bakery 5. Same number-tumbler, same SLIDE TO ADJUST hint.
- [x] Dog Park 7 (499:1380) — **success state**, parallel to Bakery 6. "You're all set, **Marco**! Enjoy the **dog park** while your EV charges." Same grayscale rest-mode mascot, same Confetti 0 placeholder.
- [x] Tūī Birdsong 1 (499:805) — **start screen**, name = "HELLO **CAMILLE**". Three-persona pattern locked: Hiro (Bakery) / Marco (Dog Park) / Camille (Birdsong).
- [x] Tūī Birdsong 2 (1021:1251) — **activity grid**, identical to Bakery 2 / Dog Park 2. The **Listen card has cursor-pointer** here (Birdsong path goes through Listen).
- [x] Tūī Birdsong 3 (499:1053) — **THE UNIQUE ONE for this flow**: sub-category drill-in for **Listen**, title: **"What type of sounds are you after?"**
  - Listen card lifted at top with a **black bird-silhouette icon** (Group33, NOT the gradient Tūī bird) — design distinction: when an activity is selected, its card icon shifts to a flat silhouette, leaving the gradient mascot to be the alive character
  - 6 sound sub-cards: **Rain · Ocean · Campfire · Birdsong · Thunder · Wind** (icons: rainfall, water, bonfire, bird silhouette, storm, fog)
  - Tūī peeks behind with yellow eyes (Paws), as in B3 / DP3
  - "+" overflow on the right
  - **Birdsong sub-card has cursor-pointer** — the chosen path
  - Progress dot 2/5
- [x] Tūī Birdsong 4 (1021:916) — **charge slider**, identical to B5 / DP6. The slider screen is universal across flows.
- [x] Tūī Birdsong 5 (499:1600) — **THE OTHER UNIQUE ONE — and the soul-screen of the whole project**:
  - Copy: "You're all set, **Camille**! Enjoy the birdsong while your EV charges."
  - 🪄 **Mascot is in BLUE listening state** (different from B6/DP7 grayscale rest state) — soft Electric-Blue-toned gradient, looking up. Component variant `Tui property1="1"`. **This is Tūī engaging with the birdsong** — head tilted, listening. Different polygon construction from the other mascot states.
  - Below mascot: **"Adjust your audio 🔊"** underlined link (60% opacity) — entry point to audio settings. **In the coded version this becomes the slot for the Web Speech API affordance + audio playback for Ivy's New Zealand recording.**
  - Progress dot 5/5
  - **NO Confetti component on this one** — no celebration burst here. The success IS the listening. Quieter ending. Honor that in code.

## iOS Text frames (4 phone screens, all 402×874 iPhone 16 Pro)
**All four use the same wallpaper:** photo of a father + daughter looking out a car window at a forest landscape (the wallpaper IS the EV-as-family-time mood — keep this exact image, it carries the brand). All show 63°/Partly Cloudy weather widget, lock screen gauge at 61, time-stack widget 8:29 PM.

- [x] **Intro to Tui (24:2235)** — Lock time 1:14. Notification: "Tūī • now • ⚡️🔌"
  → First ping when charging starts. Just emojis. Tone: text from a friend.
- [x] **Tui Directions — Bakery (465:490)** — Lock time 1:19. "Tūī • now • Location: 'Bakery' near you 🍞"
- [x] **Tui Directions — Dog Park (986:280)** — Lock time 1:19. "Tūī • now • Location: 'Dog Park' near you 🐾"
- [x] **Tui Reminder Completion (469:569)** — Lock time 1:49. "Tūī • now • Complete 🔋🔌"
  → Charging done. Same emoji-text style.

The phone story arc: ⚡️🔌 (charging started) → 🍞/🐾 (here's your spot) → 🔋🔌 (you're full). **Charming.** Tūī never sends paragraphs — just emojis and a quoted location word. Voice: best-friend-who-doesn't-overshare.

## Glow-in-the-dark — picked Option B (916:894) over Option A (849:498)
Both are night-mode variants of the activity grid (radial gradient dark bg, lichen-yellow line work everywhere — borders, type, mascot, icons).

**Differences:**
- **Option A (849:498)** — uses `TuiTailTest` component (Tui tail 1 variant) + has a `tail` SVG visible behind the mascot. Gradient illustrations stay (Tui bird gradient on Listen card, Tangelo gradient on Nourish, Outside Dog).
- **Option B (916:894)** — uses `TuiTest` component (Tui 4 variant) — different polygon construction, NO tail behind, but has a `Group4` (mouth/beak) detail on the mascot face. Connect heart and Outside Dog rendered slightly differently (Group34 / contained).

**Final pick (Ivy's call):** the version with the tail + stripped (non-gradient) icons.

**Why this is the right one:** the night state should commit. Stripping the gradients forces every icon to share the same visual language as the line-work borders and lichen typography — everything reads as one coherent quiet moment. Calm comes from removing, not adding. The tail is a *posture change*, not a recolor — Tūī himself is in a different state at night, not just "lights off."

**Stretch detail:** when we render this in code, the dashboard screen can softly bleed lichen light outward into the surrounding car photo (the Rivian hero) — a radial blur tinted glow that makes it feel like the screen is genuinely lighting the cabin. Reading light from the dash. ✨

**In code:** glow-in-the-dark becomes a CSS theme — same component tree, different `:root` token values. Black bg + lichen text + lichen 1px borders replace the neumorphic shadows. We trigger it via a media query (`prefers-color-scheme: dark`) AND tie it to the Birdsong flow's listening state (because birdsong + dim cabin = night reading vibe).

## Components captured (the animation primitives) ✺

### 1. Component 4 (605:2692) — confetti-on-eye sequence
5 keyframes for the confetti-stuck-on-eye micro-animation:
- **Variant5** → clean Tūī, eyes open (start state)
- **Group 23** → confetti piece hits face, eye still visible (impact frame)
- **Group 24** → confetti stuck, eyes squinted closed (Lichen flat ellipses = pinched-shut)
- **Group 25** → same squint, confetti shifted slightly down (the dwell)
- **Group 29** → confetti gone, eyes open again (recovery)
**Animation:** Variant5 → Group 23 (50ms hit) → Group 24 (300ms hold) → Group 25 (250ms shift) → Group 29 (200ms release). Total ~800ms beat.

### 2. Tui (778:3820) — Birdsong looking-up sequence
6 keyframes (variants 0-5) of the BLUE listening mascot from TBS5. Eyes literally look around — up, side, down, back — as if tracking ambient sound. **This is the listening-to-birdsong idle loop.** Loop forever or trigger on audio playback.

### 3. Tui (184:567) — main mascot, 6 variants
Open-eye / closed-eye keyframes for the blink + breathe idle. Pattern: big-eyes → flat line → big-eyes. Each variant uses imgGroup1 through imgGroup6 (different facial expressions).
**Animation:** Variant1 (eyes open, 2s hold) → Variant2 (closed, 80ms) → Variant1 (eyes open, 2s hold) → randomly insert Variant3-6 for personality. Subtle breathing via `transform: scale(0.99→1.01)` on the body.

### 4. Tui tail (194:12943) — 4 tail variants
- **Tui** → no tail
- **Tui tail 1, 2, 3** → tail pointing left at three different angles/lengths
**This is the tail wag.** Loop tail 1 → 2 → 3 → 2 → 1 for a slow swish. Use in glow-in-the-dark mode AND idle moments where Tūī gets bored.

### 5. Confetti component (186:4010) — 6-stage particle burst
All confetti is made of **the activity & sub-category icons themselves**:
- **Confetti 0** → empty (start)
- **Confetti 1** → light scatter (Musical, Heavy Rain, Path, Sail Boat, Playground, Fox)
- **Confetti 2** → bigger spread (Saxophone, Wave Lines, Forest, Night Landscape + previous)
- **Confetti 3** → peak burst (Dog Pooping, Creek, Mission, Forest, Wave Lines, Saxophone, Trekking, Fog, Night Landscape)
- **Confetti 4** → settling (Sample Rate, Large Tree, Bench, Grand Piano, Bonfire, Storm, 24:00 + tons more)
- **Confetti 5** → cleared (empty again)

🪄 **The confetti IS the story:** every choice the user could have made rains down on them in celebration. Pure storybook delight. **In code:** treat each icon as a particle, randomize position/rotation/timing, sequence through stages 1→4 over ~2.5s, then dissolve to 5. Combine with Component 4's eye-stuck sequence: one piece intentionally lands on Tūī's face during stage 3, triggers his blink-it-off animation while the rest finish settling.

### 6. Component 3 (576:2325) — 12-variant comprehensive catalog
This is the deep mascot library. Contains:
- **Awake blue states (tui 1, 4, 5, 6, 7, 8)** — slight eye-position variations for personality flickers
- **Sleeping states with z z z (tui 2, 3, 9, 10, 11)** — different sleep depths (more z's = deeper sleep), eyes closed
- **🪄 tui 12 — the BLACK Tūī (dark navy/midnight)** — this is the night-mode mascot she mentioned. Use in glow-in-the-dark or after a long idle period.

The "z z z" text is rendered as actual Manrope Medium 20px text positioned diagonally (rotate 0.74deg) — staggered z's that create a vertical sleep stack.

### 7. Group 18 (576:2264) — sleepy navy Tūī with z z z (standalone)
A dark blue Tūī, eyes closed (curved lash lines, not the flat-ellipse closed-eye), z's stacked beside him. **Use case:** after extended inactivity, Tūī falls asleep. Especially fitting for the EV-charging context — long charge time, your sidekick takes a nap. Cute idle.

### 8. Slider control (324:730) — Default + Pressed
- **Default:** clean 80px gradient knob
- **Pressed:** SAME knob but a **120px translucent halo ring** appears behind it, scaled larger. **This is the press feedback — a finger-touch ripple expanding outward.**
**In code:** `transform: scale(1.1)` + `box-shadow: 0 0 0 20px rgba(255,255,255,0.2)` on `:active`. Animate over 80ms in, 200ms out.

### 9. Yes button (114:1633) — Default + Active
- **Default:** gray pill with "Yes"
- **Active:** same pill PLUS `inset shadow: 0 4px 4px rgba(0,0,0,0.25)` from the top — gives the "pushed in" feel like the surface depressed under your finger.
**This is the press feel for ALL primary buttons in the build.** Apply to "Yes, send a map", "Talk to Tūī" CTA, etc. on `:active`.

### 10. Back button (326:817) — Default + Variant2
Both variants are the "Coming Soon" black 49px circle placeholder. We're replacing this entirely with the wired-up Web Speech API affordance, so it's reference only.

## 💡 The press-feel system (combined recipe)
- **Pills/buttons:** `:active` → `inset 0 4px 4px rgba(0,0,0,0.25)` + `transform: scale(0.98)`
- **Knobs/sliders:** `:active` → `box-shadow: 0 0 0 20px rgba(lichen, 0.18)` (lichen-tinted halo) + `scale(1.1)`
- **Cards:** `:active` → `inset 0 2px 6px rgba(0,0,0,0.15)` + `scale(0.99)` (subtle, since cards are already shadowed)
This gives every interactive element the *fingerprint feel* a touchscreen needs in a car interface — your finger leaves an impression.

## Hero / page structure (Ivy 2026-04-26 evening, refined)
- **Build prototype as Hiro persona** (lead with Bakery flow). Hiro is the canonical demo path on the page.
- Hero composition: **photo (if sourced) sits BEHIND, prototype fits into the dashboard scene of the photo**. Same plane.
- Texts overlay the hero (similar to L&E layered hero), fade/fall down on scroll → reveal case story below
- **Glitch effect: ONLY on eyebrow caps text + on the events-style flying-letters detail.** Nothing else gets glitch.
- Ivy will source the outdoor "car dashboard UI ribbon" hero photo separately (TBD).

## 🪄 Dashboard ambient cabin-light interaction (Ivy's explicit ask)
On certain interactions, the dashboard screen **bleeds soft light outward into the surrounding car photo**. Lichen-tinted radial glow that pulses with key moments:
- Talk-to-Tūī button activated → soft green-blue pulse outward
- Slider knob being dragged → gradient halo extends past the dashboard frame into the cabin
- Confetti success → brief bright flash that lights up the cabin (like a real screen would)
- Glow-in-the-dark mode → constant gentle bleed into the surrounding photo, especially around the Tūī mascot
**Why:** Real Rivian/Lucid/Tesla cabins have ambient screen-light that affects the interior. Simulating that visually elevates the prototype from "screenshot embedded in photo" to "actually feels like the screen is in the car." This is the move that takes the build from impressive to *believable*.
**Tech:** CSS `filter: drop-shadow()` pulses + a separate radial-gradient div positioned over the photo with `mix-blend-mode: screen` and `opacity` tied to interaction state.

## Image assets (MCP URLs — expire in 7 days, re-fetch when building)
- imgNoiseTexture: 263fb569-3f49-4c2d-82d1-e1522e8de6b3
- imgTuiTest (mascot): f1e6fe5c-6711-4a19-9fd5-924f05ecd55c
- imgSettingsIcon: bc52dff9-f73d-4141-8bdd-3892a7f7caf6
- imgTuiIcon: fd0d9be3-eb7b-470b-87a4-8a3027ee5b05
- imgHomeIcon: 2bb50c18-c601-481f-a565-209a7fc2ec3b
- imgEvIcon: 9739e17e-420a-4ef7-83c6-45efd493083e
- imgEllipse37 (Talk-to-Tūī CTA gradient): c0409860-df3b-4de4-98ac-7b3a2b2053f8

## Case story facts (from deck + research, locked in 2026-04-26 night)

### Project meta
- **Title:** Rethinking EV Charging — Beyond the Gas Station
- **Course:** Academy of Art University, IXD 606 UXD, Fall 2024
- **Format:** Car UI concept — text-message + in-car interface hybrid (NOT another app)
- **Name origin:** Tūī, a New Zealand bird known for mimicking sounds and filling quiet spaces with melody. ← This is the through-line to L&E. Past-Ivy didn't know she was naming the seed.

### One-line problem statement
EV apps prioritize charging speed but ignore the wait. Tūī turns charging downtime into personalized, low-friction moments — without forcing users into another app.

### ⭐ Headline stat (the punch)
**EV drivers spend an average of 42 minutes per paid public DC fast-charging session.**
- Source: US Department of Energy / Energetics analysis of 2.4M sessions through June 2023
- Tesla Superchargers bring the all-charger average to 31 min; non-Tesla public fast-charging averages 42 min
- **Use this in the case story opening** — it quantifies the problem the deck doesn't quantify itself
- Suggested opener: *"EV drivers spend an average of 42 minutes at a public fast charger. Apps optimize how fast the car charges. Nobody designs for the wait itself."*

### Market stats (from deck — supporting, not headline)
- 59.6% of EV drivers use public chargers weekly (PR Newswire via ChargeLab, Feb 2024)
- 86.0% have access to a home charger (frames why public-charging UX still matters)
- 192,000+ publicly available charging ports in the US (USDOT, Aug 2024)
- ~1,000 new public chargers added each week (USDOT)

### Research methodology (UX class)
- Method: 1:1 user interviews
- Participants: EV-owning professionals 35-55 (commuters + road-trippers)
- Named in deck: Eli Danziger (SVP Product, Xero), Kane Cullimore (Senior Data Scientist, O'Reilly), Daniel Erman (Sales, KNBR Radio)
- Personas built: 3 (Hiro, Marco, Camille) — each tied to a flow

### Personas (deck-confirmed details)
- **Hiro, 44, SVP Product** → Bakery / Nourish flow
- **Marco, 52, semi-retired engineer** → Dog Park / Outside flow
- **Camille, 38, Infrastructure Architect** → Birdsong / Listen flow

### Five activity categories (locked in deck)
Listen · Focus · Connect · Outside · Nourish

### Type system (deck-confirmed)
- Manrope, Medium & Bold
- H1 64 / H2 48 / T1 24 / T2 20 / T3 16
- (Rework plan still applies — eyebrow → mono, sizes scaled down for calm car-UI)

### Color palette (6, deck-confirmed hex)
- Electric Blue #1773CE
- Lichen #B1A56C  ← deck spec; live Figma was #dfff00. **Use deck hex on the case story page; the brighter Figma value can stay in the prototype as the actual mascot/CTA gradient.**
- Fogbound #E0D9CF
- Moss #B1A56C (same as Lichen — likely a duplicate in the deck)
- Pure Air #F9F9F9
- Battery Black #0E0E0E

### Components built (deck inventory)
Button cards · interactive progress bar · interactive slider · nav buttons · Tūī companion mascot

### Hi-fi prototype: 9 documented steps
plug-in text → welcome screen → activity cards → sub-activity cards → walking directions text → charge-level slider → confetti completion screen → walking directions text → charge-status reminder text

### Testing (qualitative only — no metrics in deck)
- 3 testers over 2 days, Nov 11-12 2024: Joel Evanoff, Kane Cullimore, Tianna Wu
- ⚠️ No quantitative results in deck. Skip — the script transcripts dilute what Ivy already pulled.

### Competitor benchmarks
Rivian (EV experience) · WeWork (community/space) · AllTrails (location-based discovery)

### Pull quote (use it)
> **"Craft over process."** Understanding UX is vital, but polished, visually compelling solutions are what stand out.

### Future concepts (case story "what's next" section)
- AI-Integrated Progress Bar
- Paper Mode
- Glow-in-the-Dark Mode (already locked into the build)
- "Tell Tūī an Activity" voice input (already wired via Web Speech API)
- Rive for mascot animation (Ivy's hindsight: "Rive would've been the better tool" — the design-engineering handoff repair angle)

### Deck narrative arc (optional structure cue)
The deck is structured as a 6-stage "gear shift" narrative (1st Gear → Reverse). **Don't copy this on the case story page** — it's cute for a school deck, too cute for a hiring-manager-facing portfolio. Use the standard Problem → Insight → Decision → Why-it-matters arc instead.
