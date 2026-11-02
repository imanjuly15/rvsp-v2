/* What keeps the page in heaven while scrolling: a sky that warms toward the gate, passing clouds, growing vines. */
import Art from './art.js';

const Heaven = (function () {
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = () => window.innerWidth < 700;
  let layers = [];
  let gold = null;
  let rig = null;
  let vineState = null;
  let started = false;

  function cloudLayer(sky, heightVh, list) {
    const layer = document.createElement('div');
    layer.className = 'sky-layer';
    layer.style.height = `${heightVh}vh`;
    const scale = small() ? .62 : 1;
    list.forEach((c) => {
      const canvas = Art.cloudCanvas(c.w, c.h, c.seed);
      canvas.className = 'cloud';
      canvas.style.cssText = `left:${c.left}%;top:${c.top}%;width:${c.w * scale}px;height:${c.h * scale}px;opacity:${c.op};--dur:${c.dur}s;--dx:${c.dx}px`;
      layer.appendChild(canvas);
    });
    sky.appendChild(layer);
    layers.push({ el: layer, travelVh: heightVh - 100 });
  }

  function buildSky(sky) {
    sky.innerHTML = `
      <div class="sky-gradient"></div>
      <div class="sky-gold"></div>
      <div class="sun-rig"><div class="sun"></div><div class="rays"></div></div>`;
    Art.bakeLights(sky);
    gold = sky.querySelector('.sky-gold');
    rig = sky.querySelector('.sun-rig');
    cloudLayer(sky, 135, [
      { w: 760, h: 300, seed: 11, left: -14, top: 3, dur: 120, dx: 50, op: .75 },
      { w: 680, h: 270, seed: 29, left: 62, top: 15, dur: 150, dx: 70, op: .7 },
      { w: 760, h: 290, seed: 47, left: 12, top: 36, dur: 170, dx: 40, op: .6 },
      { w: 700, h: 280, seed: 61, left: 70, top: 58, dur: 140, dx: 60, op: .7 },
      { w: 760, h: 300, seed: 37, left: -20, top: 76, dur: 130, dx: 50, op: .7 },
    ]);
    cloudLayer(sky, 210, [
      { w: 820, h: 320, seed: 53, left: 58, top: 2, dur: 110, dx: 60, op: .95 },
      { w: 820, h: 320, seed: 71, left: -30, top: 22, dur: 125, dx: 60, op: .95 },
      { w: 780, h: 300, seed: 89, left: 64, top: 44, dur: 115, dx: 70, op: .95 },
      { w: 820, h: 320, seed: 103, left: -26, top: 64, dur: 135, dx: 60, op: .95 },
      { w: 780, h: 300, seed: 127, left: 58, top: 84, dur: 120, dx: 60, op: .95 },
    ]);
  }

  function buildBanks() {
    document.querySelectorAll('.bank').forEach((bank) => {
      const canvas = Art.cloudCanvas(1500, 300, Number(bank.dataset.seed), { bank: true, puffs: 100 });
      bank.appendChild(canvas);
      bank.insertAdjacentHTML('beforeend', `<svg class="bank-lotus" viewBox="-90 -84 180 100" aria-hidden="true">${Art.lotus(0, 0, 1, 100)}</svg>`);
    });
  }

  /* ---------- Vines ---------- */
  function buildVines() {
    const page = document.getElementById('page');
    const end = document.getElementById('heaven-end');
    const box = document.getElementById('vines');
    const W = page.clientWidth;
    const H = end.offsetTop + 40;
    const compact = W < 560;
    const edge = compact ? 5 : 34;
    const amp = compact ? 4 : 11;
    const scales = compact
      ? { lily: .42, jasmine: .3, bud: .46, leaf: .32 }
      : { lily: .6, jasmine: .38, bud: .6, leaf: .42 };
    const kinds = ['jasmine', 'leaf', 'lily', 'leaf', 'jasmine', 'bud', 'leaf', 'jasmine'];
    const spacing = compact ? 42 : 54;
    const blooms = [];
    const SEGMENT = 220;
    let paths = '';
    let flowers = '';

    const segments = [];
    [0, 1].forEach((side) => {
      const rand = Art.seeded(side ? 907 : 311);
      const xAt = (y) => {
        const wave = Math.sin(y / 64 + side * 2) * amp + Math.sin(y / 171) * amp * .5;
        return side ? W - edge + wave : edge + wave;
      };
      // The vine is drawn in short lengths, so growing it only repaints the part that is growing.
      for (let y0 = 0; y0 < H; y0 += SEGMENT) {
        const y1 = Math.min(y0 + SEGMENT, H);
        let d = `M${xAt(y0).toFixed(1)} ${y0}`;
        for (let y = y0 + 16; y <= y1; y += 16) d += `L${xAt(y).toFixed(1)} ${y}`;
        paths += `<path class="page-vine" d="${d}" data-y0="${y0}" data-y1="${y1}"/>`;
      }
      let i = side * 3;
      for (let y = 30 + side * 18; y < H; y += spacing + rand() * spacing * .5) {
        const kind = kinds[i++ % kinds.length];
        const inward = side ? -1 : 1;
        const x = xAt(y) + (kind === 'leaf' ? 0 : inward * rand() * (compact ? 2 : 7));
        const turn = kind === 'leaf' ? ` rotate(${(side ? 180 : 0) + (rand() < .5 ? -48 : 48)})` : '';
        flowers += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(0)})${turn} scale(${scales[kind]})"><g class="v-bloom" data-y="${y.toFixed(0)}"><use href="#f-${kind}"/></g></g>`;
      }
    });

    box.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${paths}${flowers}</svg>`;
    box.querySelectorAll('.page-vine').forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      segments.push({ path, length, y0: Number(path.dataset.y0), y1: Number(path.dataset.y1) });
    });
    segments.sort((a, b) => a.y0 - b.y0);
    blooms.push(...box.querySelectorAll('.v-bloom'));
    blooms.sort((a, b) => a.dataset.y - b.dataset.y);
    vineState = { segments, nextSegment: 0, blooms, H, next: 0, reach: 0 };
  }

  function growVines(reach) {
    if (!vineState || reach <= vineState.reach) return;
    vineState.reach = reach;
    const { segments, blooms } = vineState;
    while (vineState.nextSegment < segments.length && segments[vineState.nextSegment].y1 <= reach) {
      const done = segments[vineState.nextSegment];
      done.path.style.strokeDashoffset = '0';
      vineState.nextSegment += 1;
    }
    for (let i = vineState.nextSegment; i < segments.length && segments[i].y0 < reach; i++) {
      const seg = segments[i];
      seg.path.style.strokeDashoffset = `${seg.length * (1 - (reach - seg.y0) / (seg.y1 - seg.y0))}`;
    }
    while (vineState.next < blooms.length && Number(blooms[vineState.next].dataset.y) < reach) {
      blooms[vineState.next].classList.add('open');
      vineState.next += 1;
    }
  }

  /* ---------- Scroll ---------- */
  let range = 1;
  let shown = 0;
  let running = false;
  let lastFrame = 0;

  function measure() {
    range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  // The sky eases toward the scroll position, so a flick or a mouse wheel glides instead of jumping.
  function frame(now) {
    const top = window.scrollY;
    const dt = Math.max(0, Math.min((now - lastFrame) / 1000, .1));
    lastFrame = now;
    const target = Math.min(top / range, 1);
    shown += (target - shown) * (1 - Math.exp(-dt * 8));
    if (Math.abs(target - shown) < .0004) shown = target;
    gold.style.opacity = shown.toFixed(3);
    if (calm) {
      growVines(Infinity);
    } else {
      rig.style.transform = `translate3d(0, ${(shown * 34).toFixed(2)}vh, 0)`;
      layers.forEach((l) => { l.el.style.transform = `translate3d(0, ${(-shown * l.travelVh).toFixed(2)}vh, 0)`; });
      if (started) growVines(top + window.innerHeight * .92);
    }
    if (shown !== target) {
      requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  function onScroll() {
    if (running) return;
    running = true;
    lastFrame = performance.now();
    requestAnimationFrame(frame);
  }

  function watch(selector, threshold) {
    const items = document.querySelectorAll(selector);
    if (calm || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('seen'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('seen');
        io.unobserve(entry.target);
      });
    }, { threshold });
    items.forEach((el) => io.observe(el));
  }

  function init(sky) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { measure(); onScroll(); });

    // Paint one piece per frame, so the first thing a guest sees arrives without waiting for all of it.
    const tasks = [
      () => buildSky(sky),
      buildBanks,
      buildVines,
      () => { measure(); onScroll(); watchSize(); },
    ];
    const next = () => {
      const task = tasks.shift();
      if (!task) return;
      task();
      requestAnimationFrame(() => setTimeout(next, 0));
    };
    next();
  }

  // The form opens and closes as guests answer. Small changes need nothing redrawn; the vines are simply clipped.
  function watchSize() {
    const page = document.getElementById('page');
    let width = page.clientWidth;
    let height = page.offsetHeight;
    let timer;
    new ResizeObserver(() => {
      measure();
      onScroll();
      const moved = Math.abs(page.offsetHeight - height);
      if (page.clientWidth === width && moved < 320) return;
      width = page.clientWidth;
      height = page.offsetHeight;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const reach = vineState ? vineState.reach : 0;
        buildVines();
        vineState.blooms.forEach((b) => { b.style.transition = 'none'; });
        growVines(reach);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          vineState.blooms.forEach((b) => { b.style.transition = ''; });
        }));
      }, 400);
    }).observe(page);
  }

  /** Begins growth once the page is actually showing. */
  function start() {
    started = true;
    watch('.bank', .35);
    onScroll();
  }

  return { init, start };
})();

export default Heaven;
