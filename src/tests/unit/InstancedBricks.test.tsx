/**
 * InstancedBricks unit and behavioral tests — FR-PERF-001
 *
 * Test IDs:
 *   T-FE-PERF-001-01 — InstancedMesh is used for brick rendering (Unit)
 *   T-FE-PERF-001-01b — Multiple brick types produce separate InstancedMesh objects (Unit)
 *   T-FE-PERF-001-02 — Scene renders 100 bricks at ≥ 60 FPS during camera orbit (Behavioral)
 *
 * Spectra-FRs: FR-PERF-001
 * Spectra-Tests: T-FE-PERF-001-01, T-FE-PERF-001-02
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { InstancedBricks } from '../../components/Scene3D/InstancedBricks';
import { useBrickStore } from '../../store/useBrickStore';
import { Brick } from '../../store/types';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Create an array of test bricks of a given type. */
const createTestBricks = (
  count: number,
  type: '1x1' | '1x2' | '2x2' | '2x4',
  colorId = 'bright-red'
): Brick[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `brick-${type}-${i}`,
    x: i % 10,
    y: 0,
    z: Math.floor(i / 10),
    type,
    colorId,
    rotation: 0 as const,
  }));

/** Traverse a Three.js scene and collect all InstancedMesh objects. */
function collectInstancedMeshes(scene: THREE.Scene): THREE.InstancedMesh[] {
  const meshes: THREE.InstancedMesh[] = [];
  scene.traverse((obj) => {
    if (obj instanceof THREE.InstancedMesh) meshes.push(obj);
  });
  return meshes;
}

