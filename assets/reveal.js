// Scroll-reveal: fade + rise on sections, steps and stats (staggered).
// Progressive enhancement only — if this file fails, reduced motion is
// requested, or IntersectionObserver is missing, everything stays visible.
(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;
  var els = document.querySelectorAll('.sec, .step, .stat, .frame, .preview, .poster');
  if (!els.length) return;
  document.documentElement.classList.add('io');
  els.forEach(function (el) {
    el.classList.add('rv');
    var sibs = Array.prototype.indexOf.call(el.parentElement.children, el);
    el.style.setProperty('--d', ((sibs % 6) * 60) + 'ms');
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(function (el) { io.observe(el); });
})();
