/* Fixed values shared by every layer. Imports nothing. */

/** Exact `message` strings the Apps Script returns. They must match apps-script/Code.gs. */
export const API_MESSAGE = {
  CLOSED: 'RSVP is closed',
  NOT_FOUND: 'Invitation not found',
  BUSY: 'Busy, please try again',
};

export const ACTION = { GUEST: 'guest', CONFIG: 'config', RSVP: 'rsvp' };

export const ATTENDING = { YES: 'yes', NO: 'no' };

export const MODE = { PERSONAL: 'personal', SHARED: 'shared' };

/**
 * Which screen the RSVP card shows.
 * @typedef {'loading'|'form'|'replied'|'thanks'|'invalid'|'closed'|'loadError'} ViewName
 */
export const VIEW = {
  LOADING: 'loading',
  FORM: 'form',
  REPLIED: 'replied',
  THANKS: 'thanks',
  INVALID: 'invalid',
  CLOSED: 'closed',
  LOAD_ERROR: 'loadError',
};

/** Same limits as apps-script/Code.gs (MAX_NAME, MAX_NOTE, MAX_PHONE). The server is the authority. */
export const LIMITS = {
  NAME_MAX: 120,
  NOTE_MAX: 300,
  PHONE_MAX: 20,
  PHONE_MIN_DIGITS: 8,
  PHONE_MAX_DIGITS: 15,
  PAX_MIN: 1,
};

export const PHONE_PATTERN = /^[0-9+\-() ]+$/;

/** URL query parameter that carries a personal guest ID: ?id=ABCD2345 */
export const ID_PARAM = 'id';

/** Wait before the single retry after a "Busy" reply. */
export const BUSY_RETRY_MS = 1500;
