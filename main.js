/**
 * main.js — Beyaz Gül · Eda
 * Ultra Premium Cinematic Animation Engine
 * Uses: GSAP (CDN), Lenis Scroll (CDN), Canvas 2D
 */

/* ═══════════════════════════════════════════════════════
   GLOBAL STATE
   ═══════════════════════════════════════════════════════ */
const STATE = {
  mouse: { x: 0.5, y: 0.5 },
  audioReady: false,
  phase: 'black', // black → particles → scroll
};

/* ═══════════════════════════════════════════════════════
   MOUSE TRACKING
   ═══════════════════════════════════════════════════════ */
window.addEventListener('mousemove', (e) => {
  STATE.mouse.x = e.clientX / window.innerWidth;
  STATE.mouse.y = e.clientY / window.innerHeight;
});
window.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  STATE.mouse.x = t.clientX / window.innerWidth;
  STATE.mouse.y = t.clientY / window.innerHeight;
}, { passive: true });

/* ═══════════════════════════════════════════════════════
   CANVAS SETUP UTILITY
   ═══════════════════════════════════════════════════════ */
function setupCanvas(canvas, options = {}) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    if (options.fullscreen) {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    } else if (options.parent) {
      const p = canvas.parentElement;
      canvas.width = p.offsetWidth * dpr;
      canvas.height = p.offsetHeight * dpr;
      canvas.style.width = p.offsetWidth + 'px';
      canvas.style.height = p.offsetHeight + 'px';
    }
    ctx.scale(dpr, dpr);
  }

  resize();
  if (!options.noResize) window.addEventListener('resize', resize);
  return { ctx, dpr, resize };
}

/* ═══════════════════════════════════════════════════════
   1. OPENING PARTICLES
   ═══════════════════════════════════════════════════════ */
class ParticleSystem {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.setup = setupCanvas(canvas, { fullscreen: true });
    this.ctx = this.setup.ctx;
    this.particles = [];
    this.count = options.count || 80;
    this.active = false;
    this.opacity = 1;
    this._init();
    this._loop();
  }

  _init() {
    for (let i = 0; i < this.count; i++) {
      this.particles.push(this._newParticle(true));
    }
  }

  _newParticle(random = false) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      x: Math.random() * w,
      y: random ? Math.random() * h : -10,
      vx: (Math.random() - 0.5) * 0.3,
      vy: Math.random() * 0.4 + 0.1,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
    };
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    if (!this.active) return;

    const { ctx } = this;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    this.particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.twinkle += p.twinkleSpeed;

      if (p.y > h + 10) {
        this.particles[i] = this._newParticle(false);
        return;
      }

      const alpha = p.alpha * (0.7 + 0.3 * Math.sin(p.twinkle)) * this.opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });
  }

  start() { this.active = true; }
  stop() { this.active = false; }
}

/* ═══════════════════════════════════════════════════════
   2. FALLING PETALS (Section 3)
   ═══════════════════════════════════════════════════════ */
class FallingPetals {
  constructor(canvas) {
    this.canvas = canvas;
    this.setup = setupCanvas(canvas, { fullscreen: true });
    this.ctx = this.setup.ctx;
    this.petals = [];
    this.active = false;
    this._init();
    this._loop();
  }

  _init() {
    for (let i = 0; i < 30; i++) {
      this.petals.push(this._new(true));
    }
  }

  _new(random = false) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return {
      x: Math.random() * w,
      y: random ? Math.random() * h : -20,
      vy: 0.5 + Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.5,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.02,
      size: 8 + Math.random() * 12,
      alpha: 0.1 + Math.random() * 0.25,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.01,
    };
  }

  _drawPetal(ctx, x, y, size, rot, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.4, size, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();

    // Petal vein
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    if (!this.active) return;

    const { ctx } = this;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    this.petals.forEach((p, i) => {
      p.sway += p.swaySpeed;
      p.x += p.vx + Math.sin(p.sway) * 0.5;
      p.y += p.vy;
      p.rot += p.rotV;

      if (p.y > h + 30) {
        this.petals[i] = this._new(false);
        return;
      }

      this._drawPetal(ctx, p.x, p.y, p.size, p.rot, p.alpha);
    });
  }

  start() { this.active = true; }
}

