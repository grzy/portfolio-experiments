/* ✺ tui.js — case story page interactions
   Phase 1: cabin-light bleed states, Talk-to-Tūī orb press, scroll reveals.
   Later phases will add: full screen state machine, slider, confetti,
   Web Speech API, glow-in-the-dark theme toggle, glitch effects. */

const cabin = document.querySelector('.tui-cabin');
const orb   = document.getElementById('tuiTalkOrb');

/* drive the cabin-light bleed via data-state. */
function setCabinState(state, holdMs) {
  if (!cabin) return;
  cabin.dataset.state = state;
  if (holdMs) {
    clearTimeout(setCabinState._t);
    setCabinState._t = setTimeout(() => { cabin.dataset.state = ''; }, holdMs);
  }
}

/* Talk-to-Tūī orb: press triggers a soft bleed pulse outward.
   Phase 3 will hook this to the Web Speech API. */
if (orb) {
  orb.addEventListener('pointerdown', () => setCabinState('press'));
  orb.addEventListener('pointerup',   () => setCabinState('', 0));
  orb.addEventListener('pointerleave',() => setCabinState('', 0));
  orb.addEventListener('click', () => {
    setCabinState('flash', 220);
    setTimeout(() => setCabinState('press', 600), 240);
    setTimeout(() => setCabinState('', 0), 900);
  });
}

/* scroll reveals — same pattern as lost.js, narrowed to .tui-reveal */
const revealTargets = document.querySelectorAll(
  '.tui-reveal, .tui-eyebrow, .tui-h2, .tui-problem__lede, .tui-problem__stat'
);
if ('IntersectionObserver' in window && revealTargets.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
  revealTargets.forEach((el) => {
    el.classList.add('tui-reveal');
    io.observe(el);
  });
}

/* hero scroll-fade text: as user scrolls down through the hero,
   fade the title block out so the cabin/dashboard becomes the focal point. */
const heroText = document.querySelector('.tui-hero__text');
if (heroText) {
  const onScroll = () => {
    const y = window.scrollY;
    const h = window.innerHeight;
    const progress = Math.min(Math.max(y / (h * 0.6), 0), 1);
    heroText.style.opacity = String(1 - progress);
    heroText.style.transform = `translateY(${progress * -24}px)`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* tiny "I'm alive" nudge for the cabin-light bleed when the page first
   becomes visible — quick brighten then settle, so the user notices it
   without it being aggressive. */
if (cabin) {
  requestAnimationFrame(() => {
    setCabinState('press');
    setTimeout(() => setCabinState('', 0), 900);
  });
}

/* ── three-flow state machine ─────────────────────────────
   Bakery: 1 → 2 → 3 → 4 → 5 → 6 (confetti success)
   Dog Park: 1 → 2 → 7 → 8 → 5 → 9 (confetti success)
   Birdsong: 1 → 2 → 10 → 5 → 11 (no confetti; quiet ending)
   Click anywhere on success screen to restart. */
const screens = document.querySelectorAll('.tui-screen');
let currentFlow = 'bakery';
const SUCCESS_SCREENS = ['6', '9', '11'];

function goTo(n) {
  screens.forEach((s) => s.classList.toggle('is-active', s.dataset.screen === String(n)));
  cabin && cabin.setAttribute('data-screen', String(n));
  if (SUCCESS_SCREENS.includes(String(n))) startSuccess();
  if (String(n) === '5' && typeof resetSlider === 'function') resetSlider();
  if (typeof updateNavState === 'function') updateNavState();
  /* B1 has a 4.5s safety auto-advance so a passive viewer never gets
     stuck — gives time to read the greet + question. cleared on any
     other transition. */
  clearTimeout(b1Timer);
  if (String(n) === '1') {
    b1Timer = setTimeout(() => {
      if (document.querySelector('.tui-screen.is-active')?.dataset.screen === '1') goTo(2);
    }, 4500);
  }
}
let b1Timer = null;

/* B1 orb → B2 (Talk-to-Tūī demo path; speech wiring deferred) */
if (orb) orb.addEventListener('click', () => setTimeout(() => goTo(2), 320));

/* kick off the B1 timer once when the dashboard first scrolls into view */
const dashEl = document.getElementById('tuiDash');
if (dashEl && 'IntersectionObserver' in window) {
  let started = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !started) {
        started = true;
        b1Timer = setTimeout(() => {
          if (document.querySelector('.tui-screen.is-active')?.dataset.screen === '1') goTo(2);
        }, 4500);
      }
    });
  }, { threshold: 0.4 });
  io.observe(dashEl);
}

