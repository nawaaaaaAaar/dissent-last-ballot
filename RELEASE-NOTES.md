# DISSENT release notes

## At the Line rebuild

- Replaced the default city campaign entry with one connected rescue-and-escape scene and separate rules/rendering/UI. The old city stays playable at campaign-v17.html.
- Authored a Delhi-inspired street/gathering, guarded friend, sight-blocking screen, middle breakthrough and side crossing, together-only boarding, roadwork/patrol escape and shelter.
- Reworked mobile input around one movement stick, nearby-facing Strike, Dodge and contextual Action. Removed the mission-board/reward setup from this encounter.
- Rebuilt camera, HUD and scene staging, improved materials/shadows and vehicle/garden presentation; added three fictional Hindi voice lines, differentiated Foley and engine/siren layers.
- Revised after actual play exposed companion crossing oscillation, invisible table collision, default dodge direction and exhausted escape energy. Both side and direct approaches completed through actual normal-time controls; the direct route included a deliberate driving failure and escape-checkpoint retry.
- Sixteen isolated rules pass. Final presentation/audio checks are separate from full gameplay replay. Character assets, choreography, crowd autonomy, encounter length and unverified independent enjoyment still prevent finished-indie or final-graphics approval.

## Physical readability and presentation

- Replayed public v0.16.5 before edits, including misses, screen movement, vault and dodge; no new districts or reward systems.
- Reworked adaptive close/portrait/vehicle framing, damped camera transitions and desktop HUD footprint.
- Reduced strike reach, added readable range arcs, shared enemy tell/reach geometry and nearest-rail barricade contact. Walking/strike advance no longer crosses standing opponents' centres.
- Added bounded two-bone hand targeting, vault anticipation/landing timing and blended exits to locomotion; these remain arcade animation, not full-body IK or mocap.
- Rebuilt bench/table/screen silhouettes and surface details; removed decorative stalls that overlapped the authored aid point and concealed the player.
- Differentiated original synthesized Foley and added a subtitled generated Hindi Anita line with provenance. Added explicit browser graphics-context-loss recovery.
- Revised again after the full initial play exposed overhead shields, overlap-induced misses and staging occlusion. A fresh final-rules public four-operation cycle reached cycle two; `PHYSICAL-REVIEW.md` and `QA.md` distinguish full replay from subsequent presentation-only checks.
- Still below finished-indie quality: incomplete foot planting/grips/falls, repeated avatars, generic city geometry, thin spatial audio and local routing/pursuit fairness. No claim of physical-phone certification or measured human enjoyment.

## Authored encounter and contact rework

- Replayed public v0.15.13 before edits and selected the witness cordon and community forecourt as the main redesigns. No district, currency or reward counter was added.
- Added collision/sight-aware low benches, desks and movable banner screens, validated vaults, screen investigation noise and checkpoint-persistent prop positions.
- Replaced input-instant damage with locked-facing, once-per-swing contact phases shared with original authored skeletal keyframes. Enemy committed strikes and recovery use the same phase-based approach.
- Added position-holding guards, flanking, regrouping and companion brace/shelter/follow reactions. Authored all gathering stage guard homes rather than reverting to circular respawns.
- Iterated after actual play exposed incorrect rig-track binding/axes, backward context selection, generic later stages, a parked-van obstruction and assisted aim selecting an occluded guard.
- Completed a fresh revised four-operation cycle in ordinary time. See `ENCOUNTER-REVIEW.md` and `QA.md` for specific results, final-patch scope and limits. Arcade reach, simple scenery/props, crowd autonomy and motion polish remain below finished indie standards.

## Strict-review rework