/* ═══════════════════════════════════════════════════════
   3. STAR FIELD + ROSE CONSTELLATION (Section 4)
   ═══════════════════════════════════════════════════════ */
class StarField {
  constructor(canvas) {
    this.canvas = canvas;
    this.setup = setupCanvas(canvas, { fullscreen: true });
    this.ctx = this.setup.ctx;
    this.stars = [];
    this.roseStars = [];
    this.phase = 0; // 0=off, 1=appear, 2=converge
    this.progress = 0;
    this.active = false;
    this._init();
    this._loop();
  }

  _init() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Background stars
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.6 + 0.1,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.015 + 0.005,
      });
    }

    // Rose constellation points (normalized 0–1)
    const rosePoints = this._getRosePoints();
    const cx = w * 0.5;
    const cy = h * 0.42;
    const roseSize = Math.min(w, h) * 0.28;

    this.roseStars = rosePoints.map((p, i) => ({
      // Start: scattered position
      startX: Math.random() * w,
      startY: Math.random() * h,
      // End: rose position
      endX: cx + (p.x - 0.5) * roseSize * 2,
      endY: cy + (p.y - 0.5) * roseSize * 2,
      x: 0, y: 0,
      size: 1.5 + Math.random() * 1.5,
      alpha: 0,
      twinkle: Math.random() * Math.PI * 2,
      delay: i * 0.012,
    }));

    // Initialize positions
    this.roseStars.forEach(s => { s.x = s.startX; s.y = s.startY; });
  }

  _getRosePoints() {
    // Parametric rose (rhodonea) + petal outlines
    const pts = [];
    const steps = 80;

    // Outer petals
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const r = 0.35 + 0.15 * Math.cos(6 * t);
      pts.push({ x: 0.5 + r * Math.cos(t), y: 0.5 + r * Math.sin(t) });
    }

    // Inner spiral
    for (let i = 0; i < 40; i++) {
      const t = (i / 40) * Math.PI * 4;
      const r = 0.05 + 0.15 * (i / 40);
      pts.push({ x: 0.5 + r * Math.cos(t), y: 0.5 + r * Math.sin(t) });
    }

    return pts;
  }

  start() {
    this.active = true;
    this.phase = 1;
    setTimeout(() => {
      this.phase = 2;
    }, 2500);
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    if (!this.active) return;

    const { ctx } = this;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    // Background stars
    this.stars.forEach(s => {
      s.twinkle += s.twinkleSpeed;
      const a = s.alpha * (0.7 + 0.3 * Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });

    // Rose stars
    if (this.phase >= 1) {
      this.progress = Math.min(this.progress + (this.phase === 2 ? 0.005 : 0.003), 1);

      this.roseStars.forEach((s, i) => {
        const localProgress = Math.max(0, Math.min(1, (this.progress - s.delay) / (1 - s.delay)));
        const eased = this._easeInOut(localProgress);

        if (this.phase === 2) {
          s.x = s.startX + (s.endX - s.startX) * eased;
          s.y = s.startY + (s.endY - s.startY) * eased;
        }

        s.twinkle += 0.03;
        s.alpha = Math.min(s.alpha + 0.01, 0.6 + 0.3 * Math.sin(s.twinkle));

        // Glow for rose stars when converged
        const convergence = this.phase === 2 ? eased : 0;
        if (convergence > 0.8) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${convergence * 0.08})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
      });
    }
  }

  _easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
}

/* ═══════════════════════════════════════════════════════
   4. GLOBAL AMBIENT PARTICLES
   ═══════════════════════════════════════════════════════ */
class GlobalParticles {
  constructor(canvas) {
    this.canvas = canvas;
    this.setup = setupCanvas(canvas, { fullscreen: true });
    this.ctx = this.setup.ctx;
    this.particles = [];
    this._init();
    this._loop();
  }

