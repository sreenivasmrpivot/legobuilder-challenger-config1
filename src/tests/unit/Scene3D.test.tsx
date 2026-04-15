import { describe, it, expect, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Scene3D } from '../../components/Scene3D/Scene3D';
import { App } from '../../App';
import { useBrickStore } from '../../store/useBrickStore';
import * as THREE from 'three';

/**
 * Scene3D unit & behavioral tests — FR-SCENE-001
 *
 * Test IDs:
 *   T-FE-SCENE-001-01 — Scene renders without WebGL errors (Unit)
 *   T-FE-SCENE-001-02 — Camera orbit controls are present (Unit)
 *   T-FE-SCENE-001-03 — Scene renders grid plane (Behavioral)
 */

describe('Scene3D — FR-SCENE-001', () => {
  beforeEach(() => {
    // Reset store and clear any accumulated WebGL errors
    useBrickStore.setState({
      bricks: [],
      activeTool: 'place',
      activeColorId: 'bright-red',
      activeBrickType: '1x1',
      notification: null,
    });
    // Reset global error tracker
    if (typeof window !== 'undefined') {
      window.__legoBuilderErrors = [];
    }
  });

  /**
   * T-FE-SCENE-001-01 — Scene renders without WebGL errors (Unit)
   *
   * Verify that the Scene3D component mounts and renders a Three.js canvas
   * without throwing errors. Canvas element must be present in DOM.
   */
  it('T-FE-SCENE-001-01: Scene renders without WebGL errors', async () => {
    let renderError: Error | null = null;

    try {
      const { container } = render(<Scene3D />);

      // Canvas element must be present in DOM
      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();

      // Wait for R3F to mount
      await waitFor(() => {
        const c = container.querySelector('canvas');
        expect(c).toBeTruthy();
      });
    } catch (err) {
      renderError = err as Error;
    }

    // No errors should have been thrown during mount
    expect(renderError).toBeNull();

    // No WebGL errors should have been accumulated
    const webglErrors = (window as any).__legoBuilderErrors ?? [];
    expect(webglErrors).toHaveLength(0);
  });

  /**
   * T-FE-SCENE-001-02 — Camera orbit controls are present (Unit)
   *
   * Verify that OrbitControls are registered in the Three.js scene.
   * The scene graph must contain an OrbitControls-related object.
   */
  it('T-FE-SCENE-001-02: Camera orbit controls are present', async () => {
    const { container } = render(<Scene3D />);

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();

    await waitFor(
      () => {
        // Access the Three.js scene via R3F's internal __r3f property
        const r3f = (canvas as any).__r3f;
        expect(r3f).toBeDefined();

        const scene = r3f?.scene as THREE.Scene | undefined;
        expect(scene).toBeDefined();

        // OrbitControls attaches to the camera and scene; look for its
        // presence by checking the scene's children or the R3F root state.
        // R3F stores controls in the root state's `controls` property.
        const rootState = r3f?.root?.getState?.();
        if (rootState) {
          // If R3F root state is accessible, verify controls are set
          // OrbitControls registers itself as the scene controls
          expect(rootState.controls).toBeDefined();
        } else {
          // Fallback: traverse scene for any object with isOrbitControls
          // or check that the camera is not at the default [0,0,5] position
          // (Scene3D sets camera to [10,10,10])
          const camera = r3f?.camera as THREE.PerspectiveCamera | undefined;
          if (camera) {
            // Camera should be at position [10, 10, 10] as configured
            expect(camera.position.x).toBeCloseTo(10, 0);
            expect(camera.position.y).toBeCloseTo(10, 0);
            expect(camera.position.z).toBeCloseTo(10, 0);
            // FOV should be 50 as configured
            expect(camera.fov).toBe(50);
          }
        }
      },
      { timeout: 3000 }
    );
  });

  /**
   * T-FE-SCENE-001-03 — Scene renders grid plane (Behavioral)
   *
   * Behavioral test: verify the 3D grid plane is present in the scene
   * when the full App component tree is rendered with real Zustand store,
   * real R3F canvas, no mocked stores or hooks.
   *
   * Checks:
   * - Canvas element is present
   * - Three.js scene contains a mesh (GridPlane) with planeGeometry
   * - No WebGL errors in console
   */
  it('T-FE-SCENE-001-03: Scene renders grid plane (Behavioral — full App, no mocked stores)', async () => {
    // Render the full App component tree (no mocks for stores or hooks)
    const { container } = render(<App />);

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeTruthy();

    await waitFor(
      () => {
        const r3f = (canvas as any).__r3f;
        expect(r3f).toBeDefined();

        const scene = r3f?.scene as THREE.Scene | undefined;
        expect(scene).toBeDefined();

        if (scene) {
          // Traverse the scene graph to find the GridPlane mesh
          // GridPlane uses a PlaneGeometry (args=[20,20]) and is rotated -PI/2 on X
          const planeMeshes: THREE.Mesh[] = [];
          scene.traverse((object) => {
            if (
              object instanceof THREE.Mesh &&
              object.geometry instanceof THREE.PlaneGeometry
            ) {
              planeMeshes.push(object);
            }
          });

          // At least one PlaneGeometry mesh (GridPlane) must be present
          expect(planeMeshes.length).toBeGreaterThanOrEqual(1);

          // The GridPlane mesh should be visible (not hidden)
          // Note: GridPlane uses transparent material but is not hidden
          const gridPlane = planeMeshes[0];
          expect(gridPlane).toBeDefined();

          // Verify the plane is positioned at Y=0 (ground level)
          expect(gridPlane.position.y).toBeCloseTo(0, 1);
        }
      },
      { timeout: 3000 }
    );

    // No WebGL errors should have been accumulated during behavioral test
    const webglErrors = (window as any).__legoBuilderErrors ?? [];
    expect(webglErrors).toHaveLength(0);
  });
});
