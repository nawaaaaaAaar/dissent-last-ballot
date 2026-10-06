# QA and limitations

## Authored encounter/contact cycle

Baseline before edits was fresh public v0.15.13: exploratory witness and gathering play using normal-time movement, short/held strikes, dodge and failed/partial interactions. It was not a full baseline campaign win.

First revised play exposed bad skeleton binding, imported-axis pose errors, backward context selection, generic gathering-stage respawns and newly accepted furniture trapping a parked van. The v0.16.2 sequence completed rescue/gathering/courier but did not complete charter; do not count it as a passed campaign. Those defects were revised.

A fresh public commit-pinned v0.16.4 (`f805ecfaa0fb725eed1455b2759a20297f653a46`) completed the full cycle in ordinary browser time: rescue SILVER / 1733 / health 6 / van 96.87; gathering SILVER / 1420 / health 4; courier SILVER / 1414 / health 6 / van 94.79; charter BRONZE / 1057 / health 2 / van 100. Cycle two, four best scores and 11 credits were retained. No runtime positions, health, flags, credits or simulation clock were edited. Travel used manually selected waypoints through actual keyboard/touch controls. This is agent-assisted play, not a speedrun, first-time human study or proof of enjoyment.

Normal-time observations included moved screens, bench vaults, blocked walking paths, fixed-direction missed contact, regrouping, readers bracing under nearby pressure and resuming their escort, an interrupted copy that retained progress, and surviving guards left behind. The gathering completed without defeating its final guard/flanker; a pursuing rush unit still had to be confronted near the assembly. The final input-assistance follow-up removes occluded guards from nearby targeting and includes the blocking cordon as a target; campaign rules and placement remain the v0.16.4 core.

Forty isolated rule checks now cover the installed map and contact/prop/companion/stage/placement/targeting behaviours in `qa/v16/unit-results.json`. The harness dynamically imports the same versioned map module as the rules, avoiding an earlier separate-module test weakness. Rule tests stage state and do not measure fun. The supplied deterministic browser client checked rendered movement/strikes in `qa/v16-client-final/`; captures were visually inspected. Deterministic steps are not frame-rate benchmarks or normal-time play.

Original runtime joint keyframes are sampled from gameplay phase. They are not mocap or full-body IK, and hit geometry remains an arcade radius/cone rather than literal fist collision. Actual game captures retain simple props, adapted footprints and repeated avatars; menu/ending illustrations are not gameplay-art proof. Physical phones, Safari and independent player enjoyment remain unverified.

### Final input and public deployment checks

GitHub Pages successfully deployed source commit `4f2f8f9c03cf50d62841741cac36824edc81553a`. A fresh public root reported v0.16.5, and ordinary-time attacks caused capture; Retry checkpoint restored health 6 and four encounter props. The final patch changes nearby input assistance and in-game help, not the campaign objectives tested in the full v0.16.4 cycle.

Final v0.16.5 phone emulation at 844×390 exercised actual touch movement, screen Action, held Strike and vault Action. Assisted strikes opened the cordon with three contact hits despite the hidden guard; a touch-triggered vault crossed the selected bench and returned height to zero. At 390×844, simultaneous movement/aim pointers moved the player and produced two more contact events. Both orientations had zero horizontal overflow. Captures were inspected. These are input/layout tests, not a full phone campaign or physical-device performance certification.

One long-lived cloud browser became unresponsive during the first final idle/capture check, including screenshot failure. Its cause was not established; that attempt is not marked passed. A fresh browser repeated capture/retry on the public root successfully. Physical phones and Safari remain untested.

A separate renderer binding check on the final public source found 11 Jab tracks and different upper-arm quaternions at windup, contact and return phases. This checks actual keyframe binding, not convincing choreography or hand/foot IK. The supplied deterministic client also checked final v0.16.5 source in `qa/v16-client-final165/`; its screenshot was inspected. The debug overlay retains a historical `CITY / 0.14` label; runtime `render_game_to_text().version` is the version authority.

## Strict review rework: current scope

The current source is the strict-review rework, not the historical v0.14 signoff below. Read `STRICT-REVIEW.md` for the ranked fifteen-area assessment, observed failures and design decisions.

