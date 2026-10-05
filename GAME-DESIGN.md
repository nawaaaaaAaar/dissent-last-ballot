# DISSENT: making the resistance story playable

## v0.7 correction: action before exposition

The creator's response to v0.6 was “Make it game actually.” Its mechanics passed functional tests, but too much of the experience still consisted of walking to markers and confirming dialogue. The default mode is now a short action chapter: immediate pursuit → recorder recovery → held barricade interaction → Kabir → assembly, with optional hold-to-help rescues along the way.

Stamina, a cooldown dodge, five health pips, telegraphed red zones and fallen obstacles create moment-to-moment decisions. Movement away from a warning, a correctly timed jump or a dodge can prevent a hit. The player can spend time helping others for health and score, or focus on the critical route. A run rank rewards remaining health, time and help rather than injuries or destruction points.

The older story chapter remains separately selectable; its two narrative destinations are not two branches of the new action mode. This change is an implemented response to feedback, not evidence that the new loop has already passed novice playtests. The art is retained, not newly photorealistic.

The design goal is an accessible third-person exploration game that a person can enjoy without arriving as an expert gamer or political researcher. The narrative should emerge from useful actions, uncertainty, relationships and consequences, not a sequence of compulsory lectures. This brief records the research, its application to v0.6, and what remains unproven.

## What makes this kind of game work

