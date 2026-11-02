import { useRef, useState } from 'react';
import { VIEW } from '../constants/rsvp.constants.js';
import { initialChoice, submitReply, validateForm } from '../services/rsvp.service.js';

const FOCUS_ORDER = ['attending', 'name', 'phone'];

/**
 * The form's values, errors and sending state. Values survive a failed send so nothing is retyped.
 * @param {import('../services/rsvp.service.js').Invitation} invitation
 * @param {(outcome: import('../services/rsvp.service.js').SubmitOutcome) => void} onOutcome  any result that leaves the form
 */
export function useRsvpForm(invitation, onOutcome) {
  const [values, setValues] = useState(() => ({ ...initialChoice(invitation), name: '', phone: '', note: '', website: '' }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [canRetry, setCanRetry] = useState(false);
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  // A ref, not state: it blocks a second click before React has re-rendered the disabled button.
  const sendingNow = useRef(false);
  const refs = { attending: useRef(null), name: useRef(null), phone: useRef(null) };

  function setField(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  /** "Change my reply": start from the saved answer. */
  function prefill() {
    setValues((v) => ({ ...v, ...initialChoice(invitation) }));
    setErrors({});
    setFormError('');
    setCanRetry(false);
  }

  async function submit(e) {
    e.preventDefault();
    if (sendingNow.current) return;
    const found = validateForm(values, invitation.mode);
    setErrors(found);
    setFormError('');
    setCanRetry(false);
    const first = FOCUS_ORDER.find((k) => found[k]);
    if (first) {
      if (refs[first].current) refs[first].current.focus();
      return;
    }

    sendingNow.current = true;
    setSending(true);
    const outcome = await submitReply(values, invitation, { onBusy: () => setBusy(true) });
    sendingNow.current = false;
    setSending(false);
    setBusy(false);
    if (outcome.view === VIEW.FORM) {
      setFormError(outcome.message);
      setCanRetry(Boolean(outcome.canRetry));
      return;
    }
    onOutcome(outcome);
  }

  return { values, errors, formError, canRetry, sending, busy, refs, setField, prefill, submit };
}
