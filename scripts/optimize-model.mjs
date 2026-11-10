/**
 * Prepares a raw GLB export for the web viewer.
 *
 * Exporters such as ImageToStl emit one mesh per face, which produces
 * thousands of draw calls. This script:
 *   1. bakes every node transform into its geometry;
 *   2. optionally discards triangles outside a crop box (stray geometry);
 *   3. merges primitives that share a material and welds vertices;
 *   4. converts units and recenters the model (floor at y = 0);
 *   5. simplifies dense meshes, resizes textures to WebP and compresses the
 *      geometry with EXT_meshopt_compression (quantized attributes).
 *
 * Usage:
 *   node scripts/optimize-model.mjs <input.glb> <output.glb> [options]
 *
 * Options:
 *   --crop x0,y0,z0,x1,y1,z1   Crop box in source units (triangle centroid test)
 *   --scale <factor>           Unit conversion factor (e.g. 0.0254 for inches)
 *   --center                   Center the model on X/Z and place its base at y = 0
 *   --simplify <error>         Simplification error, relative to each mesh's size (default 0.001, 0 disables)
 *   --dense <triangles>        Meshes still above this count get a coarser pass (default 40000)
 *   --dense-error <meters>     Absolute error allowed for that coarser pass (default 0.005)
 *   --drop <regex>             Remove primitives whose material name matches (e.g. scale figures)
 *   --drop-markers <a>:<b>     Remove annotation markers: objects whose material matches regex <a>,
 *                              and objects matching regex <b> that touch one of them
 *   --texture-size <px>        Maximum texture size (default 1024)
 */
import { parseArgs } from 'node:util';
import { NodeIO, getBounds } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  clearNodeTransform,
  compactPrimitive,
  dedup,
  flatten,
  join,
  meshopt,
  normals,
  prune,
  simplify,
  simplifyPrimitive,
  textureCompress,
  weld,
  weldPrimitive,
} from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    crop: { type: 'string' },
    scale: { type: 'string', default: '1' },
    center: { type: 'boolean', default: false },
    simplify: { type: 'string', default: '0.001' },
    dense: { type: 'string', default: '40000' },
    'dense-error': { type: 'string', default: '0.005' },
    'texture-size': { type: 'string', default: '1024' },
    drop: { type: 'string' },
    'drop-markers': { type: 'string' },
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

const simplifyError = Number(values.simplify);
const textureSize = Number(values['texture-size']);

await Promise.all([MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const document = await io.read(input);
const root = document.getRoot();

if (values.drop) {
  const pattern = new RegExp(values.drop);
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      if (pattern.test(prim.getMaterial()?.getName() ?? '')) prim.dispose();
    }
  }
}

// Some exports carry annotation symbols drawn over the joinery (e.g. a red
// "!" on a yellow triangle) that are hidden in SketchUp but still exported.
// Both parts use generic colors, and the plate color also appears elsewhere,
// so plates are only removed where they touch a mark.
if (values['drop-markers']) {
  const [mark, plate] = values['drop-markers'].split(':').map((source) => new RegExp(source));
  const names = (node) => (node.getMesh()?.listPrimitives() ?? []).map((prim) => prim.getMaterial()?.getName() ?? '');
  const touches = (a, b, margin = 0.02) =>
    [0, 1, 2].every((i) => a.min[i] - margin <= b.max[i] && b.min[i] - margin <= a.max[i]);

  const nodes = root.listNodes().filter((node) => names(node).length > 0);
  // A mark may share its mesh with its plate; a plate never contains a mark.
  const marks = nodes.filter((node) => {
    const list = names(node);
    return list.some((name) => mark.test(name)) && list.every((name) => mark.test(name) || plate.test(name));
  });
  const markBounds = marks.map((node) => getBounds(node));
  const plates = nodes.filter(
    (node) =>
      names(node).every((name) => plate.test(name)) && markBounds.some((bounds) => touches(getBounds(node), bounds)),
  );
  for (const node of [...marks, ...plates]) node.setMesh(null);
  console.log(`markers removed: ${marks.length} marks, ${plates.length} plates`);
}

await document.transform(dedup(), flatten());

/** Multiplies two column-major 4x4 matrices. */
function multiply(a, b) {
  const out = new Array(16).fill(0);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k < 4; k++) out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
    }
  }
  return out;
}

