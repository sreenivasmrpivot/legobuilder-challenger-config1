import localforage from 'localforage';
import { Brick } from '../store/types';

/**
 * Persistence service - data layer.
 * FR-PERS-001: save model within 500ms for up to 1,000 bricks
 * FR-PERS-002: load model with 100% fidelity
 * CLR-04: handle storage quota errors gracefully
 */

const STORAGE_KEY = 'lego-builder-model';
const SCHEMA_VERSION = '1.0.0';

export interface PersistedModel {
  version: string;
  savedAt: string;
  bricks: Brick[];
}

export async function saveModel(bricks: Brick[]): Promise<void> {
  const model: PersistedModel = {
    version: SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    bricks,
  };
  await localforage.setItem(STORAGE_KEY, model);
}

export async function loadModel(): Promise<Brick[] | null> {
  const model = await localforage.getItem<PersistedModel>(STORAGE_KEY);
  if (!model) return null;
  return model.bricks;
}
