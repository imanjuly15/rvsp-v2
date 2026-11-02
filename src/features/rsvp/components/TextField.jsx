import { STRINGS } from '../strings/rsvp.strings.js';

/** A labelled one-line input with optional hint and error, in the design's .field markup. */
export default function TextField({ id, label, optional, hint, error, value, onChange, inputRef, ...inputProps }) {
  const describedBy = [hint && `hint-${id}`, error && `err-${id}`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {optional && <> <span className="opt">{STRINGS.optional}</span></>}
      </label>
      <input
        ref={inputRef}
        id={id}
        value={value}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        {...inputProps}
      />
      {hint && <p className="hint" id={`hint-${id}`}>{hint}</p>}
      {error && <p className="err" id={`err-${id}`} role="alert">{error}</p>}
    </div>
  );
}
