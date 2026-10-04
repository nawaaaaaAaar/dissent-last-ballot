# DISSENT: historical runner design and research

This document preserves the v0.1–v0.4 runner design. It is not the current gameplay specification. See README.md and WORLD-STORY.md for the v0.5 explorable world.

A Delhi-grounded 3D resistance runner about carrying evidence through a city that wants it silenced.

**Status: playable browser build, v0.4 Real-time Resistance. Still a prototype, not production-ready or photorealistic.** The public entry page runs the game, while `docs/concept.html` preserves the design dossier.

## Break Free opening and chase

The opening is now rendered live by Three.js, not played as a video. Tap **Resist** (or E), then **Take your companion's hand**, to trigger the two fictional story beats and enter the police pursuit. Skip with the visible button or Enter. The student, companion and three pursuers use an imported CC0 skeletal human base with project-authored colours, accessories and procedural poses. Bus detail, foliage cards, material normals, lighting, environment reflections and contact shadows have been upgraded. Crowds and much of the architecture remain procedural prototype assets.

The earlier v0.3 opening was AI-generated video, not conventional CGI rendered from authored 3D assets. That wording has been corrected. It remains in the repository as a historical asset but is no longer the game's opening. Read [opening and chase design](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/OPENING-AND-CHASE.md) for the depiction limits and controls.

## Delhi reference pass

The setting now uses real Delhi place names: Patel Chowk, Sansad Marg, and Jantar Mantar Road. Yellow, red-lettered Delhi Police-style barricades, a guarded-window transport bus, a protest tableau, metro/road wayfinding, and an observatory-inspired landmark replace generic-city cues. Read the [Delhi reference notes](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/DELHI-REFERENCES.md) for sources and modelling limits.

The route is still a compressed game layout, not surveyed geography. Models are source-referenced approximations, not actual scans; participants, building layouts, clashes, and the archive are fictionalised. No copyrighted news footage or real-person likeness is included.

## Play the first build

