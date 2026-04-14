import { describe, it, expect } from 'vitest';
import { importModelJSON, exportModelJSON } from '../../services/exportService';
import { Brick } from '../../store/types';

describe('exportService', () => {
  const sampleBricks: Brick[] = [
    { id: 'b1', x: 0, y: 0, z: 0, type: '1x1', colorId: 'bright-red', rotation: 0 },
    { id: 'b2', x: 2, y: 0, z: 3, type: '2x4', colorId: 'bright-blue', rotation: 90 },
  ];

  it('T-FE-SHARE-001-02: imports valid JSON', () => {
    const json = JSON.stringify({ version: '1.0.0', exportedAt: '', bricks: sampleBricks });
    const result = importModelJSON(json);
    expect(result).toHaveLength(2);
  });

  it('T-FE-SHARE-001-03: throws on malformed JSON', () => {
    expect(() => importModelJSON('not valid json{')).toThrow('Invalid JSON');
  });

  it('throws on missing version field', () => {
    expect(() => importModelJSON(JSON.stringify({ bricks: sampleBricks }))).toThrow('Invalid model format');
  });

  it('sanitizes invalid brick type to 1x1', () => {
    const json = JSON.stringify({
      version: '1.0.0',
      bricks: [{ id: 'b1', x: 0, y: 0, z: 0, type: 'invalid', colorId: 'bright-red', rotation: 0 }],
    });
    expect(importModelJSON(json)[0].type).toBe('1x1');
  });

  it('T-FE-SHARE-001-01: exportModelJSON triggers download', () => {
    const mockCreateObjectURL = vi.fn(() => 'blob:mock');
    const mockClick = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = vi.fn();
    const mockAnchor = { href: '', download: '', click: mockClick } as unknown as HTMLAnchorElement;
    vi.spyOn(document, 'createElement').mockReturnValueOnce(mockAnchor);
    exportModelJSON(sampleBricks);
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockClick).toHaveBeenCalled();
  });
});