// 1. Bake transforms so every position is in world space.
//
// Exports with instancing reference one mesh from many nodes (here a single
// mesh can back hundreds of placements). Baking mutates geometry in
// place, so a shared mesh must only be baked once: every extra placement gets
// its own deep copy — fresh accessors, not just a new Mesh wrapper, since
// Property.clone() keeps references to the same accessor data — or the
// geometry is transformed repeatedly and scatters across the scene.
function deepCopyMesh(mesh) {
  const copy = document.createMesh(mesh.getName());
  for (const prim of mesh.listPrimitives()) {
    const clone = document.createPrimitive().setMode(prim.getMode()).setMaterial(prim.getMaterial());
    for (const semantic of prim.listSemantics()) {
      const accessor = prim.getAttribute(semantic);
      clone.setAttribute(
        semantic,
        document
          .createAccessor()
          .setType(accessor.getType())
          .setNormalized(accessor.getNormalized())
          .setBuffer(accessor.getBuffer())
          .setArray(accessor.getArray().slice()),
      );
    }
    const indices = prim.getIndices();
    if (indices) {
      clone.setIndices(
        document
          .createAccessor()
          .setType(indices.getType())
          .setBuffer(indices.getBuffer())
          .setArray(indices.getArray().slice()),
      );
    }
    copy.addPrimitive(clone);
  }
  return copy;
}

const meshNodes = root.listNodes().filter((node) => node.getMesh());

// Pass 1: give each node its own geometry while the originals are still
// pristine, so no accessor is baked twice. dedup() merges identical meshes
// *and* accessors, so sharing has to be detected at the accessor level: two
// unrelated meshes can point at the same POSITION data.
const seenAccessors = new Set();
for (const node of meshNodes) {
  const mesh = node.getMesh();
  const shared = mesh.listPrimitives().some((prim) => seenAccessors.has(prim.getAttribute('POSITION')));
  const target = shared ? deepCopyMesh(mesh) : mesh;
  if (shared) node.setMesh(target);
  for (const prim of target.listPrimitives()) seenAccessors.add(prim.getAttribute('POSITION'));
}

// Pass 2: after flatten() every node hangs from the scene root, so its local
// matrix is its world matrix. clearNodeTransform() bakes that matrix into the
// (now unique) mesh and resets the node — calling transformMesh() first would
// apply the transform twice.
for (const node of meshNodes) clearNodeTransform(node);

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

// 3. Merge and clean up. SketchUp exports repeat identical materials per
// component, so deduplicating them first lets join() merge far more geometry.
// normals() unwelds what it touches, so it has to run before weld().
await document.transform(
  normals({ overwrite: false }),
  dedup(),
  join({ keepNamed: false }),
  weld({ overwrite: true }),
  prune(),
);

// 4. Compress.
if (simplifyError > 0) {
  await document.transform(simplify({ simplifier: MeshoptSimplifier, error: simplifyError, lockBorder: false }));

  // Decor such as rugs, plants and fabrics can keep hundreds of thousands of
  // triangles after the first pass; those tolerate a much coarser error. Their
  // faceted normals split every vertex, which leaves the simplifier nothing to
  // collapse, so they are welded on position and shipped without normals: the
  // viewer computes smooth ones on load (normals() here would unweld them).
  // The error is absolute: a tiny ornament can carry 300k triangles, and a
  // relative error would leave it untouched.
  const dense = Number(values.dense);
  const denseError = Number(values['dense-error']);
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const triangles = prim.getIndices().getCount() / 3;
      if (triangles <= dense) continue;
      const position = prim.getAttribute('POSITION');
      const [min, max] = [position.getMin([]), position.getMax([])];
      const extent = Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
      prim.setAttribute('NORMAL', null);
      weldPrimitive(prim, { overwrite: true });
      simplifyPrimitive(prim, {
        simplifier: MeshoptSimplifier,
        ratio: dense / triangles,
        error: Math.min(1, denseError / extent),
        lockBorder: false,
      });

      // Triangle soups (every face split by UV seams) can't be collapsed
      // edge by edge; sloppy simplification clusters vertices instead.
      const indices = prim.getIndices();
      if (indices.getCount() / 3 > dense * 2) {
        const positions = prim.getAttribute('POSITION').getArray();
        const [sloppy] = MeshoptSimplifier.simplifySloppy(
          Uint32Array.from(indices.getArray()),
          positions,
          3,
          null,
          dense * 3,
          denseError / MeshoptSimplifier.getScale(positions, 3),
        );
        indices.setArray(sloppy);
        compactPrimitive(prim);
      }
    }
  }
}
await document.transform(
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [textureSize, textureSize], quality: 80 }),
  prune(),
  meshopt({ encoder: MeshoptEncoder, level: 'high' }),
);

// 5. Units and recentering. Applied to the scene's top-level nodes rather than
// the vertices: positions are quantized by now, and the bounds measured here
// are exactly the ones the viewer will see.
let offset = [0, 0, 0];
if (values.center) {
  const { min, max } = getBounds(root.getDefaultScene() ?? root.listScenes()[0]);
  offset = [-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2];
}
// Column-major matrix: scale applied after translation.
const placement = [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, scale, 0, ...offset.map((n) => n * scale), 1];
for (const scene of root.listScenes()) {
  for (const node of scene.listChildren()) node.setMatrix(multiply(placement, node.getMatrix()));
}

await io.write(output, document);

console.log(
  `meshes: ${root.listMeshes().length}, materials: ${root.listMaterials().length}` +
    (values.center ? `, offset (source units): ${offset.map((n) => n.toFixed(2)).join(', ')}` : ''),
);
