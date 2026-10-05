# DISSENT: The Last Ballot

A mobile-first, third-person resistance adventure about the current vote-chori/SIR movement. **v0.11: Learn the Route** adds safe practice, a winning walkthrough, a more varied fictional Indian cast and reusable sprint source. It is a playable prototype, not a finished photorealistic release.

## Start here

Choose **Learn to play & win**, then **Practise the controls**. Complete seven actions without pursuit, then start a fresh campaign. The same guide is available from Pause. Read [the complete winning route and sprint-code example](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/HOW-TO-WIN.md).

The cast now mixes four licensed generic avatar bases with casual clothing, kurtas and long tunics. Aman and the other named characters are explicitly fictional Indian characters; these are not scans of real protesters, and nationality is not inferred from clothing or appearance. The kurta avatar has project-authored short hair instead of the source cap. The wardrobe and hair changes improve variety but do not amount to a finished custom character-art pipeline.

The running mechanic is available as [sprint-controller.js](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/docs/sprint-controller.js) and is used by the playable game, not merely supplied as an unrelated example. Pursuers now try a grid route when direct movement is blocked. Existing campaign objectives remain below.

## Current game: Signal Run

Collect three record packets in each district while jumping low crates, dodging warnings and managing sprint stamina. Packets collect automatically; consecutive pickups increase the score multiplier, while damage breaks the chain. Optional supplies restore stamina and Rally energy. Rally costs 30 energy, has a six-second cooldown and briefly pushes back/stuns nearby fictional pursuers without awarding injury points.

Jantar Mantar adds the recorder, a held breakthrough and reunion. The invented Bihar camp requires both companions to reach the destination. The invented Bengal camp requires three live help actions and twenty game seconds inside the gathering ring. Case reading is optional in the journal, not a gate to the action. Completing all three chapters directly reaches the ending and its broader reform demands; the charter is optional.

On a phone, use the left joystick (outer edge runs), right-thumb camera drag, Jump, Dodge, Rally and held contextual Action. Desktop adds F for Rally to WASD/arrows, Shift, Space, Q and E. The new browser-local v0.10 campaign key avoids treating earlier completions as current runs. Read [the design decision](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/GAME-FEEL.md) and [current verification](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/QA.md).

## v0.9 design history: Every Eligible Voter

The movement's demand is broader than replacing Gyanesh Kumar: leadership accountability, ending the contested SIR process, and inclusion with transparent review across affected states. The campaign names those demands without claiming that electoral-manipulation allegations have been proven or that officials/policies have actually changed.

Each chapter requires three invented, consented case referrals. Compare the before/current records and the resident's account, then choose inclusion assistance, recognition that one valid entry remains, or pending-appeal support. Wrong answers give feedback; leaving produces no completion. Reading pauses action.

- **Jantar Mantar:** Protect the recorder, review voter files, cross the fictional line and reunite.
- **Bihar help camp:** Review omitted, first-time and duplicate cases, then deliver referrals with both companions.
- **West Bengal help camp:** Preserve appeal follow-up and eligible-voter referrals, sustain three desks and build a complete reform demand.
- **Final charter:** A resignation-only response is insufficient. Select all three commitments to finish the hypothetical ending; no actual roll, registration, policy or election result changes.

The second and third locations reuse authored game geometry and are explicitly invented, not actual regional camps or maps. All files use fictional adult characters; no real voter database, uploads or political messages are sent. The campaign uses a new browser-local v0.9 save key, so v0.8 completion is not mistaken for case review.

Phone controls retain the left joystick with outer-edge running, right-thumb camera drag, Jump, Dodge and contextual held Action. Review choices and charter controls are touch-accessible scrollable panels. Movement and combat mechanics remain; the new decisions make electoral inclusion part of play, not just scenery.

Read [the current movement research and implementation](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/CURRENT-MOVEMENT.md), [QA](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/QA.md) and [asset/visual limits](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/VISUAL-REVIEW.md). To run locally, use `npm ci`, `npx playwright install chromium`, `npm start`, then `npm run test:campaign`. The earlier slower narrative and runner are archives.

## v0.8 design history

Explore, orient yourself, help people, and act under pressure. Each district changes the central challenge rather than reskinning the same chase:

- **Jantar Mantar / Break through:** Recover the recorder, open a fictional barricade, reunite with Kabir and reach the assembly. Optional rescues trade time and risk for health and a stronger network.
- **Jamia-inspired campus / Leave together:** Regroup Mira and Kabir, navigate around campus buildings, bring both to the gate, open it and arrive together. Companions use obstacle-aware paths; reaching the destination alone does not complete the mission.
- **Shaheen Bagh-inspired street / Keep the gathering:** Support the kitchen, aid point and reading circle in any order. Sustain all three for twenty uncontested game seconds, then reach the assembly. Supported participants move toward the gathering.

