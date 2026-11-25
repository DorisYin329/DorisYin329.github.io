/* =========================================================
   Shadow Moon — main.js (Vanilla JS, no dependencies)
   模組：1.初始化 2.導覽 3.捲動偵測 4.捲動顯示 5.星空 6.專案視窗
   ========================================================= */
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* 1. 初始化 ---------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* 2. 行動版導覽 ------------------------------------------------ */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    nav.classList.toggle('is-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setNav(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) setNav(false);
    });
  }

  /* 3. 導覽高亮（Scroll spy） ------------------------------------ */
  var links = Array.prototype.slice.call(document.querySelectorAll('.primary-nav a[data-section]'));
  var sections = links
    .map(function (a) { return document.getElementById(a.dataset.section); })
    .filter(Boolean);

  function setActive(id) {
    links.forEach(function (a) {
      var on = a.dataset.section === id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* 4. 捲動顯示 -------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* 5. 星空 Canvas ----------------------------------------------- */
  var canvas = document.getElementById('starfield');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

  if (ctx) {
    var stars = [];
    var rafId = null;
    var w = 0, h = 0, dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 星星數量依螢幕面積調整，上限 140
      var count = Math.min(45, Math.round((w * h) / 24000));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.2 + 0.3,
          base: Math.random() * 0.5 + 0.3,
          speed: Math.random() * 0.0015 + 0.0006,
          phase: Math.random() * Math.PI * 2
        });
      }
      draw(performance.now());
    }

    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      var animate = !reduceMotion.matches;
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var a = animate ? s.base + Math.sin(t * s.speed + s.phase) * 0.3 : s.base;
        ctx.globalAlpha = Math.max(0.08, Math.min(1, a));
        ctx.fillStyle = '#A9B9D8';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function loop(t) {
      draw(t);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      if (rafId === null && !reduceMotion.matches && !document.hidden) {
        rafId = requestAnimationFrame(loop);
      }
    }
    function stop() {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    var onMotionChange = function () {
      if (reduceMotion.matches) { stop(); draw(0); } else { start(); }
    };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotionChange);
    else if (reduceMotion.addListener) reduceMotion.addListener(onMotionChange);

    resize();
    start();
  }

  /* 6. 專案詳情視窗 ---------------------------------------------- */
  var dialog = document.getElementById('project-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    var titleEl = document.getElementById('dialog-title');
    var summaryEl = document.getElementById('dialog-summary');

    document.querySelectorAll('[data-project-details]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        titleEl.textContent = btn.dataset.title || '';
        summaryEl.textContent = btn.dataset.summary || '';
        dialog.showModal();
      });
    });

    // 點擊視窗外側關閉
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
  } else {
    // 不支援 <dialog> 時，隱藏 View Details 按鈕
    document.querySelectorAll('[data-project-details]').forEach(function (btn) {
      btn.hidden = true;
    });
  }
})();
