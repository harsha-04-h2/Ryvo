# NOVA MIND — AR Campaign Demo

A working Phase 0 demo for the AR Branding & Campaign Platform.
Fictional brand: NOVA MIND, an AI study-buddy app launching at TechFest '26.

## Pages
- index.html — campaign home: the pitch, the flow, the tracked artwork
- experience.html — real image-target AR (MindAR 1.2.5 + Three.js). Camera permission priming, target-found HUD, CTA + lead form, honest fallback suggestion on failure
- fallback.html — 3D viewer fallback (labelled not AR), same CTA + lead form
- poster.html — printable poster. Its QR is generated in the browser for the exact host it is served from, with placement tag p=poster
- dashboard.html — demo analytics: scans, starts, target found, CTA clicks, leads, by placement + raw event log

## Honest limits of this demo
- Analytics are stored in localStorage on the device running the experience (demo only). Production uses the server event pipeline from the marketing_analytics skill.
- The tracked target is MindAR's example card artwork (MIT). Production compiles the brand's own poster/packaging as the target.
- Three.js and MindAR load from CDN. Production bundles and pins them.
- AR requires HTTPS (or localhost) and a real device to verify tracking. Desktop browsers get the priming screen and the fallback path.

## Event contract
qr_scan, experience_start, target_found, content_engaged, cta_click, lead_submit — each with campaign, placement, session, timestamp.

Built from the AR Platform Engineering Library: ~/workspace/ar-platform-engineering-library/