The City map lets you choose or replay a district. Completing missions advances the campaign; helping people in another completed district grants one emergency health recovery in a later mission. Best scores and help records persist in this browser when storage is available. Active action-mission checkpoints remain in-session only.

These are separate authored spaces, not a continuous or survey-accurate Delhi map. Jamia and Shaheen Bagh draw on the 2019–2020 protest history; they are not claimed to be currently active gatherings, or part of the same historical day as the Jantar Mantar reporting. Characters, encounters and outcomes are fictional. The narrative opposes state repression without turning contested allegations into proven facts or offering real-world sabotage instructions. Read [the research, thematic distinctions and design decisions](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/DESIGN-REBUILD.md).

## Current controls and verification

- **Phone:** Left thumb moves; pushing the joystick toward its outer edge runs automatically. Right thumb drags the world to turn the camera. Jump, Dodge and the nearby contextual Action button cover the remaining frequent inputs. Hold Action for rescues and gate interactions. City map and pause keep secondary information out of the live controls.
- **Desktop:** WASD/arrows move, Shift runs, Space jumps, Q dodges, F rallies, E interacts or holds the nearby action. Drag to turn the camera. The on-screen Run toggle is available on desktop.
- **Progress and guidance:** A directional objective and distance identify the current task. The City map contains mission selection and optional people/accounts notes. Pause can review the mission brief; returning to the menu and choosing Resume retains the current unfinished run.
- **Tests:** `npm run test:campaign` runs the current action campaign checks. Earlier standalone action, slower-story and runner scripts are historical and are not current-campaign signoff. Install with `npm ci` and `npx playwright install chromium`, then `npm start`.

The three districts share licensed human meshes, scanned materials and runtime assets. Knit-colour variants, revised crowd clusters, camera collision and animation resets improve presentation; repeated faces, simplified police, basic buildings and missing authored jump/dodge clips remain obvious production gaps. Browser-emulated mobile inputs do not establish physical-phone performance or Safari compatibility. No ordinary-player enjoyment study has yet been conducted; see [QA](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/QA.md) and [visual review](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/VISUAL-REVIEW.md).

## Earlier single-district modes

Open [DISSENT on GitHub Pages](https://nawaaaaaaaar.github.io/dissent-last-ballot/) in a WebGL 2 browser. No account or installation is required. The following describes the retained v0.7 action route and v0.6 slower story, not the complete v0.8 campaign.

**PLAY · Break through** starts the new action chapter. Police pressure is active immediately. Recover the recorder, hold Action/E at the line, get Kabir moving and reach the assembly. Dodge red warning zones with Q or the touch button; sprint uses stamina, and jump clears fallen barriers. Optional hold-to-help rescues restore health and add score. The ending awards a run rank using time, health and people helped. No story-dialogue confirmation is required in this mode.

The button **Explore the slower story chapter** retains v0.6's branching narrative. Its controls and checkpoint description below refer to that mode. Action mode retries retain mission items in the current session, but do not save the run across reloads. Sound is activated by the Play gesture and can be muted.

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

Run `npm ci` and `npx playwright install chromium`, then `npm start`. In another terminal, `npm run test:action` runs the action chapter and mobile checks; `npm test` covers the slower world-story mode. `DISSENT_URL` may target another deployment. Software-rendered tests are intentionally deterministic and do not certify physical-device frame rates.

The vendored browser runtime needs no build step. `tools/convert-rocketbox.py` reproduces the textured human and animation conversion; original selected FBX/texture sources and editable Blender files are included. `tools/build-art.py` preserves the earlier clothing/tree pipeline. Credits and licences are in [asset provenance](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/ASSETS.md).

The original v0.4 runner is at `docs/runner.html`; historical tests use that page through `npm run test:runner`. The earlier AI-generated opening video is retained only as a historical asset, not loaded by the world.

## Limits and publication

Physical iPhone/Android and Safari testing remain outstanding. The chapter has concrete retrieval tasks and a simple companion, not sophisticated rescue AI, physical crowds or destruction physics. Original synthesised footsteps and interaction tones are available when sound is enabled; there is no recorded dialogue or full protest ambience.

Read [research and gameplay design](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/GAME-DESIGN.md) for the enjoyment hypothesis and novice-playtest gate. Automated success is not evidence that ordinary players already find the game fun.

All runtime code, models, textures, project-authored editable clothing, adaptation tools, review captures and QA notes are in this repository. GitHub Pages serves `docs/` from `main`. There are no embedded credentials or analytics; fonts are fetched from Fontshare.
