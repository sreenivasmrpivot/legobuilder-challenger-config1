import { Brick, BrickType } from '../store/types';
import { BRICK_TYPES } from '../domain/brickCatalog';
import { LEGO_COLORS } from '../domain/colorPalette';

/**
 * Export/Import service - data layer.
 * FR-SHARE-001: export as versioned JSON, import with validation
 * CLR-05: invalid/malformed JSON shows error, does not corrupt scene
 */

const EXPORT_VERSION = '1.0.0';
const VALID_BRICK_TYPES = BRICK_TYPES;
const VALID_COLOR_IDS = LEGO_COLORS.map(c => c.id);
const VALID_ROTATIONS = [0, 90, 180, 270] as const;

export interface ExportedModel {
  version: string;
  exportedAt: string;
  bricks: Brick[];
}

export function exportModelJSON(bricks: Brick[]): void {
  const model: ExportedModel = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    bricks,
  };
  const json = JSON.stringify(model, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'lego-model.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importModelJSON(jsonString: string): Brick[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON: file could not be parsed');
  }

  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('version' in parsed) ||
    !('bricks' in parsed) ||
    !Array.isArray((parsed as ExportedModel).bricks)
  ) {
    throw new Error('Invalid model format: missing version or bricks fields');
  }

  const rawBricks = (parsed as ExportedModel).bricks;

  return rawBricks.map((brick): Brick => ({
    id: String(brick.id ?? '').slice(0, 64),
    x: Math.round(Number(brick.x) || 0),
    y: 0,
    z: Math.round(Number(brick.z) || 0),
    type: VALID_BRICK_TYPES.includes(brick.type as BrickType)
      ? (brick.type as BrickType)
      : '1x1',
    colorId: VALID_COLOR_IDS.includes(brick.colorId as string)
      ? (brick.colorId as string)
      : 'bright-red',
    rotation: VALID_ROTATIONS.includes(brick.rotation as 0 | 90 | 180 | 270)
      ? (brick.rotation as 0 | 90 | 180 | 270)
      : 0,
  }));
}
