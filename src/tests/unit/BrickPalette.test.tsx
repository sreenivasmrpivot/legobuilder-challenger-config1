import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrickPalette } from '../../components/BrickPalette/BrickPalette';
import { useBrickStore } from '../../store/useBrickStore';
import { LEGO_COLORS } from '../../domain/colorPalette';

/**
 * BrickPalette unit & behavioral tests — FR-BRICK-002
 *
 * Test IDs:
 *   T-FE-BRICK-002-01 — Selecting a color updates activeColorId in store (Unit)
 *   T-FE-BRICK-002-02 — Color palette renders at least 10 swatches (Unit)
 *   T-FE-BRICK-002-03 — Color tooltip shows LEGO color name (Unit)
 *   T-FE-BRICK-002-04 — Selected color applied to next placed brick (Behavioral)
 */

describe('BrickPalette — FR-BRICK-002', () => {
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
   * T-FE-BRICK-002-01 — Selecting a color updates activeColorId in store (Unit)
   *
   * Given the color palette is visible,
   * When the user clicks a color swatch,
   * Then that color becomes the active color (activeColorId in store).
   */
  it('T-FE-BRICK-002-01: clicking a color swatch updates activeColorId in store', async () => {
    const user = userEvent.setup();
    render(<BrickPalette />);

    // Initial state: bright-red is active
    expect(useBrickStore.getState().activeColorId).toBe('bright-red');

    // Click the bright-blue swatch
    const blueSwatch = screen.getByTestId('color-swatch-bright-blue');
    await user.click(blueSwatch);

    // Store must reflect the new active color
    expect(useBrickStore.getState().activeColorId).toBe('bright-blue');
  });

  /**
   * T-FE-BRICK-002-02 — Color palette renders at least 10 swatches (Unit)
   *
   * Given the palette is rendered,
   * Then at least 10 color swatches are visible.
   */
  it('T-FE-BRICK-002-02: palette renders at least 10 color swatches', () => {
    render(<BrickPalette />);

    // Each swatch has data-testid="color-swatch-{id}"
    const swatches = LEGO_COLORS.map(c =>
      screen.queryByTestId(`color-swatch-${c.id}`)
    ).filter(Boolean);

    expect(swatches.length).toBeGreaterThanOrEqual(10);
  });

  /**
   * T-FE-BRICK-002-03 — Color tooltip shows LEGO color name (Unit)
   *
   * Given the palette is rendered,
   * When the user hovers over a swatch,
   * Then the LEGO color name is shown as a tooltip.
   *
   * Implementation uses the HTML `title` attribute for tooltip.
   * Each swatch also has `aria-label` for accessibility (NFR-A11Y-001).
   */
  it('T-FE-BRICK-002-03: each swatch has a title tooltip with the LEGO color name', () => {
    render(<BrickPalette />);

    LEGO_COLORS.forEach(color => {
      const swatch = screen.getByTestId(`color-swatch-${color.id}`);

      // title attribute provides the browser tooltip on hover
      expect(swatch).toHaveAttribute('title', color.name);

      // aria-label provides accessibility label (NFR-A11Y-001)
      expect(swatch).toHaveAttribute('aria-label', color.name);
    });
  });

  /**
   * T-FE-BRICK-002-04 — Selected color applied to next placed brick (Behavioral)
   *
   * Given the user selects a color from the palette,
   * When the user places a brick,
   * Then the placed brick uses the selected color (colorId matches).
   *
   * This is a behavioral test: exercises the full store interaction
   * (setActiveColor → placeBrick → brick.colorId) without mocking the store.
   */
  it('T-FE-BRICK-002-04: selected color is applied to the next placed brick', async () => {
    const user = userEvent.setup();
    render(<BrickPalette />);

    // Select bright-yellow
    const yellowSwatch = screen.getByTestId('color-swatch-bright-yellow');
    await user.click(yellowSwatch);
    expect(useBrickStore.getState().activeColorId).toBe('bright-yellow');

    // Place a brick — the brick should inherit the active color
    useBrickStore.getState().placeBrick(1, 0, 1);

    const { bricks } = useBrickStore.getState();
    expect(bricks).toHaveLength(1);
    expect(bricks[0].colorId).toBe('bright-yellow');
  });

  // ── Additional coverage ────────────────────────────────────────────────────

  /**
   * Default color is bright-red on app load (US-1)
   */
  it('default active color is bright-red on load', () => {
    render(<BrickPalette />);

    // The bright-red swatch must have aria-pressed="true" (active state)
    const redSwatch = screen.getByTestId('color-swatch-bright-red');
    expect(redSwatch).toHaveAttribute('aria-pressed', 'true');

    // All other swatches must have aria-pressed="false"
    LEGO_COLORS.filter(c => c.id !== 'bright-red').forEach(color => {
      const swatch = screen.getByTestId(`color-swatch-${color.id}`);
      expect(swatch).toHaveAttribute('aria-pressed', 'false');
    });
  });

  /**
   * Active swatch highlight updates when color changes
   */
  it('active swatch aria-pressed updates when a new color is selected', async () => {
    const user = userEvent.setup();
    render(<BrickPalette />);

    const greenSwatch = screen.getByTestId('color-swatch-bright-green');
    await user.click(greenSwatch);

    // Green is now active
    expect(greenSwatch).toHaveAttribute('aria-pressed', 'true');

    // Red is no longer active
    const redSwatch = screen.getByTestId('color-swatch-bright-red');
    expect(redSwatch).toHaveAttribute('aria-pressed', 'false');
  });

  /**
   * All swatches are keyboard accessible (NFR-A11Y-001)
   * Each swatch is a <button> element.
   */
  it('all swatches are rendered as button elements for keyboard accessibility', () => {
    render(<BrickPalette />);

    LEGO_COLORS.forEach(color => {
      const swatch = screen.getByTestId(`color-swatch-${color.id}`);
      expect(swatch.tagName).toBe('BUTTON');
    });
  });

  /**
   * Palette section has accessible label (NFR-A11Y-001)
   */
  it('palette section has accessible aria-label', () => {
    render(<BrickPalette />);

    const section = screen.getByRole('listbox', { name: /LEGO colors/i });
    expect(section).toBeInTheDocument();
  });
});
