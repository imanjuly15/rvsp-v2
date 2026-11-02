/* Starts the imperative visuals once React has put the page on screen: the opening, sky, petals and doves. */
import Art from './art.js';
import Heaven from './heaven.js';
import Intro from './intro.js';

let begun = false;

export function startExperience() {
  if (begun) return;
  begun = true;

  const root = document.documentElement;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const playIntro = root.classList.contains('play-intro');
  const small = () => window.innerWidth < 700;

  Heaven.init(document.getElementById('sky'));

  let petals = null;
  let flyLayer = null;
  if (!calm) {
    const canvas = document.createElement('canvas');
    canvas.id = 'petals';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    petals = Art.startPetals(canvas, playIntro ? 0 : 10);
    flyLayer = document.createElement('div');
    flyLayer.className = 'fly-layer';
    flyLayer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(flyLayer);
  }

  function ambientDove() {
    if (document.hidden) return;
    const fromLeft = Math.random() < .5;
    const [a, b] = fromLeft ? ['-12vw', '112vw'] : ['112vw', '-12vw'];
    const y = 8 + Math.random() * 62;
    const s = .36 + Math.random() * .2;
    Art.flyDove(flyLayer, {
      duration: 13000 + Math.random() * 5000,
      flip: !fromLeft,
      flap: '.68s',
      path: [
        { x: a, y: `${y}vh`, s, at: 0 },
        { x: '50vw', y: `${y - 5}vh`, s, at: .5 },
        { x: b, y: `${y + 2}vh`, s, at: 1 },
      ],
    });
  }

  function startAmbient() {
    Heaven.start();
    if (calm) return;
    petals.setDensity(small() ? 12 : 22);
    setTimeout(ambientDove, 2000);
    setInterval(ambientDove, 15000);
  }

  if (playIntro) {
    // The portrait flies to its page position, so the page must be at the top underneath the opening.
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    Intro.play(document.getElementById('gate-root')).then(startAmbient);
  } else {
    startAmbient();
  }
}
