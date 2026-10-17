/* home.js, the Tellable home page's only script (2026-10 revamp): the headline
   read aloud, the reading demo, the sticky feature phone, the word-at-a-time
   band, reveals and parallax. It sends nothing and saves nothing; it reads only
   Reduce Motion, page visibility, scroll and the pointer. The page is complete
   without it. */
(() => {
  const d = document, html = d.documentElement, now = () => performance.now();
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.add('js');
  if (!still) html.classList.add('motion');
  const $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const seen = (el, cb, threshold = 0.25) => new IntersectionObserver(([e]) => cb(e.isIntersecting, e), { threshold }).observe(el);

  // Scroll progress and the header's line.
  const bar = $('.progress i');
  let ticking = 0;
  const onScroll = () => {
    ticking = 0;
    const max = html.scrollHeight - innerHeight;
    bar && bar.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
    html.classList.toggle('scrolled', scrollY > 8);
    parallax();
  };
  addEventListener('scroll', () => { ticking = ticking || requestAnimationFrame(onScroll); }, { passive: true });

  // The headline reads itself: a coral box word by word, the line tinted.
  const head = $('.karaoke');
  if (head && !still) {
    const words = $$('.w', head), ms = [380, 300, 520, 420, 380, 640];
    let i = -1, timer = 0, visible = true;
    const step = () => {
      words.forEach(w => w.classList.remove('on'));
      $$('.ln', head).forEach(l => l.classList.remove('said'));
      i = (i + 1) % (words.length + 1);
      if (i < words.length) {
        words[i].classList.add('on');
        words[i].closest('.ln').classList.add('said');
      }
      timer = visible && !d.hidden ? setTimeout(step, i < words.length ? ms[i] : 1700) : 0;
    };
    setTimeout(step, 900);
    seen(head, v => { visible = v; if (v && !timer) step(); }, 0);
    d.addEventListener('visibilitychange', () => { if (!d.hidden && visible && !timer) step(); });
  }

  // Equalizer bars under the hero phone.
  $$('.eq i').forEach((b, k) => b.style.setProperty('--i', k));

  // Parallax: the phone and the floating chips follow the pointer and the scroll.
  const art = $('.hero-art'), layers = art ? $$('[data-depth]', art) : [];
  let px = 0, py = 0;
  function parallax() {
    if (still || !art) return;
    const r = art.getBoundingClientRect();
    if (r.bottom < 0) return;
    const sy = Math.min(r.top, 0);
    layers.forEach(l => {
      const k = +l.dataset.depth;
      l.style.translate = `${(px * k * 6).toFixed(1)}px ${(py * k * 6 - sy * k * 0.06).toFixed(1)}px`;
    });
  }
  if (art && !still && matchMedia('(pointer: fine)').matches) {
    art.addEventListener('pointermove', e => {
      const r = art.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      requestAnimationFrame(parallax);
    });
    art.addEventListener('pointerleave', () => { px = py = 0; requestAnimationFrame(parallax); });
  }

  // Cards: a soft coral light under the pointer.
  $$('.glowcard').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', `${e.clientX - r.left}px`);
    c.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  // Reveals. Only what starts below the fold is hidden first, so the first
  // frame is complete; siblings come in one after another.
  if (!still) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.remove('pre');
      if (e.target.classList.contains('voice-cloud')) e.target.classList.add('go');
      io.unobserve(e.target);
    }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    $$('.reveal, .voice-cloud').forEach(el => {
      const k = [...el.parentNode.children].filter(c => c.classList.contains('reveal')).indexOf(el);
      el.style.setProperty('--k', Math.max(k, 0));
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre'); io.observe(el); }
    });
  }

  // The reading demo: one clock, requestAnimationFrame plus elapsed time.
  const demo = $('#demo');
  if (demo) {
    const words = $$('[data-ms]', demo), bars = $$('.wave i', demo);
    const play = $('.play', demo), speed = $('.speed', demo), time = $('.time', demo);
    const starts = [], rates = [1, 1.5, 2, 3];
    let total = 0;
    words.forEach(w => { starts.push(total); total += +w.dataset.ms + (/\.$/.test(w.textContent) ? 350 : 0); });
    let cur = words.findIndex(w => w.classList.contains('on')), t = still ? starts[cur] : 0;
    let held = still, rate = 0, inView = false, raf = 0, last = 0, rest = 0;
    const draw = () => {
      let i = 0;
      while (i + 1 < starts.length && starts[i + 1] <= t) i++;
      const a = words[cur], b = words[i], p = Math.round(Math.min(t / total, 1) * bars.length), s = t / 1000 | 0;
      if (a !== b) {
        a.classList.remove('on'); b.classList.add('on');
        if (a.parentNode !== b.parentNode) { a.parentNode.classList.remove('on'); b.parentNode.classList.add('on'); }
        cur = i;
      }
      bars.forEach((bar, k) => bar.classList.toggle('p', k < p));
      const clock = (s / 60 | 0) + ':' + String(s % 60).padStart(2, '0');
      if (time.textContent !== clock) time.textContent = clock;
    };
    const running = () => inView && !d.hidden && !held;
    const frame = at => {
      raf = 0;
      if (!running()) return update();
      if (rest) { if (at >= rest) rest = t = 0; }
      else if ((t += Math.min(at - last, 100) * rates[rate]) >= total) { t = total - 1; rest = at + 1800; }
      last = at;
      draw();
      raf = requestAnimationFrame(frame);
    };
    const update = () => {
      const on = running();
      if (on && !raf) { last = now(); raf = requestAnimationFrame(frame); }
      if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
      play.classList.toggle('on', !held);
      play.setAttribute('aria-label', held ? 'Play the demo' : 'Pause the demo');
    };
    play.disabled = speed.disabled = false;
    play.onclick = () => { held = !held; update(); };
    speed.onclick = () => {
      rate = (rate + 1) % rates.length;
      speed.textContent = rates[rate] + 'x';
      speed.setAttribute('aria-label', 'Speed ' + speed.textContent);
    };
    $('.page', demo).onclick = e => {
      const w = e.target.closest('[data-ms]');
      if (!w || !getSelection().isCollapsed) return;
      // From the start of the tapped word's sentence, as the app does.
      t = starts[words.indexOf(w.parentNode.firstElementChild)];
      rest = 0; held = false;
      draw(); update();
    };
    seen(demo, v => { inView = v; update(); }, 0.5);
    d.addEventListener('visibilitychange', update);
  }

  // Features: the sticky phone shows the step in the middle of the screen.
  const steps = $$('.step'), shots = $$('.stage picture'), marks = $$('.ticks-v li');
  if (steps.length) {
    const show = name => {
      steps.forEach(s => s.classList.toggle('active', s.dataset.shot === name));
      shots.forEach(p => p.classList.toggle('on', p.dataset.shot === name));
      const k = steps.findIndex(s => s.dataset.shot === name);
      marks.forEach((m, j) => m.classList.toggle('on', j === k));
    };
    show(steps[0].dataset.shot);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) show(e.target.dataset.shot); }),
      { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => io.observe(s));
  }

  // Words as they are spoken: one word at a time, its focus letter on the line.
  const rsvp = $('#rsvp');
  if (rsvp) {
    const card = $('.word', rsvp), text = 'Hearing a word and seeing it at the same moment gives a wandering mind two ways in and one anchor. Your eyes stay still while the reading moves, so a page goes by at the pace of the voice, at one, two or three times its speed.';
    const list = text.split(' ');
    // The recognition letter: the second for most short words, further in for long ones.
    const pivot = w => {
      const letters = [...w].map((c, k) => /[\p{L}\p{N}]/u.test(c) ? k : -1).filter(k => k >= 0);
      const n = letters.length, at = n <= 1 ? 0 : n <= 5 ? 1 : n <= 9 ? 2 : n <= 13 ? 3 : 4;
      return letters[at] ?? 0;
    };
    const put = w => {
      const p = pivot(w);
      card.innerHTML = '';
      [['pre', w.slice(0, p)], ['piv', w[p] || ''], ['post', w.slice(p + 1)]].forEach(([c, s]) => {
        const span = d.createElement('span'); span.className = c; span.textContent = s; card.append(span);
      });
      const pre = $('.pre', card), piv = $('.piv', card);
      card.style.setProperty('--shift', `${pre.offsetWidth + piv.offsetWidth / 2}px`);
    };
    put('reading');
    let k = 0, rate = 1, timer = 0, inView = false;
    const tick = () => {
      timer = 0;
      if (!inView || d.hidden || still) return;
      const w = list[k];
      put(w);
      card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash');
      k = (k + 1) % list.length;
      const base = 240 + w.length * 18 + (/[.,]$/.test(w) ? 220 : 0) + (k === 0 ? 900 : 0);
      timer = setTimeout(tick, base / rate);
    };
    $$('.rs', rsvp).forEach(b => b.onclick = () => {
      rate = +b.dataset.rate;
      $$('.rs', rsvp).forEach(x => x.classList.toggle('on', x === b));
      if (still && !timer) { put(list[k]); k = (k + 1) % list.length; }
    });
    seen(rsvp, v => { inView = v; if (v && !timer) tick(); }, 0.4);
    d.addEventListener('visibilitychange', () => { if (!d.hidden && inView && !timer) tick(); });
  }

  onScroll();
})();
