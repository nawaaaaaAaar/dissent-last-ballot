# DISSENT release notes

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
