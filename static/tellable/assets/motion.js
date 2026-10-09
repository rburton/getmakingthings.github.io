/* motion.js, the only script on Tellable's pages (story 055): the mark's idle
   blink and header wave, the silent reading demo, the feature scenes and the
   screenshot drift. It sends nothing and saves nothing; it reads only Reduce
   Motion, page visibility and scroll. Pages are complete without it. */
(() => {
  const d = document, html = d.documentElement, now = () => performance.now();
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.add('js');
  if (!still) html.classList.add('motion');
  const css = getComputedStyle(html), v = n => parseFloat(css.getPropertyValue('--' + n));
  const down = v('blink-down'), up = v('blink-up'), ease = 'ease-in-out';
  const wave = [1, v('wave-up'), v('wave-down'), 1].map(s => ({ transform: `scaleY(${s})`, easing: ease }));
  const blinks = [{ opacity: 1, easing: ease }, { opacity: v('blink-low'), offset: down / (down + up), easing: ease }, { opacity: 1 }];
  const hero = d.querySelector('.hero');
  let held = still; // paused by the visitor

  // The header mark waves on hover and focus.
  const home = d.querySelector('header a');
  let waving = 0;
  const greet = () => {
    if (still || now() < waving) return;
    waving = now() + v('wave-pass');
    home.querySelectorAll('.bar').forEach((b, i) => b.animate(wave, { duration: v('wave-per-bar'), delay: i * v('wave-stagger') }));
  };
  home.onpointerenter = home.onfocus = greet;

  // One idle clock blinks every .idle mark's white bars.
  const idle = () => setTimeout(() => {
    if (!d.hidden && !held) d.querySelectorAll('.idle .b0,.idle .b2').forEach(b => b.animate(blinks, down + up));
    idle();
  }, v('idle-min') + Math.random() * (v('idle-max') - v('idle-min')));
  if (!still) setTimeout(idle, hero ? 2000 : 0); // after the intro

  // The reading demo: one clock, requestAnimationFrame plus elapsed time.
  const demo = d.getElementById('demo');
  if (demo) {
    const words = [...demo.querySelectorAll('[data-ms]')], bars = demo.querySelectorAll('.wave i');
    const play = demo.querySelector('.play'), speed = demo.querySelector('.speed'), time = demo.querySelector('.time');
    const starts = [], rates = [1, 1.5, 2];
    let total = 0;
    words.forEach(w => { starts.push(total); total += +w.dataset.ms + (/\.$/.test(w.textContent) ? 350 : 0); });
    let cur = words.findIndex(w => w.classList.contains('on')), t = still ? starts[cur] : 0;
    let rate = 0, seen = false, raf = 0, last = 0, rest = 0, ready = still ? Infinity : now() + 2000;

    const draw = () => {
      let i = 0;
      while (i + 1 < starts.length && starts[i + 1] <= t) i++;
      const a = words[cur], b = words[i], p = Math.round(Math.min(t / total, 1) * bars.length), s = t / 1000 | 0;
      if (a !== b) {
        a.classList.remove('on');
        b.classList.add('on');
        if (a.parentNode !== b.parentNode) { a.parentNode.classList.remove('on'); b.parentNode.classList.add('on'); }
        cur = i;
      }
      bars.forEach((bar, k) => bar.classList.toggle('p', k < p));
      const clock = (s / 60 | 0) + ':' + String(s % 60).padStart(2, '0');
      if (time.textContent !== clock) time.textContent = clock;
    };
    const running = () => seen && !d.hidden && !held && now() >= ready;
    const frame = at => {
      raf = 0;
      if (!running()) return update();
      if (rest) {
        if (at >= rest) rest = t = 0;
      } else if ((t += Math.min(at - last, 100) * rates[rate]) >= total) {
        t = total - 1; // rest 2 s on the last word
        rest = at + 2000;
      }
      last = at;
      draw();
      raf = requestAnimationFrame(frame);
    };
    const update = () => {
      const on = running();
      hero.classList.toggle('speaking', on);
      if (on && !raf) { last = now(); raf = requestAnimationFrame(frame); }
      if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
      if (!on && !held && seen && ready > now()) setTimeout(update, ready - now());
      play.classList.toggle('on', !held);
      play.setAttribute('aria-label', held ? 'Play the demo' : 'Pause the demo');
    };
    const toggle = () => { held = !held; ready = 0; update(); };

    play.disabled = speed.disabled = false;
    play.onclick = toggle;
    speed.onclick = () => {
      rate = (rate + 1) % rates.length;
      speed.textContent = rates[rate] + 'x';
      speed.setAttribute('aria-label', 'Speed ' + speed.textContent);
    };
    demo.querySelector('.page').onclick = e => {
      const w = e.target.closest('[data-ms]');
      if (!w || !getSelection().isCollapsed) return;
      t = starts[words.indexOf(w.parentNode.querySelector('[data-ms]'))]; // the app reads from the tapped word's sentence
      rest = 0;
      held = true;
      draw();
      toggle();
    };
    new IntersectionObserver(([e]) => { seen = e.intersectionRatio >= 0.5; update(); }, { threshold: [0, 0.5] })
      .observe(demo.querySelector('.device'));
    d.addEventListener('visibilitychange', update);
  }

  // Scenes play once in view and hold off screen. --i orders the steps.
  d.querySelectorAll('.say .s,.chips,.mini .wave').forEach(g => g.querySelectorAll(':scope>*:not(sup)').forEach((c, i) => c.style.setProperty('--i', i)));
  const io = new IntersectionObserver(es => es.forEach(e => {
    const c = e.target.classList;
    if (e.isIntersecting) c.add('play');
    c.toggle('off', !e.isIntersecting);
  }), { threshold: 0.35 });
  d.querySelectorAll('.scene').forEach(s => io.observe(s));

  // The screenshots drift up to 6 px, at 900 px and wider.
  const shots = d.querySelectorAll('.screens img'), wide = matchMedia('(min-width: 900px)');
  let tick = 0;
  const drift = () => {
    tick = 0;
    shots.forEach((img, k) => {
      const r = img.parentNode.getBoundingClientRect(), y = ((r.top + r.height / 2) / innerHeight - 0.5) * (k ? -12 : 12);
      img.style.transform = wide.matches ? `translateY(${Math.max(-6, Math.min(6, y)).toFixed(1)}px)` : '';
    });
  };
  if (!still && shots.length) addEventListener('scroll', () => { tick = tick || requestAnimationFrame(drift); }, { passive: true });
})();
