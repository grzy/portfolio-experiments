// ✺ neon specimen 01 — interactions
// cursor · hero title reveal · card 3d tilt · parallax orchid · scroll reveals

const lerp = (a, b, t) => a + (b - a) * t;

/* ── BLOOM (top of file so nothing can break it) ────────────────────
   Cursor Y over the viewport scrubs through 52 frames.
   Top of screen = closed. Bottom = fully bloomed.
   Only runs on pages that actually have a .hero__bloom element --
   subpages (about, work) skip the preload + ticker entirely.
─────────────────────────────────────────────────────────────────── */
if (document.querySelector(".hero__bloom")) {
  const FRAME_COUNT = 63;
  const pad = (n) => String(n).padStart(3, "0");
  const url = (i) => `/images/bloom/f${pad(i)}.jpg`;

  const preloaded = [];
  let loaded = 0;
  let ready = false;

  // preload all frames and wait for them to fully decode before enabling bloom
  for (let i = 1; i <= FRAME_COUNT; i++) {
    const im = new Image();
    im.src = url(i);
    im.onload = () => {
      loaded++;
      if (loaded >= FRAME_COUNT) ready = true;
    };
    preloaded.push(im);
  }

  let target = 0, current = 0, last = 0;

  const isTouch = matchMedia("(hover: none)").matches;

  if (isTouch) {
    const setFromScroll = () => {
      const hero = document.querySelector(".hero");
      if (!hero) return;
      const heroH = hero.offsetHeight || 1;
      target = Math.max(0, Math.min(1, window.scrollY / (heroH * 0.85)));
    };
    setFromScroll();
    window.addEventListener("scroll", setFromScroll, { passive: true });
    window.addEventListener("resize", setFromScroll);
  } else {
    const onMove = (e) => {
      const ny = e.clientY / window.innerHeight;
      target = Math.max(0, Math.min(1, ny));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
  }

  const tick = () => {
    const el = document.querySelector(".hero__bloom");
    if (el && ready) {
      // slow lerp = smooth gentle tracking, no jitter
      current += (target - current) * 0.14;
      const f = Math.max(1, Math.min(FRAME_COUNT, Math.round(current * (FRAME_COUNT - 1)) + 1));
      if (f !== last) {
        // use the pre-decoded Image's src for instant paint
        el.src = preloaded[f - 1].src;
        last = f;
      }
    }
    requestAnimationFrame(tick);
  };
  tick();
}

/* ── cursor: removed, using native ── */

/* ── hero title reveal (split words into character spans)
   runs on each hero title group independently so each page can
   cascade its own 3-beat drop without the word index carrying over. */
(() => {
  const animateGroup = (selector) => {
    const words = document.querySelectorAll(selector);
    words.forEach((w, wi) => {
      const text = w.textContent.trim();
      w.textContent = "";
      [...text].forEach((ch, ci) => {
        const s = document.createElement("span");
        s.textContent = ch === " " ? "\u00A0" : ch;
        s.style.display = "inline-block";
        s.style.transform = "translateY(38px) rotate(4deg)";
        s.style.opacity = "0";
        const delay = wi * 0.45 + ci * 0.025;
        s.style.transition = `transform .9s cubic-bezier(.2,.8,.2,1) ${delay}s, opacity .6s ease ${delay}s`;
        w.appendChild(s);
      });
    });
  };

  animateGroup(".hero__title .word:not(.word--solid)");
  animateGroup(".section-title .line");
  animateGroup(".about-hero__title .word");

  requestAnimationFrame(() => {
    document.querySelectorAll(
      ".hero__title .word span, .section-title .line span, .about-hero__title .word span"
    ).forEach(s => {
      s.style.transform = "translateY(0) rotate(0)";
      s.style.opacity = "1";
    });
  });
})();

/* ── about lede: word-by-word reveal at reading pace
   each clause (.lede-part) gets its text split into word tokens;
   tokens fade/rise in sequence at ~100ms per word with ~320ms pauses
   between clauses so the three concepts read as three breaths.
   .lede-highlight stays as a single bonded token since "Creative
   Technologist" is one title, not two separate reveals. */
(() => {
  const parts = document.querySelectorAll('.about-hero__lede .lede-part');
  if (!parts.length) return;

  const wordMs = 100;
  const clausePauseMs = 320;
  let cumulative = 900; // start after the h1 has settled in

  const wordify = (part) => {
    const children = [...part.childNodes];
    part.innerHTML = '';
    const tokens = [];
    for (const node of children) {
      if (node.nodeType === 3) {
        const chunks = node.textContent.split(/(\s+)/);
        for (const c of chunks) {
          if (c === '') continue;
          if (/^\s+$/.test(c)) {
            part.appendChild(document.createTextNode(c));
          } else {
            const s = document.createElement('span');
            s.className = 'lede-word';
            s.textContent = c;
            part.appendChild(s);
            tokens.push(s);
          }
        }
      } else if (node.nodeType === 1) {
        const s = document.createElement('span');
        s.className = 'lede-word';
        s.appendChild(node);
        part.appendChild(s);
        tokens.push(s);
      }
    }
    return tokens;
  };

  const allWords = [];
  parts.forEach((part) => {
    const tokens = wordify(part);
    tokens.forEach((t) => {
      t.style.transition = `opacity .45s ease ${cumulative}ms, transform .55s cubic-bezier(.2,.8,.2,1) ${cumulative}ms`;
      allWords.push(t);
      cumulative += wordMs;
    });
    cumulative += clausePauseMs;
  });

  requestAnimationFrame(() => {
    allWords.forEach((w) => w.classList.add('is-read'));
  });
})();

/* ── halo drift: removed -- static glow only ── */

/* ── 3d tilt on cards ── */
(() => {
  const cards = document.querySelectorAll("[data-tilt]");
  cards.forEach(card => {
    const baseRot = parseFloat(getComputedStyle(card).transform === "none" ? 0 : 0);
    let rx = 0, ry = 0, trx = 0, try_ = 0;
    let raf;

    const onMove = e => {
      const r = card.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width - 0.5);
      const py = ((e.clientY - r.top) / r.height - 0.5);
      trx = -py * 8;
      try_ = px * 10;
      if (!raf) raf = requestAnimationFrame(update);
    };
    const update = () => {
      rx = lerp(rx, trx, 0.12);
      ry = lerp(ry, try_, 0.12);
      card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      raf = null;
      if (Math.abs(trx - rx) > 0.05 || Math.abs(try_ - ry) > 0.05) {
        raf = requestAnimationFrame(update);
      }
    };
    const reset = () => {
      trx = 0; try_ = 0;
      const stored = card.dataset.rest || "";
      card.style.transition = "transform 0.8s cubic-bezier(.2,.8,.2,1)";
      card.style.transform = stored;
      setTimeout(() => { card.style.transition = ""; }, 800);
    };

    // capture original static rotation as rest transform
    card.dataset.rest = getComputedStyle(card).transform;
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", reset);
  });
})();

