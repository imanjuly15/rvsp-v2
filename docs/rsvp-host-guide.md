# RSVP host guide

Guests open a link, read the details and reply. Replies land in a Google Sheet that you own. There is no server and no database to run.

There are two kinds of links:
- **Personal link** (family, VIPs): `https://your-site/?id=ABCD2345`. It greets the guest by name, limits how many people they can bring, and lets them change their reply until the deadline.
- **Shared link** (everyone else): `https://your-site/`. Guests type their own name and, if they like, a phone number. These replies are marked **unverified** so you can match them against your list. Guests can't change a shared-link reply themselves.

## What you need from this project

| File | What it is |
|---|---|
| `apps-script/Code.gs` | The script you paste into the Sheet. It saves replies. |
| `apps-script/appsscript.json` | Script settings (Malaysia time zone, public web app). |
| `.env.example` | The two settings the page needs: mock on/off and the script address. |

## 1. Create the Sheet and the script

1. Open **sheets.new** and name the Sheet after the event. Use a new Sheet for every event.
2. Go to **Extensions > Apps Script**. Delete what's there, paste in all of `apps-script/Code.gs`, and save.
3. Click the gear icon (**Project Settings**) and tick **Show "appsscript.json" manifest file**. Back in the editor, open `appsscript.json`, paste in the contents of `apps-script/appsscript.json`, and save.
4. Go back to the Sheet and reload it. A menu called **RSVP tools** appears.
5. Choose **RSVP tools > Set up tabs (first time)**. Approve Google's permission box. An "unverified app" warning is normal for your own script: click **Advanced > Go to … > Allow**. This creates three tabs: **Config**, **Guests** and **Responses**.

## 2. Fill in the Sheet

**Config tab** (column A is the setting, column B the value):

| Setting | What to put |
|---|---|
| `event_title` | The event name, used in the WhatsApp message |
| `rsvp_deadline` | Last day to reply, like `2026-11-06`. Replies stop at the end of that day, Malaysia time |
| `site_url` | Your page address, with no slash at the end |
| `shared_max_pax` | How many people a shared-link guest may bring (1 to 10) |
| `msg_vip`, `msg_shared` | The invitation message templates. `{name}`, `{event}`, `{deadline}` and `{link}` are filled in for you |
| `rsvp_open` | `TRUE`. Set it to `FALSE` to close RSVPs immediately |
| `contact_link` | Optional. Your WhatsApp link, for example from wa.link or `https://wa.me/60123456789`. It must start with `https://`. Guests see a **Contact the host** button when their link is invalid or RSVPs are closed. Leave it empty to hide the button |

**Guests tab:** type each guest's **name** (column B), **pax_allowed** (column C, 1 to 10) and, optionally, their **phone** (column D, digits with country code, like `60123456789`). Delete the three Test Guests first.

> **Never type or copy a guest ID yourself.** Leave column A empty and let **Generate IDs** fill it. A hand-typed or copied ID makes the personal link show "This invitation link isn't valid".

Then:
- **RSVP tools > Generate IDs.** This gives every guest a random 8-character ID and fills in the personal link and WhatsApp link columns. Run it again whenever you add guests. Existing IDs never change. It also warns you about any ID that was typed by hand or appears twice.
- **RSVP tools > Check setup** should say "Setup looks good."

## 3. Publish the script

1. In the script editor, choose **Deploy > New deployment**, click the gear icon and pick **Web app**.
2. Set **Execute as: Me** and **Who has access: Anyone**. Click **Deploy**.
3. Copy the **Web app URL**.

> If you change the script later, saving isn't enough. Use **Deploy > Manage deployments > pencil icon > Version: New version > Deploy**. The URL stays the same.

## 4. Connect the page and put it online

