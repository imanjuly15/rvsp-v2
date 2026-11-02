import { useEffect } from 'react';
import Closing from './components/Closing.jsx';
import Details from './components/Details.jsx';
import Dock from './components/Dock.jsx';
import Ending from './components/Ending.jsx';
import Hero from './components/Hero.jsx';
import RsvpForm from './components/RsvpForm.jsx';
import SoundButton from './components/SoundButton.jsx';
import Tribute from './components/Tribute.jsx';
import Art from './lib/art.js';
import { startExperience } from './lib/experience.js';

/* A drifting cloud between sections. Its picture is painted by lib/heaven.js. */
function Bank({ seed }) {
  return <div className="bank" data-seed={seed} aria-hidden="true" />;
}

export default function App() {
  useEffect(startExperience, []);
//test
  return (
    <>
      <svg id="art-defs" width="0" height="0" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: Art.DEFS }} />
      <div id="sky" aria-hidden="true" />
      <div id="gate-root" />

      <main id="page">
        <div id="vines" aria-hidden="true" />
        <Hero />
        <Bank seed={201} />
        <Tribute />
        <Bank seed={233} />
        <Details />
        <Bank seed={257} />
        <RsvpForm />
        <Bank seed={281} />
        <Closing />
        <Ending />
      </main>

      <Dock />
      <SoundButton />
    </>
  );
}
