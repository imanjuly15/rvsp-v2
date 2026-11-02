# Memorial RSVP

React front-end for the memorial ceremony of Dr Jayaraman a/l Munusamy, built with Vite. There is no server or database.

## Run it

```bash
npm install
npm run dev
```

The site opens at http://localhost:3000/.

## Build for hosting

```bash
npm run build
```

Upload the `dist` folder to any static host, such as Netlify, Cloudflare Pages or GitHub Pages. To check the build locally, run `npm run preview`. Opening `dist/index.html` by double-clicking will not work, because browsers block this kind of script on local files.

## Where things are

| Path | What it holds |
| --- | --- |
| `src/event.js` | Ceremony date, time, venue and attire. This is the file to edit. |
| `src/components/` | React components: page sections, countdown, bottom bar |
| `src/features/rsvp/` | The RSVP form and everything around it |
| `apps-script/`, `docs/` | The Google Sheet script and the host guide (not part of the site) |
| `src/lib/` | Canvas and SVG drawing, the opening animation, the scrolling sky, the mantra player |
| `public/assets/` | Portrait and mantra audio |

## RSVP answers

Answers are saved to a Google Sheet through a Google Apps Script web app. Personal links (`?id=ABCD2345`) greet the guest by name; the plain address is a shared link.

- Settings: copy `.env.example` to `.env`. `VITE_RSVP_USE_MOCK=true` runs on demo data (`?id=demo1`, `?id=demo2`); for the live Sheet set it to `false` and fill `VITE_RSVP_SCRIPT_URL`.
- How the code is organised: [`src/features/rsvp/README.md`](src/features/rsvp/README.md)
- Setting up the Sheet, deploying the script, sending links: [`docs/rsvp-host-guide.md`](docs/rsvp-host-guide.md)
- The script itself: `apps-script/Code.gs` (pasted into the Sheet, never shipped with the site)
- Tests: `npm test`

## Opening sound

The opening plays `public/assets/moksha-mantras.mp3` after a guest touches the lamp, and the Mantra button plays or pauses it. Browsers block sound until a guest touches the page, so a lamp that lights by itself stays silent. Replace that file to change the music.
