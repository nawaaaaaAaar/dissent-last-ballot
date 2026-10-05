# QA and limitations

## v0.7 Break Through

The v0.7.1 follow-up makes helped characters visibly run toward shelter. Its route assertion caught an inconsistent arrival threshold that left an evacuee stopped before turning into the courtyard. Matching that threshold and continuing off-camera evacuation corrected it; the full action/mobile test rerun passed, including the organiser reaching the courtyard.

The supplied game client also exercised movement and jumping in the default action mode (`qa/v07-client/`). Its initial five-second Play wait expired before the models finished loading; the adapted client now waits up to 90 seconds for the deterministic game hook, freezes rendering, then clicks Play. The rerun records `playing`, active pressure and airborne height. This adaptation is a test-loader accommodation, not a claim of fast cold loading.

`npm run test:action` passed the default action chapter through live rescue, recorder recovery, held barricade progress, Kabir and the winning assembly handoff. Separate assertions cover dodge/cooldown, paused mission time, deliberate capture and checkpoint retry, stamina consumption/recovery, actual mobile touch movement and Dodge, and portrait/landscape fit. Results and actual engine captures are in `qa/v07/`; there were no page errors.

The deliberate-failure test caught officers stopping at a distance greater than the damage threshold. Contact damage was changed to overlap their stopping range. The stamina test also corrected its own toggle assumption after restart. Visual review found the mobile Dodge caption overflowing its button; button padding and type size were revised.

`npm test` also passed both endings and checkpoint continuation in the separately selectable story mode after the new controls and props were added. The action tests use actual keyboard/click/touch input with deterministic simulation stepping. Physical phones, human enjoyment, authored dodge/jump motion and a reactive crowd remain unverified or unfinished.

Action-mode checkpoints preserve the mission during retry in the current tab, not across reloads. The source snapshot and older branch results do not establish a new graphics-quality claim.

## v0.6 The Account

The public GitHub Pages frontend commit `4d34f67` (`world.js?v=0.6.1`) was checked in cloud Chromium through supplies, recorder recovery, the public handoff choice, rally pause/resume and three successful beats, companion help and the completed assembly ending. Public low-graphics mobile emulation used actual touch input for start and joystick travel, then portrait/landscape captures with no horizontal overflow. `qa/v06-public-results.json` and `qa/v06-public-*` retain these checks. Deterministic stepping was used; reported FPS is not a hardware benchmark.

The Perplexity preview is also deployed. Its isolated iframe can deny browser storage; storage calls are caught, so play continues without a persistent checkpoint in that environment. Persistent browser checkpoints should be evaluated on the public GitHub Pages build.

`npm test` passed after the character, story and animation overhaul. `qa/world-results.json` records v0.6 with no page errors. Actual keyboard/click inputs cover supply collection, the recorder, optional story fragments, journal review and difficulty changes, local checkpoint restoration after reload, the protest event, rhythm misses and three successful inputs, capture/retry, companion help, both handoff endings, restart and orbit controls.

The first final run found that the rhythm overlay intercepted the visible Pause button. Header stacking and panel spacing were corrected; the rerun pauses and resumes during that encounter. `qa/v06-first-test-failure.log` and `qa/v06-test-run.log` retain the failure and successful rerun. Movement timings were updated after tuning walking to 1.8 and running to 4.6 game metres per second; the mobile movement assertion was also corrected for the slower walk.

Mobile Chromium emulation covers actual touch joystick movement and camera drag, jumping, running, sound activation after touch movement, pause/resume and portrait/landscape fit. The supplied game client separately exercised movement and jumping; `qa/v06-client/` retains its state and actual-render capture. This does not establish physical-phone performance, Safari support or human enjoyment.

Current local captures are `world-final-*`, `world-archive-ending.png` and `world-mobile-*`. Earlier `v06-*-review.png` images are intermediate character/animation checks. Final public captures, when present, use `v06-public-*`; older `world-public-final-*` images belong to v0.5.

Source-compatible idle, walk and run clips are retargeted to textured licensed avatars. Jumping still lacks its own authored clip. Foot-contact IK, facial performance, cloth simulation, detailed police models, reactive crowds and spatial protest ambience remain unfinished. Local saves are browser-specific and can be cleared by browser storage settings.

No novice playtest has been conducted. [GAME-DESIGN.md](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/GAME-DESIGN.md) defines a five-player first-run evaluation before claiming that ordinary players find the chapter clear or enjoyable. Automated coverage establishes implemented behaviour, not that acceptance result.

## v0.5 explorable world (historical)

