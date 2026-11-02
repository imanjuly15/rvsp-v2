import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { ApiError, NetworkError } from '../../src/features/rsvp/api/errors.js';
import { fetchGet, fetchPost, withBusyRetry } from '../../src/features/rsvp/api/httpClient.js';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

const BUSY = { status: false, message: 'Busy, please try again' };
const jsonResponse = (body) => ({ json: async () => body });

/** Replaces fetch; records every call and answers with the next queued item (Error = reject). */
function stubFetch(...answers) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    const next = answers.length > 1 ? answers.shift() : answers[0];
    if (next instanceof Error) throw next;
    return next;
  };
  return calls;
}

test('GET adds _t and uses cache no-store', async () => {
  const calls = stubFetch(jsonResponse({ status: true, message: 'OK', data: {} }));
  await fetchGet('https://example.test/exec', { action: 'guest', id: 'AB CD' });
  const url = new URL(calls[0].url);
  assert.equal(url.searchParams.get('action'), 'guest');
  assert.equal(url.searchParams.get('id'), 'AB CD');
  assert.match(url.searchParams.get('_t'), /^\d+$/);
  assert.equal(calls[0].init.cache, 'no-store');
});

test('POST sends a JSON string as text/plain (no CORS preflight)', async () => {
  const calls = stubFetch(jsonResponse({ status: true, message: 'RSVP saved', data: {} }));
  await fetchPost('https://example.test/exec', { action: 'rsvp', note: '<b>' });
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers['Content-Type'], 'text/plain;charset=utf-8');
  assert.deepEqual(JSON.parse(calls[0].init.body), { action: 'rsvp', note: '<b>' });
});

test('fetch rejection and non-JSON both become NetworkError', async () => {
  stubFetch(new TypeError('Failed to fetch'));
  await assert.rejects(fetchGet('https://e.test', {}), NetworkError);
  stubFetch({ json: async () => { throw new SyntaxError('bad'); } });
  await assert.rejects(fetchPost('https://e.test', {}), NetworkError);
});

test('withBusyRetry: success returns data', async () => {
  assert.deepEqual(await withBusyRetry(async () => ({ status: true, message: 'OK', data: { pax: 2 } })), { pax: 2 });
});

test('withBusyRetry: Busy once -> onBusy called, one retry, then data', async () => {
  const answers = [BUSY, { status: true, message: 'OK', data: { ok: 1 } }];
  let calls = 0;
  let busyNotices = 0;
  const data = await withBusyRetry(async () => { calls += 1; return answers.shift(); }, { onBusy: () => { busyNotices += 1; }, retryDelayMs: 0 });
  assert.deepEqual(data, { ok: 1 });
  assert.equal(calls, 2);
  assert.equal(busyNotices, 1);
});

test('withBusyRetry: Busy twice -> NetworkError after exactly one retry', async () => {
  let calls = 0;
  await assert.rejects(withBusyRetry(async () => { calls += 1; return BUSY; }, { retryDelayMs: 0 }), NetworkError);
  assert.equal(calls, 2);
});

test('withBusyRetry: retry waits about the given delay', async () => {
  const answers = [BUSY, { status: true, message: 'OK', data: {} }];
  const started = Date.now();
  await withBusyRetry(async () => answers.shift(), { retryDelayMs: 60 });
  assert.ok(Date.now() - started >= 55);
});

test('withBusyRetry: status false -> ApiError with the exact message; no retry', async () => {
  let calls = 0;
  await assert.rejects(
    withBusyRetry(async () => { calls += 1; return { status: false, message: 'RSVP is closed' }; }, { retryDelayMs: 0 }),
    (err) => err instanceof ApiError && err.message === 'RSVP is closed',
  );
  assert.equal(calls, 1);
});

test('withBusyRetry: garbage envelope and thrown errors -> NetworkError', async () => {
  await assert.rejects(withBusyRetry(async () => 'nope'), NetworkError);
  await assert.rejects(withBusyRetry(async () => { throw new TypeError('x'); }), NetworkError);
});