The current derivative retains 1,852 road/path ways, 785 above-ground source footprints and 124 green-space polygons. The displayed city uses 493 adapted footprint parts, with holes retained and street-clearance cuts; source footprints are preserved separately. These are database features, not authored interiors or an exact digital twin. Negative-layer/zero-above-ground underground station geometry is excluded. Vehicle guidance excludes pedestrian-only links.

Fresh public baseline v0.14.3 was explored in ordinary browser time: collisions, unsuccessful foot navigation, fighting, capture/retry, rescue and return. It was not a completed baseline win. Normal-time controls and manually selected waypoint-assisted travel are identified separately from isolated tests; no browser positions, health, credits or objective flags were edited.

Replays after the initial rework exposed and corrected obstructed witness/van placement, short rush reach, expensive road joins, animation timing, premature corner guidance, street/footprint clearance, unfair passive patrol contact, never-ending cooled pursuit, brittle driving, difficulty escalation and exhaustion removing the escape option. Failed driving attempts and incomplete courier/gathering runs are retained rather than counted as wins.

The v0.15.6 core rescue completed in normal time on a publicly served pinned GitHub build: fight, rescue, recording, companion boarding, escape beyond CP, cooled search, patrol stand-down and return. It ended GOLD, score 1,543, player health 6 and vehicle condition 100. Travel used manually selected road waypoints through actual input; the return used CDP touch pointers. This is agent-assisted play, not an unaided player study or speedrun. The later changes keep that mission structure while reserving dodge energy and smoothing subsequent encounters.

Earlier phone-emulated v0.15.4 checks exercised simultaneous move/aim touches, held strikes, camera toggle and 390×844 / 844×390 layouts without horizontal overflow. Its drive failed after a corner overshoot, which triggered handling revisions; it is not a passed complete mobile run. Physical iPhone/Android devices and Safari remain unverified.

Thirty isolated rule checks pass in `qa/v15/unit-results.json`, including shield/finisher, dodge, energy reserve/recovery, held copying/interruption, stage checkpoints, both-reader completion, vehicle routes, one-use support, failure abandonment, passive-contact removal, warned charges/counter-steering, first-cycle commitment limits and cooled-pursuit stand-down/reboarding. Rule tests stage state and do not measure fun.

The supplied deterministic browser client separately exercised movement and strikes on the final source; its captures/state files are under `qa/v15-final158-client/` and subsequent final-client folders. Deterministic stepping is not a frame-rate or enjoyment measurement. Cloud gameplay observed approximately 45–60 FPS in several scenes after loading; local software-rendered Chromium was much slower. Neither establishes a physical-phone performance guarantee.

Final replay and deployment observations are appended below after verification. Older sections are retained as history, not current-version claims.

### Final full-cycle replay

The v0.15.10 commit-pinned public build completed all four operations in ordinary browser time through actual controls: rescue GOLD / 1,541 / health 6 / van 100; gathering SILVER / 1,411 / health 3; courier GOLD / 1,433 / health 6 / van 100; charter SILVER / 1,411 / health 6 / van 88. The charter advanced cycle two, retained four best scores and an earned tempo upgrade, and left nine credits. No browser game state or simulation clock was edited.

Travel was waypoint-assisted actual input, not an unaided human play study. The gathering's aid restoration, two-reader escort, courier/charter copying, rescue return and charter drive used actual touch pointers in landscape phone emulation. The charter took a single warned ram hit, escaped and completed; passive overlapping did not drain its vehicle.

The final tree rendering is spatially chunked. The one-FPS cloud observation was subsequently traced to a background tab: foregrounding restored approximately 60 FPS in the checked scene. Do not attribute that observation entirely to geometry, or treat either result as a physical-device benchmark. Local software-rendering timings remain separate.

The result panel retained its previous scroll position during later victories and clipped the heading at 844×390. The follow-up presentation patch resets its scroll and uses a compact short-viewport layout; game rules are unchanged. Final presentation/layout rechecks are recorded after deployment below.

### Final public deployment and presentation recheck

GitHub Pages successfully deployed source commit `349ac7bf68a26749f833c87913f1b41a974743ff`. The public root was loaded fresh and reported v0.15.13. High-graphics keyboard movement, strikes and dodge were exercised, and an actual gameplay capture was inspected.

