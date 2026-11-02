import { STRINGS } from '../strings/rsvp.strings.js';

// Off-screen rather than display:none, because some bots skip fields that are display:none.
// Inline on purpose: the design has no off-screen class and this element is never seen.
const OFF_SCREEN = { position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' };

/** Spam trap. People never see or reach it; a bot that fills it gets a fake "saved". */
export default function Honeypot({ value, onChange }) {
  return (
    <div style={OFF_SCREEN} aria-hidden="true">
      <label htmlFor="website">{STRINGS.honeypotLabel}</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
