import { useGridInteraction } from '../../hooks/useGridInteraction';

/**
 * GridPlane - invisible clickable plane for brick placement.
 * FR-BRICK-001: click target for grid-snapped brick placement.
 *
 * IMPORTANT: R3F mesh - onPointerDown fires ThreeEvent with .point: Vector3.
 * NOT a DOM PointerEvent. See TECHNICAL_ARCHITECTURE.md section 3.1.
 */
export function GridPlane() {
  const { handleGridClick } = useGridInteraction();

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={handleGridClick}
      receiveShadow
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial transparent opacity={0} />
    </mesh>
  );
}
