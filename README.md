# DISSENT: At the Line

A rebuilt, short 3D rescue-and-escape encounter for phone and desktop. The default game no longer starts the three-operation city campaign: it follows one connected fictional scene from a scattered gathering, through Kabir's rescue and a police line, to a volunteer-van escape.

[Play the public encounter](https://nawaaaaaaaar.github.io/dissent-last-ballot/) and choose **PLAY · At the line**. The scene behind the menu is actual game rendering, not an illustrated quality target.

## What game this is

- **Get close:** Move, make space, use short combos and dodge committed attacks. A third strike pushes and opens a shield; attacks preserve enough stamina to dodge.
- **Rescue:** Find Kabir beside the transport bus and hold the contextual action. He carries the recording; the objective becomes leaving together.
- **Choose an approach:** Move the sight-blocking screen, open the middle barricade, or vault the low side rail. Kabir follows through the opened middle or uses the side crossing.
- **Escape:** Board only when Kabir is close enough. Drive left of the roadworks to the community shelter; collisions and a visible right-lane patrol create escape pressure. Vehicle failure has an escape checkpoint.

There are no added districts, currencies, upgrades or farming counters in this encounter. It is a compact action-scene rebuild, not a completed campaign or proof of retention.

## Controls

Phone: left joystick moves/drives; pushing fully runs. Hold Strike for a short combo, Dodge to evade, and the contextual button to rescue, move a screen, vault or board. Dodge becomes Brake in the van. Desktop: WASD/arrows, Shift to run, Space to strike, Q to dodge/brake, E to act and P/Escape to pause.

Read [the current winning guide](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/HOW-TO-WIN.md) and [the rebuild review](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/AT-THE-LINE-REVIEW.md). Pause and help freeze the encounter; explicit sound-off is retained across replay. Graphics can be chosen before starting.

## Geography and theme

The compact scene is authored from Jantar Mantar-inspired street vocabulary, not extracted survey geometry. Bus, fences, aid tent, observatory approximation and Hindi protest placards ground it in the Delhi story without claiming an exact route or reconstruction of an actual custody incident. All characters, clashes and outcomes are fictional; the [separate movement research](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/CURRENT-MOVEMENT.md) distinguishes reporting, allegations and institutional responses.

The previous OSM-derived connected-city prototype remains separately playable at [the campaign archive](https://nawaaaaaaaar.github.io/dissent-last-ballot/campaign-v17.html), documented in README-v17.md and HOW-TO-WIN-v17.md. Its geography and reward systems are not secretly claimed for the new scene.

## Build and verify

Run `npm ci`, then `npm start`. `npm test` runs sixteen isolated checks in `line-unit.mjs`; `test:city` retains the historical city checks. Current source is `docs/line-rules.js`, `line-scene.js`, `line-game.js`, `line.css` and `index.html`. Existing character meshes, locomotion, materials and licences are retained; original authored environment and vehicle geometry are editable JS.

`render_game_to_text()` exposes read-only observations for QA; `advanceTime(ms)` supports deterministic tests, not device-performance claims. Actual public replay uses ordinary browser time and real input, separately from staged tests. [QA.md](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/QA.md) identifies exact versions, assistance and failures.

This rebuild is not finished-indie or final high-graphics approval. Reused faces/rigs, contact/fall choreography, scenery repetition, short encounter length and limited opponent variation remain substantial gaps. Physical phones, Safari and independent player enjoyment are unverified.