/* ── ticker: CSS animation, JS sets --row-w to ONE row's measured width ── */
(() => {
  const track = document.querySelector(".ticker__track");
  if (!track) return;
  const row = track.querySelector(".ticker__row");
  if (!row) return;

  const set = () => {
    const w = row.getBoundingClientRect().width || row.offsetWidth || (track.scrollWidth / 2);
    if (w > 10) track.style.setProperty("--row-w", w + "px");
  };

  set();
  window.addEventListener("resize", set);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(set);
  setTimeout(set, 200);
  setTimeout(set, 600);
  setTimeout(set, 1500);

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(set).observe(row);
  }
})();

/* ── scroll reveals ── */
(() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        e.target.style.transform = "translateY(0)";
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".card, .section-lede, .foot__content").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.transition = "opacity 1s ease, transform 1s cubic-bezier(.2,.8,.2,1)";
    io.observe(el);
  });
})();

/* ── card videos: play once on view, replay on hover, no loop ── */
(() => {
  const videos = document.querySelectorAll("[data-card-video]");
  if (!videos.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const v = e.target;
        v.currentTime = 0;
        v.play().catch(() => {});
        io.unobserve(v);
      }
    });
  }, { threshold: 0.35 });
  videos.forEach(v => {
    io.observe(v);
    const card = v.closest(".card");
    if (card) {
      card.addEventListener("pointerenter", () => {
        v.currentTime = 0;
        v.play().catch(() => {});
      });
    }
  });
})();

/* ── reusable glitch-on-hover effect ──
   Scrambles the target text when you pointerenter a trigger,
   then gradually reveals the original characters left-to-right. */