/* B2: pick an activity → branch into the matching flow */
document.querySelectorAll('[data-activity]').forEach((card) => {
  card.addEventListener('click', () => {
    const a = card.dataset.activity;
    setCabinState('press');
    setTimeout(() => setCabinState('', 0), 600);
    if (a === 'nourish') { currentFlow = 'bakery';   setTimeout(() => goTo(3),  280); }
    else if (a === 'outside') { currentFlow = 'dogpark';  setTimeout(() => goTo(7),  280); }
    else if (a === 'listen')  { currentFlow = 'birdsong'; setTimeout(() => goTo(10), 280); }
  });
});

/* sub-cards on B3 / B7 / B10 / B12 → confirm or slider, depending on flow */
function advanceSubCards() {
  setCabinState('press');
  setTimeout(() => setCabinState('', 0), 600);
  if (currentFlow === 'bakery')        setTimeout(() => goTo(4), 280);
  else if (currentFlow === 'dogpark')  setTimeout(() => goTo(8), 280);
  else if (currentFlow === 'birdsong') setTimeout(() => goTo(5), 280);
}
document.querySelectorAll('[data-sub]').forEach((sub) => {
  sub.addEventListener('click', (e) => { e.stopPropagation(); advanceSubCards(); });
});
/* +-sign on Dog Park 3 → expand to the 12-card grid (B12) */
document.querySelectorAll('[data-plus="dogpark"]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    setCabinState('press');
    setTimeout(() => setCabinState('', 0), 500);
    setTimeout(() => goTo(12), 220);
  });
});
/* click anywhere on B3 / B7 / B10 / B12 also advances (catches the
   +-sign on flows where it's not yet wired, and the visual gaps) */
['3', '7', '10', '12'].forEach((n) => {
  const screen = document.querySelector(`.tui-screen[data-screen="${n}"]`);
  if (screen) screen.addEventListener('click', (e) => {
    if (e.target.closest('[data-sub], [data-plus]')) return;
    advanceSubCards();
  });
});

/* B4 / B8 "Yes, send a map" buttons → slider (B5) */
document.querySelectorAll('[data-yes], #tuiYesMap').forEach((btn) => {
  btn.addEventListener('click', () => {
    setCabinState('press');
    setTimeout(() => goTo(5), 280);
  });
});

/* B5 slider is part of the Figma background image — no live overlay.
   we just pulse the cabin halo during the dwell so something feels live. */
const sliderScreen = document.querySelector('.tui-screen--slider');

/* ── interactive flow — user clicks each step ──────────────
   No autoplay. The user picks an activity, picks a sub-option,
   confirms, "drags" the slider (tap to advance), and lands on
   success. Three flows branch at B2: Nourish → Bakery, Outside →
   Dog Park, Listen → Birdsong. Tap success screen to start over. */

/* ── B5 slider with REAL drag interaction ──────────────────
   pointer down on the track grabs + jumps to that position. drag
   to scrub. release at desired value → cabin halo fades, screen
   advances to success after a short pause. like a real slider, not
   a one-shot animation. */
const sliderScreenEl = document.querySelector('.tui-screen--slider');
const sliderTrackEl  = document.querySelector('.tui-slider-track');
let sliderDragging = false;
let sliderReleaseTimer = null;

function syncSlider(pct) {
  const fill = document.getElementById('tuiSliderFill');
  const knob = document.getElementById('tuiSliderKnob');
  const pctEl = document.getElementById('tuiSliderPct');
  const v = Math.max(0, Math.min(100, pct));
  if (fill)  fill.style.width = v + '%';
  if (knob)  knob.style.left  = v + '%';
  if (pctEl) pctEl.textContent = Math.round(v) + '%';
}

function pointerToValue(e) {
  const rect = sliderTrackEl.getBoundingClientRect();
  const x = (e.clientX || (e.touches && e.touches[0].clientX) || 0) - rect.left;
  return Math.max(0, Math.min(100, (x / rect.width) * 100));
}

function scheduleAdvance() {
  clearTimeout(sliderReleaseTimer);
  sliderReleaseTimer = setTimeout(() => {
    if (sliderDragging) return;
    const target = currentFlow === 'bakery' ? 6 : currentFlow === 'dogpark' ? 9 : 11;
    goTo(target);
  }, 1500);  // give user time to see their pick before advancing
}

