/**
 * Closes the tops of walls (and anything else) cut open when a model's
 * ceiling was cropped away, drawing them as a dark section fill (poché),
 * like the cut walls in the portfolio's isometric views.
 *
 * The model is sliced with a horizontal plane just below its top. The cut
 * segments are chained into closed outlines (open surfaces are ignored), the
 * outlines are rasterized taking holes into account, and the filled cells are
 * merged into rectangles placed on top of the cut.
 *
 * Usage:
 *   node scripts/cap-walls.mjs <input.glb> <output.glb> [options]
 *
 * Options:
 *   --depth <m>        How far below the model's top to slice (default 0.03)
 *   --resolution <m>   Scanline spacing (default 0.005)
 *   --color <hex>      Fill color (default #2a332c)
 */
import { parseArgs } from 'node:util';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    depth: { type: 'string', default: '0.03' },
    resolution: { type: 'string', default: '0.005' },
    color: { type: 'string', default: '#2a332c' },
  },
});

const [input, output] = positionals;
if (!input || !output) {
  console.error('Usage: node scripts/cap-walls.mjs <input.glb> <output.glb> [options]');
  process.exit(1);
}
const depth = Number(values.depth);
const resolution = Number(values.resolution);

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const document = await io.read(input);
const root = document.getRoot();

/** Glass and other see-through surfaces are not solid and are not cut. */
function isSolid(material) {
  if (!material) return true;
  return material.getAlphaMode() !== 'BLEND' || material.getBaseColorFactor()[3] >= 0.75;
}

// World-space triangles of every solid primitive.
const triangles = [];
let top = -Infinity;
for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const m = node.getWorldMatrix();
  const toWorld = (v) => [0, 1, 2].map((r) => m[r] * v[0] + m[4 + r] * v[1] + m[8 + r] * v[2] + m[12 + r]);
  for (const prim of mesh.listPrimitives()) {
    const position = prim.getAttribute('POSITION');
    const indices = prim.getIndices();
    const count = indices ? indices.getCount() : position.getCount();
    const solid = isSolid(prim.getMaterial());
    const v = [0, 0, 0];
    const vertices = [];
    for (let i = 0; i < position.getCount(); i++) {
      const w = toWorld(position.getElement(i, v));
      top = Math.max(top, w[1]);
      vertices.push(w);
    }
    if (!solid) continue;
    for (let i = 0; i < count; i += 3) {
      const at = (k) => vertices[indices ? indices.getScalar(i + k) : i + k];
      triangles.push([at(0), at(1), at(2)]);
    }
  }
}

const cutY = top - depth;

// Section outline: segments where triangles cross the cut plane.
const segments = [];
let capY = cutY;
for (const triangle of triangles) {
  const d = triangle.map((p) => p[1] - cutY);
  const points = [];
  for (let k = 0; k < 3; k++) {
    const a = triangle[k];
    const b = triangle[(k + 1) % 3];
    const da = d[k];
    const db = d[(k + 1) % 3];
    if ((da < 0 && db >= 0) || (da >= 0 && db < 0)) {
      const t = da / (da - db);
      points.push([a[0] + (b[0] - a[0]) * t, a[2] + (b[2] - a[2]) * t]);
    }
  }
  if (points.length === 2) {
    segments.push(points);
    for (const p of triangle) capY = Math.max(capY, p[1]);
  }
}
// Sit the fill on top of the open walls, just above their edges.
capY += 0.002;

// Chain the segments into closed loops. Open chains come from single-sided
// surfaces (slatted panels, thin sheets) and have no inside, so they are dropped.
const keyOf = ([x, z]) => `${Math.round(x * 1e4)},${Math.round(z * 1e4)}`;
const byPoint = new Map();
segments.forEach((segment, index) => {
  for (const point of segment) {
    const key = keyOf(point);
    if (!byPoint.has(key)) byPoint.set(key, []);
    byPoint.get(key).push(index);
  }
});
const used = new Uint8Array(segments.length);
const loops = [];
for (let start = 0; start < segments.length; start++) {
  if (used[start]) continue;
  used[start] = 1;
  const loop = [segments[start][0], segments[start][1]];
  const startKey = keyOf(segments[start][0]);
  let closed = false;
  for (;;) {
    const tail = loop[loop.length - 1];
    const tailKey = keyOf(tail);
    if (tailKey === startKey) {
      closed = true;
      break;
    }
    const nextIndex = (byPoint.get(tailKey) ?? []).find((i) => !used[i]);
    if (nextIndex === undefined) break;
    used[nextIndex] = 1;
    const [a, b] = segments[nextIndex];
    loop.push(keyOf(a) === tailKey ? b : a);
  }
  if (closed && loop.length >= 4) loops.push(loop.slice(0, -1));
}