(() => {
  const defaultGlyphs = "!@#$%^&*<>[]{}+-=/\\|~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const subtleGlyphs = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const keepAsIs = (c) => /[\s·\-–—'’".!?,…]/.test(c);

  const bindGlitch = (trigger, target, opts = {}) => {
    if (!target) return;
    const total = opts.total || 14;
    const interval = opts.interval || 40;
    const glyphs = opts.glyphs || defaultGlyphs;
    // density = 1 scrambles every unrevealed char each frame (full glitch)
    // density = 0.3 scrambles only ~30% (subtle shimmer)
    const density = opts.density !== undefined ? opts.density : 1;
    const pick = () => glyphs[Math.floor(Math.random() * glyphs.length)];

    const original = target.textContent;
    let timer;
    let running = false;

    const scramble = (progress) => {
      const reveal = Math.floor(original.length * progress);
      let out = "";
      for (let i = 0; i < original.length; i++) {
        const c = original[i];
        if (keepAsIs(c) || i < reveal || Math.random() > density) {
          out += c;
        } else {
          out += pick();
        }
      }
      target.textContent = out;
    };

    const play = () => {
      running = true;
      let step = 0;
      const tick = () => {
        if (!running) return;
        step++;
        const progress = step / total;
        if (progress >= 1) {
          target.textContent = original;
          running = false;
          return;
        }
        scramble(progress);
        timer = setTimeout(tick, interval);
      };
      tick();
    };

    const stop = () => {
      running = false;
      clearTimeout(timer);
      target.textContent = original;
    };

    trigger.addEventListener("pointerenter", play);
    trigger.addEventListener("pointerleave", stop);
  };

  // Event rows: glitch the place/date, name stays stable (default settings)
  document.querySelectorAll(".about-events__col li").forEach(row => {
    bindGlitch(row, row.querySelector(".ev-place"));
  });

  // Config image: glitch the caption text when hovering ANYWHERE on the figure
  document.querySelectorAll(".about-config__fig").forEach(fig => {
    const target = fig.querySelector(".ev-place");
    if (target) bindGlitch(fig, target);
  });

  // Footer: glitch the email when cursor moves inside the footer content area.
  // Uses mouseover (not pointerenter) because the footer often scroll-reveals
  // under a stationary cursor, and pointerenter doesn't fire in that case.
  document.querySelectorAll(".foot").forEach(foot => {
    const mail = foot.querySelector(".foot__mail");
    if (!mail) return;
    const original = mail.textContent;
    let running = false;
    let timer;

    const play = () => {
      if (running) return;
      running = true;
      let step = 0;
      const total = 14;
      const tick = () => {
        if (!running) return;
        step++;
        const progress = step / total;
        if (progress >= 1) {
          mail.textContent = original;
          running = false;
          return;
        }
        const reveal = Math.floor(original.length * progress);
        let out = "";
        for (let i = 0; i < original.length; i++) {
          const c = original[i];
          if (/[\s@.]/.test(c) || i < reveal) out += c;
          else out += defaultGlyphs[Math.floor(Math.random() * defaultGlyphs.length)];
        }
        mail.textContent = out;
        timer = setTimeout(tick, 40);
      };
      tick();
    };

    const stop = () => {
      running = false;
      clearTimeout(timer);
      mail.textContent = original;
    };

    foot.addEventListener("mouseover", play);
    foot.addEventListener("mouseleave", stop);
  });

})();

/* ── github commits (show-stopper) ──
   Builds the current-month calendar, fills it from the jogruber API,
   populates the watermark with the month name, glitch-counts the total,
   and staggers cell reveal when the section scrolls into view. */
