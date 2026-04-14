import { useBrickStore } from '../../store/useBrickStore';

/**
 * Notification - success/error feedback overlay.
 * FR-PERS-001: shows success notification after save.
 * FR-PERS-002: shows "No saved model found" when storage is empty.
 * FR-SHARE-001: shows import success/error.
 * NFR-A11Y-001: role="status" aria-live="polite" for screen reader announcement.
 *
 * Error detection: uses .includes('error') (case-insensitive) to robustly
 * classify any notification containing the word 'error' as an error,
 * regardless of its position in the message string.
 * Fixes: startsWith-based detection that could miss non-prefix error messages.
 */
export function Notification() {
  const notification = useBrickStore(state => state.notification);

  if (!notification) return null;

  // Robust error detection: any message containing 'error' (case-insensitive)
  // is shown in red. All other messages (success, info) are shown in green.
  const isError = notification.toLowerCase().includes('error');

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
