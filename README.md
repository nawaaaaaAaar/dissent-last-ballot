# DISSENT: The Last Ballot

A third-person, explorable resistance-story chapter in a source-referenced Jantar Mantar setting. The runner has been replaced as the main game; its earlier version remains available as an archive.

## Play

Open [DISSENT on GitHub Pages](https://nawaaaaaaaar.github.io/dissent-last-ballot/) in a WebGL 2 browser. No account or installation is required. The current version is **v0.6: The Account**, a development build, not a finished photorealistic release.

- **Desktop:** WASD/arrows walk, Shift runs, Space jumps, E interacts, P/Escape pauses. Drag the scene to orbit the camera; movement follows its direction.
- **Phone:** Move with the left joystick. Drag the world to turn the camera. Use Run, Jump and nearby interaction buttons.
- **Graphics:** Auto selects low on narrow/touch devices and high on desktop. Low retains the same story, clothing and scanned street materials while reducing foliage, character visibility and post-processing.
- **Progress:** Find water, recover a recorder, choose the account's destination, join a resistance-rhythm interaction and decide whether to help Kabir during pursuit. Optional fragments and the journal deepen the story.
- **Retry and continue:** Story checkpoints save in browser-local storage when available, not on a server. Capture preserves recovered items and choices; the title's Continue button restores the checkpoint after reload. Starting/restarting clears that chapter save.
- **Story assist:** Slower pursuit, a wider rhythm window and a timing skip. Change it at the title or in the journal without restarting.

## The chapter

Aman arrives looking for Kabir. Mira and Dev draw him into the gathering's practical work, while Sana asks him to preserve an account on her terms. A fictional confrontation brings down the barricade. The player decides how to hand off the account and whether to stop for Kabir while officers close in.

You can stop, explore the courtyard and street, approach people and choose when to interact. This is no longer an automatically advancing three-lane runner. The state crackdown is the antagonist; helping people, protecting their account and collective resistance drive the chapter.

The setting is based on Delhi references but uses compressed, authored geography. Characters, dialogue, the confrontation and the account are fictional. It is not a reconstruction of an actual custody incident or a claim that particular allegations have been proven. There are no real-world sabotage instructions, private protester records or real-person likenesses.

Read [the story and mechanics](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/WORLD-STORY.md) and [Delhi references](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/DELHI-REFERENCES.md).

## Visual iteration

This pass replaces the main student and non-police participants with textured MIT-licensed Rocketbox adults and compatible idle/walk/run clips, retargeted in Blender. Travel speed drives animation playback. The earlier CC0 khaki police remain simplified. CC0 trees, scanned surface detail, HDR light and high-quality ambient occlusion remain in the world.

Actual gameplay captures were reviewed, then revised for foliage loss, ribbed monument surfaces, costume coverage, placeholder-like props, crowd placement and rendering cost. [The visual review](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/VISUAL-REVIEW.md) records those changes and the remaining gaps.

It is still not the requested real-world-looking production game. Faces have no conversational performance, avatars repeat, jumping has no dedicated clip and crowd/architecture systems remain simplified. A more attractive still is not proof that motion or phone performance is finished.

## Build and verification

Run `npm ci` and `npx playwright install chromium`, then `npm start`. In another terminal, `npm test` runs world-story and touch-input checks. `DISSENT_URL` may target another deployment. Software-rendered tests are intentionally deterministic and do not certify physical-device frame rates.

The vendored browser runtime needs no build step. `tools/convert-rocketbox.py` reproduces the textured human and animation conversion; original selected FBX/texture sources and editable Blender files are included. `tools/build-art.py` preserves the earlier clothing/tree pipeline. Credits and licences are in [asset provenance](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/ASSETS.md).

The original v0.4 runner is at `docs/runner.html`; historical tests use that page through `npm run test:runner`. The earlier AI-generated opening video is retained only as a historical asset, not loaded by the world.

## Limits and publication

Physical iPhone/Android and Safari testing remain outstanding. The chapter has concrete retrieval tasks and a simple companion, not sophisticated rescue AI, physical crowds or destruction physics. Original synthesised footsteps and interaction tones are available when sound is enabled; there is no recorded dialogue or full protest ambience.

Read [research and gameplay design](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/GAME-DESIGN.md) for the enjoyment hypothesis and novice-playtest gate. Automated success is not evidence that ordinary players already find the game fun.

All runtime code, models, textures, project-authored editable clothing, adaptation tools, review captures and QA notes are in this repository. GitHub Pages serves `docs/` from `main`. There are no embedded credentials or analytics; fonts are fetched from Fontshare.
