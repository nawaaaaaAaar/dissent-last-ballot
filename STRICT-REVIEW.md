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
| 3 | Graphics, models, materials, lighting, animation and effects | Blank extruded blocks, a washed-out palette, oversized generic HUD panels and simplified police broke the finished-game impression. |
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
| 15 | Environment detail and scale | Repeated roofs and sparse frontage/park detail offered few memorable spaces. Raw map size was not the primary problem; more kilometres without authored density would make it worse. |

## Rework priorities

- **Readable city first:** Correct the underground footprint, add pedestrian routes and a camera cutaway, and make navigation visible in the world rather than only on a tiny radar.
- **A better encounter:** Put the opening near the first action, replace repetitive unrestricted strikes with a stamina-limited sequence and additive attack poses, distinguish opponent roles and limit simultaneous committed attacks. Damage still uses an arcade trigger rather than a fully authored animation-contact pipeline.
- **Different mission demands:** Separate copying under pressure, securing a gathering, aid support and escort instead of relying on repeated idle timers.
- **Grounded visual direction:** Warm stone, brick and plaster façades, dark window recesses, roofs, paving, tree-lined streets, service spaces and clearer character silhouettes. Generated menu art is labelled illustration and never used as evidence of playable graphics.
- **Recovery and purpose:** Arrival checkpoints, useful voluntary support stops, concise character context and rewards tied to mastery rather than destruction totals.

The positioning/crowd-control emphasis is a design reference, not a claim to reproduce Sifu's systems or quality. Sloclap describes combat as a back-and-forth that asks players to react and use positioning and crowd control ([PlayStation developer article](https://blog.playstation.com/2021/11/18/how-sifus-kung-fu-combat-works/)).

## Replay and remaining weaknesses

### What changed, and why

- **Combat:** A three-strike stamina chain opens frontal shields on its finisher; flanking offers an alternative. Rush, guard and flank roles have visible committed attack tells. A late dodge creates a counterattack opening. The first operation limits simultaneous committed attacks. These create timing and positioning decisions instead of rewarding stationary held strikes alone.
- **Recovery and curve:** Further play exposed an immediate gathering spike and exhaustion leaving no dodge. Balanced first-cycle encounters now retain one committed attacker, with smaller aid/escort waves; Hard/later cycles escalate. Attacks and sprinting preserve dodge energy, and release/repositioning recovers it faster. Retry keeps the same balanced wave count rather than silently increasing it.
- **Mission structure:** Copying a courier dispatch requires a held action and damage interrupts it without erasing earned progress. The gathering mission now progresses from securing space to restoring aid, then leading two visible readers to the assembly. Arrival and stage checkpoints reduce repeated empty travel. These are different demands, not three renamed waiting circles.
- **Driving and escape:** The van is more compact, turns faster, has a lower arcade top speed and stops faster on release/brake. Wall impacts are gentler. Patrols now telegraph a locked-direction ram, which can miss and requires recovery; passive overlapping no longer drains the vehicle. Losing sight and cooling the search ends the patrol, and quiet reboarding does not recreate it. This makes escape an achievable state, not an endless HUD timer.
- **City and navigation:** The underground CP station is no longer an above-ground obstruction. Pedestrian paths, green-space polygons and vehicle-only routing are interpreted separately. Nearby foreground upper floors cut away, and street-level chevrons supplement the map. Source geography remains connected, but display footprints are adapted for arcade street clearance.
- **Playable art:** A new façade atlas adds plaster, brick, shutters and stone to actual game geometry. Roofs and tanks, street signs, benches, lamps, volunteer spaces, original autorickshaws and animated ambient participants add identifiable spaces. Police now use textured rigged human assets with original uniform accessories. Smaller tree assets, warmer lighting, clearer attack sectors and character markers improve consistency and readability. Pale paths are distinct from asphalt.
- **Presentation and sound:** The HUD is more compact, close/overview camera modes are accessible on phones, character context is delivered during actions, and original synthesized music, footsteps and impact sounds supplement the engine tone. Generated menu/ending paintings are labelled illustrations, not evidence of game graphics.

### What the replays exposed

The first revised rescue completed in normal browser time with Kabir and the account aboard, but that alone was not accepted as signoff. Further replays exposed a witness standing inside the observatory, an obstructed van placement, a rush attack that stopped short, expensive duplicated road caps, premature corner guidance and road/footprint mismatches. These were revised.

The courier was reached and its held copy action was exercised through actual input. An attack interrupted copying at 83%; a later hold completed it. A subsequent drive failed, and retry retained the secured dispatch. This is evidence for that interaction and recovery, not a completed current courier mission.

