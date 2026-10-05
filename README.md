# DISSENT: City of Accounts

An original **mobile-first top-down 3D resistance action adventure** in a connected central-Delhi map. The strict-review rework changes encounter pacing, stamina-limited combos, shield and rush behaviour, held dispatch copying, staged gathering support and escort, checkpoint recovery, street rendering and character presentation. Graphics were worked on in this pass, not deferred: textured façades, roof detail, original street props, rigged uniform adaptations, revised lighting, animation timing and a coherent interface replace substantial portions of the earlier placeholder treatment.

Read [the ranked review and replay findings](STRICT-REVIEW.md) before treating feature completion as quality approval. Start near the fictional Jantar street gathering rather than taking an empty opening drive from CP. The original OSM footprint data is preserved separately from display contours trimmed around arcade-width vehicle streets; this is not an exact digital twin or a real-world navigation tool.

[Play the public game](https://nawaaaaaaaar.github.io/dissent-last-ballot/) and choose **PLAY · City of accounts**. Open **Map & Missions** for the whole map, other jobs, upgrades and a save code. The [winning guide](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/HOW-TO-WIN.md) is also available in game.

## Playable loop

- **Choose:** Rescue a witness around Jantar Mantar, copy a dispatch under pressure and carry it from Tolstoy Marg to the fictional India Gate relay, or secure a gathering, restore aid and escort two readers from Sansad Marg.
- **Act:** Move freely, run with stamina, dodge warned attacks, use directional close-range strikes, break or bypass a fictional barricade, enter/exit a van, drive, hide and protect a companion.
- **Return:** Earn a medal, best score and support credits. Continue at your current city location instead of rebuilding the world. Three distinct operations unlock the charter journey; the charter begins another network cycle.
- **Replay:** Different guard approaches, an occasional return-route roadblock, selectable Hard pressure and capped later-cycle guard speed. Buy strike tempo, vehicle reinforcement or running endurance; no purchases or accounts are involved.
- **Explore:** Drive/walk between CP, Jantar Mantar and India Gate in one continuous area. The local radar shows the suggested route; the full map shows landmark relationships.
- **Keep progress:** Export/restore a code for completed jobs, credits, upgrades and scores. In-tab active checkpoints are separate and do not survive reload.

This is not multiplayer, an unlimited mission generator or a GTA-scale city simulation. The hypothesis is that distinct operations, route choices and mastery offer better reasons to return than more identical pickups. Independent player enjoyment has not been established.

## Controls

- **Phone:** Left stick moves/drives; its outer edge runs on foot. Hold right stick to aim/strike or use Strike with nearby aim assist. Dodge and contextual Action are separate buttons. Release the stick or hold Brake/right stick to slow the van.
- **Desktop:** WASD/arrows move/steer, Shift runs, held Space strikes or brakes, Q dodges, E acts/boards/exits, mouse aims, P/Escape pauses, M opens the mission board.
- **Winning:** Read [HOW-TO-WIN.md](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/HOW-TO-WIN.md). Hot deliveries cannot win; rescued Kabir must accompany the player. Rally ends only when both escorted readers reach the assembly.

## Map, movement context and fiction

The OSM extraction contains 1,852 road/path ways, 785 above-ground source footprints and 124 green-space polygons from a central-Delhi bounding box. The displayed city uses 493 adapted footprint parts. The geometry database is **© OpenStreetMap contributors, ODbL 1.0**; attribution is displayed in game, following [OpenStreetMap’s copyright guidance](https://www.openstreetmap.org/copyright/en-EN). Raw source, extraction script and runtime geometry are retained.

Horizontal positions are georeferenced at a uniform compressed scale. Streets are widened, traffic/one-way restrictions and elevation are not simulated, and building heights and monument models are approximate. This is connected central Delhi, not all Delhi or a survey-grade digital twin.

The October 2 reference concerns Jantar Mantar and reported approaches/nearby protest-related locations, including Sansad Marg and Tolstoy Marg ([The Tribune’s dated reporting](https://www.tribuneindia.com/news/delhi/over-1k-detained-in-delhi-as-protesters-demand-cecs-exit/amp)). CP and India Gate are fictional network hubs, not unsupported claims of active vote-chori protests at every landmark.

The story carries leadership accountability, ending contested SIR and transparent support for every eligible voter beyond a resignation-only resolution. [The movement research](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/CURRENT-MOVEMENT.md) preserves claim/response distinctions. Adults, cases, clashes and outcomes are fictional; no real-person combat targets, personal voter records or realistic sabotage instructions are included.

## Development and verification

Run `npm ci`, install Chromium with `npx playwright install chromium`, then `npm start`. `npm test` runs the current city rules checks; `test:breakout` and the old campaign scripts are historical. Current source is `docs/city-rules.js`, `docs/city-data.js`, `docs/breakout.js` and `docs/index.html`. Run `npm run build:map` to reproduce both extraction and street-clearance trimming from the retained OSM data.

`render_game_to_text()` exposes inspectable state, including mission, route, network and map provenance. `advanceTime(ms)` provides deterministic QA time, not a physical-device FPS benchmark. The supplied game client and persistent Playwright inspect actual input/rendering; cloud-browser records distinguish normal-time playing from deterministic touch tests.

Read [the city design and research](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/CITY-LOOP.md), [QA scope](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/QA.md) and [asset provenance](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/ASSETS.md). The previous small-world game is retained at [the Breakout archive](https://nawaaaaaaaar.github.io/dissent-last-ballot/breakout-v13.html), with `README-v13.md`.

## Art status

Existing licensed human meshes, locomotion, materials, tree assets, lighting and vehicles are reused. The new footprint-based blocks, CP columns, India Gate arch and observatory are coarse original approximations, not detailed scanned monuments. Faces, clothing, combat animation, street frontage and crowd behaviour still fall short.

This is a **playable gameplay/world iteration, not the requested final high-graphics or production-ready game**. Realistic graphics remain a requirement. Physical iPhone/Android performance, Safari and first-time-player enjoyment remain unverified.
