# DISSENT visual review

## v0.9 scope

This pass changes the campaign's theme, case decisions, charter and signage using the existing art. The invented Bihar/West Bengal camps reuse earlier authored spaces; they are not new regional scans or geographically authentic models. Review covers readable before/current record panels, touch choices, scrollable charter controls and live-game captures. No new photorealism, wardrobe or facial-animation claim is made.

Actual public captures in `qa/v09/public-*` show the case comparison, visible incorrect-answer feedback, incomplete charter and hypothetical ending, plus portrait/landscape phone layouts. A desktop panel-width override and offscreen feedback were corrected; the final public interaction confirms the feedback is visible. Portrait case panels scroll to their lower choices and disclosure. These captures are engine/browser output, not an AI-generated promotional film.

## v0.8 district and readability review

`qa/v08/jamia-arrival.png`, `shaheen-arrival.png`, `mobile-campus.png` and `mobile-market-landscape.png` are actual engine captures. The campus has an original arched entrance, two building blocks, a contested exit and routes around obstacles. The community street uses opposing shopfronts, communal mats, stations, canopy and overhead lines. These are reference-inspired, not scans or exact architectural reconstructions.

The first district review exposed untextured white floors caused by duplicate material-library module instances. The imports were unified and the captures regenerated. A running pose carried into the next mission was also corrected with animation reset. Crowd groups were moved toward foreground activity and gathering stations; three cached knit-colour variants reduce identical-shirt repetition without claiming new people or clothing meshes.

Live mobile UI now removes a separate Run button, score/time clutter and repeated inventory readouts. The outer joystick runs, short contextual captions fit action controls, and secondary accounts sit behind the map. Camera collision draws the view forward when buildings, buses or landmark blocks would obstruct it. This is a readability and layout pass, not a photorealism certificate.

Repeated faces, generic wardrobe, simplified police, sparse crowd animation, flat building silhouettes and missing authored jump/dodge clips remain below the requested real-world-looking standard. No new numerical quality score or production-readiness claim is assigned. Physical-phone performance and novice enjoyment still require real testing.

## v0.6 character and motion pass

Textured MIT-licensed Rocketbox adults replace the student and non-police participants. Compatible idle/walk/run FBXs were retargeted onto each avatar's rest skeleton, root XY movement removed, and 1K WebP textures embedded in the GLBs. The source files, converter, editable Blender scenes and copyright notice are retained. [Microsoft Rocketbox](https://github.com/microsoft/Microsoft-Rocketbox).

`qa/v06-character-review.png`, `v06-walk-review.png` and `v06-run-review.png` show an intermediate actual-engine check, not a generated film. It found the first animation playback lagged behind world travel. Source root displacement was measured, walking reduced to 1.8 game metres/second and running to 4.6, and clip speed tied to actual travel. Final capture names and QA distinguish this tuning from the earlier screenshots.

The new costumes and faces are materially more detailed than the earlier handcrafted shells. The avatar set is small and visibly reused; it is not a representation of actual Delhi participants, and there is no facial acting, jump clip, cloth simulation or foot-contact IK. Police retain the simplified khaki model. These remain production gaps.

This review responds to the creator's assessment that v0.4 looked roughly 4–5/10. No new numerical quality score is assigned. The acceptance target remains a convincing real-world-looking game in motion, not merely a better screenshot.

Final v0.6 local captures are `qa/world-final-*`, `qa/world-archive-ending.png` and `qa/world-mobile-*`. The aid-point view shows much stronger clothing and face detail, but also makes the repeated male avatar obvious. The mobile landscape capture keeps controls and task text readable; sparse crowds, repeated architecture and oversized road space still prevent a convincing busy protest setting.

## v0.5 iteration: rebuild the world (historical)

The runner corridor was replaced with a road and adjoining gathering courtyard. Separate shirt and trouser meshes were authored in Blender and attached to the existing skeleton. CC0 photographic tree assets, scanned surface textures and HDR illumination replaced several procedural approximations.

