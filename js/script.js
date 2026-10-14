/* ============================================================
   Starlight — untuk Salsabila Adistya Wati
   Animasi: starfield, shooting stars, hati melayang,
   reveal saat scroll, navigasi dot, dan musik latar.
   ============================================================ */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. STARFIELD ---------- */
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");
  let stars = [];
  let shootingStars = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    const count = Math.min(220, Math.floor((w * h) / 7000));
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        baseAlpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function spawnShootingStar() {
    if (reduceMotion) return;
    const startX = Math.random() * w;
    const startY = Math.random() * h * 0.4;
    shootingStars.push({
      x: startX,
      y: startY,
      len: Math.random() * 120 + 80,
      speed: Math.random() * 6 + 6,
      angle: Math.PI / 4,
      alpha: 1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (const s of stars) {
      s.phase += s.twinkleSpeed;
      const alpha = s.baseAlpha + Math.sin(s.phase) * 0.25;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, alpha)})`;
      ctx.fill();
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      const dx = Math.cos(ss.angle) * ss.len;
      const dy = Math.sin(ss.angle) * ss.len;
      const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - dx, ss.y - dy);
      grad.addColorStop(0, `rgba(255,214,232,${ss.alpha})`);
      grad.addColorStop(1, "rgba(255,214,232,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - dx, ss.y - dy);
      ctx.stroke();

      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.alpha -= 0.012;
      if (ss.alpha <= 0 || ss.x > w || ss.y > h) shootingStars.splice(i, 1);
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
  setInterval(() => {
    if (Math.random() > 0.4) spawnShootingStar();
  }, 2600);

  /* ---------- 2. FLOATING HEARTS ---------- */
  const heartsLayer = document.getElementById("heartsLayer");
  const heartChars = ["♥", "❤", "💗", "✦", "★"];

  function spawnHeart() {
    if (reduceMotion) return;
    const el = document.createElement("span");
    el.className = "heart";
    el.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = Math.random() * 16 + 12 + "px";
    const duration = Math.random() * 6 + 7;
    el.style.animationDuration = duration + "s";
    heartsLayer.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000);
  }
  setInterval(spawnHeart, 900);

  /* ---------- 3. REVEAL ON SCROLL ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- 4. DOT NAV ACTIVE STATE ---------- */
  const sections = document.querySelectorAll(".section");
  const dots = document.querySelectorAll(".dot-nav .dot");
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          dots.forEach((d) => {
            d.classList.toggle("active", d.getAttribute("href") === "#" + id);
          });
        }
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((s) => navObserver.observe(s));

  /* ---------- 5. BACKGROUND MUSIC ---------- */
  const music = document.getElementById("bgMusic");
  const toggle = document.getElementById("musicToggle");
  let playing = false;

  function setPlaying(state) {
    playing = state;
    toggle.classList.toggle("playing", state);
    toggle.querySelector(".music-icon").textContent = state ? "♫" : "♪";
    toggle.setAttribute("aria-label", state ? "Jeda musik" : "Putar musik");
  }

  toggle.addEventListener("click", () => {
    if (playing) {
      music.pause();
      setPlaying(false);
    } else {
      music.play()
        .then(() => setPlaying(true))
        .catch(() => {
          setPlaying(false);
          alert("Tambahkan file musik di assets/music.mp3 untuk memutar lagu latar. 🎵");
        });
    }
  });

  // Coba putar otomatis setelah interaksi pertama pengguna (kebijakan browser).
  function tryAutoplayOnce() {
    if (!playing) {
      music.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
    window.removeEventListener("pointerdown", tryAutoplayOnce);
  }
  window.addEventListener("pointerdown", tryAutoplayOnce);
})();
