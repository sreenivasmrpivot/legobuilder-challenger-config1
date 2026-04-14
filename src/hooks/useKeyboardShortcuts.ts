import { useEffect } from 'react';
import { useBrickStore } from '../store/useBrickStore';

/**
 * Hook: keyboard shortcuts for tool switching.
 * P = Place mode, D = Delete mode
 * AFOL persona: expects keyboard shortcuts for common actions
 */
export function useKeyboardShortcuts() {
  const setActiveTool = useBrickStore(state => state.setActiveTool);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      switch (e.key.toLowerCase()) {
        case 'p':
          setActiveTool('place');
          break;
        case 'd':
          setActiveTool('delete');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool]);
}
