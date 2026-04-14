import { describe, it, expect } from 'vitest';
import { snapCoord, getOccupiedCells, isCellOccupied } from '../../domain/gridRules';
import { Brick } from '../../store/types';

describe('gridRules', () => {
  describe('snapCoord', () => {
    it('T-FE-BRICK-001-03: snaps 2.7 to 3', () => {
      expect(snapCoord(2.7)).toBe(3);
    });
    it('snaps 3.3 to 3', () => {
      expect(snapCoord(3.3)).toBe(3);
    });
    it('snaps negative coordinates', () => {
      expect(snapCoord(-1.4)).toBe(-1);
    });
  });

  describe('getOccupiedCells', () => {
    it('1x1 brick occupies 1 cell', () => {
      const cells = getOccupiedCells(0, 0, '1x1', 0);
      expect(cells).toHaveLength(1);
    });
    it('2x4 brick occupies 8 cells', () => {
      const cells = getOccupiedCells(0, 0, '2x4', 0);
      expect(cells).toHaveLength(8);
    });
  });

  describe('isCellOccupied', () => {
    const existingBrick: Brick = {
      id: 'b1', x: 2, y: 0, z: 3, type: '1x1', colorId: 'bright-red', rotation: 0,
    };
    it('T-FE-BRICK-001-02: returns true when cell is occupied', () => {
      expect(isCellOccupied([{ x: 2, z: 3 }], [existingBrick])).toBe(true);
    });
    it('returns false when cell is free', () => {
      expect(isCellOccupied([{ x: 5, z: 5 }], [existingBrick])).toBe(false);
    });
    it('T-FE-BRICK-003-03: 2x4 brick blocks adjacent cells', () => {
      const bigBrick: Brick = { id: 'b2', x: 0, y: 0, z: 0, type: '2x4', colorId: 'bright-red', rotation: 0 };
      expect(isCellOccupied([{ x: 1, z: 0 }], [bigBrick])).toBe(true);
    });
  });
});
