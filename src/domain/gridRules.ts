import { Brick, BrickType } from '../store/types';
import { BRICK_CATALOG } from './brickCatalog';

/**
 * Grid rules - domain layer.
 * Technology-agnostic. No Three.js, no React, no Zustand.
 *
 * FR-BRICK-001: grid snapping (CLR-01: flat grid, Y=0 only)
 * FR-BRICK-003: multi-cell footprint validation
 */

/**
 * Snap a world-space coordinate to the nearest integer grid unit.
 * T-FE-BRICK-001-03: snapCoord(2.7) === 3
 */
export function snapCoord(worldCoord: number): number {
  return Math.round(worldCoord);
}

/**
 * Get all grid cells occupied by a brick at (x, z) with given type and rotation.
 * Rotation 90°/270° swaps width and depth to handle landscape/portrait orientation.
 * T-FE-BRICK-003-03: 2×4 brick at (0,0) occupies 8 cells
 */
export function getOccupiedCells(
  x: number,
  z: number,
  type: BrickType,
  rotation: number
): Array<{ x: number; z: number }> {
  const def = BRICK_CATALOG[type];
  const cells: Array<{ x: number; z: number }> = [];
  // Swap width/depth for 90° and 270° rotations
  const [w, d] =
    rotation === 90 || rotation === 270
      ? [def.depth, def.width]
      : [def.width, def.depth];
  for (let dx = 0; dx < w; dx++) {
    for (let dz = 0; dz < d; dz++) {
      cells.push({ x: x + dx, z: z + dz });
    }
  }
  return cells;
}

/**
 * Check if any of the given cells are occupied by existing bricks.
 * Uses a Set for O(1) lookup per cell.
 * T-FE-BRICK-001-02: duplicate placement rejected
 */
export function isCellOccupied(
  cells: Array<{ x: number; z: number }>,
  existingBricks: Brick[]
): boolean {
  const occupied = new Set(
    existingBricks.flatMap(b =>
      getOccupiedCells(b.x, b.z, b.type, b.rotation).map(c => `${c.x},${c.z}`)
    )
  );
  return cells.some(c => occupied.has(`${c.x},${c.z}`));
}
