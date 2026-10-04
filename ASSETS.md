# Asset provenance

- **Historical opening video, v0.3:** AI-generated with Seedance 2.5, 12 seconds, fictional adult participants. Retained at `docs/assets/opening.mp4` but not loaded by the v0.4 game. It is AI-generated video, not conventional authored-model CGI, gameplay or documentary footage. Initial Veo 3.1 generation failed; that failed output is not included.
- **Skeletal human base, v0.4:** Quaternius Universal Base Characters, Superhero Male, CC0. [Original author and licence](https://quaternius.com/packs/universalbasecharacters.html). The repackaged GLB was obtained from [programasweights/avatar provenance](https://github.com/programasweights/avatar/blob/main/ASSETS.md), which preserves the source mesh and skeleton while removing source textures. The licence is retained at `docs/assets/QUATERNIUS-LICENSE.txt`. Runtime changes in `docs/visuals.js` add vertex colour clothing regions, surface offsets, hair, eye accents, cap, backpack and procedural bone poses. This is an adapted generic character, not a likeness of an actual protester or officer.
- **Scanned road material, v0.4:** [Asphalt 02 by Rob Tuytel via Poly Haven](https://polyhaven.com/a/asphalt_02), [CC0](https://polyhaven.com/license). The original 1K diffuse, OpenGL normal and roughness JPEGs are retained in `reference-textures/`; runtime WebP conversions are in `docs/assets/`. The 3-metre source tile is repeated over the original street geometry. These are texture scans, not scans of the actual Delhi route.

- **Game code and procedural models:** Authored for this project, except the explicitly credited skeletal human base. Architecture, street props, fallback characters, original pose curves, obstacle meshes, signs and synthesised audio are implemented in `docs/game.js` and `docs/visuals.js`. No real-person likeness or protest photograph is used.
- **Plaster material:** AI-generated with GPT Image 2.5, then resized and compressed into `docs/assets/plaster.webp`. It is a texture used in the interactive scene, not a screenshot passed off as gameplay.
- **Three.js 0.170.0:** Vendored from the npm package; MIT licence retained at `docs/vendor/THREE-LICENSE.txt`. The upstream project is [Three.js on GitHub](https://github.com/mrdoob/three.js).
- **BufferGeometryUtils:** Same Three.js version and licence as above.
- **Fonts:** Clash Display and Satoshi loaded through Fontshare. Browser system fonts are fallback if that external request fails. Confirm applicable font terms before a commercial release.
- **Research references:** Links in the README and dossier are citations only, not a licence to reuse reporting, photos, audio, or footage.

v0.4 imports the credited Quaternius CC0 human base. No Kenney, Mixamo or Three.js sample character model is included. GLTFLoader, SkeletonUtils, RoundedBoxGeometry and RoomEnvironment are vendored from the same Three.js 0.170.0 MIT-licensed package.

## v0.2 Delhi references

- **Barricade reference photograph:** `reference-barricade.jpeg`, by Sidheeq, CC BY-SA 3.0; [original Wikimedia Commons file and licence](https://commons.wikimedia.org/wiki/File:Delhi_Police%27s_Barricade.jpeg). Retained unmodified for reference, not loaded by the game.
- **Delhi scene assets:** Original approximate geometry and original sign textures. No official endorsement or exact-survey claim.
- **Bus news photograph:** Consulted privately as a visual reference, not included in the game or repository. The provenance and interpretation limits are documented in `DELHI-REFERENCES.md`.
- **Protest participants:** Original fictional meshes, not faces or portraits from the reporting.
