import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiError, NetworkError } from '../../src/features/rsvp/api/errors.js';
import { VIEW } from '../../src/features/rsvp/constants/rsvp.constants.js';
import {
  buildPayload, canChangeReply, decideView, getMode, initialChoice, loadInvitation, mapError, submitReply, validateForm,
} from '../../src/features/rsvp/services/rsvp.service.js';
import { STRINGS } from '../../src/features/rsvp/strings/rsvp.strings.js';

const values = (over = {}) => ({ attending: 'yes', name: '', phone: '', pax: 2, note: '', website: '', ...over });
const personal = (over = {}) => ({ mode: 'personal', id: 'GY5CZGFD', guest: { name: 'G', pax: 2 }, maxPax: 2, open: true, deadline: '', replied: null, contactUrl: '', ...over });
const shared = (over = {}) => ({ mode: 'shared', id: null, guest: null, maxPax: 4, open: true, deadline: '', replied: null, contactUrl: '', ...over });

/** A fake api layer; each method returns the given value or throws it if it is an Error. */
function fakeApi({ guest, config, submit } = {}) {
  const calls = [];
  const answer = (v) => (v instanceof Error ? Promise.reject(v) : Promise.resolve(v));
  return {
    calls,
    getGuest: (id) => { calls.push(['getGuest', id]); return answer(guest); },
    getConfig: () => { calls.push(['getConfig']); return answer(config); },
    submitRsvp: (payload) => { calls.push(['submitRsvp', payload]); return answer(submit); },
  };
}

test('getMode: id means personal, none means shared', () => {
  assert.equal(getMode('ABC'), 'personal');
  assert.equal(getMode(null), 'shared');
});

test('decideView', () => {
  assert.equal(decideView({ replied: null, open: true }), VIEW.FORM);
  assert.equal(decideView({ replied: null, open: false }), VIEW.CLOSED);
  assert.equal(decideView({ replied: { attending: 'yes', pax: 1 }, open: false }), VIEW.REPLIED);
});

test('canChangeReply: personal and open only', () => {
  assert.equal(canChangeReply(personal()), true);
  assert.equal(canChangeReply(personal({ open: false })), false);
  assert.equal(canChangeReply(shared()), false);
});

test('loadInvitation personal: maps guest data and picks the form', async () => {
  const api = fakeApi({ guest: { name: "Dato' Ashok", pax: 2, replied: null, deadline: '2026-11-06', open: true, contactUrl: 'https://wa.link/x' } });
  const { view, invitation } = await loadInvitation('demo1', { api });
  assert.equal(view, VIEW.FORM);
  assert.deepEqual(invitation.guest, { name: "Dato' Ashok", pax: 2 });
  assert.equal(invitation.maxPax, 2);
  assert.equal(invitation.contactUrl, 'https://wa.link/x');
});

test('loadInvitation personal: already replied, and closed', async () => {
  let r = await loadInvitation('X', { api: fakeApi({ guest: { name: 'A', pax: 3, replied: { attending: 'yes', pax: 3 }, deadline: '', open: true } }) });
  assert.equal(r.view, VIEW.REPLIED);
  r = await loadInvitation('X', { api: fakeApi({ guest: { name: 'A', pax: 3, replied: null, deadline: '', open: false } }) });
  assert.equal(r.view, VIEW.CLOSED);
});

test('loadInvitation: unknown id -> invalid, contact link fetched from config', async () => {
  const api = fakeApi({ guest: new ApiError('Invitation not found'), config: { deadline: '', open: true, sharedMaxPax: 4, contactUrl: 'https://wa.link/h' } });
  const { view, invitation } = await loadInvitation('nope', { api });
  assert.equal(view, VIEW.INVALID);
  assert.equal(invitation.contactUrl, 'https://wa.link/h');
});

test('loadInvitation: unsafe contact link is dropped', async () => {
  const api = fakeApi({ config: { deadline: '', open: true, sharedMaxPax: 4, contactUrl: 'javascript:alert(1)' } });
  assert.equal((await loadInvitation(null, { api })).invitation.contactUrl, '');
});

test('loadInvitation: network failure -> load error (never throws)', async () => {
  assert.equal((await loadInvitation('X', { api: fakeApi({ guest: new NetworkError() }) })).view, VIEW.LOAD_ERROR);
  assert.equal((await loadInvitation(null, { api: fakeApi({ config: new NetworkError() }) })).view, VIEW.LOAD_ERROR);
});

