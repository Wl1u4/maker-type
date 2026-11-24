// Maker Type. The quiz runs inside the frame, one step per screen.
// Words and scoring rules come from quiz-data.js (generated from quiz/quiz.json).
// Steps: 'hero', 0 to 15 (the statements), 'pick' (the closing question), 'result'. Each has an address so Back works.
(() => {
  const Q = window.QUIZ;
  if (!Q) return;

  const KEY = 'maker-type-answers-v4';
  const S = Q.statements, N = S.length;
  const m = Q.microcopy;
  const $ = (id) => document.getElementById(id);
  const frame = $('frame'), view = $('view'), stepEl = $('step'), more = $('more');
  const stage = frame.parentElement;        // the one-screen-tall box the frame sits in: steps scroll to this, so the whole frame is on screen
  const heroHTML = view.innerHTML;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const baseTitle = document.title;
  // colours are roles from palette.css, so these are names, not values. A statement takes one of four tones in turn.
  const TONES = [1, 2, 3, 4].map((n) => `var(--tone-${n})`);
  const roleTone = (role) => `var(--role-${role})`, leanTone = (lean) => `var(--lean-${lean})`;
  const PENS = (window.MT_PALETTE && window.MT_PALETTE.pens) || 'assets/penguins';      // the drawn penguins come in each palette's accent
  const EASE = 'cubic-bezier(.23,1,.32,1)';   // the project's one ease-out (tokens.css)
  const VALUES = Q.scale.spots.map((s) => s.v), PICKS = Q.pick.answers.map((a) => a.id);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const penguin = (name, width, alt = '') => `<img src="${PENS}/${name}.svg" alt="${esc(alt)}" width="${width}" height="${Math.round(width * 1.02)}">`;
  const fill = (text, map) => text.replace(/\{(\w+)\}/g, (_, k) => (k in map ? map[k] : ''));

  // ---------- answers, kept in the browser so a refresh loses nothing ----------
  const fresh = () => ({ answers: Array(N).fill(null), pick: null });      // each answer is 2, 1, 0, -1, -2 or null
  const load = () => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && Array.isArray(s.answers) && s.answers.length === N && s.answers.every((a) => a === null || VALUES.includes(a)) && (s.pick === null || PICKS.includes(s.pick))) return { answers: s.answers, pick: s.pick };
    } catch { /* private mode, or a damaged save */ }
    return fresh();
  };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode */ } };
  let state = load();

  // test hook: ?a= sixteen digits, 5 for agree a lot down to 1 for disagree a lot. &pick=design, is, both or unsure
  const params = new URLSearchParams(location.search);
  if (new RegExp(`^[1-5]{${N}}$`).test(params.get('a') || '')) {
    state = fresh();
    state.answers = [...params.get('a')].map((c) => +c - 3);
    state.pick = PICKS.includes(params.get('pick')) ? params.get('pick') : 'unsure';
  }

  const firstOpen = () => { const i = state.answers.findIndex((a) => a === null); return i < 0 ? N : i; };
  const resume = () => (firstOpen() < N ? firstOpen() : state.pick ? 'result' : 'pick');

  // ---------- which step ----------
  const fromHash = () => {
    const h = location.hash.slice(1), n = /^q(\d+)$/.exec(h);
    if (n && +n[1] >= 1 && +n[1] <= N) return +n[1] - 1;
    return h === 'pick' || h === 'result' ? h : 'hero';
  };
  const toHash = (step) => (step === 'hero' ? '' : typeof step === 'number' ? `#q${step + 1}` : `#${step}`);
  const allowed = (step) => {            // nobody skips ahead of their own answers
    const open = firstOpen();
    if (step === 'hero') return 'hero';
    if (typeof step === 'number') return Math.min(step, Math.min(open, N - 1));
    if (open < N) return open;
    return step === 'result' && !state.pick ? 'pick' : step;
  };
  function go(step, note, how) {
    step = allowed(step);
    const url = location.pathname + location.search + toHash(step);
    if (location.pathname + location.search + location.hash !== url) history.pushState(null, '', url);
    render(step, true, note, how);
  }
  window.addEventListener('popstate', () => render(allowed(fromHash()), true));

  // ---------- drawing each step ----------
  let current = 'hero';
  function render(step, moveFocus, note, how) {
    current = step;
    const kind = typeof step === 'number' ? 'question' : step;
    frame.dataset.view = kind;
    view.classList.remove('enter', 'reveal');
    const n = typeof step === 'number' ? step + 1 : N + 1;
    stepEl.hidden = !(kind === 'question' || kind === 'pick');
    if (!stepEl.hidden) {
      $('step-text').textContent = `${n} of ${N + 1}`;
      $('step-bar').setAttribute('aria-label', `Step ${n} of ${N + 1}`);
      $('step-bar').firstElementChild.style.transform = `scaleX(${(n / (N + 1)).toFixed(3)})`;
    }
    more.hidden = kind !== 'result';
    if (kind === 'hero') hero();
    if (kind === 'question') question(step, note);
    if (kind === 'pick') pickStep(note);
    if (kind === 'result') result();
    // motion only when moving forward by tap or click. Going back, and keyboard answers, swap at once.
    // 'forward' = arrived without a wipe (the first statement, or motion turned down). 'wiped' = the wipe brought it in.
    if (kind === 'result' && how) { void view.offsetWidth; view.classList.add('reveal'); if (window.MT_motion) window.MT_motion.celebrate(view); }
    else if (how === 'forward') { void view.offsetWidth; view.classList.add('enter'); }
    // every statement takes a colour, the closing question takes the next one, and the result takes its lean's colour
    frame.style.setProperty('--q', kind === 'question' ? TONES[step % TONES.length] : kind === 'pick' ? TONES[N % TONES.length] : kind === 'result' ? roleTone(score().role) : '');
    document.title = kind === 'hero' ? baseTitle : `${kind === 'result' ? Q.roles[score().role].name : `${n} of ${N + 1}`} | Maker Type`;
    fit();
    // a resting pointer must not tint an answer on a new step: hover starts once the pointer moves
    view.classList.add('fresh');
    if (moveFocus) {
      const top = stage.getBoundingClientRect().top; if (Math.abs(top) > 8) stage.scrollIntoView({ block: 'start' });
      const h = view.querySelector('[tabindex="-1"]');
      if (h) h.focus({ preventScroll: true });
    }
  }

  function hero() {
    view.innerHTML = heroHTML;
    const start = $('start');
    const started = state.answers.some((a) => a !== null);
    const target = resume();
    if (started) {
      $('start-label').textContent = m['start.resume'];
      start.closest('.seal').insertAdjacentHTML('afterend', `<button type="button" class="textbtn" id="over">${esc(m['start.over'])}</button>`);
      $('over').addEventListener('click', askRestart);
    }
    // The tape. It follows the finger one to one while you pull. Let go early and it springs back, with a wobble.
    // Past a third of the way, or a flick, and it rips: it keeps the speed of your hand, speeds up, drops and turns as it leaves.
    // A tap, Enter or Space rips it for you. It can be caught again while it is springing back.
    // All of it is one transform on one element, written from one animation frame loop.
    const seal = start.closest('.seal');
    let x0 = 0, lx = 0, lt = 0, v = 0, dx = 0, x = 0, down = false, gone = false, went = false, raf = 0;
    const put = (y = 0, r = x * 0.012) => { start.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${r.toFixed(2)}deg)`; };
    const halt = () => { cancelAnimationFrame(raf); raf = 0; };
    const enter = () => { if (went) return; went = true; halt(); go(target, undefined, 'forward'); };
    const loop = (step) => { let last = performance.now(); const tick = (t) => { const dt = Math.min(0.032, (t - last) / 1000); last = t; raf = step(dt) ? requestAnimationFrame(tick) : 0; }; halt(); raf = requestAnimationFrame(tick); };
    // let go early: a spring pulls it home. Stiff enough to snap, loose enough to overshoot once.
    const home = (vx) => loop((dt) => {
      vx += (-210 * x - 14 * vx) * dt; x += vx * dt;
      if (Math.abs(x) < 0.4 && Math.abs(vx) < 8) { x = 0; start.style.transform = ''; start.classList.remove('free'); return false; }
      put(); return true;
    });
    // the rip: it leaves at the speed of the hand and keeps speeding up, falling a little and turning as it goes
    const rip = (vx) => {
      const w = start.offsetWidth, spin = 22 + Math.min(30, vx / 80);
      let y = 0, vy = -140, r = x * 0.012;
      vx = Math.max(vx, 1400);
      loop((dt) => { vx += 12000 * dt; vy += 2600 * dt; x += vx * dt; y += vy * dt; r += spin * dt; put(y, r); if (x > w * 1.1) { enter(); return false; } return true; });
      setTimeout(enter, 650);                               // in case frames are not running (a hidden tab)
    };
    const open = (vx = 0) => {
      if (gone) return; gone = true;
      if (reduced) { enter(); return; }
      start.classList.remove('pulling'); start.classList.add('free'); seal.classList.add('torn');
      rip(vx);
    };
    start.addEventListener('pointerdown', (e) => {
      if (gone) return;
      halt();
      if (!start.classList.contains('free')) {              // caught during its own small tug: start from where that put it, so it does not jump
        const t = getComputedStyle(start).transform; x = t && t !== 'none' ? new DOMMatrixReadOnly(t).m41 : 0;
      }
      down = true; x0 = e.clientX - x; lx = e.clientX; lt = e.timeStamp; v = 0; dx = x;       // caught where it is, even mid-spring
      start.classList.add('pulling', 'free'); put(); try { start.setPointerCapture(e.pointerId); } catch { /* older browsers */ }
    });
    start.addEventListener('pointermove', (e) => {
      if (!down || gone) return;
      dx = e.clientX - x0; v = (e.clientX - lx) / Math.max(1, e.timeStamp - lt); lx = e.clientX; lt = e.timeStamp;
      x = dx > 0 ? dx : dx / 5;                                          // pulled the wrong way, it resists
      put();
    });
    const letGo = (e) => {
      if (!down) return; down = false; start.classList.remove('pulling');
      if (e && e.timeStamp - lt > 90) v = 0;                // the hand stopped before it let go: that is not a flick
      if (gone) return;
      if (dx > start.offsetWidth * 0.33 || (v > 0.6 && dx > 48)) open(v * 1000);
      else if (reduced) { x = 0; start.style.transform = ''; start.classList.remove('free'); }
      else home(v * 1000);
    };
    start.addEventListener('pointerup', letGo);
    start.addEventListener('pointercancel', letGo);
    start.addEventListener('click', (e) => { if (e.detail === 0 || Math.abs(dx) < 6) open(); });      // detail 0 is Enter or Space
  }

  // One statement, said big, and five spots from Disagree on the left to Agree on the right. The statement is the loudest thing on the screen.
  const hosts = ['bridge-think', 'shaper-idle', 'builder-think', 'bridge-idle', 'shaper-think', 'builder-idle', 'bridge-wave', 'shaper-wave'];
  function question(i, note) {
    const s = S[i], chosen = state.answers[i];
    const spots = Q.scale.spots.map((p, k) => `<button type="button" class="spot" data-v="${p.v}" data-k="${k}" aria-pressed="${chosen === p.v}" aria-label="${esc(p.label)}" title="${esc(p.label)}"><span class="cap" aria-hidden="true">${esc(k === 0 ? Q.scale.left : k === Q.scale.spots.length - 1 ? Q.scale.right : p.cap || '')}</span></button>`).join('');
    view.innerHTML = `
      <div class="ask rate">
        <h2 class="statement" id="q-h" tabindex="-1" aria-level="1" style="--len: ${s.text.length}">${esc(s.text)}</h2>
        <div class="scale-wrap">
          <div class="scale" role="group" aria-labelledby="q-h">${spots}</div>
        </div>
        <p class="hint">${esc(m.keys)}</p>
      </div>
      <div class="host" data-who="${hosts[i % hosts.length].split('-')[0]}" aria-hidden="true"><span class="bubble">${esc(note || pick(Q.bubbles.waiting))}</span>${penguin(hosts[i % hosts.length], 300)}</div>`;
    // e.detail is 0 when the click came from the keyboard: those answers skip the animation
    view.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', (e) => choose(i, +b.dataset.v, b, e.detail === 0)));
  }

  let busy = false;
  // After any answer: a beat to see the spot fill, then the next step. Sixteen of these come one after another, so it is
  // kept short. The penguin's reaction is its line on the next screen, the same whatever was tapped.
  const BEAT = 40;      // long enough to see the circle fill, short enough not to be a wait: this happens sixteen times in a row
  function advance(from, el, viaKey, next, tone) {
    const note = pick(Q.bubbles.answered);
    if (viaKey || reduced || !el || !el.animate) { setTimeout(() => { busy = false; if (current === from) go(next, note, reduced ? 'forward' : undefined); }, BEAT); return; }
    setTimeout(() => { if (current !== from) { busy = false; return; } wipe(el, () => { busy = false; if (current === from) go(next, note, 'wiped'); }, tone); }, BEAT);
  }
  function choose(i, v, el, viaKey) {
    if (busy) return;
    busy = true;
    state.answers[i] = v;
    save();
    view.querySelectorAll('[data-v]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.v === v)));
    advance(i, el, viaKey, i + 1 < N ? i + 1 : 'pick', TONES[(i + 1) % TONES.length]);
  }

  // A disc of the accent colour grows from the answer you tapped, the next question is set behind it, then it clears.
  function wipe(el, then, tone) {
    const f = frame.getBoundingClientRect(), b = el.getBoundingClientRect();
    const x = b.left + b.width / 2 - f.left, y = b.top + b.height / 2 - f.top;
    const r = Math.max(Math.hypot(x, y), Math.hypot(f.width - x, y), Math.hypot(x, f.height - y), Math.hypot(f.width - x, f.height - y));
    const disc = document.createElement('div');
    disc.className = 'wipe';
    disc.style.cssText = `left:${x - r}px;top:${y - r}px;width:${2 * r}px;height:${2 * r}px${tone ? `;background:${tone}` : ''}`;
    frame.appendChild(disc);
    // the quiz never waits on the animation: if the browser holds it back (a hidden tab), move on anyway
    let moved = false;
    const move = () => { if (!moved) { moved = true; then(); } };
    const late = setTimeout(() => { move(); disc.remove(); }, 500);
    disc.animate([{ transform: 'scale(.04)' }, { transform: 'scale(1)' }], { duration: 200, easing: EASE, fill: 'forwards' }).finished
      .then(() => { clearTimeout(late); move(); return disc.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'ease', fill: 'forwards' }).finished; })
      .then(() => disc.remove(), () => { clearTimeout(late); move(); disc.remove(); });
  }

  // The closing question. It names the two fields, so it comes last, and it is not scored.
  function pickStep(note) {
    const p = Q.pick;
    view.innerHTML = `
      <div class="ask rate">
        <h2 class="statement" id="q-h" tabindex="-1" aria-level="1" style="--len: ${p.ask.length}">${esc(p.ask)}</h2>
        <div class="answers picks" role="group" aria-labelledby="q-h" aria-describedby="pick-help">${p.answers.map((a) => `<button type="button" class="answer" data-pick="${a.id}" aria-pressed="${state.pick === a.id}">${esc(a.label)}</button>`).join('')}</div>
        <p class="hint always" id="pick-help">${esc(p.help)}</p>
      </div>
      <div class="host" data-who="builder" aria-hidden="true"><span class="bubble">${esc(note || pick(Q.bubbles.pick))}</span>${penguin('builder-think', 300)}</div>`;
    view.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', (e) => {
      if (busy) return;
      busy = true;
      state.pick = b.dataset.pick; save();
      view.querySelectorAll('[data-pick]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      advance('pick', b, e.detail === 0, 'result', roleTone(score().role));
    }));
  }

  // ---------- the score ----------
  // The lean: the making statements minus the ordering ones. How you work: the people pair and the plan pair.
  function score() {
    const sum = { making: 0, ordering: 0, people: 0, plan: 0 }, agreed = { making: 0, ordering: 0 }, of = { making: 0, ordering: 0 };
    S.forEach((s, i) => {
      const a = state.answers[i] || 0;
      sum[s.group] += a * s.dir;
      if (s.group in agreed) { of[s.group] += 1; if (a > 0) agreed[s.group] += 1; }
    });
    const total = sum.making - sum.ordering, gap = Math.abs(total);
    const lean = gap <= 4 ? 'between' : total > 0 ? 'design' : 'is';
    const band = gap <= 4 ? 'between' : gap <= 8 ? 'slight' : 'clear';
    let role = 'allrounder';
    if (Math.abs(sum.people) >= 3 || Math.abs(sum.plan) >= 3) {
      role = Math.abs(sum.people) >= Math.abs(sum.plan) ? (sum.people > 0 ? 'facilitator' : 'quiet') : (sum.plan > 0 ? 'planner' : 'improviser');
    }
    const earnedBy = role === 'allrounder' ? null : role === 'facilitator' || role === 'quiet' ? 'people' : 'plan';
    return { lean, band, role, agreed, of, earnedBy, sum };
  }

  function result() {
    const sc = score(), L = Q.leans[sc.lean], R = Q.roles[sc.role], who = L.penguin;
    const words = { a: R.a, role: R.name, lean: sc.band === 'clear' ? L.clear : L.slight };
    const line = fill(m['result.line'], words);
    // the bar: Design at the left end, Information Systems at the right, and a knob where the answers landed (tug.js)
    const where = -(sc.sum.making - sc.sum.ordering);
    view.innerHTML = `
      <p class="giant" aria-hidden="true" style="--n: ${R.word.length}">${esc(R.word)}</p>
      <div class="winner">${penguin(`${who}-cheer`, 440, 'A dog, cheering')}</div>
      <div class="lean">
        <h2 id="q-h" tabindex="-1" aria-level="1">${esc(line)}</h2>
        ${window.tug.html({ tag: esc(m['bar.you']), label: esc(fill(m['bar.label'], { lean: words.lean })) })}
        <p class="note">${esc(m['result.note'])}</p>
      </div>
      <div class="actions">
        <button type="button" class="btn" id="share">${esc(m['result.share'])}</button>
        <button type="button" class="textbtn" id="again">${esc(m['result.again'])}</button>
      </div>`;
    window.tug.set(view.querySelector('.tug'), where);
    const image = `share/${sc.role}-${sc.lean}${sc.band === 'slight' ? '-slight' : ''}.png`;    // drawn by site/build.py --cards
    $('share').addEventListener('click', () => share(fill(m['share.text'], words), image));
    $('again').addEventListener('click', askRestart);

    // Under the result. Will, Nov 24: "too much textual overload... not using hierarchy correctly". So three levels:
    // what it added up to (four totals and the result line), then the things to take away (the card, one next step),
    // and every single answer only for whoever opens it. The full detail also goes on a sheet to print or save as a PDF.
    // Plus is green, minus is red, and the sign is always written, so it never rests on colour alone.
    const signed = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0'), tint = (v) => (v > 0 ? 'plus' : v < 0 ? 'minus' : 'none');
    const pill = (v) => `<b class="pull ${tint(v)}">${signed(v)}</b>`;
    const row = (s, i) => `<li class="row"><p>${esc(s.text)}</p>${pill((state.answers[i] || 0) * s.dir)}</li>`;
    const group = (key) => { const g = Q.groups[key]; return `<section class="grp"><h4>${esc(g.label)}</h4>
      <ul>${S.map((s, i) => (s.group === key ? row(s, i) : '')).join('')}</ul>
      <p class="sum"><span>${esc(fill(m['why.total'], { name: g.total }))}</span>${pill(sc.sum[key])}</p></section>`; };
    const gap = Math.abs(sc.sum.making - sc.sum.ordering);
    const leanEq = fill(m['why.eq.lean'], { d: signed(sc.sum.making), i: signed(sc.sum.ordering), gap, band: m[`why.band.${sc.band}`] });
    const roleEq = sc.earnedBy ? fill(m['why.eq.role'], { pair: Q.groups[sc.earnedBy].total, n: signed(sc.sum[sc.earnedBy]), role: R.name }) : m['why.eq.none'];
    const totals = `<ul class="totals">${Object.keys(Q.groups).map((k) => `<li><span>${esc(Q.groups[k].total)}</span>${pill(sc.sum[k])}</li>`).join('')}</ul>`;
    const every = `<div class="why"><div class="col">${group('making')}${group('ordering')}</div><div class="col">${group('people')}${group('plan')}</div></div>
      <p class="rule">${esc(leanEq)}</p><p class="rule">${esc(roleEq)}</p>`;
    const flat = new Set(state.answers).size === 1;          // the same answer sixteen times: say so, it is not a real All Rounder
    if (flat) view.querySelector('.note').textContent = m['why.same'];
    const p = Q.pick, same = state.pick === sc.lean || (state.pick === 'both' && sc.lean === 'between');
    const pickLine = `${p.said[state.pick || 'unsure']} ${same ? p.then.match : p.then[sc.lean]}`;
    const said = (p.answers.find((x) => x.id === (state.pick || 'unsure')) || {}).label || '';
    const saidHTML = `<dl aria-hidden="true"><div><dt>${esc(m['pick.said'])}</dt><dd>${esc(said)}</dd></div><div><dt>${esc(m['pick.answers'])}</dt><dd>${esc(sc.lean === 'between' ? m['bar.between'] : L.field)}</dd></div></dl>`;
    more.style.setProperty('--lean', leanTone(sc.lean)); more.style.setProperty('--role', roleTone(sc.role));
    $('more-h').textContent = flat ? m['why.same'] : R.read;
    $('more-sub').textContent = flat ? '' : L.read;
    $('more-honest').textContent = m['result.honest'];
    $('more-body').innerHTML = `
      <article class="tile sums">
        <h3>${esc(m['result.answers'])}</h3>
        ${totals}
        <p class="so">${esc(line)}</p>
        <details class="all"><summary>${esc(m['why.all'])}</summary>${every}</details>
      </article>
      <article class="tile card-tile">
        <h3>${esc(m['result.card'])}</h3>
        <div class="holo" id="holo">
          <div class="holo-card" role="img" aria-label="Your card. ${esc(line)}">
            <span class="h-clip"><i class="glare"></i></span>
            <span class="h-pre">I'm ${esc(R.a)}</span>
            <span class="h-word" style="--n: ${R.word.length}">${esc(R.word)}</span>
            <img class="h-pen" src="${PENS}/${who}-cheer.svg" alt="" width="230" height="235" loading="lazy">
            <span class="h-ask">${esc(words.lean)}</span>
            <img class="h-qr" src="share/qr.svg" alt="" width="72" height="72" loading="lazy">
          </div>
        </div>
        <div class="saves">
          <a class="btn light" href="${image}" download="maker-type.png">${esc(m['result.save'])}</a>
          <button type="button" class="btn light" id="pdf">${esc(m['result.pdf'])}</button>
        </div>
      </article>
      <article class="tile next"><h3>${esc(L.nextTitle)}</h3><p>${esc(L.next)}</p>${penguin(`${who}-walk`, 300)}</article>
      <article class="tile sure-tile"><h3 class="sr">${esc(m['pick.title'])}. ${esc(pickLine)}</h3>${saidHTML}</article>`;
    $('pdf').addEventListener('click', () => window.print());
    // The sheet: one page with the card, the reading, the next step and every answer. It is only ever shown on paper
    // (or in a PDF): the print styles hide the site and show this. Nothing is sent anywhere to make it.
    let sheet = $('sheet');
    if (!sheet) { sheet = document.createElement('section'); sheet.id = 'sheet'; sheet.setAttribute('aria-hidden', 'true'); document.body.appendChild(sheet); }
    sheet.style.setProperty('--role', roleTone(sc.role));
    const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    sheet.innerHTML = `
      <div class="sh-top">
        <p class="sh-brand">${esc(Q.hero.logo)}</p>
        <p class="sh-pre">I'm ${esc(R.a)}</p>
        <p class="sh-word">${esc(R.word)}</p>
        <p class="sh-line">${esc(line)}</p>
        ${window.tug.html({ tag: esc(m['bar.you']), label: '' })}
        <img class="sh-pen" src="${PENS}/${who}-cheer.svg" alt="">
      </div>
      <div class="sh-grid">
        <div><h3>${esc(R.read)}</h3><p>${esc(L.read)}</p><p>${esc(L.week)}</p>${saidHTML}</div>
        <div><h3>${esc(L.nextTitle)}</h3><p>${esc(L.next)}</p><h3>${esc(m['result.other'])}</h3><p>${esc(L.other)}</p></div>
      </div>
      <h3>${esc(m['result.answers'])}</h3>
      ${totals}
      ${every}
      <p class="sh-foot">${esc(m['result.honest'])}</p>
      <p class="sh-foot">${esc(fill(m['sheet.made'], { date }))}</p>`;
    window.tug.set(sheet.querySelector('.tug'), where);
    tilt($('holo'), 18, true);
  }

  // ---------- cards that tilt ----------
  // While the pointer is on the card, the card follows it one to one. When it leaves, a transition settles it.
  // Mouse: hover. Touch (only where asked): press and drag sideways, and the page still scrolls up and down.
  function tilt(wrap, max, touch) {
    if (reduced || !wrap || wrap.dataset.tilt) return;
    wrap.dataset.tilt = '1';
    const card = wrap.firstElementChild, glare = card.querySelector('.glare');
    let frameId = 0, x = 0, y = 0, down = false, follow = 0;
    const draw = () => {
      frameId = 0;
      const r = wrap.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, ((x - r.left) / r.width) * 2 - 1)), ny = Math.max(-1, Math.min(1, ((y - r.top) / r.height) * 2 - 1));
      card.style.transform = `rotateX(${(-ny * max).toFixed(2)}deg) rotateY(${(nx * max).toFixed(2)}deg)`;
      if (glare) glare.style.transform = `translate(${(nx * 35).toFixed(1)}%, ${(ny * 35).toFixed(1)}%)`;
    };
    const move = (e) => {
      if (e.pointerType !== 'mouse' && !(touch && down)) return;
      x = e.clientX; y = e.clientY;
      // the first frame eases in (120ms), after that the card is the pointer
      if (!wrap.classList.contains('live')) { wrap.classList.add('live'); clearTimeout(follow); follow = setTimeout(() => wrap.classList.add('held'), 120); }
      if (!frameId) frameId = requestAnimationFrame(draw);
    };
    const rest = () => {
      down = false; clearTimeout(follow);
      wrap.classList.remove('live', 'held');
      card.style.transform = ''; if (glare) glare.style.transform = '';
    };
    wrap.addEventListener('pointermove', move, { passive: true });
    wrap.addEventListener('pointerleave', rest);
    wrap.addEventListener('pointercancel', rest);
    if (touch) {
      wrap.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') return; down = true; move(e); });
      wrap.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') rest(); });
    }
  }

  // ---------- sharing, starting over, small messages ----------
  let toastTimer;
  function toast(text) {
    $('status').textContent = text;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $('status').textContent = ''; }, 3200);
  }
  async function share(text, image) {
    const url = location.origin + location.pathname;
    try {
      // share the card image itself where the phone allows it, else the words and the address
      let files;
      try {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], 'maker-type.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) files = [file];
      } catch { /* no image, share the words */ }
      if (navigator.share) await navigator.share(files ? { files, title: 'Maker Type', text } : { title: 'Maker Type', text, url });
      else { await navigator.clipboard.writeText(`${text} ${url}`); toast(m['share.copied']); }
    } catch (e) {
      if (e && e.name === 'AbortError') return;       // they closed the share sheet
      toast(m['share.fail']);
    }
  }
  const dialog = $('restart');
  let opener = null;                                  // focus goes back to whatever opened the dialog
  function askRestart(e) { opener = e && e.currentTarget; if (dialog.showModal) dialog.showModal(); else if (confirm(`${m['restart.title']} ${m['restart.body']}`)) restart(); }
  dialog.addEventListener('close', () => { if (opener && opener.isConnected) opener.focus(); opener = null; });
  function restart() { state = fresh(); save(); if (dialog.open) dialog.close(); go('hero'); }
  $('restart-yes').addEventListener('click', restart);
  $('restart-no').addEventListener('click', () => dialog.close());

  $('back').addEventListener('click', () => go(current === 'pick' ? N - 1 : current > 0 ? current - 1 : 'hero', pick(Q.bubbles.back)));

  window.addEventListener('pointermove', () => view.classList.remove('fresh'), { passive: true });

  // ---------- fitting ----------
  // Two things the stylesheet cannot know. The giant word is sized from an average letter width, so a wide word or a
  // fallback font can run past the frame: shrink it to fit. And the corner penguin is scenery: if the words reach it, it steps out.
  function fit() {
    const g = view.querySelector('.giant');
    if (g) {
      g.style.fontSize = '';
      const room = frame.clientWidth - 24;
      if (g.scrollWidth > room) g.style.fontSize = `${Math.floor(parseFloat(getComputedStyle(g).fontSize) * (room / g.scrollWidth))}px`;
    }
    const host = view.querySelector('.host');
    if (host) {
      host.classList.remove('away');
      const boxes = [...host.children].map((e) => e.getBoundingClientRect());
      const hit = [...view.querySelectorAll('.ask h2, .ask .scale-wrap, .ask .answer, .ask .hint.always')].some((el) => {
        const r = el.getBoundingClientRect();
        return boxes.some((b) => r.right > b.left + 8 && r.left < b.right - 8 && r.bottom > b.top + 8 && r.top < b.bottom - 8);
      });
      host.classList.toggle('away', hit);
    }
  }
  let fitId = 0;
  window.addEventListener('resize', () => { cancelAnimationFrame(fitId); fitId = requestAnimationFrame(fit); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

  // keys: 1 to 5 pick a spot, left to right (1 is Disagree a lot, 5 is Agree a lot), arrows move between the spots
  document.addEventListener('keydown', (e) => {
    if ((typeof current !== 'number' && current !== 'pick') || e.metaKey || e.ctrlKey || e.altKey || dialog.open) return;
    const buttons = [...view.querySelectorAll('[data-v], [data-pick]')];
    if (/^[1-5]$/.test(e.key) && buttons[+e.key - 1]) { e.preventDefault(); buttons[+e.key - 1].click(); return; }
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (step && buttons.length) {
      e.preventDefault();
      const at = buttons.indexOf(document.activeElement);
      buttons[(at + step + buttons.length) % buttons.length].focus();
    }
  });

  $('foot-line').textContent = m.footer;
  // if the address asks for a step that is not reachable yet, show the right step and correct the address
  { const want = fromHash(), can = allowed(want);
    if (want !== can) { try { history.replaceState(null, '', location.pathname + location.search + toHash(can)); } catch { /* file pages on some browsers */ } }
    render(can, false);
    if (can !== 'hero') requestAnimationFrame(() => stage.scrollIntoView({ block: 'start' })); }
  // the landing's buttons call this: go to the quiz, at the first unanswered step
  // the three example cards on the RESULT chapter lean toward the pointer, like the card you get
  document.querySelectorAll('.tcard').forEach((c) => tilt(c, 16, true));
  window.MT = { begin: () => go(resume(), undefined, 'forward') };
})();
