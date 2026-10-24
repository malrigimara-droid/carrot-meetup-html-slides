(() => {
  // ---------- icons (inline SVG so CSS can animate inner parts) ----------
  const I = {
    person: '<circle cx="24" cy="15" r="7"/><path d="M10 41c0-8 6-13 14-13s14 5 14 13"/>',
    robot: '<rect x="10" y="15" width="28" height="22" rx="6"/><path d="M24 9v6M6 23v7M42 23v7"/><circle cx="24" cy="7" r="2.5"/><circle class="eye" cx="18" cy="26" r="2.8" fill="currentColor"/><circle class="eye" cx="30" cy="26" r="2.8" fill="currentColor"/>',
    clock: '<circle cx="24" cy="24" r="17"/><path class="hh" d="M24 24V14"/><path class="mh" d="M24 24h12"/><circle cx="24" cy="24" r="1.8" fill="currentColor"/>',
    money: '<circle cx="24" cy="24" r="17"/><path d="M15 17l4 14 5-11 5 11 4-14M14 24h20"/>',
    web: '<rect x="6" y="9" width="36" height="30" rx="4"/><path d="M6 17h36"/><circle cx="11" cy="13" r="1.2" fill="currentColor"/><circle cx="15" cy="13" r="1.2" fill="currentColor"/><path d="M13 25h14M13 31h20"/>',
    pc: '<rect x="6" y="8" width="36" height="25" rx="3"/><path d="M18 41h12M24 33v8"/>',
    cloud: '<path d="M14 37h21a8 8 0 0 0 1-16 11 11 0 0 0-21-2 9 9 0 0 0-1 18z"/><path d="M24 32V22M19 26l5-5 5 5"/>',
    mail: '<rect x="6" y="11" width="36" height="26" rx="3"/><path d="M7 13l17 13 17-13"/>',
    hospital: '<path d="M10 42V12h28v30M6 42h36"/><path d="M24 17v10M19 22h10"/><path d="M20 42v-7h8v7"/>',
    phone: '<path d="M15 6h6l3 9-5 3a24 24 0 0 0 11 11l3-5 9 3v6c0 2-2 4-4 4C22 37 11 26 11 10c0-2 2-4 4-4z"/>',
    insta: '<rect x="8" y="8" width="32" height="32" rx="9"/><circle cx="24" cy="24" r="7"/><circle cx="33" cy="15" r="1.8" fill="currentColor"/>',
    lock: '<rect x="11" y="21" width="26" height="19" rx="3"/><path d="M16 21v-6a8 8 0 0 1 16 0v6"/><path d="M24 29v4"/>',
    unlock: '<rect x="11" y="21" width="26" height="19" rx="3"/><path d="M16 21v-6a8 8 0 0 1 15-4"/>',
    folder: '<path d="M6 13h13l4 4h19v22H6z"/>',
    db: '<ellipse cx="24" cy="11" rx="14" ry="5"/><path d="M10 11v26c0 3 6 5 14 5s14-2 14-5V11M10 24c0 3 6 5 14 5s14-2 14-5"/>',
    plane: '<path d="M6 23L42 8l-7 32-11-9-6 7v-10z"/><path d="M18 28L42 8"/>',
    term: '<rect x="6" y="9" width="36" height="30" rx="3"/><path d="M13 19l6 5-6 5M23 30h10"/>'
  };
  document.querySelectorAll('.ic[data-i]').forEach(el => {
    const svg = `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${I[el.dataset.i] || ''}</svg>`;
    el.insertAdjacentHTML('afterbegin', svg);
  });
  document.querySelectorAll('i.ar').forEach(el => {
    el.innerHTML = '<svg viewBox="0 0 58 24"><path pathLength="1" d="M2 12H54"/><path pathLength="1" d="M45 4l9 8-9 8"/></svg>';
  });

  // ---------- stage scale ----------
  const stage = document.getElementById('stage');
  const fit = () => stage.style.setProperty('--s', Math.min(innerWidth / 1920, innerHeight / 1080));
  addEventListener('resize', fit); fit();

  // measure collapsing / typing text widths (LAIO kinetic)
  const measure = () => document.querySelectorAll('.laio .r, .laio .url span').forEach(el => {
    el.style.maxWidth = 'none';
    el.style.setProperty('--w', el.scrollWidth + 'px');
    el.style.maxWidth = '';
  });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(measure);

  // ---------- navigation ----------
  const slides = [...document.querySelectorAll('.slide')];
  const prog = document.getElementById('prog'), pg = document.getElementById('pg');
  let cur = 0, step = 0, visit = 0;

  const maxStep = i => +(slides[i].dataset.steps || 0);

  function counts(slide) {
    const token = visit;
    slide.querySelectorAll('[data-to]').forEach(el => {
      const at = +(el.dataset.at || 0);
      if (step < at || el._done === token) return;
      el._done = token;
      const from = +(el.dataset.from || 0), to = +el.dataset.to;
      const dur = +(el.dataset.dur || 1200), delay = +(el.dataset.delay || 0);
      el.textContent = from;
      setTimeout(() => {
        if (token !== visit) return;
        const t0 = performance.now();
        const tick = now => {
          if (token !== visit) return;
          const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(from + (to - from) * e);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, delay);
    });
  }
  function resetCounts(slide) {
    slide.querySelectorAll('[data-to]').forEach(el => { el._done = null; el.textContent = el.dataset.from || 0; });
  }

  function render(changedSlide) {
    slides.forEach((s, i) => {
      const on = i === cur;
      if (!on && s.classList.contains('active')) resetCounts(s);
      s.classList.toggle('active', on);
      for (let k = 1; k <= 3; k++) s.classList.toggle('s' + k, on && step >= k);
    });
    if (changedSlide) visit++;
    counts(slides[cur]);
    prog.style.width = ((cur + 1) / slides.length * 100) + '%';
    pg.textContent = `${cur + 1} / ${slides.length}`;
    history.replaceState(null, '', `#${cur + 1}${step ? '.' + step : ''}`);
  }

  function go(i, st = 0) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const changed = i !== cur || !slides[i].classList.contains('active');
    if (changed && slides[cur].classList.contains('active')) {
      // force animations to restart cleanly on re-entry
      slides[i].classList.remove('active', 's1', 's2', 's3');
      void slides[i].offsetWidth;
    }
    cur = i; step = Math.max(0, Math.min(maxStep(i), st));
    render(changed);
  }
  const next = () => step < maxStep(cur) ? go(cur, step + 1) : (cur < slides.length - 1 && go(cur + 1, 0));
  const prev = () => step > 0 ? go(cur, step - 1) : (cur > 0 && go(cur - 1, maxStep(cur - 1)));

  addEventListener('keydown', e => {
    const k = e.key;
    if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1, maxStep(slides.length - 1));
    else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
    else if (k === 'r' || k === 'R') { const c = cur, s = step; slides[c].classList.remove('active', 's1', 's2', 's3'); void slides[c].offsetWidth; cur = c; step = s; render(true); }
    else if (/^[0-9]$/.test(k)) go(k === '0' ? 9 : +k - 1);
  });
  addEventListener('click', e => (e.clientX < innerWidth * 0.25 ? prev() : next()));

  const m = location.hash.match(/^#(\d+)(?:\.(\d))?/);
  go(m ? +m[1] - 1 : 0, m && m[2] ? +m[2] : 0);
})();