(async () => {
  const gridEl = document.getElementById("commits-month");
  const totalEl = document.getElementById("commits-total");
  const monthNameEl = document.getElementById("commits-month-name");
  const watermarkEl = document.getElementById("commits-watermark");
  const section = document.querySelector(".about-commits");
  if (!gridEl || !totalEl || !section) return;

  const username = "grzy";
  const apiUrl = `https://github-contributions-api.jogruber.de/v4/${username}?y=last`;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
  const monthName = monthNames[month];
  if (monthNameEl) monthNameEl.textContent = monthName.toLowerCase();
  if (watermarkEl) watermarkEl.textContent = monthName;
  const monthLabelEl = document.getElementById("commits-month-label");
  if (monthLabelEl) monthLabelEl.textContent = monthName.toLowerCase();

  const firstOfMonth = new Date(year, month, 1);
  const firstDayOfWeek = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = now.getDate();

  const dateKey = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;


  const buildGrid = (contribMap) => {
    const frag = document.createDocumentFragment();
    let total = 0;
    for (let i = 0; i < firstDayOfWeek; i++) {
      const blank = document.createElement("span");
      blank.className = "commit-cell commit-cell--empty";
      frag.appendChild(blank);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const key = dateKey(year, month, d);
      const entry = contribMap.get(key);
      const count = entry ? entry.count : 0;
      const level = entry ? entry.level : 0;
      total += count;
      const cell = document.createElement("span");
      cell.className = "commit-cell";
      cell.dataset.level = String(level);
      cell.title = `${key}: ${count} contribution${count === 1 ? "" : "s"}`;
      if (d > todayDate) cell.classList.add("commit-cell--future");
      if (d === todayDate) cell.classList.add("commit-cell--today");
      frag.appendChild(cell);
    }
    gridEl.appendChild(frag);
    return total;
  };

  let totalCommits = 0;
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    const contribMap = new Map((data.contributions || []).map(d => [d.date, d]));
    totalCommits = buildGrid(contribMap);
  } catch (err) {
    buildGrid(new Map());
    totalCommits = 0;
  }

  // just set the total directly -- no scramble animation
  totalEl.textContent = String(totalCommits);

  // ── Sound (Web Audio API) ──
  // Pleasant pentatonic sine-wave notes per activity level. Off by default.
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  let soundEnabled = false;

  const ensureCtx = () => {
    if (!AudioCtxClass) return null;
    if (!audioCtx) audioCtx = new AudioCtxClass();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  };

  // A minor pentatonic, ascending by level: A C E G C↑
  const notes = [440, 523.25, 659.25, 783.99, 1046.50];

  const playNote = (level) => {
    if (!soundEnabled) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const freq = notes[Math.max(0, Math.min(4, level - 1))];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  };

  // ── Sound toggle button ──
  const toggle = document.getElementById("sound-toggle");
  const toggleLabel = toggle && toggle.querySelector("em");
  const hint = document.getElementById("commits-hint");
  if (toggle) {
    toggle.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      toggle.classList.toggle("is-on", soundEnabled);
      toggle.setAttribute("aria-pressed", String(soundEnabled));
      if (toggleLabel) toggleLabel.textContent = soundEnabled ? "on" : "off";
      if (hint) hint.classList.toggle("is-visible", soundEnabled);
      if (soundEnabled) ensureCtx();
    });
  }

  // ── Bind sound to cells with activity (level > 0) ──
  const cells = Array.from(gridEl.querySelectorAll(".commit-cell"));
  cells.forEach((cell) => {
    const level = parseInt(cell.dataset.level || "0", 10);
    if (level > 0 && !cell.classList.contains("commit-cell--empty")) {
      cell.addEventListener("pointerenter", () => playNote(level));
    }
  });

  // stagger-reveal cells when section enters viewport
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        cells.forEach((cell, i) => {
          setTimeout(() => cell.classList.add("is-in"), 200 + i * 25);
        });
        io.disconnect();
      }
    });
  }, { threshold: 0.3 });
  io.observe(section);
})();

/* ── lede-highlight: sweep underline on cursor-over-lede ──
   Uses window pointermove + bbox check so the lede can stay at
   pointer-events: none (WebGL flashlight keeps tracking underneath). */
(() => {
  const lede = document.querySelector(".about-hero__lede");
  const highlight = lede && lede.querySelector(".lede-highlight");
  if (!lede || !highlight) return;
  if (matchMedia("(hover: none)").matches) return;

  const check = (e) => {
    const r = lede.getBoundingClientRect();
    const inside =
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom;
    highlight.classList.toggle("is-active", inside);
  };
  window.addEventListener("pointermove", check, { passive: true });
  window.addEventListener("pointerleave", () => highlight.classList.remove("is-active"));
})();

/* ── nav: measure + anchor from fixed left so contact grows rightward only ── */
(() => {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const measure = () => {
    if (!nav.matches(":hover")) {
      const half = nav.offsetWidth / 2;
      nav.style.setProperty("--nav-half-w", half + "px");
    }
  };
  measure();
  window.addEventListener("resize", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  setTimeout(measure, 300);
  setTimeout(measure, 1000);
})();

/* ── nav: mobile menu toggle ── */
(() => {
  const nav = document.querySelector(".nav");
  const btn = document.querySelector(".nav__toggle");
  if (!nav || !btn) return;
  const close = () => { nav.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); };
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll(".nav__links a").forEach(a => a.addEventListener("click", close));
  document.addEventListener("click", e => {
    if (!nav.contains(e.target)) close();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) close();
  });
})();

/* ── nav scroll state + scroll-to-top button visibility ── */
(() => {
  const nav = document.querySelector(".nav");
  const toTop = document.querySelector(".to-top");
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.style.scale = y > 40 ? "0.97" : "1";
    if (toTop) toTop.classList.toggle("is-visible", y > window.innerHeight * 0.6);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
