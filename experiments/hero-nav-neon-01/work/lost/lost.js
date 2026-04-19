// lost & endangered

/* ── scroll-reveal: section eyebrows + titles fade-up once on entry ── */
{
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

  const selectors = [
    '.lost-eyebrow',
    '.lost-h2',
    '.lost-insight__title',
    '.lost-insight__sub',
    '.lost-trailer__stat',
    '.lost-trailer__copy',
    '.lost-trailer__kicker',
    '.lost-kauai__title',
    '.lost-kauai__meta',
    '.lost-kauai__pair',
    '.lost-kauai__quote',
    '.lost-kauai__outro',
    '.lost-kauai__player',
    '.lost-kauai__fig',
    '.lost-reflect__close',
    '.lost-reflect__fig',
    '.lost-summary'
  ];
  document.querySelectorAll(selectors.join(',')).forEach((el, i) => {
    el.classList.add('lost-reveal');
    if (i % 3 === 1) el.classList.add('lost-reveal--delay-1');
    if (i % 3 === 2) el.classList.add('lost-reveal--delay-2');
    io.observe(el);
  });
}

/* ── decode effect: scramble → resolve per character
   wraps each letter in a span, cycles through random latin chars
   for a short window, lands at a staggered time. used on
   - the hero "extinction" (triggered once after preloader settles)
   - the summary labels (triggered on row hover) */
const DECODE_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+·*';

function decodeWord(el, { stagger = 45, cycles = 8, cycleMs = 38 } = {}) {
  if (!el || el.dataset.decoding === '1') return;
  const final = el.dataset.text || el.textContent.trim();
  el.dataset.decoding = '1';

  // build character spans once
  if (!el.querySelector('.lost-decode__char')) {
    el.textContent = '';
    for (const ch of final) {
      const s = document.createElement('span');
      s.className = 'lost-decode__char';
      s.dataset.final = ch;
      s.textContent = ch;
      el.appendChild(s);
    }
  }
  const chars = [...el.querySelectorAll('.lost-decode__char')];

  chars.forEach((span, idx) => {
    const delay = idx * stagger;
    const final = span.dataset.final;
    if (final === ' ') return;
    span.classList.add('lost-decode__char--scramble');
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      if (tick >= cycles + idx % 3) {
        span.textContent = final;
        span.classList.remove('lost-decode__char--scramble');
        clearInterval(id);
      } else {
        span.textContent = DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
      }
    }, cycleMs);
    setTimeout(() => {}, delay);
  });

  setTimeout(() => { el.dataset.decoding = '0'; }, chars.length * stagger + cycles * cycleMs + 200);
}

/* hero extinction — decode once after preloader settles (~5.5s for new 5.2s video) */
{
  const heroDecode = document.querySelector('.lost-hero__title .lost-decode');
  if (heroDecode) {
    // prepare spans immediately so layout is stable
    const final = heroDecode.dataset.text || heroDecode.textContent.trim();
    heroDecode.textContent = '';
    for (const ch of final) {
      const s = document.createElement('span');
      s.className = 'lost-decode__char';
      s.dataset.final = ch;
      s.textContent = ch;
      heroDecode.appendChild(s);
    }
    setTimeout(() => decodeWord(heroDecode), 5500);
  }
}

/* summary labels — decode each on hover */
{
  document.querySelectorAll('.lost-summary__row').forEach(row => {
    const label = row.querySelector('.lost-decode');
    if (!label) return;
    row.addEventListener('pointerenter', () => decodeWord(label, { stagger: 30, cycles: 6, cycleMs: 34 }));
  });
}

/* ── soundscape composer preview: short audio loop on click ── */
{
  const cBtn = document.getElementById('composerPlay');
  const cAudio = document.getElementById('composerAudio');
  const cLabel = cBtn?.querySelector('.lost-play__label');
  if (cBtn && cAudio && cLabel) {
    const set = (p) => {
      cBtn.classList.toggle('is-playing', p);
      cBtn.setAttribute('aria-pressed', String(p));
      cLabel.textContent = p ? 'listening...' : 'press play to hear a soundscape in motion';
    };
    cBtn.addEventListener('click', () => {
      if (cAudio.paused) {
        cAudio.currentTime = 0;
        cAudio.play().then(() => set(true)).catch(() => set(false));
      } else {
        cAudio.pause();
        set(false);
      }
    });
    cAudio.addEventListener('ended', () => set(false));
    cAudio.addEventListener('pause', () => set(false));
  }
}

/* ── immersive listening room: video + audio for Kaua'i ────
   first click: stage opens + video plays with audio + section hushes
   video ends: section un-hushes but stage STAYS, parked on last frame
   second click: replay from the top */
const playBtn = document.getElementById('kauaiPlay');
const video = document.getElementById('kauaiVideo');
const label = playBtn?.querySelector('.lost-play__label');
const stage = document.getElementById('kauaiStage');
const section = document.getElementById('kauai');

if (playBtn && video && label && stage && section) {
  const setPlaying = (playing) => {
    playBtn.classList.toggle('is-playing', playing);
    playBtn.setAttribute('aria-pressed', String(playing));
    section.classList.toggle('is-listening', playing);
    label.textContent = playing
      ? 'listening...'
      : (stage.classList.contains('is-armed')
          ? 'press play to listen again'
          : 'press play to enter the listening room');
  };

  playBtn.addEventListener('click', () => {
    // first click reveals the stage permanently
    if (!stage.classList.contains('is-armed')) stage.classList.add('is-armed');

    if (video.paused) {
      video.currentTime = 0;
      video.muted = false;
      video.play().then(() => setPlaying(true)).catch(() => {
        // autoplay w/ audio may be blocked -- retry muted so the visual still lands
        video.muted = true;
        video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      });
    } else {
      video.pause();
      setPlaying(false);
    }
  });

  video.addEventListener('ended', () => setPlaying(false));
  video.addEventListener('pause', () => setPlaying(false));
}
