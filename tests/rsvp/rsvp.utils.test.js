import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  clamp, countDigits, fillTemplate, formatDeadline, isSafeHttpsUrl, leadText, peopleText, readIdFromSearch, repliedMessage, thanksMessage, todayInMalaysia,
} from '../../src/features/rsvp/utils/rsvp.utils.js';

test('readIdFromSearch: personal id, trimmed; shared link -> null', () => {
  assert.equal(readIdFromSearch('?id=GY5CZGFD'), 'GY5CZGFD');
  assert.equal(readIdFromSearch('?x=1&id=%20abc%20'), 'abc');
  assert.equal(readIdFromSearch(''), null);
  assert.equal(readIdFromSearch('?id='), null);
  assert.equal(readIdFromSearch('?id=%20%20'), null);
});

test('fillTemplate fills known keys and leaves unknown ones', () => {
  assert.equal(fillTemplate('Dear {name}, {x}', { name: "Dato' Ashok" }), "Dear Dato' Ashok, {x}");
  assert.equal(fillTemplate('{n} left', { n: 0 }), '0 left');
});

test('peopleText singular and plural', () => {
  assert.equal(peopleText(1), '1 person');
  assert.equal(peopleText(3), '3 people');
});

test('formatDeadline and leadText', () => {
  assert.equal(formatDeadline('2026-11-06'), '6 November 2026');
  assert.equal(formatDeadline(''), '');
  assert.equal(formatDeadline('garbage'), '');
  assert.match(leadText(true, '2026-11-06'), /able to join us.*Kindly respond by 6 November 2026\.$/);
  assert.doesNotMatch(leadText(true, ''), /Kindly respond/);
  assert.match(leadText(false, ''), /keep you informed/);
});

test('thanksMessage and repliedMessage', () => {
  assert.match(thanksMessage({ attending: 'yes', pax: 2 }, 'Akmal'), /^Akmal, we have noted 2 people attending/);
  assert.match(thanksMessage({ attending: 'no', pax: 0 }, 'Akmal'), /^Akmal, thank you for letting us know/);
  assert.equal(repliedMessage({ attending: 'yes', pax: 1 }), 'You replied: Yes, 1 person');
  assert.equal(repliedMessage({ attending: 'no', pax: 0 }), 'You replied: Unable to attend');
});

test('countDigits and clamp', () => {
  assert.equal(countDigits('+60 12-345 6789'), 11);
  assert.equal(clamp(5, 1, 3), 3);
  assert.equal(clamp(0, 1, 3), 1);
});

test('isSafeHttpsUrl accepts only plain https links', () => {
  assert.equal(isSafeHttpsUrl('https://wa.link/abc123'), true);
  for (const bad of ['javascript:alert(1)', 'http://wa.link/x', 'https://x.com/a b', 'https://x.com/"><b>', '', null, undefined, 42]) {
    assert.equal(isSafeHttpsUrl(bad), false, String(bad));
  }
});

test('todayInMalaysia uses Malaysia time', () => {
  // 2026-11-02 17:00 UTC is already 3 November in Kuala Lumpur (UTC+8).
  assert.equal(todayInMalaysia(new Date('2026-11-02T17:00:00Z')), '2026-11-03');
});