The first actual engine capture is `qa/world-review-1-title.png`. Review found excessive foliage loss after decimation, a ribbed-looking monument texture and costly rendering in software Chromium. Those faults remained despite the improvement in lighting and street scale.

## Iteration: correct material and silhouette faults

Tree reduction was separated by material so leaf surfaces retained more geometry than branches. High and mobile tree versions were exported. The monument and façade diffuse material was changed to a limewash texture, with weaker normal detail; scanned grass replaced the flat garden surface. Character detail and idle updates were reduced, static geometry batched and SSAO reduced to half-resolution on high graphics.

`qa/world-review-2-play.png` records an intermediate gameplay view. Review still found loosely scattered box props, evenly dispersed characters, a costume coverage gap and generic silhouettes. It was not accepted as a finished-realism result.

## Iteration: composition and coverage

The scattered cubes were replaced with an aid table's bottles, a first-aid case, slatted supply crates and record papers. Protesters were organised into smaller groups. Trouser coverage and shirt overlap were extended in the editable Blender model; underlying covered body triangles were removed from the clothed runtime to prevent skin/cloth intersections. The story chapter and touch inputs were exercised through actual controls, not teleported screenshots.

Final captures include the street, aid point, barricade, ending and mobile layouts in `qa/world-final-*` and `qa/world-mobile-*`. These are actual Three.js gameplay captures. The generated limewash image is only a surface texture, not a promotional render substituted for game graphics.

## Iteration: close-up costume review

The closer aid-point view exposed ragged shirt topology left by extracting vertices from the body mesh. Removing underlying body triangles alone did not fix it. A continuous ring-based shirt with explicit torso and sleeve weights replaced that extraction, and the lower garment fit was widened to avoid trouser intersections. Aid signage was moved clear of the canopy, and base terrain was added to prevent gaps when orbiting near the courtyard edge.

`qa/world-clothing-review.png` preserves the defective intermediate costume view, not the final art target. This additional check is why a wide screenshot alone is insufficient evidence of finished clothing.

The ground material also read like timber boarding in the close courtyard view. Its diffuse was replaced with original staggered stone-slab texture code while retaining subtle scan-derived normal detail. The final public captures are `qa/world-public-final-*`; they supersede earlier local captures for judging the current appearance.

## v0.5 remaining gaps (historical)

- **Characters:** Generic base anatomy and faces remain too simplified. Clothing lacks realistic fabric drape and detailed folds; the backpack and hair remain visibly simplified.
- **Animation:** Bone-driven procedural walking lacks authored transitions, convincing foot contact and character performance.
- **Environment:** The street has better scale cues and surface response, but façades repeat and the observatory geometry is approximate. It is not a photogrammetric Jantar Mantar reconstruction.
- **Foliage:** The adapted tree has a relatively sparse silhouette, particularly in mobile LOD. Further reduction cannot be treated as free visual quality.
- **Crowds and sound:** Groups are small and mostly idle, not a reactive protest simulation. Spatial protest ambience and dialogue have not been produced.
- **Performance:** Headless software rendering is slow. Deterministic QA proves controls and story behaviour, not physical-phone frame pacing.

The build is a materially revised playable world, not the requested final photorealistic game. A cinematic, extra post-processing or a model's capability claim does not close these remaining production gaps.
# v0.10 action readability

This pass adds original packet and supply props, low crates, officer anticipation rings, Rally feedback, a gathering boundary, energy/cooldown HUD and restrained Dodge camera response. Existing character and world art is reused; this is not a realism upgrade. Phone HUD positioning was revised to separate the packet counter, warning, toast and action buttons, and ending buttons now have spacing.

Actual gameplay captures are retained in `qa/v10/`, including public high-quality Rally, completed chapters and phone portrait/landscape captures. Public review confirmed that phone HUD and action buttons fit; the landscape tutorial occupies some lower-central space but leaves the primary actions accessible. The prototype still has repeated faces, simplified police, sparse architecture/crowds and missing authored jump/dodge animation. A readable arcade ring is deliberately game-like, not a claim of real-world appearance.
