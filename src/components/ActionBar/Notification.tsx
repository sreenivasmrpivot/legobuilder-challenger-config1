import { useBrickStore } from '../../store/useBrickStore';

/**
 * Notification - success/error feedback overlay.
 * FR-PERS-001: shows success notification after save.
 * FR-PERS-002: shows "No saved model found" when storage is empty.
 * FR-SHARE-001: shows import success/error.
 * NFR-A11Y-001: role="status" aria-live="polite" for screen reader announcement.
 */
export function Notification() {
  const notification = useBrickStore(state => state.notification);

  if (!notification) return null;

  const isError = notification.toLowerCase().startsWith('error') ||
                  notification.toLowerCase().startsWith('import error');

  return (
    <div
      data-testid="notification"
      role="status"
      aria-live="polite"
      className={`absolute top-4 right-4 px-4 py-2 rounded shadow-lg text-sm font-medium z-10 ${
        isError ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
      }`}
    >
      {notification}
    </div>
  );
}
