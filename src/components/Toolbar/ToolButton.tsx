import { Tool } from '../../store/types';

interface ToolButtonProps {
  /** Tool identifier — used for data-testid and aria-pressed */
  tool: Tool;
  /** Human-readable label shown inside the button */
  label: string;
  /** Whether this tool is currently active */
  isActive: boolean;
  /** Callback fired when the button is clicked */
  onClick: (tool: Tool) => void;
}

/**
 * ToolButton — individual tool selector button.
 *
 * FR-TOOL-001: Place tool button with active highlight.
 * FR-TOOL-002: Delete tool button with active highlight.
 * NFR-A11Y-001: aria-pressed reflects active state; keyboard accessible.
 *
 * data-testid pattern: `tool-{tool}` (e.g., `tool-place`, `tool-delete`)
 */
export function ToolButton({ tool, label, isActive, onClick }: ToolButtonProps) {
  return (
    <button
      data-testid={`tool-${tool}`}
      onClick={() => onClick(tool)}
      aria-pressed={isActive}
      className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );
}
