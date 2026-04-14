import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { BrickStore, Brick, Tool, BrickType } from './types';
import { getOccupiedCells, isCellOccupied } from '../domain/gridRules';

/**
 * Zustand store - single source of truth for all brick state.
 * No React context provider needed. Subscribe via useBrickStore(selector).
 *
 * FR-TOOL-001: activeTool defaults to 'place'
 * FR-BRICK-001: placeBrick validates occupancy before adding
 * FR-TOOL-003: rotateBrick cycles 0->90->180->270->0
 * FR-PERS-001/002: setBricks replaces entire array (load/import)
 * FR-PERS-001: setNotification for user feedback
 */
export const useBrickStore = create<BrickStore>((set, get) => ({
  // ── Initial State ──────────────────────────────────────────────────────────
  bricks: [],
  activeTool: 'place',         // FR-TOOL-001: default to Place mode
  activeColorId: 'bright-red', // US-1: default color
  activeBrickType: '1x1',      // FR-BRICK-003: default brick type
  notification: null,

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * FR-BRICK-001: Place a brick at grid position (x, y, z).
   * Rejects if any cell of the new brick is already occupied.
   * Uses activeColorId and activeBrickType from store.
   */
  placeBrick: (x, y, z) => {
    const { bricks, activeBrickType, activeColorId } = get();
    const newCells = getOccupiedCells(x, z, activeBrickType, 0);
    if (isCellOccupied(newCells, bricks)) return; // FR-BRICK-001: reject duplicate
    const brick: Brick = {
      id: uuidv4(),
      x, y, z,
      type: activeBrickType,
      colorId: activeColorId,
      rotation: 0,
    };
    set(state => ({ bricks: [...state.bricks, brick] }));
  },

  /** FR-TOOL-002: Delete brick by UUID. */
  deleteBrick: (id) => {
    set(state => ({ bricks: state.bricks.filter(b => b.id !== id) }));
  },

  /** FR-TOOL-002: Delete brick at grid position (x, z). */
  deleteBrickAtPosition: (x, _y, z) => {
    set(state => ({
      bricks: state.bricks.filter(b => !(b.x === x && b.z === z)),
    }));
  },

  /**
   * FR-TOOL-003: Rotate brick 90° clockwise around Y-axis.
   * Cycles: 0 → 90 → 180 → 270 → 0
   */
  rotateBrick: (id) => {
    set(state => ({
      bricks: state.bricks.map(b =>
        b.id === id
          ? { ...b, rotation: ((b.rotation + 90) % 360) as 0 | 90 | 180 | 270 }
          : b
      ),
    }));
  },

  /** FR-TOOL-001, FR-TOOL-002: Switch active tool. */
  setActiveTool: (tool: Tool) => set({ activeTool: tool }),

  /** FR-BRICK-002: Set active color for next placement. */
  setActiveColor: (colorId: string) => set({ activeColorId: colorId }),

  /** FR-BRICK-003: Set active brick type for next placement. */
  setActiveBrickType: (type: BrickType) => set({ activeBrickType: type }),

  /** FR-PERS-002, FR-SHARE-001: Replace all bricks (load/import). */
  setBricks: (bricks: Brick[]) => set({ bricks }),

  /** FR-PERS-001: Set notification message (null to clear). */
  setNotification: (msg) => set({ notification: msg }),
}));
