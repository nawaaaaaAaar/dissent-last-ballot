# DISSENT: The Last Ballot

A third-person, explorable resistance-story chapter in a source-referenced Jantar Mantar setting. The runner has been replaced as the main game; its earlier version remains available as an archive.

## Play

Open [DISSENT on GitHub Pages](https://nawaaaaaaaar.github.io/dissent-last-ballot/) in a WebGL 2 browser. No account or installation is required. The current version is **v0.5: The Street Is Still Ours**, a development build, not a finished photorealistic release.

- **Desktop:** WASD/arrows walk, Shift runs, Space jumps, E interacts, P/Escape pauses. Drag the scene to orbit the camera; movement follows its direction.
- **Phone:** Move with the left joystick. Drag the world to turn the camera. Use Run, Jump and nearby interaction buttons.
- **Graphics:** Auto selects low on narrow/touch devices and high on desktop. Low retains the same story, clothing and scanned street materials while reducing foliage, character visibility and post-processing.
- **Progress:** Complete five linked story encounters. An optional gathering event adds solidarity. Police pursuit begins after the fictional barricade confrontation.
- **Retry:** Capture returns you to your last completed story point without erasing the people you helped. Reloading the page resets the session; there is no persistent save.

## The chapter

The student arrives at a gathering that refuses to disappear. Meeting the organiser leads to community first aid, then a journalist who decides to share her account. A fictional confrontation brings down a barricade and activates a police pursuit. The student carries that account to a public assembly demanding accountability.

You can stop, explore the courtyard and street, approach people and choose when to interact. This is no longer an automatically advancing three-lane runner. The state crackdown is the antagonist; helping people, protecting their account and collective resistance drive the chapter.

The setting is based on Delhi references but uses compressed, authored geography. Characters, dialogue, the confrontation and the account are fictional. It is not a reconstruction of an actual custody incident or a claim that particular allegations have been proven. There are no real-world sabotage instructions, private protester records or real-person likenesses.

Read [the story and mechanics](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/WORLD-STORY.md) and [Delhi references](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/DELHI-REFERENCES.md).

## Visual iteration

This pass adds separate rigged clothing meshes, adapted CC0 tree models, scanned asphalt/paving/grass materials, a real HDR environment, richer street furniture, original civic façades and source-referenced observatory forms. High graphics adds screen-space ambient occlusion.

Actual gameplay captures were reviewed, then revised for foliage loss, ribbed monument surfaces, costume coverage, placeholder-like props, crowd placement and rendering cost. [The visual review](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/VISUAL-REVIEW.md) records those changes and the remaining gaps.

It is still not the requested real-world-looking production game. Faces, clothing fit, procedural animation, crowd behaviour and repeated architecture remain below that target. A more attractive still is not proof that motion or phone performance is finished.

## Build and verification

Run `npm ci` and `npx playwright install chromium`, then `npm start`. In another terminal, `npm test` runs world-story and touch-input checks. `DISSENT_URL` may target another deployment. Software-rendered tests are intentionally deterministic and do not certify physical-device frame rates.

The vendored browser runtime needs no build step. `tools/build-art.py` documents the Blender 5 pipeline for the adapted human and tree LODs. `art/courier-clothed.blend` contains the editable clothing source; external CC0 source/download links and licences are in [asset provenance](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/ASSETS.md).

The original v0.4 runner is at `docs/runner.html`; historical tests use that page through `npm run test:runner`. The earlier AI-generated opening video is retained only as a historical asset, not loaded by the world.

## Limits and publication

Desktop and mobile Chromium emulation are exercised; physical iPhone/Android and Safari testing remain outstanding. The chapter currently uses contextual dialogue confirmations, not sophisticated rescue AI, physical crowd simulation or destructible-world physics. Sound is limited to a short original UI confirmation tone.

All runtime code, models, textures, project-authored editable clothing, adaptation tools, review captures and QA notes are in this repository. GitHub Pages serves `docs/` from `main`. There are no embedded credentials or analytics; fonts are fetched from Fontshare.
