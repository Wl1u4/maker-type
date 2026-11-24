// The landing: letters, chapters coming alive, depth on scroll, the live penguins, and the two ways into the quiz.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('still');
  document.documentElement.classList.toggle('still', still);
  const $ = (id) => document.getElementById(id);
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  // the palette: drawn penguins in its accent, the browser bar in the first chapter's colour, the live penguin's accent
  const pens = window.MT_PALETTE && window.MT_PALETTE.pens;
  if (pens && pens !== 'assets/penguins') document.querySelectorAll('img[src^="assets/penguins/"]').forEach((img) => { img.src = img.getAttribute('src').replace('assets/penguins/', pens + '/'); });
  { const t = document.querySelector('meta[name="theme-color"]'); if (t && css('--c1-bg')) t.content = css('--c1-bg'); }
  document.querySelectorAll('canvas[data-dog], canvas[data-penguin]').forEach((cv) => { if (!cv.dataset.accent) cv.dataset.accent = css('--hero-accent') || '#FF4FA8'; if (!cv.dataset.paper && css('--paper')) cv.dataset.paper = css('--paper'); });

  // giant words: one clip per letter, so each letter can rise on its own
  document.querySelectorAll('.word[data-word]').forEach((g) => {
    g.setAttribute('aria-label', g.dataset.label || g.dataset.word);
    g.innerHTML = [...g.dataset.word].map((c, i) => `<span class="clip" aria-hidden="true"><span class="ch" style="--i:${i}">${c}</span></span>`).join('');
  });

  // The giant words are sized from the display face's letter width. If that face never arrives the stand-in is wider,
  // so any word that runs past its chapter is brought back inside. Checked again when the fonts settle and on resize.
  const fitWords = () => document.querySelectorAll('.beat .word').forEach((w) => {
    w.style.fontSize = '';
    const box = w.parentElement, cs = getComputedStyle(box), room = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (w.offsetWidth > room + 1) w.style.fontSize = `${(parseFloat(getComputedStyle(w).fontSize) * room / w.offsetWidth * 0.98).toFixed(1)}px`;
  });
  fitWords(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWords);
  { let t = 0; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(fitWords, 120); }); }

  const beats = [...document.querySelectorAll('.beat')];
  // background motion runs only while its chapter is on screen. A chapter's entrance plays once, when a third of it shows.
  const live = new IntersectionObserver((list) => list.forEach((e) => e.target.classList.toggle('live', e.isIntersecting)), { threshold: .05 });
  const seen = new IntersectionObserver((list) => list.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); } }), { threshold: .3 });
  beats.forEach((b) => { live.observe(b); seen.observe(b); });

  // The LEAN chapter: a bar you drag (tug.js). Three things answer it: the bar fills from the middle, the colour of the side you
  // pull toward comes in from that edge, and that side's penguin cheers. The line under the bar stays put: it says what the two sides are.
  // (A screen reader still hears the lean in the quiz's own words, as the slider's value.)
  if ($('lean-bar') && window.tug && window.QUIZ) {
    const Q = window.QUIZ, m = Q.microcopy, T = window.tug, b3 = $('b3'), dir = pens || 'assets/penguins';
    $('lean-bar').outerHTML = T.html({ drag: true, tag: m['bar.drag'], label: m['bar.try'] });
    const el = b3.querySelector('.tug'), input = el.querySelector('input'), line = $('lean-line');
    const washD = b3.querySelector('.wash.d'), washS = b3.querySelector('.wash.s'), side = { design: $('pen-d'), is: $('pen-s') };
    const pose = { design: { design: 'shaper-cheer', between: 'shaper-think', is: 'shaper-shrug' }, is: { design: 'builder-shrug', between: 'builder-think', is: 'builder-cheer' } };
    Object.values(pose).forEach((p) => Object.values(p).forEach((n) => { new Image().src = `${dir}/${n}.svg`; }));      // so a swap never flashes empty
    let zone = '';
    const show = (v, quiet) => {
      T.set(el, v);
      const a = Math.abs(v) / T.MAX;
      washD.style.transform = `translateX(${(v < 0 ? a * 101 - 101 : -101).toFixed(1)}%)`;
      washS.style.transform = `translateX(${(v > 0 ? 101 - a * 101 : 101).toFixed(1)}%)`;
      const r = T.read(v), words = Q.leans[r.lean][r.band === 'clear' ? 'clear' : 'slight'], text = words.charAt(0).toUpperCase() + words.slice(1);
      input.setAttribute('aria-valuetext', text);
      if (r.lean === zone) return;
      zone = r.lean;
      ['design', 'is'].forEach((k) => {
        const p = side[k], img = p.querySelector('img'), mine = zone === k;
        img.src = `${dir}/${pose[k][zone]}.svg`;
        p.querySelector('.say').textContent = zone === 'between' ? m['lean.both'] : m['lean.' + k];      // each penguin says what its side makes
        p.classList.toggle('up', mine); p.classList.toggle('down', !mine && zone !== 'between'); p.classList.toggle('talk', mine || (zone === 'between' && k === 'is'));
        // One hop when a side is chosen. If a hop is still in the air it is left alone: restarting it on every crossing made the
        // penguin snap to the ground when the knob was dragged back and forth (animation review, Nov 24).
        if (mine && !quiet && !still && img.animate && !(img.hopping && img.hopping.playState === 'running')) {
          img.hopping = img.animate([{ transform: 'none' }, { transform: 'translateY(-9%) rotate(-4deg)', offset: 0.35 }, { transform: 'translateY(0) rotate(2deg)', offset: 0.7 }, { transform: 'none' }], { duration: 460, easing: 'cubic-bezier(.23,1,.32,1)' });
        }
      });
    };
    input.addEventListener('input', () => { el.classList.add('used'); show(+input.value); });
    // Arrow keys move one whole point. Left to itself the browser steps a stepless slider by a hundredth of its length,
    // which is 100 presses to cross the bar and too small to see (stress test, Nov 24). Page Up and Down move four.
    input.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -4, PageUp: 4 }[e.key];
      if (!d) return;
      e.preventDefault(); input.value = Math.max(-T.MAX, Math.min(T.MAX, Math.round(+input.value) + d)); el.classList.add('used'); show(+input.value);
    });
    input.addEventListener('pointerdown', () => { el.classList.add('held'); b3.classList.add('dragging'); });
    ['pointerup', 'pointercancel', 'blur'].forEach((e) => input.addEventListener(e, () => { el.classList.remove('held'); b3.classList.remove('dragging'); }));
    // It rests in the middle, then shows an example as the chapter arrives: a little toward Design.
    const demo = () => { if (!el.classList.contains('used')) { input.value = -7; show(-7); } };
    show(0, true);
    if (still) { input.value = -7; show(-7, true); }
    else new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); setTimeout(demo, 400); } }, { threshold: .3 }).observe(b3);
  }

  // the small button: there between the first chapter and the quiz
  const go = $('go'), flags = { past: false, quiz: false, done: false }, show = () => go.classList.toggle('on', flags.past && !flags.quiz && !flags.done);
  // once the result and its breakdown are on screen the quiz is done, so the button would only sit on top of the words
  if ($('more')) new IntersectionObserver(([e]) => { flags.done = e.isIntersecting; show(); }).observe($('more'));
  new IntersectionObserver(([e]) => { flags.past = !e.isIntersecting; show(); }, { threshold: .2 }).observe($('b1'));
  new IntersectionObserver(([e]) => { flags.quiz = e.isIntersecting; show(); }, { threshold: .25 }).observe($('stage'));

  // the mark steps out while the section under the result is at the top of the screen, where it would cover the words
  if ($('more')) new IntersectionObserver(([e]) => $('logo').classList.toggle('away', e.isIntersecting), { rootMargin: '0px 0px -86% 0px' }).observe($('more'));

  // both buttons open the quiz at the right question. The tabs on the curves scroll one chapter on.
  const smooth = still ? 'auto' : 'smooth';
  [$('begin'), go].forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); if (window.MT) window.MT.begin(); else $('stage').scrollIntoView({ behavior: smooth }); }));
  document.querySelectorAll('.cue').forEach((c) => c.addEventListener('click', (e) => { e.preventDefault(); document.querySelector(c.getAttribute('href')).scrollIntoView({ behavior: smooth, block: 'start' }); }));
  $('logo').addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: smooth }); });

  // one live mascot on the first screen. A tap turns it into the next maker, and the bubble says which.
  const sayEl = $('say'), names = { shaper: 'Leans Design', bridge: 'In between', builder: 'Leans IS' }, lines = { spin: ['Whoa', 'Too fast'], turn: ['Wheee', 'Other way'] };
  const liveMascot = window.liveDogs || window.livePenguins;      // the dog since Nov 24. penguin3d.js still works if it is loaded instead
  if (liveMascot) liveMascot($('b1'), { still, say: (kit, what) => { const l = lines[what]; sayEl.textContent = l ? l[Math.floor(Math.random() * l.length)] : names[kit]; } });
  if (still) return;

  // Depth. Each layer has a speed: under 1 lags behind the page (further away), over 1 runs ahead (closer).
  // Some also lean a little toward the mouse. One listener, one write per layer per frame, transform only. Half as far on a phone.
  const layers = [...document.querySelectorAll('[data-speed], [data-drift]')].map((el) => ({ el, beat: el.closest('.beat'), speed: +(el.dataset.speed || 1), drift: +(el.dataset.drift || 0) }));
  const beatList = [...new Set(layers.map((l) => l.beat))];
  const small = matchMedia('(max-width: 640px)'), fine = matchMedia('(hover: hover) and (pointer: fine)');
  let mx = 0, my = 0, id = 0;
  const draw = () => {
    id = 0;
    const vh = innerHeight, k = small.matches ? .5 : 1;
    // measure first, write after: reading a position after a write would make the browser redo styles for every layer
    const where = new Map(beatList.map((b) => [b, b.getBoundingClientRect()]));
    layers.forEach((l) => {
      const r = where.get(l.beat);
      if (r.bottom < -200 || r.top > vh + 200) return;
      const off = (r.top + r.height / 2 - vh / 2) * (l.speed - 1) * k;      // 0 when the chapter is centred
      const t = `translate3d(${(mx * l.drift).toFixed(1)}px, ${(off + my * l.drift * .5).toFixed(1)}px, 0)`;
      if (t !== l.last) { l.el.style.transform = t; l.last = t; }
    });
  };
  const ask = () => { if (!id) id = requestAnimationFrame(draw); };
  addEventListener('scroll', ask, { passive: true });
  addEventListener('resize', ask);
  if (fine.matches) addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; ask(); }, { passive: true });
  draw();
})();
