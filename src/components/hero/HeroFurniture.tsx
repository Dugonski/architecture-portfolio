import { ContactShadows } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { OrthographicCamera, Plane, Raycaster, Vector2, Vector3, type Group } from 'three';
import { furniture } from './furniture';

/**
 * Where each piece lands. `x` is the position across the free space on its
 * side of the hero text (0 = next to the text, 1 = edge of the screen) and `y`
 * is the floor height in normalized screen coordinates (-1 bottom … 1 top),
 * which also sets how far back the piece sits.
 */
interface Drop {
  kind: keyof typeof furniture;
  side: 'left' | 'right';
  x: number;
  y: number;
  rotation: number;
  delay: number;
}

const DROPS: Drop[] = [
  { kind: 'lamp', side: 'right', x: 0.15, y: -0.3, rotation: 0.6, delay: 0.85 },
  { kind: 'armchair', side: 'right', x: 0.3, y: -0.5, rotation: 0.35, delay: 0.55 },
  { kind: 'sideTable', side: 'right', x: 0.5, y: -0.66, rotation: 0, delay: 1.1 },
  { kind: 'shelf', side: 'right', x: 0.63, y: -0.34, rotation: 0, delay: 0.2 },
  { kind: 'books', side: 'right', x: 0.66, y: -0.7, rotation: 0.3, delay: 1.85 },
  { kind: 'puff', side: 'right', x: 0.8, y: -0.56, rotation: 0, delay: 1.6 },
  { kind: 'plant', side: 'right', x: 0.86, y: -0.3, rotation: 0.4, delay: 1.35 },
  { kind: 'chair', side: 'left', x: 0.4, y: -0.36, rotation: 0.8, delay: 1.0 },
  { kind: 'puffPink', side: 'left', x: 0.55, y: -0.62, rotation: 0, delay: 1.45 },
];

/** Minimum free space (px) for a side to receive furniture. */
const MIN_GUTTER = { left: 200, right: 260 };

const GRAVITY = -24;
const RESTITUTION = 0.3;
const SPAWN_HEIGHT = 9;
const ISO_DIRECTION = new Vector3(1, 0.82, 1).normalize();
/** World units visible across the hero width. */
const VIEW_WIDTH = 9;

interface Body {
  y: number;
  vy: number;
  tilt: Vector2;
  tiltVelocity: Vector2;
  spin: number;
  spinVelocity: number;
  squash: number;
  squashVelocity: number;
  landed: boolean;
}

function randomTilt() {
  return new Vector2((Math.random() - 0.5) * 1.1, (Math.random() - 0.5) * 1.1);
}

