# DISSENT release notes

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
