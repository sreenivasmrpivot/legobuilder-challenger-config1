import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useBrickStore } from '../../store/useBrickStore';
import { BRICK_CATALOG, BRICK_TYPES } from '../../domain/brickCatalog';
import { getColorById } from '../../domain/colorPalette';
import { Brick, BrickType } from '../../store/types';

/**
 * InstancedBricks - renders all placed bricks using Three.js InstancedMesh.
 * FR-PERF-001: one InstancedMesh per brick type = one draw call per type.
 *
 * GOTCHA: InstancedMesh requires instanceColor buffer for per-instance colors.
 * Use mesh.setColorAt() which auto-creates the buffer.
 * Set mesh.instanceColor.needsUpdate = true after updates.
 */
export function InstancedBricks() {
  const bricks = useBrickStore(state => state.bricks);

  const byType: Record<BrickType, Brick[]> = {
    '1x1': [], '1x2': [], '2x2': [], '2x4': [],
  };
  bricks.forEach(b => byType[b.type].push(b));

  return (
    <>
      {BRICK_TYPES.map(type => (
        <InstancedBrickType
          key={type}
          brickType={type}
          bricks={byType[type]}
        />
      ))}
    </>
  );
}

interface InstancedBrickTypeProps {
  brickType: BrickType;
  bricks: Brick[];
}

function InstancedBrickType({ brickType, bricks }: InstancedBrickTypeProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const def = BRICK_CATALOG[brickType];
  const MAX_INSTANCES = 1000; // NFR-SCALE-001

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    const rotMatrix = new THREE.Matrix4();

    bricks.forEach((brick, i) => {
      if (i >= MAX_INSTANCES) return;
      matrix.makeTranslation(brick.x, brick.y + 0.5, brick.z);
      rotMatrix.makeRotationY((brick.rotation * Math.PI) / 180);
      matrix.multiply(rotMatrix);
      mesh.setMatrixAt(i, matrix);
      const legoColor = getColorById(brick.colorId);
      color.set(legoColor.hex);
      mesh.setColorAt(i, color);
    });

    // Hide unused instances
    const zeroScale = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let i = bricks.length; i < MAX_INSTANCES; i++) {
      mesh.setMatrixAt(i, zeroScale);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.count = bricks.length;
  }, [bricks]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[def.geometry, undefined, MAX_INSTANCES]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  );
}
