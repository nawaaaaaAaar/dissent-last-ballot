# DISSENT: physical readability and presentation

## Baseline before edits

Fresh public v0.16.5 was replayed in ordinary browser time: approaching the cordon, held strikes, moving its screen, a bench vault, dodge and exploration behind the front line. Captures are under `qa/v17/before-*`. This is exploratory comparison of the affected encounters, not a full baseline campaign win.

The action camera made people small and left much of the viewport to buildings and large HUD panels. Impact range exceeded convincing arm reach; misses and hits had weakly differentiated sounds. A vault's lift and return did not strongly communicate hand support, landing or recovery. The generic table and screen shapes were functional but weak silhouettes. Pose switches lacked a clean blend back to locomotion.

## QA inventory

Verify adaptive action/vehicle framing, camera stability and foreground cutaway; actual contact versus miss/recovery, shared range/tell geometry, animation phase and blended exit; vault anticipation/support/clearance/landing without scenery penetration; distinctive bench/table/screen silhouettes with collision unchanged; audio event timing, spatial attenuation, mute/resume and generated dialogue/subtitles; unchanged four-operation campaign, failure/retry, simultaneous phone controls and both orientations. Off-route checks: strike from outside reach and interrupted vault/copy. No runtime state injection for normal-time campaign replay.

## Highest-impact weaknesses and changes

- **Contact geometry and overlap:** The earlier body reach was 2.55 game units, considerably larger than the visible arm. Jab/cross/push now reach 1.35/1.40/1.55, with a visible forward envelope, a committed short step and a single authored contact phase. Enemy warning sectors use their actual standing strike ranges; rush windup separately indicates its committed approach. Barricade contact measures the nearest rail, not distance from its centre. Walking and strike advance cannot cross a standing opponent's centre; dodge can pass through as an explicit arcade exception.
- **Camera and hierarchy:** The on-foot view closes from a 21-unit vertical span to 16 in travel and 13 near combat, with an 18-unit portrait span, damped movement/zoom and a wider driving view. The world keeps a stable north-oriented camera rather than changing stick direction. Desktop objective/toast panels are smaller. Overview remains available.
- **Motion and transitions:** Windup, contact and recovery share the same gameplay phase. Arm contact uses a two-bone reach solve; support targets follow the selected bench rather than a generic animation point. A vault has an anticipation interval, eased crossing, leg tuck and landing/recovery interval, and poses blend back to locomotion over 0.14 seconds. This is not mocap, full-body IK, or literal fist collision.
- **Prop silhouettes and staging:** Benches have rounded, separated wood-grain slats and an open metal structure; aid tables have clearer folding supports, supplies, cloth and a medical marker. Screens have a wheeled frame and subdivided, rippled fabric rather than a flat instruction box. The instructions remain contextual controls. Legacy decorative stalls overlapping the Sansad aid space were removed after capture review exposed character occlusion.
- **Audio:** Body, shield, barrier, miss, footsteps, landing, wheels and hurt have different original synthesized Foley layers, rather than the same strike tone. A restrained noise-based environmental bed accompanies the existing original instrumental. Anita has one generated Hindi line at reader regrouping, with an English subtitle. This is not audio recorded from Delhi or a real witness.

The animation direction applies anticipation, staging and recovery without treating long animation as inherently better. Jonathan Cooper describes both those principles and their responsiveness trade-offs in [The 12 Principles of Animation in Video Games](https://www.gamedeveloper.com/production/the-12-principles-of-animation-in-video-games).

## What actual replay changed

The initial revised public campaign reached cycle two: rescue SILVER/1573, gathering BRONZE/1262, dispatch SILVER/1484 and charter SILVER/1302. It also exposed problems rather than merely validating a winning route: a shield attached using its idle forearm transform lifted over the head; a close approach could cross an opponent and turn a strike into a confusing miss; decorative stalls hid the aid-point character. Those problems prompted additional revisions. A fresh cloud browser was required after shader/context loss, and another long-lived session timed out; failed rendering attempts are not counted as passed visual checks.

The final gameplay rules, public v0.17.2, were then replayed fresh through all four operations in ordinary browser time, without changing health, coordinates, flags, rewards or simulation time:

| Operation | Result | Actual observations |
| --- | --- | --- |
| Witness | SILVER, 1800; health 6; van 97.00 | Screen shift, bench crossing, short-range combat, rescue, boarding and cooled delivery all completed. |
| Gathering | GOLD, 1757; health 5 | The aid screen blocked the direct approach until moved. Aid was restored; both readers followed to the assembly while the final-stage opponents remained behind. |
| Dispatch | SILVER, 1724; health 6; van 94.98 | Combat, held copying and delivery completed. Departure needed deliberate steering around the table rather than blindly following the road line. |
| Charter | SILVER, 1398; health 5; van 98 | The nearby rush unit was confronted, the dispatch copied, and the van left with other opponents still alive. Delivery reached cycle two with 12 earned credits and no purchased upgrades. |

Travel and some combat were controller/waypoint-assisted through actual CDP keyboard and touch input, using read-only state to choose actions. These results are not an unaided first-time play study, speedrun, retention test, or proof that people will love the game. Differences in scores/time between attempts cannot be attributed solely to the redesign.

The clearer camera and envelope made range, facing and recovery more legible. The side approach and screen shift had visible spatial consequences, and copying/escort did not require every opponent to be defeated. The core arcade structure still shows through the setting; it is materially clearer, not a finished indie release.

## Verification and remaining limits

Forty-three isolated rule checks cover range, single contact, shield behaviour, prop traversal, companion/stage/checkpoint behaviour, physical rail targeting and body spacing. Deterministic browser-client captures were checked separately from ordinary-time replay. The final presentation-only stall removal does not change campaign rules; its affected space and phone layouts are checked separately in `QA.md`.

The Hindi speech was transcoded to a real MP3 after the generation output proved to be WAV data with an MP3 filename. An audio evaluation reproduced the intended Hindi transcript after conversion; the first evaluation failed to access it and is not an audio-quality pass. Its measured source peak is −4.3 dBFS, with no digital clipping in that measurement. The Foley is still synthetic and dry; spatialized crowd performance and a richer recorded soundscape are not implemented.

Body range remains an arcade centre/cone test. Hand reach is clamped to the existing rig, feet are not planted to terrain, the torso-held shield is not a solved hand grip, and knockdowns still use a rigid fall rather than authored collapse/recovery. Facial performance, repeated faces, seams/texture repetition and general city geometry remain below the visual target. Physical iPhone/Android devices, Safari, long-session device thermals and independent player enjoyment are unverified.

## Next highest-impact issue

**Local navigation and pursuit fairness inside the existing spaces** should come next: road guidance does not understand moved furniture, companions can detour and lag, vehicle exit clearance can require awkward repositioning, and pursuit can prolong a trip instead of producing a satisfying escape beat. Fixing those interactions would improve the whole playable flow more than another district, currency or scenic landmark. Full-body contact/foot planting and authored knockdown performance remain the largest animation gap alongside that gameplay priority.