if (sliderTrackEl) {
  sliderTrackEl.addEventListener('pointerdown', (e) => {
    sliderDragging = true;
    sliderScreenEl.classList.add('is-dragging');
    setCabinState('drag');
    syncSlider(pointerToValue(e));
    sliderTrackEl.setPointerCapture(e.pointerId);
    clearTimeout(sliderReleaseTimer);
    e.preventDefault();
  });
  sliderTrackEl.addEventListener('pointermove', (e) => {
    if (sliderDragging) syncSlider(pointerToValue(e));
  });
  const release = (e) => {
    if (!sliderDragging) return;
    sliderDragging = false;
    sliderScreenEl.classList.remove('is-dragging');
    setCabinState('', 0);
    scheduleAdvance();
    try { sliderTrackEl.releasePointerCapture(e.pointerId); } catch {}
  };
  sliderTrackEl.addEventListener('pointerup', release);
  sliderTrackEl.addEventListener('pointercancel', release);
}

/* reset slider to 10% whenever the user (re-)enters B5 */
function resetSlider() {
  syncSlider(10);
  clearTimeout(sliderReleaseTimer);
  sliderDragging = false;
  sliderScreenEl && sliderScreenEl.classList.remove('is-dragging');
}

/* any success screen → click to restart at B1 */
document.querySelectorAll('.tui-screen--success').forEach((scr) => {
  scr.addEventListener('click', () => goTo(1));
});

/* ── back / forward navigation arrows ────────────────────
   each flow has a known sequence of screen IDs. arrows step
   backwards or forwards through that sequence. */
const FLOWS = {
  bakery:   [1, 2, 3, 4, 5, 6],
  dogpark:  [1, 2, 7, 12, 8, 5, 9],   // 12 = expanded grid (after +-tap)
  birdsong: [1, 2, 10, 5, 11],
};
function currentFlowSeq() { return FLOWS[currentFlow] || FLOWS.bakery; }
function currentScreenIdx() {
  const cur = +document.querySelector('.tui-screen.is-active')?.dataset.screen;
  return currentFlowSeq().indexOf(cur);
}
function updateNavState() {
  const seq = currentFlowSeq();
  const i = currentScreenIdx();
  const back = document.getElementById('tuiNavBack');
  const fwd  = document.getElementById('tuiNavForward');
  if (back) back.toggleAttribute('disabled', i <= 0);
  if (fwd)  fwd.toggleAttribute('disabled',  i < 0 || i >= seq.length - 1);
}
const navBack = document.getElementById('tuiNavBack');
const navFwd  = document.getElementById('tuiNavForward');
if (navBack) navBack.addEventListener('click', (e) => {
  e.stopPropagation();
  const seq = currentFlowSeq();
  const i = currentScreenIdx();
  if (i > 0) goTo(seq[i - 1]);
});
if (navFwd) navFwd.addEventListener('click', (e) => {
  e.stopPropagation();
  const seq = currentFlowSeq();
  const i = currentScreenIdx();
  if (i >= 0 && i < seq.length - 1) goTo(seq[i + 1]);
});

/* ── confetti — particles ARE the activity icons from the Figma sprite.
   they rain DOWN from above the dashboard, not bunched in the middle.
   each success screen has its own canvas; we fire on whichever is active. */

/* sprite: 1024×192 PNG containing all the activity icons in 3 rows.
   coordinates are in ORIGINAL Figma units (1893 wide × 354 tall),
   we scale them to the rendered sprite dimensions at draw time. */
const SPRITE_SRC_W = 1893;
const SPRITE_SRC_H = 354;
const ICON_COORDS = [
  // row 1 — sound icons
  [29, 23, 90, 90],   [155, 23, 90, 90],  [281, 23, 90, 90],  [421, 23, 90, 90],
  [577, 46, 90, 90],  [733, 23, 90, 90],  [873, 23, 90, 90],
  // row 2 — weather + nature
  [29, 136, 90, 90],  [173, 136, 90, 90], [317, 136, 90, 90], [455, 136, 90, 90],
  [577, 136, 90, 90], [688, 136, 90, 90], [810, 132, 90, 90],
  [1297, 19, 90, 90], [1424, 19, 90, 90], [1540, 23, 90, 90], [1656, 19, 90, 90],
  [1772, 19, 90, 90], [1308, 130, 90, 90],[1424, 132, 90, 90],[1540, 130, 90, 90],
  [1656, 136, 90, 90],[1772, 136, 90, 90],
  // row 3 — outdoor + adventure
  [421, 249, 90, 90], [632, 249, 90, 90], [733, 245, 90, 90], [834, 245, 90, 90],
  [936, 245, 90, 90], [1057, 245, 90, 90],[1424, 245, 90, 90],[1540, 237, 90, 90],
  [1654, 245, 90, 90],[1789, 245, 90, 90],
];

/* sprite preprocessor: load the icon sheet, then walk the pixels and
   knock out white backgrounds so each icon is a clean black silhouette
   on transparent. drawImage on the resulting canvas blends naturally. */
