// Background life, with GSAP (Will, Nov 24: "there should be more animation in the back... it feels a bit too static").
// What it adds, and why each one is allowed (find-animation-opportunities, animate):
//   1. Background shapes float all the time, slowly, and there are a few more of them. Delight, on a landing page.
//   2. The letters of each giant word rock as you scroll past, and stand straight when the chapter is centred. Your scroll drives it.
//   3. Shapes lean with the speed of your scroll and settle when you stop. Your scroll drives it.
//   4. The drawn penguins on QUICK and LEAN, and the one riding the tape, breathe.
//   5. One burst of confetti when the result arrives, and the penguin hops three times. Rare, so it gets the delight budget.
// Then Will asked for more ("More motion", Nov 24), so:
//   6. Two big, slow, tone-on-tone shapes drift behind each chapter. They darken the colour by a few percent, no more,
//      so they are background and never compete with the words.
//   7. A wave runs through the letters of MAKER?, and the letters of every giant word lean with the speed of your scroll.
//   8. The three example cards float. The QUICK penguin changes pose every few seconds. The tape's stripes slide.
// Rejected on purpose: the sixteen statement screens (answered one after another), the numbers under the result
// (data you are reading), anything fading in on scroll (on his slop list), a pulsing button.
//
// Rules it keeps: transforms and opacity only. GSAP touches children only, because landing.js already writes the parallax
// transform on the parents. Loops play only while their chapter is on screen. Reduced motion, or ?still=1, turns all of it
// off and the page falls back to the short CSS drift. If GSAP does not load, this file does nothing and the page still works.
// Anything that loops has a pause control (WCAG 2.2.2): the small button at the bottom right of the landing chapters.
(() => {
  const root = document.documentElement, $ = (id) => document.getElementById(id);
  // Decorations first. They are built whether or not anything will move, so a still page looks like a moving one at rest.
  // A few more small shapes per chapter (wide screens only), kept to the edges and clear of the words, penguins and buttons.
  const more = {
    b1: [['tri', 95, 42, 52], ['sq', 3, 86, 44], ['dome', 78, 7, 56]],
    b2: [['plus', 94, 46, 48], ['tri', 2.5, 50, 52], ['sq', 28, 90, 44]],
    b3: [['zig', 3, 54, 72], ['dome', 97, 32, 52]],
    b4: [['sq', 96, 58, 44], ['tri', 4, 10, 52], ['tri', 93, 86, 48]],
  };
  // Two big shapes per chapter, a few percent darker than whatever is behind them. Position is the shape's top left corner.
  const deep = {
    b1: [['sq', 6, 46, 30], ['dome', 66, 4, 34]],
    b2: [['plus', 68, 42, 32], ['sq', -6, -4, 28]],
    b3: [['dome', 58, 50, 36], ['tri', 2, 18, 26]],
    b4: [['sq', 72, 2, 28], ['plus', -4, 48, 32]],
  };
  Object.keys(more).forEach((id) => {
    const amb = document.querySelector(`#${id} .amb`); if (!amb) return;
    more[id].forEach(([shape, x, y, s]) => amb.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 48 48" class="extra" style="--x:${x}%;--y:${y}%;--s:${s}px"><use href="#g-${shape}"/></svg>`));
    deep[id].forEach(([shape, x, y, s]) => amb.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 48 48" class="deep" style="--x:${x}%;--y:${y}%;--s:${s}vmax"><use href="#g-${shape}"/></svg>`));
  });
  // the drawn penguins get a wrapper to breathe in, so their own hop and size changes (landing.css) are left alone
  document.querySelectorAll('#b2 .pen img, #b3 .pen img').forEach((img) => { const w = document.createElement('span'); w.className = 'bob'; img.replaceWith(w); w.appendChild(img); });
  // each example card gets a wrapper to float in: its own transform is the entrance and the rest pose, and its face is the tilt
  document.querySelectorAll('.deck .tcard').forEach((card) => { const w = document.createElement('div'); w.className = 'tfloat'; w.style.zIndex = card.style.zIndex; card.replaceWith(w); w.appendChild(card); });

  const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger || new URLSearchParams(location.search).has('still')) return;
  gsap.registerPlugin(ScrollTrigger);
  let calm = false; try { calm = localStorage.getItem('mt-motion') === 'off'; } catch (e) { /* private mode */ }

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    root.classList.add('gsap');
    const beats = gsap.utils.toArray('main > .beat'), loops = new Map(), cleanups = [];      // chapter -> its looping timelines
    const rnd = gsap.utils.random;

    beats.forEach((beat) => {
      const mine = [];
      // 1. small shapes float: each on its own slow path, started at a different point so they never move in step
      gsap.utils.toArray(beat.querySelectorAll('.amb svg:not(.deep)')).forEach((el, i) => {
        const tl = gsap.timeline({ paused: true, repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
          .fromTo(el, { x: 0, y: 0, rotation: rnd(-14, 6) }, { x: rnd(14, 26) * (i % 2 ? -1 : 1), y: rnd(-30, -16), rotation: rnd(10, 34), duration: rnd(5, 8) })
          .to(el, { x: rnd(-18, 18), y: rnd(10, 26), rotation: rnd(-20, 4), duration: rnd(5, 8) });
        tl.progress(Math.random()); mine.push(tl);
      });
      // 6. the big shapes behind: slower, further, and always turning a little
      gsap.utils.toArray(beat.querySelectorAll('.amb svg.deep')).forEach((el, i) => {
        const tl = gsap.timeline({ paused: true, repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
          .fromTo(el, { x: 0, y: 0, rotation: rnd(-12, 12) }, { x: rnd(40, 80) * (i % 2 ? -1 : 1), y: rnd(-60, -30), rotation: rnd(18, 40) * (i % 2 ? -1 : 1), duration: rnd(11, 15) })
          .to(el, { x: rnd(-50, 50), y: rnd(30, 60), rotation: rnd(-10, 10), duration: rnd(11, 15) });
        tl.progress(Math.random()); mine.push(tl);
      });
      // 4. penguins breathe
      gsap.utils.toArray(beat.querySelectorAll('.bob')).forEach((el) => {
        const tl = gsap.timeline({ paused: true, repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
          .fromTo(el, { y: 0, rotation: -1.2 }, { y: -6, rotation: 1.2, duration: rnd(1.9, 2.6), transformOrigin: '50% 100%' });
        tl.progress(Math.random()); mine.push(tl);
      });
      // 7. a wave runs through MAKER?, letter by letter, about 3% of a letter high. Only there: the other chapters have a
      //    sentence to read under the word, and words you are reading should not move by themselves (animation review, Nov 24).
      const letters = beat.id === 'b1' ? gsap.utils.toArray(beat.querySelectorAll('.word .clip')) : [];
      if (letters.length) mine.push(gsap.to(letters, { y: (i, el) => -el.offsetHeight * 0.032, duration: 1.3, ease: 'sine.inOut', paused: true, stagger: { each: 0.13, repeat: -1, yoyo: true } }));
      // 8. the example cards float, each out of step with its neighbours
      gsap.utils.toArray(beat.querySelectorAll('.tfloat')).forEach((el, i) => {
        const tl = gsap.timeline({ paused: true, repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } })
          .fromTo(el, { y: 5, rotation: -1 }, { y: -8, rotation: 1.2, duration: 2.2 + i * 0.35 });
        tl.progress(i / 3); mine.push(tl);
      });
      // 8. the QUICK penguin hops and changes pose every few seconds: two drawings, swapped at the top of the hop
      const actor = beat.id === 'b2' && beat.querySelector('.bob img');
      if (actor) {
        const a = actor.getAttribute('src'), b = a.replace('pickme', 'wave'); new Image().src = b;
        const hop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2.6 })
          .to(actor, { y: -16, duration: 0.18, ease: 'power2.out' })
          .call(() => { actor.setAttribute('src', actor.getAttribute('src') === a ? b : a); })
          .to(actor, { y: 0, duration: 0.42, ease: 'bounce.out' });
        mine.push(hop);
      }
      loops.set(beat, mine);
      // loops run only while their chapter is on screen, and never while motion is paused
      ScrollTrigger.create({ trigger: beat, start: 'top bottom', end: 'bottom top', onToggle: (self) => mine.forEach((tl) => (self.isActive && !calm ? tl.play() : tl.pause())) });

      // 2. the giant word: neighbouring letters rock opposite ways with the scroll, and are straight when the chapter is centred
      const clips = gsap.utils.toArray(beat.querySelectorAll('.word .clip'));
      if (clips.length) gsap.fromTo(clips, { rotation: (i) => (i % 2 ? -3.5 : 3.5), yPercent: (i) => (i % 2 ? 2.5 : -2.5) },
        { rotation: (i) => (i % 2 ? 3.5 : -3.5), yPercent: (i) => (i % 2 ? -2.5 : 2.5), ease: 'none', scrollTrigger: { trigger: beat, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });

    // The penguin riding the tape breathes too. READY is drawn again every time you come back to it, so the penguin is
    // found again each time and the old loop is thrown away.
    { const stage = $('stage'), view = $('view'), mine = loops.get(stage) || []; let tl = null;
      const ride = () => { const el = view && view.querySelector('.tape .rider'); if (!el || el.dataset.bob) return; el.dataset.bob = '1';
        if (tl) { tl.kill(); mine.splice(mine.indexOf(tl), 1); }
        tl = gsap.timeline({ paused: true, repeat: -1, yoyo: true }).fromTo(el, { y: 0, rotation: -1.2 }, { y: -6, rotation: 1.2, duration: 2.2, ease: 'sine.inOut', transformOrigin: '50% 100%' });
        mine.push(tl); if (!calm && ScrollTrigger.isInViewport(stage)) tl.play(); };
      ride(); if (view) { const mo2 = new MutationObserver(ride); mo2.observe(view, { childList: true }); cleanups.push(() => mo2.disconnect()); } }

    // 3. shapes lean with the speed of the scroll, and settle when it stops. One reused tween per shape (quickTo).
    const lean = gsap.utils.toArray('.amb svg').map((el, i) => ({ beat: el.closest('.beat'), to: gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3' }), k: 0.6 + (i % 3) * 0.3 }));
    const squash = gsap.utils.toArray('.word .clip').map((el) => ({ beat: el.closest('.beat'), to: gsap.quickTo(el, 'skewX', { duration: 0.45, ease: 'power3' }) }));
    const kick = (v) => {
      lean.forEach((l) => { if (l.beat.classList.contains('live')) l.to(gsap.utils.clamp(-16, 16, (v / -260) * l.k)); });
      squash.forEach((l) => { if (l.beat.classList.contains('live')) l.to(gsap.utils.clamp(-7, 7, v / -420)); });
    };
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => kick(self.getVelocity()) });
    const rest = () => kick(0);
    ScrollTrigger.addEventListener('scrollEnd', rest);

    // the pause control
    const apply = () => { root.classList.toggle('calm', calm); loops.forEach((mine, beat) => mine.forEach((tl) => (!calm && ScrollTrigger.isInViewport(beat) ? tl.play() : tl.pause()))); };
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'motion-toggle';
    const label = () => { const t = calm ? 'Play background motion' : 'Pause background motion'; btn.setAttribute('aria-label', t); btn.title = t; btn.setAttribute('aria-pressed', String(calm)); };
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-pause" d="M8 5v14M16 5v14"/><path class="i-play" d="M8 5l11 7-11 7z"/></svg>';
    btn.addEventListener('click', () => { calm = !calm; try { localStorage.setItem('mt-motion', calm ? 'off' : 'on'); } catch (e) { /* private mode */ } label(); apply(); });
    label(); document.body.appendChild(btn);
    // It shows over the landing chapters and on READY, where the tape moves. It steps out during the statements and the
    // result, where nothing loops and it would sit on the buttons.
    const stage = $('stage'), moreEl = $('more'), frame = $('frame'), seen = { stage: false, more: false };
    const show = () => btn.classList.toggle('away', (seen.stage && frame && frame.dataset.view !== 'hero') || seen.more);
    const io = new IntersectionObserver((list) => list.forEach((e) => { seen[e.target.id] = e.isIntersecting; show(); }), { threshold: 0.2 });
    if (stage) io.observe(stage); if (moreEl) io.observe(moreEl);
    const mo = new MutationObserver(show); if (frame) mo.observe(frame, { attributes: true, attributeFilter: ['data-view'] });
    apply();

    return () => { root.classList.remove('gsap', 'calm'); ScrollTrigger.removeEventListener('scrollEnd', rest); io.disconnect(); mo.disconnect(); cleanups.forEach((f) => f()); btn.remove(); };   // matchMedia reverts the tweens itself
  });

  // 5. one burst when the result arrives. Called by app.js. Pieces fly up and out from behind the penguin, then fall away.
  window.MT_motion = {
    celebrate(view) {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches || !view) return;
      const at = view.querySelector('.winner'); if (!at) return;
      const box = document.createElement('div'); box.className = 'burst'; box.setAttribute('aria-hidden', 'true'); at.appendChild(box);
      const kinds = ['paper', 'ink', 'gold'], rnd = gsap.utils.random;
      const bits = Array.from({ length: 30 }, (_, i) => { const b = document.createElement('i'); b.className = kinds[i % 3] + (i % 4 === 0 ? ' dot' : ''); box.appendChild(b); return b; });
      const tl = gsap.timeline({ delay: 0.35, onComplete: () => box.remove() });
      tl.fromTo(bits, { x: 0, y: 0, scale: 0.4, rotation: 0, autoAlpha: 1 }, { x: () => rnd(-340, 340), y: () => rnd(-380, -90), scale: () => rnd(0.8, 1.3), rotation: () => rnd(-200, 200), duration: 0.55, ease: 'power3.out', stagger: { amount: 0.12, from: 'random' } })
        .to(bits, { y: () => `+=${rnd(420, 640)}`, x: () => `+=${rnd(-60, 60)}`, rotation: () => `+=${rnd(-240, 240)}`, duration: 1, ease: 'power2.in', stagger: { amount: 0.15, from: 'random' } }, 0.5)
        .to(bits, { autoAlpha: 0, duration: 0.25 }, 1.3);
      const pen = at.querySelector('img');
      if (pen) gsap.timeline({ delay: 0.9 }).to(pen, { y: -22, duration: 0.2, ease: 'power2.out', repeat: 5, yoyo: true, transformOrigin: '50% 100%' }).set(pen, { clearProps: 'transform' });
    },
  };
})();
