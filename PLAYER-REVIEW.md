# DISSENT: playing it before improving it

This review records browser play of v0.12.2 and the resulting v0.13 changes. It is an assistant's actual-input review, not a human enjoyment study or proof of real-device performance.

## What I tried

I played in normal browser time, without deterministic time stepping for the initial review. I walked toward the first opponents, held Space for 2.2 seconds, dodged and moved away, then paused. A separate attempt crossed the line, rescued Kabir, recovered the recording, boarded the van, made two fast turns and braked.

The first stationary inspection also ended in capture while the world continued running. That is not presented as a carefully played loss: thinking between browser calls left the character exposed. The following combat attempt deliberately grouped movement/strike/dodge inputs into one short real-time sequence and paused before inspection.

## Observations and decisions

- **Held strikes:** Holding Space for 2.2 seconds produced only one strike; one opponent remained on two condition units. Phone aiming already repeated strikes, so desktop behaviour was inconsistent. The revision supports held Space, mouse, right stick and Strike button, with the existing cooldown.
- **Opponent overlap:** Pursuers could occupy exactly the player position, obscuring who was who and collapsing the aiming vector. Opponents now stop at close striking distance, separate from each other and preserve finite auto-aim even at zero distance.
- **Hit readability:** Small character gestures and particles did not clearly convey remaining opponent condition. Nearby opponents now have three compact condition segments; interruption flashes those segments. Aman and Kabir have distinct ground markers, and the lead uses a contrasting existing casual outfit.
- **Driving:** Two fast directional turns carried the van past the expected junction position before braking. Corner assist now reduces acceleration during a large heading change, tightens turning and makes released-stick coasting shorter. This remains arcade steering, not realistic car physics.
- **Pursuit start/retry:** The patrol began far back near the protest, and retries retained a protest-area last-seen position rather than the restored van. The patrol now joins from the nearby central road at first boarding; a vehicle retry positions it behind the earned checkpoint and updates last-seen context.
- **Actual escape pressure:** The first revised normal-time attempt reached the safe house while still visible, lost van condition and did not win. It is not counted as a successful mission. The patrol now uses a fast visible chase and a slower last-seen search; this makes losing sight change behaviour, not only the HUD label. A hot arrival remains invalid.
- **Map:** The route choice existed physically but the minimap did not show its obstruction. The live map now marks both active barricades and the unsecured recording. Distance text names the current destination rather than repeating a legend.

## Scope

The same rescue/recording/escape mission and electoral-resistance narrative remain. This pass does not add errands, more districts, a gun system or an untested claim of photorealistic graphics. Character art, authored combat motion, city density, physical-phone testing and first-time-player enjoyment remain open work.

The source and captures are available in [the repository](https://github.com/nawaaaaaAaar/dissent-last-ballot). Verification and remaining limits are recorded in [QA](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/QA.md); the previous design direction is preserved in [the Breakout brief](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/BREAKOUT-DESIGN.md).