1. Give your developer (or your host's build settings) these two values:
   - `VITE_RSVP_USE_MOCK=false`
   - `VITE_RSVP_SCRIPT_URL=` followed by the Web app URL
2. The page is built with `npm run build` and the `dist` folder is uploaded to a static host (Netlify, Cloudflare Pages, GitHub Pages and similar).
3. Put the same page address in Config as `site_url`. The generated links update by themselves.

While `VITE_RSVP_USE_MOCK=true`, the page uses fake demo guests and saves nothing to your Sheet. Never publish it that way.

## 5. Send the invitations

- **Personal links:** in the Guests tab, click a cell in the **whatsapp_link** column. WhatsApp opens with the guest's message ready, and you press send. Links go one at a time, because WhatsApp doesn't allow bulk sending from a normal account. For guests without a phone number, copy the **link** column instead.
- **Shared link:** post your `site_url` in a group or broadcast.

## 6. Read the replies

**Responses tab:** one row per reply.

| Column | Meaning |
|---|---|
| `timestamp` | When they first replied |
| `guest_id` | Empty for shared-link replies |
| `name` | From your Guests tab for personal links. Typed by the guest for shared links |
| `attending`, `pax` | `yes`/`no` and how many people (0 for no) |
| `note` | Their message (up to 300 characters) |
| `source`, `verified` | `vip` + `TRUE` for personal links; `shared` + `FALSE` for shared links (check these against your list) |
| `updated` | Set when a personal-link guest changed their reply |
| `phone` | Shared-link guests only, and only if they typed one |

A personal-link guest always has **one** row. If they change their reply before the deadline, that same row is updated. Shared-link replies always add a new row.

**Guests tab:** the script tracks every personal-link guest for you:

| Column | Meaning |
|---|---|
| `reply`, `pax_confirmed` | What they answered and how many are coming |
| `responded` | `TRUE` once they have replied |
| `first_opened` | When they first opened their link (blank = never opened) |
| `status` | `Not opened`, `Opened, no reply`, or `Replied: yes/no` |

Sort or filter the `status` column to see who needs a reminder. `first_opened` counts anyone who opens the link, including you when you test it. A WhatsApp link preview on its own doesn't count.

Text that starts with `=`, `+`, `-` or `@` is saved with a small `’` in front, so it can never run as a formula, even in an Excel export.

## 7. Starting fresh (after testing, before real guests)

Two items in the **RSVP tools** menu clear data. Neither one really deletes anything. Each first copies the data into new tabs named **Archive <date time> Responses** and **Archive <date time> Guests**, checks the copy, and only then clears the originals. If the copy fails, nothing is cleared.

- **Clear test data (keeps guests):** archives and clears all replies and all `first_opened` times. Guest names, IDs and Config stay, so personal links keep working.
- **Reset for a new event (deletes guests too):** you must type `RESET`. This archives and clears all replies and the whole guest list. Config stays (update it for the new event). Every old personal link stops working. Afterwards, update Config, type the new guests, and run **Generate IDs**.

To restore something, open the Archive tab and copy its rows back. The columns are in the same order.

**Privacy:** the Archive tabs hold guest names, phone numbers and replies. **Delete them before you share the Sheet with a client** (right-click the tab > Delete). The safest way to hand over is a brand-new Sheet and a new deployment, so nothing from your tests is in it.

## Test before you send anything

Use the fake test guests:
1. Open a personal link. The greeting shows the guest's name and how many people they may bring.
2. Reply yes, reload the page, and use **Change my response**. The Responses tab should still have one row for that guest, now updated.
3. Open the shared link and reply with a test name and phone. It appears as `shared`, `FALSE`, with the phone in the last column.
4. Set `rsvp_open` to `FALSE`. The page should say RSVP is closed. Set it back to `TRUE`.
5. Run **Clear test data**, then delete the Archive tabs.

## If you used an older copy of the script

This version adds the optional `phone` column (Responses, column J) and the `contact_link` setting.
- Add the header `phone` in Responses cell **J1**. If you had your own formula in column J (for example a duplicate flag), move it one column to the right first. Until J1 says `phone`, the script leaves column J alone and doesn't save phone numbers. **Check setup** will remind you.
- Add a `contact_link` row to Config if you want the contact button.
- Then deploy a **New version** (see step 3).

## Privacy rules

- The Sheet holds guest names and phone numbers. **Never share it by link.** Share it only with the hosts.
- Never put the real guest list in this project or in git. The Sheet is the only place it lives.
- The page only ever receives one guest's name and allowed number of people. Nobody can list your guests through it.
- Personal IDs are random, so one guest can't guess another's link.
- The page has no analytics or cookies and asks search engines not to index it.

## If something doesn't work

| Problem | Likely cause |
|---|---|
| Page says "We could not load the RSVP form" | The script URL is empty or wrong, or the script isn't deployed with access **Anyone** |
| Replies stop appearing after you edited the script | You saved but didn't deploy a **New version** |
| "This invitation link isn't valid" on a personal link | The ID was copied wrongly, or the guest has no ID yet. Run Generate IDs |
| Page says "RSVP is closed" too early | Check `rsvp_open` and `rsvp_deadline` in Config. A missing or badly written date closes RSVPs on purpose |
| No phone numbers in Responses | Responses cell J1 must say `phone` (see "If you used an older copy") |
| No Contact the host button | `contact_link` is empty or doesn't start with `https://` |
