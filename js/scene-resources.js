/** Release shared GPU resources once per scene, including material arrays/textures.
 * The controller owns renderer disposal and cancellation of input/animation. */
export function disposeSceneResources(scene, resources = {}) {
  const geometries = resources.geometries || new Set();
  const materials = resources.materials || new Set();
  const textures = resources.textures || new Set();
  const shadowMaps = new Set();
  const instances = new Set();
  scene.traverse(object => {
    if (object.isInstancedMesh) instances.add(object);
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) {
      const list = Array.isArray(object.material) ? object.material : [object.material];
      list.forEach(material => {
        materials.add(material);
        Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); });
      });
    }
    if (object.shadow?.map) shadowMaps.add(object.shadow.map);
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());
  textures.forEach(texture => texture.dispose());
  shadowMaps.forEach(target => target.dispose());
  // r128 tracks per-object instance buffers separately from shared geometry.
  instances.forEach(mesh => mesh.dispose());
}
