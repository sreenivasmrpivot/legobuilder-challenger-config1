import { useBrickStore } from '../../store/useBrickStore';
import { Tool } from '../../store/types';

/**
 * Toolbar - tool selection (Place / Delete).
 * FR-TOOL-001: Place mode is default; button highlighted on load.
 * FR-TOOL-002: Delete mode button.
 * NFR-A11Y-001: aria-pressed for active state, keyboard accessible.
 */
export function Toolbar() {
  const activeTool = useBrickStore(state => state.activeTool);
  const setActiveTool = useBrickStore(state => state.setActiveTool);

  const tools: { id: Tool; label: string; testId: string }[] = [
    { id: 'place',  label: 'Place',  testId: 'tool-place' },
    { id: 'delete', label: 'Delete', testId: 'tool-delete' },
  ];

  return (
    <section aria-label="Tool selection">
      <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Tool</h2>
      <div className="flex gap-2" role="toolbar" aria-label="Building tools">
        {tools.map(tool => (
          <button
            key={tool.id}
            data-testid={tool.testId}
            onClick={() => setActiveTool(tool.id)}
            aria-pressed={activeTool === tool.id}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
              activeTool === tool.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>
    </section>
  );
}