- **Experience before features:** Hunicke, LeBlanc and Zubek's MDA framework distinguishes mechanics, resulting dynamics and the experience the player feels; its aesthetic vocabulary includes narrative, discovery, challenge and fellowship. It explicitly says there is no universal formula that produces fun ([MDA paper](https://users.cs.northwestern.edu/~hunicke/MDA.pdf)). Our selection is discovery, narrative, manageable challenge and solidarity; adding generic loot, weapons or a vast map would not automatically serve those goals.
- **Agency, competence and connection:** Przybylski, Rigby and Ryan's motivational model connects game appeal to autonomy, competence and relatedness, but the repository provides an abstract rather than the full evidence and methods ([University of Essex research record](https://repository.essex.ac.uk/7228/)). We translate that into choosing the handoff, learning clear actions, and deciding whether to stay with a friend; this is a design hypothesis, not proof that our particular quests are enjoyable.
- **Teach, test, twist:** The Level Design Book recommends teaching an activity, testing recognition and then changing its context; it also recommends alternating intensity with rest and using a clear critical path while retaining freedom in nonlinear spaces ([pacing guidance](https://book.leveldesignbook.com/process/preproduction/pacing)). The safe supply search teaches exploration and interaction, recorder recovery repeats them with personal stakes, and the pressured handoff adds an optional companion decision. The ending provides relief rather than another difficulty spike.
- **Readable objectives:** Microsoft's objective-clarity guidance recommends reviewable tasks, progress counts and directional clues, with clear descriptions ([Xbox Accessibility Guideline 109](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/109)). We added item counts, a distance hint, the map and a journal, but do not claim full guideline compliance.
- **Difficulty without exclusion:** Microsoft's difficulty guidance recommends adjustable challenge, low-difficulty narrative progression, pause and regular saving, while calling for consultation with users and the disability community ([Xbox Accessibility Guideline 108](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/108)). Story assist slows pursuit, widens the rhythm window and offers a skip; it can be changed in the journal. Local checkpoints protect progress when browser storage is available.

These sources concern complementary design lenses, not a single recipe for every genre. Shooter, puzzle, strategy, rhythm and exploration games can emphasise different experiences; DISSENT borrows readable learning and feedback, not another game's copyrighted assets, characters or entire system.

## Core loop

Notice a person or clue → explore toward it → perform a clear action → see an immediate result → understand a new stake → choose the next move.

In v0.6 the player physically visits and collects supplies, returns them to first aid, recovers a recorder, chooses the account's destination, joins a short resistance-rhythm event and travels under pressure. Optional story fragments reward looking around with context rather than extra damage points.

No game task should require knowing the actual protest chronology. The opening gives a human purpose, finding Kabir, before introducing the larger conflict. Political understanding can deepen as the player discovers why people remain at the gathering.

## Story arc and pacing

- **Arrival:** Low pressure. Aman meets Mira, learns movement and interaction, and finds water. Optional objects establish Kabir's absence and the gathering's memory.
- **Responsibility:** Dev sends Aman toward Sana's dropped recorder. Sana controls the use of her account. The player chooses a public statement or a protected record.
- **Confrontation:** A brief rhythm activity represents coordinated fictional resistance. Three successful beats bring down the authored barricade; misses have no punishment, and story assist can bypass the timing.
- **Cost:** Officers pursue Aman. Kabir can be helped to rejoin him, but stopping creates exposure. This is a simplified dramatic system, not realistic police tactics or a real-world evasion lesson.
- **Handoff:** The chosen destination and whether Kabir was helped change the ending. The account survives, but accountability is not magically settled.

The intended first-time chapter length is roughly 5–8 minutes including reading and exploration. This is a design target, not a measured novice-player completion-time claim.

## Choices with visible consequences

- **Public statement:** The assembly hears Sana's authorised statement. It creates a public narrative of resistance, not a finding about an actual allegation.
- **Protected account:** The record desk accepts the account while withholding identifying details in the public copy. The destination and ending differ; this is not merely an alternate line attached to the same route.
- **Stay with Kabir:** Helping activates companion-follow behaviour and changes the ending. Leaving him unassisted keeps his absence unresolved. There is no simplistic good/evil meter.
- **Explore or focus:** Optional fragments add personal context. They are not required to win and do not generate an endless collectible grind.

The state crackdown remains the antagonist. Mutual aid and testimony do not impose a pacifist restriction; the fictional barricade confrontation is part of the critical path. The game does not turn sexual assault into a playable act or provide practical sabotage instructions.

## Visual and movement work

The protagonist and non-police participants now use licensed textured Rocketbox adults with compatible idle, walking and running clips; their rig orientations were retargeted in Blender and root XY motion removed. The library is released under MIT and provides rigged avatars and compatible animations ([Microsoft Rocketbox](https://github.com/microsoft/Microsoft-Rocketbox)).

The selected walking clip travels about 1.214 metres over 1.2 seconds in its source FBX; the selected running clip travels about 2.112 metres over 0.733 seconds. These are measurements from the included source files, not vendor benchmark claims. Playback is scaled to game travel speed to reduce skating: default walking is 1.8 game metres/second, running 4.6, with contextual actor speed driving clip playback.

The police retain the earlier simplified khaki characters. Faces still have no conversational performance, background participants reuse a small avatar set, jumping has no dedicated authored clip, and there is no foot-contact IK or cloth simulation. This is an upgrade, not a claim of final photorealism.

## What would establish enjoyment

Automated QA can establish that controls, branches and checkpoints work. It cannot establish that an ordinary person finds the game enjoyable.

The next human-playtest gate should include at least five people unfamiliar with the build. Observe, without rescuing them immediately:

- **Comprehension:** Can they identify the next objective and how to interact? Where do they become confused?
- **Competence:** Can they complete the supply and rhythm activities? Does story assist remove frustration without removing all engagement?
- **Curiosity:** Do they explore optional objects voluntarily, or only obey the main marker?
- **Investment:** Can they describe Sana's choice and why Kabir matters? Does the ending reflect the decision they remember making?
- **Feel:** Do camera movement, animation, sound and phone input feel responsive? Record the actual phone/browser and frame pacing.
- **Desire to continue:** Would they choose another chapter, and why? A positive response is evidence to gather, not something this build already guarantees.

Targets and observations should guide revision. If the water search feels like padding, shorten it or add a more interesting situation; do not defend it simply because it implements a design theory.
