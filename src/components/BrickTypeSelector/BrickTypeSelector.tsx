import { useBrickStore } from '../../store/useBrickStore';
import { BRICK_CATALOG, BRICK_TYPES } from '../../domain/brickCatalog';
import { BrickType } from '../../store/types';

/**
 * BrickTypeSelector - brick type selection.
 * FR-BRICK-003: >=4 brick types (1x1, 1x2, 2x2, 2x4) with preview.
 * NFR-A11Y-001: aria-pressed, keyboard accessible.
 */
export function BrickTypeSelector() {
  const activeBrickType = useBrickStore(state => state.activeBrickType);
  const setActiveBrickType = useBrickStore(state => state.setActiveBrickType);

  return (
    <section aria-label="Brick type selection">
      <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Brick Type</h2>
      <div className="grid grid-cols-2 gap-1" role="listbox" aria-label="Brick types">
        {BRICK_TYPES.map(type => {
          const def = BRICK_CATALOG[type];
          return (
            <button
              key={type}
              data-testid={`brick-type-${type}`}
              onClick={() => setActiveBrickType(type as BrickType)}
              aria-pressed={activeBrickType === type}
              aria-label={`${def.label} brick`}
              className={`py-2 px-2 rounded text-xs font-medium transition-colors ${
                activeBrickType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div
                className="mx-auto mb-1 bg-current rounded-sm"
                style={{
                  width: `${def.width * 10}px`,
                  height: `${def.depth * 5}px`,
                  maxWidth: '100%',
                }}
                aria-hidden="true"
              />
              {def.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
