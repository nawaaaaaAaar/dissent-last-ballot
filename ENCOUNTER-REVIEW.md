# DISSENT: authored encounters and contact

## Baseline replay before edits

The fresh public v0.15.13 build was played in normal browser time with keyboard movement, short and held strikes, a dodge, exploration toward Kabir, and a separate gathering approach and fight. No simulation clock, health, location or objective state was injected. This was exploratory replay of the affected encounters, not another complete baseline network cycle.

At the witness encounter, held strikes removed the approaching rush unit, while another opponent remained behind the cordon. Kabir was a stationary marker and the space did little to communicate alternate approaches. At the gathering, movement, attacks and a dodge produced a health loss and partial securing progress, but the zone still played as a generic waiting circle between building fragments. The failure was not missing rewards; it was missing spatial purpose, human reactions and physical continuity.

Inspection identified damage resolved immediately on attack input, before the arm pose reached contact. Enemy tells were more readable than their actual striking/recovery motion. Ground furniture was mainly decoration and did not shape movement or sight. Companions followed the player without a threatened/calm distinction.

## Design and QA inventory

Rework two important spaces, not the district count: the witness cordon and the community forecourt. Preserve the existing campaign, geography, rewards and political narrative. Add contact-timed strikes with locked facing and visible recovery, collision-checked vaulting of low furniture, movable sight-blocking screens, position-holding guards, missed-attack recovery and threatened companion behaviour.

Checks required: no damage before contact, one hit per swing, moving out of range causes a miss, shield/finisher and late dodge; environment collision and sight, screen movement/noise, vault landing validation and animation phase; authored entry variants and no trapped witness; guard holding/regrouping, flanker route choice, companion threat/shelter/follow; checkpoints preserve environment; all four operations through ordinary inputs; failure/retry and alternate approach; touch Action/vault/combat and both orientations; actual active gameplay screenshots and animation phase samples; public deployment version/source verification.

Environmental interaction as a combat-positioning reference comes from Sloclap's description of furniture, tables and other usable elements in combat spaces, not a claim that this game reaches Sifu's quality ([PlayStation developer article](https://blog.playstation.com/2021/11/18/how-sifus-kung-fu-combat-works/)).

## Implementation and replay

### What was redesigned

The witness cordon now has a frontal line, two low side benches, a movable tall screen and a witness desk. The community forecourt has an aid screen/table and a separate reading bench/screen. Props have physical collision; tall screens block sight. Moving a screen changes the approach and creates an investigation sound. Vaults cross only the selected low prop, check the landing and sample an authored crouch/tuck/landing sequence. These are fictional staged spaces on the existing adapted map, not another district.

Damage now occurs once at the authored contact phase of a locked-facing jab, cross or push, rather than on input. Moving targets can be missed and being hurt or dodging cancels a swing. Enemy windup, committed strike and recovery are separate phases; a missed rush leaves a longer recovery window. Guards hold an encounter position instead of following indefinitely, flankers approach differently, and surviving nearby units regroup after an ally falls. Companions brace or shelter near committed attacks and then resume following.

Original joint keyframes are applied to the existing licensed skeletons and sampled from the same phase as gameplay contact. This is authored runtime animation, not generated video. It is not mocap, full-body IK, baked root motion or limb-by-limb collision. The shield is still a simplified accessory, and the arcade contact radius is more generous than literal fist reach.

### Rejected first iterations

Normal-time play and actual-render inspection caught five defects: the first animation tracks did not bind to the rig's underscore-sanitised bone names; imported bone axes distorted the initial poses; a context action selected the screen behind the player instead of the bench ahead; later gathering stages reverted to generic radial spawning; accepting a new job could place furniture through the parked van. These were revised, not labelled complete. The final follow-up also makes assisted strikes prefer a blocking cordon instead of an occluded guard.

The first revised campaign reached rescue, gathering and courier victories but the charter escape became trapped in newly placed furniture. That run is not recorded as a completed campaign. A fresh subsequent full cycle completed after fixing placement and authoring every gathering stage.

### What changed in actual play

- **Witness:** Moving the banner changed the route and sight. A side bench required a vault rather than simply walking through furniture. In the fresh final-core replay, a frontal approach also exposed an aim-assistance problem, later fixed. The cordon opened, the guard was confronted, Kabir followed and both boarded. The rescue completed SILVER, score 1,733, health 6, van approximately 97%.
- **Gathering:** I moved the aid screen, secured the first area without first disabling every opponent, fought at the aid point and restored it during a gap. Stage guards occupied designed homes instead of a loose ring. I approached the reading area and observed both readers in `brace` states during nearby committed attacks. They resumed following; the position-holding guard stayed behind. A pursuing rush unit forced a final assembly fight. Both readers arrived and the operation completed SILVER, score 1,420, health 4.
- **Courier:** A repositioned approach copied the dispatch without defeating all three guards. A hit cost health, but completed copying persisted. Driving needed a deliberate route around the desk, rather than following guidance blindly through it. The delivery completed SILVER, score 1,414, health 6, van approximately 95%.
- **Charter:** The first copying attempt was interrupted. A dodge, short fighting attempt, screen movement and a changed approach secured it while opponents remained active. The van escaped and delivered the charter: BRONZE, score 1,057, health 2, van 100%, network cycle two.

These results belong to the v0.16.4 core replay, in normal browser time with real keyboard/touch input. No positions, health, mission flags, credits or simulation clock were injected. Street travel used manually selected waypoint-assisted input, so this is agent-assisted play, not an unaided player study or retention evidence. Baseline comparison is a replay of the affected encounters, not a completed baseline campaign.

### Why this is materially better

The spaces now impose distinct decisions: confront the front line, use a low side route, move sight-blocking cover, exploit a recovery window, or bring companions away while a guard holds position. Damage/poses share a contact phase, and companion reactions are visible consequences of nearby pressure. The improvement is in spatial and timing decisions, not additional districts, currencies or mission counters.

## Remaining finished-indie gap and next priority

The spaces are more purposeful, but they are not finished set pieces. Prop silhouettes and building forms remain simple; crowds and companions lack conversation, anticipation and rich recovery performances. Combat is still forgiving arcade-radius contact with brief hand-authored poses, not convincing limb contact or coordinated choreography. Assistance/context selection and street guidance can require conscious correction. Long journeys still dilute the encounter pacing. Synthesised audio lacks authored Foley and expressive character sound.

The next highest-impact weakness is the physical readability and presentation of these same encounters: closer camera framing without occlusion, matched reach/foot placement, hand-to-prop contact and recovery transitions, supported by specific sound cues. Do not respond by adding districts or more reward counters. Independent first-time player testing should then determine whether the choices remain enjoyable after repeated runs.

Final verification and mobile/deployment scope are recorded in `QA.md`. Feature presence and isolated checks do not establish finished-game quality or player enjoyment.

The final public source reports v0.16.5. Its follow-up touch replay verified screen movement, a bench vault and three assisted cordon contacts; portrait simultaneous movement/aim and both orientations were checked. A fresh public-root capture/retry passed after an earlier long-lived browser stalled. This final follow-up is narrower than the full v0.16.4 cycle, not another claimed full phone playthrough.
