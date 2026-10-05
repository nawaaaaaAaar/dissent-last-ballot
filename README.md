# DISSENT: Breakout

An original **top-down 3D resistance action mission** with mobile dual-stick input. This is v0.12: a replacement game design, not more tasks added to the earlier campaign. Fight, break a fictional police line, rescue a companion, board a volunteer van together and escape through a connected street grid.

[Play the public game](https://nawaaaaaaaar.github.io/dissent-last-ballot/) and choose **PLAY · Breakout**. [Controls and winning route](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/HOW-TO-WIN.md) are also available inside the game.

## What is playable

- **On foot:** Free movement, stamina-based running, directional close-range strikes, short invulnerable dodge, first aid and a four-hit breakable barricade. Enemy wind-up circles make incoming attacks readable; striking interrupts them.
- **Rescue:** Clear or draw away nearby guards, help Kabir, recover Sana's recording and wait for your companion before boarding. Leaving without him does not satisfy the mission.
- **Driving:** World-direction arcade steering, acceleration, braking, vehicle condition, building collisions and a pursuing patrol vehicle. The west road has a roadblock; the longer east route bypasses it.
- **Pursuit:** Buildings block sight. Search follows the last seen position; heat falls only after remaining unseen. Parking at the safe house while being pursued is not a victory.
- **Replay:** Time/health/van-condition score, capture or vehicle-disable failure, fresh restart and in-tab rescue/boarding checkpoints. Active checkpoints do not survive reload.

The old three-district game is preserved at [the campaign archive](https://nawaaaaaaaar.github.io/dissent-last-ballot/chapter-v11.html); its previous documentation is in `README-v11.md`. It is not the current default.

## Controls

- **Phone:** Left stick moves; its outer edge runs on foot. Right stick aims and repeatedly strikes while held. Dodge and contextual Action are separate buttons. In the van, the left stick steers and accelerates; release it to coast down or hold Brake/right stick to stop.
- **Desktop:** WASD/arrows move or drive, Shift runs, Space strikes or brakes in the van, Q dodges, E rescues or enters/exits the van. Mouse aims; hold its left button on the world for repeated strikes. P/Escape pauses.
- **Guidance:** Gold marks the current objective, green marks the western safe house. The minimap shows streets, people and opponents. The guide pauses gameplay.

## Story and boundaries

Aman must bring Kabir and Sana's recording out of a fictional crackdown so a voter-inclusion support network can continue. The ending carries leadership accountability, ending the contested SIR process and inclusion/review support for eligible voters beyond a resignation-only response. It does not claim actual policy change or a real election outcome.

The current movement's sourced context and disputed-claim distinctions remain in [CURRENT-MOVEMENT.md](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/CURRENT-MOVEMENT.md). All encounters, adults, records and outcomes are fictional. This compact street grid is Delhi-inspired, not a surveyed Jantar Mantar reconstruction. No real-person combat targets, personal voter records, realistic sabotage instructions or external political messages are included.

## Development and verification

Run `npm ci`, `npx playwright install chromium`, then `npm start`. `npm test` runs eight isolated rules checks; `npm run test:browser` completes the current mission with actual keyboard input and tests pause/help, both routes, capture and retry. `npm run test:mobile` exercises actual touch in phone emulation. `DISSENT_URL` can point either browser suite at the public page. Historical `test:campaign`, `test:tutorial` and other old scripts belong to the archived campaign, not current-game signoff.

Original rules are in `docs/breakout-rules.js`, rendering/input in `docs/breakout.js` and interface in `docs/breakout.css`. `render_game_to_text()` exposes inspectable state and `advanceTime(ms)` advances deterministic QA time; QA stepping is not a device FPS measurement.

Read [the replacement design](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/BREAKOUT-DESIGN.md), [verification scope](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/QA.md) and [asset provenance](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/ASSETS.md).

## Honest art status

Licensed textured human meshes, locomotion, scanned road materials, photographic tree assets, HDR reflections, original vehicles and directional shadows are present. Police anatomy, combat animation, building detail, faces and crowds remain simplified. This is **a playable systems slice, not the requested final high-graphics or production-ready game**. High-quality real-world-looking art remains an acceptance requirement; physical phones, Safari and first-time-player enjoyment still need testing.
