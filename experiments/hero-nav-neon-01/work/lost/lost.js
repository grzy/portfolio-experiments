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

/* ── interactive EKG waveform: the spike drifts with scroll position
   and jitters subtly as the user moves through the insight section.
   scroll position inside the section controls the spike's x-anchor
   and a tiny randomized stutter on the crest amplitudes. */
{
  const wave = document.getElementById('insightWave');
  const path = document.getElementById('insightWavePath');
  const section = document.getElementById('insight');
  if (wave && path && section) {
    let ticking = false;
    const buildPath = (anchor, jitter = 0) => {
      // baseline flat, then a cluster of spikes around `anchor`, then flat again
      const spikes = [
        [anchor - 60, 40],
        [anchor - 40, 10 + jitter * 8],
        [anchor - 20, 68 - jitter * 6],
        [anchor,      22 + jitter * 10],
        [anchor + 20, 54 - jitter * 4],
        [anchor + 40, 36 + jitter * 6],
        [anchor + 60, 44 - jitter * 5],
        [anchor + 80, 40]
      ];
      let d = `M0 40 L ${anchor - 80} 40`;
      for (const [x, y] of spikes) d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      d += ` L 1200 40`;
      return d;
    };

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      // 0 = section just entered bottom of viewport, 1 = section just left top
      const p = 1 - Math.max(0, Math.min(1, (rect.top + rect.height * 0.5) / vh));
      // anchor x: drifts from 200 to 1000 across the scroll range
      const anchor = 200 + p * 800;
      // small stochastic jitter when user is actively scrolling
      const jitter = (Math.random() - 0.5);
      path.setAttribute('d', buildPath(anchor, jitter));
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    // also nudge the jitter a few times per second while visible for life
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        wave.dataset.inview = e.isIntersecting ? '1' : '0';
      }
    }, { threshold: 0.15 });
    io.observe(section);

    setInterval(() => {
      if (wave.dataset.inview === '1') update();
    }, 180);

    update();
  }
}

/* ── eyebrow phrase glitch: "case story" <-> "case study" ───────────
   timing:
     1) wait ~9s after page load — lets the preloader video settle and
        the "extinction" decode finish, plus 2s of breathing room
     2) fire one delayed reveal swap so the reader sees the toggle exists
     3) from then on, each mouseenter on the hero grid fires one swap
        (no continuous loop — single glitch per hover entry) */
{
  const trigger = document.querySelector('.lost-hero__grid');
  const phrase = document.querySelector('.lost-eyebrow--story .lost-eyebrow__phrase');
  if (trigger && phrase) {
    const a = phrase.dataset.a || phrase.textContent.trim();
    const b = phrase.dataset.b || a;
    let isB = false;
    let armed = false;
    let inFlight = false;
    // seed data-text so the chromatic ghost has something to render before the first swap
    phrase.dataset.text = a;
    const swap = () => {
      if (inFlight) return;
      inFlight = true;
      const next = isB ? a : b;
      // update data-text to the upcoming word so the ghost previews it
      phrase.dataset.text = next;
      phrase.classList.add('is-flipped');
      setTimeout(() => {
        phrase.textContent = next;
        isB = !isB;
      }, 200);
      setTimeout(() => {
        phrase.classList.remove('is-flipped');
        inFlight = false;
      }, 720);
    };
    setTimeout(() => {
      swap();
      armed = true;
    }, 9000);
    trigger.addEventListener('mouseenter', () => {
      if (armed) swap();
    });
  }
}

