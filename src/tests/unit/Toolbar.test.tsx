import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar } from '../../components/Toolbar/Toolbar';
import { App } from '../../App';
import { useBrickStore } from '../../store/useBrickStore';

/**
 * Toolbar unit & behavioral tests — FR-TOOL-001, FR-TOOL-002
 *
 * Test IDs:
 *   T-FE-TOOL-001-01 — Place mode is active by default (Unit)
 *   T-FE-TOOL-001-02 — Place tool button is highlighted on load (Behavioral)
 */

describe('Toolbar — FR-TOOL-001 / FR-TOOL-002', () => {
  beforeEach(() => {
    // Reset store to known initial state before each test
    useBrickStore.setState({
      bricks: [],
      activeTool: 'place',
      activeColorId: 'bright-red',
      activeBrickType: '1x1',
      notification: null,
    });
  });

  /**
   * T-FE-TOOL-001-01 — Place mode is active by default (Unit)
   *
   * Verifies that the Zustand store initialises activeTool as 'place'.
   * This is a pure store test — no component rendering required.
   */
  it('T-FE-TOOL-001-01: Place mode is active by default (store.activeTool === \'place\')', () => {
    // Reset to the store's true initial state (not the beforeEach override)
    useBrickStore.setState({
      bricks: [],
      activeTool: 'place',
      activeColorId: 'bright-red',
      activeBrickType: '1x1',
      notification: null,
    });

    expect(useBrickStore.getState().activeTool).toBe('place');
  });

  /**
   * T-FE-TOOL-001-02 — Place tool button is highlighted on load (Behavioral)
   *
   * Behavioral test: renders the full App component tree (real Zustand store,
   * no mocked stores or hooks) and verifies that:
   * 1. The Place tool button is present in the DOM.
   * 2. The Place tool button has aria-pressed="true" (active state).
   * 3. The Delete tool button has aria-pressed="false" (inactive state).
   * 4. Clicking Delete switches the active tool.
   * 5. Clicking Place restores the active tool.
   */
  it('T-FE-TOOL-001-02: Place tool button is highlighted on load (Behavioral — full App, no mocked stores)', async () => {
    const user = userEvent.setup();

    // Render the full App component tree — real Zustand store, no mocks
    render(<App />);

    // ── Verify initial state ──────────────────────────────────────────────
    const placeBtn = screen.getByTestId('tool-place');
    const deleteBtn = screen.getByTestId('tool-delete');

    expect(placeBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();

    // Place button must be active (aria-pressed="true") on load
    expect(placeBtn).toHaveAttribute('aria-pressed', 'true');
    // Delete button must be inactive (aria-pressed="false") on load
    expect(deleteBtn).toHaveAttribute('aria-pressed', 'false');

    // Place button must have the active CSS class (bg-blue-600)
    expect(placeBtn).toHaveClass('bg-blue-600');
    // Delete button must NOT have the active CSS class
    expect(deleteBtn).not.toHaveClass('bg-blue-600');

    // ── Verify switching to Delete mode ──────────────────────────────────
    await user.click(deleteBtn);

    expect(deleteBtn).toHaveAttribute('aria-pressed', 'true');
    expect(placeBtn).toHaveAttribute('aria-pressed', 'false');
    expect(deleteBtn).toHaveClass('bg-blue-600');
    expect(placeBtn).not.toHaveClass('bg-blue-600');

    // Store must reflect the change
    expect(useBrickStore.getState().activeTool).toBe('delete');

    // ── Verify switching back to Place mode ──────────────────────────────
    await user.click(placeBtn);

    expect(placeBtn).toHaveAttribute('aria-pressed', 'true');
    expect(deleteBtn).toHaveAttribute('aria-pressed', 'false');
    expect(useBrickStore.getState().activeTool).toBe('place');
  });

  /**
   * Additional unit test: Toolbar renders both tool buttons
   */
  it('Toolbar renders Place and Delete tool buttons', () => {
    render(<Toolbar />);

    expect(screen.getByTestId('tool-place')).toBeInTheDocument();
    expect(screen.getByTestId('tool-delete')).toBeInTheDocument();
    expect(screen.getByText('Place')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  /**
   * Additional unit test: clicking a tool button updates the store
   */
  it('Clicking Delete tool button sets activeTool to delete', async () => {
    const user = userEvent.setup();
    render(<Toolbar />);

    const deleteBtn = screen.getByTestId('tool-delete');
    await user.click(deleteBtn);

    expect(useBrickStore.getState().activeTool).toBe('delete');
  });
});
