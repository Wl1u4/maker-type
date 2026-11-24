// A live dog, drawn in code. No images, no 3D library. The mascot since Nov 24 (Will: "redesign the mascot into a dog", then "swap it in then").
// It is the live penguin's model with the animal changed, so everything that worked still works: the same egg body on a lathe,
// the same three kits, the same states (hello, idle, look, held, spin, dizzy, swap, sleep, scroll), the same way to use it.
// What makes it a dog: floppy ears that swing, a muzzle with a nose and a mouth, eyebrow spots, paws with toes, front legs
// that end in paws, and a tail that wags. It is a black and tan dog: ink body, white chest, and the accent colour on the
// muzzle, the eyebrow spots and the paws. That keeps the brand's three colours and the accent sits
// where the penguin's beak and feet had it.
//   shaper  tall, beret, pencil      bridge  round, headphones, phone      builder  short, beanie, glasses, laptop
//   plain   no kit, for the logo
(function () {
  const INK = '#111111', WHITE = '#FFFFFF', EDGE = '#363636', SHEEN = '#2C2C2C', TAU = Math.PI * 2;
  const TILT = 0.13;            // the camera looks down a little, so the ground and anything flat can be seen
  const UW = 340, UH = 330, GROUND = 300, ARM = 60;
  // W half the width, D half the depth, H the height, tm how far down the widest point is, te how far down the eyes are
  const SHAPES = {
    shaper: { W: 60, D: 54, H: 190, tm: .6, te: .29 },
    bridge: { W: 72, D: 64, H: 168, tm: .58, te: .31 },
    builder: { W: 72, D: 62, H: 148, tm: .56, te: .34 },
    plain: { W: 70, D: 62, H: 166, tm: .58, te: .31 },
  };
  const ORDER = ['shaper', 'bridge', 'builder'];
  // the arm that holds something: a is how far it is lifted away from hanging down, f how far it comes forward
  const HOLD = { shaper: { a: 2.25, f: .45 }, bridge: { a: 1.85, f: .8 }, builder: { a: 1.3, f: .35 }, plain: { a: .32, f: 0 } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // the egg: a full round head down to the widest point, then a flatter bottom
  const prof = (t, tm) => t < tm ? Math.pow(Math.max(0, 1 - Math.pow((tm - t) / tm, 2.5)), 1 / 2.5) : Math.pow(Math.max(0, 1 - Math.pow((t - tm) / (1 - tm), 2.6)), 1 / 2.6);

  class Dog {
    constructor(canvas, kind, accent) {
      Object.assign(this, { cv: canvas, ctx: canvas.getContext('2d'), kit: SHAPES[kind] ? kind : 'shaper', accent, paper: canvas.dataset.paper || WHITE, onKit: () => {} });
      this.S = { ...SHAPES[this.kit] };
      Object.assign(this, { yaw: 0, vyaw: 0, spinV: 0, extra: 0, pitch: 0, ty: 0, tp: 0, ax: 0, ay: 0, roll: 0, sq: 0, sqv: 0, jump: 0, spun: 0,
        mode: 'idle', until: 0, start: 0, next: null, held: false, blink: 0, nextBlink: 1500, hello: 0, scrolled: -1e9, t: 0,
        arms: [{ a: .36, f: 0 }, { ...HOLD[this.kit] }], lift: [0, 0] });
      this.resize();
    }
    resize() {
      const r = this.cv.getBoundingClientRect();
      const d = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(2.6e6 / Math.max(1, r.width * r.height)));   // big canvases stay affordable
      this.w = r.width; this.h = r.height; this.d = d;
      this.cv.width = Math.round(r.width * d); this.cv.height = Math.round(r.height * d);
    }
    // jump, spin once, and land as the next maker
    swap(now, instant) {
      const to = ORDER[(ORDER.indexOf(this.next || this.kit) + 1) % ORDER.length];
      if (instant) { this.kit = to; this.S = { ...SHAPES[to] }; this.arms[1] = { ...HOLD[to] }; this.onKit(to); return; }
      if (this.mode === 'swap') return;
      this.mode = 'swap'; this.start = now; this.next = to; this.spinV = 0; this.sqv = -0.0032;
    }

    update(dt, now) {
      this.t = now;
      const T = SHAPES[this.kit], k = (ms) => 1 - Math.exp(-dt / ms);
      for (const key in T) this.S[key] += (T[key] - this.S[key]) * k(90);
      if (this.mode === 'swap') {
        const p = clamp((now - this.start) / 760, 0, 1);
        if (p >= .45 && this.next) { this.kit = this.next; this.next = null; this.onKit(this.kit); }
        this.jump = Math.sin(p * Math.PI) * 54; this.extra = TAU * p * p * (3 - 2 * p);
        if (p >= 1) { this.mode = 'idle'; this.extra = 0; this.jump = 0; this.sqv = -0.0042; }
      }
      if (this.mode === 'dizzy' && now > this.until) this.mode = 'idle';
      const dizzy = this.mode === 'dizzy', sleep = this.mode === 'sleep';

      if (this.held) this.vyaw = 0;
      else if (Math.abs(this.spinV) > 0.0006) {                       // still turning from a flick
        this.yaw += this.spinV * dt; this.spun += Math.abs(this.spinV * dt); this.spinV *= Math.exp(-dt / 520);
        if (Math.abs(this.spinV) <= 0.0006) { if (this.spun > 5.5) { this.mode = 'dizzy'; this.until = now + 1700; } this.spun = 0; this.yaw = Math.atan2(Math.sin(this.yaw), Math.cos(this.yaw)); }
      } else {
        let ty = this.ty, tp = this.tp;
        if (dizzy) { ty = Math.sin(now / 130) * .3; tp = Math.cos(now / 170) * .1; }
        if (sleep) { ty = .14; tp = .3; }
        const n = Math.ceil(dt / 8), h = dt / n;                      // a soft spring, so a turn overshoots a touch and settles
        for (let i = 0; i < n; i++) { this.vyaw += (-0.00011 * (this.yaw - ty) - 0.0125 * this.vyaw) * h; this.yaw += this.vyaw * h; }
        this.pitch += (tp - this.pitch) * k(130);
      }
      { const n = Math.ceil(dt / 8), h = dt / n; for (let i = 0; i < n; i++) { this.sqv += (-0.0004 * this.sq - 0.011 * this.sqv) * h; this.sq += this.sqv * h; } }
      const lean = clamp(-this.vyaw * 26, -.1, .1) + Math.sin(now / 1900) * .012 + (dizzy ? Math.sin(now / 160) * .07 : 0);
      this.roll += (lean - this.roll) * k(140);

      const up = this.mode === 'swap', hold = HOLD[this.kit];
      const free = up ? { a: 2.55, f: .3 } : this.held ? { a: 1.25, f: .2 } : dizzy ? { a: .9 + Math.sin(now / 140) * .25, f: .2 }
        : now < this.hello ? { a: 2.3 + Math.sin(now / 95) * .34, f: .5 } : sleep ? { a: .28, f: 0 } : { a: .32 + Math.sin(now / 900) * .05, f: 0 };
      const busy = up ? { a: 2.6, f: .3 } : sleep ? { a: hold.a * .8, f: hold.f } : hold;
      [free, busy].forEach((g, i) => { this.arms[i].a += (g.a - this.arms[i].a) * k(100); this.arms[i].f += (g.f - this.arms[i].f) * k(100); });

      const walking = now - this.scrolled < 450, beat = now % 5600;
      this.lift[0] = walking ? Math.max(0, Math.sin(now / 85)) * 9 : 0;
      this.lift[1] = walking ? Math.max(0, Math.sin(now / 85 + Math.PI)) * 9 : (beat < 560 && !sleep && !up ? Math.abs(Math.sin(beat / 560 * TAU)) * 6 : 0);
      if (now > this.nextBlink) { this.blink = now + 120; this.nextBlink = now + 1800 + Math.random() * 3200; }
    }

    draw() {
      const { ctx, w, h, d, S, accent, t } = this, U = Math.min(w / UW, h / UH), CREAM = this.paper;
      const yaw = this.yaw + this.extra, cy = Math.cos(yaw), sy = Math.sin(yaw), sp = Math.sin(this.pitch + TILT);
      const sleep = this.mode === 'sleep', dizzy = this.mode === 'dizzy', happy = this.mode === 'swap';
      const breathe = Math.sin(t / (sleep ? 1300 : 900)) * (sleep ? .018 : .01);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.cv.width, this.cv.height);
      ctx.setTransform(d * U, 0, 0, d * U, d * w / 2, d * (h - (UH - GROUND) * U));
      ctx.lineJoin = ctx.lineCap = 'round';
      // the shadow stays on the ground and shrinks while the dog is in the air
      { const air = 1 - this.jump / 54 * .4; ctx.fillStyle = 'rgba(17,17,17,.2)'; ctx.beginPath(); ctx.ellipse(0, 4, (S.W + 34) * air, 12 * air, 0, 0, TAU); ctx.fill(); }
      ctx.translate(0, -this.jump); ctx.rotate(this.roll); ctx.scale(1 - this.sq * .55, 1 + this.sq + breathe);

      // turn, then let near things sit a little lower on the screen (the camera tilt, plus a nod)
      const pr = (x, y, z) => { const x1 = x * cy + z * sy, z1 = -x * sy + z * cy; return [x1, y + z1 * sp, z1]; };
      const P = (v) => pr(v[0], v[1], v[2]);
      const ell = (c, r, fill, line, rot, half) => {
        const [x, y] = P(c);
        ctx.beginPath(); ctx.ellipse(x, y, Math.max(.5, Math.hypot(r[0] * cy, r[2] * sy)), Math.max(.5, Math.hypot(r[1], r[2] * sp)), rot || 0, half ? Math.PI : 0, TAU); if (half) ctx.closePath();
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (line) { ctx.lineWidth = line; ctx.strokeStyle = INK; ctx.stroke(); }
      };
      const poly = (pts, fill, line) => {
        ctx.beginPath(); pts.forEach((v, i) => { const [x, y] = P(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath();
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (line) { ctx.lineWidth = line; ctx.strokeStyle = INK; ctx.stroke(); }
      };
      const rod = (a, b, width, colour) => { const p = P(a), q = P(b); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.lineWidth = width; ctx.strokeStyle = colour; ctx.stroke(); };
      const mix = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
      const plus = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

      const wx = Math.hypot(S.W * cy, S.D * sy), N = 26;
      const bodyPath = (grow) => {
        const g = grow || 0;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) { const u = (1 - Math.cos(Math.PI * i / N)) / 2; ctx.lineTo((wx + g) * prof(u, S.tm), -S.H * (1 - u)); }
        for (let i = N; i >= 0; i--) { const u = (1 - Math.cos(Math.PI * i / N)) / 2; ctx.lineTo(-(wx + g) * prof(u, S.tm), -S.H * (1 - u)); }
        ctx.closePath();
      };
      const at = (u, ang, out) => { const f = prof(u, S.tm) * (out || 1); return [S.W * f * Math.sin(ang), -S.H * (1 - u), S.D * f * Math.cos(ang)]; };   // a point on the egg
      const eyeY = -S.H * (1 - S.te);

      const items = [], add = (z, f) => items.push({ z, f });

      // ---- paws, with two toe lines when they face you ----
      [-1, 1].forEach((side, i) => { const c = [side * 27, -7 - this.lift[i], 18]; add(P(c)[2], () => {
        ell(c, [25, 10, 23], accent, 4.5);
        if (cy > .25) [-7, 7].forEach((k) => rod(plus(c, [k, -3, 22]), plus(c, [k, 5, 24]), 3, INK));
      }); });
      // ---- the tail: one tapered shape. Thin where it joins, fuller in the middle, a round bushy white end, and a few tufts of fur
      // along its outer edge. It swings from the root as one piece and the tip follows a beat late. Faster when the dog is pleased.
      // It grows from the hip on the side of the free front leg, runs out under that paw and then up, so nothing the dog holds hides it.
      // (Will, Nov 24: three rods end to end read as a tentacle, "it should be a bit furry".) ----
      { const glad = happy || t < this.hello, beat = t / (glad ? 55 : 170);
        const wag = sleep ? 0 : Math.sin(beat) * (glad ? .26 : .1), late = sleep ? 0 : Math.sin(beat - 1) * (glad ? .24 : .1);
        const turn = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
        const root = at(.8, -2.55, .9), bend = plus(root, turn([-52, 6, -8], wag)), tip = plus(root, turn([-62, -54, -10], wag + late));      // three quarters of its first size (Will, Nov 24: "a bit too big")
        // more points toward the end, where the outline turns fastest
        const n = 26, us = Array.from({ length: n + 1 }, (_, i) => Math.sin(Math.PI / 2 * i / n)), k = us.findIndex((u) => u >= .64), spine = [];
        for (let i = 0; i <= n; i++) { const u = us[i]; spine.push(P(mix(mix(root, bend, u), mix(bend, tip, u), u))); }
        const front = spine[n >> 1][2] > 0;
        add(front ? 40 : -150, () => {
          let A = [], B = [], tx = 1, ty = 0;
          for (let i = 0; i <= n; i++) {
            const u = us[i], a = spine[Math.max(0, i - 1)], b = spine[Math.min(n, i + 1)], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
            if (len > .01) { tx = (b[0] - a[0]) / len; ty = (b[1] - a[1]) / len; }
            const grow = Math.min(1, u / .6), half = u < .6 ? 4 + 6 * grow * grow * (3 - 2 * grow) : 10 * Math.sqrt(Math.max(0, 1 - Math.pow((u - .6) / .4, 2))), [x, y] = spine[i];      // thin at the hip, full by the middle, a round end
            A.push([x - ty * half, y + tx * half, x - ty * (half + 2) + tx * 5, y + tx * (half + 2) + ty * 5, tx, ty]);      // an edge point, the tuft that can grow from it, and which way the tail runs there
            B.push([x + ty * half, y - tx * half, x + ty * (half + 2) + tx * 5, y - tx * (half + 2) + ty * 5, tx, ty]);
          }
          // the tufts grow on the outside of the curve, whichever way the dog is turned
          const r = P(root), c = P(bend), e = P(tip);
          if ((c[0] - r[0]) * (e[1] - c[1]) - (c[1] - r[1]) * (e[0] - c[0]) < 0) [A, B] = [B, A];
          const tufts = [us.findIndex((u) => u >= .3), us.findIndex((u) => u >= .48)];
          const shape = () => {
            ctx.beginPath(); ctx.moveTo(A[0][0], A[0][1]);
            for (let i = 1; i <= n; i++) ctx.lineTo(A[i][0], A[i][1]);
            for (let i = n - 1; i >= 0; i--) { if (tufts.includes(i)) ctx.lineTo(B[i][2], B[i][3]); ctx.lineTo(B[i][0], B[i][1]); }
            ctx.closePath();
          };
          if (front) { ctx.save(); bodyPath(); ctx.clip(); shape(); ctx.lineWidth = 7; ctx.strokeStyle = EDGE; ctx.stroke(); ctx.restore(); }
          shape(); ctx.fillStyle = INK; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
          // the white tip, with a jagged line of fur where it meets the black
          const a = A[k], b = B[k], at2 = (u, d) => [a[0] + (b[0] - a[0]) * u - a[4] * d, a[1] + (b[1] - a[1]) * u - a[5] * d];
          ctx.beginPath(); ctx.moveTo(a[0], a[1]);
          for (let i = k + 1; i <= n; i++) ctx.lineTo(A[i][0], A[i][1]);
          for (let i = n - 1; i >= k; i--) ctx.lineTo(B[i][0], B[i][1]);
          [[.8, 4], [.6, -1.5], [.4, 4.5], [.2, -1.5]].forEach(([u, d]) => { const q = at2(1 - u, d); ctx.lineTo(q[0], q[1]); });
          ctx.closePath(); ctx.fillStyle = CREAM; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
        }); }

      // ---- front legs, each ending in a paw. A leg in front of the body gets a soft edge where it crosses it. ----
      const hands = [];
      [-1, 1].forEach((side, i) => {
        const arm = this.arms[i], sh = at(.44, side * Math.PI / 2, .94);
        const dir = [side * Math.sin(arm.a) * Math.cos(arm.f), Math.cos(arm.a), Math.sin(arm.a) * Math.sin(arm.f)];
        const hand = plus(sh, dir.map((v) => v * ARM)); hands[i] = hand;
        const z = P(mix(sh, hand, .6))[2], front = z > 5;
        const limb = (grow, fill) => {
          const a = P(sh), b = P(hand), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
          ctx.beginPath(); ctx.arc(a[0], a[1], 14 + grow, ang + Math.PI / 2, ang - Math.PI / 2); ctx.arc(b[0], b[1], 9.5 + grow, ang - Math.PI / 2, ang + Math.PI / 2); ctx.closePath();
          ctx.fillStyle = fill; ctx.fill();
        };
        add(front ? z + 20 : Math.min(z - 20, -1), () => {
          if (front) { ctx.save(); bodyPath(); ctx.clip(); limb(2.5, EDGE); ctx.restore(); }
          limb(0, INK);
          const b = P(hand); ctx.beginPath(); ctx.arc(b[0], b[1], 9.5, 0, TAU); ctx.fillStyle = accent; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = INK; ctx.stroke();
        });
      });
      const hand = hands[1], handZ = P(hand)[2];

      // ---- the body, with the belly and the eyes kept inside its edge ----
      add(0, () => {
        bodyPath(); ctx.fillStyle = INK; ctx.fill();
        ctx.save(); bodyPath(); ctx.clip();
        // one flat band of lighter ink along the lit edge, so the egg reads as round
        ctx.fillStyle = SHEEN; ctx.fill(); ctx.save(); ctx.translate(7 + sy * 5, 6); bodyPath(); ctx.fillStyle = INK; ctx.fill(); ctx.restore();
        // the belly slides round the side and out of sight as the penguin turns its back
        { const bz = S.D * .62, x = cy >= 0 ? bz * sy : Math.sign(sy || 1) * (bz - cy * S.D * 1.5);
          ctx.beginPath(); ctx.ellipse(x, -S.H * .33 + bz * cy * sp, Math.max(.5, Math.hypot(S.W * .5 * cy, S.D * .32 * sy)), S.H * .19, 0, 0, TAU); ctx.fillStyle = WHITE; ctx.fill(); }
        const seen = [];
        [-1, 1].forEach((side) => {
          const ang = side * .4, face = Math.cos(ang + yaw); if (face < .1) return;
          const f = clamp(face * 1.15, 0, 1), [ex, ey] = P(at(S.te, ang)); seen.push([ex, ey, f]);
          if (!sleep) { ctx.beginPath(); ctx.ellipse(ex - side * 2 * f, ey - 28, 7.5 * f, 5, side * -.3, 0, TAU); ctx.fillStyle = accent; ctx.fill(); }       // an eyebrow spot
          if (sleep || happy || t < this.blink) {
            ctx.beginPath(); ctx.lineWidth = 5; ctx.strokeStyle = WHITE;
            if (happy) ctx.arc(ex, ey + 8, 13 * f, Math.PI * 1.15, Math.PI * 1.85); else { ctx.moveTo(ex - 13 * f, ey + 2); ctx.lineTo(ex + 13 * f, ey + 2); }
            ctx.stroke(); return;
          }
          ctx.beginPath(); ctx.ellipse(ex, ey, 17.5 * f, 19.5, 0, 0, TAU); ctx.fillStyle = WHITE; ctx.fill();
          const look = dizzy ? [Math.cos(t / 70 + side) * 6, Math.sin(t / 70 + side) * 6] : [this.ax * 6.5, this.ay * 6 + 1];
          ctx.beginPath(); ctx.ellipse(ex + look[0] * f, ey + look[1], 9 * f, 9.5, 0, 0, TAU); ctx.fillStyle = INK; ctx.fill();
          ctx.beginPath(); ctx.arc(ex + look[0] * f + 3.2 * f, ey + look[1] - 3.4, 2.8 * f, 0, TAU); ctx.fillStyle = WHITE; ctx.fill();
        });
        ctx.restore();
        if (this.kit === 'builder' && seen.length) {                  // glasses
          ctx.lineWidth = 5; ctx.strokeStyle = accent;
          seen.forEach(([ex, ey, f]) => { ctx.beginPath(); ctx.ellipse(ex, ey, 22.5 * f, 24, 0, 0, TAU); ctx.stroke(); });
          if (seen.length === 2) { ctx.beginPath(); ctx.moveTo(seen[0][0] + 22.5 * seen[0][2], seen[0][1]); ctx.lineTo(seen[1][0] - 22.5 * seen[1][2], seen[1][1]); ctx.stroke(); }
        }
      });

      // ---- the muzzle, with a nose on it and a mouth under the nose. The tongue is out when it is pleased. ----
      { const c = plus(at(S.te, 0), [0, 29, 8]), z = P(c)[2];
        add(z > 0 ? 60 : z, () => {
          ell(c, [25, 17, 21], accent, 4.5);
          ell(plus(c, [0, -9, 18]), [9.5, 7, 6], INK);
          const f = Math.cos(yaw);
          if (f > .25) { const [mx, my] = P(plus(c, [0, 3, 21]));
            if (happy) { ctx.beginPath(); ctx.ellipse(mx, my + 9, 6 * f, 8, 0, 0, TAU); ctx.fillStyle = WHITE; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
            ctx.beginPath(); ctx.moveTo(mx, my - 6); ctx.lineTo(mx, my + 1); ctx.moveTo(mx - 10 * f, my - 1); ctx.quadraticCurveTo(mx - 5 * f, my + 6, mx, my + 1); ctx.quadraticCurveTo(mx + 5 * f, my + 6, mx + 10 * f, my - 1);
            ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
        }); }
      // ---- ears: they hang from the sides of the head, swing as it leans, and fly up when it jumps ----
      [-1, 1].forEach((side) => {
        const top = at(S.te * .5, side * 1.35), c = plus(top, [side * 19, 25, 0]), z = P(c)[2];
        const rot = side * -.5 + this.roll * 2.2 + side * -(this.jump / 54) * .8 + Math.sin(t / 900 + side) * .04;
        add(z > 0 ? 55 + z : z - 25, () => {
          ctx.save(); bodyPath(); ctx.clip(); ell(c, [18.5, 38.5, 16], EDGE, 0, rot); ctx.restore();
          ell(c, [16, 36, 13.5], INK, 0, rot);
        });
      });

      // ---- the three kits ----
      if (this.kit === 'shaper') {
        add(400, () => {
          ell([7, -S.H + 6, 0], [S.W * .82, 15, S.D * .82], accent, 4.5, -.13);
          const [sx, sy2] = pr(3, -S.H - 9, 0); ctx.beginPath(); ctx.moveTo(sx, sy2); ctx.lineTo(sx + 4, sy2 - 12); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
        });
        const u = [.2, -.97, .12], a = plus(hand, u.map((v) => v * -22)), b = plus(hand, u.map((v) => v * 56)), tip = plus(hand, u.map((v) => v * 80));
        add(handZ - 2, () => {                                         // the pencil, with the flipper tip over it
          rod(a, b, 18, INK); rod(mix(a, b, .2), b, 9.5, accent); rod(a, mix(a, b, .1), 9.5, CREAM);
          const p = P(b), q = P(tip), ang = Math.atan2(q[1] - p[1], q[0] - p[0]), nx = -Math.sin(ang) * 8, ny = Math.cos(ang) * 8;
          ctx.beginPath(); ctx.moveTo(p[0] + nx, p[1] + ny); ctx.lineTo(q[0], q[1]); ctx.lineTo(p[0] - nx, p[1] - ny); ctx.closePath(); ctx.fillStyle = CREAM; ctx.fill(); ctx.lineWidth = 4.5; ctx.strokeStyle = INK; ctx.stroke();
          const m = [p[0] + (q[0] - p[0]) * .58, p[1] + (q[1] - p[1]) * .58];
          ctx.beginPath(); ctx.moveTo(m[0] + nx * .42, m[1] + ny * .42); ctx.lineTo(q[0], q[1]); ctx.lineTo(m[0] - nx * .42, m[1] - ny * .42); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
        });
      }
      if (this.kit === 'bridge') {
        const mid = [0, -S.H * (1 - S.tm), 0];
        add(1, () => {                                                 // the band follows the top of the head, a little outside it
          const pts = [];
          for (let i = -12; i <= 12; i++) { const u = S.te * (1 - Math.cos(Math.PI / 2 * i / 12)), s = Math.sign(i), v = [s * S.W * prof(u, S.tm), -S.H * (1 - u), 0]; const L = Math.hypot(v[0] - mid[0], v[1] - mid[1]) || 1; pts.push(mix(mid, v, 1 + 7 / L)); }
          pts.reverse();
          const trace = (width, colour) => { ctx.beginPath(); pts.forEach((v, i) => { const [x, y] = P(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.lineWidth = width; ctx.strokeStyle = colour; ctx.stroke(); };
          trace(14, INK); trace(5.5, accent);
        });
        [-1, 1].forEach((side) => { const c = [side * (S.W * prof(S.te, S.tm) + 3), eyeY + 2, 0], z = P(c)[2]; add(z > -4 ? 70 + z : z - 30, () => ell(c, [10, 23, 20], accent, 4.5)); });
        const r = .16, c = plus(hand, [2, -18, 5]), ux = [Math.cos(r) * 16, Math.sin(r) * 16, 0], uy = [-Math.sin(r) * 27, Math.cos(r) * 27, 0];
        const panel = (k1, k2) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([i, j]) => [c[0] + ux[0] * i * k1 + uy[0] * j * k2, c[1] + ux[1] * i * k1 + uy[1] * j * k2, c[2]]);
        add(handZ + 12, () => { poly(panel(1, 1), accent, 4.5); if (cy > 0) poly(panel(.62, .7), CREAM); else ell(plus(c, [-6, -16, 0]), [3.5, 3.5, 3.5], INK); });
      }
      if (this.kit === 'builder') {
        add(400, () => {
          const y0 = -S.H + 21, u = 21 / S.H, rx = S.W * prof(u, S.tm) + 5, rz = S.D * prof(u, S.tm) + 5;
          ell([0, y0, 0], [rx, 33, rz], accent, 4.5, 0, true);
          ell([0, y0, 0], [rx + 3, 9, rz + 3], CREAM, 4.5);
          ell([0, y0 - 38, 0], [10.5, 10.5, 10.5], CREAM, 4.5);
        });
        const b = plus(hand, [6, -10, 0]), W2 = 31;
        const base = [[-W2, 0, 21], [W2, 0, 21], [W2, 0, -21], [-W2, 0, -21]].map((v) => plus(b, v));
        const lid = (k1, k2) => [[-W2 * k1, -3 - 44 * (1 - k2) / 2, -21 - 5 * (1 - k2)], [W2 * k1, -3 - 44 * (1 - k2) / 2, -21 - 5 * (1 - k2)], [W2 * k1, -47 + 44 * (1 - k2) / 2, -31 + 5 * (1 - k2)], [-W2 * k1, -47 + 44 * (1 - k2) / 2, -31 + 5 * (1 - k2)]].map((v) => plus(b, v));
        add(handZ + 12, () => {
          const screen = () => { poly(lid(1, 1), accent, 4.5); if (cy > 0) poly(lid(.74, .62), CREAM); };
          const deck = () => poly(base, CREAM, 4.5);
          if (cy >= 0) { screen(); deck(); } else { deck(); screen(); }
        });
      }

      items.sort((a, b) => a.z - b.z).forEach((it) => it.f());
      if (sleep) { ctx.fillStyle = INK; ctx.font = '900 30px "Londrina Solid", sans-serif'; ctx.fillText('z', S.W + 12, -S.H + 10 - (t / 60 % 14)); ctx.font = '900 20px "Londrina Solid", sans-serif'; ctx.fillText('z', S.W + 34, -S.H - 16 - (t / 60 % 14)); }
    }
  }

  // ---- one loop and one set of listeners for every penguin on the page ----
  // opts: still (draw once, no loop), say(kit, what) is called after a tap ('swap') or a spin ('spin', 'turn').
  window.liveDogs = function (root, opts) {
    const still = opts && opts.still, say = (opts && opts.say) || (() => {});
    const pens = [...root.querySelectorAll('canvas[data-dog]')].map((cv) => new Dog(cv, cv.dataset.dog, cv.dataset.accent || '#F2B90F'));
    if (!pens.length) return pens;
    pens.forEach((p) => { p.onKit = (kit) => say(kit, 'swap'); });
    const hitOf = (p) => p.cv.parentElement.querySelector('[data-hit]') || p.cv;
    const paint = () => pens.forEach((p) => { p.resize(); p.draw(); });
    if (still) {
      pens.forEach((p) => { p.yaw = -.28; p.ax = -.4; hitOf(p).addEventListener('click', () => { p.swap(0, true); p.draw(); }); });
      paint(); window.addEventListener('resize', paint); if (document.fonts) document.fonts.ready.then(paint);
      return pens;
    }

    let last = performance.now(), lastMove = last, on = true, id = 0;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const aim = (px, py) => pens.forEach((p) => { const r = p.cv.getBoundingClientRect(); p.ax = clamp((px - (r.left + r.width / 2)) / (window.innerWidth * .36), -1, 1); p.ay = clamp((py - (r.top + r.height * .4)) / (window.innerHeight * .5), -1, 1); p.ty = p.ax * .62; p.tp = p.ay * .2; });
    const wake = () => { lastMove = performance.now(); pens.forEach((p) => { if (p.mode === 'sleep') p.mode = 'idle'; }); };
    const frame = (now) => {
      id = on ? requestAnimationFrame(frame) : 0;
      const dt = Math.min(50, now - last); last = now;
      pens.forEach((p) => {
        if (now - p.scrolled < 500) { p.tp = .26; p.ay = 1; }                                // the page is moving: look where it is going
        else if (!fine && now - lastMove > 2400) { p.ax = Math.random() * 2 - 1; p.ay = Math.random() - .3; p.ty = p.ax * .55; p.tp = p.ay * .2; }   // no mouse: glance around
        if (fine && now - lastMove > 14000 && p.mode === 'idle' && !p.held) p.mode = 'sleep';
        p.update(dt, now); p.draw();
      });
      if (!fine && now - lastMove > 2400) lastMove = now;
    };
    window.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { wake(); aim(e.clientX, e.clientY); } }, { passive: true });
    window.addEventListener('scroll', () => { const now = performance.now(); pens.forEach((p) => { p.scrolled = now; if (p.mode === 'sleep') p.mode = 'idle'; }); if (fine) lastMove = now; }, { passive: true });
    window.addEventListener('resize', () => pens.forEach((p) => p.resize()));
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on && !id) { last = performance.now(); id = requestAnimationFrame(frame); } }).observe(root);

    pens.forEach((p) => {
      const hit = hitOf(p);
      let lx = 0, lt = 0, moved = 0;
      p.hello = performance.now() + 2100;                               // a wave on arrival
      hit.addEventListener('pointerdown', (e) => { wake(); if (p.mode === 'swap') return; p.held = true; p.spinV = 0; p.spun = 0; p.mode = 'idle'; p.hello = 0; lx = e.clientX; lt = e.timeStamp; moved = 0; try { hit.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ } });
      hit.addEventListener('pointermove', (e) => {
        if (!p.held) return;
        const dx = e.clientX - lx, dt = Math.max(1, e.timeStamp - lt);
        p.yaw += dx * .011; p.spinV = clamp(dx * .011 / dt, -.03, .03); moved += Math.abs(dx); lx = e.clientX; lt = e.timeStamp;   // while held, the penguin is the finger
      });
      const drop = (e) => {
        if (!p.held) return; p.held = false;
        if (moved < 8) { p.spinV = 0; p.swap(performance.now()); }
        else { if (e.timeStamp - lt > 90) p.spinV = 0; say(p.kit, Math.abs(p.spinV) > .012 ? 'spin' : 'turn'); }
      };
      hit.addEventListener('pointerup', drop); hit.addEventListener('pointercancel', drop);
    });
    id = requestAnimationFrame(frame);
    return pens;
  };
  window.liveDogs.Dog = Dog;
})();
