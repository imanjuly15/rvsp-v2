import { ATTENDING, LIMITS, MODE } from '../constants/rsvp.constants.js';
import { STRINGS } from '../strings/rsvp.strings.js';
import AttendanceChoice from './AttendanceChoice.jsx';
import Honeypot from './Honeypot.jsx';
import NoteField from './NoteField.jsx';
import PaxStepper from './PaxStepper.jsx';
import TextField from './TextField.jsx';

function submitLabel(form) {
  if (form.sending) return STRINGS.sending;
  if (form.canRetry) return STRINGS.tryAgain;
  if (form.values.attending === ATTENDING.YES) return STRINGS.submitYes;
  if (form.values.attending === ATTENDING.NO) return STRINGS.submitNo;
  return STRINGS.submit;
}

/**
 * The RSVP form. Shared links also ask for name and phone; personal links take both from the Sheet.
 * @param {{ form: ReturnType<import('../hooks/useRsvpForm.js').useRsvpForm>, invitation: import('../services/rsvp.service.js').Invitation, disabled: boolean }} props
 */
export default function RsvpFormView({ ref, form, invitation, disabled }) {
  const { values, errors, refs, setField } = form;
  const shared = invitation.mode === MODE.SHARED;

  return (
    <form ref={ref} onSubmit={form.submit} noValidate aria-busy={disabled || form.sending || undefined}>
      <AttendanceChoice value={values.attending} onChange={(v) => setField('attending', v)} error={errors.attending} inputRef={refs.attending} disabled={disabled} />

      {shared && (
        <TextField
          id="name" label={STRINGS.nameLabel} type="text" autoComplete="name" maxLength={LIMITS.NAME_MAX} required
          value={values.name} onChange={(v) => setField('name', v)} error={errors.name} inputRef={refs.name} disabled={disabled}
        />
      )}
      {shared && (
        <TextField
          id="phone" label={STRINGS.phoneLabel} optional hint={STRINGS.phoneHint} type="tel" inputMode="tel" autoComplete="tel" maxLength={LIMITS.PHONE_MAX}
          value={values.phone} onChange={(v) => setField('phone', v)} error={errors.phone} inputRef={refs.phone} disabled={disabled}
        />
      )}

      <div className={`collapse${values.attending === ATTENDING.YES ? ' open' : ''}`}>
        <div className="collapse-inner">
          <PaxStepper value={values.pax} max={invitation.maxPax} onChange={(v) => setField('pax', v)} disabled={disabled} />
        </div>
      </div>

      <NoteField value={values.note} onChange={(v) => setField('note', v)} disabled={disabled} />
      <Honeypot value={values.website} onChange={(v) => setField('website', v)} />

      <button className="submit" type="submit" disabled={disabled || form.sending}>{submitLabel(form)}</button>
      {form.busy && <p className="hint form-err" role="status">{STRINGS.busy}</p>}
      {form.formError && <p className="err form-err" role="alert">{form.formError}</p>}
    </form>
  );
}
