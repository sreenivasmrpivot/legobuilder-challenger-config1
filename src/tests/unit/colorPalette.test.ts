import { describe, it, expect } from 'vitest';
import { LEGO_COLORS, getColorById } from '../../domain/colorPalette';

describe('colorPalette', () => {
  it('T-FE-BRICK-002-02: has at least 10 colors', () => {
    expect(LEGO_COLORS.length).toBeGreaterThanOrEqual(10);
  });
  it('all colors have id, name, hex', () => {
    LEGO_COLORS.forEach(c => {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
  it('getColorById returns correct color', () => {
    expect(getColorById('bright-red').name).toBe('Bright Red');
  });
  it('getColorById returns first color for unknown id', () => {
    expect(getColorById('nonexistent')).toBe(LEGO_COLORS[0]);
  });
});
