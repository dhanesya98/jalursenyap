# Collision isometric — 14 November 2026

The active game is a custom Canvas renderer, not the historical Three.js game
described in older design documents. The existing assets and engine are retained.

Applied gamedev references:
- [Router / custom engines](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/main/router/references/custom-engines.md)
- [Physics tuning](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/main/skills/disciplines/physics-tuning/SKILL.md)
- [Input systems](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/main/skills/disciplines/input-systems/SKILL.md)

Engine integration:

| Contract | Implementation |
| --- | --- |
| Build / test | `npm test`: regression suite, offline builder, embedded-source verification |
| Lifecycle | `boot`, `enterMapRuntime`, `switchMap` in `src/bab0-pixel-engine.js` |
| Time | Rendering via requestAnimationFrame; bounded accumulator at 120 physics ticks/second |
| Input | Keyboard, pointer and gamepad call the existing runtime actions; all hook bindings removed |
| World data | `MAPS.walkPolygons` and `blockPolygons`, native 1280 × 720 image coordinates |
| Collision | `PixelCampaign.collision`, `walkable`, `segmentClear`, `movePoint` |
| Save | Version 4 and existing keys retained; `validate` relocates unsafe feet and removes legacy glide data |

Ground is opt-in. Pixels outside walk polygons are blocked, even when no obstacle
polygon is present. Solid polygons remove water, scenery and furniture from those
surfaces. The masks are rasterized once per map and inset for the entire elliptical
7 × 4 pixel foot, including its interior. Foot offsets are not evaluated independently
against different rectangular corridors anymore.

Movement uses substeps no larger than 2 pixels and supercover DDA sweeps, with collision-checked contour sliding. Jump height affects presentation only; it never disables ground collision. There are no ladder shortcuts, hook links or glide states.

Pathfinding uses an 8 pixel grid, collision-checked connections to the actual start,
and swept checks on every grid edge and smoothed segment. It selects reachable
ground near a clicked solid target rather than selecting an unreachable island.
Waypoint motion is clamped to the remaining distance. Click guidance compensates
for lateral wind drift; storm slowdown and cargo wear remain active.

Ruru also uses collision-checked motion and replans around blocked corners. Patrol
segments are checked against their actual ground lane. The closed Balkut bridge
blocks its deck and far side until the existing third winch objective completes.

Markers on the old water/wall coordinates have been moved onto visible landings.
No objective IDs, order, quest rewards, dialogue graphs or puzzle rules were removed.

Validation includes all 58 quest interactions, actual controller traversal to all
58 targets, all 14 exits, stable arrivals, save recovery, bridge gating, collision
under jumping/sprinting/hitches, 30/60/144 Hz probes and outward edge sweeps over
all eight maps. The DOM-free suite uses mocks; browser checks separately cover
rendering, collision overlays, controls and the rebuilt HTML bundle.

For future edits, press F2 (or use `?collision=1`) to inspect the original scene
under its collision overlay. Keep bridge polygons confined to their decks and
stair polygons confined to their treads; never connect islands with broad rectangles.

Revision: Menara Senja now uses 17 individually named collisionObjects and 12 walkSurfaces. These replace the older broad surfaces. The straight-line rope ladder was removed: it bypassed the cliff collision. All Senja travel uses the painted stone stairs and bridge decks. Grid routing in Senja is 4 pixels. Supercover DDA replaces uniform segment samples; WASD collision response projects onto the actual polygon tangent rather than relying solely on axis sliding. Independent visual probes and bidirectional WASD bridge tests complement the general containment tests.


REVISI TITIK LAPORAN
- Ujung barat jembatan bawah Senja: sambungan landing dan ujung tali diperbaiki.
- Balkut: bentuk lantai papan, pangkal jembatan, kaki pilar dan mesin tambat dipisahkan.
- Salkara: akses tanah dekat tenda kecil dibuka; tenda, api, peti dan tiang tetap solid.
- Simpul: platform bawah terpisah dari dinding platform atas; akses melalui tangga timur. Lantai dekat pilar barat dibuka.
- Validasi: 21 kelompok regresi (20 suite penuh + 1 regresi titik laporan), 124080 sapuan tepian, 58 target, 14 pintu, dan input WASD nyata pada browser.


REVISI 3 — AUDIT WASD SELURUH MAP
Tiga sambungan tambahan diperbaiki: landing atas tangga bawah Senja, ujung tali jembatan bawah Senja, dan landing bawah tangga Simpul.
23 kelompok regresi lulus; 27 rute diuji dua arah pada jalan/sprint (108 kombinasi), 124176 sapuan tepian. Uji tombol langsung juga dilakukan di kedelapan map.
Lihat docs/WASD-AUDIT-v3.md untuk cakupan dan hasil. Patch kumulatif ini menggantikan ZIP v2; gliding/grappling tetap dihapus.
