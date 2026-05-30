import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveModel } from '../../services/persistenceService';
import { Brick } from '../../store/types';

// Mock localforage to avoid real IndexedDB
const mockSetItem = vi.fn(() => Promise.resolve());
vi.mock('localforage', () => ({
  default: {
    setItem: mockSetItem,
    getItem: vi.fn(() => Promise.resolve(null)),
  },
}));

describe('FR-PERS-001 Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('T-FE-PERS-001-02: Save completes within 500ms for 1,000 bricks', async () => {
    // Generate 1000 bricks to simulate a large model
    const bricks: Brick[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `brick-${i}`,
      x: i % 10,
      y: 0,
      z: Math.floor(i / 10),
      type: '1x1' as const,
      colorId: 'bright-red',
      rotation: 0,
    }));

    const start = performance.now();
    await saveModel(bricks);
    const duration = performance.now() - start;

    expect(duration).toBeLessThanOrEqual(500);
    expect(mockSetItem).toHaveBeenCalledTimes(1);
  });
});
