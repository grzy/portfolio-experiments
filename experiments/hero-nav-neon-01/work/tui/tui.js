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

/* sub-cards on B3 / B7 / B10 → confirm or slider depending on flow */
document.querySelectorAll('[data-sub]').forEach((sub) => {
  sub.addEventListener('click', () => {
    setCabinState('press');
    setTimeout(() => setCabinState('', 0), 600);
    if (currentFlow === 'bakery')   setTimeout(() => goTo(4), 280);
    else if (currentFlow === 'dogpark') setTimeout(() => goTo(8), 280);
    else if (currentFlow === 'birdsong') setTimeout(() => goTo(5), 280);
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

/* B5 click → success screen for the current flow */
const sliderScreenEl = document.querySelector('.tui-screen--slider');
if (sliderScreenEl) {
  sliderScreenEl.addEventListener('click', () => {
    setCabinState('drag');
    setTimeout(() => setCabinState('', 0), 600);
    const target = currentFlow === 'bakery' ? 6
                : currentFlow === 'dogpark' ? 9
                : 11;
    setTimeout(() => goTo(target), 320);
  });
}

/* any success screen → click to restart at B1 */
document.querySelectorAll('.tui-screen--success').forEach((scr) => {
  scr.addEventListener('click', () => goTo(1));
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

const spriteImg = new Image();
spriteImg.src = 'assets/confetti-icons-sprite.png';
let spriteReady = false;
spriteImg.addEventListener('load', () => { spriteReady = true; });

let confettiState = { active: false, particles: [], raf: 0, started: 0, canvas: null, ctx: null };

function sizeCanvas(canvas, ctx) {
  if (!canvas) return;
  const r = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = r.width  * dpr;
  canvas.height = r.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

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
  /* spawn 44 pieces spread across the top, each falling at slight angle */
  confettiState.particles = Array.from({ length: 44 }, () => {
    const coord = ICON_COORDS[Math.floor(Math.random() * ICON_COORDS.length)];
    return {
      x: Math.random() * r.width,
      y: -60 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 1.5 + Math.random() * 1.5,
      rot: (Math.random() - 0.5) * 0.4,
      vrot: (Math.random() - 0.5) * 0.06,
      coord,
      size: 26 + Math.random() * 18,
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
  const fadeStart = 3000;
  const fadeEnd   = 4000;

  confettiState.particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.rot += p.vrot;

    if (spriteReady) {
      const [sx, sy, sw, sh] = p.coord;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = elapsed > fadeStart ? Math.max(0, 1 - (elapsed - fadeStart) / (fadeEnd - fadeStart)) : 1;
      ctx.drawImage(
        spriteImg,
        sx, sy, sw, sh,
        -p.size / 2, -p.size / 2, p.size, p.size
      );
      ctx.restore();
    }
  });

  if (elapsed < fadeEnd) confettiState.raf = requestAnimationFrame(tickConfetti);
  else { confettiState.active = false; ctx.clearRect(0, 0, r.width, r.height); }
}
window.addEventListener('resize', () => {
  if (confettiState.active) sizeCanvas(confettiState.canvas, confettiState.ctx);
});
