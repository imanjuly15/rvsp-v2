/* Hand-drawn SVG flowers and doves, plus procedural clouds and falling petals. */
const Art = (function () {
  const PETAL = 'M0 0C-14-12-16-34 0-46 16-34 14-12 0 0Z';
  const LILY_PETAL = 'M0 0C-13-14-14-36 0-54 14-36 13-14 0 0Z';
  const LOTUS_PETAL = 'M0 0C-17-16-19-48 0-74 19-48 17-16 0 0Z';

  function radial(count, draw) {
    let out = '';
    for (let i = 0; i < count; i++) out += draw((360 / count) * i);
    return out;
  }

  const DEFS = `
    <defs>
      <radialGradient id="g-petal" cx=".5" cy=".95" r=".95">
        <stop offset="0" stop-color="#f6e3a9"/><stop offset=".42" stop-color="#fffaf0"/><stop offset="1" stop-color="#ffffff"/>
      </radialGradient>
      <linearGradient id="g-lotus" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#eec766"/><stop offset=".4" stop-color="#fbedc6"/><stop offset="1" stop-color="#fffdf6"/>
      </linearGradient>
      <linearGradient id="g-lotus-back" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#dcb05a"/><stop offset=".55" stop-color="#f4e1b4"/><stop offset="1" stop-color="#fff6e0"/>
      </linearGradient>
      <linearGradient id="g-leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#a9bb7e"/><stop offset="1" stop-color="#607c47"/>
      </linearGradient>
      <linearGradient id="g-dove" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ece3d2"/>
      </linearGradient>
      <linearGradient id="g-dove-far" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f3ecdf"/><stop offset="1" stop-color="#d9cdb7"/>
      </linearGradient>
      <g id="f-jasmine">
        ${radial(5, (a) => `<path d="${PETAL}" transform="rotate(${a})" fill="url(#g-petal)" stroke="#c9a65c" stroke-opacity=".45" stroke-width="1"/>`)}
        <circle r="7" fill="#e6bc4d"/>
      </g>
      <g id="f-lily">
        ${radial(3, (a) => `<path d="${LILY_PETAL}" transform="rotate(${a + 60})" fill="#fbf1da" stroke="#c9a65c" stroke-opacity=".5" stroke-width="1"/>`)}
        ${radial(3, (a) => `<path d="${LILY_PETAL}" transform="rotate(${a})" fill="url(#g-petal)" stroke="#c9a65c" stroke-opacity=".5" stroke-width="1"/><path d="M0-6V-44" transform="rotate(${a})" stroke="#d8bd7c" stroke-width="1"/>`)}
        ${radial(6, (a) => `<g transform="rotate(${a + 30})"><path d="M0 0V-17" stroke="#c7a03e" stroke-width="1.4"/><ellipse cy="-18" rx="1.9" ry="3.4" fill="#a9792c"/></g>`)}
        <circle r="4" fill="#e9c75f"/>
      </g>
      <g id="f-leaf">
        <path d="M0 0C12-12 36-14 54 0 36 14 12 12 0 0Z" fill="url(#g-leaf)"/>
        <path d="M3 0H46" stroke="#e4ecc8" stroke-opacity=".6" stroke-width="1"/>
      </g>
      <g id="f-bud">
        <path d="M0 0C-8-6-8-18 0-26 8-18 8-6 0 0Z" fill="url(#g-petal)" stroke="#c9a65c" stroke-opacity=".5" stroke-width="1"/>
        <path d="M0 2C-5 0-7-5-6-9-3-7 0-6 0-6-0-6 3-7 6-9 7-5 5 0 0 2Z" fill="#7d9659"/>
      </g>
    </defs>`;

  /** A side-on lotus that opens petal by petal. Its base sits at (x, y). */
  function lotus(x, y, scale, delay) {
    const layers = [
      { angles: [-82, -60, -38, -18, 18, 38, 60, 82], fill: 'g-lotus-back', len: 1 },
      { angles: [-70, -46, -24, 0, 24, 46, 70], fill: 'g-lotus', len: .92 },
      { angles: [-36, -14, 14, 36], fill: 'g-lotus', len: .68 },
    ];
    let petals = '';
    layers.forEach((layer, li) => {
      layer.angles.forEach((a, i) => {
        const d = delay + li * 240 + Math.abs(a) * 5 + i * 8;
        petals += `<g transform="scale(${layer.len})"><path class="lotus-petal" d="${LOTUS_PETAL}" fill="url(#${layer.fill})" stroke="#c49a4e" stroke-opacity=".55" stroke-width="1" style="--a:${a}deg;--d:${d}ms"/></g>`;
      });
    });
    const leaves = `<g class="bloom" style="--d:${delay}ms"><use href="#f-leaf" transform="translate(-14 4) rotate(172) scale(1.5 1)"/><use href="#f-leaf" transform="translate(14 4) rotate(8) scale(1.5 1)"/></g>`;
    return `<g transform="translate(${x} ${y}) scale(${scale})">${leaves}${petals}</g>`;
  }

  function flower(kind, x, y, scale, delay) {
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale})"><g class="bloom" style="--d:${Math.round(delay)}ms"><use href="#f-${kind}"/></g></g>`;
  }

  function leaf(x, y, angle, scale, delay) {
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(0)}) scale(${scale})"><g class="bloom" style="--d:${Math.round(delay)}ms"><use href="#f-leaf"/></g></g>`;
  }

  function staticLotusGlyph() {
    const angles = [-64, -32, 0, 32, 64];
    const paths = angles.map((a) => `<path d="M0 0C-7-7-8-20 0-30 8-20 7-7 0 0Z" transform="rotate(${a})"/>`).join('');
    return `<svg viewBox="-34 -34 68 40" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5">${paths}</g></svg>`;
  }

  /* Each wing is its own layer, so flapping moves a finished picture instead of repainting the bird. */
  function doveMarkup() {
    const part = (cls, inner) => `<div class="${cls}"><svg viewBox="0 0 120 80" aria-hidden="true">${inner}</svg></div>`;
    return part('wing far', `
        <path d="M78 41C74 24 64 8 44 0 47 9 45 14 49 20 45 21 46 26 52 30 49 32 53 38 62 42 68 45 74 45 78 41Z" fill="url(#g-dove-far)"/>`)
      + part('dove-body', `
        <path d="M31 47 5 51 11 56 3 60 11 63 7 68 36 55Z" fill="url(#g-dove)" stroke="#cfc0a4" stroke-width=".7"/>
        <path d="M28 47C38 35 62 31 78 37 84 30 96 28 101 36 103 38 108 39 111 41 106 42 102 43 100 44 95 57 72 63 52 59 42 57 34 53 28 47Z" fill="url(#g-dove)" stroke="#cfc0a4" stroke-width=".7"/>
        <path d="M101 36C103 38 108 39 111 41 106 42 102 43 100 44 101 41 102 38 101 36Z" fill="#d8a84f"/>
        <circle cx="94" cy="36.5" r="1.7" fill="#3f2610"/>`)
      + part('wing', `
        <path d="M76 42C66 24 50 8 26 2 32 10 29 15 35 21 29 21 29 27 37 31 33 33 37 39 48 43 58 47 69 47 76 42Z" fill="url(#g-dove)" stroke="#cfc0a4" stroke-width=".8"/>
        <path d="M66 41C56 31 46 22 34 17M60 43C52 37 44 33 37 30" fill="none" stroke="#d8ccb4" stroke-width="1"/>`);
  }

  /** Flies a dove through waypoints [{x, y, s, o}] and removes it afterwards. x/y are CSS lengths. */
  function flyDove(layer, { path, duration, delay = 0, flip = false, flap = '.62s' }) {
    const el = document.createElement('div');
    el.className = 'dove';
    el.innerHTML = doveMarkup();
    el.style.setProperty('--flap', flap);
    el.style.opacity = '0';
    layer.appendChild(el);
    const flipPart = flip ? ' scaleX(-1)' : '';
    const frames = path.map((p) => ({
      transform: `translate(${p.x}, ${p.y}) scale(${p.s ?? 1})${flipPart}`,
      opacity: p.o ?? 1,
      offset: p.at,
    }));
    const anim = el.animate(frames, { duration, delay, easing: 'linear', fill: 'both' });
    anim.finished.then(() => el.remove()).catch(() => {});
    return anim;
  }

  function seeded(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /** Paints a soft cumulus cloud from layered radial puffs: warm shade beneath, bright white above. */
  function cloudCanvas(w, h, seed, opts = {}) {
    // Clouds are soft, so a smaller picture stretched up looks the same and costs far less.
    const res = window.innerWidth < 700 ? .5 : .75;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * res);
    canvas.height = Math.round(h * res);
    const ctx = canvas.getContext('2d');
    ctx.scale(res, res);
    const rand = seeded(seed);
    const count = opts.puffs || Math.round(w / 9);
    const floor = !!opts.floor;

    function puff(x, y, r, rgb, alpha) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${rgb},${alpha})`);
      g.addColorStop(.55, `rgba(${rgb},${alpha * .55})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    const points = [];
    for (let i = 0; opts.bank && i < count; i++) {
      points.push([w * rand(), h * (.34 + rand() * .32), h * (.14 + rand() * .14)]);
    }
    for (let i = 0; !opts.bank && i < count; i++) {
      const t = rand();
      const x = w * (floor ? t : .12 + t * .76);
      const hump = floor ? .55 + .45 * Math.sin(t * 19 + seed) * Math.sin(t * 7) : Math.sin(t * Math.PI);
      const top = floor ? h * (.5 - hump * .28) : h * (.72 - hump * .46);
      const y = top + rand() * (floor ? h * .6 : h * .3);
      const r = (floor ? h * .2 : h * .17) + rand() * (floor ? h * .22 : h * .17);
      points.push([x, y, r]);
    }
    points.forEach(([x, y, r]) => puff(x, y + r * .34, r * 1.1, '248,226,198', .22));
    points.sort((a, b) => a[1] - b[1]).forEach(([x, y, r]) => {
      puff(x, y, r, '255,255,255', .85);
      puff(x - r * .2, y - r * .22, r * .6, '255,255,255', .55);
    });
    if (floor) {
      const fade = ctx.createLinearGradient(0, h * .55, 0, h);
      fade.addColorStop(0, 'rgba(255,252,244,0)');
      fade.addColorStop(1, 'rgba(255,252,244,1)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, h * .55, w, h * .45);
    }
    // Feather the edges so puffs cut off by the canvas never show a straight line.
    ctx.globalCompositeOperation = 'destination-in';
    if (opts.bank) {
      const edge = ctx.createLinearGradient(0, 0, 0, h);
      edge.addColorStop(0, 'rgba(0,0,0,0)');
      edge.addColorStop(.3, 'rgba(0,0,0,1)');
      edge.addColorStop(.72, 'rgba(0,0,0,1)');
      edge.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, w, h);
    } else if (floor) {
      const edge = ctx.createLinearGradient(0, 0, 0, h * .4);
      edge.addColorStop(0, 'rgba(0,0,0,0)');
      edge.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = edge;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(w / 2, h / 2);
      const edge = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      edge.addColorStop(0, 'rgba(0,0,0,1)');
      edge.addColorStop(.62, 'rgba(0,0,0,1)');
      edge.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = edge;
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
    return canvas;
  }

  /* ---------- Light: painted once into small pictures that the graphics chip stretches and fades ---------- */
  function radialFill(ctx, size, stops) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * .707);
    stops.forEach(([at, color]) => g.addColorStop(at, color));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  function raysInto(ctx, size, on, off, color, mask) {
    const c = size / 2;
    ctx.fillStyle = color;
    for (let a = 0; a < 360; a += on + off) {
      const from = (a * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.arc(c, c, size * .72, from, from + (on * Math.PI) / 180);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'destination-in';
    radialFill(ctx, size, mask);
    ctx.globalCompositeOperation = 'source-over';
  }

  const LIGHTS = {
    sun: (ctx, n) => radialFill(ctx, n, [[0, 'rgba(255,246,214,.95)'], [.16, 'rgba(255,238,196,.5)'], [.46, 'rgba(255,238,196,0)']]),
    rays: (ctx, n) => raysInto(ctx, n, 5, 10, 'rgba(255,255,255,.2)', [[0, '#000'], [.62, 'rgba(0,0,0,0)']]),
  };

  /** Swaps each light placeholder inside root for a small painted canvas with the same class. */
  function bakeLights(root) {
    Object.entries(LIGHTS).forEach(([name, paint]) => {
      root.querySelectorAll(`div.${name}`).forEach((el) => {
        const size = name === 'rays' ? 768 : 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        canvas.className = el.className;
        paint(canvas.getContext('2d'), size);
        el.replaceWith(canvas);
      });
    });
  }

  /** Slow-falling white and pale-gold petals, tumbling in 3D. */
  function startPetals(canvas, density) {
    const ctx = canvas.getContext('2d');
    const colors = ['#ffffff', '#fff6df', '#fbe9c4', '#f7dfae', '#fdeee4'];
    let w = 0;
    let h = 0;
    let petals = [];
    let target = density;

    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -20 - Math.random() * h * .9,
        r: 6 + Math.random() * 8,
        vy: 14 + Math.random() * 20,
        sway: 16 + Math.random() * 34,
        phase: Math.random() * Math.PI * 2,
        spin: .5 + Math.random() * 1.1,
        tilt: Math.random() * Math.PI,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    }

    function draw(p) {
      ctx.save();
      ctx.translate(p.x + Math.sin(p.phase) * p.sway, p.y);
      ctx.rotate(p.tilt);
      ctx.scale(1, .35 + .65 * Math.abs(Math.cos(p.phase * 1.3)));
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.bezierCurveTo(p.r * .8, -p.r * .55, p.r * .7, p.r * .6, 0, p.r);
      ctx.bezierCurveTo(-p.r * .7, p.r * .6, -p.r * .8, -p.r * .55, 0, -p.r);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    }

    let last = performance.now();
    function frame(now) {
      const dt = Math.min((now - last) / 1000, .05);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.y += p.vy * dt;
        p.phase += dt * .9;
        p.tilt += dt * p.spin * .4;
        if (p.y > h + 24) {
          if (petals.length > target) petals.splice(i, 1);
          else petals[i] = spawn(false);
          continue;
        }
        draw(p);
      }
      requestAnimationFrame(frame);
    }

    size();
    window.addEventListener('resize', size);
    petals = Array.from({ length: density }, () => spawn(true));
    requestAnimationFrame(frame);
    return { setDensity(n) { target = n; while (petals.length < n) petals.push(spawn(false)); } };
  }

  /** Flowers cradling the lower half of the oval portrait. viewBox 0 0 320 400. */
  function portraitFlowers(baseDelay) {
    const cx = 160, cy = 200, rx = 151, ry = 190;
    let out = '';
    const pieces = [
      [38, 'leaf', .62], [28, 'jasmine', .34], [18, 'lily', .6], [6, 'jasmine', .36], [-6, 'leaf', .5],
      [142, 'leaf', .62], [152, 'jasmine', .34], [162, 'lily', .6], [174, 'jasmine', .36], [186, 'leaf', .5],
      [64, 'jasmine', .42], [116, 'jasmine', .42], [50, 'lily', .72], [130, 'lily', .72],
    ];
    pieces.forEach(([deg, kind, s], i) => {
      const rad = (deg * Math.PI) / 180;
      const x = cx + rx * Math.cos(rad);
      const y = cy + ry * Math.sin(rad);
      const d = baseDelay + i * 90;
      if (kind === 'leaf') out += leaf(x, y, deg < 90 ? deg - 80 : deg + 80, s, d);
      else out += flower(kind, x, y, s, d);
    });
    out += leaf(cx - 40, cy + ry + 2, 170, .9, baseDelay);
    out += leaf(cx + 40, cy + ry + 2, 10, .9, baseDelay);
    out += lotus(cx, cy + ry + 16, .78, baseDelay + 400);
    return `<svg class="portrait-flowers" viewBox="-18 -24 356 448" aria-hidden="true">${out}</svg>`;
  }

  return {
    DEFS, lotus, flower, leaf, staticLotusGlyph, doveMarkup, flyDove,
    cloudCanvas, startPetals, portraitFlowers, seeded, bakeLights,
  };
})();

export default Art;
