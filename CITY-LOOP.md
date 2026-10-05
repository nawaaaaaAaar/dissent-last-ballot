# DISSENT: a city and a reason to return

Current design supersedes the original three waiting circles: the gathering now requires securing its space, holding an aid action, then escorting two readers to the assembly. Courier copying is held and interruptible. Combat, driving, pursuit, art and city interpretation have been substantially reworked after play review; see [the strict review](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/STRICT-REVIEW.md) and [current QA](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/QA.md). The historical plan below explains the network loop, not final-art approval or proof of retention.

v0.14 is a gameplay-first iteration. The goal is a short-session resistance action adventure that remains playable after one win, not a mission checklist disguised as a city. The substantial character, animation and environment-art pass is deliberately deferred.

## The design decision

The loop is **choose an operation → travel through the city → face its particular challenge → escape or secure the gathering → earn support → choose another operation**. The world and earned network progress remain between jobs. Free roam is available without compulsory dialogue or voter-file quizzes.

- **Rescue:** Bring Kabir out of the Jantar Mantar encounter. A nearby guard can be interrupted, defeated in fictional arcade melee, or drawn away. The barricade is breakable but not a compulsory destruction objective. Boarding requires Kabir to catch up.
- **Courier:** Retrieve a dispatch on foot at Tolstoy Marg, then carry it to the fictional India Gate relay. Route choice, braking and losing pursuit are the challenge. A later charter dispatch reverses the journey toward the assembly.
- **Gathering defence:** Regroup, support the aid point, then protect the reading circle. Each separate location needs eight seconds on foot inside its zone. The marker moves between stages; standing at the first point and holding Strike cannot complete the whole mission.
- **Progression:** Complete the three distinct operations to unlock “Replacement is not repair.” Complete that dispatch to begin another network cycle. Repeats vary guard approaches; one approach variant places a roadblock on the return route. Later cycles slightly increase guard speed, within a capped tier.
- **Mastery:** Medals reward health and avoiding crashes. Best scores survive between operations. Support credits purchase strike tempo, reinforced vehicle condition or running endurance. These are optional advantages, not payment gates.
- **Continuity:** Export and restore a save code for earned network progress. This does not preserve the active mission or checkpoint. There are no online accounts, multiplayer, public leaderboards or browser-storage requirements.

This is a modest set of authored systems, not a claim of GTA-scale simulation, unlimited procedural stories or a sophisticated AI Director.

## Why these changes, rather than more objects

Michael Booth’s Valve presentation describes “structured unpredictability” and alternating intensity peaks with recovery periods, rather than constant combat, as replayability and pacing tools ([Replayable Cooperative Game Design: Left 4 Dead](https://cdn.akamai.steamstatic.com/apps/valve/2009/GDC2009_ReplayableCooperativeGameDesign_Left4Dead.pdf)). Our application is deliberately smaller: varied guard approaches, distinct challenges, travel/recovery between encounters and the choice of another operation.

The Blood Moon design article distinguishes meaningful variety and multiple valid approaches from grind, false choice and artificial length ([Replayability in Game Design](https://www.bloodmooninteractive.com/articles/replayability.html)). Here, rescue, courier driving and gathering defence use different success conditions; scores and upgrades complement those conditions rather than replace them.

These are design hypotheses, not proof that ordinary players love this build. Normal-time browser play can expose defects; an independent first-time-player study is still needed to assess enjoyment, confusion, difficulty and whether players voluntarily start a second operation.

## What “actual Delhi map” means here

The street geometry and building footprints are extracted from OpenStreetMap data for a central-Delhi bounding box: longitude 77.212–77.231, latitude 28.611–28.635. The original data is retained in `data/delhi-osm.xml`, the mechanical extraction in `tools/build-delhi-map.py`, and the runtime database in `docs/delhi-map.json`. Attribution and the ODbL data-license notice appear in game and in the repository, as required by [OpenStreetMap’s copyright and licence guidance](https://www.openstreetmap.org/copyright/en-EN).

The runtime contains 1,269 selected road ways and 786 building footprints. These are map features, not 1,269 named streets or 786 authored detailed interiors. The original observatory, arch and CP-column models are illustrative additions; their art quality is not evidence of an exact monument reconstruction.

The landmark coordinates preserve the real relative positions: CP north of Jantar Mantar; India Gate farther southeast ([Connaught Place coordinates](https://en.wikipedia.org/wiki/Connaught_Place,_New_Delhi), [Jantar Mantar coordinates](https://en.wikipedia.org/wiki/Jantar_Mantar,_New_Delhi), [India Gate coordinates](https://en.wikipedia.org/wiki/India_Gate)). Sansad and Tolstoy mission anchors are approximate street-area anchors snapped to the extracted road network, not exact incident coordinates.

Horizontal distances use a uniform scale of 0.14 game units per real metre. Roads are widened for arcade movement, nearby divided lanes are linked for game navigation, traffic restrictions and one-way rules are not simulated, and bridges/underpasses are flattened. Building heights and monument art are approximate. The area is connected central Delhi, not the whole city, a survey-grade digital twin or a real navigation tool.

## Where the recent protest reference comes from

The Tribune’s October 3 report describes the October 2 planned Jantar Mantar protest, barricaded approaches from Sansad Marg and the Kerala House side, and protest-related accounts around Tolstoy Marg and Ashoka Road ([The Tribune’s dated reporting](https://www.tribuneindia.com/news/delhi/over-1k-detained-in-delhi-as-protesters-demand-cecs-exit/amp)). India Today independently places the October 2 protest against Gyanesh Kumar and alleged SIR irregularities at Jantar Mantar ([India Today’s October 2 report](https://www.indiatoday.in/amp/india/story/delhi-protest-gyanesh-kumar-voter-roll-revision-1100-detained-gandhi-jayanti-3008259-2026-10-02)).

That evidence does not establish a current vote-chori protest at India Gate. The CP hub and India Gate relay are fictional story locations; the reports of transport/communications restrictions around CP are not turned into a claim of a protest at every landmark. This is a dated reference layer, not a live protest tracker.

## Resistance carried by the story

Aman is building a network that keeps people, testimony and public participation together. Kabir’s rescue preserves a witness; Sana’s dispatch preserves an account; the gathering chapter protects collective space. The unlocked charter rejects a resignation-only resolution and carries the broader demand for lawful leadership accountability, ending contested SIR and transparent support for inclusion and review of every eligible voter.

The three demands remain the movement’s narrative position, not a factual declaration that the CEC resigned, SIR ended, voters were registered, or past elections were invalidated. The sourced, disputed-claim distinctions remain in [the current-movement brief](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/CURRENT-MOVEMENT.md). Characters, records, clashes, relays and outcomes are fictional; there are no real-person combat targets, personal voter records or real-world sabotage instructions.

## Review gate and next art pass

The build is judged through actual input and actual rendering, not promotional generated images. The review caught an unrescued witness moving on vehicle exit and a rally that could be completed from one stationary position; both were revised.

The next visual pass needs authored Indian-context character clothing and faces, proper combat/interaction animation, faithful landmark models, street frontage, signage, vegetation and crowd behaviour. It should improve this playable world rather than conceal shortcomings in a cinematic. Physical-phone performance, Safari and independent enjoyment testing are still required.
