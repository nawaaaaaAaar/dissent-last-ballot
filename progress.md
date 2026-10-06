Original prompt: Build DISSENT: The Last Ballot as a playable 3D student-resistance runner and make it playable on mobile phones. Push work to GitHub and the public link.

## Authored encounters request

Replayed public v0.15.13 before edits. Reworked witness cordon/community forecourt with collision/sight props, vaults, movable screens, phase-timed skeletal strikes, guard homes, regrouping and threatened companions. First iterations failed motion binding/axes, context selection, later-stage placement and parked-van clearance; revised after play. Fresh v0.16.4 completed rescue/gathering/courier/charter in ordinary time, cycle two, no runtime state injection. Final v0.16.5 adds visible-target/barrier assistance and corrected in-game guidance. Forty isolated rules pass; final touch/deployment checks in QA.md. No districts or reward counters added. See ENCOUNTER-REVIEW.md for actual observations and remaining quality gap.

## Strict review request

Gameplay and graphics are both priorities. Start with fresh normal-time public play, rank all requested weaknesses against a finished indie/action game, rework the highest-impact failures, replay end to end and revise again if the result is not materially better. Do not equate feature completion with fun or defer the art pass.

Baseline public v0.14.3 exploration, collisions, foot movement, combat failure/retry, held-strike combat, rescue and return are recorded in STRICT-REVIEW.md. Major findings: actor occlusion, wrongly above-ground underground CP station, empty approach, insufficient tactical combat, sparse streets, generic art/UI and weak audio.

QA inventory: above-ground versus underground data; pedestrian and vehicle routes; actor visibility/cutaway in CP/Jantar/India Gate; close/overview camera; new opening and contextual instruction; combo costs/contact/finisher; shield/flanker/charge tells and limited attack commitment; perfect dodge and stun; arrival/boarding retry; rally's distinct stages and escort; held courier copying and interruption; optional support stops; NPC navigation and crowd motion; streets/façades/roof/park/detail lighting; sound and music mute cycle; map and in-world guidance; controls, pause, save, upgrades and all operations; actual mobile simultaneous input and both orientations; normal-time replay, exploratory off-route drive and failure; public current-source confirmation. Independent enjoyment, physical devices and Safari remain explicit limits, not reasons to accept avoidable rendering or interaction defects.

Strict-review end-to-end signoff: thirty current rule checks pass; the final v0.15.10 rules/art completed rescue, gathering, courier and charter in normal time through actual inputs, including touch legs and a late-dodge shield opening. Results were Gold / Silver / Gold / Silver; charter advanced cycle two with the earned tempo upgrade retained. Assisted travel is disclosed. Multiple failed replays caused actual revisions to pursuit, steering, difficulty, recovery and city interpretation rather than being hidden. Spatial vegetation chunking reduces off-view work; the severe cloud FPS reading was ultimately a background-tab issue, corrected by foregrounding. A final presentation-only patch repairs retained result scroll and short-viewport layout. Realistic authored animation, autonomous city life, deeper encounters, physical devices/Safari and independent enjoyment remain open.

## v0.14 active: a connected Delhi and a repeatable game

Latest request: gameplay first, graphics next pass; make people want to return; expand to actual central Delhi including India Gate, Jantar Mantar, CP and verified recent protest approaches.

QA inventory: OSM road/footprint extraction and projected landmarks; CP-to-Jantar route in normal browser time; exit must not teleport unrescued Kabir; rescue, courier and three-wave rally through actual controls; delivery needs low heat and companion; operation win and return-to-board; three distinct jobs unlock charter, charter advances cycle; repeat approach variant; credits/upgrade purchase and retained effect; save-code export/restore and malformed input; no active-operation overwrite; pause/guide freeze; free roam/abandon; vehicle failure/checkpoint; road/building collision; actual touch movement/striking/boarding/map/selection in portrait and landscape; desktop/mobile screenshots and supplied client. Public deployment version must match final code. Physical phones, Safari, full graphics realism and independent enjoyment remain unverified.

Signoff: thirteen current unit checks pass. Normal-time preview rescue completed; touch preview courier/checkpoint and final public v0.14.3 three-zone rally completed. The final local v0.14.4 charter advanced cycle two, preserved earned upgrades and retained its cleared roadblock after reboarding. Actual final-patch simultaneous touch and both phone orientations pass input/layout checks. Raw/map data, source, guides, captures and scoped results are retained. GitHub Pages has confirmed v0.14.3; its v0.14.4 patch workflow remains queued, while the private preview and local final tests load v0.14.4. Do not claim a confirmed final-patch public deployment or physical-phone/realism/enjoyment signoff.

## v0.9 current movement request

Refocus on the current vote-chori movement, Gyanesh Kumar, SIR and inclusion of eligible voters in affected states, including after elections. Preserve mobile exploration and action; add actual record-comparison decisions and a three-part reform demand, not just slogans.

QA inventory: nine invented case referrals across three missions; wrong response stays open with feedback; leaving a case does not count; review freezes action; every mission requires all three files; companions and sustain still work; a resignation-only charter is insufficient; all three commitments complete the hypothetical finale; touch case selection and readable portrait/landscape modals; local saves use a new version key; actual public completion and supplied-client movement check before delivery. No real voter data, legal determinations or current-event outcomes are produced.

## v0.10 request: more game

Replace compulsory case panels with live action. QA: automatic packet collection and combo feedback, supplies/energy, real hurdle crossing, moving dodge, Rally energy/cooldown/enemy displacement, individual warning cues, escort group arrival, gathering-zone sustain, campaign completion without quizzes or charter checkbox gate, deliberate capture/retry retains packets, optional case review does not unlock remote live help or permit score farming, pause, touch Rally and portrait/landscape controls. Existing art remains a prototype.

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
Public v0.10 signoff: frontend 14744af completed all three chapters with actual input, nine packet pickups, zero case quizzes and no mandatory charter. Public touch Rally, walk/run, Dodge, Jump, pause, persisted progress and portrait/landscape checked. Results and actual captures in qa/v10; physical phones/Safari/enjoyment still unverified.
v0.11 active: user requested Indian cast, how-to-win tutorial and “sprinter code” or comprehensive improvement. Implemented two additional generic licensed wardrobe meshes, original cap-to-short-hair adaptation, optional seven-action practice/guide, reusable integrated sprint module, and pursuer route fallback. Full campaign and tutorial checks must pass; actual cast captures must be reviewed before final public signoff. No claim of photorealism or physical-phone testing.
v0.11 final signoff: local campaign and seven-step tutorial suites pass, including sprint unit rules and phone flows; supplied client records active movement/jump. Final public 4466ab1 / module 0.11.2 passes seven desktop practice actions, three campaign chapters and seven phone-touch practice actions, pause/guide freeze and portrait/landscape fit. Original hair material/cap UV/texture-node defects corrected through actual-render review. Public captures and JSON retain scope. Still no physical-phone/Safari, novice enjoyment or production-realism signoff.
