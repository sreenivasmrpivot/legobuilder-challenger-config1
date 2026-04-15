import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveModel } from '../../services/persistenceService';
import { Brick } from '../../store/types';

// Mock localforage for consistent timing
vi.mock('localforage', () => ({
  setItem: vi.fn(() => Promise.resolve()),
  getItem: vi.fn(() => Promise.resolve(null)),
}));

describe('persistenceService Performance — FR-PERS-001', () => {
  it('T-FE-PERS-001-02: Save completes within 500ms for 1000 bricks', async () => {
    const bricks: Brick[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `brick-${i}`,
      x: i % 10,
      y: 0,
      z: Math.floor(i / 10),
      type: '1x1',
      colorId: 'bright-red',
      rotation: 0,
    }));

    const start = performance.now();
    await saveModel(bricks);
    const duration = performance.now() - start;

    expect(duration).toBeLessThanOrEqual(500);
  });
});