Open the [public game](https://nawaaaaaaaar.github.io/dissent-last-ballot/) in a browser with WebGL 2. It requires no account or installation. Desktop keyboard and phone touch controls are included; physical-device compatibility and frame-rate targets remain to be verified.

- **Phone:** Swipe left/right to change lanes, up to jump, down to slide. Large touch buttons provide the same actions. Tap the story button during interactions.
- **Keyboard:** Arrow keys or A/D move; Space/W jumps; down/S slides; E interacts; P/Escape pauses.
- **Objective:** Collect at least three evidence packets, preserve the journalist's footage, and reach the archive at 900 metres.
- **Settings:** Auto / low / high graphics, reduced camera motion, assist mode, and sound on/off.
- **Failure:** Collisions reduce condition. Retry from the most recent story checkpoint, or restart from the beginning.
- **Session only:** No save, login, tracking, or personal-data collection. Closing/reloading the page resets play.

This slice uses original procedural architecture, an articulated procedural human, and original synthesised audio; the AI-generated plaster asset from v0.1 is retained in the project. It does not yet use production-quality scanned assets, mocap animation, voice acting, or photorealistic character models. All narrative incidents in gameplay are fictional.

## The direction

Take the immediate readability of a lane-based runner, but replace the cartoon coin chase with a cinematic student-resistance story. Play a fictional student courier carrying an independently verified evidence packet through a protest and police crackdown. The emotional arc is isolation becoming solidarity, with fear, anger, confrontation, and disagreement inside the movement rather than an imposed pacifist lesson.

The political position is explicit: pro-resistance, anti-authoritarian, anti-fascist, critical of government repression, and opposed to vote theft. The story champions free assembly, electoral accountability, and the dignity of people who dissent. Police abuse and institutional power are central conflicts, not neutral scenery. Students' anger should not be dismissed or made morally equivalent to the conduct they are protesting.

The game need not exclude fictional physical confrontation or environmental destruction. It can depict a fictional barrier collapsing during a clash, damaged police buses, shattered windows, and punctured tyres as part of a scene and its aftermath. These are proposed fictional elements, not claims that those specific acts occurred at the researched demonstrations. They must not become practical sabotage tutorials, calls to attack real people, or propaganda encouraging real-world violence. The story does not reward sexual abuse, harm to bystanders, or attacks on identifiable real officials.

## Revised conflict and accountability

The earlier mandatory “nonviolent” framing has been removed following the creator's clarification. The design should represent a movement reacting to coercion, intimidation, and alleged abuse, not imply that resistance is legitimate only when polite or passive.

- **Fictional clash:** A scripted crowd-and-barricade set-piece can reshape the route, with animation, debris, sound, and consequences. Avoid real-world weak-point diagrams, tool selection, or sabotage procedures.
- **Journalist-led account:** A fictional journalist has agency over her testimony and the use of recorded evidence. Do not recreate sexual assault as a playable act, voyeuristic spectacle, or titillating cutscene.
- **Student perspective:** Characters can be angry, frightened, defiant, and divided about tactics. Do not use a simplistic “violence score” that treats property damage and abuse of a person as interchangeable.
- **Accountability arc:** An independent investigation, survivor-controlled testimony, and institutional consequences provide the ending. Breaking a prop does not itself prove an allegation or deliver accountability.
- **Player objectives:** Protect people and evidence, stay with companions, and complete the mission. Destruction may occur in the fictional drama, but there is no bonus for injuring police, journalists, or bystanders and no real-world call to action.

## What the references likely mean

I provisionally interpret “jatamantek” as **Jantar Mantar** and “ochori” as **vote chori**. That interpretation still needs confirmation before we make a literal-location game or write real-world slogans into final assets.

National Herald reported detentions at a Jantar Mantar demonstration on September 25, 2026, organised by AISA and civil-society participants over alleged electoral-roll irregularities; the police account quoted in that report said permission had not been obtained. [National Herald reporting](https://www.nationalheraldindia.com/national/police-detain-activists-demanding-arrest-of-gyanesh-kumar-over-vote-chori)

India Today reported an Indian Youth Congress demonstration from Jantar Mantar towards Raisina Road on October 2, 2026, with election cards, black skeleton costumes, and slogans concerning “vote chori,” “kanun chori,” and examination paper leaks. [India Today reporting](https://www.indiatoday.in/india/video/vote-chori-protest-youth-congress-hits-delhi-streets-over-paper-leak-and-eci-ytvd-3008387-2026-10-02)

The New Indian Express reported opposition allegations about electoral-system capture and also reported the Election Commission's position that differing views are normal institutional deliberation and its orders have legal sanction and follow statutory procedures. [The New Indian Express reporting](https://www.newindianexpress.com/amp/story/india/2026/Oct/01/vote-chori-wont-be-tolerated-voices-against-electoral-system-capture-growing-louder-congress)

These reports establish that protests and allegations were reported, not that every allegation is proven. The game can take a strong political position without converting disputed accusations about identifiable people into established facts. This is a focused starting scan, not an exhaustive investigation or a reconstruction of all events.

### Journalist complaints and student-treatment allegations

India Today's October 4 report says three women journalists alleged sexual harassment during the October 3 protest, and Delhi Police said their complaints had been transferred to the Crime Branch for a fair and impartial inquiry. The report does not establish a completed investigation or a finding against an officer. [India Today on the complaints and inquiry](https://www.indiatoday.in/amp/india/story/delhi-police-misconduct-journalist-claim-rahul-gandhi-amit-shah-cjp-jantar-mantar-protest-gyanesh-kumar-resignation-ptag-3009066-2026-10-04)

A PTI report published by ThePrint on October 3 describes around 150 detentions and AISA members' allegations that officers manhandled and abused Neha Bora; it explicitly says those allegations could not immediately be independently verified. [PTI reporting via ThePrint](https://theprint.in/india/aisa-activists-return-to-jantar-mantar-around-150-protesters-detained/3061032/?amp)

Neither of these two reports documents punctured tyres, broken bus windows, or protesters breaking barricades. [India Today's account](https://www.indiatoday.in/amp/india/story/delhi-police-misconduct-journalist-claim-rahul-gandhi-amit-shah-cjp-jantar-mantar-protest-gyanesh-kumar-resignation-ptag-3009066-2026-10-04) [PTI's account](https://theprint.in/india/aisa-activists-return-to-jantar-mantar-around-150-protesters-detained/3061032/?amp)

That limited source check does not establish that such damage never happened. Until further evidence is supplied or verified, any such game scene remains fictional rather than a reconstruction of a documented incident.

## Fictional story, factual context

Current setting: a compressed, dramatised route through real Delhi place names, informed by public streets and protest reporting. Keep officials, participants, and the independent archive fictional; the police institution and public setting can be represented without inventing findings about named individuals. Maintain sourced context with dates and distinctions between allegation, official response, and independently established finding.

Do not import real voter records, activists' private details, or identifiable protest photographs as game assets. Research links are not licenses to reuse photos, speeches, music, or footage. Any real-location reconstruction, real-person likeness, or copyrighted asset needs a separate rights review.

## The playable loop

- **Run:** Automatic forward movement, three readable lanes, responsive left/right movement, jump, and slide. Borrow the control grammar, not Subway Surfers' characters, art, UI, music, or code.
- **Read the street:** Choose between a wider boulevard and a narrower market passage. A fictional crackdown, contested barricade, damaged vehicles, and moving crowds change the route.
- **Protect the packet:** Collisions damage evidence integrity and break the run's rhythm. No gore, weapon combat, or real-world evasion instructions.
- **Build solidarity:** Optional rescue and handoff beats trade route time for solidarity points. NPCs are people with agency, not collectible props.
- **Finish the mission:** Deliver the packet and survivor-authorised testimony to a fictional independent archive. The resolution centres investigation and consequences for abuse, not just arrival at a cheerful rally.
- **Replay:** Route variations and optional objectives change each attempt. Unlock appearance customisation and story fragments, not pay-to-win upgrades.

The v0.1 slice implements a roughly two-minute, 900-metre route at its intended simulation rate: one courier, lane choices, obstacles, pickups, a scripted barrier collapse, a journalist handoff, condition, checkpoints, and a finish sequence. A freely explorable confrontation area, multiple route branches, and companion AI are not implemented; solidarity currently records packet collection and story interactions.

### Example mission beat

A courier leaves a printing shop as dusk settles. A fictional police crackdown scatters a student gathering. A contested barrier collapses in a scripted scene; the route passes damaged vehicles and shattered glass, without demonstrating how the damage was caused. A journalist asks the courier to preserve footage and her account on her terms. The player can stop at a safe handoff point to help another student duplicate the packet, losing time but keeping the group connected. The ending opens an accountability process rather than claiming that damage alone brought justice.

The evidence itself is fictional. Gameplay should not teach someone how to evade real police, circumvent a real security system, or disseminate private personal information.

## Visual target

The target is grounded realism, not generic neon cyberpunk, voxel streets, floating cubes, or a reskinned template. Proposed art direction:

- **Street materials:** Worn plaster, stone paving, painted metal shutters, grounded traffic furniture, believable posters and layered shop signage.
- **Light:** Dusk with warm shop interiors, neutral street lighting, subtle atmospheric depth, and restrained wet-surface reflections. Keep the next obstacle readable.
- **Characters:** Properly rigged humans, convincing weight shifts, transition animation, hair and clothing silhouettes, and foot placement that avoids sliding.
- **Camera:** A close third-person chase camera with controlled speed response and no mandatory camera shake. Preserve visibility around branches.
- **Sound:** Spatial footfalls, market ambience, distant assembly sound, original music, and a legible mix. Do not silently autoplay audio.
- **Interface:** Minimal evidence-integrity and mission feedback, readable on phones and large screens. No promotional “AAA” claim without an actual tested build.

This concept page is not evidence that the visual target has been achieved. Concept art, pre-rendered trailers, and actual gameplay must always be labelled separately.

## Technical decision

My recommendation is to treat a **browser-playable vertical slice** and a **high-end native version** as distinct delivery targets. Shareability favours a web build; maximum visual fidelity favours a native engine production. Do not promise identical performance or visuals across them.

For a browser-first slice, evaluate a WebGL engine with glTF character and environment assets, physically based materials, a controlled lighting budget, compressed textures, level-of-detail variants, and pooled obstacles. Choose the engine after an art-and-performance spike rather than because a model can generate code for it.

For a native-first production, evaluate Unreal Engine with a Blender asset pipeline. A native build would need separate packaging, distribution, and device QA; a public website would remain the landing page rather than magically run the native executable.

The first slice is implemented in Three.js/WebGL 2 with static geometry batching and low/high graphics modes. Performance on physical target phones has not been benchmarked. Asset purchases, engine services, streaming services, and hosting with charges require separate approval.

### Production acceptance gates

- **Art gate:** One approved street segment and one approved animated courier in-engine, not just a still render.
- **Gameplay gate:** Start, tutorial, mission completion, collision failure, pause, restart, and branch selection all work.
- **Performance gate:** Measure frame pacing on named target devices. Propose 60 fps on an agreed desktop and 30 fps on an agreed mid-range phone; do not claim those targets were met before profiling.
- **Reliability gate:** Test repeated runs, tab changes, browser resize, interrupted loading, touch gestures, and lost graphics context.
- **Accessibility gate:** Rebindable keyboard controls, touch controls, reduced motion, subtitles, adjustable sound, and readable contrast.
- **Rights gate:** Record provenance, licence, and attribution for every asset. No scraped protest media without permission.
- **Release gate:** Reproducible build, versioned release notes, smoke tests, deployment rollback, and clear disclosure of supported devices.

## What the model examples actually show

OpenAI's Astra page shows game examples including Kart Racer and Spaceship, and describes a Blender-to-Unreal workflow for a walkable scene. It supports investigating an AI-assisted art-and-engine pipeline, but does not provide a production-readiness guarantee for this project. [OpenAI's GPT-6 Astra page](https://openai.com/index/gpt-6-astra/)

MindStudio's September 6 workflow describes concept art, Blender modelling, rigging/animation, engine integration, audio, and play-testing with Astra; it also describes a roughly 12.5-hour project as unfinished and its results as not production-ready, including awkward poses and inconsistent proportions. This is a secondary account, not my own reproduction of the workflow. [MindStudio's practical workflow](https://www.mindstudio.ai/blog/gpt-6-astra-video-game-development)

Anthropic reports that an early tester compared single-prompt games and rated Opus 5.5 highly for graphics and polish; the page does not identify the tester, game, scores, or a reproducible game benchmark. [Anthropic's Opus 5.5 introduction](https://www.anthropic.com/claude-opus-5-5)

Min Choi's September 2 roundup includes creator-posted Fable 5.1 examples of kart games, Minecraft-like worlds, Three.js shooters, and a subway FPS. These are useful references for candidate workflows, not independently verified evidence of shippable games or proof that an entire game took only one prompt. [Fable demonstration roundup](https://x.com/minchoi/status/2094990525912752547)

The transferable lesson is a staged process: art target → geometry and material production → rigging and animation → engine assembly → repeated play-testing → measured optimisation. Model choice can help, but cannot substitute for licensed assets, consistent art direction, animation quality, playability, and release testing.

No other model was invoked to build or evaluate this concept. Researching demonstrations is not the same as reproducing them.

## Proposed milestones

- **Pre-production, completed initial pass:** Concept, sourced initial research, visual standards, and a public review page.
- **Art-and-performance spike:** One street module, one rigged character, lighting options, and performance measurements.
- **Playable vertical slice, v0.1:** Initial complete mission with start, finish, failure, controls, synthesised audio, touch input, and basic accessibility; final QA and physical-device validation remain separate gates.
- **Production expansion:** More routes and story beats only after the vertical slice passes its acceptance gates.
- **Release candidate:** Device matrix, asset audit, reproducible builds, public release and rollback plan.

## Decisions needed before the playable build

- Confirm whether “jatamantek” and “ochori” mean Jantar Mantar and vote chori.
- Choose fictionalised Delhi-inspired politics or a literal real-world setting.
- Choose browser-first shareability or native-first maximum visual fidelity.

Current direction: Delhi-grounded, browser-first vertical slice with fictional participants and a journalist-accountability arc. Strong political intent should be expressed through the player's purpose and the world, not just pasted slogans. Fictional clashes and destruction are compatible with that story; practical real-world sabotage instruction or encouragement is not.

## Repository and publishing

The `docs/index.html` page runs the playable slice; `docs/concept.html` preserves the concept dossier. Neither has analytics, personal-data collection, voter data, or external service credentials. GitHub Pages serves `docs/` from `main`; the Markdown brief remains the canonical detailed design document.

To preview locally: `python -m http.server 5173 --directory docs`, then open `http://localhost:5173`. The checked-in browser code and Three.js module are served directly; there is no build step. `package-lock.json` pins the library used for the vendored module. Read `ASSETS.md` for provenance.
