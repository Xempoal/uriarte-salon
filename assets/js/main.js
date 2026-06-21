/* ===================================================================
   URIARTE SALÓN — interacciones
   =================================================================== */
(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---- Año dinámico ---- */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---- Loader ---- */
  window.addEventListener('load', () => {
    const l = $('#loader');
    if (l) setTimeout(() => l.classList.add('done'), 550);
  });

  /* ---- Header al hacer scroll ---- */
  const header = $('#header');
  const onScrollHeader = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScrollHeader();

  /* ---- Menú móvil ---- */
  const toggle = $('#navToggle');
  const menu = $('#mobileMenu');
  const setMenu = (open) => {
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ===================================================================
     TOUR 3D — la cámara avanza por el estudio mientras haces scroll
     =================================================================== */
  const tour = $('.tour');
  const planes = $$('[data-plane]');
  const sceneBg = $('[data-tour-bg]');
  const progressBar = $('[data-progress]');
  const SPEED = 2600;       // px de profundidad por unidad de progreso
  const last = planes.length - 1;
  // puntos focales: cada plano queda centrado en este progreso
  const focal = planes.map((_, i) => 0.05 + (i / last) * 0.86);

  function renderTour() {
    if (!tour) return;
    const rect = tour.getBoundingClientRect();
    const total = tour.offsetHeight - window.innerHeight;
    let p = total > 0 ? (-rect.top) / total : 0;
    p = Math.min(1, Math.max(0, p));

    planes.forEach((plane, i) => {
      let d = p - focal[i];
      if (i === 0 && d < 0) d = 0;        // el primero descansa al inicio
      if (i === last && d > 0) d = 0;      // el último se queda al final
      const z = d * SPEED;
      const scale = 1 + d * 0.45;
      let op;
      if (d <= 0) op = 1 - Math.min(1, (-d) / 0.20);   // se acerca desde el fondo
      else op = 1 - Math.min(1, d / 0.12);             // pasa junto a la cámara
      op = Math.max(0, op);
      plane.style.opacity = op.toFixed(3);
      plane.style.transform = `translate(-50%,-50%) translateZ(${z.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      plane.style.pointerEvents = op > 0.6 ? 'auto' : 'none';
      plane.style.zIndex = String(Math.round(z));
    });

    if (sceneBg) sceneBg.style.transform = `scale(${(1.1 + p * 0.18).toFixed(3)}) translateY(${(-p * 4).toFixed(2)}%)`;
    if (progressBar) progressBar.style.width = (p * 100).toFixed(1) + '%';
  }

  /* ---- Parallax suave (estudio) ---- */
  const parallax = $$('[data-parallax]');
  function renderParallax() {
    parallax.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const off = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      el.style.transform = `translateY(${(off * -7).toFixed(2)}%)`;
    });
  }

  /* rAF throttle */
  let ticking = false;
  function onScroll() {
    onScrollHeader();
    if (reduceMotion) return;
    if (!ticking) { requestAnimationFrame(() => { renderTour(); renderParallax(); ticking = false; }); ticking = true; }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { if (!reduceMotion) renderTour(); }, { passive: true });
  if (!reduceMotion) { renderTour(); renderParallax(); }
})();
