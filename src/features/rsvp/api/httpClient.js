/*
 * The only file that calls fetch. It knows the wire format, not the RSVP rules:
 * every response is HTTP 200 JSON { status: boolean, message: string, data?: object }.
 */
import { API_MESSAGE, BUSY_RETRY_MS } from '../constants/rsvp.constants.js';
import { ApiError, NetworkError } from './errors.js';

/**
 * @typedef {Object} Envelope
 * @property {boolean} status
 * @property {string} message
 * @property {Object} [data]
 */

/**
 * @typedef {Object} RequestOptions
 * @property {() => void} [onBusy]  Called once when the server says "Busy" and a retry is about to happen.
 * @property {number} [retryDelayMs] Wait before that retry. Tests pass 0.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function readEnvelope(response) {
  try {
    return await response.json();
  } catch {
    throw new NetworkError('Response was not JSON');
  }
}

/**
 * GET with a cache-busting _t parameter and cache "no-store" (WhatsApp's in-app browser caches hard).
 * @returns {Promise<Envelope>} @throws {NetworkError}
 */
export async function fetchGet(baseUrl, params) {
  const query = new URLSearchParams({ ...params, _t: String(Date.now()) });
  let response;
  try {
    response = await fetch(`${baseUrl}?${query}`, { cache: 'no-store' });
  } catch {
    throw new NetworkError('GET failed');
  }
  return readEnvelope(response);
}

/**
 * POST a JSON string as text/plain. That keeps it a "simple" request, so the browser sends no CORS
 * preflight, which Apps Script cannot answer. Do not change it to application/json.
 * @returns {Promise<Envelope>} @throws {NetworkError}
 */
export async function fetchPost(baseUrl, body) {
  let response;
  try {
    response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new NetworkError('POST failed');
  }
  return readEnvelope(response);
}

/**
 * Runs `call` (anything that resolves to an Envelope). On "Busy, please try again" it calls onBusy, waits,
 * and tries exactly once more; a second Busy becomes a NetworkError.
 * @param {() => Promise<Envelope>} call
 * @param {RequestOptions} [options]
 * @returns {Promise<Object>} the envelope's data
 * @throws {ApiError} status false (message is the server's text)  @throws {NetworkError}
 */
export async function withBusyRetry(call, { onBusy, retryDelayMs = BUSY_RETRY_MS } = {}) {
  const attempt = async () => {
    try {
      return await call();
    } catch (err) {
      throw err instanceof NetworkError ? err : new NetworkError(err && err.message);
    }
  };

  let envelope = await attempt();
  if (envelope && envelope.message === API_MESSAGE.BUSY) {
    if (onBusy) onBusy();
    await sleep(retryDelayMs);
    envelope = await attempt();
    if (envelope && envelope.message === API_MESSAGE.BUSY) throw new NetworkError('Still busy after retry');
  }
  if (!envelope || typeof envelope.status !== 'boolean') throw new NetworkError('Unexpected response');
  if (!envelope.status) throw new ApiError(String(envelope.message || ''));
  return envelope.data || {};
}
