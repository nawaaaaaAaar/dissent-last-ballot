# DISSENT: At the Line rebuild

## What changed in direction

The owner rejected the physical-readability pass as very bad. The response is a new default encounter and its own rules/rendering/UI, not another patch to the city campaign. The earlier city remains separately available; neither its map scale nor its rewards are claimed as properties of this rebuild.

The playable proposition is now direct: reach a friend, create room to free him, cross a line together, then drive him and the recording to shelter. A middle breakthrough and a low side crossing change how the same encounter unfolds. There is no mission-board setup, score ladder, upgrade purchase or long empty opening drive.

The reference principle is positioning, defensive timing and environmental options, not copying commercial assets. Sifu's developers describe creating space, counterattack opportunities and environmental approaches in [their combat explanation](https://blog.playstation.com/2021/11/18/how-sifus-kung-fu-combat-works/). Our implementation is a much simpler arcade encounter; this reference is not evidence of equivalent depth, choreography or quality.

## Before and first rebuild play

The current public v0.17.2 was revisited before replacing the entry point: movement, held strikes, dodge and framing were observed in normal time. The baseline capture is `qa/rebuild-before.jpg`. This short revisit was not a full baseline campaign win; prior completed campaigns remain in QA-v17.md.

The rejected experience put a small actor inside broad adapted footprints, repeated objectives and a large HUD. Its connected geography was not a substitute for a directed action scene. The rebuild removes the extensive city/task structure from the default experience rather than preserving it as the assumed foundation.

First ordinary-time rebuilt play exposed more failures: a table collider had no matching visible table, default dodge could advance toward the opponent, and Kabir oscillated at the side rail instead of crossing. Repeated held strikes could also exhaust escape energy. That first attempt rescued Kabir but stalled at the crossing; it was not counted as a completed playthrough.

Those observations led to another revision: a visible aid table, backward default dodge, an explicit companion crossing path/animation, bounded brace recovery, reserved dodge energy, condition markers and properly timed visible right-lane patrol pressure.

## What is rebuilt

- **Encounter space:** One authored street, gathering/aid area, guarded friend beside a transport, movable cloth screen, middle line, side crossing, waiting van, roadworks and shelter. Original fence/curb/drain/sign/bench/vehicle geometry, photographic ground materials, HDR environment, shadowed lighting and the observatory approximation replace the broad city footprints.
- **Combat flow:** Short phase-timed combos, a third-hit push, a shield opening, late-dodge counter opportunity, limited concurrent attackers, condition markers, recoil/impact particles and differentiated Foley. Auto-facing helps mobile input; positioning still matters. Actual hand reach uses the existing bounded solve rather than claiming literal fist collision.
- **Rescue and movement:** A held release changes the story beat. Kabir follows, briefly braces under committed threats and uses the opened middle or the explicit side crossing. Together-only boarding makes the relationship consequential.
- **Escape:** A short physical roadwork avoidance problem, visible patrol approach, responsive directional steering and brake, vehicle condition and escape checkpoint. No hidden city-search timer or extra currency.
- **Presentation:** A closer perspective camera, smaller HUD, actual rendered menu background, matching contextual controls, three generated Hindi character lines with English text, original synthesized engine/siren and existing instrumental/Foley.

## Revised ordinary-time play observations

| Replay | Observed outcome |
| --- | --- |
| Public side route, final gameplay rules at `2987dfd` | Rescued Kabir, vaulted the side rail, watched him cross, boarded together and reached shelter. Health 4, van 100, middle line intact; five opponents remained standing. Active game time 36.70 seconds excludes pauses and is not an unaided human speedrun. |
| Public direct route, final environment at `897da53` | Phone-emulated simultaneous touch movement/Strike and timed Dodge cleared the first four opponents. Held touch rescue, middle breakthrough and together-only boarding completed; the final two opponents survived. Deliberately driving into the roadworks caused vehicle failure. Actual Retry the escape and a corrected left route won with restored health 6 and van 100. Active game time 64.48 seconds includes that failed drive/retry. |

The second replay proves checkpoint recovery, not a flawless first attempt. Keyboard/touch inputs were real and the game ran in ordinary browser time. Some movement used manually selected destinations; some combat used read-only enemy/warning observations to choose real touch input. No health, coordinates, outcome flags or simulation clock were injected. These are agent-assisted observations, not independent evidence that people will enjoy the game.

The story now passes through actions rather than a sequence of mission-board choices. The alternative crossing changed the companion's route and allowed surviving opponents to remain behind. However, the scene is short, and escaping can be more effective than prolonged combat; this is a design trade-off to judge, not an established retention system.

## Final verification and quality gap

Sixteen isolated rules pass. The supplied browser client was rerun and its actual-render captures inspected; it needed a longer ready-button timeout for local asset decoding. An extended software-rendered client attempt timed out, then a shorter bounded retry succeeded. Deterministic stepping is not an FPS benchmark.

The generated Hindi lines were converted from WAV data carrying an MP3 filename into real MP3 files. Audio review reproduced all three intended Hindi lines and reported no spoken direction tags, cutoffs or clipping. This is source-audio evaluation, not certification of a phone-speaker mix. These are fictional synthetic voices, not real protest recordings.

One long-lived public browser failed to load the new scene; a fresh browser rendered successfully. The cause was not established, and the failed attempt is not a stability pass. Final HUD/result, sound-intent, dialogue-trigger, portrait/landscape and reload checks are documented in QA.md.

This is not finished-indie approval. The reused face/clothing rigs still limit identity and performance; falls are procedural, foot planting and hand grips are incomplete, the environment repeats simple forms, civilian autonomy is thin and the escape is brief. The rebuild removes the rejected campaign structure, but does not demonstrate the user's final high-graphics standard or long-term replay value.

## Next highest-impact work

Keep this encounter, but make its close-range action genuinely authored: guard/impact/fall/recovery choreography, distinctive Indian character assets and reactions, and stronger transitions between evasion, rescue and escort. The largest gameplay question is whether the fight-and-rescue beat is enjoyable without controller assistance; the largest visual gap is still character performance and repeated asset detail. More city area or reward counters would not answer either question.
