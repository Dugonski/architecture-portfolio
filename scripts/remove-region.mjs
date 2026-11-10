/**
 * Removes everything inside a region of an optimized model, at any height
 * (e.g. rooms exported with the project that are not part of it).
 *
 * Triangles fully inside the region are dropped. Triangles crossing its
 * border (long walls, floor slabs) are clipped, so nothing sticks out of it.
 *
 * Usage:
 *   node scripts/remove-region.mjs <input.glb> <output.glb> --box x0,z0,x1,z1
 *
 * The box is in model coordinates (meters, as shown by the viewer).
 */
import { parseArgs } from 'node:util';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { box: { type: 'string' } },
});

const [input, output] = positionals;
const box = values.box?.split(',').map(Number);
if (!input || !output || !box || box.length !== 4 || box.some(Number.isNaN)) {
  console.error('Usage: node scripts/remove-region.mjs <input.glb> <output.glb> --box=x0,z0,x1,z1');
  process.exit(1);
}
const [x0, z0, x1, z1] = box;

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const document = await io.read(input);
const root = document.getRoot();
const buffer = root.listBuffers()[0];

/** Clips a convex polygon to the half-space where `side(vertex) >= 0`. */
function clip(polygon, side) {
  const result = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const da = side(a);
    const db = side(b);
    if (da >= 0) result.push(a);
    if (da >= 0 !== db >= 0) {
      const t = da / (da - db);
      result.push({
        world: a.world.map((v, k) => v + (b.world[k] - v) * t),
        values: a.values.map((list, k) => list.map((v, c) => v + (b.values[k][c] - v) * t)),
      });
    }
  }
  return result;
}

// The parts of a convex polygon outside the box, as convex pieces.
const x = (v) => v.world[0];
const z = (v) => v.world[2];
const outsidePieces = (polygon) => [
  clip(polygon, (v) => x0 - x(v)),
  clip(
    clip(polygon, (v) => x(v) - x1),
    (v) => x(v) - x0,
  ),
  clip(
    clip(
      clip(polygon, (v) => x(v) - x0),
      (v) => x1 - x(v),
    ),
    (v) => z0 - z(v),
  ),
  clip(
    clip(
      clip(
        clip(polygon, (v) => x(v) - x0),
        (v) => x1 - x(v),
      ),
      (v) => z(v) - z1,
    ),
    (v) => z(v) - z0,
  ),
];

let removed = 0;
let clipped = 0;
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const m = node.getWorldMatrix();
  const toWorld = (v) => [0, 1, 2].map((r) => m[r] * v[0] + m[4 + r] * v[1] + m[8 + r] * v[2] + m[12 + r]);

  for (const prim of mesh.listPrimitives()) {
    const position = prim.getAttribute('POSITION');
    const indices = prim.getIndices();
    const count = indices ? indices.getCount() : position.getCount();
    const index = (i) => (indices ? indices.getScalar(i) : i);
    const world = [];
    for (let i = 0; i < position.getCount(); i++) world.push(toWorld(position.getElement(i, [])));

    const inside = (p) => p[0] > x0 && p[0] < x1 && p[2] > z0 && p[2] < z1;
    const touches = (t) =>
      Math.max(...t.map((p) => p[0])) > x0 &&
      Math.min(...t.map((p) => p[0])) < x1 &&
      Math.max(...t.map((p) => p[2])) > z0 &&
      Math.min(...t.map((p) => p[2])) < z1;

    // Only primitives that reach into the region are rebuilt.
    let affected = false;
    for (let i = 0; i < count && !affected; i += 3) {
      if (touches([world[index(i)], world[index(i + 1)], world[index(i + 2)]])) affected = true;
    }
    if (!affected) continue;

    const semantics = prim.listSemantics();
    const attributes = semantics.map((name) => prim.getAttribute(name));
    const vertex = (i) => ({ world: world[i], values: attributes.map((a) => a.getElement(i, [])) });

    const kept = [];
    for (let i = 0; i < count; i += 3) {
      const ids = [index(i), index(i + 1), index(i + 2)];
      const points = ids.map((id) => world[id]);
      if (!touches(points)) {
        kept.push(...ids.map(vertex));
        continue;
      }
      if (points.every(inside)) {
        removed++;
        continue;
      }
      clipped++;
      for (const piece of outsidePieces(ids.map(vertex))) {
        for (let k = 1; k + 1 < piece.length; k++) kept.push(piece[0], piece[k], piece[k + 1]);
      }
    }

    // Rebuild the primitive with float attributes (non-indexed).
    semantics.forEach((name, a) => {
      const size = attributes[a].getElementSize();
      const array = new Float32Array(kept.length * size);
      kept.forEach((v, i) => {
        let values = v.values[a];
        if (name === 'NORMAL') {
          const length = Math.hypot(...values) || 1;
          values = values.map((c) => c / length);
        }
        array.set(values, i * size);
      });
      prim.setAttribute(
        name,
        document.createAccessor().setType(attributes[a].getType()).setArray(array).setBuffer(buffer),
      );
    });
    prim.setIndices(null);
    if (kept.length === 0) prim.dispose();
  }
}

await document.transform(prune());
// Keep the same compression the optimize script uses (level 'high').
document
  .createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });
await io.write(output, document);
console.log(`${removed} triangles removed, ${clipped} clipped at the border of the region`);
