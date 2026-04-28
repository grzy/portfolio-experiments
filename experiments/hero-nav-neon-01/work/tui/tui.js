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

/* ── screen state machine ────────────────────────────────── */
const screens = document.querySelectorAll('.tui-screen');
function goTo(n) {
  screens.forEach((s) => s.classList.toggle('is-active', s.dataset.screen === String(n)));
  cabin && cabin.setAttribute('data-screen', String(n));
  if (n === 6) startSuccess();
}

/* B1 orb → B2 (replaces "talk" speech for now per Ivy's deferral note) */
if (orb) orb.addEventListener('click', () => setTimeout(() => goTo(2), 320));

/* B2 cards: only Nourish advances on the demo path; others give a tiny
   shake hint so they feel responsive without forking the demo. */
document.querySelectorAll('[data-activity]').forEach((card) => {
  card.addEventListener('click', () => {
    const a = card.dataset.activity;
    if (a === 'nourish') goTo(3);
    else { card.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }],
      { duration: 240, easing: 'ease-in-out' }
    ); }
  });
});

/* B3 sub-cards: Bakery advances; others shake. */
document.querySelectorAll('[data-sub]').forEach((sub) => {
  sub.addEventListener('click', () => {
    if (sub.dataset.sub === 'bakery') { setCabinState('press'); setTimeout(() => goTo(4), 320); }
    else sub.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-2px)' }, { transform: 'translateX(2px)' }, { transform: 'translateX(0)' }],
      { duration: 200, easing: 'ease-in-out' }
    );
  });
});

/* B4 buttons → B5 */
const yesMap = document.getElementById('tuiYesMap');
const noMap  = document.getElementById('tuiNoMap');
if (yesMap) yesMap.addEventListener('click', () => { setCabinState('press'); setTimeout(() => goTo(5), 280); });
if (noMap)  noMap.addEventListener('click',  () => goTo(5));

/* B5 slider is part of the Figma background image — no live overlay.
   we just pulse the cabin halo during the dwell so something feels live. */
const sliderScreen = document.querySelector('.tui-screen--slider');

/* ── autoplay sequence — the prototype demos itself ──────
   Hiring manager scrolls past, watches the whole bakery flow
   without lifting a finger. User clicks act as optional "skips":
   they advance the sequence early; autoplay resumes from there. */
const AUTO_STEPS = [
  { screen: 1, dwell: 2600 },
  { screen: 2, dwell: 2600 },
  { screen: 3, dwell: 2800 },
  { screen: 4, dwell: 2400 },
  { screen: 5, dwell: 3400, action: animateSliderDrag },
  { screen: 6, dwell: 4200 },
];
let autoIdx = 0;
let autoTimer = null;

function autoTick() {
  const step = AUTO_STEPS[autoIdx];
  goTo(step.screen);
  if (step.action) setTimeout(step.action, 500);
  clearTimeout(autoTimer);
  autoTimer = setTimeout(() => {
    autoIdx = (autoIdx + 1) % AUTO_STEPS.length;
    autoTick();
  }, step.dwell);
}

function animateSliderDrag() {
  /* cabin halo pulse during the slider screen dwell so it feels live
     even though the slider visual is static in the bg image. */
  setCabinState('drag');
  setTimeout(() => setCabinState('', 0), 2400);
}

/* user interaction skips: advance the sequence early. clicks on
   demo-path buttons fast-forward; autoplay continues from the new
   index next tick. */
function jumpToScreen(n) {
  const i = AUTO_STEPS.findIndex(s => s.screen === n);
  if (i >= 0) autoIdx = i;
  clearTimeout(autoTimer);
  autoTick();
}

/* override the manual goTo handlers from earlier so they call
   jumpToScreen instead — keeps autoplay in sync. */
if (orb) orb.replaceWith(orb.cloneNode(true));
const orbEl = document.getElementById('tuiTalkOrb');
if (orbEl) orbEl.addEventListener('click', () => jumpToScreen(2));
document.querySelectorAll('[data-activity="nourish"]').forEach(el =>
  el.addEventListener('click', (e) => { e.stopImmediatePropagation(); jumpToScreen(3); }, true));
document.querySelectorAll('[data-sub="bakery"]').forEach(el =>
  el.addEventListener('click', (e) => { e.stopImmediatePropagation(); jumpToScreen(4); }, true));
const yesEl = document.getElementById('tuiYesMap');
if (yesEl) yesEl.addEventListener('click', (e) => { e.stopImmediatePropagation(); jumpToScreen(5); }, true);

/* kick off autoplay when the dashboard scrolls into view. once started,
   it runs forever (cheap timers, no rAF unless slider is animating). */
const dashEl = document.getElementById('tuiDash');
let autoStarted = false;
if (dashEl && 'IntersectionObserver' in window) {
  const dashIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !autoStarted) {
        autoStarted = true;
        autoTick();
      }
    });
  }, { threshold: 0.3 });
  dashIO.observe(dashEl);
} else if (dashEl) {
  autoStarted = true; autoTick();
}

/* ── confetti — particles ARE the activity icons from the Figma sprite.
   they rain DOWN from above the dashboard, not bunched in the middle. */
const canvas = document.getElementById('tuiConfetti');
const ctx = canvas && canvas.getContext('2d');

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

let confettiState = { active: false, particles: [], raf: 0, started: 0 };

function sizeCanvas() {
  if (!canvas) return;
  const r = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = r.width  * dpr;
  canvas.height = r.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function startSuccess() {
  if (!canvas || !ctx) return;
  setCabinState('flash', 280);
  setTimeout(() => setCabinState('press', 700), 280);
  setTimeout(() => setCabinState('', 0), 1100);

  sizeCanvas();
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
window.addEventListener('resize', () => { if (confettiState.active) sizeCanvas(); });
