import { Brick, BrickType } from '../store/types';
import { BRICK_CATALOG } from './brickCatalog';

/**
 * Grid rules - domain layer.
 * Technology-agnostic. No Three.js, no React, no Zustand.
 *
 * FR-BRICK-001: grid snapping (CLR-01: flat grid, Y=0 only)
 * FR-BRICK-003: multi-cell footprint validation
 */

/** Snap a world-space coordinate to the nearest integer grid unit. */
export function snapCoord(worldCoord: number): number {
  return Math.round(worldCoord);
}

/**
 * Get all grid cells occupied by a brick at (x, z) with given type and rotation.
 * Rotation 90/270 swaps width and depth.
 */
export function getOccupiedCells(
  x: number,
  z: number,
  type: BrickType,
  rotation: number
): Array<{ x: number; z: number }> {
  const def = BRICK_CATALOG[type];
  const cells: Array<{ x: number; z: number }> = [];
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

/** Check if any of the given cells are occupied by existing bricks. */
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
