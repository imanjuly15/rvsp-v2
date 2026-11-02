/*
 * RSVP business rules. No React, no fetch: it calls only the api layer.
 * Every "which screen now?" decision and the one error-to-screen mapping live here.
 */
import * as rsvpApi from '../api/rsvpApi.js';
import { ApiError } from '../api/errors.js';
import { API_MESSAGE, ATTENDING, LIMITS, MODE, PHONE_PATTERN, VIEW } from '../constants/rsvp.constants.js';
import { STRINGS } from '../strings/rsvp.strings.js';
import { clamp, countDigits, isSafeHttpsUrl } from '../utils/rsvp.utils.js';

/**
 * Everything the card needs to know about this visitor's invitation.
 * @typedef {Object} Invitation
 * @property {'personal'|'shared'} mode
 * @property {string|null} id
 * @property {{ name: string, pax: number }|null} guest  personal links only
 * @property {number} maxPax
 * @property {boolean} open
 * @property {string} deadline  "YYYY-MM-DD" or ""
 * @property {import('../api/rsvpApi.js').RepliedData|null} replied
 * @property {string} contactUrl  "" when the Sheet has none
 */

/**
 * What the guest has typed. attending is null until they choose.
 * @typedef {Object} FormValues
 * @property {'yes'|'no'|null} attending
 * @property {string} name
 * @property {string} phone
 * @property {number} pax
 * @property {string} note
 * @property {string} website  honeypot
 */

/** @typedef {{ attending?: string, name?: string, phone?: string }} FormErrors */

/**
 * @typedef {Object} SubmitOutcome
 * @property {import('../constants/rsvp.constants.js').ViewName} view
 * @property {import('../api/rsvpApi.js').RepliedData} [replied]  on success
 * @property {string} [message]  form error text when view is FORM
 * @property {boolean} [canRetry] true when the failure was the connection, so the button offers "Try again"
 */

export const getMode = (id) => (id ? MODE.PERSONAL : MODE.SHARED);

/** @returns {Invitation} an empty invitation, used while loading. */
export function emptyInvitation(id) {
  return { mode: getMode(id), id, guest: null, maxPax: LIMITS.PAX_MIN, open: false, deadline: '', replied: null, contactUrl: '' };
}

/** Screen to show once the invitation is loaded. */
export function decideView({ replied, open }) {
  if (replied) return VIEW.REPLIED;
  return open ? VIEW.FORM : VIEW.CLOSED;
}

/** A reply can be changed only on a personal link, while RSVP is open. */
export const canChangeReply = (invitation) => invitation.mode === MODE.PERSONAL && invitation.open;

const safeContact = (url) => (isSafeHttpsUrl(url) ? url : '');

/**
 * Loads the invitation for this visit and picks the first screen.
 * @param {string|null} id  personal guest ID, or null for a shared link
 * @param {{ onBusy?: () => void, api?: typeof rsvpApi }} [options]  api is replaceable for tests
 * @returns {Promise<{ view: import('../constants/rsvp.constants.js').ViewName, invitation: Invitation }>} never throws
 */
export async function loadInvitation(id, { onBusy, api = rsvpApi } = {}) {
  const invitation = emptyInvitation(id);
  try {
    if (invitation.mode === MODE.PERSONAL) {
      const g = await api.getGuest(id, { onBusy });
      Object.assign(invitation, {
        guest: { name: g.name, pax: g.pax },
        maxPax: g.pax,
        open: g.open === true,
        deadline: g.deadline || '',
        replied: g.replied || null,
        contactUrl: safeContact(g.contactUrl),
      });
    } else {
      const c = await api.getConfig({ onBusy });
      Object.assign(invitation, {
        maxPax: c.sharedMaxPax,
        open: c.open === true,
        deadline: c.deadline || '',
        contactUrl: safeContact(c.contactUrl),
      });
    }
    return { view: decideView(invitation), invitation };
  } catch (err) {
    const view = mapError(err).view === VIEW.INVALID ? VIEW.INVALID : VIEW.LOAD_ERROR;
    if (view === VIEW.INVALID) invitation.contactUrl = await fetchContactUrl(api);
    return { view, invitation };
  }
}

