// The lean bar. One bar, used twice: on the LEAN chapter you drag it, on the result it shows where your answers landed.
// Design is the left end and Information Systems the right end, both written under it. The middle third is "in between".
// It fills from the middle toward the knob, so an empty bar means no lean. Positions are transforms only.
// A value runs from -12 (all the way to Design) to 12 (all the way to Information Systems), and it is continuous,
// so the knob is under the finger and never jumps between steps. The quiz's own rule decides the
// words: 0 to 4 apart is between, 5 to 8 a little, 9 or more a lean.
window.tug = (() => {
  const MAX = 12;
  const names = () => { const Q = window.QUIZ, m = Q.microcopy; return [Q.leans.design.field, m['bar.between'], Q.leans.is.field]; };
  const html = ({ tag = '', drag = false, label = '' } = {}) => {
    const [d, b, s] = names();
    return `<div class="tug${drag ? ' drag' : ''}"${drag ? '' : ` role="img" aria-label="${label}"`}>
      <div class="tug-bar">
        <div class="tug-track"><span class="tug-half tug-d"><b></b></span><span class="tug-half tug-s"><b></b></span><i class="tug-mid"></i></div>
        ${drag ? `<input type="range" min="${-MAX}" max="${MAX}" step="any" value="0" aria-label="${label}">` : ''}
        <div class="tug-rail"><div class="tug-car"><span class="tug-knob">${tag ? `<em class="tug-tag">${tag}</em>` : ''}</span></div></div>
      </div>
      <div class="tug-names" aria-hidden="true"><span>${d}</span><span>${b}</span><span>${s}</span></div>
    </div>`;
  };
  const set = (el, v) => {
    el.dataset.lean = read(v).lean;                                                  // the name under the bar that is marked
    const f = (Math.max(-MAX, Math.min(MAX, v)) + MAX) / (2 * MAX);                 // 0 at Design, 1 at Information Systems
    el.querySelector('.tug-car').style.transform = `translateX(${(f * 100).toFixed(2)}%)`;
    // each half is a window on a full strip of colour. Sliding the strip uncovers it from the middle outward.
    el.querySelector('.tug-d b').style.transform = `translateX(${(Math.min(1, f * 2) * 100).toFixed(2)}%)`;
    el.querySelector('.tug-s b').style.transform = `translateX(${(-Math.min(1, (1 - f) * 2) * 100).toFixed(2)}%)`;
  };
  // which lean a value stands for, by the same bands the quiz uses
  const read = (v) => { const gap = Math.abs(v); return { lean: gap <= 4 ? 'between' : v < 0 ? 'design' : 'is', band: gap <= 4 ? 'between' : gap <= 8 ? 'slight' : 'clear' }; };
  return { MAX, html, set, read };
})();
