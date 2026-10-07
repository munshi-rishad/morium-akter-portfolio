(() => {
  'use strict';
  window.__ready = true;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- nav: mobile menu, progress, active link ---------- */
  const nav = $('.nav');
  const burger = $('#burger');
  const setMenu = open => {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    burger.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('.menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', e => { if (!nav.contains(e.target)) setMenu(false); });

  const bar = $('.progress');
  const toTop = $('#to-top');
  let ticking = false, max = 0;
  const measure = () => { max = root.scrollHeight - innerHeight; };
  measure();
  addEventListener('resize', measure, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  const onScroll = () => {
    bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    toTop.classList.toggle('show', scrollY > 600);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  const links = new Map($$('.menu a').map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      links.forEach(a => a.classList.remove('active'));
      const a = links.get(en.target.id);
      if (a) a.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main > section').forEach(s => spy.observe(s));

  /* ---------- typewriter name ---------- */
  const typedName = $('#typed-name');
  if (typedName) {
    const fullName = typedName.dataset.text || 'Morium Akter';
    if (reduce) {
      typedName.textContent = fullName;
      const c = $('.name-caret'); if (c) c.hidden = true;
    } else {
      typedName.textContent = '';
      let i = 0;
      const typeName = () => {
        i += 1;
        typedName.textContent = fullName.slice(0, i);
        if (i < fullName.length) setTimeout(typeName, 95 + Math.random() * 50);
        else setTimeout(() => { const c = $('.name-caret'); if (c) c.hidden = true; }, 2500);
      };
      setTimeout(typeName, 450);
    }
  }

  /* ---------- hanging ID badge: swings on its own, follows a finger or the mouse ---------- */
  const bw = $('.badge-wrap');
  if (bw) {
    let bx = 0, braf = 0;
    const apply = () => {
      braf = 0;
      const r = bw.getBoundingClientRect();
      const x = Math.max(-.6, Math.min(.6, (bx - r.left) / r.width - .5));
      bw.style.setProperty('--sw', `${(x * 16).toFixed(2)}deg`);
      bw.classList.add('touched');
    };
    const tilt = e => { bx = e.clientX; if (!braf) braf = requestAnimationFrame(apply); };
    const rest = () => { cancelAnimationFrame(braf); braf = 0; bw.classList.remove('touched'); bw.style.removeProperty('--sw'); };
    bw.addEventListener('pointerdown', tilt, { passive: true });
    bw.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || fine) tilt(e); }, { passive: true });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => bw.addEventListener(t, rest, { passive: true }));
  }

  /* ---------- skill marquee built from the skill chips ---------- */
  const m = $('.marquee');
  if (m) {
    const seen = new Set(), items = [];
    $$('#skills .chips:not(.soft-chips) .chip').forEach(c => {
      const t = c.textContent.trim();
      if (seen.has(t)) return;
      seen.add(t);
      items.push(`<span class="mq-item"><i>&#9650;</i>${t}</span>`);
    });
    m.innerHTML = `<div class="mq-track">${items.join('')}${items.join('')}</div>`;
    const go = () => requestAnimationFrame(() => m.classList.add('run'));
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
    setTimeout(go, 2500);
  }

  /* ---------- certificate score rings (from data-score) ---------- */
  $$('.cert[data-score]').forEach(card => {
    const score = +card.dataset.score;
    card.classList.add('scored');
    const ring = document.createElement('div');
    ring.className = 'ring';
    ring.style.setProperty('--p', score / 100);
    ring.setAttribute('role', 'img');
    ring.setAttribute('aria-label', `Score ${score} out of 100`);
    ring.innerHTML = `<svg viewBox="0 0 50 50"><circle class="bg" cx="25" cy="25" r="21" pathLength="100"/><circle class="fg" cx="25" cy="25" r="21" pathLength="100"/></svg><b>${score}</b>`;
    $('.cert-body', card).append(ring);
  });

  /* ---------- scroll reveal (staggered) ---------- */
  $$('[data-stagger]').forEach(g => [...g.children].forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--i', i % 6);
  }));
  $$('.chips').forEach(g => [...g.children].forEach((chip, i) => chip.style.setProperty('--c', i)));
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in');
      reveal.unobserve(el);
      setTimeout(() => el.style.setProperty('--i', 0), 1400);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  $$('.reveal').forEach(el => reveal.observe(el));

  /* ---------- counters ---------- */
  const run = el => {
    const end = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0;
    if (reduce) { el.textContent = end.toFixed(dec); return; }
    const t0 = performance.now(), dur = 1200;
    const step = now => {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const cio = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); }
  }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => { if (!reduce) el.textContent = (0).toFixed(+el.dataset.dec || 0); cio.observe(el); });

  /* ---------- portfolio visitors (Abacus, free counter API) ----------
     +1 per browser on its first visit; hidden on localhost or if the service is down.
     To restart the count, change `key`. */
  (() => {
    const card = $('#views-card');
    if (!card) return;
    const base = 'https://abacus.jasoncameron.dev', ns = 'munshi-rishad.github.io', key = 'morium-portfolio-views';
    const local = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname) || location.protocol === 'file:';
    const seen = (() => { try { return localStorage.getItem('viewed-morium') === '1'; } catch (e) { return false; } })();
    const call = kind => fetch(`${base}/${kind}/${ns}/${key}`, { signal: window.AbortSignal && AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined }).then(r => {
      if (r.status === 404) return null;
      if (!r.ok) throw 0;
      return r.json().then(d => { if (typeof d.value !== 'number') throw 0; return d.value; });
    });
    const hide = () => { card.hidden = true; card.parentElement.classList.add('three'); };
    if (local) { hide(); return; }
    (seen ? call('get').then(v => v === null ? call('hit') : v) : call('hit'))
      .then(v => {
        if (v === null) throw 0;
        try { localStorage.setItem('viewed-morium', '1'); } catch (e) {}
        const n = card.querySelector('strong');
        n.dataset.count = v;
        card.classList.remove('is-pending');
        run(n);
      })
      .catch(hide);
  })();

  /* ---------- cursor glow + magnetic primary buttons (desktop only) ---------- */
  if (fine) {
    let gc = null, gx = 0, gy = 0, graf = 0;
    document.addEventListener('pointermove', e => {
      const card = e.target.closest && e.target.closest('.card');
      if (!card) return;
      gc = card; gx = e.clientX; gy = e.clientY;
      if (graf) return;
      graf = requestAnimationFrame(() => {
        graf = 0;
        const r = gc.getBoundingClientRect();
        gc.style.setProperty('--mx', `${gx - r.left}px`);
        gc.style.setProperty('--my', `${gy - r.top}px`);
      });
    }, { passive: true });
    if (!reduce) {
      $$('.btn-primary').forEach(b => {
        let mx = 0, my = 0, braf = 0;
        b.addEventListener('pointermove', e => {
          mx = e.clientX; my = e.clientY;
          if (braf) return;
          braf = requestAnimationFrame(() => {
            braf = 0;
            const r = b.getBoundingClientRect();
            b.style.translate = `${((mx - r.left - r.width / 2) / r.width) * 8}px ${((my - r.top - r.height / 2) / r.height) * 6}px`;
          });
        }, { passive: true });
        b.addEventListener('pointerleave', () => { b.style.translate = ''; }, { passive: true });
      });
    }
  }

  /* ---------- filters ---------- */
  const setupFilter = (bar, items) => {
    const status = $('.sr', bar.parentElement);
    bar.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      $$('button', bar).forEach(b => b.setAttribute('aria-pressed', b === btn));
      const f = btn.dataset.filter;
      let shown = 0;
      items.forEach(it => {
        const match = f === 'all' || it.dataset.cat.split(' ').includes(f);
        if (match) {
          shown++;
          it.hidden = false;
          it.classList.add('in');
          requestAnimationFrame(() => requestAnimationFrame(() => it.classList.remove('out')));
        } else {
          it.classList.add('out');
          setTimeout(() => { if (it.classList.contains('out')) it.hidden = true; }, reduce ? 0 : 230);
        }
      });
      if (status) status.textContent = `${shown} item${shown === 1 ? '' : 's'} shown`;
    });
  };
  $$('.filters').forEach(bar => setupFilter(bar, $$(bar.dataset.target)));

  /* ---------- copy email / phone + toast ---------- */
  const toast = $('#toast');
  let toastTimer;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
  };
  $$('[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e2) { showToast('Copy failed. Select it manually.'); ta.remove(); return; }
      ta.remove();
    }
    showToast('Copied');
  }));

  /* ---------- pause looping animations that are off-screen ---------- */
  const pauser = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-off', !e.isIntersecting)), { rootMargin: '120px' });
  $$('.hero, .marquee').forEach(el => pauser.observe(el));

  $('#year').textContent = new Date().getFullYear();
})();
