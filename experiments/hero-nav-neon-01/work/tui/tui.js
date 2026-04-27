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

/* B5 live slider overlay — drives DOM directly, no real <input>. */
const sliderFill = document.getElementById('tuiSliderFill');
const sliderKnob = document.getElementById('tuiSliderKnob');
const sliderPct  = document.getElementById('tuiSliderPct');
const sliderScreen = document.querySelector('.tui-screen--slider');

function syncSlider(val) {
  const pct = Math.max(0, Math.min(100, Math.round(val)));
  if (sliderFill) sliderFill.style.width = pct + '%';
  if (sliderKnob) sliderKnob.style.left  = pct + '%';
  if (sliderPct)  sliderPct.textContent  = pct + '%';
}

/* ── autoplay sequence — the prototype demos itself ──────
   Hiring manager scrolls past, watches the whole bakery flow
   without lifting a finger. User clicks act as optional "skips":
   they advance the sequence early; autoplay resumes from there. */
const AUTO_STEPS = [
  { screen: 1, dwell: 2600 },
  { screen: 2, dwell: 2600, before: () => glowCard('[data-activity="nourish"]') },
  { screen: 3, dwell: 2800, before: () => glowCard('[data-sub="bakery"]') },
  { screen: 4, dwell: 2400, before: () => glowCard('#tuiYesMap') },
  { screen: 5, dwell: 4200, action: animateSliderDrag },
  { screen: 6, dwell: 4200 },
];
let autoIdx = 0;
let autoTimer = null;

function glowCard(sel) {
  const el = document.querySelector(sel);
  if (!el) return;
  el.classList.add('is-auto-pick');
  setTimeout(() => el.classList.remove('is-auto-pick'), 700);
}

function autoTick() {
  const step = AUTO_STEPS[autoIdx];
  if (step.before) step.before();
  setTimeout(() => goTo(step.screen), 100);
  if (step.action) setTimeout(step.action, 600);
  clearTimeout(autoTimer);
  autoTimer = setTimeout(() => {
    autoIdx = (autoIdx + 1) % AUTO_STEPS.length;
    autoTick();
  }, step.dwell);
}

function animateSliderDrag() {
  const start = performance.now();
  const duration = 2200;
  const target = 80;
  syncSlider(0);
  sliderScreen && sliderScreen.classList.add('is-dragging');
  setCabinState('drag');
  const ease = (t) => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2;
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    syncSlider(ease(t) * target);
    if (t < 1) requestAnimationFrame(tick);
    else {
      sliderScreen && sliderScreen.classList.remove('is-dragging');
      setCabinState('', 0);
    }
  }
  requestAnimationFrame(tick);
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

/* ── confetti — particles ARE the activity icons ────────── */
const canvas = document.getElementById('tuiConfetti');
const ctx = canvas && canvas.getContext('2d');
const PIECES = ['🥐', '☕', '🌮', '🥡', '🛒', '🍜', '🐾', '🌲', '🎷', '🌧', '🔥', '🌊', '🎹', '🌳', '🛤'];
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
  confettiState.particles = Array.from({ length: 36 }, () => ({
    x: r.width * (0.45 + Math.random() * 0.1),
    y: -20 - Math.random() * 60,
    vx: (Math.random() - 0.5) * 6,
    vy: 2 + Math.random() * 3,
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.2,
    char: PIECES[Math.floor(Math.random() * PIECES.length)],
    size: 18 + Math.random() * 16,
    life: 0,
  }));
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
  confettiState.particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12;
    p.rot += p.vrot;
    p.life += 16;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.font = `${p.size}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = elapsed > 2200 ? Math.max(0, 1 - (elapsed - 2200) / 800) : 1;
    ctx.fillText(p.char, 0, 0);
    ctx.restore();
  });
  if (elapsed < 3200) confettiState.raf = requestAnimationFrame(tickConfetti);
  else { confettiState.active = false; ctx.clearRect(0, 0, r.width, r.height); }
}
window.addEventListener('resize', () => { if (confettiState.active) sizeCanvas(); });