/* ── seed data-text on every .lost-mark so the chromatic glitch can
   render on hover without manually annotating each <u> in the html ── */
{
  document.querySelectorAll('.lost-mark').forEach((el) => {
    if (!el.dataset.text) el.dataset.text = el.textContent;
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

/* tease-and-restore: scramble the word, briefly reveal a tease string
   centered within the original (edges stay scrambled), then scramble
   again and resolve back to the original. used on the hero "extinction"
   to flicker "lost" in the middle of the chars and snap back. */
function teaseAndRestore(el, teaseText, finalText, opts = {}) {
  const { holdMs = 700, scrambleMs = 480, cycleMs = 38, cycles = 8 } = opts;
  if (!el || el.dataset.decoding === '1') return;
  el.dataset.decoding = '1';

  const chars = [...el.querySelectorAll('.lost-decode__char')];
  const len = chars.length;

  // figure out where the tease text lands inside the original char count
  const teaseLen = teaseText.length;
  const padding = Math.max(0, Math.floor((len - teaseLen) / 2));
  const teaseAt = (i) => {
    if (i >= padding && i < padding + teaseLen) return teaseText[i - padding];
    return null;
  };

  // phase 1 -- scramble all chars for scrambleMs
  chars.forEach(span => span.classList.add('lost-decode__char--scramble'));
  const tickAll = setInterval(() => {
    chars.forEach(span => {
      span.textContent = DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
    });
  }, cycleMs);

  // phase 2 -- after scrambleMs, lock the centered tease, keep edges flickering
  setTimeout(() => {
    clearInterval(tickAll);
    chars.forEach((span, i) => {
      const t = teaseAt(i);
      if (t !== null) {
        span.textContent = t;
        span.classList.remove('lost-decode__char--scramble');
      }
    });
    // keep edges flickering quietly during the hold
    const tickEdges = setInterval(() => {
      chars.forEach((span, i) => {
        if (teaseAt(i) === null) {
          span.textContent = DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
        }
      });
    }, cycleMs * 1.5);

    // phase 3 -- after holdMs, scramble + resolve back to finalText
    setTimeout(() => {
      clearInterval(tickEdges);
      chars.forEach((span, idx) => {
        const targetCh = finalText[idx] || '';
        if (targetCh === ' ') return;
        span.classList.add('lost-decode__char--scramble');
        let tick = 0;
        const id = setInterval(() => {
          tick++;
          if (tick >= cycles + idx % 3) {
            span.textContent = targetCh;
            span.classList.remove('lost-decode__char--scramble');
            clearInterval(id);
          } else {
            span.textContent = DECODE_CHARS[Math.floor(Math.random() * DECODE_CHARS.length)];
          }
        }, cycleMs);
      });
      setTimeout(() => { el.dataset.decoding = '0'; }, cycles * cycleMs + 200);
    }, holdMs);
  }, scrambleMs);
}

/* hero extinction — decode once after preloader settles (~5.5s) and stop */
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

/* hero meta labels — decode each on hover (scope glitches Role/Tools/Scope) */
{
  document.querySelectorAll('.lost-meta > div').forEach(row => {
    const label = row.querySelector('.lost-decode');
    if (!label) return;
    row.addEventListener('pointerenter', () => decodeWord(label, { stagger: 30, cycles: 6, cycleMs: 34 }));
  });
}

/* reflection close lines: nothing JS-driven now -- the --alt line
   has a CSS breathe animation; the base line just reads quiet */

/* ── soundscape composer preview: short audio loop on click ── */
{
  const cBtn = document.getElementById('composerPlay');
  const cAudio = document.getElementById('composerAudio');
  const cLabel = cBtn?.querySelector('.lost-play__label');
  if (cBtn && cAudio && cLabel) {
    const set = (p) => {
      cBtn.classList.toggle('is-playing', p);
      cBtn.setAttribute('aria-pressed', String(p));
      cLabel.textContent = p ? 'Listening...' : 'Press play to hear a soundscape in motion';
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
      ? 'Listening...'
      : 'Press play to enter the listening room';
  };

  playBtn.addEventListener('click', () => {
    // each click arms the stage, plays, and stage disappears again when done
    stage.classList.add('is-armed');

    if (video.paused) {
      video.currentTime = 0;
      video.muted = false;
      video.play().then(() => setPlaying(true)).catch(() => {
        video.muted = true;
        video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      });
    } else {
      video.pause();
      setPlaying(false);
      stage.classList.remove('is-armed');
    }
  });

  video.addEventListener('ended', () => {
    setPlaying(false);
    stage.classList.remove('is-armed');
  });
  video.addEventListener('pause', () => setPlaying(false));
}
