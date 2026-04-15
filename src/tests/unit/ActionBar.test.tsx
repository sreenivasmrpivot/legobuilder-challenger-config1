import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActionBar } from '../../components/ActionBar/ActionBar';
import { useBrickStore } from '../../store/useBrickStore';
import * as exportService from '../../services/exportService';
import { Brick } from '../../store/types';

// Mock the exportService module
vi.mock('../../services/exportService', () => ({
  exportModelJSON: vi.fn(),
  importModelJSON: vi.fn(),
}));

describe('ActionBar — FR-SHARE-001', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBrickStore.setState({
      bricks: [],
      activeTool: 'place',
      activeColorId: 'bright-red',
      activeBrickType: '1x1',
      notification: null,
    });
    vi.clearAllMocks();
  });

  it('T-FE-SHARE-001-04: Export JSON button triggers exportModelJSON with current bricks', () => {
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

  it('T-FE-SHARE-001-03 (behavioral): Import success populates store with imported bricks', async () => {
    // Arrange: importModelJSON returns 2 bricks on success
    const importedBricks: Brick[] = [
      { id: 'i1', x: 1, y: 0, z: 1, type: '2x4', colorId: 'bright-blue', rotation: 90 },
      { id: 'i2', x: 3, y: 0, z: 3, type: '1x1', colorId: 'bright-red', rotation: 0 },
    ];
    vi.mocked(exportService.importModelJSON).mockReturnValue(importedBricks);

    render(<ActionBar />);

    // Simulate file selection via the hidden input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    // Create a mock File with valid JSON content
    const jsonContent = JSON.stringify({
      version: '1.0.0',
      exportedAt: '2024-01-01T00:00:00.000Z',
      bricks: importedBricks,
    });
    const file = new File([jsonContent], 'model.json', { type: 'application/json' });

    // Mock FileReader to synchronously call onload
    const mockFileReader = {
      readAsText: vi.fn(function (this: { onload: ((e: ProgressEvent<FileReader>) => void) | null }) {
        if (this.onload) {
          this.onload({ target: { result: jsonContent } } as unknown as ProgressEvent<FileReader>);
        }
      }),
      onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
    };
    vi.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(exportService.importModelJSON).toHaveBeenCalledWith(jsonContent);
      expect(useBrickStore.getState().bricks).toEqual(importedBricks);
    });
  });

  it('T-FE-SHARE-001-03 (behavioral): Import error shows notification and preserves scene', async () => {
    // Arrange: set initial bricks in store
    const initialBricks: Brick[] = [
      { id: 'b1', x: 0, y: 0, z: 0, type: '1x1', colorId: 'bright-red', rotation: 0 },
    ];
    useBrickStore.setState({ bricks: initialBricks });

    // importModelJSON throws on invalid JSON
    vi.mocked(exportService.importModelJSON).mockImplementation(() => {
      throw new Error('Invalid JSON: file could not be parsed');
    });

    render(<ActionBar />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidContent = 'not valid json{';
    const file = new File([invalidContent], 'bad.json', { type: 'application/json' });

    // Mock FileReader to synchronously call onload with invalid content
    const mockFileReader = {
      readAsText: vi.fn(function (this: { onload: ((e: ProgressEvent<FileReader>) => void) | null }) {
        if (this.onload) {
          this.onload({ target: { result: invalidContent } } as unknown as ProgressEvent<FileReader>);
        }
      }),
      onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
    };
    vi.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      // Scene must be unchanged
      expect(useBrickStore.getState().bricks).toEqual(initialBricks);
      // Notification must show error
      expect(useBrickStore.getState().notification).toContain('Import error');
    });
  });

  it('renders Import JSON button with correct data-testid', () => {
    render(<ActionBar />);
    expect(screen.getByTestId('btn-import')).toBeInTheDocument();
  });

  it('renders Export JSON button with correct data-testid', () => {
    render(<ActionBar />);
    expect(screen.getByTestId('btn-export')).toBeInTheDocument();
  });
});
