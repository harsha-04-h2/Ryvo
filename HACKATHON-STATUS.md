# Ryvo AR Demo — Hackathon Status (verified Wed 2026-10-28, for tonight 20:30 IST)

Verified locally only. **Not deployed, not pushed** — deployment is Harsha's call.
All fixes above are functional. The frontend was redesigned later the same day — see "Frontend redesign" below (that supersedes the original paper/ink design note).

## What works (and how it was verified)

- **All pages serve 200**: index, studio, experience, fallback, poster, dashboard + every asset (style.css, app.js, card.mind/.png, both .b64 files, softmind glTF) via `python3 -m http.server` + curl. Every internal href/src/fetch/loadAsync target resolves to a real file.
- **All CDN dependencies live** (HTTP 200): MindAR 1.2.5 (compiler + three build), Three.js 0.160 + GLTFLoader/OrbitControls, QRCode 1.5.1.
- **Every inline script parses** (`node --check` on all extracted scripts) and both importmaps are valid JSON.
- **Asset integrity**: `card.mind.b64` decodes byte-identical to `card.mind`; `card.png.b64` byte-identical to `card.png`. The softmind glTF is fully self-contained (buffers + textures are embedded data URIs — no external fetches).
- **Event contract works**: stubbed-browser Node test of `app.js` — `qr_scan / experience_start / target_found / content_engaged / cta_click / lead_submit` all land in `nm_events` with campaign (from `?c=`, default `nova-mind-techfest26`), placement (from `?p=`, default `direct`), session, ISO timestamp.
- **Studio → experience data contract works**: the exact base64 roundtrip both pages use (studio `btoa` of the compiled `.mind` → experience `atob` → `Uint8Array`) is byte-identical in Node; campaign lookup by `?c=<id>` in `ryvo_campaigns` and accent-colour parsing verified against a studio-shaped record.

## Bugs found and fixed today

1. **Corrupt analytics storage crashed everything** (`assets/app.js`): a malformed `nm_events` made both `logEvent` and `readEvents` throw — and since experience.html logs at module load, one bad value would kill the whole AR page; dashboard would die too. Now: safe-parse everywhere, and a failed write only logs a console warning.
2. **Failed AR start = black screen** (`experience.html`): on error after the prime screen was hidden, the error text sat inside the hidden prime panel — user stranded on a black screen + HUD. Catch block now restores the prime screen, hides the AR container/HUD, re-enables the button ("Try the camera again").
3. **Double-tap Start** spawned two MindAR sessions. Start button now disables itself while starting.
4. **Custom-campaign QR trap** (`experience.html`): opening a Studio campaign link (`?c=`) on a *different* device silently loaded the NOVA sample target, so the user's artwork would never track and they'd never know why. Now shows a plain warning ("created on another device/browser…") and relabels the button "Start with sample artwork instead".
5. **`content_engaged` could double-fire / never reset** (`experience.html`): `engagedAt` now resets on target-lost after logging.
6. **Fallback leaked attribution & branding** (`experience.html` + `fallback.html`): the "No camera?" link dropped `?c=`/`?p=`, and the fallback always showed NOVA branding + logged to the default campaign. The link now preserves the query string; the fallback brands itself from the Studio campaign (name, CTA, colour, thanks message), links back to AR with params intact, and logs `cta_click` before `lead_submit` so the dashboard funnel matches the AR path.
7. **Fallback viewer fragility** (`fallback.html`): WebGL/model failure left a mute black box — now shows an explanation and the CTA still works. Added a window-resize handler (canvas previously kept its load-time size/aspect).
8. **Studio publish could lie** (`studio.html`): if the QR library failed to load, `QRCode.toCanvas` threw *after* the campaign was saved, and the outer catch reported "Compiling failed". QR drawing is now isolated: publish succeeds and a note replaces the QR. Also: unreadable artwork in the file picker now errors visibly instead of failing silently, and the preview image no longer shows a broken-image placeholder before upload.
9. **Dashboard robustness** (`dashboard.html`): replaced implicit ID-globals with explicit lookups; placement/campaign/type values are now HTML-escaped before hitting `innerHTML` (they come from URL params via stored events — a crafted link could otherwise inject markup); added the missing **Engaged 3s+** (`content_engaged`) funnel stat, so all six contract events are visible somewhere.
10. **Poster/index image load**: if the `.b64` fetch fails, both now fall back to the plain `assets/card.png`; poster QR failure now prints the raw experience URL instead of an empty box.
11. README page list now includes studio.html (was missing).

## Demo-limited (by design — say this out loud if asked)

- **Campaigns and analytics live in one browser's localStorage.** A Studio campaign's link/QR only works *on the device that created it*. Events only appear on the dashboard of the device that ran the experience. Production = server-side storage + ingest; the event contract is already the production shape.
- **AR needs HTTPS (or localhost) + a real phone.** Camera + MindAR tracking **cannot be verified from this sandbox** — no camera, no headless browser here. Tracking quality on tonight's venue lighting/screen is untested. `http://localhost` on the presenting laptop works; a phone hitting a LAN IP over plain HTTP will be refused camera access by the browser.
- **MindAR compile happens in-browser** and can take a while / fail on low-contrast artwork; localStorage caps a campaign store at ~5MB (handled with an on-screen message).
- A failed AR start still logs `experience_start` with `fallback:'suggested'` + reason (visible in the raw log) — starts on the dashboard include those attempts.

