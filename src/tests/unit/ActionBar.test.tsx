import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionBar } from '../../components/ActionBar/ActionBar';
import { useBrickStore } from '../../store/useBrickStore';
import * as exportService from '../../services/exportService';
import { Brick } from '../../store/types';

// Mock the exportService module
vi.mock('../../services/exportService', () => ({
  exportModelJSON: vi.fn(),
  importModelJSON: vi.fn(),
}));

describe('ActionBar', () => {
  beforeEach(() => {
    // Reset store state
    useBrickStore.setState({
      bricks: [],
      activeTool: 'place',
      activeColorId: 'bright-red',
      activeBrickType: '1x1',
      notification: null,
    });
    vi.clearAllMocks();
  });

  it('T-FE-SHARE-001-04: Export JSON button triggers file download', () => {
    // Arrange: set some bricks in store
    const bricks: Brick[] = [
      { id: 'b1', x: 0, y: 0, z: 0, type: '1x1', colorId: 'bright-red', rotation: 0 },
    ];
    useBrickStore.setState({ bricks });

    render(<ActionBar />);

    const exportButton = screen.getByTestId('btn-export');
    fireEvent.click(exportButton);

    expect(exportService.exportModelJSON).toHaveBeenCalledTimes(1);
    expect(exportService.exportModelJSON).toHaveBeenCalledWith(bricks);
  });
});
