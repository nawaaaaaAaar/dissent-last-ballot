# Asset provenance

- **Opening film, v0.3:** AI-generated with Seedance 2.5, 12 seconds, fictional adult participants. Compressed to H.264/AAC with fast-start metadata for browser/mobile playback at `docs/assets/opening.mp4`. It is pre-rendered CGI, not live gameplay, documentary footage, or a verified depiction of Delhi police actions. Initial Veo 3.1 generation failed; that failed output is not included.

- **Game code and procedural models:** Authored for this project. Architecture, street props, articulated human, animations, obstacle meshes, signs, and original synthesised audio are implemented in `docs/game.js`. No real-person likeness or protest photograph is used.
- **Plaster material:** AI-generated with GPT Image 2.5, then resized and compressed into `docs/assets/plaster.webp`. It is a texture used in the interactive scene, not a screenshot passed off as gameplay.
- **Three.js 0.170.0:** Vendored from the npm package; MIT licence retained at `docs/vendor/THREE-LICENSE.txt`. The upstream project is [Three.js on GitHub](https://github.com/mrdoob/three.js).
- **BufferGeometryUtils:** Same Three.js version and licence as above.
- **Fonts:** Clash Display and Satoshi loaded through Fontshare. Browser system fonts are fallback if that external request fails. Confirm applicable font terms before a commercial release.
- **Research references:** Links in the README and dossier are citations only, not a licence to reuse reporting, photos, audio, or footage.

No Quaternius, Kenney, Mixamo, or Three.js sample character asset is included in the build. Asset research did not constitute importing those models.

## v0.2 Delhi references

- **Barricade reference photograph:** `reference-barricade.jpeg`, by Sidheeq, CC BY-SA 3.0; [original Wikimedia Commons file and licence](https://commons.wikimedia.org/wiki/File:Delhi_Police%27s_Barricade.jpeg). Retained unmodified for reference, not loaded by the game.
- **Delhi scene assets:** Original approximate geometry and original sign textures. No official endorsement or exact-survey claim.
- **Bus news photograph:** Consulted privately as a visual reference, not included in the game or repository. The provenance and interpretation limits are documented in `DELHI-REFERENCES.md`.
- **Protest participants:** Original fictional meshes, not faces or portraits from the reporting.
