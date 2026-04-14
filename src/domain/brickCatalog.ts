import * as THREE from 'three';
import { BrickType } from '../store/types';

export interface BrickDefinition {
  type: BrickType;
  label: string;
  width: number;   // grid units (X)
  depth: number;   // grid units (Z)
  height: number;  // grid units (Y) - always 1 for MVP
  geometry: THREE.BoxGeometry;
}

/**
 * Brick type catalog - domain layer.
 * BoxGeometry approximations (CLR-02: no official LEGO part data).
 * Geometries are module-level singletons - NOT serializable.
 * Store only BrickType strings in Zustand/LocalForage.
 *
 * FR-BRICK-003: 4 brick types required (1x1, 1x2, 2x2, 2x4)
 */
export const BRICK_CATALOG: Record<BrickType, BrickDefinition> = {
  '1x1': {
    type: '1x1', label: '1x1',
    width: 1, depth: 1, height: 1,
    geometry: new THREE.BoxGeometry(0.95, 0.95, 0.95),
  },
  '1x2': {
    type: '1x2', label: '1x2',
    width: 1, depth: 2, height: 1,
    geometry: new THREE.BoxGeometry(0.95, 0.95, 1.95),
  },
  '2x2': {
    type: '2x2', label: '2x2',
    width: 2, depth: 2, height: 1,
    geometry: new THREE.BoxGeometry(1.95, 0.95, 1.95),
  },
  '2x4': {
    type: '2x4', label: '2x4',
    width: 2, depth: 4, height: 1,
    geometry: new THREE.BoxGeometry(1.95, 0.95, 3.95),
  },
};

export const BRICK_TYPES = Object.keys(BRICK_CATALOG) as BrickType[];
