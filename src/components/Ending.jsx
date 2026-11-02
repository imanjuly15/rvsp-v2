import { useEffect, useRef, useState } from 'react';

const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The page ends where the opening did: dawn over the lake, with his portrait in the morning sky. */
export default function Ending() {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [seen, setSeen] = useState(calm);

  useEffect(() => {
    if (calm) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      setSeen(true);
      // If the browser refuses to play, the still poster and portrait remain.
      videoRef.current.play()?.catch(() => {});
    }, { threshold: .35 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`heaven-end${seen ? ' seen' : ''}`} id="heaven-end" aria-hidden="true">
      <video ref={videoRef} src="assets/lake.mp4" poster="assets/lake-poster.jpg" muted playsInline preload="none" />
      <div className="end-portrait">
        <div className="portrait-oval">
          <img src="assets/portrait.webp" alt="" width="432" height="1280" />
        </div>
      </div>
    </div>
  );
}
