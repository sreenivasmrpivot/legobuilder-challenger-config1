import { useRef } from 'react';
import { useBrickStore } from '../../store/useBrickStore';
import { saveModel, loadModel } from '../../services/persistenceService';
import { exportModelJSON, importModelJSON } from '../../services/exportService';

/**
 * ActionBar - Save / Load / Export / Import buttons.
 * FR-PERS-001: Save model to browser storage (LocalForage).
 * FR-PERS-002: Load model from browser storage.
 * FR-SHARE-001: Export/Import JSON with versioned format.
 * NFR-A11Y-001: keyboard accessible, descriptive aria-labels.
 * CLR-04: QuotaExceededError handled gracefully.
 * CLR-05: Import errors shown without corrupting scene.
 */
export function ActionBar() {
  const bricks = useBrickStore(state => state.bricks);
  const setBricks = useBrickStore(state => state.setBricks);
  const setNotification = useBrickStore(state => state.setNotification);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Show a notification that auto-dismisses after `duration` ms. */
  const notify = (msg: string, duration = 3000) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), duration);
  };

  /** FR-PERS-001: Save current model to LocalForage. */
  const handleSave = async () => {
    try {
      await saveModel(bricks);
      notify('Model saved!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      const isQuota = msg.toLowerCase().includes('quota');
      notify(
        isQuota ? 'Error: Storage limit exceeded.' : `Error saving: ${msg}`,
        5000
      );
    }
  };

  /** FR-PERS-002: Load model from LocalForage, replace scene. */
  const handleLoad = async () => {
    try {
      const loaded = await loadModel();
      if (!loaded) {
        notify('No saved model found.');
      } else {
        setBricks(loaded);
        notify(`Loaded ${loaded.length} bricks.`);
      }
    } catch {
      notify('Error loading model.', 5000);
    }
  };

  /** FR-SHARE-001: Export model as versioned JSON file download. */
  const handleExport = () => exportModelJSON(bricks);

  /** FR-SHARE-001: Trigger hidden file input for JSON import. */
  const handleImport = () => fileInputRef.current?.click();

  /** FR-SHARE-001: Read selected file and import bricks. */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = importModelJSON(event.target?.result as string);
        setBricks(imported);
        notify(`Imported ${imported.length} bricks.`);
      } catch (err) {
        // CLR-05: show error, do NOT modify scene
        const msg = err instanceof Error ? err.message : 'Unknown error';
        notify(`Import error: ${msg}`, 5000);
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-imported
    e.target.value = '';
  };

  const btnClass =
    'w-full py-2 px-3 rounded text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors';

  return (
    <section aria-label="Model actions">
      <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Model</h2>
      <div className="flex flex-col gap-1">
        <button
          data-testid="btn-save"
          onClick={handleSave}
          className={btnClass}
          aria-label="Save model to browser storage"
        >
          Save
        </button>
        <button
          data-testid="btn-load"
          onClick={handleLoad}
          className={btnClass}
          aria-label="Load model from browser storage"
        >
          Load
        </button>
        <button
          data-testid="btn-export"
          onClick={handleExport}
          className={btnClass}
          aria-label="Export model as JSON file"
        >
          Export JSON
        </button>
        <button
          data-testid="btn-import"
          onClick={handleImport}
          className={btnClass}
          aria-label="Import model from JSON file"
        >
          Import JSON
        </button>
        {/* Hidden file input — triggered by Import button */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>
      <p className="text-gray-500 text-xs mt-2">{bricks.length} bricks</p>
    </section>
  );
}
