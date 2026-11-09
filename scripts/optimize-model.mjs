/**
 * Prepares a raw GLB export for the web viewer.
 *
 * Exporters such as ImageToStl emit one mesh per face, which produces
 * thousands of draw calls. This script:
 *   1. bakes every node transform into its geometry;
 *   2. optionally discards triangles outside a crop box (stray geometry);
 *   3. converts units and recenters the model (floor at y = 0);
 *   4. merges primitives that share a material and welds vertices.
 *
 * Usage:
 *   node scripts/optimize-model.mjs <input.glb> <output.glb> [options]
 *
 * Options:
 *   --crop x0,y0,z0,x1,y1,z1   Crop box in source units (triangle centroid test)
 *   --scale <factor>           Unit conversion factor (e.g. 0.0254 for inches)
 *   --center                   Center the model on X/Z and place its base at y = 0
 */
import { parseArgs } from 'node:util';
import { NodeIO } from '@gltf-transform/core';
import {
  clearNodeTransform,
  dedup,
  flatten,
  join,
  normals,
  prune,
  transformMesh,
  weld,
} from '@gltf-transform/functions';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    crop: { type: 'string' },
    scale: { type: 'string', default: '1' },
    center: { type: 'boolean', default: false },
  },
});

const [input, output] = positionals;
if (!input || !output) {
  console.error('Usage: node scripts/optimize-model.mjs <input.glb> <output.glb> [options]');
  process.exit(1);
}

const crop = values.crop?.split(',').map(Number);
if (crop && (crop.length !== 6 || crop.some(Number.isNaN))) {
  console.error('--crop expects six comma-separated numbers: x0,y0,z0,x1,y1,z1');
  process.exit(1);
}
const scale = Number(values.scale);

const io = new NodeIO();
const document = await io.read(input);
const root = document.getRoot();

await document.transform(dedup(), flatten());

// 1. Bake transforms so every position is in world space.
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (mesh) transformMesh(mesh, node.getWorldMatrix());
  clearNodeTransform(node);
}

// 2. Crop stray triangles.
if (crop) {
  const [x0, y0, z0, x1, y1, z1] = crop;
  const inside = (x, y, z) => x >= x0 && x <= x1 && y >= y0 && y <= y1 && z >= z0 && z <= z1;

  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const position = prim.getAttribute('POSITION');
      const indices = prim.getIndices();
      const count = indices ? indices.getCount() : position.getCount();
      const index = (i) => (indices ? indices.getScalar(i) : i);

      const kept = [];
      const v = [0, 0, 0];
      for (let i = 0; i < count; i += 3) {
        let cx = 0,
          cy = 0,
          cz = 0;
        for (let k = 0; k < 3; k++) {
          position.getElement(index(i + k), v);
          cx += v[0];
          cy += v[1];
          cz += v[2];
        }
        if (inside(cx / 3, cy / 3, cz / 3)) kept.push(index(i), index(i + 1), index(i + 2));
      }

      if (kept.length === 0) {
        prim.dispose();
        continue;
      }
      prim.setIndices(
        document.createAccessor().setType('SCALAR').setArray(new Uint32Array(kept)).setBuffer(position.getBuffer()),
      );
    }
  }
}

await document.transform(prune());

// 3. Units and recentering.
let tx = 0,
  ty = 0,
  tz = 0;
if (values.center) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const indices = prim.getIndices();
      const position = prim.getAttribute('POSITION');
      const v = [0, 0, 0];
      const count = indices ? indices.getCount() : position.getCount();
      for (let i = 0; i < count; i++) {
        position.getElement(indices ? indices.getScalar(i) : i, v);
        for (let a = 0; a < 3; a++) {
          min[a] = Math.min(min[a], v[a]);
          max[a] = Math.max(max[a], v[a]);
        }
      }
    }
  }
  tx = -(min[0] + max[0]) / 2;
  ty = -min[1];
  tz = -(min[2] + max[2]) / 2;
}

// Column-major matrix: scale applied after translation.
const matrix = [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, tx * scale, ty * scale, tz * scale, 1];
for (const mesh of root.listMeshes()) transformMesh(mesh, matrix);

// 4. Merge and clean up.
await document.transform(join({ keepNamed: false }), weld(), normals({ overwrite: false }), prune());

await io.write(output, document);

console.log(
  `meshes: ${root.listMeshes().length}, materials: ${root.listMaterials().length}` +
    (values.center ? `, offset (source units): ${[tx, ty, tz].map((n) => n.toFixed(2)).join(', ')}` : ''),
);
