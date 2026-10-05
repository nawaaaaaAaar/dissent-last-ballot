# DISSENT: stricter play review and rework

## Standard and baseline

The standard is a finished, engaging indie action game: readable space, expressive movement, tactical enemies, useful rewards, purposeful exploration and coherent art. Passing a mission or adding another system is not evidence that the game meets it.

I opened the public v0.14.3 build fresh and played in ordinary browser time, without `advanceTime`, game-state edits or an earned-progress import. The session included an exploratory CP drive that lost 24 vehicle condition to collisions, attempts to navigate on foot, an arrival at Jantar Mantar, combat, capture, retry, a second combat attempt, rescue, boarding with Kabir and a return to CP. I used manually selected road waypoints for travel after the unsuccessful exploration, not a prescribed mission-winning script. The return reached the destination with pursuit still cooling; it is not recorded as a completed baseline win. Tool-call exposure affects combat timing, so this is an agent-led play review, not an independent human enjoyment study.

The player and van disappeared behind tall, largely blank buildings. Moving across CP was confusing and obstructed. Inspection after play identified the specific Central Park obstruction: an underground metro station, OSM way `1158884368`, tagged `building:levels=0`, `building:levels:underground=2`, `layer=-2`, had been extruded above ground. Accurate coordinates did not make that interpretation correct.

The first combat attempt missed and ended in capture; review time exposed the character to attacks, which limits conclusions about difficulty. A later deliberate held-Strike attempt disabled three opponents, secured Kabir and kept health at six. That second attempt is better evidence that the combat offered too little tactical demand once aim assist worked. Retry restored the CP boarding checkpoint rather than the arrival, making failure repeat the empty approach.

## Ranked weaknesses before the rework

Rank indicates impact on this game, not a measured universal score.

| Rank | Area | Weakness and consequence |
|---|---|---|
| 1 | Controls, feedback and spatial readability | Buildings concealed actors and vehicles; aim state was easily unclear; collisions had weak feedback. Players could not reliably understand their own action. |
| 2 | Core loop and moment-to-moment fun | Too much empty travel before the first meaningful choice; held strikes were often sufficient. Winning conditions existed, but their presence was not a fun loop. |
| 3 | Graphics and environment detail | Blank extruded blocks, a washed-out palette, oversized generic HUD panels and simplified police broke the finished-game impression. |
| 4 | Movement, combat and driving | Turns punished exploratory input; repetitive strikes lacked a legible sequence and impact; failures could repeat long travel. |
| 5 | Enemy and NPC behaviour | Most opponents converged in similar ways; some became obstructed; the crowd was almost entirely static. |
| 6 | World density and exploration | The larger map increased emptiness as much as scale. Most streets had no people, services or memorable visual cues. |
| 7 | Delhi map usefulness and place | CP's underground-station error, tiny colonnade approximation, generic façades and sparse tree placement undermined the actual-geography promise. |
| 8 | Challenge and difficulty curve | The opening demanded navigation before teaching combat; stationary attack success contrasted with punitive collision/retry friction. |
| 9 | Mission variety and structure | The rally used three variations of waiting in a zone. Deliveries depended heavily on the same collection/drive/heat sequence. |
| 10 | UI/UX and onboarding | Large panels competed with the world; the start was a board-the-van instruction rather than an engaging, guided opening. |
| 11 | Pacing and narrative/context | The political context concentrated in explanatory text and endings. Characters had little presence during the actual encounter. |
| 12 | Progression, rewards and replayability | Medals and three upgrades created bookkeeping progression, but did not by themselves justify returning. The encounters needed more mastery and situation variety. |
| 13 | Sound and music | Mostly tones and an engine oscillator; limited place ambience, movement sound or musical pacing. |
| 14 | Performance, bugs and polish | Browser rendering was usable in this session, but load time, occlusion, collision interpretation and checkpoint friction were major polish failures. Physical devices remained untested. |
| 15 | Scale | Raw map size was not the primary problem. More kilometres without density or better interactions would make the problem worse. |

## Rework priorities

- **Readable city first:** Correct the underground footprint, add pedestrian routes and a camera cutaway, and make navigation visible in the world rather than only on a tiny radar.
- **A better encounter:** Put the opening near the first action, replace repetitive instant strikes with an animated stamina-limited sequence, distinguish opponent roles and limit simultaneous committed attacks.
- **Different mission demands:** Separate copying under pressure, securing a gathering, aid support and escort instead of relying on repeated idle timers.
- **Grounded visual direction:** Warm stone, brick and plaster façades, dark window recesses, roofs, paving, tree-lined streets, service spaces and clearer character silhouettes. Generated menu art is labelled illustration and never used as evidence of playable graphics.
- **Recovery and purpose:** Arrival checkpoints, useful voluntary support stops, concise character context and rewards tied to mastery rather than destruction totals.

The positioning/crowd-control emphasis is a design reference, not a claim to reproduce Sifu's systems or quality. Sloclap describes combat as a back-and-forth that asks players to react and use positioning and crowd control ([PlayStation developer article](https://blog.playstation.com/2021/11/18/how-sifus-kung-fu-combat-works/)).

## Replay and remaining weaknesses

Implementation and replay observations will be appended here only after the revised build is played. Unit tests, controlled simulations, normal-time exploratory play and public deployment verification will remain distinct.