Final phone emulation used 390×844 and 844×390. Simultaneous real touch pointers moved the character and produced three strikes; both layouts had zero horizontal overflow. Remaining stationary under normal-time attacks then caused capture, without health or failure-state injection. The landscape failure heading and both recovery actions fitted the viewport, with result scroll reset to zero. Captures are retained under `qa/v15/public1513-*`. This checks final presentation, not a second full campaign or physical-phone performance.

The four-operation replay above remains applicable to the core rules: comparison with v0.15.10 shows only a versioned import change in `city-rules.js`. The subsequent patch adjusts camera and presentation. Final images still show simplified building geometry, sparse authored activity and repeated characters; they are not evidence of finished-game art.

## v0.14 City of Accounts

This is a connected-city and gameplay-loop revision, not a final graphics approval. The raw OpenStreetMap extract and derivative map are retained, with 1,269 road ways and 786 building footprints. Those are data features, not 1,269 distinct named streets or 786 authored interiors. Geography is uniformly compressed, roads widened, building heights approximated and traffic rules simplified.

Thirteen current isolated checks pass in `qa/v14/unit-results.json`: map relationships and routes, unrescued-witness position on exit/retry, mission and charter prerequisites, single awards and replay bests, delivery requirements, upgrades, save validation, network cycles, rally conditions, collisions, restored pursuit, changing rally targets and cleared-roadblock persistence. Unit checks stage rule state; they are not browser playthroughs.

Normal browser-time preview play used actual keyboard/mouse controls without `advanceTime`. The first version exposed an unrescued witness teleport on van exit; that was fixed. The v0.14.1 rescue subsequently completed with Kabir and the recording delivered, health 6, van 12%, SILVER and score 1441. Time exposed between tool calls and imperfect steering affected van condition, so this is not a controlled human driving benchmark. The first hot arrival did not win.

Phone-emulated preview testing used actual CDP touch pointers with deterministic simulation stepping. A courier reached India Gate and won GOLD after a vehicle-failure/checkpoint retry. A first rally won from a stationary strike position; review rejected that design and replaced it with three separate gathering, aid and reading-circle zones. Dynamic waypoint controllers also cut corners or oscillated; failed controller attempts are not counted as passed runs.

Public frontend `6724b6a` was confirmed as v0.14.3. Actual touch completed the revised three-point rally: the first point stopped advancing after eight seconds, its target moved, and simultaneous movement/Strike pointers reached the other two zones. The result was GOLD, health 6, van 100%, score 2137, with earned upgrades retained. The same session drove from Sansad Marg to India Gate with no collisions, recovered the charter and exercised a return-roadblock confrontation. A slow delivery controller lost the van to pursuit; retry restored the earned packet, vehicle and nearby patrol, and a faster route reached the roadblock without damage.

That confrontation caught a persistence regression: boarding could recreate a cleared roadblock. v0.14.4 makes activation once per operation and retains it through checkpoints. Its separate thirteenth unit check covers clear, reboard, failure, retry and another reboard.

Local persistent Chromium checked help/pause freeze, resume, mission selection, difficulty changes, save export, malformed restore rejection and legitimate earned-code restore without page errors. The supplied game client separately exercised movement and held strikes; `qa/v14-client-final/` belongs to v0.14.3 and `qa/v14-client-patch/` confirms v0.14.4 with actual movement/Strike state and an inspected capture.

The final local v0.14.4 charter was completed through actual mouse/keyboard controls with deterministic stepping, using legitimate earlier-earned progress restored through the UI. It travelled from CP to India Gate, recovered the dispatch, drove to the return roadblock, exited and struck it open, reboarded without recreating it, and delivered to Jantar Mantar after losing pursuit. The result was GOLD, health 6, van 100%, score 1440, network cycle 2, ten credits and both earned upgrades retained. This is a local final-patch run, not a public final-patch completion. A new cycle operation was then accepted; actual CDP touch at 844×390 produced 1.87 units of movement and two strikes with simultaneous pointers. Both 844×390 and 390×844 had zero horizontal overflow and no page errors.

A cloud emulation issue initially dropped touches below the native visible viewport despite correct reported device metrics. Synchronising the CDP visible size restored joystick input. The resulting idle time is included in the public rally timer and is not a player speedrun measurement. Tests do not set browser game positions, health, completion flags or credits; legitimate progress codes earned in earlier actual-input runs are explicitly transferred through the UI.