  _init() {
    for (let i = 0; i < 50; i++) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.2 + 0.2,
        alpha: Math.random() * 0.2 + 0.05,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  }

  _loop() {
    requestAnimationFrame(() => this._loop());
    const { ctx } = this;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.twinkle += 0.008;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      const a = p.alpha * (0.6 + 0.4 * Math.sin(p.twinkle));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });
  }
}

/* ═══════════════════════════════════════════════════════
   MAIN ORCHESTRATION
   ═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initApp, 200);
});

// Also try immediately in case DOMContentLoaded already fired
if (document.readyState !== 'loading') {
  setTimeout(initApp, 200);
}

function initApp() {
  if (initApp._done) return;
  initApp._done = true;

  /* — Register GSAP plugins — */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* — Init Lenis — */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.6,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    function rafLenis(time) {
      lenis.raf(time);
      requestAnimationFrame(rafLenis);
    }
    requestAnimationFrame(rafLenis);

    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
    }
  }

  /* — Init systems — */
  const particles = new ParticleSystem(document.getElementById('c-particles'));
  const petals = new FallingPetals(document.getElementById('c-petals'));
  const stars = new StarField(document.getElementById('c-stars'));
  new GlobalParticles(document.getElementById('c-global-particles'));

  /* ─── MASTER TIMELINE ──────────────────────────────── */
  /* Particles start immediately — no black screen delay */
  particles.start();
  STATE.phase = 'particles';

  /* Small delay then enable scroll animations */
  setTimeout(() => {
    STATE.phase = 'scroll';
    setupScrollAnimations(petals, stars);
  }, 300);
}

