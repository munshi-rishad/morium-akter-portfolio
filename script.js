// Scroll progress bar
const bar = document.querySelector('.progress');
addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
}, { passive: true });

// Mobile menu
const menu = document.querySelector('.menu');
const links = document.querySelector('.navlinks');
menu.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  menu.setAttribute('aria-expanded', open);
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
}));

// Highlight current section in nav
const map = new Map([...links.querySelectorAll('a')].map(a => [a.getAttribute('href').slice(1), a]));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    map.forEach(a => a.classList.remove('active'));
    map.get(e.target.id)?.classList.add('active');
  }
}), { rootMargin: '-45% 0px -50% 0px' });
map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });

// ===== v2: theme, reveal, typing, counters, score rings, copy, back-to-top =====
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement, nav = $('.navbar');

  // Dark mode (remembers choice)
  let saved; try { saved = localStorage.getItem('theme'); } catch (e) {}
  const setTheme = t => { root.dataset.theme = t; $('meta[name=theme-color]').content = t === 'dark' ? '#0F3A5C' : '#002B49'; };
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const tb = document.createElement('button');
  tb.className = 'theme'; tb.setAttribute('aria-label', 'Toggle dark mode');
  tb.innerHTML = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>';
  tb.onclick = () => { const t = root.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(t); try { localStorage.setItem('theme', t); } catch (e) {} };
  nav.append(tb);

  // Hero stagger
  $$('.hero-copy>*').forEach((el, i) => el.style.animationDelay = i * .09 + 's');

  // Score rings from "scored N/100" in certificate text
  $$('.cert').forEach(c => {
    const m = c.textContent.match(/scored (\d+)\/100/); if (!m) return;
    c.classList.add('scored');
    const r = document.createElement('div'); r.className = 'ring'; r.style.setProperty('--p', m[1] / 100);
    r.setAttribute('role', 'img'); r.setAttribute('aria-label', 'Score ' + m[1] + ' out of 100');
    r.innerHTML = '<svg viewBox="0 0 50 50"><circle class="bg" cx="25" cy="25" r="22"/><circle class="fg" cx="25" cy="25" r="22"/></svg><b>' + m[1] + '</b>';
    c.append(r);
  });

  // Scroll reveal
  const targets = $$('.section h2,.contact h2,.sub,.prose,.timeline>li,.skills article,.cert,.contact-list li');
  targets.forEach(el => el.classList.add('rv'));
  $$('.cert,.skills article').forEach(el => el.classList.add('lift'));
  $$('.tags li').forEach((li, i) => li.style.setProperty('--i', i % 4));
  const tl = $('.timeline'); tl.classList.add('draw');
  const ro = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, i = [...el.parentElement.children].indexOf(el);
    el.style.transitionDelay = i * 90 + 'ms';
    el.classList.add('in'); ro.unobserve(el);
    setTimeout(() => el.style.transitionDelay = '', 1300 + i * 90);
  }), { threshold: .15 });
  [...targets, tl].forEach(el => ro.observe(el));

  // Count-up stats
  $$('[data-to]').forEach(el => {
    if (reduce) return;
    const to = +el.dataset.to, d = +el.dataset.dec || 0, t0 = performance.now() + 500;
    const tick = t => {
      const p = Math.min(Math.max((t - t0) / 1400, 0), 1);
      el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(d);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  // Typing line
  const ty = $('#typed'), words = ['analytical thinking', 'data processing', 'clear communication', 'MS Office'];
  if (ty) {
    if (reduce) ty.textContent = words[0];
    else {
      let w = 0, c = 0, del = false;
      const step = () => {
        const s = words[w]; c += del ? -1 : 1; ty.textContent = s.slice(0, c);
        let wait = del ? 35 : 75;
        if (!del && c === s.length) { del = true; wait = 1500; }
        else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 350; }
        setTimeout(step, wait);
      };
      setTimeout(step, 900);
    }
  }

  // Back to top + toast + copy buttons
  const top = document.createElement('button');
  top.className = 'totop'; top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  top.onclick = () => scrollTo({ top: 0 });
  const toast = document.createElement('div'); toast.className = 'toast'; toast.setAttribute('role', 'status');
  document.body.append(top, toast);
  let tt; const say = m => { toast.textContent = m; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('show'), 1800); };
  addEventListener('scroll', () => { nav.classList.toggle('scrolled', scrollY > 10); top.classList.toggle('show', scrollY > 600); }, { passive: true });
  $$('.contact-list li').forEach(li => {
    const a = $('a', li); if (!a) return;
    const b = document.createElement('button'); b.className = 'copy'; b.textContent = 'Copy';
    b.setAttribute('aria-label', 'Copy ' + a.textContent.trim());
    b.onclick = async () => {
      try { await navigator.clipboard.writeText(decodeURIComponent(a.getAttribute('href').replace(/^mailto:|^tel:/, ''))); say('Copied to clipboard'); }
      catch (e) { say('Copy not available'); }
    };
    li.append(b);
  });
})();

// Name typewriter
(() => {
  const tw = document.querySelector('.tw'), cr = document.querySelector('.name-caret'), full = 'Morium Akter';
  if (!tw) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { tw.textContent = full; cr.remove(); return; }
  let i = 0;
  const go = () => {
    tw.textContent = full.slice(0, ++i);
    if (i < full.length) setTimeout(go, 110 + Math.random() * 60);
    else setTimeout(() => cr.style.display = 'none', 2500);
  };
  setTimeout(go, 500);
})();
