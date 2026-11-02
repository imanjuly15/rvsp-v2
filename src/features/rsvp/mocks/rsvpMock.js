/*
 * Offline stand-in for the Apps Script web app, used when VITE_RSVP_USE_MOCK=true.
 * Same envelopes and rules as apps-script/Code.gs. Replies survive a reload (sessionStorage) so
 * "reply, reload, see already replied" can be tried.
 *
 * Demo links:  ?id=demo1 (Dato' Ashok, 2 people)   ?id=demo2 (already replied yes, 3 people)
 * Failure drills (mock only), add &mock=... :
 *   busy          every request is answered "Busy" once, then succeeds (shows the retry notice)
 *   busy-always   every request stays "Busy" (becomes the network error)
 *   offline       every request fails like a dropped connection
 *   offline-post  only submitting fails
 *   closed        RSVP is closed
 */
import { RSVP_CONFIG } from '../config/rsvp.config.js';
import { API_MESSAGE, ATTENDING, LIMITS, PHONE_PATTERN } from '../constants/rsvp.constants.js';
import { countDigits, todayInMalaysia } from '../utils/rsvp.utils.js';

const STORAGE_KEY = 'rsvp-mock-replies';
const GUESTS = {
  DEMO1: { name: "Dato' Ashok", pax: 2 },
  DEMO2: { name: 'Puan Lina', pax: 3 },
};
const SEED_REPLIES = { DEMO2: { attending: ATTENDING.YES, pax: 3 } };

let calls = 0;

const ok = (message, data) => ({ status: true, message, data });
const fail = (message) => ({ status: false, message });

function scenario() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('mock') || '';
}

function loadReplies() {
  try {
    return { ...SEED_REPLIES, ...JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return { ...SEED_REPLIES };
  }
}

function saveReply(id, reply) {
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    stored[id] = reply;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage blocked (private window): the reply simply does not survive a reload.
  }
}

const normaliseId = (id) => String(id || '').trim().toUpperCase();
const isOpen = () => scenario() !== 'closed' && todayInMalaysia() <= RSVP_CONFIG.mock.deadline;

function later(result, isPost) {
  const drill = scenario();
  calls += 1;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (drill === 'offline' || (drill === 'offline-post' && isPost)) reject(new TypeError('Failed to fetch'));
      else if (drill === 'busy-always' || (drill === 'busy' && calls % 2 === 1)) resolve(fail(API_MESSAGE.BUSY));
      else resolve(result());
    }, RSVP_CONFIG.mock.delayMs);
  });
}

function handleGet(params) {
  const { deadline, sharedMaxPax, contactUrl } = RSVP_CONFIG.mock;
  if (params.action === 'config') return ok('OK', { deadline, open: isOpen(), sharedMaxPax, contactUrl });
  const id = normaliseId(params.id);
  const guest = GUESTS[id];
  if (!guest) return fail(API_MESSAGE.NOT_FOUND);
  return ok('OK', { name: guest.name, pax: guest.pax, replied: loadReplies()[id] || null, deadline, open: isOpen(), contactUrl });
}

function handlePost(body) {
  if (!isOpen()) return fail(API_MESSAGE.CLOSED);
  if (body.website) return ok('RSVP saved', { attending: body.attending === ATTENDING.YES ? ATTENDING.YES : ATTENDING.NO, pax: 1 });

  let id = null;
  let max = RSVP_CONFIG.mock.sharedMaxPax;
  if (body.id) {
    id = normaliseId(body.id);
    if (!GUESTS[id]) return fail(API_MESSAGE.NOT_FOUND);
    max = GUESTS[id].pax;
  } else {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > LIMITS.NAME_MAX) return fail('Please enter your name');
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const digits = countDigits(phone);
    if (phone && (phone.length > LIMITS.PHONE_MAX || !PHONE_PATTERN.test(phone) || digits < LIMITS.PHONE_MIN_DIGITS || digits > LIMITS.PHONE_MAX_DIGITS)) {
      return fail('Please enter a valid phone number');
    }
  }
  if (body.attending !== ATTENDING.YES && body.attending !== ATTENDING.NO) return fail('Please choose yes or no');
  let pax = 0;
  if (body.attending === ATTENDING.YES) {
    if (!Number.isInteger(body.pax) || body.pax < LIMITS.PAX_MIN || body.pax > max) return fail(`Number of guests must be between 1 and ${max}`);
    pax = body.pax;
  }
  if (typeof body.note === 'string' && body.note.trim().length > LIMITS.NOTE_MAX) return fail(`Note must be at most ${LIMITS.NOTE_MAX} characters`);
  if (id) saveReply(id, { attending: body.attending, pax });
  return ok('RSVP saved', { attending: body.attending, pax });
}

export const rsvpMock = {
  get: (params) => later(() => handleGet(params), false),
  post: (body) => later(() => handlePost(body), true),
};
