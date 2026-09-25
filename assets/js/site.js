/* EnerZ — site behaviour. Plain JavaScript, no dependencies. */
(function () {
  'use strict';

  var EMAIL = 'kg@enerz.app';
  var ADVANCE_SECONDS = 8;           // how long each business stays up before the next one
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ref(name) { return document.querySelector('[data-ref="' + name + '"]'); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function replay(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  /* ------------------------------------------------------------------ *
   * Content for the three businesses (What we do)
   * ------------------------------------------------------------------ */
  var PILLARS = {
    fleet: {
      name: 'EnerZ Fleet', dim: 0.12,
      title: 'Electric vehicles that earn on any platform.',
      body: 'E-scooters and e-autos for last-mile delivery, EV cars leased to cab operators, and trucks and buses for freight and intercity routes.',
      proof: 'Uber sustainability contract · signed',
      cta: 'Enquire about leasing', href: '#lease-form',
      clip: 'fleet-handover'
    },
    charge: {
      name: 'EnerZ Charge', dim: 0.08,
      title: 'Charging hubs powered by the sun.',
      body: 'Hubs for cars and buses along every EnerZ route, with solar on the parking shades and roofs, micro-grids and battery storage.',
      proof: '400 kW micro-grid · Mulanthuruthy · in build',
      cta: 'Partner on a hub site', href: '#hub-partner',
      clip: 'charge-hub'
    },
    digital: {
      name: 'EnerZ Digital', dim: 0.46,
      title: 'One app to ride, charge, deliver and pay.',
      body: 'A superapp for riders, and the operations stack behind it: driver app, booking website, dispatch dashboards, dashcams and driver monitoring.',
      proof: 'In build · phase 1',
      cta: 'Talk to us', href: 'mailto:' + EMAIL + '?subject=EnerZ%20platform',
      clip: 'hero-road'
    }
  };
  var ORDER = ['fleet', 'charge', 'digital'];

  /* ------------------------------------------------------------------ *
   * Enquiry forms (Work with EnerZ). Anchors: #lease-form, #logistics-inquiry,
   * #hub-partner, #investor-deck. Submitting opens the visitor's email app.
   * ------------------------------------------------------------------ */
  var FORMS = {
    'lease-form': { title: 'Lease EVs for your cab fleet', intro: 'Passenger EV leasing for cab operators — 3 to 5-year leases, running on Uber or any platform you pick.', subject: 'Cab fleet leasing enquiry', cta: 'Send enquiry' },
    'logistics-inquiry': { title: 'Electric vehicles for your logistics', intro: 'For B2B delivery and commercial transport — from last-mile two- and three-wheelers to 1-tonne refrigerated EV trucks and heavy freight corridors.', subject: 'Logistics fleet enquiry', cta: 'Talk to our fleet team' },
    'hub-partner': { title: 'Host an EnerZ charging hub', intro: 'We are looking for sites for solar-backed charging hubs, micro-grids and highway amenity spaces.', subject: 'Hub site partnership', cta: 'Submit your site' },
    'investor-deck': { title: 'Request the investor deck', intro: 'For institutional lenders and debt or equity partners.', subject: 'Investor deck request', cta: 'Request the deck' }
  };

  /* ------------------------------------------------------------------ *
   * Video: muted autoplay, only while visible
   * ------------------------------------------------------------------ */
  var heroVideo = ref('heroVideo');
  var pillarVideo = ref('pillarVideo');
  var heroVisible = true;
  var stageInView = false;
  var gestureArmed = false;

  function forcePlay(v) {
    if (!v) return;
    try {
      v.muted = true; v.defaultMuted = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      var p = v.play();
      if (p && typeof p.catch === 'function') p.catch(function (err) { if (err && err.name === 'NotAllowedError') armGesture(); });
    } catch (e) { armGesture(); }
  }
  function armGesture() {
    if (gestureArmed) return;
    gestureArmed = true;
    function kick() {
      if (heroVisible) forcePlay(heroVideo);
      if (stageInView) forcePlay(pillarVideo);
      document.removeEventListener('pointerdown', kick, true);
      window.removeEventListener('scroll', kick, true);
      gestureArmed = false;
    }
    document.addEventListener('pointerdown', kick, true);
    window.addEventListener('scroll', kick, true);
  }

  /* ------------------------------------------------------------------ *
   * What we do: tabs, auto-advance with a progress line, video per business
   * ------------------------------------------------------------------ */
  var current = 'fleet';
  var auto = !reduce;
  var timer = null;
  var pText = ref('pText');
  var pDim = ref('pDim');
  var pPhone = ref('pPhone');
  var tabs = all('[data-tab]');

  function bind(root, key, value) { var el = root && root.querySelector('[data-bind="' + key + '"]'); if (el) el.textContent = value; }

  function renderFills() {
    var running = auto && stageInView;
    all('[data-fill]').forEach(function (f) {
      var active = f.getAttribute('data-fill') === current;
      f.classList.remove('ez-fill-run');
      f.style.animationDuration = ADVANCE_SECONDS + 's';
      if (active && running) { f.style.width = '0%'; void f.offsetWidth; f.classList.add('ez-fill-run'); }
      else f.style.width = active ? '100%' : '0%';
    });
  }

  function setPillar(key) {
    var p = PILLARS[key]; if (!p) return;
    var changed = key !== current;
    current = key;
    if (pText) {
      bind(pText, 'name', p.name); bind(pText, 'title', p.title); bind(pText, 'body', p.body);
      bind(pText, 'proof', p.proof); bind(pText, 'cta', p.cta);
      var link = pText.querySelector('[data-bind-href]'); if (link) link.setAttribute('href', p.href);
      if (changed) replay(pText, 'ez-swap');
    }
    if (pDim) pDim.style.opacity = String(p.dim);
    if (pPhone) { pPhone.hidden = key !== 'digital'; if (key === 'digital') replay(pPhone, 'ez-swap'); }
    if (pillarVideo && changed) {
      var base = 'assets/media/' + p.clip;
      pillarVideo.poster = base + '.jpg';
      var sources = pillarVideo.querySelectorAll('source');
      sources[0].src = base + '.mp4'; sources[1].src = base + '.webm';
      pillarVideo.load();
      replay(pillarVideo, 'ez-fade');
      if (stageInView) forcePlay(pillarVideo);
    }
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === key;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.style.opacity = on ? '1' : '0.46';
    });
    renderFills();
  }

  function schedule() {
    clearTimeout(timer); timer = null;
    if (auto && stageInView) timer = setTimeout(function () {
      if (!auto || !stageInView) return;
      setPillar(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
      schedule();
    }, ADVANCE_SECONDS * 1000);
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      auto = false; clearTimeout(timer); timer = null;   // the visitor takes over
      setPillar(t.getAttribute('data-tab'));
    });
  });
  if (pillarVideo) pillarVideo.pause();

  /* ------------------------------------------------------------------ *
   * Scroll: nav reads the scene, hero settles, fog lifts, the stage grows
   * ------------------------------------------------------------------ */
  var nav = ref('nav'), about = ref('about'), news = ref('news');
  var heroMedia = ref('heroMedia'), heroDim = ref('heroDim'), fog = ref('fog'), stage = ref('stage');
  var raf = 0;

  function crosses(el, y) { if (!el) return false; var b = el.getBoundingClientRect(); return b.top <= y && b.bottom >= y; }

  function applyScroll() {
    raf = 0;
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    var vh = window.innerHeight || 800;
    var line = nav ? nav.offsetHeight / 2 : 38;
    if (nav) {
      var light = crosses(about, line) || crosses(news, line);
      nav.classList.toggle('is-light', light);
      nav.classList.toggle('is-dark', !light && y > 24);
    }
    var stageH = (heroMedia && heroMedia.parentElement && heroMedia.parentElement.offsetHeight) || 900;
    var p = Math.max(0, Math.min(1, y / stageH));
    if (heroDim) heroDim.style.opacity = (p * 0.40).toFixed(3);
    if (!reduce) {
      if (heroMedia) heroMedia.style.transform = 'scale(' + (1 + p * 0.06).toFixed(4) + ')';
      if (fog) fog.style.transform = 'translateY(' + (-p * 70).toFixed(1) + 'px)';
    }
    if (stage) {
      var q = 1;
      if (!reduce) {
        var top = stage.getBoundingClientRect().top;
        q = Math.max(0, Math.min(1, 1 - top / vh));
        q = q * q * (3 - 2 * q);
      }
      var edge = Math.min(48, window.innerWidth * 0.04), round = Math.min(36, window.innerWidth * 0.06);
      stage.style.clipPath = 'inset(0 ' + (edge * (1 - q)).toFixed(1) + 'px round ' + (round * (1 - q)).toFixed(1) + 'px)';
    }
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(applyScroll); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ------------------------------------------------------------------ *
   * Observers: reveal on entry, play what can be seen
   * ------------------------------------------------------------------ */
  if ('IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0.02 });
    all('[data-reveal]').forEach(function (el) { rio.observe(el); });

    var hero = ref('hero');
    if (hero) new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        heroVisible = e.isIntersecting;
        if (!heroVideo) return;
        if (heroVisible) forcePlay(heroVideo); else heroVideo.pause();
      });
    }, { threshold: 0 }).observe(hero);

    var wwd = ref('wwd');
    if (wwd) new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var vis = e.isIntersecting && e.intersectionRatio >= 0.35;
        if (vis && !stageInView) { stageInView = true; forcePlay(pillarVideo); renderFills(); schedule(); }
        else if (!vis && stageInView) { stageInView = false; if (pillarVideo) pillarVideo.pause(); clearTimeout(timer); timer = null; renderFills(); }
      });
    }, { threshold: [0, 0.35, 0.6] }).observe(wwd);
  } else {
    all('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
    stageInView = true; forcePlay(heroVideo); forcePlay(pillarVideo); renderFills(); schedule();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (heroVideo) heroVideo.pause(); if (pillarVideo) pillarVideo.pause(); }
    else { if (heroVisible) forcePlay(heroVideo); if (stageInView) forcePlay(pillarVideo); }
  });

  /* ------------------------------------------------------------------ *
   * Newsroom filter
   * ------------------------------------------------------------------ */
  var newsWrap = ref('newsWrap');
  all('[data-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      all('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      all('[data-kind]', newsWrap).forEach(function (item) {
        var kind = item.getAttribute('data-kind');
        item.hidden = !(f === 'all' || (f === 'milestones' && kind === 'milestone') || (f === 'press' && kind === 'press'));
      });
      replay(newsWrap, 'ez-swap');
    });
  });

  /* ------------------------------------------------------------------ *
   * Enquiry sheet
   * ------------------------------------------------------------------ */
  var modal = ref('modal'), scrim = ref('scrim'), sheet = modal && modal.querySelector('[role="dialog"]');
  var form = ref('form'), sent = ref('sent'), hint = ref('hint');
  var HINT = hint ? hint.textContent : '';
  var openId = null, lastFocus = null, closeTimer = null;

  function activeSection() { return form && form.querySelector('[data-form="' + openId + '"]'); }
  function setHint(msg) { if (!hint) return; hint.textContent = msg || HINT; hint.style.color = msg ? '#E8A48C' : 'rgba(255,255,255,0.5)'; }

  function openForm(id, fromEl) {
    var cfg = FORMS[id]; if (!cfg || !modal) return;
    clearTimeout(closeTimer);
    openId = id; lastFocus = fromEl || document.activeElement;
    bind(sheet, 'fTitle', cfg.title); bind(sheet, 'fIntro', cfg.intro); bind(form, 'fCta', cfg.cta);
    all('[data-form]', form).forEach(function (sec) { sec.hidden = sec.getAttribute('data-form') !== id; });
    all('[data-form-note]', form).forEach(function (n) { n.hidden = n.getAttribute('data-form-note') !== id; });
    all('.is-bad', form).forEach(function (el) { el.classList.remove('is-bad'); });
    setHint('');
    form.hidden = false; sent.hidden = true;
    // the sheet grows out of whatever opened it
    var origin = '50% 50%';
    if (fromEl && fromEl.getBoundingClientRect && window.innerWidth > 560) {
      var b = fromEl.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
      var sw = Math.min(680, vw - 64), sh = Math.min(640, vh - 64);
      origin = Math.round(b.left + b.width / 2 - (vw - sw) / 2) + 'px ' + Math.round(b.top + b.height / 2 - (vh - sh) / 2) + 'px';
    }
    sheet.style.transformOrigin = origin;
    scrim.classList.remove('is-closing'); sheet.classList.remove('is-closing');
    modal.hidden = false;
    replay(scrim, 'ez-scrim'); replay(sheet, 'ez-sheet');
    sheet.scrollTop = 0;
    document.documentElement.style.overflow = 'hidden';
    try { if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id); } catch (e) {}
    setTimeout(function () {
      var first = activeSection() && activeSection().querySelector('input, select, textarea');
      if (first) try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
    }, 60);
  }

  function closeForm() {
    if (!openId || !modal) return;
    scrim.classList.add('is-closing'); sheet.classList.add('is-closing');
    closeTimer = setTimeout(function () {
      modal.hidden = true; openId = null;
      document.documentElement.style.overflow = '';
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
      if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
    }, reduce ? 10 : 220);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var sec = activeSection(), cfg = FORMS[openId]; if (!sec || !cfg) return;
      var bad = null;
      all('[data-required]', sec).forEach(function (el) {
        var v = String(el.value || '').trim();
        var miss = !v || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
        el.classList.toggle('is-bad', miss);
        if (miss && !bad) bad = el;
      });
      if (bad) { setHint('Please add your name and a valid email so we can reply.'); bad.focus(); return; }
      var lines = [], seen = {};
      all('input, select, textarea', sec).forEach(function (el) {
        var n = el.name; if (!n) return;
        if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
        var v = String(el.value || '').trim(); if (!v) return;
        if (seen[n] != null) lines[seen[n]] += ', ' + v; else { seen[n] = lines.length; lines.push(n + ': ' + v); }
      });
      var body = 'Hi EnerZ,\r\n\r\n' + lines.join('\r\n') + '\r\n';
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(cfg.subject) + '&body=' + encodeURIComponent(body);
      form.hidden = true; sent.hidden = false;
    });
    form.addEventListener('input', function (e) {
      if (e.target && e.target.classList) e.target.classList.remove('is-bad');
      if (!form.querySelector('.is-bad')) setHint('');
    });
  }

  document.addEventListener('click', function (e) {
    var act = e.target.closest && e.target.closest('[data-action]');
    if (act) {
      var a = act.getAttribute('data-action');
      if (a === 'close') { closeForm(); return; }
      if (a === 'reopen') { form.hidden = false; sent.hidden = true; return; }
    }
    var link = e.target.closest && e.target.closest('a[href^="#"]');
    if (link) {
      var id = link.getAttribute('href').slice(1);
      if (FORMS[id]) { e.preventDefault(); closeMenu(); openForm(id, link); }
    }
  });
  document.addEventListener('keydown', function (e) {
    if (!openId) { if (e.key === 'Escape') closeMenu(); return; }
    if (e.key === 'Escape') { closeForm(); return; }
    if (e.key === 'Tab') {
      var f = all('button, a[href], input, select, textarea', sheet).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  function fromHash() { var id = (location.hash || '').slice(1); if (FORMS[id] && openId !== id) openForm(id, null); }
  window.addEventListener('hashchange', fromHash);

  /* ------------------------------------------------------------------ *
   * Phone menu
   * ------------------------------------------------------------------ */
  var menuBtn = ref('menuBtn'), menu = ref('menu');
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu');
    nav.classList.remove('is-menu');
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-menu', open);
    });
    all('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  /* ------------------------------------------------------------------ */
  setPillar('fleet');
  applyScroll();
  forcePlay(heroVideo);
  setTimeout(fromHash, 0);
})();