- Reviewed the live game against a finished indie action standard, ranking all fifteen requested areas in `STRICT-REVIEW.md`, before changing it.
- Reworked the opening, stamina-limited three-strike combat, shield openings, distinct opponent roles, readable committed attacks and late-dodge counterplay. Attacks and sprinting preserve dodge energy; release/repositioning recovers the meter faster.
- Replaced passive vehicle contact damage with a warned, locked-direction ram and recovery. A cooled escape ends the patrol. Tuned the compact van's steering, braking, speed and wall impacts after failed normal-time and touch drives.
- Changed gathering stages into securing space, held aid restoration and escorting two visible readers. Added held courier copying with damage interruption, arrival/stage checkpoints and useful one-use community support.
- Corrected the underground CP station and separated pedestrian/vehicle routing. Adapted display footprints for usable street clearance, retaining original source geometry and honest geographic limits.
- Added textured façade geometry, roofs/tanks, street signs, services, original autorickshaws, textured parks, 100 instanced street trees, animated ambient participants, textured rigged police, warmer lighting and camera cutaways. Menu/ending paintings are explicitly illustrations, not gameplay renders.
- Added original synthesized music and movement/impact feedback, compact HUD and accessible close/overview view.
- Actual failures led to further revisions, not just a version bump. See `QA.md` for version-specific replay scope. Realism, autonomous city life and independent player enjoyment still fall short; the art work is delivered now rather than postponed.

## v0.14: City of Accounts

- Replaced the 112-unit fictional grid with connected OSM-derived central Delhi, including CP, Jantar Mantar and India Gate. Retained raw data, extraction script, database attribution and licence.
- Added a mission board, rescue/courier/three-point gathering operations, an unlocked charter run, continuing network cycles, medals/bests, support credits, optional upgrades and export/restore save codes.
- Added road-network guidance to the local radar and a labelled full map. Street-area mission anchors are approximate; event encounters and relays are fictional.
- Preserved mobile dual-stick combat, vehicle boarding/exiting, directional driving, braking, line-of-sight search, damage and checkpoints.
- Normal-time play caught unrescued Kabir being moved when exiting the van; fixed both exit and retry. Retry now restores a nearby pursuit instead of emptying the chase.
- Touch review caught a stationary held-Strike rally completion; changed it to three separate eight-second gathering points that require repositioning.
- Patch v0.14.4 fixes a cleared return roadblock recreating itself on reboarding, and preserves its activation state through retry. This was found during the public charter test, not only isolated rules.
- Repeats change guard approaches; one return variant adds a roadblock. Later cycles slightly increase guard speed, capped at tier three.
- Gameplay is the priority. Character/facade/combat-animation realism, physical phones, Safari and independent enjoyment remain unfinished. Earlier v0.13 results below are historical, not relabelled as new signoff.

## v0.13: Play review

- Played the previous build in normal browser time, including a held-strike/dodge attempt and a rescue/boarding/fast-turn/brake attempt; documented observations in `PLAYER-REVIEW.md`.
- Unified repeat-strike input across held Space, mouse, right stick and Strike button. Cleared held inputs on Pause/help/retry/restart and guarded zero-distance aim.
- Stopped opponents at readable melee distance and added separation, compact condition segments, interruption colour, distinct lead/companion markers and Dodge particles.
- Added corner-speed assistance, tighter arcade turning and shorter released-input coasting.
- Brought the initial patrol to the central road and restored patrol/last-seen context at earned vehicle checkpoints.
- Separated visible vehicle pursuit from slower last-seen searching after the live escape review; reaching the safe house while visible still cannot win.
- Marked active obstructions and the unsecured recording on the minimap; destination text now names the objective.
- Retained the same story and original/licensed art. This is a playability pass, not a photorealistic-art or physical-device signoff.

## v0.12: Breakout

Patch v0.12.1 fixes a roadblock respawning on reboarding and stores/restores the actual boarding position and heading. It also resets input aim on a fresh run. These are tested gameplay fixes, not new character art.

Patch v0.12.2 separates the base pavement and intersecting road planes vertically to remove coplanar depth flicker found in public phone captures. The tested v0.12.1 rules are unchanged.