test('loadInvitation shared: cap from sharedMaxPax', async () => {
  const { view, invitation } = await loadInvitation(null, { api: fakeApi({ config: { deadline: '2026-11-06', open: true, sharedMaxPax: 4 } }) });
  assert.equal(view, VIEW.FORM);
  assert.equal(invitation.mode, 'shared');
  assert.equal(invitation.maxPax, 4);
  assert.equal(invitation.guest, null);
});

test('validateForm: shared needs name and a choice; phone optional but checked', () => {
  const e = validateForm(values({ attending: null, name: '  ' }), 'shared');
  assert.equal(e.attending, STRINGS.needChoice);
  assert.equal(e.name, STRINGS.needName);
  assert.deepEqual(validateForm(values({ name: 'A' }), 'shared'), {});
  assert.deepEqual(validateForm(values({ name: 'A', phone: '012 345 6789' }), 'shared'), {});
  assert.equal(validateForm(values({ name: 'A', phone: '1234' }), 'shared').phone, STRINGS.badPhone);
  assert.equal(validateForm(values({ name: 'A', phone: 'call me' }), 'shared').phone, STRINGS.badPhone);
});

test('validateForm: personal never asks for name or phone', () => {
  assert.deepEqual(validateForm(values({ name: '', phone: 'x' }), 'personal'), {});
  assert.equal(validateForm(values({ attending: null }), 'personal').attending, STRINGS.needChoice);
});

test('buildPayload personal: no name or phone, id sent, pax capped', () => {
  const p = buildPayload(values({ name: 'Evil', phone: '0123456789', pax: 9, note: '  hi  ' }), personal());
  assert.deepEqual(p, { id: 'GY5CZGFD', attending: 'yes', pax: 2, note: 'hi', website: '' });
});

test('buildPayload shared: name and phone trimmed, id null, honeypot always sent', () => {
  const p = buildPayload(values({ name: '  =HYPERLINK("http://x")  ', phone: ' 0123456789 ', website: 'bot' }), shared());
  assert.deepEqual(p, { id: null, attending: 'yes', pax: 2, note: '', website: 'bot', name: '=HYPERLINK("http://x")', phone: '0123456789' });
});

test('buildPayload: no means pax 0', () => {
  assert.equal(buildPayload(values({ attending: 'no', pax: 3 }), personal()).pax, 0);
});

test('mapError: the one error-to-screen mapping', () => {
  assert.deepEqual(mapError(new ApiError('RSVP is closed')), { view: VIEW.CLOSED });
  assert.deepEqual(mapError(new ApiError('Invitation not found')), { view: VIEW.INVALID });
  assert.deepEqual(mapError(new ApiError('Number of guests must be between 1 and 2')), { view: VIEW.FORM, message: 'Number of guests must be between 1 and 2' });
  assert.deepEqual(mapError(new NetworkError()), { view: VIEW.FORM, message: STRINGS.networkError, canRetry: true });
  assert.deepEqual(mapError(new TypeError('x')), { view: VIEW.FORM, message: STRINGS.networkError, canRetry: true });
});

test('submitReply: success -> thanks with the server result', async () => {
  const api = fakeApi({ submit: { attending: 'yes', pax: 2 } });
  const out = await submitReply(values(), personal(), { api });
  assert.deepEqual(out, { view: VIEW.THANKS, replied: { attending: 'yes', pax: 2 } });
  assert.equal(api.calls.length, 1);
});

test('submitReply: failures map to screens and never throw', async () => {
  assert.equal((await submitReply(values(), personal(), { api: fakeApi({ submit: new ApiError('RSVP is closed') }) })).view, VIEW.CLOSED);
  assert.equal((await submitReply(values(), personal(), { api: fakeApi({ submit: new NetworkError() }) })).canRetry, true);
});

test('initialChoice: blank, or pre-filled and capped from an earlier reply', () => {
  assert.deepEqual(initialChoice(personal()), { attending: null, pax: 1 });
  assert.deepEqual(initialChoice(personal({ replied: { attending: 'yes', pax: 5 } })), { attending: 'yes', pax: 2 });
  assert.deepEqual(initialChoice(personal({ replied: { attending: 'no', pax: 0 } })), { attending: 'no', pax: 1 });
});
