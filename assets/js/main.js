/* ==========================================================================
   NEXORA AI — Interactions
   Vanilla JS only. Progressive enhancement: every page works without JS,
   these handlers add the polish (menu, reveal, accordion, counters, form,...).
   ========================================================================== */
(function () {
  'use strict';

  /* Small helper */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ------------------------------------------------------------------
     1. Sticky header — add shadow/blur after a little scroll
  ------------------------------------------------------------------ */
  const header = $('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     2. Mobile menu
  ------------------------------------------------------------------ */
  const toggle = $('.nav-toggle');
  const mobileMenu = $('.mobile-menu');

  const setMenu = (open) => {
    if (!toggle || !mobileMenu) return;
    toggle.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    // Close when a link is clicked
    $$('a', mobileMenu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });
    // Close if resized up to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) setMenu(false);
    });
  }

  /* ------------------------------------------------------------------
     3. Scroll reveal (IntersectionObserver)
  ------------------------------------------------------------------ */
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------
     4. Animated counters (stats band)
  ------------------------------------------------------------------ */
  const counters = $$('[data-count]');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const value = target * eased;
      el.textContent = prefix + value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = (el.dataset.prefix || '') + el.dataset.count + (el.dataset.suffix || '');
    });
  }

  /* ------------------------------------------------------------------
     5. FAQ accordion
  ------------------------------------------------------------------ */
  $$('.faq-item').forEach((item) => {
    const btn = $('.faq-q', item);
    const panel = $('.faq-a', item);
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close siblings for a clean single-open accordion
      $$('.faq-item.open').forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          $('.faq-q', other)?.setAttribute('aria-expanded', 'false');
          const op = $('.faq-a', other);
          if (op) op.style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + 'px' : null;
    });
  });

  /* ------------------------------------------------------------------
     6. Demo modal ("Watch Demo")
  ------------------------------------------------------------------ */
  const modal = $('#demo-modal');
  const openModal = () => {
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.classList.add('menu-open');
    $('.modal-close', modal)?.focus();
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };
  $$('[data-open-demo]').forEach((b) => b.addEventListener('click', openModal));
  if (modal) {
    $$('[data-close-demo]', modal).forEach((b) => b.addEventListener('click', closeModal));
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* ------------------------------------------------------------------
     7. Contact form validation
  ------------------------------------------------------------------ */
  const form = $('#contact-form');
  if (form) {
    const fields = $$('.field', form).filter((f) => $('input,textarea', f));

    const validators = {
      name:    (v) => v.trim().length >= 2 || 'Please enter your full name.',
      email:   (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email address.',
      company: (v) => v.trim().length >= 2 || 'Tell us your company name.',
      phone:   (v) => v.trim() === '' || /^[+()\-\s0-9]{7,}$/.test(v.trim()) || 'Enter a valid phone number.',
      message: (v) => v.trim().length >= 10 || 'Your message should be at least 10 characters.',
    };

    const validateField = (field) => {
      const input = $('input,textarea', field);
      if (!input) return true;
      const rule = validators[input.name];
      const result = rule ? rule(input.value) : true;
      const ok = result === true;
      field.classList.toggle('invalid', !ok);
      field.classList.toggle('valid', ok && input.value.trim() !== '');
      const msg = $('.error-msg', field);
      if (msg) msg.textContent = ok ? '' : result;
      return ok;
    };

    fields.forEach((field) => {
      const input = $('input,textarea', field);
      if (!input) return;
      input.addEventListener('blur', () => validateField(field));
      input.addEventListener('input', () => {
        if (field.classList.contains('invalid')) validateField(field);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let allValid = true;
      let firstInvalid = null;
      fields.forEach((field) => {
        const ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field;
        allValid = allValid && ok;
      });

      if (!allValid) {
        $('input,textarea', firstInvalid)?.focus();
        return;
      }

      // Simulated submit (static template — no backend)
      const submitBtn = $('button[type="submit"]', form);
      const original = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending…';
      }
      setTimeout(() => {
        form.reset();
        fields.forEach((f) => f.classList.remove('valid', 'invalid'));
        const success = $('#form-success');
        if (success) {
          success.classList.add('show');
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = original;
        }
      }, 1100);
    });
  }

  /* ------------------------------------------------------------------
     8. Footer newsletter (inline confirmation)
  ------------------------------------------------------------------ */
  const news = $('#newsletter-form');
  if (news) {
    news.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('input', news);
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((input?.value || '').trim());
      if (!ok) {
        input?.focus();
        input?.setAttribute('placeholder', 'Enter a valid email…');
        return;
      }
      news.innerHTML = '<p style="color:var(--accent);font-weight:600;margin:0;">✓ You\'re subscribed. Welcome aboard!</p>';
    });
  }

  /* ------------------------------------------------------------------
     9. Current year in footer
  ------------------------------------------------------------------ */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
