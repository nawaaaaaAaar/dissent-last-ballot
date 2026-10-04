# v0.1 QA and limitations

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

Run `npm ci`, then `npx playwright install chromium`. In one terminal run `npm start`; in another run `npm test`. `DISSENT_URL` optionally targets a different deployment.

For interactive state inspection, `window.render_game_to_text()` returns concise JSON. Calling `window.advanceTime(ms)` enters deterministic QA stepping and stops real-time simulation/rendering between steps; call `window.resumeRealTime()` to return to normal play.

## Explicit limits

- Hardware frame-rate targets are not certified. Headless software-renderer FPS does not establish mobile GPU performance.
- Safari/iOS and physical Android hardware have not been exercised here.
- WebGL context-loss and tab-background recovery have implementation handlers but are not yet covered by a physical-device interruption test.
- There is no claim of production-readiness, photorealistic art, a simulated protest crowd, companion AI, or a freely explorable confrontation system.
- Fonts are the only optional remote display dependency; the engine and game texture are checked into the project.

The immediate next quality gate is a real-phone playtest, followed by an art-and-animation pass toward the original realistic visual target.
