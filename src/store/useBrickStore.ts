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
 */
export const useBrickStore = create<BrickStore>((set, get) => ({
  // Initial State
  bricks: [],
  activeTool: 'place',         // FR-TOOL-001: default to Place mode
  activeColorId: 'bright-red', // US-1: default color
  activeBrickType: '1x1',
  notification: null,

  // Actions
  placeBrick: (x, y, z) => {
    const { bricks, activeBrickType, activeColorId } = get();
    const newCells = getOccupiedCells(x, z, activeBrickType, 0);
    // FR-BRICK-001: reject if any cell is occupied
    if (isCellOccupied(newCells, bricks)) return;
    const brick: Brick = {
      id: uuidv4(),
      x, y, z,
      type: activeBrickType,
      colorId: activeColorId,
      rotation: 0,
    };
    set(state => ({ bricks: [...state.bricks, brick] }));
  },

  deleteBrick: (id) => {
    set(state => ({ bricks: state.bricks.filter(b => b.id !== id) }));
  },

  deleteBrickAtPosition: (x, _y, z) => {
    set(state => ({
      bricks: state.bricks.filter(b => !(b.x === x && b.z === z)),
    }));
  },

  rotateBrick: (id) => {
    // FR-TOOL-003: rotate 90 degrees clockwise, wrap at 360
    set(state => ({
      bricks: state.bricks.map(b =>
        b.id === id
          ? { ...b, rotation: ((b.rotation + 90) % 360) as 0 | 90 | 180 | 270 }
          : b
      ),
    }));
  },

  setActiveTool: (tool: Tool) => set({ activeTool: tool }),
  setActiveColor: (colorId: string) => set({ activeColorId: colorId }),
  setActiveBrickType: (type: BrickType) => set({ activeBrickType: type }),
  setBricks: (bricks: Brick[]) => set({ bricks }),
  setNotification: (msg) => set({ notification: msg }),
}));