const spriteImg = new Image();
spriteImg.src = 'assets/confetti-icons-sprite.png';
let spriteReady = false;
let spriteCanvas = null;
spriteImg.addEventListener('load', () => {
  const off = document.createElement('canvas');
  off.width = spriteImg.naturalWidth;
  off.height = spriteImg.naturalHeight;
  const offCtx = off.getContext('2d');
  offCtx.drawImage(spriteImg, 0, 0);
  const imgData = offCtx.getImageData(0, 0, off.width, off.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    if (r > 225 && g > 225 && b > 225) data[i+3] = 0;  // knock out near-white
  }
  offCtx.putImageData(imgData, 0, 0);
  spriteCanvas = off;
  spriteReady = true;
});

let confettiState = { active: false, particles: [], raf: 0, started: 0, canvas: null, ctx: null };

function sizeCanvas(canvas, ctx) {
  if (!canvas) return;
  const r = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = r.width  * dpr;
  canvas.height = r.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/* brand colors used as confetti pieces (majority) */
const BRAND_COLORS = ['#dfff00', '#3671c7']; // Lichen, Electric Blue
/* shape kinds: square (slim rectangle), circle, triangle */
const SHAPE_KINDS = ['rect', 'circle', 'tri'];

function startSuccess() {
  setCabinState('flash', 280);
  setTimeout(() => setCabinState('press', 700), 280);
  setTimeout(() => setCabinState('', 0), 1100);

  /* find the canvas inside the currently-active success screen.
     birdsong success has no canvas — the listening IS the celebration. */
  const canvas = document.querySelector('.tui-screen.is-active .tui-confetti');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  confettiState.canvas = canvas;
  confettiState.ctx = ctx;

  sizeCanvas(canvas, ctx);
  const r = canvas.getBoundingClientRect();
  /* mix: ~70% brand-color shapes (Lichen + Electric), ~30% activity
     icons drawn from the white-stripped sprite so each piece is just
     the black silhouette. */
  confettiState.particles = Array.from({ length: 60 }, () => {
    const isShape = Math.random() < 0.70;
    return {
      x: Math.random() * r.width,
      y: -60 - Math.random() * 240,
      vx: (Math.random() - 0.5) * 0.9,
      vy: 0.7 + Math.random() * 0.9,
      rot: (Math.random() - 0.5) * 0.5,
      vrot: (Math.random() - 0.5) * 0.04,
      kind: isShape ? 'shape' : 'icon',
      coord: isShape ? null : ICON_COORDS[Math.floor(Math.random() * ICON_COORDS.length)],
      color: isShape ? BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)] : null,
      shape: isShape ? SHAPE_KINDS[Math.floor(Math.random() * SHAPE_KINDS.length)] : null,
      size: isShape ? 8 + Math.random() * 14 : 22 + Math.random() * 14,
      stretch: isShape ? 1 + Math.random() * 2 : 1,
    };
  });
  confettiState.active = true;
  confettiState.started = performance.now();
  cancelAnimationFrame(confettiState.raf);
  tickConfetti();
}

function tickConfetti() {
  if (!confettiState.active) return;
  const { canvas, ctx } = confettiState;
  if (!canvas || !ctx) return;
  const r = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, r.width, r.height);
  const elapsed = performance.now() - confettiState.started;
  const fadeStart = 5500;
  const fadeEnd   = 7000;

  confettiState.particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.018;          // very gentle gravity
    p.rot += p.vrot;

    const alpha = elapsed > fadeStart ? Math.max(0, 1 - (elapsed - fadeStart) / (fadeEnd - fadeStart)) : 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = alpha;

    if (p.kind === 'icon' && spriteReady && spriteCanvas) {
      const [sx, sy, sw, sh] = p.coord;
      ctx.drawImage(spriteCanvas, sx, sy, sw, sh, -p.size / 2, -p.size / 2, p.size, p.size);
    } else {
      ctx.fillStyle = p.color;
      const w = p.size, h = p.size * p.stretch;
      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'tri') {
        ctx.beginPath();
        ctx.moveTo(0, -h / 2);
        ctx.lineTo(w / 2, h / 2);
        ctx.lineTo(-w / 2, h / 2);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(-w / 2, -h / 2, w, h);
      }
    }
    ctx.restore();
  });

  if (elapsed < fadeEnd) confettiState.raf = requestAnimationFrame(tickConfetti);
  else { confettiState.active = false; ctx.clearRect(0, 0, r.width, r.height); }
}
window.addEventListener('resize', () => {
  if (confettiState.active) sizeCanvas(confettiState.canvas, confettiState.ctx);
});
