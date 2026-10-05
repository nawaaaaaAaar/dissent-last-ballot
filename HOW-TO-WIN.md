# DISSENT: how to play and win

Open [the game](https://nawaaaaaaaar.github.io/dissent-last-ballot/) and choose **Learn to play & win**, then **Practise the controls**. The seven-step lesson has no pursuit. It teaches movement, sprinting, jumping, dodging, Rally, packet pickup and a held help action. Start a fresh campaign afterwards; leave Story assist checked for the first attempt.

## Controls and survival

- **Phone:** Left joystick moves, its outer edge runs. Drag the world with your right thumb to turn the camera. Use Jump, Dodge, Rally and the nearby contextual Action button.
- **Desktop:** WASD/arrows move, Shift runs, Space jumps, Q dodges, F rallies, E acts. Drag to turn the camera. P/Escape pauses.
- **Packets:** Walk over the three gold-ringed packet props. No button press is needed. Follow the direction arrow and distance; collection updates the counter.
- **Actions:** Stay close. Hold Action/E for one second to help. With Story assist, hold it for roughly two seconds at a barrier until the progress completes. A quick tap is not enough for a held action.
- **Survival:** Move out of red circles before the strike. Dodge protects you briefly. Rally costs 30 energy and has a six-second cooldown, so use it when pursuers are near. Supplies restore stamina and energy; helping restores one health. Walk between sprint bursts to recover stamina.
- **Retry:** Capture offers a checkpoint retry, retaining recovered items within the current tab. Reloading does not restore an unfinished action run. Completed chapter results save in this browser when storage is available.

## Jantar Mantar: Signal Run

1. Head along the road. The first packet is on the right, just beyond the low crate. Jump while running or go around the crate.
2. Cross left into the gathering courtyard for the second packet. Return to the road for the third packet beside the recorder.
3. Press Action/E beside the recorder. Follow the marker south to the yellow line. Stay near the interaction ring and hold Action until the barrier opens.
4. Find Kabir just beyond the line and press Action. Continue south to the assembly, approach its marker and press Action to complete the chapter.

Optional help near the entrance restores health. Rally is useful before stopping for a held action. You need all three packets, the recorder and Kabir; simply reaching the destination will not win.

## Bihar: Leave Together

1. Take the packet at the left-front gathering beside Mira. Hold Action to regroup her.
2. Cross to Kabir on the right, collect the second packet and press Action to regroup him.
3. Use the east lane around the camp buildings to reach the third packet south of the blocks. Lead both companions towards the exit.
4. Wait for them to catch up, then hold Action at the exit. Walk through to the southern handoff, wait for both companions again and press Action.

Arriving alone does not count. This is an invented camp, not an actual Bihar map; the companions follow obstacle-aware routes and may take longer than you to get around a building.

## Bengal: Hold the Gathering

1. Collect the packets and hold Action at the left-front, right-middle and left-rear help stations. You can choose the order.
2. Enter the large gold circle at the southern gathering. Keep moving inside it for twenty game seconds, dodging warnings and using Rally when pressured.
3. The timer stops progressing outside the circle. Once it reaches twenty seconds, approach the assembly within the circle and press Action.

Completing all three chapters reaches the campaign ending. Case files and the charter remain optional; neither is required to win. The ending carries the fictional movement's demands, not a claim of actual resignation, SIR repeal or voter restoration.

## Sprint source code

The reusable [sprint controller](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/docs/sprint-controller.js) is also used by the game. Its running speed is 4.6 versus walking speed 2.6 game units per second. Sprint drains 18 stamina per second, walking/resting recovers 13, exhaustion stops sprint at 5 and permits it again at 30.

```js
import {wantsSprint, sprintAllowed, updateStamina, SPRINT_RULES}
  from './sprint-controller.js';

const state = {stamina: 100, exhausted: false};
// Every simulation step, dt is seconds:
const requested = wantsSprint({
  shift: keys.has('ShiftLeft'),
  touch: isTouchDevice,
  stickMagnitude: Math.hypot(stick.x, stick.y)
});
const sprinting = requested && sprintAllowed(state);
const speed = sprinting ? SPRINT_RULES.runSpeed : SPRINT_RULES.walkSpeed;
updateStamina(state, dt, sprinting, isActuallyMoving);
```

This is the running mechanic, not an infinite-stamina cheat or an entire standalone runner game. Current graphics, navigation and phone-performance limits remain documented in [QA](https://github.com/nawaaaaaAaar/dissent-last-ballot/blob/main/QA.md).