`world-qa.mjs` tests the current default world. `qa/world-results.json` records the full five-act chapter, optional protest, jump, pause/resume, police capture, checkpoint recovery, restart and orbit camera through actual keyboard/click input with deterministic stepping.

Mobile Chromium emulation exercises real CDP touch movement on the joystick, camera drag, jump/run buttons, sound after a touch swipe, pause/resume and portrait/landscape layout. This is not physical-device certification. A first landscape screenshot was blank because a late resize cleared the manual-step render; the capture procedure now waits for resize before drawing again.

Actual captures are named `world-final-*` and `world-mobile-*`. Intermediate `world-review-*` captures are retained to document the self-review. `VISUAL-REVIEW.md` records specific faults and corrections rather than declaring the realism target complete.

Run `npm start`, then `npm test`. Long walking segments use fixed simulation stepping to avoid repeatedly rendering every short input interval on software GPUs. The QA hooks freeze normal time; `resumeRealTime()` restores normal gameplay. Reported QA-step FPS is not a performance benchmark.

Current limits: no persistent save, complex crowd/companion AI, authored mocap, physical destruction, spatial ambience or facial performance. The old opening/runner tests below are historical and must target `runner.html`, not the new world entry page.

The supplied game client also exercised forward/right movement and jump in the new world; `qa/world-client/` records playing state and airborne height, with no emitted error report. The review captured a font-readiness timeout in software Chromium; screenshots now use the bounded capture path without waiting indefinitely for optional remote fonts.

The final public GitHub Pages module (`world.js?v=0.5.4`, frontend commit `e8c7c77`) was exercised in cloud Chromium with high graphics through all five story encounters to `won`. Public mobile emulation used actual CDP touch input for start and joystick movement, then portrait/landscape captures. `qa/public-world-results.json` records the results; `world-public-final-*` images show the final public scene, including the corrected pavement and costume. This still does not certify iPhone/Android hardware or stable frame pacing.

## v0.4 real-time opening and visual pass

The new opening is rendered live by Three.js, not a video. Tests cover the Resist input, glass-effect transition, companion-hand input, pause/resume and handoff to the three-pursuer run, on desktop and mobile emulation. `qa/opening-results.json` records those results and a forced human-asset-load failure with primitive-character fallback.

The public GitHub Pages build was checked after publishing: the imported human loaded, both contextual opening actions worked, three pursuers appeared at handoff and left-lane input responded. `qa/public-v04.jpg` records the live page. This cloud Chromium check is not physical-phone certification.

The full mission passes with the skeletal human mesh. Mobile testing caught suppressed compatibility clicks after a swipe. UI buttons now handle touch release directly and avoid duplicate clicks, while preserving native mouse and keyboard activation; sound assertions also poll with a bounded timeout. Screenshots named `realtime-*` and `rigged-chase-*` show this version; older video screenshots are historical. Runtime art remains a prototype, and the colour-based clothing adaptation is not a finished realistic costume pipeline.

## v0.3 opening and chase (historical)

Full desktop mission, deliberate collision failure, checkpoint restoration, touch buttons, CDP touch swipe, portrait and landscape checks passed with the pursuit system enabled. Desktop and mobile runners skipped the film explicitly before testing controls. Separate checks covered video playback, pause/resume, natural handoff and a forced video-failure fallback. That opening was AI-generated video, not conventional authored-model CGI; it was replaced in v0.4.

The supplied game client also exercised Enter-to-skip, lane movement and jump; output is retained in `qa/chase-client/`. Extra animated characters increase draw calls; performance on physical iPhone/Android hardware remains unverified. Prefer Mobile / low graphics where needed.

The game is tested in Chromium with Playwright. Mobile checks emulate a 390 × 844 touch phone and 844 × 390 landscape viewport. These are browser-emulation results, not tests on a physical iPhone or Android device.

## Earlier runner coverage (historical)

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
- There is no claim of production-readiness, photorealistic art or a simulated protest crowd. v0.6 adds free exploration and basic companion following, not sophisticated crowd or companion AI.
- Fonts are the only optional remote display dependency; the engine and game texture are checked into the project.

The immediate next quality gate is a real-phone playtest, followed by an art-and-animation pass toward the original realistic visual target.

## v0.2 Delhi pass

The Delhi pass preserves mission logic and input controls, but changes architecture, signage, barricade and bus props, and adds a protest tableau and landmark. Additional visual checks cover the Delhi title, protest/bus scene, observatory silhouette, and mobile layout. Existing full-mission and checkpoint checks are re-run against this version; result JSON and screenshots are retained in `qa/`.

The “actual Delhi” claim is limited to sourced place names, public visual references, and reported protest context. This is not exact map geometry or a verified reconstruction.
