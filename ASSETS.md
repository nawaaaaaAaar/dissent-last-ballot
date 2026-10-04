# Asset provenance

- **Game code and procedural models:** Authored for this project. Architecture, street props, articulated human, animations, obstacle meshes, signs, and original synthesised audio are implemented in `docs/game.js`. No real-person likeness or protest photograph is used.
- **Plaster material:** AI-generated with GPT Image 2.5, then resized and compressed into `docs/assets/plaster.webp`. It is a texture used in the interactive scene, not a screenshot passed off as gameplay.
- **Three.js 0.170.0:** Vendored from the npm package; MIT licence retained at `docs/vendor/THREE-LICENSE.txt`. The upstream project is [Three.js on GitHub](https://github.com/mrdoob/three.js).
- **BufferGeometryUtils:** Same Three.js version and licence as above.
- **Fonts:** Clash Display and Satoshi loaded through Fontshare. Browser system fonts are fallback if that external request fails. Confirm applicable font terms before a commercial release.
- **Research references:** Links in the README and dossier are citations only, not a licence to reuse reporting, photos, audio, or footage.

No Quaternius, Kenney, Mixamo, or Three.js sample character asset is included in the build. Asset research did not constitute importing those models.
