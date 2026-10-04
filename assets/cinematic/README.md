# Factory production assets

Authored with Blender 5.2.2 LTS from the existing tested metre-based scene, preserving T6/T7 footprint, doorways, column positions and collision layout. Factory .blend packs its textures; GLB embeds its buffers and images.

Rebuild from workspace root:

```powershell
node tools/export-factory.mjs
& "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background --factory-startup --python tools/build_factory.py
python bundle.py
```

Seeded procedural concrete, metal and timber maps contain colour, roughness and tangent-space normal detail. Cellular rafters have real holes and flanges. Building meshes export a `month` extra consumed by GSAP's manually clocked construction film. The film is a schematic construction sequence matching the presentation milestones, not a surveyed 4D BIM construction schedule. Pits and machinery retain the original illustrative layout. Temporary foundation/crane props live in the film controller and never change walking collision geometry.

`manifest.json` records mesh details and digest. Presentation users need only `standalone.html`, not Blender or Node. Tests use real GSAP/Three math plus a mocked renderer; screenshots in reviews/cinematic-evidence document actual browser rendering.
