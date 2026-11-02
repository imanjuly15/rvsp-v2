# RSVP feature

Personal guest links, the RSVP form, and every state around it. Replies are saved to a Google Sheet through a Google Apps Script web app.

- Backend script: [`apps-script/Code.gs`](../../../apps-script/Code.gs). The host pastes it into the Sheet's Apps Script editor. This repo does not run it.
- Backend tests: `node tests/apps-script.test.cjs`. They run the script against a mock Sheet.
- Host guide (Sheet setup, deploy, sending links): [`docs/rsvp-host-guide.md`](../../../docs/rsvp-host-guide.md)

## Layers

```
components/  ──▶  hooks/  ──▶  services/  ──▶  api/rsvpApi  ──▶  api/httpClient  ──▶  fetch
 (render)        (React        (rules, no      (endpoints,       (the ONLY fetch,
                  state)        React)          mock or live)     Busy retry)
                                                     └──▶ mocks/rsvpMock (when VITE_RSVP_USE_MOCK=true)

constants/  strings/  config/  utils/   ← any layer may import these; they import nothing from the layers above
```

Imports only point to the right. A component never calls the service or the api directly. A service never touches React or `fetch`.

| File | Job |
|---|---|
| `config/rsvp.config.js` | Script URL and mock switch (from env), plus the mock's fake Sheet values |
| `constants/rsvp.constants.js` | Exact API messages, view names, limits (name 120, note 300, phone 20) |
| `strings/rsvp.strings.js` | Every word on screen |
| `api/errors.js` | `NetworkError` (no usable answer) and `ApiError` (server said `status: false`) |
| `api/httpClient.js` | `fetch` with `_t` + `no-store` on GET, `text/plain` POST, one retry on "Busy" |
| `api/rsvpApi.js` | `getGuest(id)`, `getConfig()`, `submitRsvp(payload)`; picks mock or live |
| `mocks/rsvpMock.js` | Offline backend with the same rules. Loaded only when the mock is on |
| `services/rsvp.service.js` | Personal vs shared, which screen, validation, payload, **the one error-to-screen mapping** (`mapError`) |
| `hooks/useInvitation.js` | Loads the invitation once and owns the current screen |
| `hooks/useRsvpForm.js` | Form values, errors, sending, double-submit guard |
| `components/` | Rendering only. Markup and classes come from the original design |
| `utils/rsvp.utils.js` | Pure helpers: read `?id=`, fill `{templates}`, dates, people text, safe-link check |
| `index.js` | Public entry. The app imports `RsvpSection` from here |

## Screens (`VIEW` in constants)

`loading` (form disabled, "Loading your invitation…") → then one of:
`form` · `replied` (with "Change my response" while open) · `closed` · `invalid` (bad `?id=`) · `loadError` (with Try again).
After sending, the screen is `thanks`. A failed send stays on `form`, keeps everything typed, and changes the button to "Try again".

## Run it

```bash
cp .env.example .env          # VITE_RSVP_USE_MOCK=true for offline demo data
npm run dev                   # http://localhost:3000/?id=demo1  (or ?id=demo2, or no id for the shared link)
npm test                      # unit tests + Apps Script tests
```

Mock-only failure drills: add `&mock=busy`, `busy-always`, `offline`, `offline-post` or `closed` to the URL.

To go live, set `VITE_RSVP_USE_MOCK=false` and `VITE_RSVP_SCRIPT_URL=<web app URL>` (in `.env` or your host's build settings), then `npm run build`.

## How to change…

- **Event details (date, venue, attire):** `src/event.js`. The RSVP deadline, guest caps and contact link come from the Sheet's Config tab, not from code.
- **Wording:** `strings/rsvp.strings.js` only.
- **Script URL / mock:** environment variables, see `.env.example`. A rebuild is needed after changing them.
- **Where the guest's name appears:** `components/GuestGreeting.jsx` renders it. To show it elsewhere (for example the Hero), call `useInvitation()` once in `App.jsx`, pass the result to `<RsvpCard invitation={...} />` in place of `<RsvpSection />`, and pass the same object to wherever the name goes. The data is `invitation.guest.name` and `invitation.guest.pax`. It is `null` on shared links. Don't call `useInvitation()` twice: that asks the Sheet twice.
- **Add a form field:** add it to `Code.gs` (validate + write a column, with a test in `tests/apps-script.test.cjs`). Then add it to `FormValues` and `validateForm`/`buildPayload` in the service, the initial value in `useRsvpForm`, a limit in constants, wording in strings, and render it in `RsvpFormView.jsx` (reuse `TextField`).
- **Add an API call:** add the action to `ACTION`, a function in `api/rsvpApi.js` that uses `withBusyRetry`, the same action in the mock, then call it from the service.

## Rules worth keeping

- Never use `application/json` for the POST: it triggers a CORS preflight that Apps Script cannot answer.
- Personal links never send a name or phone. The server takes them from the Sheet.
- User text reaches the page only through React (escaped). No `innerHTML` with data.
- The contact link from the Sheet becomes a link only if it starts with `https://`. Both the script and the service check this.
