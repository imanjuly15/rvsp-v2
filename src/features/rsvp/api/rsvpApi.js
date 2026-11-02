/* Thin endpoint functions. Picks the offline mock or the live script from config. No RSVP rules here. */
import { RSVP_CONFIG } from '../config/rsvp.config.js';
import { ACTION } from '../constants/rsvp.constants.js';
import { NetworkError } from './errors.js';
import { fetchGet, fetchPost, withBusyRetry } from './httpClient.js';

/**
 * @typedef {Object} RepliedData
 * @property {'yes'|'no'} attending
 * @property {number} pax
 */
/**
 * @typedef {Object} GuestData  GET ?action=guest
 * @property {string} name
 * @property {number} pax
 * @property {RepliedData|null} replied
 * @property {string} deadline  "YYYY-MM-DD" or ""
 * @property {boolean} open
 * @property {string} [contactUrl]
 */
/**
 * @typedef {Object} ConfigData  GET ?action=config
 * @property {string} deadline
 * @property {boolean} open
 * @property {number} sharedMaxPax
 * @property {string} [contactUrl]
 */
/**
 * @typedef {Object} RsvpPayload  POST body, without `action`
 * @property {string|null} id
 * @property {string} [name]   shared links only
 * @property {string} [phone]  shared links only, optional
 * @property {'yes'|'no'} attending
 * @property {number} pax
 * @property {string} note
 * @property {string} website  honeypot, always sent
 */

const live = {
  get(params) {
    if (!RSVP_CONFIG.scriptUrl) return Promise.reject(new NetworkError('VITE_RSVP_SCRIPT_URL is not set'));
    return fetchGet(RSVP_CONFIG.scriptUrl, params);
  },
  post(body) {
    if (!RSVP_CONFIG.scriptUrl) return Promise.reject(new NetworkError('VITE_RSVP_SCRIPT_URL is not set'));
    return fetchPost(RSVP_CONFIG.scriptUrl, body);
  },
};

// The mock is loaded only when switched on, so a live build never downloads it.
const backend = async () => (RSVP_CONFIG.useMock ? (await import('../mocks/rsvpMock.js')).rsvpMock : live);

/**
 * Looks up one personal invitation. Also stamps first_opened in the Sheet (expected).
 * @param {string} id
 * @param {import('./httpClient.js').RequestOptions} [options]
 * @returns {Promise<GuestData>} @throws {ApiError} "Invitation not found" etc.  @throws {NetworkError}
 */
export function getGuest(id, options) {
  return withBusyRetry(async () => (await backend()).get({ action: ACTION.GUEST, id }), options);
}

/**
 * Settings for shared links (and the contact link for an invalid personal link).
 * @param {import('./httpClient.js').RequestOptions} [options]
 * @returns {Promise<ConfigData>} @throws {ApiError}  @throws {NetworkError}
 */
export function getConfig(options) {
  return withBusyRetry(async () => (await backend()).get({ action: ACTION.CONFIG }), options);
}

/**
 * Saves (or, for a personal link, updates) a reply.
 * @param {RsvpPayload} payload
 * @param {import('./httpClient.js').RequestOptions} [options]
 * @returns {Promise<RepliedData>} @throws {ApiError} "RSVP is closed", "Invitation not found", validation text  @throws {NetworkError}
 */
export function submitRsvp(payload, options) {
  return withBusyRetry(async () => (await backend()).post({ action: ACTION.RSVP, ...payload }), options);
}
