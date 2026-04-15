import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../../App';
import { useBrickStore } from '../../store/useBrickStore';
import * as persistenceService from '../../services/persistenceService';

// Mock the persistenceService to control saveModel
vi.mock('../../services/persistenceService', () => ({
  saveModel: vi.fn(() => Promise.resolve()),
  loadModel: vi.fn(() => Promise.resolve(null)),
}));

describe('Save Model — FR-PERS-001', () => {
  beforeEach(() => {
    // Reset store
    useBrickStore.setState({
      bricks: [],
      activeTool: 'place',
      activeColorId: 'bright-red',
      activeBrickType: '1x1',
      notification: null,
    });
    vi.clearAllMocks();
  });

  it('T-FE-PERS-001-03: Clicking Save shows success notification', async () => {
    // Add a brick to store so save has something
    useBrickStore.setState({
      bricks: [
        { id: '1', x: 0, y: 0, z: 0, type: '1x1', colorId: 'bright-red', rotation: 0 },
      ],
    });

    render(<App />);

    const saveButton = screen.getByTestId('btn-save');
    fireEvent.click(saveButton);

    // Wait for the notification to appear
    await waitFor(() => {
      expect(screen.getByText('Model saved!')).toBeInTheDocument();
    });

    // Ensure saveModel was called
    expect(persistenceService.saveModel).toHaveBeenCalledTimes(1);
  });
});
