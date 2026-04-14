import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { GridPlane } from './GridPlane';
import { InstancedBricks } from './InstancedBricks';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

/**
 * Scene3D - R3F Canvas root component.
 * FR-SCENE-001: 3D scene with grid, lighting, OrbitControls
 *
 * GOTCHA: OrbitControls LEFT mouse button conflict.
 * Set mouseButtons={{ LEFT: undefined }} to free LEFT for brick placement.
 * See TECHNICAL_ARCHITECTURE.md section 3.3.
 */
export function Scene3D() {
  useKeyboardShortcuts();

  return (
    <Canvas
      camera={{ position: [10, 10, 10], fov: 50 }}
      gl={{ antialias: true }}
      shadows
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
      <Grid
        args={[20, 20]}
        cellColor="#555"
        sectionColor="#333"
        cellSize={1}
        sectionSize={5}
        fadeDistance={30}
        position={[0, 0, 0]}
      />
      <GridPlane />
      <InstancedBricks />
      {/*
       * OrbitControls - LEFT: undefined frees LEFT click for brick placement
       * MIDDLE: 1 (dolly/zoom), RIGHT: 2 (pan)
       */}
      <OrbitControls
        mouseButtons={{
          LEFT: undefined as unknown as number,
          MIDDLE: 1,
          RIGHT: 2,
        }}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