/** Best effort: the contact link for the invalid-link screen, which has no guest data. */
async function fetchContactUrl(api) {
  try {
    return safeContact((await api.getConfig()).contactUrl);
  } catch {
    return '';
  }
}

/**
 * Client-side checks. A convenience only: the server checks everything again.
 * @param {FormValues} values
 * @param {'personal'|'shared'} mode
 * @returns {FormErrors} empty object when valid
 */
export function validateForm(values, mode) {
  const errors = {};
  if (values.attending !== ATTENDING.YES && values.attending !== ATTENDING.NO) errors.attending = STRINGS.needChoice;
  if (mode === MODE.SHARED) {
    if (!values.name.trim()) errors.name = STRINGS.needName;
    const phone = values.phone.trim();
    const digits = countDigits(phone);
    if (phone && (!PHONE_PATTERN.test(phone) || digits < LIMITS.PHONE_MIN_DIGITS || digits > LIMITS.PHONE_MAX_DIGITS)) errors.phone = STRINGS.badPhone;
  }
  return errors;
}

/**
 * The POST body. Personal links send no name or phone: the server uses the Sheet's.
 * @param {FormValues} values
 * @param {Invitation} invitation
 * @returns {import('../api/rsvpApi.js').RsvpPayload}
 */
export function buildPayload(values, invitation) {
  const yes = values.attending === ATTENDING.YES;
  const payload = {
    id: invitation.mode === MODE.PERSONAL ? invitation.id : null,
    attending: values.attending,
    pax: yes ? clamp(values.pax, LIMITS.PAX_MIN, invitation.maxPax) : 0,
    note: values.note.trim(),
    website: values.website,
  };
  if (invitation.mode === MODE.SHARED) {
    payload.name = values.name.trim();
    payload.phone = values.phone.trim();
  }
  return payload;
}

/**
 * The single mapping from an error to what the guest sees.
 * @param {unknown} err
 * @returns {{ view: import('../constants/rsvp.constants.js').ViewName, message?: string, canRetry?: boolean }}
 */
export function mapError(err) {
  if (err instanceof ApiError) {
    if (err.message === API_MESSAGE.CLOSED) return { view: VIEW.CLOSED };
    if (err.message === API_MESSAGE.NOT_FOUND) return { view: VIEW.INVALID };
    // Any other server message is a validation message: show it as-is in the form.
    return { view: VIEW.FORM, message: err.message || STRINGS.networkError };
  }
  return { view: VIEW.FORM, message: STRINGS.networkError, canRetry: true };
}

/**
 * Sends the reply.
 * @param {FormValues} values  already validated with validateForm
 * @param {Invitation} invitation
 * @param {{ onBusy?: () => void, api?: typeof rsvpApi }} [options]
 * @returns {Promise<SubmitOutcome>} never throws
 */
export async function submitReply(values, invitation, { onBusy, api = rsvpApi } = {}) {
  try {
    const result = await api.submitRsvp(buildPayload(values, invitation), { onBusy });
    return { view: VIEW.THANKS, replied: { attending: result.attending, pax: result.pax } };
  } catch (err) {
    return mapError(err);
  }
}

/**
 * Form values to start from: blank, or pre-filled from an earlier reply ("Change my reply").
 * @param {Invitation} invitation
 * @returns {Pick<FormValues, 'attending'|'pax'>}
 */
export function initialChoice(invitation) {
  const r = invitation.replied;
  if (!r) return { attending: null, pax: LIMITS.PAX_MIN };
  return { attending: r.attending, pax: clamp(r.pax || LIMITS.PAX_MIN, LIMITS.PAX_MIN, Math.max(invitation.maxPax, LIMITS.PAX_MIN)) };
}
