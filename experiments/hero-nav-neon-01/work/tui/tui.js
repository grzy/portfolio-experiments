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