`qa/v14/results.json` records version-specific final checks and captures. Deterministic stepping is not FPS measurement. Physical iPhone/Android hardware, Safari, ordinary first-time-player enjoyment, traffic/crowd simulation and realistic character/environment art remain unverified.

Delivery status: the connected-city update is confirmed public as v0.14.3. Source patch v0.14.4 is pushed, and the private preview loads it, but GitHub's Pages workflow remained queued when these notes were written. Do not treat the source push as a confirmed public v0.14.4 deployment.

## v0.13 Play review

Normal-time review of v0.12.2 used actual browser keyboard input without `advanceTime`: walking, held Space, Dodge, movement/pausing and a separate barrier/rescue/recording/boarding/two-turn/brake attempt. Holding Space for 2.2 seconds produced one hit, while officers could overlap at zero distance. The fast turn/brake attempt ended at x40.34/z-38.33, beyond the intended eastern junction. `PLAYER-REVIEW.md` separates deliberate action from time spent exposed between tool calls.

Eleven isolated checks pass, including the added melee stopping distance, corner-speed/released-input braking and nearby patrol/last-seen restoration tests. The supplied game client verified held Space produces repeated damage in `qa/v13-client/` and `qa/v13-client-final/`. Earlier public completion records below belong to v0.12 and are not current-version signoff.

The deployed preview was replayed in normal browser time without `advanceTime`. The same 2.2-second held-Space window produced five strikes, stopped on release and left one opponent disabled and another on condition 1. The repeated fast-turn/brake attempt stayed closer to the eastern road at x37.55/z-35.96. These tool-driven observations are not a controlled human steering benchmark. The first v0.13 hot safe-house arrival remained visible and lost van condition; it is explicitly not counted as a win.

After separating fast visible patrol pursuit from slower last-seen searching, the final v0.13.1 mission completed in normal browser time in the deployed preview: health 6, van 100%, heat 0.69, companion and recording aboard, score 2167. No positions, health or objective flags were edited.

Public frontend `fcc93c2` was confirmed as v0.13.1. Actual phone-emulated touch produced five held-button strikes and stopped on release; pause/help/return froze time correctly. The public run rescued Kabir, picked up the recording, boarded together, failed from driving into a building, restored the boarding checkpoint with a nearby patrol, then drove and parked unseen to win. Separate simultaneous movement/aim touch pointers produced four strikes and opponent condition 3 to 1, and release stopped them. Portrait 390×844 and landscape 844×390 have no horizontal overflow.

`qa/v13/results.json` and the named captures distinguish normal-time preview play, public deterministic touch checks and isolated rules. Physical phones, Safari, ordinary-player enjoyment and final realistic character/environment art remain unverified.

## v0.12 Breakout

The current root is the new top-down mission; archived campaign results below do not test it. Eight isolated rule checks pass: barrier/cooldown, aimed melee interruption and opponent condition, dodge cost/invulnerability, rescue/boarding prerequisites, occlusion/search/win conditions, vehicle acceleration/braking/destruction, valid barricade-detour navigation and roadblock/reboarding/checkpoint persistence.

Local Chromium completed the mission with actual keyboard inputs, not rule-state teleportation: four barrier strikes, rescue, recording pickup, companion boarding, four directional driving segments, heat loss and parked victory. It also checked pause/help freezing and returning, fresh capture and retry with restored health. `qa/v12/local-results.json` and `local-test.log` retain the scope and have no page errors. The supplied game client separately captured movement and strike state in `qa/v12-client/`.

Iteration found a path-grid edge crossing the thin line, an unsuitable initial van heading and vehicle-model forward-direction mismatch; these were corrected. An initial automated driving controller oscillated around waypoint targets and lost the van; deliberate directional segments with braking completed the route. The controller failure is not counted as a passing run.

Phone-emulated Chromium separately completed the mission through actual touch, including right-stick melee damage, Dodge, four barrier strikes, rescue/recording, boarding, vehicle destruction from a real drive into a building, boarding-checkpoint retry, four driving segments and parked victory. Portrait 390×844 and landscape 844×390 were captured without horizontal overflow. `qa/v12/mobile-results.json` and `mobile-test.log` retain the scope. Review found overlapping panels and a resize-cleared deterministic render; both were revised rather than passing the initial captures as final.

