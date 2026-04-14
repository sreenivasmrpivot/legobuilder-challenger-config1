import { useCallback } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { useBrickStore } from '../store/useBrickStore';
import { snapCoord } from '../domain/gridRules';

/**
 * Hook: canvas pointer event -> grid coordinate mapping.
 * FR-BRICK-001: grid snapping via snapCoord()
 * FR-TOOL-001: place mode
 * FR-TOOL-002: delete mode
 *
 * IMPORTANT: Uses R3F ThreeEvent (has .point: Vector3), NOT DOM PointerEvent.
 * Attach to <mesh onPointerDown> (GridPlane), NOT <Canvas onPointerDown>.
 */
export function useGridInteraction() {
  const activeTool = useBrickStore(state => state.activeTool);
  const placeBrick = useBrickStore(state => state.placeBrick);
  const deleteBrickAtPosition = useBrickStore(state => state.deleteBrickAtPosition);

  const handleGridClick = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();
      const x = snapCoord(event.point.x);
      const z = snapCoord(event.point.z);
      if (activeTool === 'place') {
        placeBrick(x, 0, z);
      } else if (activeTool === 'delete') {
        deleteBrickAtPosition(x, 0, z);
      }
    },
    [activeTool, placeBrick, deleteBrickAtPosition]
  );

  return { handleGridClick };
}
