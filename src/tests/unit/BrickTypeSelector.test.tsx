import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrickTypeSelector } from '../../components/BrickTypeSelector/BrickTypeSelector';
import { useBrickStore } from '../../store/useBrickStore';
import { BRICK_TYPES } from '../../domain/brickCatalog';

/**
 * Tests for BrickTypeSelector — FR-BRICK-003
 *
 * T-FE-BRICK-003-02: Brick palette renders 4 brick types
 * T-FE-BRICK-003-04: Selected brick type preview is shown in UI
 *
 * Note: T-FE-BRICK-003-01 is covered in useBrickStore.test.ts
 *       T-FE-BRICK-003-03 is covered in gridRules.test.ts
 */
describe('BrickTypeSelector — FR-BRICK-003', () => {
  beforeEach(() => {
    useBrickStore.setState({
      bricks: [],
      activeTool: 'place',
      activeColorId: 'bright-red',
      activeBrickType: '1x1',
      notification: null,
    });
  });

  // ── T-FE-BRICK-003-02 ────────────────────────────────────────────────────
  describe('T-FE-BRICK-003-02: Brick palette renders 4 brick types', () => {
    it('renders exactly 4 brick type buttons', () => {
      render(<BrickTypeSelector />);

      // Each brick type has a data-testid of brick-type-{type}
      const buttons = BRICK_TYPES.map(type =>
        screen.getByTestId(`brick-type-${type}`)
      );
      expect(buttons).toHaveLength(4);
    });

    it('renders buttons for all 4 expected types: 1x1, 1x2, 2x2, 2x4', () => {
      render(<BrickTypeSelector />);

      expect(screen.getByTestId('brick-type-1x1')).toBeInTheDocument();
      expect(screen.getByTestId('brick-type-1x2')).toBeInTheDocument();
      expect(screen.getByTestId('brick-type-2x2')).toBeInTheDocument();
      expect(screen.getByTestId('brick-type-2x4')).toBeInTheDocument();
    });

    it('each brick type button is a <button> element', () => {
      render(<BrickTypeSelector />);

      BRICK_TYPES.forEach(type => {
        const btn = screen.getByTestId(`brick-type-${type}`);
        expect(btn.tagName).toBe('BUTTON');
      });
    });

    it('each button has an accessible aria-label', () => {
      render(<BrickTypeSelector />);

      // aria-label should contain the brick type label (e.g. "1x1 brick")
      BRICK_TYPES.forEach(type => {
        const btn = screen.getByTestId(`brick-type-${type}`);
        expect(btn).toHaveAttribute('aria-label');
        const label = btn.getAttribute('aria-label') ?? '';
        expect(label.length).toBeGreaterThan(0);
      });
    });
  });

  // ── T-FE-BRICK-003-04 ────────────────────────────────────────────────────
  describe('T-FE-BRICK-003-04: Selected brick type preview is shown in UI', () => {
    it('default active type (1x1) has aria-pressed=true', () => {
      render(<BrickTypeSelector />);

      const btn1x1 = screen.getByTestId('brick-type-1x1');
      expect(btn1x1).toHaveAttribute('aria-pressed', 'true');
    });

    it('non-active types have aria-pressed=false by default', () => {
      render(<BrickTypeSelector />);

      ['1x2', '2x2', '2x4'].forEach(type => {
        const btn = screen.getByTestId(`brick-type-${type}`);
        expect(btn).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('clicking a brick type updates aria-pressed to true on that button', () => {
      render(<BrickTypeSelector />);

      const btn2x4 = screen.getByTestId('brick-type-2x4');
      fireEvent.click(btn2x4);

      // After click, 2x4 should be active
      expect(btn2x4).toHaveAttribute('aria-pressed', 'true');
    });

    it('clicking a brick type deactivates the previously active type', () => {
      render(<BrickTypeSelector />);

      // Initially 1x1 is active
      const btn1x1 = screen.getByTestId('brick-type-1x1');
      expect(btn1x1).toHaveAttribute('aria-pressed', 'true');

      // Click 2x2
      const btn2x2 = screen.getByTestId('brick-type-2x2');
      fireEvent.click(btn2x2);

      // 1x1 should now be inactive, 2x2 active
      expect(btn1x1).toHaveAttribute('aria-pressed', 'false');
      expect(btn2x2).toHaveAttribute('aria-pressed', 'true');
    });

    it('clicking a brick type updates activeBrickType in the store', () => {
      render(<BrickTypeSelector />);

      fireEvent.click(screen.getByTestId('brick-type-1x2'));

      expect(useBrickStore.getState().activeBrickType).toBe('1x2');
    });

    it('clicking each brick type in sequence updates store correctly', () => {
      render(<BrickTypeSelector />);

      const types = ['1x2', '2x2', '2x4', '1x1'] as const;
      types.forEach(type => {
        fireEvent.click(screen.getByTestId(`brick-type-${type}`));
        expect(useBrickStore.getState().activeBrickType).toBe(type);
        expect(screen.getByTestId(`brick-type-${type}`)).toHaveAttribute(
          'aria-pressed',
          'true'
        );
      });
    });

    it('only one brick type button has aria-pressed=true at a time', () => {
      render(<BrickTypeSelector />);

      fireEvent.click(screen.getByTestId('brick-type-2x4'));

      const pressedButtons = BRICK_TYPES.filter(type =>
        screen.getByTestId(`brick-type-${type}`).getAttribute('aria-pressed') === 'true'
      );
      expect(pressedButtons).toHaveLength(1);
      expect(pressedButtons[0]).toBe('2x4');
    });
  });
});