- Replaced the default task-led campaign with one top-down 3D action mission. The previous game remains at `chapter-v11.html`.
- Added directional close-range strikes, opponent attack interruption, knockback, condition and a stamina-based short dodge.
- Added a four-hit breakable line and a clear-or-draw-away rescue, companion following and joint boarding requirement.
- Added an original drivable volunteer van, pursuing patrol vehicle, condition loss, braking/coasting, enter/exit and boarding retry.
- Added connected side streets, building occlusion, last-seen search, heat decay, a western roadblock and an unseen/slow parked finish.
- Added dual-stick phone input, repeat-strike aiming, contextual Action, desktop keyboard/mouse input, minimap and in-game guide.
- Reused licensed art; tightened camera, roof detail, shadows and HUD contrast after actual-render review. This is not a completed realism pass, physical-phone signoff or production release.

## v0.11: Learn the Route

- Added an optional seven-action safe practice lesson and a scrollable winning guide, accessible from the title and Pause.
- Added two licensed generic adult avatar bases to the previous two, with kurta/long-tunic clothing alongside casual outfits. Adapted the kurta avatar with original short dark hair, and adjusted the earlier woman's hair material. The named cast is fictionally Indian; costumes do not establish nationality.
- Extracted the running rules into reusable `sprint-controller.js`, integrated with both desktop and mobile inputs.
- Added a grid-route fallback for pursuers blocked by world geometry.
- Kept the electoral-resistance story and three action chapters. No new claim of production-quality graphics, exact maps or verified phone performance.

## v0.10: Signal Run

- Replaced compulsory voter-case quizzes with automatic packet pickups and direct help interactions. Optional cases remain in the journal.
- Added supplies, packet-chain scoring, jumpable crates, a forward Dodge and an energy/cooldown-based Rally.
- Replaced unavoidable close-contact damage with signalled officer wind-ups. Rally briefly displaces and stuns pursuers; no injury score is awarded.
- Added a visible gathering zone for the final hold objective. All three chapters now complete without a mandatory charter panel.
- Retained the movement's broader accountability, contested-SIR and eligible-voter inclusion demands in the ending.
- Reused the existing bounded worlds and character assets. This is not a map expansion, photorealistic art overhaul or verified physical-phone release.

## v0.9: Every Eligible Voter

- Refocused on vote chori, CEC Gyanesh Kumar, SIR and inclusion of eligible voters beyond a leadership change. Sourced primary documents and disputed-claim distinctions are in [CURRENT-MOVEMENT.md](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/CURRENT-MOVEMENT.md).
- Replaced the current historical Jamia/Shaheen Bagh chapters with invented Bihar and West Bengal help camps, openly reusing authored geometry rather than claiming real regional maps.
- Added nine fictional consented case decisions with before/current records and resident accounts: inclusion, valid-entry/duplicate distinction, and pending-appeal support. All three referrals are required in each chapter.
- Added paused reading, feedback/retry for incorrect responses, cancel without progress, and a final three-commitment reform charter that rejects resignation-only completion.
- Retained mobile exploration, action, escort, sustain, checkpoints and replay. New campaign storage separates v0.9 case-based completion from v0.8 scores.
- No actual voter records, submissions, policy changes or past-election reversals. This reuses existing art and is not a photorealistic production or physical-device certification.

## v0.8: A City of Accounts