function FallingPiece({ drop, position, instant }: { drop: Drop; position: Vector3; instant: boolean }) {
  const outer = useRef<Group>(null);
  const inner = useRef<Group>(null);
  const start = useRef<number | null>(null);
  const body = useRef<Body>({
    y: instant ? 0 : SPAWN_HEIGHT + Math.random() * 2,
    vy: 0,
    tilt: instant ? new Vector2() : randomTilt(),
    tiltVelocity: new Vector2((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2),
    spin: instant ? 0 : (Math.random() - 0.5) * 2,
    spinVelocity: (Math.random() - 0.5) * 3,
    squash: 0,
    squashVelocity: 0,
    landed: instant,
  });

  useFrame(({ clock }, rawDelta) => {
    const group = inner.current;
    if (!group) return;
    const dt = Math.min(rawDelta, 1 / 30);
    const b = body.current;
    start.current ??= clock.elapsedTime;
    if (clock.elapsedTime - start.current < drop.delay && !b.landed) {
      group.visible = false;
      return;
    }
    group.visible = true;

    // Vertical motion with damped bounces.
    if (b.y > 0 || b.vy !== 0) {
      b.vy += GRAVITY * dt;
      b.y += b.vy * dt;
      if (b.y <= 0) {
        b.y = 0;
        const impact = -b.vy;
        b.vy = impact > 1.5 ? impact * RESTITUTION : 0;
        b.squashVelocity -= Math.min(impact, 14) * 0.9;
        if (!b.landed) b.tiltVelocity.multiplyScalar(0.3);
        b.landed = true;
      }
    }

    if (b.landed) {
      // Springs pull the piece upright, to its resting spin, and undo the squash.
      const k = 70;
      const c = 9;
      b.tiltVelocity.x += (-k * b.tilt.x - c * b.tiltVelocity.x) * dt;
      b.tiltVelocity.y += (-k * b.tilt.y - c * b.tiltVelocity.y) * dt;
      b.spinVelocity += (-30 * b.spin - 8 * b.spinVelocity) * dt;
      b.squashVelocity += (-260 * b.squash - 16 * b.squashVelocity) * dt;
    }
    b.tilt.addScaledVector(b.tiltVelocity, dt);
    b.spin += b.spinVelocity * dt;
    b.squash += b.squashVelocity * dt;

    const squash = Math.max(-0.25, Math.min(0.25, b.squash));
    group.position.y = b.y;
    group.rotation.set(b.tilt.x, drop.rotation + b.spin, b.tilt.y);
    group.scale.set(1 - squash * 0.5, 1 + squash, 1 - squash * 0.5);
  });

  const hop = () => {
    const b = body.current;
    if (b.y > 0.05) return;
    b.vy = 5.5 + Math.random() * 1.5;
    b.y = 0.001;
    b.tiltVelocity.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
    b.spinVelocity += (Math.random() - 0.5) * 8;
  };

  return (
    <group ref={outer} position={position}>
      <group
        ref={inner}
        visible={instant}
        onClick={(event) => {
          event.stopPropagation();
          hop();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          document.body.style.cursor = '';
        }}
      >
        {furniture[drop.kind].element}
      </group>
    </group>
  );
}

interface SceneProps {
  /** Free space on each side of the hero text, in pixels. */
  gutters: { left: number; right: number };
  instant: boolean;
}

function Scene({ gutters, instant }: SceneProps) {
  const { size, camera, pointer } = useThree();
  const target = useMemo(() => new Vector3(0, 0.6, 0), []);

  // Landing points: cast each drop's screen position onto the floor plane,
  // using the camera at rest (before any parallax).
  const placements = useMemo(() => {
    const ortho = camera as OrthographicCamera;
    ortho.zoom = size.width / VIEW_WIDTH;
    ortho.position.copy(ISO_DIRECTION).multiplyScalar(30).add(target);
    ortho.lookAt(target);
    ortho.updateProjectionMatrix();
    ortho.updateMatrixWorld();

    const floor = new Plane(new Vector3(0, 1, 0), 0);
    const raycaster = new Raycaster();
    const visible = DROPS.filter((drop) => gutters[drop.side] > MIN_GUTTER[drop.side]);
    return visible.map((drop) => {
      const pixels = drop.side === 'right' ? size.width - gutters.right * (1 - drop.x) : gutters.left * drop.x;
      raycaster.setFromCamera(new Vector2((pixels / size.width) * 2 - 1, drop.y), ortho);
      const point = new Vector3();
      raycaster.ray.intersectPlane(floor, point);
      return { drop, position: point };
    });
  }, [camera, size.width, gutters, target]);

  // Gentle parallax that follows the pointer.
  useFrame((_, delta) => {
    const angle = pointer.x * 0.06;
    const lift = pointer.y * 0.04;
    const direction = ISO_DIRECTION.clone().applyAxisAngle(new Vector3(0, 1, 0), angle);
    direction.y += lift;
    const desired = direction.normalize().multiplyScalar(30).add(target);
    camera.position.lerp(desired, Math.min(1, delta * 2));
    camera.lookAt(target);
  });

  return (
    <>
      <hemisphereLight args={['#ffffff', '#d8d2c6', 1.5]} />
      <directionalLight position={[4, 9, 3]} intensity={1.6} />
      <directionalLight position={[-6, 4, 6]} intensity={0.35} />
      {placements.map(({ drop, position }) => (
        <FallingPiece key={drop.kind} drop={drop} position={position} instant={instant} />
      ))}
      <ContactShadows position={[0, 0.001, 0]} scale={40} resolution={1024} blur={2.4} opacity={0.32} far={2.5} />
    </>
  );
}

interface HeroFurnitureProps {
  /** Element that receives pointer events (the hero), so text stays clickable. */
  eventSource: RefObject<HTMLElement | null>;
  /** Element holding the hero text, used to find the free space beside it. */
  content: RefObject<HTMLElement | null>;
}

/** Furniture that falls into the empty sides of the hero. */
export default function HeroFurniture({ eventSource, content }: HeroFurnitureProps) {
  const [gutters, setGutters] = useState({ left: 0, right: 0 });
  const instant = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  // Runs after the whole page has mounted: when the home page is revisited this
  // component mounts together with the hero, before its refs are attached.
  useEffect(() => {
    const measure = () => {
      const hero = eventSource.current?.getBoundingClientRect();
      const text = content.current?.getBoundingClientRect();
      if (!hero || !text) return;
      setGutters({ left: text.left - hero.left, right: hero.right - text.right });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (eventSource.current) observer.observe(eventSource.current);
    if (content.current) observer.observe(content.current);
    return () => observer.disconnect();
  }, [eventSource, content]);

  return (
    <Canvas
      className="hero-furniture"
      orthographic
      dpr={[1, 2]}
      camera={{ near: 0.1, far: 100, position: [30, 25, 30] }}
      eventSource={eventSource as RefObject<HTMLElement>}
      onCreated={(state) =>
        // Pointer position relative to the hero, wherever it sits on the page.
        state.setEvents({
          compute: (event, current) => {
            const rect = eventSource.current?.getBoundingClientRect();
            if (!rect) return;
            current.pointer.set(
              ((event.clientX - rect.left) / rect.width) * 2 - 1,
              -((event.clientY - rect.top) / rect.height) * 2 + 1,
            );
            current.raycaster.setFromCamera(current.pointer, current.camera);
          },
        })
      }
      gl={{ antialias: true, alpha: true }}
    >
      <Scene gutters={gutters} instant={instant} />
    </Canvas>
  );
}
