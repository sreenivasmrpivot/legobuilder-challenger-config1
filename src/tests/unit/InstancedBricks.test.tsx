import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { InstancedBricks } from '../../components/Scene3D/InstancedBricks';
import { useBrickStore } from '../../store/useBrickStore';
import { Brick } from '../../store/types';
import * as THREE from 'three';

// Helper to create test bricks
const createTestBricks = (count: number, type: '1x1' | '1x2' | '2x2' | '2x4'): Brick[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `brick-${i}`,
    x: i % 10,
    y: 0,
    z: Math.floor(i / 10),
    type,
    colorId: 'bright-red',
    rotation: 0,
  }));
};

describe('InstancedBricks — FR-PERF-001', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBrickStore.setState({
      bricks: [],
      activeTool: 'place',
      activeColorId: 'bright-red',
      activeBrickType: '1x1',
      notification: null,
    });
  });

  it('T-FE-PERF-001-01: InstancedMesh is used for brick rendering', async () => {
    const bricks = createTestBricks(10, '1x1');
    useBrickStore.setState({ bricks });

    const { container } = render(
      <Canvas>
        <InstancedBricks />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();

    // Wait for R3F to mount and populate scene
    await waitFor(() => {
      // Access the Three.js scene via the canvas's __r3f property (internal but usable in tests)
      const r3f = (canvas as any).__r3f;
      expect(r3f).toBeDefined();
      const scene = r3f.scene as THREE.Scene;
      expect(scene).toBeDefined();

      // Traverse scene to find InstancedMesh objects
      const instancedMeshes: THREE.InstancedMesh[] = [];
      scene.traverse((object) => {
        if (object instanceof THREE.InstancedMesh) {
          instancedMeshes.push(object);
        }
      });

      // Should have at least one InstancedMesh (one per brick type present)
      expect(instancedMeshes.length).toBeGreaterThanOrEqual(1);

      // Verify that the InstancedMesh has the correct count
      const mesh = instancedMeshes[0];
      expect(mesh.count).toBe(bricks.length);
      expect(mesh.instanceMatrix).toBeDefined();
    });
  });

  it('T-FE-PERF-001-01: Multiple brick types produce separate InstancedMesh objects', async () => {
    const bricks1 = createTestBricks(5, '1x1');
    const bricks2 = createTestBricks(3, '2x2');
    const mixedBricks = [...bricks1, ...bricks2];
    useBrickStore.setState({ bricks: mixedBricks });

    const { container } = render(
      <Canvas>
        <InstancedBricks />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');
    await waitFor(() => {
      const r3f = (canvas as any).__r3f;
      const scene = r3f.scene as THREE.Scene;
      const instancedMeshes: THREE.InstancedMesh[] = [];
      scene.traverse((object) => {
        if (object instanceof THREE.InstancedMesh) {
          instancedMeshes.push(object);
        }
      });

      // Should have exactly 2 InstancedMesh objects (one for each type)
      expect(instancedMeshes.length).toBe(2);
    });
  });
});
