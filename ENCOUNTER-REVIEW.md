# DISSENT: authored encounters and contact

## Baseline replay before edits

The fresh public v0.15.13 build was played in normal browser time with keyboard movement, short and held strikes, a dodge, exploration toward Kabir, and a separate gathering approach and fight. No simulation clock, health, location or objective state was injected. This was exploratory replay of the affected encounters, not another complete baseline network cycle.

At the witness encounter, held strikes removed the approaching rush unit, while another opponent remained behind the cordon. Kabir was a stationary marker and the space did little to communicate alternate approaches. At the gathering, movement, attacks and a dodge produced a health loss and partial securing progress, but the zone still played as a generic waiting circle between building fragments. The failure was not missing rewards; it was missing spatial purpose, human reactions and physical continuity.

Inspection identified damage resolved immediately on attack input, before the arm pose reached contact. Enemy tells were more readable than their actual striking/recovery motion. Ground furniture was mainly decoration and did not shape movement or sight. Companions followed the player without a threatened/calm distinction.

## Design and QA inventory

Rework two important spaces, not the district count: the witness cordon and the community forecourt. Preserve the existing campaign, geography, rewards and political narrative. Add contact-timed strikes with locked facing and visible recovery, collision-checked vaulting of low furniture, movable sight-blocking screens, position-holding guards, missed-attack recovery and threatened companion behaviour.

Checks required: no damage before contact, one hit per swing, moving out of range causes a miss, shield/finisher and late dodge; environment collision and sight, screen movement/noise, vault landing validation and animation phase; authored entry variants and no trapped witness; guard holding/regrouping, flanker route choice, companion threat/shelter/follow; checkpoints preserve environment; all four operations through ordinary inputs; failure/retry and alternate approach; touch Action/vault/combat and both orientations; actual active gameplay screenshots and animation phase samples; public deployment version/source verification.

Environmental interaction as a combat-positioning reference comes from Sloclap's description of furniture, tables and other usable elements in combat spaces, not a claim that this game reaches Sifu's quality ([PlayStation developer article](https://blog.playstation.com/2021/11/18/how-sifus-kung-fu-combat-works/)).

## Implementation and replay

Results will be recorded after the revised game is played. Feature presence and isolated checks do not by themselves establish finished-game quality or player enjoyment.
