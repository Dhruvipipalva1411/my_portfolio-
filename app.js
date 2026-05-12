/* ══════════════════════════════════════════════════════════════════
   Dhruvi Pipalva — Portfolio · app.js
   Handles: Loader, Particle Canvas, Custom Cursor, Navbar,
            Typing Animation, Scroll Reveal, Counter Animation,
            Timeline, Mobile Menu, Contact Form, Back-to-Top
══════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   1. LOADER
───────────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Hide loader after 1.8 s (matches CSS bar animation + small buffer)
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      // Trigger first-view reveal after loader hides
      document.querySelectorAll('[data-reveal]').forEach(el => {
        if (isInViewport(el)) el.classList.add('revealed');
      });
    }, 1800);
  });
})();

/* ─────────────────────────────────────────────
   2. UTILITY: isInViewport
───────────────────────────────────────────── */
function isInViewport(el, threshold = 0.15) {
  const rect = el.getBoundingClientRect();
  const windowH = window.innerHeight;
  return rect.top < windowH * (1 - threshold) && rect.bottom > windowH * threshold;
}

/* ─────────────────────────────────────────────
   3. PARTICLE CANVAS
   Lightweight floating-dot field with subtle
   mouse-parallax drift.
───────────────────────────────────────────── */
(function initParticles() {
  const canvas  = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx     = canvas.getContext('2d');
  let W, H, particles, mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.min(Math.floor((W * H) / 15000), 80);
    particles = Array.from({ length: count }, () => ({
      x:    Math.random() * W,
      y:    Math.random() * H,
      r:    Math.random() * 1.5 + 0.3,
      vx:   (Math.random() - 0.5) * 0.25,
      vy:   (Math.random() - 0.5) * 0.25,
      /* Alternates between accent violet and accent-2 cyan */
      hue:  Math.random() > 0.5 ? '124,58,237' : '6,182,212',
      a:    Math.random() * 0.5 + 0.15,
    }));
  }

  function drawLine(p1, p2, dist) {
    const alpha = (1 - dist / 120) * 0.12;
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${p1.hue},${alpha})`;
    ctx.lineWidth   = 0.6;
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      // Gentle mouse repulsion
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        p.vx += (dx / d) * 0.08;
        p.vy += (dy / d) * 0.08;
      }

      // Speed cap
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 0.8) { p.vx *= 0.8 / speed; p.vy *= 0.8 / speed; }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${p.a})`;
      ctx.fill();
    });

    // Draw connecting lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) drawLine(particles[i], particles[j], dist);
      }
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => { resize(); createParticles(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  resize();
  createParticles();
  animate();
})();

/* ─────────────────────────────────────────────
   4. CUSTOM CURSOR (desktop only)
───────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Ring smoothly follows with lag
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Expand ring on interactive elements
  const interactives = 'a, button, .skill-pill, .project-card, .cert-card, .social-chip';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });
})();

/* ─────────────────────────────────────────────
   5. NAVBAR — scroll behaviour + active link
───────────────────────────────────────────── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const backTop  = document.getElementById('backTop');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    const y = window.scrollY;

    // Sticky style
    if (navbar) navbar.classList.toggle('scrolled', y > 40);

    // Back-to-top button
    if (backTop) backTop.classList.toggle('visible', y > 500);

    // Active nav link based on current section
    let current = '';
    sections.forEach(sec => {
      if (y >= sec.offsetTop - 120) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Back to top
  if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
})();

/* ─────────────────────────────────────────────
   6. MOBILE MENU TOGGLE
───────────────────────────────────────────── */
(function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Close menu on any mobile link click
  document.querySelectorAll('.mob-link, .mob-cta').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      toggleMenu(false);
    }
  });
})();