/* ─── SCROLL ANIMATIONS ────────────────────────────────── */
function setupScrollAnimations(petals, stars) {
  if (!window.gsap || !window.ScrollTrigger) {
    // Fallback: Intersection Observer
    setupIntersectionObserver(petals, stars);
    return;
  }

  /* Section 2 — Text reveals: scroll'a gelince başla */
  const textTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '#s-text',
      start: 'top 80%',
      once: true,
    }
  });

  textTimeline
    .to('#ct-1', { opacity: 1, duration: 1.2, ease: 'power2.out' })
    .to('#ct-1', { opacity: 0, duration: 0.8, ease: 'power2.in' }, '+=1.5')

    .to('#ct-2', { opacity: 1, duration: 1.2, ease: 'power2.out' }, '+=0.2')
    .to('#ct-2', { opacity: 0, duration: 0.8, ease: 'power2.in' }, '+=1.5')

    .to('#ct-3', { opacity: 1, duration: 1.0, ease: 'power2.out' }, '+=0.2')
    .to('#ct-3', { opacity: 0, duration: 0.6, ease: 'power2.in' }, '+=1.2')

    .to('#mw-1', { opacity: 1, duration: 0.9, ease: 'power2.out' }, '+=0.2')
    .to('#mw-1', { opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=1.0')
    .to('#mw-2', { opacity: 1, duration: 0.9, ease: 'power2.out' }, '-=0.1')
    .to('#mw-2', { opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=1.0')
    .to('#mw-3', { opacity: 1, duration: 0.9, ease: 'power2.out' }, '-=0.1')
    .to('#mw-3', { opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=1.0')
    .to('#mw-4', { opacity: 1, duration: 1.2, ease: 'power2.out' }, '-=0.1');

  /* Section 3 — Eda name + message */
  ScrollTrigger.create({
    trigger: '#s-Eda',
    start: 'top 70%',
    once: true,
    onEnter: () => {
      petals.start();
      typeEda();
    }
  });

  /* Section 4 — Finale */
  ScrollTrigger.create({
    trigger: '#s-finale',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      stars.start();
      gsap.to('#fq-1', { opacity: 1, y: 0, duration: 1.8, delay: 1, ease: 'power2.out' });
      gsap.to('#fq-2', { opacity: 1, y: 0, duration: 1.5, delay: 2.8, ease: 'power2.out' });
    }
  });
}

/* ─── FALLBACK: IntersectionObserver ─────────────────── */
function setupIntersectionObserver(petals, stars) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const id = entry.target.id;
      if (id === 's-text') revealTextSequence();
      if (id === 's-Eda') { petals.start(); typeEda(); }
      if (id === 's-finale') {
        stars.start();
        setTimeout(() => {
          fadeIn('#fq-1', 1000);
          setTimeout(() => fadeIn('#fq-2', 800), 2000);
        }, 1000);
      }
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  observer.observe(document.getElementById('s-text'));
  observer.observe(document.getElementById('s-Eda'));
  observer.observe(document.getElementById('s-finale'));
}

function fadeIn(sel, dur) {
  const el = document.querySelector(sel);
  if (!el) return;
  el.style.transition = `opacity ${dur}ms ease, transform ${dur}ms ease`;
  el.style.opacity = 1;
  el.style.transform = 'translateY(0)';
}

function revealTextSequence() {
  const seq = [
    { id: '#ct-1', showDur: 1200, holdDur: 1500, hideDur: 800 },
    { id: '#ct-2', showDur: 1200, holdDur: 1500, hideDur: 800 },
    { id: '#ct-3', showDur: 1000, holdDur: 1200, hideDur: 600 },
    { id: '#mw-1', showDur: 900, holdDur: 1000, hideDur: 500 },
    { id: '#mw-2', showDur: 900, holdDur: 1000, hideDur: 500 },
    { id: '#mw-3', showDur: 900, holdDur: 1000, hideDur: 500 },
    { id: '#mw-4', showDur: 1200, holdDur: 3000, hideDur: 0 },
  ];

  let t = 0;
  seq.forEach(s => {
    setTimeout(() => fadeIn(s.id, s.showDur), t);
    t += s.showDur + s.holdDur;
    if (s.hideDur > 0) {
      setTimeout(() => {
        const el = document.querySelector(s.id);
        if (el) { el.style.transition = `opacity ${s.hideDur}ms ease`; el.style.opacity = 0; }
      }, t);
      t += s.hideDur;
    }
    t += 200;
  });
}

/* ─── Eda NAME TYPEWRITER ────────────────────────────── */
function typeEda() {
  const nameEl = document.getElementById('Eda-name');
  const letters = ['E', 'Ed', 'Eda', 'Eda'];
  let i = 0;

  gsap.to(nameEl, { opacity: 1, duration: 0.5 });

  const interval = setInterval(() => {
    if (i < letters.length) {
      nameEl.textContent = letters[i];
      i++;
    } else {
      clearInterval(interval);
      // After name complete, reveal message lines
      revealMessage();
    }
  }, 400);
}

function revealMessage() {
  const lines = ['#rm-l1','#rm-l2','#rm-l3','#rm-l4','#rm-l5','#rm-l6','#rm-l7','#rm-l8'];

  if (window.gsap) {
    gsap.to(lines, {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.25,
      delay: 0.3,
      ease: 'power2.out',
    });
  } else {
    lines.forEach((sel, i) => {
      setTimeout(() => fadeIn(sel, 800), 500 + i * 300);
    });
  }
}

/* ─── MIST OVERLAY ─────────────────────────────────────── */
const mist = document.createElement('div');
mist.className = 'mist-overlay';
document.body.appendChild(mist);

/* ─── SCROLL INDICATOR ─────────────────────────────────── */
(function () {
  const indicator = document.getElementById('scroll-indicator');
  if (!indicator) return;

  // Tıklanınca bir sonraki bölüme git
  indicator.addEventListener('click', () => {
    const nextSection = document.getElementById('s-text');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Kaydırınca göstergeyi gizle
  let hidden = false;
  function onScroll() {
    if (!hidden && window.scrollY > 60) {
      indicator.classList.add('hidden');
      hidden = true;
      window.removeEventListener('scroll', onScroll);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();
