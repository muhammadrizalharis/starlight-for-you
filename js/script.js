/* =============================================================
   Starlight for You — interaksi & animasi
   Galaxy 3D (Three.js) + carousel 3D + kelopak + bintang jatuh
   + jejak kursor + lightbox, dengan 3 tingkat performa.
   ============================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Deteksi tingkat perangkat (HP kentang aman) ---------- */
  var coarse = window.matchMedia("(pointer: coarse)").matches;
  var cores = navigator.hardwareConcurrency || 4;
  var mem = navigator.deviceMemory || 4;
  var smallScreen = window.innerWidth < 768;
  var lowEnd = coarse || smallScreen || cores <= 4 || mem <= 4;

  // TIER: 1 = ringan (HP), 2 = penuh (desktop kuat).
  // Catatan: situs ini memang bertujuan penuh animasi, jadi "reduce motion"
  // TIDAK mematikan animasi — hanya dipakai untuk perilaku scroll & sedikit
  // menurunkan intensitas lewat pemilihan tier perangkat.
  var TIER = lowEnd ? 1 : 2;

  var cfg = {
    galaxyCount: TIER === 2 ? 14000 : 5000,
    pixelRatioCap: TIER === 2 ? 2 : 1.5,
    petalEvery: TIER === 2 ? 420 : 1100,
    petalMax: TIER === 2 ? 46 : 16,
    roseEvery: TIER === 2 ? 900 : 1900,
    roseMax: TIER === 2 ? 18 : 7,
    shootEvery: TIER === 2 ? 3200 : 6500,
    fireworkEvery: TIER === 2 ? 2600 : 5200,
    floaterCount: TIER === 2 ? 26 : 14,
    trail: TIER === 2,
    tilt: TIER === 2
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* =============================================================
     1. GALAXY 3D (Three.js) dengan fallback 2D
     ============================================================= */
  var galaxyCanvas = $("#starfield");
  var hasWebGL = (function () {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  })();

  function makeStarTexture() {
    var size = 64;
    var cv = document.createElement("canvas");
    cv.width = cv.height = size;
    var ctx = cv.getContext("2d");
    var g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.9)");
    g.addColorStop(0.5, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    var tex = new THREE.Texture(cv);
    tex.needsUpdate = true;
    return tex;
  }

  var galaxyActive = false;
  var renderer, scene, camera, galaxyPoints, farPoints, starTex;
  var mouseX = 0, mouseY = 0, scrollT = 0;

  function initGalaxy() {
    if (TIER === 0 || !window.THREE || !hasWebGL) { fallback2D(); return; }
    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 2.2, 6);

      renderer = new THREE.WebGLRenderer({ canvas: galaxyCanvas, antialias: TIER === 2, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, cfg.pixelRatioCap));
      renderer.setSize(window.innerWidth, window.innerHeight);

      starTex = makeStarTexture();

      // ---- Galaksi spiral ----
      var count = cfg.galaxyCount;
      var positions = new Float32Array(count * 3);
      var colors = new Float32Array(count * 3);
      var insideColor = new THREE.Color("#ffc2dd");   // rose lembut
      var outsideColor = new THREE.Color("#8a7bff");  // ungu dreamy
      var radiusMax = 5, branches = 4, spin = 1.1, randomness = 0.28, randomnessPow = 3;

      for (var i = 0; i < count; i++) {
        var i3 = i * 3;
        var r = Math.random() * radiusMax;
        var branchAngle = ((i % branches) / branches) * Math.PI * 2;
        var spinAngle = r * spin;
        var rx = Math.pow(Math.random(), randomnessPow) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
        var ry = Math.pow(Math.random(), randomnessPow) * (Math.random() < 0.5 ? 1 : -1) * randomness * r * 0.5;
        var rz = Math.pow(Math.random(), randomnessPow) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
        positions[i3] = Math.cos(branchAngle + spinAngle) * r + rx;
        positions[i3 + 1] = ry;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz;
        var mixed = insideColor.clone().lerp(outsideColor, r / radiusMax);
        colors[i3] = mixed.r; colors[i3 + 1] = mixed.g; colors[i3 + 2] = mixed.b;
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      var mat = new THREE.PointsMaterial({
        size: 0.055, sizeAttenuation: true, depthWrite: false,
        blending: THREE.AdditiveBlending, vertexColors: true,
        map: starTex, transparent: true, alphaTest: 0.01
      });
      galaxyPoints = new THREE.Points(geo, mat);
      scene.add(galaxyPoints);

      // ---- Bintang jauh (depth) ----
      var fcount = TIER === 2 ? 1800 : 800;
      var fpos = new Float32Array(fcount * 3);
      for (var j = 0; j < fcount; j++) {
        fpos[j * 3] = (Math.random() - 0.5) * 40;
        fpos[j * 3 + 1] = (Math.random() - 0.5) * 40;
        fpos[j * 3 + 2] = (Math.random() - 0.5) * 40;
      }
      var fgeo = new THREE.BufferGeometry();
      fgeo.setAttribute("position", new THREE.BufferAttribute(fpos, 3));
      var fmat = new THREE.PointsMaterial({
        size: 0.06, color: "#ffe3ef", transparent: true, opacity: 0.7,
        depthWrite: false, blending: THREE.AdditiveBlending, map: starTex, alphaTest: 0.01
      });
      farPoints = new THREE.Points(fgeo, fmat);
      scene.add(farPoints);

      galaxyActive = true;
      window.addEventListener("resize", onResize);
      window.addEventListener("pointermove", onPointerParallax, { passive: true });
      window.addEventListener("scroll", function () {
        scrollT = window.scrollY / (document.body.scrollHeight - window.innerHeight || 1);
      }, { passive: true });
      animateGalaxy();
    } catch (e) {
      fallback2D();
    }
  }

  function onResize() {
    if (!galaxyActive) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, cfg.pixelRatioCap));
  }

  function onPointerParallax(e) {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  }

  var clock = null;
  function animateGalaxy() {
    if (!galaxyActive) return;
    requestAnimationFrame(animateGalaxy);
    if (document.hidden) return;
    if (!clock) clock = (window.THREE ? new THREE.Clock() : null);
    var t = clock ? clock.getElapsedTime() : (Date.now() / 1000);
    if (galaxyPoints) galaxyPoints.rotation.y = t * 0.06;
    if (farPoints) farPoints.rotation.y = -t * 0.015;
    // parallax kamera halus
    camera.position.x += (mouseX * 1.6 - camera.position.x) * 0.04;
    camera.position.y += (2.2 - mouseY * 1.2 + scrollT * 2.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

  /* ---------- Fallback 2D starfield ---------- */
  function fallback2D() {
    if (!galaxyCanvas) return;
    var ctx = galaxyCanvas.getContext("2d");
    var stars = [], W, H;
    function resize() {
      W = galaxyCanvas.width = window.innerWidth;
      H = galaxyCanvas.height = window.innerHeight;
      stars = [];
      var n = TIER === 0 ? 70 : 150;
      for (var i = 0; i < n; i++) {
        stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + 0.3, a: Math.random(), s: Math.random() * 0.02 + 0.004 });
      }
    }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        st.a += st.s; if (st.a > 1 || st.a < 0) st.s = -st.s;
        ctx.globalAlpha = Math.abs(st.a);
        ctx.fillStyle = "#ffd9ec";
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (TIER !== 0) requestAnimationFrame(draw);
    }
    draw();
  }

  /* =============================================================
     2. KELOPAK BUNGA & MAWAR berterbangan
     ============================================================= */
  var petalsLayer = $("#petalsLayer");
  var flowers = ["🌸", "🌹", "🌷", "💮", "🌺", "🌼", "❀"];
  var petalCount = 0;
  function spawnPetal() {
    if (TIER === 0 || !petalsLayer || document.hidden) return;
    if (petalCount >= cfg.petalMax) return;
    var el = document.createElement("span");
    el.className = "petal";
    el.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = (Math.random() * 14 + 16) + "px";
    el.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
    el.style.setProperty("--spin", (Math.random() * 720 - 360) + "deg");
    var dur = Math.random() * 5 + 7;
    el.style.animationDuration = dur + "s";
    petalsLayer.appendChild(el);
    petalCount++;
    setTimeout(function () { el.remove(); petalCount--; }, dur * 1000);
  }
  if (TIER !== 0 && petalsLayer) setInterval(spawnPetal, cfg.petalEvery);

  /* =============================================================
     3. BINTANG JATUH
     ============================================================= */
  var shootingLayer = $("#shootingLayer");
  function spawnShoot() {
    if (TIER === 0 || !shootingLayer || document.hidden) return;
    var el = document.createElement("div");
    el.className = "shoot";
    el.style.top = (Math.random() * 40) + "vh";
    el.style.left = (78 + Math.random() * 25) + "vw";
    var dur = Math.random() * 1.2 + 1.4;
    el.style.animationDuration = dur + "s";
    shootingLayer.appendChild(el);
    setTimeout(function () { el.remove(); }, dur * 1000);
  }
  function scheduleShoot() {
    if (TIER === 0) return;
    spawnShoot();
    setTimeout(scheduleShoot, cfg.shootEvery + Math.random() * 2500);
  }
  if (TIER !== 0) setTimeout(scheduleShoot, 2000);

  /* =============================================================
     3b. HUJAN MAWAR (mawar besar berjatuhan lembut)
     ============================================================= */
  var roseLayer = $("#roseLayer");
  var roseGlyphs = ["🌹", "🌹", "🌹", "🥀", "🌷"];
  var roseCount = 0;
  function spawnRose() {
    if (!roseLayer || document.hidden) return;
    if (roseCount >= cfg.roseMax) return;
    var el = document.createElement("span");
    el.className = "rose";
    el.textContent = roseGlyphs[Math.floor(Math.random() * roseGlyphs.length)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = (Math.random() * 20 + 22) + "px";
    el.style.setProperty("--drift", (Math.random() * 220 - 110) + "px");
    el.style.setProperty("--spin", (Math.random() * 540 - 270) + "deg");
    var dur = Math.random() * 6 + 9;
    el.style.animationDuration = dur + "s";
    roseLayer.appendChild(el);
    roseCount++;
    setTimeout(function () { el.remove(); roseCount--; }, dur * 1000);
  }
  if (roseLayer) { setInterval(spawnRose, cfg.roseEvery); setTimeout(spawnRose, 600); }

  /* =============================================================
     3c. KEMBANG API / PETASAN (canvas ledakan warna-warni)
     ============================================================= */
  (function fireworks() {
    var cv = $("#fireworks");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    var W, H, dpr = Math.min(window.devicePixelRatio || 1, cfg.pixelRatioCap);
    function resize() {
      W = cv.width = Math.floor(window.innerWidth * dpr);
      H = cv.height = Math.floor(window.innerHeight * dpr);
      cv.style.width = window.innerWidth + "px";
      cv.style.height = window.innerHeight + "px";
    }
    resize();
    window.addEventListener("resize", resize);

    var palettes = [
      ["#ff8ac0", "#ff5fa2", "#ffd1e8"],
      ["#b79bff", "#8a7bff", "#e4dbff"],
      ["#ffd97a", "#ffb347", "#fff2cf"],
      ["#7be0ff", "#58c8ff", "#d6f4ff"],
      ["#9affd0", "#54e3a8", "#dcfff0"]
    ];
    var particles = [];
    var running = true;

    function burst(x, y) {
      var pal = palettes[Math.floor(Math.random() * palettes.length)];
      var count = (TIER === 2 ? 46 : 26) + Math.floor(Math.random() * 18);
      var power = (TIER === 2 ? 5.2 : 4.2) + Math.random() * 2.2;
      for (var i = 0; i < count; i++) {
        var ang = (Math.PI * 2 * i) / count + Math.random() * 0.25;
        var sp = power * (0.55 + Math.random() * 0.6);
        particles.push({
          x: x, y: y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 1,
          decay: 0.008 + Math.random() * 0.012,
          size: (1.4 + Math.random() * 1.8) * dpr,
          color: pal[Math.floor(Math.random() * pal.length)]
        });
      }
    }

    function launch() {
      if (!running) return;
      if (!document.hidden) {
        var x = W * (0.15 + Math.random() * 0.7);
        var y = H * (0.14 + Math.random() * 0.4);
        burst(x, y);
        if (Math.random() < 0.4) setTimeout(function () { burst(W * (0.2 + Math.random() * 0.6), H * (0.2 + Math.random() * 0.35)); }, 320);
      }
      setTimeout(launch, cfg.fireworkEvery + Math.random() * 2200);
    }

    function draw() {
      if (!running) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(6, 4, 20, 0.22)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.045 * dpr;
        p.x += p.vx * dpr;
        p.y += p.vy * dpr;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) { draw(); launch(); }
    });

    setTimeout(launch, 1200);
    draw();
  })();

  /* =============================================================
     4. JEJAK KURSOR berkilau (desktop kuat saja)
     ============================================================= */
  var trailLayer = $("#trailLayer");
  if (cfg.trail && trailLayer) {
    var lastSpark = 0;
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      var now = performance.now();
      if (now - lastSpark < 55) return;
      lastSpark = now;
      var s = document.createElement("span");
      s.className = "spark";
      s.textContent = Math.random() < 0.5 ? "✦" : "❀";
      s.style.left = e.clientX + "px";
      s.style.top = e.clientY + "px";
      trailLayer.appendChild(s);
      setTimeout(function () { s.remove(); }, 900);
    }, { passive: true });
  }

  /* =============================================================
     5. CAROUSEL FOTO 3D
     ============================================================= */
  var stage = $("#carouselStage");
  if (stage) {
    var items = $$(".c-item", stage);
    var n = items.length;
    var small = window.innerWidth < 640;
    var radius = small ? 230 : 330;
    var current = 0;
    var autoTimer = null;

    function layout() {
      items.forEach(function (it, i) {
        var a = (360 / n) * i;
        it.style.transform = "rotateY(" + a + "deg) translateZ(" + radius + "px)";
      });
    }
    function spin(angle) {
      stage.style.transform = "translateZ(-" + radius + "px) rotateY(" + angle + "deg)";
    }
    function goTo(idx) {
      current = idx;
      spin(-(360 / n) * idx);
    }
    layout();
    goTo(0);

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    var pn = $("#cNext"), pp = $("#cPrev");
    if (pn) pn.addEventListener("click", function () { next(); restartAuto(); });
    if (pp) pp.addEventListener("click", function () { prev(); restartAuto(); });

    function startAuto() {
      if (TIER === 0) return;
      autoTimer = setInterval(function () { if (!document.hidden) next(); }, 3800);
    }
    function restartAuto() { if (autoTimer) clearInterval(autoTimer); startAuto(); }
    startAuto();

    var carouselEl = $("#carousel");
    if (carouselEl) {
      carouselEl.addEventListener("mouseenter", function () { if (autoTimer) clearInterval(autoTimer); });
      carouselEl.addEventListener("mouseleave", startAuto);
    }

    // drag / swipe
    var dragging = false, startX = 0, moved = 0, baseAngle = 0;
    function curAngle() { return -(360 / n) * current; }
    stage.addEventListener("pointerdown", function (e) {
      dragging = true; moved = 0; startX = e.clientX; baseAngle = curAngle();
      stage.classList.add("dragging");
      if (autoTimer) clearInterval(autoTimer);
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      moved = e.clientX - startX;
      spin(baseAngle + moved * 0.35);
    });
    window.addEventListener("pointerup", function () {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("dragging");
      var steps = Math.round(-moved * 0.35 / (360 / n));
      goTo(current + steps);
      restartAuto();
    });

    // klik foto -> lightbox (abaikan jika barusan drag)
    items.forEach(function (it) {
      it.addEventListener("click", function () {
        if (Math.abs(moved) > 6) return;
        var img = $("img", it);
        var cap = it.getAttribute("data-cap") || (img && img.alt) || "";
        openLightbox(img ? img.src : "", cap);
      });
    });
  }

  /* =============================================================
     6. LIGHTBOX
     ============================================================= */
  var lightbox = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbClose = $("#lbClose");
  function openLightbox(src, cap) {
    if (!lightbox) return;
    if (src) lbImg.src = src;
    lbCap.textContent = cap || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
  }
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });

  /* =============================================================
     7. FLOATING STARS (CSS kecil, dekoratif)
     ============================================================= */
  var heartsLayer = $("#heartsLayer");
  if (heartsLayer && TIER !== 0) {
    for (var h = 0; h < cfg.floaterCount; h++) {
      (function () {
        var s = document.createElement("span");
        s.className = "floating-star";
        s.textContent = Math.random() < 0.5 ? "✦" : "✧";
        s.style.left = Math.random() * 100 + "%";
        s.style.fontSize = (Math.random() * 10 + 8) + "px";
        s.style.animationDuration = (Math.random() * 12 + 10) + "s";
        s.style.animationDelay = (Math.random() * 10) + "s";
        heartsLayer.appendChild(s);
      })();
    }
  }

  /* =============================================================
     8. REVEAL ON SCROLL
     ============================================================= */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* =============================================================
     9. DOT NAVIGATION
     ============================================================= */
  var dots = $$(".dot");
  var sections = $$("section[id]");
  function dotTarget(d) {
    var href = d.getAttribute("href") || "";
    return href.charAt(0) === "#" ? href.slice(1) : d.getAttribute("data-target");
  }
  dots.forEach(function (d) {
    d.addEventListener("click", function (e) {
      var t = document.getElementById(dotTarget(d));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }
    });
  });
  if ("IntersectionObserver" in window && sections.length) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = en.target.id;
          dots.forEach(function (d) { d.classList.toggle("active", dotTarget(d) === id); });
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(function (s) { navIo.observe(s); });
  }

  /* =============================================================
     10. TILT 3D pada kartu (desktop kuat saja)
     ============================================================= */
  if (cfg.tilt) {
    $$(".letter, .tl-card, .reason-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateY(" + (px * 7) + "deg) rotateX(" + (-py * 7) + "deg)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* =============================================================
     11. MUSIK latar
     ============================================================= */
  var music = $("#bgMusic");
  var musicBtn = $("#musicToggle");
  if (musicBtn && music) {
    var playing = false;
    musicBtn.addEventListener("click", function () {
      if (playing) { music.pause(); musicBtn.classList.remove("playing"); }
      else { music.play().catch(function () {}); musicBtn.classList.add("playing"); }
      playing = !playing;
    });
  }

  /* =============================================================
     Mulai galaxy
     ============================================================= */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGalaxy);
  } else {
    initGalaxy();
  }
})();