- Defined a mobile-first third-person resistance adventure with three distinct mission structures, rather than expanding the runner or adding more dialogue errands. Research and implementation decisions are in [DESIGN-REBUILD.md](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/DESIGN-REBUILD.md).
- Added a City map, Jantar Mantar breakthrough, Jamia-inspired two-person campus escort, and Shaheen Bagh-inspired community-support mission. Locations are separate authored approximations, not a seamless real-world map or one verified historical event.
- Added obstacle-aware companion paths and group-arrival requirements. Campus completion requires both companions at the gate and destination; the community mission requires three stations and an uncontested sustain period.
- Added completed-mission persistence, best-score/help records, replay, next district and one health recovery from a network strengthened in another completed district. In-progress action checkpoints remain in-session only.
- Simplified phone play: outer joystick travel runs; camera drag, Jump, Dodge and a contextual Action remain under two thumbs. Secondary notes live behind the map; objective direction/distance and mission review reduce ambiguity.
- Added knit palette variants using the existing licensed textures, revised crowd clustering, reset animation poses, shared material-instance correction, garden access, landmark/gate collision and an occlusion-aware camera. No new realistic faces, bespoke garments or authored jump/dodge clips are claimed.
- Retained the slower branching story and archived runner. Physical-device performance, Safari support, novice enjoyment and the requested photorealistic production standard remain unverified or unfinished.

## v0.7: Break Through

v0.7.1 adds visible movement toward shelter after optional rescues, with reset on a new run. A tested arrival-threshold correction prevents the evacuee from stopping before the courtyard turn.

- Made the default Play button start an action chapter rather than a chain of dialogue errands. The older branching story is available separately.
- Added immediate police pursuit, five health pips, contact damage, telegraphed red pressure zones, a short dodge with cooldown, stamina-driven sprinting and jump-clearable fallen barriers.
- Added optional live hold-to-help rescues, a live hold-to-break barricade interaction, recorder recovery, companion movement and a playable handoff without dialogue interruptions.
- Added score, time and three ending ranks, with replay incentives for helping more people and finishing with health intact.
- Passed action completion, capture/retry, stamina and mobile touch checks; retained both slower-story endings. Corrected a contact-range gap found by the failure test, and cramped mobile Dodge text found in visual review.
- Retains v0.6 art. The dodge uses acceleration/invulnerability, not a new authored roll animation. Pressure zones and destruction are abstract game systems, not physical police/crowd simulations or real-world instructions.
- Action checkpoints are in-session only. Physical-phone performance and human enjoyment are not verified.

## v0.6: The Account

- Added named fictional characters and a personal story motive: Aman is looking for Kabir.
- Replaced several dialogue-only confirmations with water collection/delivery and recorder recovery.
- Added a short resistance-rhythm interaction, two actual handoff destinations/endings, optional story fragments and a following companion whose help changes the ending.
- Added objective distance/inventory feedback, a reviewable journal, adjustable story assist and browser-local checkpoint continuation.
- Replaced the student and non-police figures with textured MIT-licensed Rocketbox avatars and compatible idle/walk/run clips retargeted through Blender. Clip playback follows actual travel speed.
- Added original synthesised footsteps and action tones. No promotional film stands in for game graphics.
- Still a development build, not final photorealism or proof of enjoyment. Physical-device testing and novice human playtests remain outstanding.

## v0.5: The Street Is Still Ours

- Replaced the default runner with an explorable third-person street and gathering courtyard. Preserved the previous runner at `runner.html`.
- Added camera-relative walking/running/jumping, drag-to-orbit camera, mobile joystick and contextual action controls.
- Added five linked story encounters, an optional protest event, fictional barricade collapse, police pursuit, capture/retry and a chapter ending.
- Authored separate rigged clothing meshes in Blender; added material-aware tree LODs, scanned paving/grass, HDR lighting and high-quality ambient occlusion.
- Reviewed actual engine captures and revised foliage reduction, monument material, costume coverage, prop readability and crowd placement.
- Passed deterministic desktop story and touch-control checks. Physical phone/Safari testing remains outstanding.
- Remains a development build. Not photorealistic, not an exact map, not a simulated protest crowd, and not production-ready.

## v0.4: Real-time Resistance

