# DISSENT: what game are we making?

DISSENT is a mobile-first, third-person resistance adventure. The player moves freely through authored districts, helps a network survive a crackdown, opens contested spaces and brings people and accounts together. It is not an endless runner, a protest-history quiz, a huge seamless city or an injury-scoring simulator.

## The problem with the earlier versions

The runner reduced protest to scenery. The first explorable chapter then reduced too much play to markers and dialogue confirmations. The action pass added pressure, but remained a short, isolated street with a crowded interface. Those implementations were functionally playable; that did not establish an appealing game identity or a satisfying campaign.

Adding more objects to that street would not solve the underlying problem. This rebuild chooses a repeatable loop, distinct mission verbs, connected consequences and a simpler input budget before extending the setting.

## Research and interpretation

### Bounded worlds with real choices

In his interview about Dishonored 2, Harvey Smith distinguishes a home base and self-contained “mini-open worlds” from a single seamless mission, and describes multiple pathways and substantially different mission areas ([PC Gamer interview](https://www.pcgamer.com/harvey-smith-talks-chaos-open-worlds-and-the-differences-between-dishonored-2-and-prey/)). The relevant lesson is bounded, differentiated spaces with agency, not copying Dishonored's weapons, assassination premise or proprietary assets.

Our decision: three independently explorable districts connected by a campaign map. Each has a distinct layout, purpose and encounter structure. They are not adjacent neighbourhoods squeezed into a false continuous Delhi geography.

### Politics through people and consequences

Navid Khonsari describes 1979 Revolution as an attempt to humanise an experience through a participant's perspective, using relationships and research rather than an omniscient history lesson ([ACMI creator interview](https://www.acmi.net.au/stories-and-ideas/1979-revolution-black-friday-navid-khonsari/)). A separate interview describes decisions affecting friends, family and safety, including tensions between characters with different attitudes toward confrontation ([Game Developer](https://www.gamedeveloper.com/design/how-i-1979-revolution-black-friday-i-drops-players-into-a-real-crisis)).

These are creator accounts and examples, not experimental proof that a particular political game is enjoyable. Our interpretation: the state's repression remains the antagonist, but protesters should have purposes, relationships and agency beyond being rescue props. Resistance includes confrontational route-opening, mutual aid, maintaining a gathering and protecting an account. No sexual assault is made playable, and no real-world sabotage instructions are provided.

### Discernible and integrated outcomes

East Carolina University's teaching resource discusses meaningful play as an action producing an identifiable outcome integrated into the larger game, drawing on Salen and Zimmerman ([ECU resource](https://ofe.ecu.edu/udlmodules/multiple-means-of-action-and-expression/game-based-learning-using-games-to-increase-representation-expression-and-engagement/)). This is an educational interpretation, not direct validation of DISSENT.

Our decision: a rescue moves someone, regrouping produces an actual following companion, opening a line changes access, active community stations sustain a visible gathering, and completed district outcomes appear in the campaign record. Score is feedback, not the thematic point of helping.

### A two-thumb input budget

Apple's handheld-game presentation recommends broad movement and camera regions, context-sensitive actions, edge anchoring, safe-area awareness and integrating sprint into the thumbstick rather than requiring another button; it recommends a default 44-point touch target and real-device testing ([Apple presentation](https://developer.apple.com/videos/play/meet-with-apple/243/)). Microsoft's touch-layout guide likewise notes the usual two-thumb input limit, prioritises frequent actions and suggests combining held locomotion actions with the joystick ([Microsoft guide](https://learn.microsoft.com/en-us/gaming/gdk/docs/features/common/game-streaming/building-touch-layouts/game-streaming-tak-designers-guide?view=gdk-2604)).

Our decision: on phones the joystick controls walk/run speed, dragging the world controls the camera, and the right thumb gets Dodge, Jump and a contextual action only when relevant. Keep one current objective, health and stamina; move campaign statistics to the map and ending rather than filling the play screen with counters. Desktop retains keyboard shortcuts. Browser emulation is not physical-device certification.

## Understanding the places without falsifying history

- **Jantar Mantar:** Reporting on October 2, 2026 describes electoral-roll allegations, blocked approaches, detentions and police denials of manhandling; reported and police detention totals differ ([The Indian Express](https://indianexpress.com/article/cities/delhi/jantar-mantar-protest-gyanesh-kumar-700-detained-delhi-10904136/)). The game does not adjudicate those allegations or reenact named individuals.
- **Jamia area:** Reuters records campus tear gas on December 15, 2019 ([Reuters timeline](https://www.reuters.com/graphics/INDIA-CITIZENSHIP/PROTESTS/jxlbpgqlpqd/index.html)). Subsequent reporting distinguishes library footage, university/student accounts and the police explanation that they entered in pursuit of alleged rioters ([The Indian Express](https://indianexpress.com/article/cities/delhi/jamia-police-violence-library-new-video-students-6271631/)). A 2023 anniversary report identifies a gathering at Gate No. 7, with placards, speeches and peaceful dispersal ([The New Indian Express](https://www.newindianexpress.com/states/delhi/2023/Dec/17/four-yearsafter-caa-stir-jamia-students-decry-police-action-2642226.html)). This informs a campus-gathering setting, not an exact gate scan or a recreated assault.
- **Shaheen Bagh:** Reuters documents the women-led sit-in beginning in December 2019 and its clearance in March 2020, including the government's stated coronavirus rationale ([Reuters](https://www.reuters.com/graphics/INDIA-CITIZENSHIP/PROTESTS/jxlbpgqlpqd/index.html)). Mobeen Hussain discusses public-space reclamation and cross-religious solidarity there ([History Workshop](https://www.historyworkshop.org.uk/feminism/south-asian-women-reimagine-public-space/)). This supports a community-led gathering mission, not a claim that the historical sit-in is still happening.

These histories are not collapsed into one real day or one real movement. DISSENT's connected campaign is fictional, using reference-inspired places and invented adult characters. The campus and market architecture are authored approximations, not photogrammetry, exact street plans or claims about today's gatherings. One historical essay conflates descriptions of CAA and NRC; its legal-policy explanation is not adopted as authoritative.

## The chosen campaign

### Jantar Mantar: Break the line

Recover the recorder, open the authored barricade, reunite with Kabir and reach the assembly. Optional help changes the network record. The main path teaches movement, contextual actions and pressure without requiring a lecture.

### Jamia area: Keep them together

Regroup Mira and Kabir in a campus courtyard, lead them through a choice of lanes around buildings, open the exit and arrive together. Movement speed and separation matter: running alone is not a completed escort. This tests the earlier controls with responsibility for the group.

### Shaheen Bagh-inspired gathering: Hold the space

Activate the community kitchen, aid point and reading circle in any order, then sustain the gathering before the assembly handoff. It is about maintaining a collectively organised place, not rescuing passive women or simply renaming the recorder chase. Police pressure makes the player move, while the supported gathering makes that movement purposeful.

## Core loop and failure

Read the immediate situation → choose a route or person → move and act → see the world respond → manage pressure → complete a collective objective → carry the district outcome into the campaign.

Health and stamina are legible action constraints. A dodge has a cooldown; warning zones give time to respond. Checkpoint retries preserve the mission's achieved stage within the tab. The campaign record saves completed districts when browser storage is available; no private testimony or analytics is sent to a server. Challenge assist remains available without restarting.

## Acceptance gates

Implementation must prove three distinct playable missions, actual companion arrival, a sustain objective, district switching and replay/reset, campaign continuation, touch movement/action and portrait/landscape fit. Review actual rendered scenes rather than generated promotional images.

This still requires human testing: first-time comprehension, voluntary exploration, willingness to continue, difficulty calibration, camera comfort and actual phone frame pacing. Neither design research nor automated completion proves ordinary people will enjoy the game. The existing character/art limitations remain; adding districts is not a declaration of photorealism or production readiness.
