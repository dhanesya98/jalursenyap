JALUR SENYAP — REUSABLE 3D ASSETS

24 self-contained glTF 2.0 binary files (GLB): 7 characters and 17 props.
Created from the original procedural art in src/art.js. No network or npm dependencies.
Regenerate: node tools/export-models.cjs
Validate existing outputs: node tools/export-models.cjs --verify

COORDINATES
Y up, characters face +Z. Units match the game; humans approximately 2 units tall.
Hierarchy and local object transforms are preserved. Original limb groups remain editable.
This is an articulated object hierarchy, not a skinned skeleton. There are no skin weights.
Props use their default dimensions; change the source factory options to export other sizes.

DIFFERENCES FROM RUNTIME
Static rest pose only. No animation clips, skeletal animation, cloth simulation, or procedural behavior.
Nara uses the folded cape; the hidden extended glide wing group is omitted.
Checkpoint and altar use their inactive state. Emissive material colors are retained.
Toon shading is approximated with rough nonmetallic PBR; lighting will depend on the editor/viewer.
Ink line geometry uses glTF line primitives and KHR_materials_unlit. Some importers hide lines.
No external images, textures, audio, collision shapes, physics, interaction, or gameplay are embedded.
The game still uses procedural JSArt models so its runtime animations and state changes remain intact.

VERIFICATION
validation.json records binary headers, chunk lengths, buffer alignment/bounds, accessor counts,
finite geometry, min/max bounds, index bounds, references, and node hierarchy checks.
Validation is structural and numeric. No claim of visual testing in third-party 3D editors.

PROVENANCE
Original code-native models created for this project. Three.js is used to construct geometry.
See assets/models-manifest.json for source and asset inventory.
