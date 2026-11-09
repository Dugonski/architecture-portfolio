import { RoundedBox } from '@react-three/drei';
import { palette } from './palette';

/**
 * Procedural low-poly furniture used by the hero animation. Dimensions are in
 * meters with the base at y = 0. These placeholders can later be replaced by
 * .glb models exported from SketchUp.
 */

function Mat({ color, roughness = 0.85 }: { color: string; roughness?: number }) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={0} flatShading />;
}

/** Thin cylinder between two points on the XZ grid, used for legs. */
function Leg({
  x,
  z,
  height,
  radius = 0.018,
  color,
  splay = 0,
}: {
  x: number;
  z: number;
  height: number;
  radius?: number;
  color: string;
  splay?: number;
}) {
  return (
    <mesh position={[x, height / 2, z]} rotation={[z * splay, 0, -x * splay]}>
      <cylinderGeometry args={[radius, radius * 0.8, height, 8]} />
      <Mat color={color} />
    </mesh>
  );
}

export function EamesChair() {
  return (
    <group>
      {[-0.17, 0.17].flatMap((x) =>
        [-0.15, 0.15].map((z) => <Leg key={`${x}${z}`} x={x} z={z} height={0.43} color={palette.oak} splay={0.5} />),
      )}
      <RoundedBox args={[0.47, 0.05, 0.44]} radius={0.02} position={[0, 0.45, 0]}>
        <Mat color={palette.white} />
      </RoundedBox>
      <RoundedBox args={[0.47, 0.34, 0.05]} radius={0.02} position={[0, 0.66, -0.2]} rotation={[-0.18, 0, 0]}>
        <Mat color={palette.white} />
      </RoundedBox>
    </group>
  );
}

export function Armchair() {
  return (
    <group>
      {[-0.32, 0.32].flatMap((x) =>
        [-0.28, 0.28].map((z) => (
          <Leg key={`${x}${z}`} x={x} z={z} height={0.12} radius={0.025} color={palette.walnut} />
        )),
      )}
      <RoundedBox args={[0.78, 0.28, 0.72]} radius={0.06} position={[0, 0.26, 0]}>
        <Mat color={palette.linen} />
      </RoundedBox>
      <RoundedBox args={[0.78, 0.46, 0.16]} radius={0.06} position={[0, 0.58, -0.28]}>
        <Mat color={palette.linen} />
      </RoundedBox>
      {[-0.33, 0.33].map((x) => (
        <RoundedBox key={x} args={[0.12, 0.26, 0.66]} radius={0.05} position={[x, 0.5, 0.02]}>
          <Mat color={palette.linen} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.32, 0.26, 0.1]} radius={0.05} position={[0.08, 0.55, -0.15]} rotation={[-0.2, 0.3, 0]}>
        <Mat color={palette.sage} />
      </RoundedBox>
    </group>
  );
}

export function Puff({ color = palette.sage }: { color?: string }) {
  return (
    <mesh position={[0, 0.2, 0]}>
      <cylinderGeometry args={[0.26, 0.26, 0.4, 20]} />
      <Mat color={color} roughness={0.95} />
    </mesh>
  );
}

export function SideTable() {
  return (
    <group>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.04, 20]} />
        <Mat color={palette.white} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.025, 0.06, 0.48, 12]} />
        <Mat color={palette.white} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.03, 24]} />
        <Mat color={palette.white} roughness={0.35} />
      </mesh>
      <mesh position={[0.06, 0.58, 0.02]}>
        <cylinderGeometry args={[0.05, 0.04, 0.09, 12]} />
        <Mat color={palette.terracotta} />
      </mesh>
      <mesh position={[0.06, 0.66, 0.02]}>
        <icosahedronGeometry args={[0.07, 0]} />
        <Mat color={palette.moss} />
      </mesh>
    </group>
  );
}

export function FloorLamp() {
  return (
    <group>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.03, 20]} />
        <Mat color={palette.ink} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 1.4, 8]} />
        <Mat color={palette.ink} />
      </mesh>
      <mesh position={[0.12, 1.42, 0]} rotation={[0, 0, -0.9]}>
        <cylinderGeometry args={[0.01, 0.01, 0.32, 8]} />
        <Mat color={palette.ink} />
      </mesh>
      <mesh position={[0.24, 1.42, 0]} rotation={[0, 0, 0.35]}>
        <coneGeometry args={[0.15, 0.22, 20, 1, true]} />
        <meshStandardMaterial color={palette.ink} roughness={0.6} side={2} flatShading />
      </mesh>
    </group>
  );
}

export function Plant() {
  return (
    <group>
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.34, 18]} />
        <Mat color={palette.white} roughness={0.5} />
      </mesh>
      {[
        [0, 0.55, 0, 0.22],
        [-0.12, 0.72, 0.05, 0.16],
        [0.12, 0.78, -0.04, 0.17],
        [0.02, 0.95, 0.02, 0.13],
      ].map(([x, y, z, r]) => (
        <mesh key={`${x}${y}`} position={[x, y, z]}>
          <icosahedronGeometry args={[r, 0]} />
          <Mat color={palette.moss} />
        </mesh>
      ))}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.2, 6]} />
        <Mat color={palette.walnut} />
      </mesh>
    </group>
  );
}

export function CubbyShelf() {
  const doors = [palette.yellow, palette.sage, palette.blue, palette.pink];
  return (
    <group>
      <RoundedBox args={[1.2, 0.5, 0.4]} radius={0.015} position={[0, 0.25, 0]}>
        <Mat color={palette.oak} />
      </RoundedBox>
      {doors.map((color, i) => (
        <RoundedBox key={color} args={[0.27, 0.4, 0.02]} radius={0.01} position={[-0.435 + i * 0.29, 0.25, 0.205]}>
          <Mat color={color} />
        </RoundedBox>
      ))}
    </group>
  );
}

export function Stool() {
  return (
    <group>
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((a) => (
        <Leg
          key={a}
          x={Math.cos(a) * 0.13}
          z={Math.sin(a) * 0.13}
          height={0.44}
          radius={0.02}
          color={palette.oak}
          splay={0.6}
        />
      ))}
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.04, 20]} />
        <Mat color={palette.oak} />
      </mesh>
    </group>
  );
}

export function BookStack() {
  const books = [palette.navy, palette.terracotta, palette.moss, palette.linen];
  return (
    <group>
      {books.map((color, i) => (
        <RoundedBox
          key={color}
          args={[0.32 - i * 0.02, 0.05, 0.23]}
          radius={0.008}
          position={[0, 0.025 + i * 0.05, 0]}
          rotation={[0, (i % 2 ? 1 : -1) * 0.12 * i, 0]}
        >
          <Mat color={color} />
        </RoundedBox>
      ))}
    </group>
  );
}
