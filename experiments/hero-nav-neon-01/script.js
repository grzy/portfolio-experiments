// ✺ neon specimen 01 — interactions
// cursor · hero title reveal · card 3d tilt · parallax orchid · scroll reveals

const lerp = (a, b, t) => a + (b - a) * t;

/* ── cursor ── */
(() => {
  if (matchMedia("(hover: none)").matches) return;
  const cursor = document.querySelector(".cursor");
  const dot = cursor.querySelector(".cursor__dot");
  const ring = cursor.querySelector(".cursor__ring");
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener("pointermove", e => {
    mx = e.clientX; my = e.clientY;
    if (!cursor.classList.contains("is-ready")) cursor.classList.add("is-ready");
  });
  const tick = () => {
    rx = lerp(rx, mx, 0.18);
    ry = lerp(ry, my, 0.18);
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(tick);
  };
  tick();

  document.querySelectorAll("[data-hover]").forEach(el => {
    el.addEventListener("pointerenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));
  });
})();

/* ── hero title reveal (split words into character spans) ── */
(() => {
  const words = document.querySelectorAll(".hero__title .word, .section-title .line");
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

/* ── parallax hero orchid to pointer ── */
(() => {
  const img = document.querySelector(".hero__specimen img");
  const halo = document.querySelector(".hero__halo");
  if (!img) return;
  let tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener("pointermove", e => {
    const nx = (e.clientX / window.innerWidth - 0.5);
    const ny = (e.clientY / window.innerHeight - 0.5);
    tx = nx * 40;
    ty = ny * 30;
  });
  const loop = () => {
    cx = lerp(cx, tx, 0.06);
    cy = lerp(cy, ty, 0.06);
    img.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${cx * 0.08}deg)`;
    if (halo) halo.style.transform = `translate3d(${cx * 0.4}px, ${cy * 0.4}px, 0)`;
    requestAnimationFrame(loop);
  };
  loop();
})();

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

/* ── ticker: CSS animation, JS just sets --row-w to one row's width ── */
(() => {
  const track = document.querySelector(".ticker__track");
  if (!track) return;

  const set = () => {
    const w = track.scrollWidth / 2;
    if (w > 10) track.style.setProperty("--row-w", w + "px");
  };

  set();
  window.addEventListener("resize", set);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(set);
  setTimeout(set, 300);
  setTimeout(set, 1200);
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

/* ── nav scroll state ── */
(() => {
  const nav = document.querySelector(".nav");
  window.addEventListener("scroll", () => {
    nav.style.transform = `translateX(-50%) scale(${window.scrollY > 40 ? 0.96 : 1})`;
  }, { passive: true });
})();
