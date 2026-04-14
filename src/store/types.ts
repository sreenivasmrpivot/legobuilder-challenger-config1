/**
 * Core TypeScript types for the LEGO Builder store.
 * Plain JS objects only - no Three.js types.
 * Three.js geometry is reconstructed from BRICK_CATALOG at render time.
 */

export type BrickType = '1x1' | '1x2' | '2x2' | '2x4';
export type Tool = 'place' | 'delete';

export interface BrickColor {
  id: string;    // e.g., 'bright-red'
  name: string;  // e.g., 'Bright Red' (official LEGO name)
  hex: string;   // e.g., '#C91A09'
}

export interface Brick {
  id: string;        // uuid
  x: number;         // grid X (integer)
  y: number;         // grid Y (always 0 for MVP - CLR-01: flat grid only)
  z: number;         // grid Z (integer)
  type: BrickType;
  colorId: string;   // references BrickColor.id
  rotation: 0 | 90 | 180 | 270;  // degrees around Y-axis
}

export interface BrickStore {
  // State
  bricks: Brick[];
  activeTool: Tool;            // default: 'place' (FR-TOOL-001)
  activeColorId: string;       // default: 'bright-red' (US-1)
  activeBrickType: BrickType;  // default: '1x1'
  notification: string | null;

  // Actions
  /** FR-BRICK-001: Place brick at grid position using active type/color */
  placeBrick: (x: number, y: number, z: number) => void;
  /** FR-TOOL-002: Delete brick by ID */
  deleteBrick: (id: string) => void;
  /** FR-TOOL-002: Delete brick at grid position */
  deleteBrickAtPosition: (x: number, y: number, z: number) => void;
  /** FR-TOOL-003: Rotate brick 90 degrees clockwise around Y-axis */
  rotateBrick: (id: string) => void;
  /** FR-TOOL-001, FR-TOOL-002: Switch active tool */
  setActiveTool: (tool: Tool) => void;
  /** FR-BRICK-002: Set active color */
  setActiveColor: (colorId: string) => void;
  /** FR-BRICK-003: Set active brick type */
  setActiveBrickType: (type: BrickType) => void;
  /** FR-PERS-002, FR-SHARE-001: Replace all bricks (load/import) */
  setBricks: (bricks: Brick[]) => void;
  /** FR-PERS-001: Set notification message */
  setNotification: (msg: string | null) => void;
}