- Replaced the default AI-video opening with an actual game-rendered 3D opening and two player-triggered story inputs.
- Corrected v0.3's description: the previous opening was AI-generated video, not conventional CGI.
- Imported a credited CC0 skeletal human mesh for the protagonist, companion and pursuing officers. Added original colours, fitted-surface offsets, accessories and bone-driven motion.
- Rebuilt bus body proportions with rounded panels, interior seats, wheel rims, mirrors, wipers, grille and lights.
- Replaced spherical tree canopies with alpha-tested foliage cards.
- Added scanned CC0 asphalt diffuse/normal/roughness maps, procedural surface normals for other props, environment reflection lighting, stronger warm/cool contrast, a sky gradient and contact shadows.
- Retained mobile controls, mission objectives, pursuit risk, checkpoints and primitive fallback characters if the human asset is unavailable.
- Still not photorealistic or production-ready. Crowds, clothing, facial performance and exact route geometry remain unfinished.

## v0.3: Break Free

- Added an opening cinematic player with mobile inline playback, skip, pause handling and a five-second in-engine fallback.
- Added three animated fictional police pursuers to actual gameplay, a state-pursuit HUD and recapture failure.
- Collisions now close the pursuit gap. Clean running slowly increases separation; assist mode reduces the penalty.
- Revised the opening and ending around resistance to a fictional oppressive state crackdown.
- Preserved the 900-metre mission, mobile touch controls, evidence objective and checkpoint retry.
- Runtime art is still stylised procedural 3D. A rendered opening is not evidence of photorealistic gameplay.

## v0.2: Delhi reference pass

October 4, 2026. The playable route now uses Patel Chowk, Sansad Marg, and Jantar Mantar Road stage labels, with a clear “compressed route” disclosure.

- Replaced the generic market architecture with a tree-lined public verge, boundary fence, and pale colonnaded civic facades.
- Added yellow metal Delhi Police-style barricades with red labelling, using public references.
- Replaced the generic damaged bus with an original guarded-window, dark-body transport-bus model; added branding is explicitly illustrative.
- Added 24 fictional protesters with original placards and a scaled observatory-inspired landmark behind the park fence.
- Added road and metro wayfinding. These are original signs, not reproductions of actual signs.
- Kept existing mobile controls, gameplay objectives, settings, checkpoint logic, and fictional story.

The sourced elements and limits are detailed in `DELHI-REFERENCES.md`. This is not photogrammetry, exact GPS geometry, real protest footage, a verified reconstruction, or a production-ready art release.

## v0.1: The witness route

First playable browser slice, October 4, 2026. This replaces the public landing page with the game; the research dossier remains at `concept.html`.

### Included

- Original 3D street with shopfronts, balconies, overhead cables, lamps, trees, bystanders, and a damaged bus prop.
- Original articulated courier with running, jumping, and sliding poses.
- 900-metre automatic runner, three lanes, obstacle collisions and evidence collection.
- Two story interactions: a fictional barrier collapse and a journalist's evidence handoff.
- Start, pause/resume, failure, checkpoint retry, full restart, and completion.
- Keyboard, large phone buttons, and swipe input.
- Auto/low/high graphics, reduced-motion option, assist mode, and original synthesised sound.
- Research links, asset provenance, and QA hooks (`render_game_to_text`, `advanceTime`).

### Not yet included

- Photorealistic or AAA-quality characters, scanned environment assets, motion capture, voice acting, or production-quality animation.
- Open-world exploration, a controllable combat system, player-driven sabotage, companion AI, branching streets, multiple missions, or persistent saves.
- Offline installation, a service worker, native Android/iOS builds, or guaranteed performance on every phone.
- Verified reconstructions of real events. All in-game characters and story scenes are fictional.

The “solidarity” counter is currently an abstraction for evidence collection and story handoffs, not a simulated companion system. Graphics quality settings trade pixel density and dynamic shadows for performance; no physical-device frame-rate target is certified yet.

## Distribution

GitHub Pages serves the checked-in `docs/` directory. Three.js is vendored locally so the engine does not depend on an external script CDN; fonts have a system fallback. A recent WebGL 2 browser and graphics acceleration are required.