// Nesting depth of each loop: a loop inside an odd number of others is a hole
// (e.g. the inner face of a wall modeled as one ring around the room).
const inside = (point, polygon) => {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, zi] = polygon[i];
    const [xj, zj] = polygon[j];
    if (zi > point[1] !== zj > point[1] && point[0] < ((xj - xi) * (point[1] - zi)) / (zj - zi) + xi) result = !result;
  }
  return result;
};
const depths = loops.map((loop, i) =>
  loops.reduce((count, other, j) => count + (i !== j && inside(loop[0], other) ? 1 : 0), 0),
);

// Rasterize: every cell keeps the depth of the innermost loop containing it,
// and is filled when that depth is even. Overlapping solids (walls meeting at
// a corner) are all depth 0, so their union is filled.
let minX = Infinity;
let maxX = -Infinity;
let minZ = Infinity;
let maxZ = -Infinity;
for (const loop of loops) {
  for (const [x, z] of loop) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
}
const columns = Math.max(1, Math.ceil((maxX - minX) / resolution));
const rowCount = Math.max(1, Math.ceil((maxZ - minZ) / resolution));
const grid = new Int16Array(columns * rowCount).fill(-1);
loops.forEach((loop, index) => {
  const depth = depths[index];
  for (let row = 0; row < rowCount; row++) {
    const z = minZ + (row + 0.5) * resolution;
    const xs = [];
    for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
      const [xi, zi] = loop[i];
      const [xj, zj] = loop[j];
      if (zi > z !== zj > z) xs.push(xi + ((z - zi) / (zj - zi)) * (xj - xi));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const from = Math.max(0, Math.round((xs[k] - minX) / resolution));
      const to = Math.min(columns, Math.round((xs[k + 1] - minX) / resolution));
      for (let c = from; c < to; c++) {
        const cell = row * columns + c;
        if (depth > grid[cell]) grid[cell] = depth;
      }
    }
  }
});

// Filled spans per row, then identical spans on consecutive rows are merged.
const rows = [];
for (let row = 0; row < rowCount; row++) {
  const spans = [];
  let begin = -1;
  for (let c = 0; c <= columns; c++) {
    const filled = c < columns && grid[row * columns + c] >= 0 && grid[row * columns + c] % 2 === 0;
    if (filled && begin < 0) begin = c;
    if (!filled && begin >= 0) {
      spans.push([minX + begin * resolution, minX + c * resolution]);
      begin = -1;
    }
  }
  rows.push({ z: minZ + (row + 0.5) * resolution, spans });
}

const rectangles = [];
let open = [];
const same = (a, b) => Math.abs(a[0] - b[0]) < resolution / 2 && Math.abs(a[1] - b[1]) < resolution / 2;
for (const { z, spans } of rows) {
  const stillOpen = [];
  const taken = new Set();
  for (const rect of open) {
    const i = spans.findIndex((span, k) => !taken.has(k) && same(span, rect.span));
    if (i >= 0) {
      taken.add(i);
      rect.z1 = z + resolution / 2;
      stillOpen.push(rect);
    } else rectangles.push(rect);
  }
  spans.forEach((span, k) => {
    if (!taken.has(k)) stillOpen.push({ span, z0: z - resolution / 2, z1: z + resolution / 2 });
  });
  open = stillOpen;
}
rectangles.push(...open);

// Build the cap mesh.
const positions = [];
const normals = [];
const indices = [];
for (const { span, z0, z1 } of rectangles) {
  const base = positions.length / 3;
  positions.push(span[0], capY, z0, span[1], capY, z0, span[1], capY, z1, span[0], capY, z1);
  normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
  indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
}

const buffer = root.listBuffers()[0];
const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const hex = values.color.replace('#', '');
const color = [0, 2, 4].map((i) => srgbToLinear(parseInt(hex.slice(i, i + 2), 16) / 255));

const material = document
  .createMaterial('Corte')
  .setBaseColorFactor([...color, 1])
  .setMetallicFactor(0)
  .setRoughnessFactor(1);
const primitive = document
  .createPrimitive()
  .setMaterial(material)
  .setAttribute(
    'POSITION',
    document.createAccessor().setType('VEC3').setArray(new Float32Array(positions)).setBuffer(buffer),
  )
  .setAttribute(
    'NORMAL',
    document.createAccessor().setType('VEC3').setArray(new Float32Array(normals)).setBuffer(buffer),
  )
  .setIndices(document.createAccessor().setType('SCALAR').setArray(new Uint32Array(indices)).setBuffer(buffer));
const capNode = document.createNode('Corte').setMesh(document.createMesh('Corte').addPrimitive(primitive));
root.listScenes()[0].addChild(capNode);

// Keep the same compression the optimize script uses (level 'high').
document
  .createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.FILTER });

await io.write(output, document);
const openChains = segments.length - loops.reduce((n, loop) => n + loop.length, 0);
console.log(
  `cut at y=${cutY.toFixed(3)} m: ${loops.length} closed outlines, ` +
    `${openChains} segments of open surfaces ignored, ${rectangles.length} rectangles`,
);
