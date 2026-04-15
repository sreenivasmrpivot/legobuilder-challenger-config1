import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveModel } from '../../services/persistenceService';
import { Brick } from '../../store/types';

// Mock localforage
const mockSetItem = vi.fn(() => Promise.resolve());
const mockGetItem = vi.fn(() => Promise.resolve(null));

vi.mock('localforage', () => ({
  setItem: mockSetItem,
  getItem: mockGetItem,
}));

describe('persistenceService — FR-PERS-001', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('T-FE-PERS-001-01: Save serializes all brick data', async () => {
    const bricks: Brick[] = [
      { id: '1', x: 0, y: 0, z: 0, type: '1x1', colorId: 'bright-red', rotation: 0 },
      { id: '2', x: 2, y: 0, z: 3, type: '2x2', colorId: 'bright-blue', rotation: 90 },
    ];
    await saveModel(bricks);

    expect(mockSetItem).toHaveBeenCalledTimes(1);
    const callArgs = mockSetItem.mock.calls[0];
    expect(callArgs[0]).toBe('lego-builder-model');
    const savedModel = callArgs[1];
    expect(savedModel).toEqual({
      version: '1.0.0',
      savedAt: expect.any(String),
      bricks,
    });
  });
});
