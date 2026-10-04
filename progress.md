Original prompt: Build DISSENT: The Last Ballot as a playable 3D student-resistance runner and make it playable on mobile phones. Push work to GitHub and the public link.

Latest revision request: Use actual Delhi Police barricades, protest context, Delhi route, buses, and related recognisable setting details.

## Delhi revision

- v0.2 uses sourced public references for Patel Chowk / Sansad Marg / Jantar Mantar Road, yellow red-lettered metal barricades, and guarded-window transport-bus appearance.
- Added fictional protest participants, original placards and wayfinding, a park boundary and civic facades, and a scaled observatory silhouette.
- Distinguish public reference details from illustrative branding, compressed distances, fiction, and exact scans.
- Full regression and mobile/visual QA run before GitHub/public publishing.

## Current build plan

- Browser-first vertical slice with an auto-runner and a fictional barrier-collapse interaction.
- Touch buttons and swipes in portrait and landscape; keyboard controls on desktop.
- One full mission with evidence pickups, optional handoff, condition, failure, retry checkpoint, pause and completion.
- Procedural street geometry and material texture; transparent prototype status, no photorealism claim.

## Implementation and checks

- v0.1 complete mission implemented in `docs/`; original concept preserved separately.
- Full mission, condition/failure, checkpoints, restart, keyboard, settings, and mobile touch/swipe checks executed.
- Visually inspected desktop and mobile screenshots; fixed clipped portrait framing.
- Fixed obstacle contact being evaluated repeatedly during a jump; supplied-client regression confirms first barrier clears with condition 100.
- Added deterministic stepping that suppresses the concurrent real-time loop during QA.
- Physical phone testing and production-grade realism remain open; do not represent emulator checks as physical-device certification.

## QA inventory

- Loading -> start -> tutorial -> running; keyboard arrows/A/D, jump/up/space, slide/down/S.
- Touch buttons and real touch swipe; no unintended scrolling, zooming, clipping, or double action.
- Collisions reduce condition; repeated collisions -> failure -> checkpoint retry or restart.
- Pause freezes gameplay; resume works; mute and graphics settings toggle in both directions.
- Evidence pickup and interaction update objective; barrier interaction has no real sabotage instructions.
- Full mission can complete using normal controls; final UI has replay and research links.
- Resize, portrait/landscape, hidden tab automatic pause, reduced motion, WebGL error state.
- Observe actual desktop/mobile-emulated screenshots. Do not claim testing on physical iOS/Android hardware.
- Test with the supplied game client and persistent Playwright. Record findings and limits.
