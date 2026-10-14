/* ============================================================
   Starlight — untuk sahabatku Salsabila Adistya Wati
   Versi 3D: galaksi partikel Three.js, parallax, tilt 3D,
   reveal saat scroll, navigasi dot, hati melayang, musik.
   ============================================================ */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.getElementById("starfield");
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  window.addEventListener("pointermove", (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  });

  /* ---------- 1. GALAKSI 3D (Three.js) ---------- */
  let renderer, scene, camera, galaxy, farStars, clock;
  let scrollFactor = 0;

  function makeStarTexture() {
    const s = 64;
    const c = document.createElement("canvas");
    c.width = c.height = s;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.25, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.35)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  function initGalaxy() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060f, 0.055);

    camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(0, 2.6, 7);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const starTex = makeStarTexture();

    // --- Galaksi spiral ---
    const params = {
      count: window.innerWidth < 640 ? 7000 : 14000,
      size: 0.035,
      radius: 8,
      branches: 4,
      spin: 1.15,
      randomness: 0.4,
      randomnessPower: 2.6,
    };
    const inside = new THREE.Color("#ffd6e8");
    const outside = new THREE.Color("#5b6bff");
    const positions = new Float32Array(params.count * 3);
    const colors = new Float32Array(params.count * 3);

    for (let i = 0; i < params.count; i++) {
      const i3 = i * 3;
      const radius = Math.pow(Math.random(), 1.4) * params.radius;
      const branchAngle = ((i % params.branches) / params.branches) * Math.PI * 2;
      const spinAngle = radius * params.spin;
      const rand = () =>
        Math.pow(Math.random(), params.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        params.randomness *
        radius;
      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + rand();
      positions[i3 + 1] = rand() * 0.45;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + rand();

      const mixed = inside.clone().lerp(outside, radius / params.radius);
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: params.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      transparent: true,
      map: starTex,
      alphaTest: 0.01,
    });
    galaxy = new THREE.Points(geo, mat);
    galaxy.rotation.x = 0.35;
    scene.add(galaxy);

    // --- Bintang jauh (kedalaman) ---
    const sCount = 1800;
    const sPos = new Float32Array(sCount * 3);
    for (let i = 0; i < sCount; i++) {
      const i3 = i * 3;
      sPos[i3] = (Math.random() - 0.5) * 80;
      sPos[i3 + 1] = (Math.random() - 0.5) * 80;
      sPos[i3 + 2] = (Math.random() - 0.5) * 80;
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    const sMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      map: starTex,
      alphaTest: 0.01,
      blending: THREE.AdditiveBlending,
    });
    farStars = new THREE.Points(sGeo, sMat);
    scene.add(farStars);

    clock = new THREE.Clock();
    animateGalaxy();
  }

  function animateGalaxy() {
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;

    galaxy.rotation.y = t * 0.06;
    farStars.rotation.y = t * 0.012;
    farStars.rotation.x = t * 0.006;

    // Parallax mouse + scroll (kamera menjauh & mengangkat saat menggulir)
    const targetX = pointer.x * 1.6;
    const targetY = 2.6 + pointer.y * 1.0 + scrollFactor * 2.2;
    const targetZ = 7 + scrollFactor * 3.0;
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.position.z += (targetZ - camera.position.z) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animateGalaxy);
  }

  window.addEventListener("resize", () => {
    if (!renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener(
    "scroll",
    () => {
      const max = document.body.scrollHeight - window.innerHeight;
      scrollFactor = max > 0 ? window.scrollY / max : 0;
    },
    { passive: true }
  );

  // Fallback 2D sederhana bila WebGL/Three tidak tersedia atau reduce-motion
  function fallbackStars() {
    const ctx = canvas.getContext("2d");
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      for (let i = 0; i < 260; i++) {
        ctx.globalAlpha = Math.random() * 0.6 + 0.2;
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 1.3,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
    resize();
    window.addEventListener("resize", resize);
  }

  if (!reduceMotion && window.THREE) {
    try {
      initGalaxy();
    } catch (e) {
      fallbackStars();
    }
  } else {
    fallbackStars();
  }

  /* ---------- 2. BINTANG MELAYANG ---------- */
  const heartsLayer = document.getElementById("heartsLayer");
  const heartChars = ["✦", "★", "✧", "⋆", "✩"];

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
  if (!reduceMotion) setInterval(spawnHeart, 950);

  /* ---------- 3. REVEAL SAAT SCROLL ---------- */
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
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- 4. NAVIGASI DOT ---------- */
  const dots = document.querySelectorAll(".dot-nav .dot");
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          dots.forEach((d) =>
            d.classList.toggle("active", d.getAttribute("href") === "#" + id)
          );
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll(".section").forEach((s) => navObserver.observe(s));

  /* ---------- 5. TILT 3D PADA KARTU ---------- */
  function addTilt(el, max) {
    let raf = null;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform =
          `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(14px)`;
      });
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)";
    });
  }

  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document
      .querySelectorAll(".letter, .tl-card, .reason-card, .gallery-item")
      .forEach((el) => addTilt(el, el.classList.contains("gallery-item") ? 12 : 8));
  }

  /* ---------- 6. PARALLAX RINGAN PADA JUDUL ---------- */
  if (!reduceMotion) {
    const floaters = document.querySelectorAll(".section-title, .hero-title .name");
    window.addEventListener(
      "scroll",
      () => {
        floaters.forEach((el) => {
          const r = el.getBoundingClientRect();
          const offset = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
          el.style.transform = `translateY(${offset * -14}px)`;
        });
      },
      { passive: true }
    );
  }

  /* ---------- 7. MUSIK LATAR ---------- */
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
      music
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          setPlaying(false);
          alert("Tambahkan file musik di assets/music.mp3 untuk memutar lagu latar. 🎵");
        });
    }
  });

  function tryAutoplayOnce() {
    if (!playing) {
      music.play().then(() => setPlaying(true)).catch(() => {});
    }
    window.removeEventListener("pointerdown", tryAutoplayOnce);
  }
  window.addEventListener("pointerdown", tryAutoplayOnce);
})();
