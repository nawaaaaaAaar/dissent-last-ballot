# DISSENT: At the Line QA

This file describes the rebuilt default encounter, not the historical city campaign. Previous evidence and limitations are retained in QA-v17.md. A passed rule or guided completion is not a claim of finished-game art, human enjoyment, retention or physical-phone performance.

## Baseline and revisions

Public v0.17.2 was revisited through actual movement, held strikes, dodge and framing before the new root replaced it. This was a short exploratory revisit, not a new full baseline campaign win. The first rebuilt public attempt at `38bb056` rescued Kabir but exposed his stalled side crossing, backward/default dodge problems, an invisible table collider and exhausted escape energy. It did not complete.

Revisions added explicit companion crossing, limited bracing, backward default dodge, attack energy reserve, visible table/condition markers and a physically represented right-lane patrol. Audio and final result/UI follow-ups are separate from the core replays.

## Ordinary-time public completion

The revised side route at `2987dfd` completed in ordinary browser time: rescue, side vault, companion crossing, boarding and shelter. Health 4, van 100, gate HP 3, enemy HP `[0,2,4,3,3,3]`, active time 36.6989 seconds. The intact gate and five surviving enemies demonstrate an alternative to an all-enemy sweep.

The final environment at `897da53` completed the direct route in 844×390 phone emulation: simultaneous actual touch movement/Strike, timed Dodge, one-use aid, shield/patrol confrontation, held touch rescue, three gate contacts and together-only boarding. A deliberate wrong-lane drive caused failure. Actual touch Retry the escape restored the rescue/van; corrected driving reached shelter. Final health 6, van 100, gate HP 0, enemy HP `[0,0,0,0,3,3]`, active time 64.4805 seconds including failure/retry.

Some travel used manually selected destinations, and some combat used read-only enemy/warning observations to choose actual controls. No runtime positions, health, outcome flags, currencies or simulation clocks were edited. The full revised replays were ordinary-time input, not `advanceTime`; they are nevertheless agent-assisted, not independent first-time-human tests.

## Isolated and deterministic checks

Sixteen isolated checks in `line-unit.mjs` cover start/pause, held rescue, together-only boarding, short/single contact, shield push, physical gate opening, side vault, screen collision, one-use aid, concurrent attackers, energy reserve, companion crossing, escape checkpoint, vehicle collisions/braking and shelter completion. These tests stage state and do not establish fun.

The required supplied browser client initially attempted input before the model-loaded button became enabled; its resulting menu capture is not gameplay signoff. `tools/line-browser-client.mjs` retains that client with only its ready-button timeout extended from 5 to 60 seconds. `qa/line-client-final` and `qa/line-client-r3` contain inspected movement/strike captures and state. A longer r3 burst hit the 110-second timeout; a bounded shorter repeat succeeded. Software-rendered deterministic stepping is not a device FPS benchmark.

## Assets, sound and loading

Three fictional generated Hindi lines were transcoded to genuine MP3 and reviewed as source audio. The evaluator transcribed the intended lines without spoken tags, cutoffs or clipping; its report is `qa/line-dialogue-evaluation.txt`. Runtime playback, muting, pause/resume, explicit mute retention on replay and the rescue/boarding triggers are final checks, not inferred from file existence.

A long-lived cloud session failed to load after repeated scene reloads; a fresh cloud browser loaded and rendered successfully. The precise cause was not established. A visible Retry loading path and graphics-context-loss reload fallback exist, but failed loading attempts are retained as limitations rather than silently counted as passes.

Final presentation/audio-only checks and public deployment confirmation are appended after the final bundle is verified.

## Unverified quality

Physical Android/iPhone hardware, Safari, long-session thermals, network-limited phones, unaided player enjoyment and retention remain unverified. Reused character identity/rigs, contact/fall animation, repeated environment silhouettes, crowd autonomy and short escape pacing remain below finished-indie expectations.
