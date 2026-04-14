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
 *
 * Performance targets (FR-PERF-001):
 *   - 100 bricks → ≥60 FPS
 *   - 500 bricks → ≥30 FPS
 *   - 1000 bricks → no crash (NFR-SCALE-001)
 */
export function InstancedBricks() {
  const bricks = useBrickStore(state => state.bricks);

  // Group bricks by type — one InstancedMesh per type = minimal draw calls
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

/**
 * InstancedBrickType - manages one THREE.InstancedMesh for a single brick type.
 *
 * Critical gotchas addressed:
 * 1. instanceColor buffer: setColorAt() auto-creates it; must set needsUpdate=true
 * 2. Fixed count at creation: pre-allocate MAX_INSTANCES to avoid recreation
 * 3. Matrix + color updates: useEffect on [bricks] dependency
 * 4. Geometry disposal: cleanup on unmount
 */
function InstancedBrickType({ brickType, bricks }: InstancedBrickTypeProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const def = BRICK_CATALOG[brickType];
  const MAX_INSTANCES = 1000; // NFR-SCALE-001: support up to 1000 bricks per type

  // Dispose geometry on unmount to prevent WebGL memory leaks
  useEffect(() => {
    return () => {
      meshRef.current?.geometry.dispose();
      // Material disposal is handled by R3F
    };
  }, []);

  // Update instance matrices and colors whenever bricks change
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    const rotMatrix = new THREE.Matrix4();

    bricks.forEach((brick, i) => {
      if (i >= MAX_INSTANCES) return;

      // Build transform: translate to grid position, then rotate around Y
      matrix.makeTranslation(brick.x, brick.y + 0.5, brick.z);
      rotMatrix.makeRotationY((brick.rotation * Math.PI) / 180);
      matrix.multiply(rotMatrix);
      mesh.setMatrixAt(i, matrix);

      // Per-instance color via setColorAt (auto-creates instanceColor buffer)
      const legoColor = getColorById(brick.colorId);
      color.set(legoColor.hex);
      mesh.setColorAt(i, color);
    });

    // Hide unused instances by zeroing their scale matrix
    const zeroScale = new THREE.Matrix4().makeScale(0, 0, 0);
    for (let i = bricks.length; i < MAX_INSTANCES; i++) {
      mesh.setMatrixAt(i, zeroScale);
    }

    // Signal Three.js to upload updated buffers to GPU
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // Update visible count (optimization: renderer skips hidden instances)
    mesh.count = bricks.length;
  }, [bricks]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[def.geometry, undefined, MAX_INSTANCES]}
      castShadow
      receiveShadow
    >
      {/*
       * vertexColors enables per-instance color from instanceColor buffer.
       * CRITICAL: Do NOT set a color prop here — instanceColor handles it.
       */}
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  );
}
