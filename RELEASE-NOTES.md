# DISSENT v0.1: The witness route

First playable browser slice, October 4, 2026. This replaces the public landing page with the game; the research dossier remains at `concept.html`.

## Included

- Original 3D street with shopfronts, balconies, overhead cables, lamps, trees, bystanders, and a damaged bus prop.
- Original articulated courier with running, jumping, and sliding poses.
- 900-metre automatic runner, three lanes, obstacle collisions and evidence collection.
- Two story interactions: a fictional barrier collapse and a journalist's evidence handoff.
- Start, pause/resume, failure, checkpoint retry, full restart, and completion.
- Keyboard, large phone buttons, and swipe input.
- Auto/low/high graphics, reduced-motion option, assist mode, and original synthesised sound.
- Research links, asset provenance, and QA hooks (`render_game_to_text`, `advanceTime`).

## Not yet included

- Photorealistic or AAA-quality characters, scanned environment assets, motion capture, voice acting, or production-quality animation.
- Open-world exploration, a controllable combat system, player-driven sabotage, companion AI, branching streets, multiple missions, or persistent saves.
- Offline installation, a service worker, native Android/iOS builds, or guaranteed performance on every phone.
- Verified reconstructions of real events. All in-game characters and story scenes are fictional.

The “solidarity” counter is currently an abstraction for evidence collection and story handoffs, not a simulated companion system. Graphics quality settings trade pixel density and dynamic shadows for performance; no physical-device frame-rate target is certified yet.

## Distribution

GitHub Pages serves the checked-in `docs/` directory. Three.js is vendored locally so the engine does not depend on an external script CDN; fonts have a system fallback. A recent WebGL 2 browser and graphics acceleration are required.
