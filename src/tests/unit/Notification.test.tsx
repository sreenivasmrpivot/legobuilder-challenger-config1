import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Notification } from '../../components/ActionBar/Notification';
import { useBrickStore } from '../../store/useBrickStore';

/**
 * Tests for Notification component error/success classification.
 * Covers the fix for issue #36: robust error detection via .includes('error').
 *
 * FR-PERS-001, FR-PERS-002, FR-SHARE-001
 * NFR-A11Y-001: role="status" aria-live="polite"
 */
describe('Notification', () => {
  beforeEach(() => {
    useBrickStore.setState({ notification: null });
  });

  it('renders nothing when notification is null', () => {
    useBrickStore.setState({ notification: null });
    const { container } = render(<Notification />);
    expect(container.firstChild).toBeNull();
  });

  it('renders success message with green background', () => {
    useBrickStore.setState({ notification: 'Model saved!' });
    render(<Notification />);
    const el = screen.getByTestId('notification');
    expect(el).toBeInTheDocument();
    expect(el.textContent).toBe('Model saved!');
    expect(el.className).toContain('bg-green-600');
    expect(el.className).not.toContain('bg-red-600');
  });

  it('renders "No saved model found." as success (green)', () => {
    useBrickStore.setState({ notification: 'No saved model found.' });
    render(<Notification />);
    const el = screen.getByTestId('notification');
    expect(el.className).toContain('bg-green-600');
    expect(el.className).not.toContain('bg-red-600');
  });

  it('T-FE-PERS-001-04: renders "Error: Storage limit exceeded." with red background', () => {
    useBrickStore.setState({ notification: 'Error: Storage limit exceeded.' });
    render(<Notification />);
    const el = screen.getByTestId('notification');
    expect(el.className).toContain('bg-red-600');
    expect(el.className).not.toContain('bg-green-600');
  });

  it('renders "Error saving: ..." with red background', () => {
    useBrickStore.setState({ notification: 'Error saving: disk full' });
    render(<Notification />);
    const el = screen.getByTestId('notification');
    expect(el.className).toContain('bg-red-600');
    expect(el.className).not.toContain('bg-green-600');
  });

  it('renders "Error loading model." with red background', () => {
    useBrickStore.setState({ notification: 'Error loading model.' });
    render(<Notification />);
    const el = screen.getByTestId('notification');
    expect(el.className).toContain('bg-red-600');
    expect(el.className).not.toContain('bg-green-600');
  });

  it('T-FE-SHARE-001-03: renders "Import error: ..." with red background', () => {
    // This was the primary bug: 'Import error:' does not start with 'error'
    // but contains 'error' — must be shown in red.
    useBrickStore.setState({ notification: 'Import error: Invalid JSON' });
    render(<Notification />);
    const el = screen.getByTestId('notification');
    expect(el.className).toContain('bg-red-600');
    expect(el.className).not.toContain('bg-green-600');
  });

  it('has role="status" and aria-live="polite" for accessibility (NFR-A11Y-001)', () => {
    useBrickStore.setState({ notification: 'Model saved!' });
    render(<Notification />);
    const el = screen.getByTestId('notification');
    expect(el).toHaveAttribute('role', 'status');
    expect(el).toHaveAttribute('aria-live', 'polite');
  });
});
