# DISSENT: what game are we making now?

The decision for v0.12 is a compact top-down 3D action mission with five verbs: move, fight, break, rescue and drive. The previous task-led campaign remains archived. This build tests a coherent escape loop before promising more districts or a final visual standard.

## References, not a clone

- **Immediate mobile action:** Mini Militia's official description foregrounds dual-stick controls; we borrow separation of movement and directional action, not its weapons, jetpacks, characters or assets ([official listing](https://play.google.com/store/apps/details?id=com.appsomniacs.da2&hl=en_US)).
- **City mission structure:** San Andreas offers a city-based story/action reference; the useful principle here is a mission carried by movement and consequences rather than mandatory document reading ([official listing](https://apps.apple.com/us/app/gta-san-andreas-definitive/id6468845068)).
- **Top-down readability:** Chinatown Wars provides a camera reference for compact mobile city action, without implying our world or systems have GTA's scope ([game overview](https://download.cnet.com/gta-chinatown-wars/3000-2095_4-76640353.html)).
- **Readable challenge:** Anticipation, contrast and enemy intent matter before difficulty can feel fair; our wind-up rings, interrupted attacks, visible condition and explicit search state apply that principle ([ARPG readability discussion](https://www.gamedeveloper.com/game-platforms/designing-for-difficulty-readability-in-arpgs)).

These references informed choices, not a guarantee that strangers will enjoy the result. No ordinary-player playtest or production-quality comparison has been completed.

## The loop

The player starts inside a gathering during a fictional crackdown. A central route offers a breakable line; side streets offer avoidance. A short-range confrontation can interrupt pressure or create room to rescue Kabir. Sana's recording collects by contact. A van changes speed, scale, controls and failure conditions; boarding requires that the companion is present.

Police pursuit then becomes a spatial problem rather than a timer-only finish. Walls block sight. Opponents approach the last seen position. Continuing to be seen maintains heat; hidden time moves the state from pursuit to search to clear. A western roadblock creates a route choice. Only a slow, unseen arrival with both person and recording ends the mission.

## Systems actually implemented

- **Combat:** Directional melee with range, angle, cooldown, interruption, knockback, three-hit opponent condition and no gore. Dodge has cost, cooldown and a brief invulnerable window.
- **World:** Original connected three-by-three street grid, collision boxes, obstacle-aware paths, original van/patrol vehicle, tree assets, street props and contextual objective markers.
- **Vehicle:** Arcade turning and acceleration, braking/coasting, condition loss on collisions and patrol contact, enter/exit interaction and a boarding checkpoint.
- **Progress:** Rescue and recording flags, companion following/proximity checks, search heat, route obstruction, parked victory, score and fail/retry.
- **Phone interface:** Independent movement and aiming sticks, repeated directional strikes while held, contextual Action, Dodge/Brake, scalable layout and low graphics using the same assets.

There is no gun system, multiplayer, jetpack, huge open city, destructible-building simulation, realistic vehicle physics, full stealth perception model or authored combat animation set. The patrol vehicle and five foot opponents are deliberately bounded. The game does not yet simulate a changing protest crowd or consequences across several districts.

## Story through action

Aman is not a paperwork courier collecting unrelated counters. He brings Kabir and Sana's account out together so a fictional support network can continue its work. Rescuing, regrouping, preserving the recording and not bringing pursuit into the safe house embody solidarity.

The electoral demands remain broader than removal of one official: lawful leadership accountability, ending the contested SIR process and transparent inclusion/review support for eligible voters across affected states. The current movement context, official response and disputed allegations remain distinguished in [the sourced movement brief](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/CURRENT-MOVEMENT.md). Officials are not playable combat targets; all encounters and outcomes are fictional.

## Acceptance gates

- **Systems gate:** Complete one mission through real inputs; independently exercise fight, dodge, rescue, braking, vehicle failure, pursuit loss and checkpoint recovery. An automated rules check alone does not establish actual play.
- **Phone gate:** Touch interaction and portrait/landscape checks are necessary, but physical Android/iPhone testing and Safari compatibility remain separate open requirements.
- **Enjoyment gate:** Ask first-time players to attempt the mission without coaching; track initial confusion, steering difficulty, failure reasons and whether they choose to replay. No such study has been conducted yet.
- **Art gate:** Judge actual playable motion: locally grounded authored characters, convincing police uniforms, vehicle detail, urban density, face/fabric quality, authored combat transitions, crowd response and measured device performance. Licensed models, lighting and a flattering still do not satisfy final approval.

The present release is a systems slice, not a claim that high-quality realism has been reached. Expansion should wait until the same core mission passes control, enjoyment and art review rather than hiding weak mechanics behind more tasks.
