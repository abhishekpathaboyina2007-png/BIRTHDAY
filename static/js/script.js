/* =========================================================================
   Cinematic Birthday Surprise — frontend logic
   - Particle field (stars on intro, hearts+stars on reveal)
   - GSAP intro/reveal animations + cinematic page transition
   - Confetti burst on reveal
   - Ambient music toggle (graceful if file is missing)
   - Live-updating countdown
   ========================================================================= */

(function (global) {
  "use strict";

  const PINK = "#ff8ad1";
  const PURPLE = "#b07bff";
  const WHITE = "#ffffff";

  /* -------------------- Particle field (stars + hearts) ------------------- */
  function startParticles(canvas, { withHearts = false } = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, particles = [], raf;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(1, 1);
    }

    function spawn() {
      const count = Math.min(110, Math.floor((window.innerWidth * window.innerHeight) / 14000));
      particles = [];
      for (let i = 0; i < count; i++) {
        const isHeart = withHearts && Math.random() < 0.18;
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: isHeart ? 6 + Math.random() * 6 : 0.6 + Math.random() * 1.6,
          vx: (Math.random() - 0.5) * 0.15,
          vy: -0.1 - Math.random() * 0.35,
          a: 0.3 + Math.random() * 0.6,
          tw: Math.random() * Math.PI * 2,
          color: Math.random() < 0.5 ? PINK : (Math.random() < 0.5 ? PURPLE : WHITE),
          isHeart,
        });
      }
    }

    function heart(ctx, x, y, size, color, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      const s = size;
      ctx.moveTo(x, y + s / 4);
      ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s / 4);
      ctx.bezierCurveTo(x - s / 2, y + s / 2, x, y + (s * 3) / 4, x, y + s);
      ctx.bezierCurveTo(x, y + (s * 3) / 4, x + s / 2, y + s / 2, x + s / 2, y + s / 4);
      ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s / 4);
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.tw += 0.03;
        if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        if (p.isHeart) {
          heart(ctx, p.x, p.y, p.r, p.color, alpha);
        } else {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      raf = requestAnimationFrame(tick);
    }

    function onResize() { resize(); spawn(); }
    resize(); spawn(); tick();
    window.addEventListener("resize", onResize, { passive: true });

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }

  /* ------------------------- Confetti burst ------------------------------- */
  function fireConfetti(canvas, duration = 2200) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, pieces = [], raf, start = performance.now();

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const colors = [PINK, PURPLE, "#ffd6f0", "#e9d8ff", "#ffffff"];
    for (let i = 0; i < 160; i++) {
      pieces.push({
        x: w / 2 + (Math.random() - 0.5) * 80,
        y: h / 2 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 9,
        vy: -Math.random() * 11 - 4,
        g: 0.18 + Math.random() * 0.12,
        size: 4 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.25,
        color: colors[(Math.random() * colors.length) | 0],
        life: 1,
      });
    }

    function tick(now) {
      const elapsed = now - start;
      ctx.clearRect(0, 0, w, h);
      for (const p of pieces) {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        p.life = Math.max(0, 1 - elapsed / duration);
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.45);
        ctx.restore();
      }
      if (elapsed < duration + 400) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, w, h);
        cancelAnimationFrame(raf);
      }
    }
    raf = requestAnimationFrame(tick);
  }

  /* ---------------------------- Intro screen ------------------------------ */
  function initIntro() {
    startParticles(document.getElementById("particles"));

    const btn = document.getElementById("openBtn");
    const kicker = document.querySelector(".intro__kicker");
    const hint = document.querySelector(".intro__hint");
    const curtain = document.getElementById("curtain");

    // Entrance choreography
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(kicker, { opacity: 1, y: 0, duration: 1.1, delay: 0.3 })
      .to(btn,    { opacity: 1, scale: 1, duration: 1.2 }, "-=0.5")
      .to(hint,   { opacity: 0.7, duration: 1 }, "-=0.4");

    // Cinematic transition to /reveal
    btn.addEventListener("click", () => {
      const href = btn.dataset.href || "/reveal";
      btn.disabled = true;

      gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: () => { window.location.href = href; },
      })
        .to(btn,    { scale: 1.35, duration: 0.5 })
        .to([kicker, hint], { opacity: 0, y: -10, duration: 0.4 }, 0)
        .to(btn,    { scale: 12, opacity: 0, duration: 1.1 }, 0.3)
        .to(curtain,{ opacity: 1, duration: 0.9 }, 0.5);
    }, { once: true });
  }

  /* ---------------------------- Reveal screen ----------------------------- */
  function initReveal({ birthday } = {}) {
    startParticles(document.getElementById("particles"), { withHearts: true });

    const curtain = document.getElementById("curtain");
    const eyebrow = document.querySelector(".reveal__eyebrow");
    const lines = document.querySelectorAll(".reveal__headline .line");
    const sub = document.getElementById("revealSub");
    const chip = document.querySelector(".countdown__chip");
    const confetti = document.getElementById("confetti");

    // Lift the curtain → reveal sequence
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(curtain, { opacity: 0, duration: 1.4, ease: "power2.inOut" })
      .set(curtain, { display: "none" })
      .to(eyebrow,  { opacity: 1, duration: 1 }, "-=0.6")
      .to(lines,    { opacity: 1, y: 0, duration: 1.2, stagger: 0.25 }, "-=0.4")
      .to(sub,      { opacity: 1, duration: 1 }, "-=0.4")
      .to(chip,     { opacity: 1, y: 0, duration: 0.9 }, "-=0.5")
      .call(() => fireConfetti(confetti), null, "-=0.4");

    // Live countdown — recomputes daily without needing a refresh
    if (birthday) {
      const target = new Date(birthday + "T00:00:00");
      const el = document.getElementById("daysLeft");
      const update = () => {
        const now = new Date();
        const ms = target - now;
        const days = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
        if (el) el.textContent = days;
      };
      update();
      setInterval(update, 60 * 1000);
    }

    // Ambient music toggle. Autoplay is blocked, so we try and fall back silently.
    const audio = document.getElementById("ambient");
    const toggle = document.getElementById("musicToggle");
    if (audio && toggle) {
      audio.volume = 0.45;
      const play = () => {
        audio.play().then(() => toggle.classList.add("is-playing")).catch(() => {});
      };
      // Attempt once after the reveal — many browsers allow it after the prior click.
      setTimeout(play, 800);
      toggle.addEventListener("click", () => {
        if (audio.paused) play();
        else { audio.pause(); toggle.classList.remove("is-playing"); }
      });
    }
  }

  global.BirthdaySurprise = { initIntro, initReveal };
})(window);