## Exact demo flow for tonight (recommended path)

Rehearse once before 20:30. Safest order — lead with the path that cannot fail:

1. **Open `poster.html`** on the laptop, print it (or keep it on a second screen). Its QR is generated for whatever host serves the site and carries `p=poster`.
2. **Phone scans the poster QR** → `experience.html?p=poster` → tap **Start the camera** → point at the poster artwork (printed or the framed art on `index.html`) → mascot locks on (`target_found`), headline + CTA appear → tap CTA → submit the lead form.
3. **Open `dashboard.html` on the same phone browser** → funnel shows scans → starts → found → engaged → CTA → leads, plus the raw event log. (Same device is essential — events are on-device.)
4. **Then the Studio flex, on the laptop itself**: `studio.html` → name a campaign, upload detailed/high-contrast artwork → **Compile & publish** → use **"Open the live experience" on that same laptop** (webcam) — do *not* scan its QR with your phone, the campaign isn't on the phone (see fix #4: the phone will now tell you exactly that, which is itself an honest demo beat if it happens live).
5. **If camera/AR fails live**: `fallback.html` — same mascot in a drag-to-rotate 3D viewer, labelled not-AR, same CTA + lead form, events still counted. No dead air.

**Before tonight**: the site must be served over HTTPS (or localhost on the presenting machine) for any camera use — decide the host, that's the one remaining gate.

## Frontend redesign (Wed 2026-10-28, afternoon — Harsha: "change the front end")

**Status: built and verified locally, NOT yet seen/approved by Harsha's eye — he approves visuals personally, so treat the look as pending his verdict.** Pre-redesign backup kept at `~/workspace/ar-demo-campaign-backup-20261028-pre-redesign/` (untouched).

Direction: dark cinematic product look — near-black `#0A0A0C` background, off-white `#F5F2EB` text, vermilion `#FF4B1F` kept as the single accent (brand continuity), subtle animated radial glow behind the hero, 1px white/10 borders instead of heavy ink borders, glassy translucent panels, pill buttons. Anton kept for display, Archivo for body, IBM Plex Mono for labels. Vanilla motion only: IntersectionObserver fade+rise reveals with stagger (`.sec/.step/.stat/.frame/.preview/.poster` via new `assets/reveal.js`, progressive-enhancement — no-JS/reduced-motion = fully visible), smooth button hovers, `prefers-reduced-motion` respected.

Per page:
- `assets/style.css` — rewritten to the dark system. Legacy variable names deliberately kept (`--paper` = panel surface, `--paper-2` = glass surface, `--ink` = primary text, `--muted` = secondary on dark) so every inline style and JS colour reference kept working; new `--line`, `--bg`, `--radius` tokens added.
- `index.html` — restructured hero: Ryvo is now the platform hero ("Physical surfaces. Digital moments.", Studio-first CTAs); NOVA MIND moved to section 01 as the live demo case; all original sections, links and the `targetImg` .b64 script preserved verbatim.
- `studio.html` — inline styles remapped: dark glass inputs/preview, 1px line borders, rounded panels, error colour `#FF8A70` (readable on dark), QR kept on a white tile. The `#16130E` ink swatch is a user-selectable campaign accent, not page chrome — intentionally left.
- `experience.html` — HUD is now a dark glass panel (blur, 1px top border); error colour fixed for dark. AR JS untouched.
- `fallback.html` — viewer given a dark radial-glow surface + rounded frame; the WebGL-failure message colour changed from `var(--paper)` (now a dark surface token — would have been invisible) to explicit off-white. Only colour values changed in JS.
- `poster.html` — page chrome dark, but the poster **sheet itself stays light** (`#FBFAF5` / `#16130E`, explicit values) with `@media print` forcing the light sheet, no glow, no shadow — printed posters still read and track as before.
- `dashboard.html` — inherits the dark system via style.css (glass stat grid, line-bordered tables); no markup/logic change beyond the reveal script tag.

Verification after redesign: all 6 pages + style.css/app.js/reveal.js + every binary asset return 200 from a local server; a filtered diff against the backup confirms **no JS logic changed anywhere** (only styles, the index hero restructure, and the one fallback colour string) — `assets/app.js` is byte-identical, so all 11 morning fixes, both localStorage keys, the event contract, importmaps, QRCode and .b64 decoding are preserved; every extracted module/classic script passes `node --check`, both importmaps parse as valid JSON, and a cross-check confirms every `getElementById`/`$(...)` reference on every page still resolves to an existing element ID. Hardcoded-colour sweep: no ink-on-black text remains (remaining `#16130E` occurrences are the light poster sheet and the studio ink swatch, both intentional).