/** Resolve the R3F scene from a canvas element (uses internal __r3f property). */
function getR3FScene(canvas: HTMLCanvasElement | null): THREE.Scene | null {
  if (!canvas) return null;
  const r3f = (canvas as any).__r3f;
  return r3f?.scene ?? null;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('InstancedBricks — FR-PERF-001', () => {
  beforeEach(() => {
    useBrickStore.setState({
      bricks: [],
      activeTool: 'place',
      activeColorId: 'bright-red',
      activeBrickType: '1x1',
      notification: null,
    });
  });

  // -------------------------------------------------------------------------
  // T-FE-PERF-001-01 — InstancedMesh is used for brick rendering (Unit)
  // -------------------------------------------------------------------------
  it('T-FE-PERF-001-01: InstancedMesh is used for brick rendering (not individual Mesh)', async () => {
    const bricks = createTestBricks(10, '1x1');
    useBrickStore.setState({ bricks });

    const { container } = render(
      <Canvas>
        <InstancedBricks />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();

    await waitFor(
      () => {
        const scene = getR3FScene(canvas);
        expect(scene).toBeDefined();

        const instancedMeshes = collectInstancedMeshes(scene!);

        // Must have at least one InstancedMesh — no individual Mesh per brick
        expect(instancedMeshes.length).toBeGreaterThanOrEqual(1);

        // The InstancedMesh for '1x1' bricks must have count = 10
        const mesh = instancedMeshes.find((m) => m.count === bricks.length);
        expect(mesh).toBeDefined();
        expect(mesh!.instanceMatrix).toBeDefined();
        expect(mesh!.instanceMatrix.needsUpdate).toBe(false); // settled after first render
      },
      { timeout: 3000 }
    );
  });

  // -------------------------------------------------------------------------
  // T-FE-PERF-001-01b — One InstancedMesh per brick type (Unit)
  // -------------------------------------------------------------------------
  it('T-FE-PERF-001-01b: Multiple brick types produce separate InstancedMesh objects', async () => {
    const bricks1x1 = createTestBricks(5, '1x1');
    const bricks2x2 = createTestBricks(3, '2x2');
    const mixedBricks = [...bricks1x1, ...bricks2x2];
    useBrickStore.setState({ bricks: mixedBricks });

    const { container } = render(
      <Canvas>
        <InstancedBricks />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');

    await waitFor(
      () => {
        const scene = getR3FScene(canvas);
        expect(scene).toBeDefined();

        const instancedMeshes = collectInstancedMeshes(scene!);

        // Exactly 2 InstancedMesh objects — one per brick type present
        // (InstancedBricks renders 4 types but only 2 have bricks)
        // Note: InstancedBricks renders all 4 types always; types with 0 bricks
        // have count=0. We check that at least 2 have count > 0.
        const activeMeshes = instancedMeshes.filter((m) => m.count > 0);
        expect(activeMeshes.length).toBe(2);

        // Verify counts match
        const counts = activeMeshes.map((m) => m.count).sort((a, b) => a - b);
        expect(counts).toEqual([3, 5]);
      },
      { timeout: 3000 }
    );
  });

  // -------------------------------------------------------------------------
  // T-FE-PERF-001-01c — Per-instance color is applied (Unit)
  // -------------------------------------------------------------------------
  it('T-FE-PERF-001-01c: Per-instance color buffer is created via setColorAt', async () => {
    const bricks = createTestBricks(5, '1x1', 'bright-blue');
    useBrickStore.setState({ bricks });

    const { container } = render(
      <Canvas>
        <InstancedBricks />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');

    await waitFor(
      () => {
        const scene = getR3FScene(canvas);
        expect(scene).toBeDefined();

        const instancedMeshes = collectInstancedMeshes(scene!);
        const activeMesh = instancedMeshes.find((m) => m.count > 0);
        expect(activeMesh).toBeDefined();

        // instanceColor buffer must exist (created by setColorAt)
        // This verifies the GOTCHA fix: vertexColors + instanceColor buffer
        expect(activeMesh!.instanceColor).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  // -------------------------------------------------------------------------
  // T-FE-PERF-001-01d — Matrix updates on brick add (Unit)
  // -------------------------------------------------------------------------
  it('T-FE-PERF-001-01d: Instance matrices update when bricks are added', async () => {
    const initialBricks = createTestBricks(3, '1x1');
    useBrickStore.setState({ bricks: initialBricks });

    const { container } = render(
      <Canvas>
        <InstancedBricks />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');

    // Wait for initial render
    await waitFor(
      () => {
        const scene = getR3FScene(canvas);
        const meshes = collectInstancedMeshes(scene!);
        const active = meshes.find((m) => m.count === 3);
        expect(active).toBeDefined();
      },
      { timeout: 3000 }
    );

    // Add more bricks
    const updatedBricks = createTestBricks(7, '1x1');
    await act(async () => {
      useBrickStore.setState({ bricks: updatedBricks });
    });

    // Verify count updated
    await waitFor(
      () => {
        const scene = getR3FScene(canvas);
        const meshes = collectInstancedMeshes(scene!);
        const active = meshes.find((m) => m.count === 7);
        expect(active).toBeDefined();
      },
      { timeout: 3000 }
    );
  });

  // -------------------------------------------------------------------------
  // T-FE-PERF-001-01e — Empty scene renders without errors (Unit)
  // -------------------------------------------------------------------------
  it('T-FE-PERF-001-01e: Empty brick list renders without errors', async () => {
    useBrickStore.setState({ bricks: [] });

    let renderError: Error | null = null;
    try {
      const { container } = render(
        <Canvas>
          <InstancedBricks />
        </Canvas>
      );

      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();

      await waitFor(
        () => {
          const scene = getR3FScene(canvas);
          expect(scene).toBeDefined();
          // All InstancedMesh objects should have count = 0
          const meshes = collectInstancedMeshes(scene!);
          // InstancedBricks renders 4 types; all should have count=0
          meshes.forEach((m) => expect(m.count).toBe(0));
        },
        { timeout: 3000 }
      );
    } catch (err) {
      renderError = err as Error;
    }

    expect(renderError).toBeNull();
  });

  // -------------------------------------------------------------------------
  // T-FE-PERF-001-02 — Behavioral: FPS simulation with 100 bricks (Behavioral)
  //
  // In jsdom there is no real GPU rendering, so we cannot measure actual FPS.
  // This behavioral test verifies the architectural contract:
  //   - With 100 bricks, the scene uses ≤ 4 draw calls (one InstancedMesh per type)
  //   - No individual Mesh objects are created per brick
  //   - The InstancedMesh count matches the brick count
  //
  // Real FPS measurement is covered by T-PERF-PERF-001-01 in the Playwright e2e suite.
  // -------------------------------------------------------------------------
  it('T-FE-PERF-001-02: 100 bricks use ≤ 4 InstancedMesh draw calls (behavioral contract)', async () => {
    // Mix all 4 brick types: 25 each = 100 total
    const bricks = [
      ...createTestBricks(25, '1x1'),
      ...createTestBricks(25, '1x2'),
      ...createTestBricks(25, '2x2'),
      ...createTestBricks(25, '2x4'),
    ];
    useBrickStore.setState({ bricks });

    const { container } = render(
      <Canvas>
        <InstancedBricks />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');

    await waitFor(
      () => {
        const scene = getR3FScene(canvas);
        expect(scene).toBeDefined();

        const instancedMeshes = collectInstancedMeshes(scene!);

        // Must use InstancedMesh — not individual Mesh per brick
        // 100 bricks → at most 4 InstancedMesh objects (one per type)
        expect(instancedMeshes.length).toBeLessThanOrEqual(4);
        expect(instancedMeshes.length).toBeGreaterThanOrEqual(1);

        // Total instance count across all meshes must equal 100
        const totalInstances = instancedMeshes.reduce((sum, m) => sum + m.count, 0);
        expect(totalInstances).toBe(100);

        // No individual Mesh objects should exist for bricks
        // (GridPlane is a Mesh but uses PlaneGeometry, not BoxGeometry)
        const boxMeshes: THREE.Mesh[] = [];
        scene!.traverse((obj) => {
          if (
            obj instanceof THREE.Mesh &&
            !(obj instanceof THREE.InstancedMesh) &&
            obj.geometry instanceof THREE.BoxGeometry
          ) {
            boxMeshes.push(obj);
          }
        });
        // No non-instanced box meshes should exist
        expect(boxMeshes.length).toBe(0);
      },
      { timeout: 5000 }
    );
  });

  // -------------------------------------------------------------------------
  // T-FE-PERF-001-02b — Behavioral: 500 bricks use ≤ 4 draw calls (Behavioral)
  // -------------------------------------------------------------------------
  it('T-FE-PERF-001-02b: 500 bricks use ≤ 4 InstancedMesh draw calls (behavioral contract)', async () => {
    // 500 bricks of mixed types
    const bricks = [
      ...createTestBricks(125, '1x1'),
      ...createTestBricks(125, '1x2'),
      ...createTestBricks(125, '2x2'),
      ...createTestBricks(125, '2x4'),
    ];
    useBrickStore.setState({ bricks });

    const { container } = render(
      <Canvas>
        <InstancedBricks />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');

    await waitFor(
      () => {
        const scene = getR3FScene(canvas);
        expect(scene).toBeDefined();

        const instancedMeshes = collectInstancedMeshes(scene!);

        // ≤ 4 draw calls for 500 bricks
        expect(instancedMeshes.length).toBeLessThanOrEqual(4);

        // Total instance count = 500
        const totalInstances = instancedMeshes.reduce((sum, m) => sum + m.count, 0);
        expect(totalInstances).toBe(500);
      },
      { timeout: 5000 }
    );
  });

  // -------------------------------------------------------------------------
  // T-FE-PERF-001-02c — Behavioral: 1000 bricks load without crash (NFR-SCALE-001)
  // -------------------------------------------------------------------------
  it('T-FE-PERF-001-02c: 1000 bricks load without crash (NFR-SCALE-001)', async () => {
    // 1000 bricks — tests NFR-SCALE-001 (no crash)
    const bricks = [
      ...createTestBricks(250, '1x1'),
      ...createTestBricks(250, '1x2'),
      ...createTestBricks(250, '2x2'),
      ...createTestBricks(250, '2x4'),
    ];

    let renderError: Error | null = null;
    try {
      useBrickStore.setState({ bricks });

      const { container } = render(
        <Canvas>
          <InstancedBricks />
        </Canvas>
      );

      const canvas = container.querySelector('canvas');

      await waitFor(
        () => {
          const scene = getR3FScene(canvas);
          expect(scene).toBeDefined();

          const instancedMeshes = collectInstancedMeshes(scene!);
          const totalInstances = instancedMeshes.reduce((sum, m) => sum + m.count, 0);
          expect(totalInstances).toBe(1000);
        },
        { timeout: 10000 }
      );
    } catch (err) {
      renderError = err as Error;
    }

    // Must not crash
    expect(renderError).toBeNull();
  });

  // -------------------------------------------------------------------------
  // T-FE-PERF-001-01f — Geometry disposal on unmount (Unit)
  // -------------------------------------------------------------------------
  it('T-FE-PERF-001-01f: Geometry dispose is called on component unmount', async () => {
    const bricks = createTestBricks(5, '1x1');
    useBrickStore.setState({ bricks });

    const { container, unmount } = render(
      <Canvas>
        <InstancedBricks />
      </Canvas>
    );

    const canvas = container.querySelector('canvas');

    // Capture geometry references before unmount
    let capturedGeometries: THREE.BufferGeometry[] = [];
    await waitFor(
      () => {
        const scene = getR3FScene(canvas);
        expect(scene).toBeDefined();
        const meshes = collectInstancedMeshes(scene!);
        expect(meshes.length).toBeGreaterThan(0);
        capturedGeometries = meshes.map((m) => m.geometry);
      },
      { timeout: 3000 }
    );

    // Spy on dispose for each geometry
    const disposeSpy = capturedGeometries.map((g) => vi.spyOn(g, 'dispose'));

    // Unmount the component
    await act(async () => {
      unmount();
    });

    // At least one geometry.dispose() should have been called
    // (InstancedBrickType calls meshRef.current?.geometry.dispose() on unmount)
    const anyDisposed = disposeSpy.some((spy) => spy.mock.calls.length > 0);
    expect(anyDisposed).toBe(true);
  });
});