Public frontend `0b49679` was completed in cloud Chromium through actual keyboard input: barrier, rescue, recording, boarding, eastern route, search loss and parked victory. A separate public touch run verified melee damage (opponent condition 3 to 2), Dodge, rescue/recording, boarding, portrait/landscape, real collision-caused vehicle failure, boarding retry, driving/braking and victory. Public captures retain actual rendering, not generated art.

Alternate-route review then caught a roadblock regenerating whenever the player reboarded and a checkpoint always restoring the initial van position. v0.12.1 retains a cleared roadblock and saves the actual boarding position/heading. Local actual-input QA crossed west, exited, struck the line, reboarded, drove through it, failed by collision and restored that earned location with the line still clear. Its passed result has no page errors. The software-WebGL command reached the platform time limit after writing the passed results; the file and completed log were inspected independently, so the command timeout is not silently reported as a clean command exit.

Final public frontend `710f76c` was confirmed to load `breakout.js?v=0.12.1`. Cloud Chromium completed the west-route exit/strike/reboard/crossing sequence, deliberately failed by driving into a building, restored the actual western boarding position/heading with Kabir and recording aboard and the roadblock still clear, then won by parking unseen at the safe house. The final patch also passed phone-emulated guide/start, outer-stick sprint and four touch barrier strikes without horizontal overflow. `qa/v12/final-public-results.json` records the exact scope; the earlier complete public phone mission remains separately identified rather than relabelled as a final-patch full run.

Final renderer v0.12.2 was confirmed on public frontend `00cfd3b` after GitHub Pages reported a successful build. Cloud Chromium completed the east-route mission again using actual keyboard input on High graphics (health 6, van 100%, heat 0.69, score 2167). Actual touch start, sprint and barrier strikes were repeated on Low in portrait/landscape; public captures were inspected to confirm removal of depth-flicker stripes. `qa/v12/depth-public-results.json` separates this renderer recheck from the earlier full phone and west-route tests. The v0.12.1 game rules are unchanged.

Deterministic stepping is not FPS measurement. Physical phones, Safari, first-time-player enjoyment, higher-fidelity combat/crowd animation and production realism remain open requirements.

## v0.11 Learn the Route

The final public frontend `4466ab1` loads `world.js?v=0.11.2`. Cloud Chromium completed all seven practice actions by keyboard and then all three campaign chapters, with three packets per chapter, zero required case reviews, both Bihar companions arriving and twenty game seconds inside the Bengal zone. The ending carried all three demands. Public scores were 2341, 2687 and 1550.

Public phone emulation separately completed all seven practice actions by actual touch: partial-stick movement, outer-stick sprint, Jump, Dodge, Rally, packet pickup and a held help. Practice preserved existing completed campaign records and the fresh-start button reset the active run. Pause-to-guide-to-pause froze action correctly. Portrait is 390×844; landscape is 844×390 without horizontal overflow. `qa/v11/public-results.json` and `public-*` captures retain the final scope.

The local action campaign suite passed all three chapters, Rally/displacement/cooldown, physical hurdle jump, zero required quizzes, two-person escort, zone-only sustain, persistence, replay, capture/retry, optional-case anti-farming and phone controls/layouts with no page errors. `qa/v11/results.json` and `v11-test.log` retain the scope.

The tutorial suite passed all seven actual-input practice steps without pursuit or recorded campaign completion, a clean campaign start afterwards, guide freeze/return from Pause, phone guide/practice/exit/start, and sprint exhaustion/recovery rules. `qa/v11/tutorial-results.json` and `v11-tutorial-test.log` retain these checks. The supplied client separately records active movement and jumping in `qa/v11-client/`.

Public visual review caught the custom hair material being overwritten with white by common material normalisation, residual source cap faces and a texture-node match based on image name rather than filepath. Those were corrected and checked in the final public render. Repeated high-quality reloads exhausted a cloud WebGL context; a fresh browser restored rendering, and final campaign/phone verification used low graphics. This is not proof of real-device memory or frame-rate targets. Physical-phone performance, Safari, novice enjoyment and production-quality realism remain unverified.