The later public rescue opened the shield encounter with a finisher and rescued Kabir without defeating every opponent. Its extraction then failed because the patrol could repeatedly drain the van during tight turns. The replacement warned ram was replayed: turns avoided multiple charges, a stationary arrival took one 12-condition hit, and an outer CP route broke sight. A separate phone-emulated drive still failed after overshooting a corner. These failures prompted further braking, steering and impact tuning; they are not relabelled as successful tests.

### Remaining quality gap

This is still below a finished indie action game's quality bar. Faces and outfits repeat; combat uses additive poses rather than a full authored choreography library; companions and crowds have limited autonomy; the city has no believable traffic simulation or authored interiors. Delhi landmarks are original approximations, not scans. There are only three reusable operation types, so medals and upgrades cannot establish long-term retention by themselves. Audio lacks convincing location recordings, voices and a developed score.

Street interpretation and driving remain sensitive areas despite the corrections. Physical phones, Safari and independent first-time-player enjoyment are unverified. Software-rendered local Chromium was much slower than the cloud browser, so its timings are not used as a phone-performance claim.

The next highest-impact work is **authored encounter spaces and reactive NPC behaviour, supported by proper contact-timed combat and traversal animation**. That would add meaningful choices and convincing human action, rather than another layer of mission markers or reward counters.

## Final end-to-end replay

The reworked v0.15.10 rules and art were played through all three operations and the charter in normal browser time on a publicly served, commit-pinned GitHub build. Travel used manually selected observed/map-derived road waypoints through actual mouse or CDP touch input. Fighting included ordinary keyboard input, shield positioning, a late dodge, mistakes and recovery. No `advanceTime`, objective flags, health, positions or credits were injected into the browser game.

| Operation | Observed result | What the replay established |
|---|---|---|
| Witness rescue | GOLD; score 1,541; health 6; van 100 | Fight, rescue, recording, companion boarding, broken sight, patrol stand-down and return completed. The touch-controlled return did not restart cooled pursuit. |
| Gathering | SILVER; score 1,411; health 3 | Holding strikes alone took damage. Repositioning finished the first guard; a late dodge opened the aid-stage shield. A held touch restored aid, and slower touch movement led both readers to the assembly. |
| Courier | GOLD; score 1,433; health 6; van 100 | One injury interrupted copying; the retained progress completed through held touch. A connected city drive delivered the dispatch at the fictional India Gate relay after escape. |
| Charter | SILVER; score 1,411; health 6; van 88 | A warned ram landed once, rather than draining the vehicle through contact. A different western return route completed the charter, retained the earned tempo upgrade and advanced the network to cycle two. |

These are agent-assisted playthroughs, not independent human enjoyment research. The reported mission seconds are simulation counters, not real-time speedrun benchmarks; exposure between tool calls and assisted steering affect them.

### Comparison with the baseline

The strongest material improvement is that the game now supports a readable sequence of decisions: a shield opening or dodge creates an escape opportunity; damage delays copying but does not erase it; holding aid while surrounded fails; a lost pursuit ends; both people arriving matters. Failure was used to revise the system rather than counted as successful feature coverage. The final runs were not all perfect, and the gathering's Silver result showed a recoverable challenge instead of a guaranteed held-button win.

The city is easier to read and more coherently surfaced than the blank baseline. It has actual textured fronts, separated paths/lawns/roads, street services and connected landmark approaches. It still looks synthetic and under-authored against a finished indie game. Several roads and small footprint pieces remain awkward; atlas textures cannot substitute for detailed frontage modelling.

Vegetation initially produced a worrying one-FPS observation, but follow-up identified background cloud-tab throttling: foregrounding the same final game restored roughly 60 FPS in the checked scene. Spatial chunking remains because it avoids drawing the entire grove for every view. This is not a controlled graphics benchmark, and neither the earlier background reading nor the foreground result proves performance on physical phones.

The courier result exposed a retained-scroll-position bug that clipped the next heading in a short landscape viewport. The presentation patch resets scroll for every outcome and adds a compact landscape result layout. It changes presentation, not the four replayed operations' game rules.

Landscape gameplay captures also showed the story toast covering the player. The final presentation pass moves that text aside, reduces the objective panel and brings the on-foot camera closer, while retaining the wider driving view. This is a readability revision, not a claim of a new character-animation library.

My assessment is **materially better, but not finished-game approval**. The next review should concentrate on authored combat/traversal performance and reactive encounter/city behaviour, followed by observed first-time-player sessions. More credits, markers or districts would not resolve the remaining gap.
