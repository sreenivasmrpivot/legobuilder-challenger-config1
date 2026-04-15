import { useBrickStore } from '../../store/useBrickStore';
import { Tool } from '../../store/types';
import { ToolButton } from './ToolButton';

/**
 * Toolbar — tool selection (Place / Delete).
 *
 * FR-TOOL-001: Place mode is default; Place button highlighted on load.
 * FR-TOOL-002: Delete mode button.
 * NFR-A11Y-001: role="toolbar", aria-label, keyboard accessible.
 *
 * Renders two ToolButton components. Reads activeTool from Zustand store
 * and passes isActive prop to each button. Calls setActiveTool on click.
 */
export function Toolbar() {
  const activeTool = useBrickStore(state => state.activeTool);
  const setActiveTool = useBrickStore(state => state.setActiveTool);

  const tools: { id: Tool; label: string }[] = [
    { id: 'place',  label: 'Place'  },
    { id: 'delete', label: 'Delete' },
  ];

  return (
    <section aria-label="Tool selection">
      <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Tool</h2>
      <div className="flex gap-2" role="toolbar" aria-label="Building tools">
        {tools.map(tool => (
          <ToolButton
            key={tool.id}
            tool={tool.id}
            label={tool.label}
            isActive={activeTool === tool.id}
            onClick={setActiveTool}
          />
        ))}
      </div>
    </section>
  );
}