## v0.10 Signal Run

The public frontend `14744af` loads `world.js?v=0.10.0`. Cloud Chromium completed Jantar, Bihar and Bengal with three packets each, zero case reviews and no mandatory charter. Jantar included direct help, a sprint-jump, recorder, breakthrough and reunion; Bihar arrived with both companions; Bengal held its marked gathering for twenty game seconds and carried all three reform demands into the direct ending. Public scores were 2193, 2687 and 1550. `qa/v10/public-results.json` and `public-*` captures retain the observations.

Public touch checks at 390×844 and 844×390 separately exercised Rally and officer stun, partial-stick walking versus outer-stick running, moving Dodge, Jump, pause/resume and district switching. The completed campaign persisted after reload, and landscape had no horizontal overflow. These are Chromium emulation checks, not physical-phone tests.

`npm run test:campaign` passed using actual keyboard, mouse and emulated touch inputs with deterministic simulation stepping. `qa/v10/results.json`, captures and `qa/v10-test.log` retain the scope. All three chapters completed with zero mandatory case reviews and no mandatory charter gate.

Checks cover Rally's energy cost, cooldown, actual displacement and stun; a sprint-jump over a physical crate; live help without a quiz; automatic packets; recorder, breakthrough and reunion; both escort companions arriving; sustain time advancing only inside the gathering zone; full campaign completion; stored chapter progress; replay/reset; deliberate capture and checkpoint retry retaining a packet; damage breaking the chain; optional-case anti-farming; and pause/resume.

Mobile Chromium emulation covers Rally, partial-stick walk versus outer-stick running, a moving Dodge, Jump, pause/resume, district switching and portrait/landscape fit. There were no page errors. This is input/layout coverage, not physical-phone frame-rate or Safari certification.

The current suite is `street-qa.mjs` (`test:campaign` and `test:action`). Earlier campaign/action/story results below are historical, not current signoff. The supplied game client also passes a short movement/jump check; `qa/v10-client/state-0.json` records active action and airborne height. Ordinary-player enjoyment, physical iPhone/Android performance and photorealistic art remain unverified. Pursuers still use simplified steering and can be obstructed by world geometry; this is not finished navigation AI.

## v0.9 Every Eligible Voter

The final public frontend `e9e73e4` loads `world.js?v=0.9.0`. Cloud Chromium completed all nine referrals, the Jantar breakthrough, both Bihar companions arriving, twenty seconds of supported Bengal desks, rejection of a resignation-only charter and the complete three-part hypothetical ending. Incorrect-response feedback is now visible in the final desktop panel. `qa/v09/public-results.json` and `public-*` captures retain the observed scope.

Public phone emulation separately used actual touch travel and a held Bengal case review, rejected an inclusion response for a pending appeal, showed the feedback, and accepted appeal support with a “referred / fictional; not an official registration” outcome. It also passed walk versus outer-stick run, Dodge, pause/resume, camera drag, district switching, persisted chapter completion after reload and landscape fit. This is Chromium emulation, not physical-device testing.

The supplied client first clicked Play too early because its virtual-time shim already defined `advanceTime`. Waiting for the actual game's `render_game_to_text` as well, with the timeout in the correct Playwright argument, corrected the loader check. The rerun in `qa/v09-client/` records active play, police pressure and airborne height. The adapter change is not a claim of fast cold loading.

`npm run test:campaign` passed the nine invented case referrals across Jantar Mantar and the Bihar/West Bengal help-camp chapters. Actual keyboard/click inputs cover record comparison, incorrect-response feedback, leaving without a referral, action-time freeze during review, the breakthrough, both escort companions arriving, desk sustain, rejection of a resignation-only charter, and completion with all three commitments.

The same suite passes completed-chapter persistence, replay/reset and in-session menu Resume. Mobile Chromium emulation covers partial-stick walk/outer-stick run, stamina, Dodge, pause, camera drag, a held file review, incorrect and correct touch responses, map/journal navigation and portrait/landscape fit. `qa/v09/results.json` and captures retain the scope, with no page errors. Emergency network recovery is also covered by an isolated damage-rule check, not presented as a full phone combat test.