/* ─────────────────────────────────────────────
   7. TYPING ANIMATION
   Cycles through role phrases in the hero.
───────────────────────────────────────────── */
(function initTyping() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const phrases = [
    'scalable REST APIs.',
    'intelligent ML systems.',
    'cloud-native backends.',
    'deepfake detection models.',
    'NLP-powered engines.',
    'full-stack platforms.',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;

  function tick() {
    const phrase  = phrases[phraseIdx];
    const current = phrase.slice(0, charIdx);
    el.textContent = current;

    let delay = deleting ? 45 : 90;

    if (!deleting && charIdx === phrase.length) {
      delay    = 1800; // pause at end
      deleting = true;
    } else if (deleting && charIdx === 0) {
      deleting  = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay     = 400;
    }

    charIdx += deleting ? -1 : 1;
    setTimeout(tick, delay);
  }

  // Start after loader hides
  setTimeout(tick, 2000);
})();

/* ─────────────────────────────────────────────
   8. SCROLL REVEAL
   Watches [data-reveal] elements and adds
   .revealed when they enter the viewport.
───────────────────────────────────────────── */
(function initScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(el => obs.observe(el));
  } else {
    // Fallback for old browsers
    targets.forEach(el => el.classList.add('revealed'));
  }
})();

/* ─────────────────────────────────────────────
   9. COUNTER ANIMATION
   Counts up [data-count] numbers when they
   enter the viewport.
───────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const target  = parseInt(el.dataset.count, 10);
      const dur     = 1400; // ms
      const start   = performance.now();

      function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / dur, 1);
        // Ease-out cubic
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }

      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

/* ─────────────────────────────────────────────
   10. CONTACT FORM
   Simulates submission (hook up a real
   backend / Formspree / EmailJS as needed).
───────────────────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled    = true;
    btn.textContent = 'Sending…';

    // TODO: Replace the setTimeout below with your actual API call
    // Example (Formspree):
    //   fetch('https://formspree.io/f/YOUR_ID', { method:'POST', body: new FormData(form) })
    //   .then(() => showSuccess())

    setTimeout(() => {
      btn.disabled    = false;
      btn.innerHTML   = 'Send Message <i class="fas fa-paper-plane"></i>';
      if (success) {
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 5000);
      }
      form.reset();
    }, 1400);
  });
})();

/* ─────────────────────────────────────────────
   11. SMOOTH ANCHOR SCROLL
   Compensates for fixed navbar height.
───────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id  = anchor.getAttribute('href');
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navH = document.getElementById('navbar')?.offsetHeight || 72;
    window.scrollTo({
      top:      target.offsetTop - navH,
      behavior: 'smooth',
    });
  });
});

/* ─────────────────────────────────────────────
   12. FOOTER YEAR
───────────────────────────────────────────── */
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─────────────────────────────────────────────
   13. PROJECT CARD MOUSE-GLOW EFFECT
   Moves the radial gradient glow to follow
   the mouse within each project card.
───────────────────────────────────────────── */
(function initCardGlow() {
  const cards = document.querySelectorAll('.project-card, .cert-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x    = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y    = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      const glow = card.querySelector('.project-glow, .cert-glow');
      if (glow) {
        glow.style.background =
          `radial-gradient(ellipse at ${x}% ${y}%, rgba(124,58,237,0.13), transparent 65%)`;
      }
    });
    card.addEventListener('mouseleave', () => {
      const glow = card.querySelector('.project-glow, .cert-glow');
      if (glow) glow.style.background = '';
    });
  });
})();

/* ─────────────────────────────────────────────
   14. SKILL PILL STAGGER ENTRANCE
   Adds slight staggered delay to skill pills
   inside each category when revealed.
───────────────────────────────────────────── */
(function initSkillStagger() {
  const categories = document.querySelectorAll('.skill-category');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const pills = entry.target.querySelectorAll('.skill-pill');
      pills.forEach((pill, i) => {
        pill.style.transitionDelay = `${i * 0.05}s`;
        pill.style.opacity         = '1';
        pill.style.transform       = 'translateY(0)';
      });
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  categories.forEach(cat => {
    // Reset initial state
    cat.querySelectorAll('.skill-pill').forEach(p => {
      p.style.opacity   = '0';
      p.style.transform = 'translateY(16px)';
      p.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });
    obs.observe(cat);
  });
})();