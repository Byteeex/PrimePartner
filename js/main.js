(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  const header = document.querySelector('[data-header]') || document.querySelector('.site-header');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navList = document.querySelector('[data-nav]');
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navList.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const link = target.closest('a');
      if (link) {
        navList.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const handleScroll = () => {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  const revealItems = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const accordions = document.querySelectorAll('[data-accordion]');
  accordions.forEach((accordion) => {
    accordion.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-accordion-trigger]');
      if (!trigger) {
        return;
      }

      const item = trigger.closest('.accordion-item');
      const content = item?.querySelector('[data-accordion-content]');
      if (!content) {
        return;
      }

      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      content.hidden = isExpanded;
    });
  });

  const intakeForms = document.querySelectorAll('[data-intake-form]');
  intakeForms.forEach((form) => {
    const status = form.querySelector('[data-form-status]');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      if (status) {
        status.textContent = 'Submitting...';
        status.classList.add('is-visible');
      }

      if (submitButton) {
        submitButton.classList.add('is-loading');
        submitButton.disabled = true;
      }

      const payload = Object.fromEntries(new FormData(form).entries());
      payload.formType = form.getAttribute('data-intake-form');
      payload.submittedAt = new Date().toISOString();

      try {
        const response = await fetch('/api/intake', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Request failed');
        }

        const result = await response.json();
        const message = result?.message ||
          'Thanks for reaching out. We received your intake and will follow up with next steps.';

        if (status) {
          status.textContent = message;
        }

        form.reset();
      } catch (error) {
        if (status) {
          status.textContent =
            'Something went wrong. Please email anouar@primepartner.top so we can follow up.';
        }
      } finally {
        if (submitButton) {
          submitButton.classList.remove('is-loading');
          submitButton.disabled = false;
        }
      }
    });
  });
})();
