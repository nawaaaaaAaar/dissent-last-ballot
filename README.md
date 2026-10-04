# DISSENT: The Last Ballot

A realistic 3D resistance runner about carrying evidence through a city that wants it silenced.

**Status: research and concept only. No playable game, finished 3D assets, or production-ready build exists in this repository yet.** The working title, setting, and technical direction are proposals for review.

## The direction

Take the immediate readability of a lane-based runner, but replace the cartoon coin chase with a cinematic, nonviolent courier mission. Play a fictional student courier carrying an independently verified evidence packet to a public assembly. The emotional arc is isolation becoming solidarity: the city initially feels hostile, then ordinary people open routes, help the courier, and gather at the destination.

The political position is explicit: pro-resistance, anti-authoritarian, anti-fascist, critical of government repression, and opposed to vote theft. The story champions free assembly, electoral accountability, and the dignity of people who dissent. Its protagonist does not fight civilians, attack officials, sabotage infrastructure, or use weapons.

## What the references likely mean

I provisionally interpret “jatamantek” as **Jantar Mantar** and “ochori” as **vote chori**. That interpretation still needs confirmation before we make a literal-location game or write real-world slogans into final assets.

National Herald reported detentions at a Jantar Mantar demonstration on September 25, 2026, organised by AISA and civil-society participants over alleged electoral-roll irregularities; the police account quoted in that report said permission had not been obtained. [National Herald reporting](https://www.nationalheraldindia.com/national/police-detain-activists-demanding-arrest-of-gyanesh-kumar-over-vote-chori)

India Today reported an Indian Youth Congress demonstration from Jantar Mantar towards Raisina Road on October 2, 2026, with election cards, black skeleton costumes, and slogans concerning “vote chori,” “kanun chori,” and examination paper leaks. [India Today reporting](https://www.indiatoday.in/india/video/vote-chori-protest-youth-congress-hits-delhi-streets-over-paper-leak-and-eci-ytvd-3008387-2026-10-02)

The New Indian Express reported opposition allegations about electoral-system capture and also reported the Election Commission's position that differing views are normal institutional deliberation and its orders have legal sanction and follow statutory procedures. [The New Indian Express reporting](https://www.newindianexpress.com/amp/story/india/2026/Oct/01/vote-chori-wont-be-tolerated-voices-against-electoral-system-capture-growing-louder-congress)

These reports establish that protests and allegations were reported, not that every allegation is proven. The game can take a strong political position without converting disputed accusations about identifiable people into established facts. This is a focused starting scan, not an exhaustive investigation or a reconstruction of all events.

## Fictional story, factual context

Recommended setting: a fictional city with Delhi-inspired streets and a Jantar Mantar-inspired assembly ground. Use fictional officials and institutions in the narrative. Keep an optional, separately sourced context archive for real-world reporting, with dates, attribution, and distinctions between allegation, official response, and independently established finding.

Do not import real voter records, activists' private details, or identifiable protest photographs as game assets. Research links are not licenses to reuse photos, speeches, music, or footage. Any real-location reconstruction, real-person likeness, or copyrighted asset needs a separate rights review.

## The playable loop

- **Run:** Automatic forward movement, three readable lanes, responsive left/right movement, jump, and slide. Borrow the control grammar, not Subway Surfers' characters, art, UI, music, or code.
- **Read the street:** Choose between a wider boulevard and a narrower market passage. Obstacles are construction barriers, delivery carts, roadworks, and fictional closure gates.
- **Protect the packet:** Collisions damage evidence integrity and break the run's rhythm. No gore, weapon combat, or real-world evasion instructions.
- **Build solidarity:** Optional rescue and handoff beats trade route time for solidarity points. NPCs are people with agency, not collectible props.
- **Finish the mission:** Deliver the packet to a fictional independent archive at a public assembly. Celebrate successful verification and public accountability, not revenge.
- **Replay:** Route variations and optional objectives change each attempt. Unlock appearance customisation and story fragments, not pay-to-win upgrades.

Suggested first slice: a 90–120 second mission, one playable courier, one environment kit, one handoff, one branch, and one finish sequence. These are scope targets, not implemented features.

### Example mission beat

A courier leaves a printing shop as dusk settles. A road closure redirects the route into a market. A bookseller opens a short passage; taking it requires a tight jump and a slide under a shutter. The player can pause at a safe handoff point to help another courier duplicate the packet, gaining solidarity but losing time. The final boulevard opens onto an assembly ground where the packet's receipt is projected publicly.

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

Neither stack has been benchmarked for this project yet. Asset purchases, engine services, streaming services, and hosting with charges require separate approval.

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

- **Pre-production, this repository:** Concept, sourced initial research, visual standards, and a public review page.
- **Art-and-performance spike:** One street module, one rigged character, lighting options, and performance measurements.
- **Playable vertical slice:** One complete mission with start, finish, failure, controls, audio, and basic accessibility.
- **Production expansion:** More routes and story beats only after the vertical slice passes its acceptance gates.
- **Release candidate:** Device matrix, asset audit, reproducible builds, public release and rollback plan.

## Decisions needed before the playable build

- Confirm whether “jatamantek” and “ochori” mean Jantar Mantar and vote chori.
- Choose fictionalised Delhi-inspired politics or a literal real-world setting.
- Choose browser-first shareability or native-first maximum visual fidelity.

Recommended default: fictionalised Delhi-inspired setting, browser-first vertical slice, and a nonviolent courier story. Strong political intent should be expressed through the player's purpose and the world, not just pasted slogans.

## Repository and publishing

The `docs/index.html` page presents the concept, not a playable game. It has no analytics, personal-data collection, voter data, or external service credentials. GitHub Pages serves `docs/` from `main`; the Markdown brief remains the canonical detailed design document.

To preview locally, serve `docs/` with a static HTTP server. There is no game build step yet.
