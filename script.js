(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* -------------------------------------------------------
     Header scroll state
     ------------------------------------------------------- */
  const head = document.querySelector('[data-head]');
  if (head) {
    const onScroll = () => head.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* -------------------------------------------------------
     Live clock — Asia/Jakarta
     ------------------------------------------------------- */
  const clock = document.querySelector('[data-clock]');
  if (clock) {
    try {
      const fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const tick = () => { clock.textContent = fmt.format(new Date()); };
      tick();
      window.setInterval(tick, 1000);
    } catch {
      clock.textContent = '--:--:--';
    }
  }

  /* -------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------- */
  const reveals = Array.from(document.querySelectorAll('[data-reveal]'));
  if (reveals.length && !reduceMotion && 'IntersectionObserver' in window) {
    const hidden = [];
    reveals.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (!inView) hidden.push([el, i]);
    });

    hidden.forEach(([el, i]) => {
      el.classList.add('will-reveal');
      el.style.transitionDelay = `${Math.min(i, 4) * 70}ms`;
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    hidden.forEach(([el]) => io.observe(el));
  }

  /* -------------------------------------------------------
     Cursor ring — a soft trailing outline, native cursor stays
     ------------------------------------------------------- */
  const ring = document.querySelector('.cursor-ring');
  if (ring && finePointer && !reduceMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;

    window.addEventListener('pointermove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!ring.classList.contains('is-ready')) {
        // Snap to the pointer on the first move so the ring never drifts in from the centre.
        x = targetX;
        y = targetY;
        ring.classList.add('is-ready');
      }
    }, { passive: true });

    const loop = () => {
      x += (targetX - x) * 0.18;
      y += (targetY - y) * 0.18;
      ring.style.setProperty('--cx', `${x}px`);
      ring.style.setProperty('--cy', `${y}px`);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    const interactive = 'a, button, input, [data-cursor]';

    document.addEventListener('pointerover', (e) => {
      const el = e.target.closest(interactive);
      if (!el) return;
      if (e.relatedTarget && el.contains(e.relatedTarget)) return;
      ring.classList.add('is-active');
    });

    document.addEventListener('pointerout', (e) => {
      const el = e.target.closest(interactive);
      if (!el) return;
      if (e.relatedTarget && el.contains(e.relatedTarget)) return;
      ring.classList.remove('is-active');
    });

    window.addEventListener('blur', () => ring.classList.remove('is-active'));
  } else if (ring) {
    ring.style.display = 'none';
  }

  /* -------------------------------------------------------
     Floating project previews
     ------------------------------------------------------- */
  const preview = document.querySelector('.cursor-preview');
  const workList = document.querySelector('[data-work-list]');

  if (preview && workList && finePointer && !reduceMotion) {
    const cards = Array.from(preview.querySelectorAll('.preview-card'));
    const CARD_W = 236;
    const CARD_H = 270;
    const EDGE = 20;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let rotation = -2;
    let targetRotation = -2;
    let raf = null;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const setActiveCard = (name) => {
      cards.forEach((card) => {
        card.classList.toggle('is-active', card.dataset.previewCard === name);
      });
    };

    const move = (e) => {
      let px = e.clientX + 34;
      let py = e.clientY - 40;

      if (px + CARD_W / 2 > window.innerWidth - EDGE) px = e.clientX - 34;
      if (py - CARD_H / 2 < EDGE) py = e.clientY + 44;
      if (py + CARD_H / 2 > window.innerHeight - EDGE) {
        py = window.innerHeight - EDGE - CARD_H / 2;
      }
      if (px - CARD_W / 2 < EDGE) px = EDGE + CARD_W / 2;

      targetX = px;
      targetY = py;
    };

    const loop = () => {
      x += (targetX - x) * 0.16;
      y += (targetY - y) * 0.16;
      const dx = targetX - x;
      targetRotation = clamp(-2 + dx * 0.06, -7, 7);
      rotation += (targetRotation - rotation) * 0.12;
      preview.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
      raf = requestAnimationFrame(loop);
    };

    const show = (name, e) => {
      if (e) move(e);
      setActiveCard(name);
      preview.classList.add('is-on');

      // Snap to the pointer on entry so the card never flies across the page.
      x = targetX;
      y = targetY;
      preview.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;

      if (!raf) raf = requestAnimationFrame(loop);
    };

    const hide = () => {
      preview.classList.remove('is-on');
      cards.forEach((card) => card.classList.remove('is-active'));
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };

    workList.addEventListener('pointermove', (event) => {
      move(event);
      if (!preview.classList.contains('is-on')) {
        const row = event.target.closest('[data-preview]');
        if (row) show(row.dataset.preview, event);
      }
    }, { passive: true });

    workList.addEventListener('pointerleave', hide);
    window.addEventListener('scroll', hide, { passive: true });

    document.querySelectorAll('[data-preview]').forEach((row) => {
      row.addEventListener('pointerenter', (e) => show(row.dataset.preview, e));
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-preview]')) hide();
    });
  }

  /* -------------------------------------------------------
     Command palette
     ------------------------------------------------------- */
  const routes = [
    { title: 'Home', meta: 'Index', href: 'index.html', keys: 'home gandhi ert portfolio start' },
    { title: 'Work', meta: 'Field notes', href: 'work.html', keys: 'work projects experiments index' },
    { title: 'About', meta: 'The person', href: 'about.html', keys: 'about bio gandhi information technology' },
    { title: 'Contact', meta: 'Open channel', href: 'contact.html', keys: 'contact email hello collaboration' },
    { title: 'Lumen', meta: 'Product design / 2025', href: 'project-lumen.html', keys: 'lumen screen time product design' },
    { title: 'Kite weather', meta: 'Web experiment / 2024', href: 'project-kite.html', keys: 'kite weather web experiment station' },
    { title: 'Small archives', meta: 'Data story / 2024', href: 'project-archive.html', keys: 'small archives data story moments' }
  ];

  const palette = document.getElementById('palette');

  if (palette) {
    const input = palette.querySelector('.palette-input');
    const list = palette.querySelector('.palette-list');
    let filtered = routes.slice();
    let activeIndex = 0;
    let lastFocused = null;

    const escapeHTML = (value) => value.replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));

    const paint = (query = '') => {
      const needle = query.trim().toLowerCase();
      filtered = routes.filter((route) => (
        `${route.title} ${route.meta} ${route.keys}`.toLowerCase().includes(needle)
      ));
      activeIndex = 0;

      if (!filtered.length) {
        list.innerHTML = `<li class="palette-empty">No results for &ldquo;${escapeHTML(query)}&rdquo;</li>`;
        return;
      }

      list.innerHTML = filtered.map((route, index) => `
        <li>
          <a class="palette-item${index === 0 ? ' is-active' : ''}" href="${route.href}" data-index="${index}">
            <span class="p-num">${String(index + 1).padStart(2, '0')}</span>
            <span class="p-title">${escapeHTML(route.title)}</span>
            <span class="p-meta">${escapeHTML(route.meta)}</span>
            <span class="p-arrow" aria-hidden="true">↗</span>
          </a>
        </li>
      `).join('');
    };

    const setActive = (index) => {
      const items = list.querySelectorAll('.palette-item');
      if (!items.length) return;
      activeIndex = (index + items.length) % items.length;
      items.forEach((item, itemIndex) => {
        item.classList.toggle('is-active', itemIndex === activeIndex);
      });
      items[activeIndex].scrollIntoView({ block: 'nearest' });
    };

    const open = () => {
      lastFocused = document.activeElement;
      document.documentElement.classList.add('palette-open');
      document.body.classList.add('palette-open');
      paint('');
      if (!palette.open) palette.showModal();
      input.value = '';
      requestAnimationFrame(() => input.focus());
    };

    const close = () => {
      document.documentElement.classList.remove('palette-open');
      document.body.classList.remove('palette-open');
      if (palette.open) palette.close();
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    };

    document.querySelectorAll('[data-open-palette]').forEach((button) => {
      button.addEventListener('click', open);
    });

    document.addEventListener('keydown', (event) => {
      const commandKey = event.metaKey || event.ctrlKey;
      if (commandKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        palette.open ? close() : open();
      }
      if (event.key === 'Escape' && palette.open) {
        document.documentElement.classList.remove('palette-open');
        document.body.classList.remove('palette-open');
      }
    });

    palette.addEventListener('close', () => {
      document.documentElement.classList.remove('palette-open');
      document.body.classList.remove('palette-open');
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    });

    palette.addEventListener('click', (event) => {
      if (event.target === palette) close();
    });

    list.addEventListener('click', (event) => {
      if (event.target.closest('a')) close();
    });

    input.addEventListener('input', () => paint(input.value));

    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive(activeIndex + 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive(activeIndex - 1);
      } else if (event.key === 'Enter') {
        const active = list.querySelector('.palette-item.is-active');
        if (active) {
          event.preventDefault();
          active.click();
        }
      }
    });

    list.addEventListener('pointermove', (event) => {
      const item = event.target.closest('.palette-item');
      if (!item) return;
      const index = Number(item.dataset.index);
      if (!Number.isNaN(index)) setActive(index);
    });

    // Update the printed shortcut for non-Mac visitors.
    const shortcut = document.querySelector('[data-kbd]');
    if (shortcut) {
      const platform = navigator.userAgentData?.platform || navigator.platform || '';
      const isMac = /Mac|iPhone|iPad|iPod/.test(platform);
      shortcut.textContent = isMac ? '⌘K' : 'Ctrl K';
    }
  }

  /* -------------------------------------------------------
     Page transition — ink veil slides up, then navigate
     ------------------------------------------------------- */
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

    let url;
    try {
      url = new URL(href, window.location.href);
    } catch {
      return;
    }

    if (url.origin !== window.location.origin) return;

    if (url.pathname === window.location.pathname && !url.hash) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }

    if (url.pathname === window.location.pathname && url.hash) return;

    event.preventDefault();
    document.documentElement.classList.add('is-leaving');

    window.setTimeout(() => {
      window.location.href = url.href;
    }, reduceMotion ? 0 : 470);
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      document.documentElement.classList.remove('is-leaving');
    }
  });

  /* -------------------------------------------------------
     Copy email address
     ------------------------------------------------------- */
  let toastEl;
  let toastTimer;

  const toast = (message) => {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('is-on');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove('is-on'), 2400);
  };

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const text = button.getAttribute('data-copy');
      if (!text) return;

      let copied = false;
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try { copied = document.execCommand('copy'); } catch { copied = false; }
        textarea.remove();
      }

      toast(copied ? 'Copied to clipboard' : text);
    });
  });

  document.documentElement.dataset.js = 'ready';
})();
