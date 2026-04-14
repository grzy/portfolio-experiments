// ✺ neon specimen 01 — interactions
// cursor · hero title reveal · card 3d tilt · parallax orchid · scroll reveals

const lerp = (a, b, t) => a + (b - a) * t;

/* ── BLOOM (top of file so nothing can break it) ────────────────────
   Cursor Y over the viewport scrubs through 52 frames.
   Top of screen = closed. Bottom = fully bloomed.
─────────────────────────────────────────────────────────────────── */
{
  const FRAME_COUNT = 63;
  const pad = (n) => String(n).padStart(3, "0");
  const url = (i) => `images/bloom/f${pad(i)}.jpg`;

  const preloaded = [];
  for (let i = 1; i <= FRAME_COUNT; i++) {
    const im = new Image();
    im.src = url(i);
    preloaded.push(im);
  }

  let target = 0, current = 0, last = 0;

  const isTouch = matchMedia("(hover: none)").matches;

  if (isTouch) {
    // mobile: scroll through the hero drives the bloom
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
    // desktop: cursor Y drives the bloom
    const onMove = (e) => {
      const ny = e.clientY / window.innerHeight;
      target = Math.max(0, Math.min(1, ny));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
  }

  const tick = () => {
    const el = document.querySelector(".hero__bloom");
    if (el) {
      current += (target - current) * 0.18;
      const f = Math.max(1, Math.min(FRAME_COUNT, Math.round(current * (FRAME_COUNT - 1)) + 1));
      if (f !== last) {
        el.src = url(f);
        last = f;
        document.title = `bloom ${f}/${FRAME_COUNT} ✺`;
      }
    }
    requestAnimationFrame(tick);
  };
  tick();
}

/* ── cursor: removed, using native ── */

/* ── hero title reveal (split words into character spans) ── */
(() => {
  const words = document.querySelectorAll(".hero__title .word:not(.word--solid), .section-title .line");
  words.forEach((w, wi) => {
    const text = w.textContent;
    w.textContent = "";
    [...text].forEach((ch, ci) => {
      const s = document.createElement("span");
      s.textContent = ch === " " ? "\u00A0" : ch;
      s.style.display = "inline-block";
      s.style.transform = "translateY(38px) rotate(4deg)";
      s.style.opacity = "0";
      s.style.transition = `transform .9s cubic-bezier(.2,.8,.2,1) ${wi * 0.08 + ci * 0.025}s, opacity .6s ease ${wi * 0.08 + ci * 0.025}s`;
      w.appendChild(s);
    });
  });
  requestAnimationFrame(() => {
    document.querySelectorAll(".hero__title .word span, .section-title .line span").forEach(s => {
      s.style.transform = "translateY(0) rotate(0)";
      s.style.opacity = "1";
    });
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

/* ── nav scroll state ── */
(() => {
  const nav = document.querySelector(".nav");
  window.addEventListener("scroll", () => {
    nav.style.transform = `translateX(-50%) scale(${window.scrollY > 40 ? 0.96 : 1})`;
  }, { passive: true });
})();
