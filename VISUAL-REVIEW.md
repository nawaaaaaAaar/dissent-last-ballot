# DISSENT visual review

This review responds to the creator's assessment that v0.4 looked roughly 4–5/10. No new numerical quality score is assigned. The acceptance target remains a convincing real-world-looking game in motion, not merely a better screenshot.

## Iteration: rebuild the world

The runner corridor was replaced with a road and adjoining gathering courtyard. Separate shirt and trouser meshes were authored in Blender and attached to the existing skeleton. CC0 photographic tree assets, scanned surface textures and HDR illumination replaced several procedural approximations.

The first actual engine capture is `qa/world-review-1-title.png`. Review found excessive foliage loss after decimation, a ribbed-looking monument texture and costly rendering in software Chromium. Those faults remained despite the improvement in lighting and street scale.

## Iteration: correct material and silhouette faults

Tree reduction was separated by material so leaf surfaces retained more geometry than branches. High and mobile tree versions were exported. The monument and façade diffuse material was changed to a limewash texture, with weaker normal detail; scanned grass replaced the flat garden surface. Character detail and idle updates were reduced, static geometry batched and SSAO reduced to half-resolution on high graphics.

`qa/world-review-2-play.png` records an intermediate gameplay view. Review still found loosely scattered box props, evenly dispersed characters, a costume coverage gap and generic silhouettes. It was not accepted as a finished-realism result.

## Iteration: composition and coverage

The scattered cubes were replaced with an aid table's bottles, a first-aid case, slatted supply crates and record papers. Protesters were organised into smaller groups. Trouser coverage and shirt overlap were extended in the editable Blender model. The story chapter and touch inputs were exercised through actual controls, not teleported screenshots.

Final captures include the street, aid point, barricade, ending and mobile layouts in `qa/world-final-*` and `qa/world-mobile-*`. These are actual Three.js gameplay captures. The generated limewash image is only a surface texture, not a promotional render substituted for game graphics.

## Remaining gaps

- **Characters:** Generic base anatomy and faces remain too simplified. Clothing shells can still read as sculpted anatomy rather than naturally draped fabric; the backpack and hair remain visibly simplified.
- **Animation:** Bone-driven procedural walking lacks authored transitions, convincing foot contact and character performance.
- **Environment:** The street has better scale cues and surface response, but façades repeat and the observatory geometry is approximate. It is not a photogrammetric Jantar Mantar reconstruction.
- **Foliage:** The adapted tree has a relatively sparse silhouette, particularly in mobile LOD. Further reduction cannot be treated as free visual quality.
- **Crowds and sound:** Groups are small and mostly idle, not a reactive protest simulation. Spatial protest ambience and dialogue have not been produced.
- **Performance:** Headless software rendering is slow. Deterministic QA proves controls and story behaviour, not physical-phone frame pacing.

The build is a materially revised playable world, not the requested final photorealistic game. A cinematic, extra post-processing or a model's capability claim does not close these remaining production gaps.
