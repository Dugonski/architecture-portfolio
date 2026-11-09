import { Box3, BufferGeometry, Mesh, Vector3, type Material, type Object3D } from 'three';
import type { ModelZone } from '../../types';

/** Unassigned geometry is split into the floor and everything else. */
export type ShellKind = 'floor' | 'shell';

export interface ModelPart {
  key: string;
  /** Zone id, or the shell kind for geometry outside every zone. */
  group: string;
  zoneId: string | null;
  geometry: BufferGeometry;
  material: Material;
}

export interface SplitModel {
  parts: ModelPart[];
  bounds: Box3;
  /** Actual bounds of the geometry assigned to each zone. */
  zoneBounds: Map<string, Box3>;
}

const FLOOR_LEVEL = 0.03;
const BOX_TOLERANCE = 0.02;

function matchesName(object: Object3D, names: Set<string>): boolean {
  let current: Object3D | null = object;
  while (current) {
    if (names.has(current.name)) return true;
    current = current.parent;
  }
  return false;
}

/**
 * Splits every mesh of a loaded scene into parts grouped by zone and
 * material. Geometry is assigned per triangle, so even models exported
 * without meaningful object names can be divided into selectable areas.
 */
export function splitByZones(scene: Object3D, zones: ModelZone[]): SplitModel {
  scene.updateMatrixWorld(true);

  const boxes = zones.map((zone) =>
    (zone.boxes ?? []).map(({ min, max }) =>
      new Box3(new Vector3(...min), new Vector3(...max)).expandByScalar(BOX_TOLERANCE),
    ),
  );
  const nameSets = zones.map((zone) => new Set(zone.nodes ?? []));

  const parts: ModelPart[] = [];
  const bounds = new Box3();
  const zoneBounds = new Map<string, Box3>();
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();

  let meshIndex = 0;
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const source = (object.geometry as BufferGeometry).clone();
    source.applyMatrix4(object.matrixWorld);
    if (!source.attributes.normal) source.computeVertexNormals();

    const position = source.attributes.position;
    const index = source.index;
    const triangleCount = (index ? index.count : position.count) / 3;
    const vertex = (i: number) => (index ? index.getX(i) : i);

    // A whole mesh can be claimed by name before falling back to boxes.
    const namedZone = zones.findIndex((_, i) => nameSets[i].size > 0 && matchesName(object, nameSets[i]));

    const buckets = new Map<string, number[]>();
    for (let t = 0; t < triangleCount; t++) {
      const ia = vertex(t * 3);
      const ib = vertex(t * 3 + 1);
      const ic = vertex(t * 3 + 2);
      a.fromBufferAttribute(position, ia);
      b.fromBufferAttribute(position, ib);
      c.fromBufferAttribute(position, ic);

      let group: string;
      let zone = namedZone;
      if (zone < 0) {
        zone = boxes.findIndex((list) =>
          list.some((box) => box.containsPoint(a) && box.containsPoint(b) && box.containsPoint(c)),
        );
      }
      if (zone >= 0) {
        group = zones[zone].id;
        let box = zoneBounds.get(group);
        if (!box) zoneBounds.set(group, (box = new Box3()));
        box.expandByPoint(a).expandByPoint(b).expandByPoint(c);
      } else {
        const onFloor = a.y < FLOOR_LEVEL && b.y < FLOOR_LEVEL && c.y < FLOOR_LEVEL;
        group = onFloor ? 'floor' : 'shell';
      }
      bounds.expandByPoint(a).expandByPoint(b).expandByPoint(c);

      let list = buckets.get(group);
      if (!list) buckets.set(group, (list = []));
      list.push(ia, ib, ic);
    }

    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const [group, indices] of buckets) {
      const geometry = new BufferGeometry();
      for (const [name, attribute] of Object.entries(source.attributes)) {
        geometry.setAttribute(name, attribute);
      }
      geometry.setIndex(indices);
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      parts.push({
        key: `${meshIndex}:${group}`,
        group,
        zoneId: group === 'floor' || group === 'shell' ? null : group,
        geometry,
        material: materials[0],
      });
    }
    meshIndex++;
  });

  return { parts, bounds, zoneBounds };
}