Review of actual captures found incorrect-answer feedback below the desktop panel's visible area and a more-specific later CSS rule overriding the intended width. A specificity correction widens desktop review, and an incorrect answer now scrolls feedback into view. Contextual captions and toasts were corrected from generic rescue language to case-review/referral language. Public verification checks the final frontend after this readability pass.

All files and names are invented and labelled; no actual voter data, official registration, external petition or political messages are produced. Camp geometry is reused and explicitly not a real Bihar/West Bengal location. The fictional charter does not announce an official's actual resignation, SIR repeal or reversed election.

Physical iPhone/Android performance, Safari and novice enjoyment remain unverified. v0.9 is a theme/mechanics revision, not an art-quality or complete legal-procedure simulation. Earlier action/story regression results below are historical; the current campaign suite is the signoff scope for the changed gameplay.

## v0.8 three-district campaign

The public frontend commit `80cadd7` loads `world.js?v=0.8.0`. All three campaign missions were completed in cloud Chromium with actual keyboard/mouse input and deterministic stepping. The campus ended with both companions at z=-41.22, within the arrival radius of the player's z=-43 destination; the community mission recorded all three stations and twenty sustain seconds. `qa/v08/public-results.json` and `public-*` captures retain the observed states.

Public mobile emulation separately passed partial-stick walk versus outer-stick run, stamina use, hidden separate Run button, Dodge, pause/resume, camera drag, a held campus rescue, journal/map navigation and switching to the community district. Portrait is 390×844; landscape is 844×390 with no horizontal overflow. Completed districts persisted across reload. The portrait map's notes button requires scrolling: an initial coordinate-only test aimed below the visible modal, then scrolling and repeating opened it. The local Playwright tests scroll controls into view automatically.

The supplied game client also exercised movement and jumping in v0.8; `qa/v08-client/state-0.json` records active play, pressure and an airborne character. This short control check is separate from full campaign coverage.

`npm run test:campaign` exercises actual keyboard, mouse and touch input with deterministic simulation stepping. The campaign checks cover Jantar Mantar completion, both campus companions arriving together, all three community stations and the sustain objective, completed-campaign persistence, district replay, mobile walk/outer-stick run, Dodge, pause/resume, camera drag, map/journal navigation and portrait/landscape fit. The final suite also checks that menu Resume retains the unfinished player's position.

`qa/v08/results.json` and `qa/v08/` captures record this campaign scope. The emergency network recovery is additionally tested in an isolated `ActionGame.damage` unit check; that is not presented as an end-to-end phone combat test. Action and slower-story regressions also passed after the district rebuild, including capture/retry, stamina, held rescue and both legacy handoffs. Their logs are `qa/v08-action-test.log` and `qa/v08-story-test.log`; older regression capture paths were refreshed and should not be mistaken for historical art.

Actual-render review found white floors despite loaded texture assets: two differently versioned imports created separate material-library instances. Sharing the same module URL restored textured district surfaces. Review also found a carried running pose at a new mission's entrance; explicit animation reset corrected it. Subsequent captures show the corrected engine rendering, not generated promotional imagery.

The test harness waits for models and supports deterministic stepping because software-rendered browser tests can be slow. Running three GPU-heavy suites together exhausted two tool wait windows; durable child-process logs subsequently recorded successful completion. Final campaign checks are run serially. Neither automated simulation time nor these tool timings establish real-device frame rates, load-time targets or human completion times.

Phone coverage is Chromium emulation, not a physical iPhone/Android or Safari test. Crowd behaviour, facial acting, foot-contact IK, authored jumping/dodging, exact geography and production-quality destruction remain unfinished. No novice playtest has established ordinary-player enjoyment. Browser-local completed-campaign storage can be cleared or denied; denied storage does not block play, and current action missions do not resume after reload.

## v0.7 Break Through

The final public frontend `27c687c` / `world.js?v=0.7.1` was completed in cloud Chromium with actual keyboard and mouse input: an optional rescue, recorder pickup, held breakthrough, Kabir and the assembly produced `won` with score 1796 and four remaining health pips. The organiser reached the courtyard rather than remaining at the rescue marker. Public phone emulation separately passed touch movement, Dodge, held rescue and pause/resume, with portrait/landscape captures. `qa/v07/public-results.json` and `public-*` images retain these observations; simulation time is not a novice completion-time benchmark.

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
