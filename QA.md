# QA and limitations

## v0.4 real-time opening and visual pass

The new opening is rendered live by Three.js, not a video. Tests cover the Resist input, glass-effect transition, companion-hand input, pause/resume and handoff to the three-pursuer run, on desktop and mobile emulation. `qa/opening-results.json` records those results and a forced human-asset-load failure with primitive-character fallback.

The public GitHub Pages build was checked after publishing: the imported human loaded, both contextual opening actions worked, three pursuers appeared at handoff and left-lane input responded. `qa/public-v04.jpg` records the live page. This cloud Chromium check is not physical-phone certification.

The full mission passes with the skeletal human mesh. Mobile testing caught suppressed compatibility clicks after a swipe. UI buttons now handle touch release directly and avoid duplicate clicks, while preserving native mouse and keyboard activation; sound assertions also poll with a bounded timeout. Screenshots named `realtime-*` and `rigged-chase-*` show this version; older video screenshots are historical. Runtime art remains a prototype, and the colour-based clothing adaptation is not a finished realistic costume pipeline.

## v0.3 opening and chase (historical)

Full desktop mission, deliberate collision failure, checkpoint restoration, touch buttons, CDP touch swipe, portrait and landscape checks passed with the pursuit system enabled. Desktop and mobile runners skipped the film explicitly before testing controls. Separate checks covered video playback, pause/resume, natural handoff and a forced video-failure fallback. That opening was AI-generated video, not conventional authored-model CGI; it was replaced in v0.4.

The supplied game client also exercised Enter-to-skip, lane movement and jump; output is retained in `qa/chase-client/`. Extra animated characters increase draw calls; performance on physical iPhone/Android hardware remains unverified. Prefer Mobile / low graphics where needed.

The game is tested in Chromium with Playwright. Mobile checks emulate a 390 × 844 touch phone and 844 × 390 landscape viewport. These are browser-emulation results, not tests on a physical iPhone or Android device.

## Coverage

- Keyboard movement, jump, slide, and pause/resume.
- Touch buttons, a real CDP-dispatched touch swipe, portrait viewport fit, and landscape resize.
- Graphics selection, reduced motion, assist mode, and sound toggle.
- Full 900-metre mission with actual keyboard/click inputs and deterministic simulation stepping.
- Evidence collection, barrier interaction, journalist footage handoff, and mission completion.
- Deliberate collisions, failure, retry, checkpoint restoration, and full restart.
- Visual review of title, gameplay, story dialogs, pause, failure, and completion.
- Console/page-error review.

`qa/desktop-results.json` records the full-mission results. Screenshots in `qa/` include intermediate iterations as well as the final checks; early images are not the current build.

The first pass caught a portrait-camera clipping issue and a repeated jump collision check. Both were fixed, then jump clearance was rechecked with the provided game client. `qa/jump-final/state-0.json` shows the first barrier cleared with condition 100.

## Re-run

Run `npm ci`, then `npx playwright install chromium`. In one terminal run `npm start`; in another run `npm test`. Run `node opening-qa.mjs` for the real-time opening inputs and human-asset fallback checks. `DISSENT_URL` optionally targets a different deployment.

For interactive state inspection, `window.render_game_to_text()` returns concise JSON. Calling `window.advanceTime(ms)` enters deterministic QA stepping and stops real-time simulation/rendering between steps; call `window.resumeRealTime()` to return to normal play.

## Explicit limits

- Hardware frame-rate targets are not certified. Headless software-renderer FPS does not establish mobile GPU performance.
- Safari/iOS and physical Android hardware have not been exercised here.
- WebGL context-loss and tab-background recovery have implementation handlers but are not yet covered by a physical-device interruption test.
- There is no claim of production-readiness, photorealistic art, a simulated protest crowd, companion AI, or a freely explorable confrontation system.
- Fonts are the only optional remote display dependency; the engine and game texture are checked into the project.

The immediate next quality gate is a real-phone playtest, followed by an art-and-animation pass toward the original realistic visual target.

## v0.2 Delhi pass

The Delhi pass preserves mission logic and input controls, but changes architecture, signage, barricade and bus props, and adds a protest tableau and landmark. Additional visual checks cover the Delhi title, protest/bus scene, observatory silhouette, and mobile layout. Existing full-mission and checkpoint checks are re-run against this version; result JSON and screenshots are retained in `qa/`.

The “actual Delhi” claim is limited to sourced place names, public visual references, and reported protest context. This is not exact map geometry or a verified reconstruction.
