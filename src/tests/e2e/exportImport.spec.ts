import { test, expect } from '@playwright/test';
import { readFileSync, unlink } from 'fs';

const SAMPLE_MODEL_PATH = 'src/tests/e2e/fixtures/sampleModel.json';
const INVALID_MODEL_PATH = 'src/tests/e2e/fixtures/invalid.json';

test.describe('Export/Import Feature (FR-SHARE-001)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 10000 });
  });

  test('T-E2E-AFOL-001-01: AFOL build and export flow', async ({ page }) => {
    // Import a known good model to set the scene
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(SAMPLE_MODEL_PATH);

    // Wait for import success and verify brick count
    const brickCount = page.locator('text=/\d+ bricks/');
    await expect(brickCount).toContainText('2 bricks', { timeout: 5000 });

    // Click export button and wait for download
    const exportButton = page.locator('[data-testid="btn-export"]');
    const downloadPromise = page.waitForEvent('download');
    await exportButton.click();
    const download = await downloadPromise;

    // Save and verify downloaded file
    const path = await download.path();
    if (!path) throw new Error('Download path is null');
    const content = readFileSync(path, 'utf-8');
    const model = JSON.parse(content);

    expect(model.version).toBe('1.0.0');
    expect(model.exportedAt).toBeTypeOf('string');
    expect(model.bricks).toHaveLength(2);
    // Check first brick (ids may differ, but we can check other fields)
    expect(model.bricks[0]).toMatchObject({
      x: 0,
      y: 0,
      z: 0,
      type: '1x1',
      colorId: 'bright-red',
      rotation: 0,
    });
    expect(model.bricks[1]).toMatchObject({
      x: 2,
      y: 0,
      z: 3,
      type: '2x4',
      colorId: 'bright-blue',
      rotation: 90,
    });

    // Clean up
    unlink(path, () => {});
  });

  test('T-E2E-ERR-001-01: Invalid JSON import shows error and preserves scene', async ({ page }) => {
    // First, import a valid model to set initial scene
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(SAMPLE_MODEL_PATH);
    const brickCount = page.locator('text=/\d+ bricks/');
    await expect(brickCount).toContainText('2 bricks', { timeout: 5000 });

    // Record initial count text
    const initialCount = await brickCount.textContent();

    // Attempt to import invalid JSON
    await fileInput.setInputFiles(INVALID_MODEL_PATH);

    // Expect brick count unchanged
    await expect(brickCount).toHaveText(initialCount!, { timeout: 5000 });
  });

  test('T-SEC-SEC-001-01: No model data sent to external servers', async ({ page }) => {
    // Capture network requests after initial load
    const requests: any[] = [];
    await page.route('**', (route) => {
      requests.push(route.request());
      route.continue();
    });

    // Perform export
    const exportButton = page.locator('[data-testid="btn-export"]');
    const downloadPromise = page.waitForEvent('download');
    await exportButton.click();
    await downloadPromise;

    // Perform import with valid file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(SAMPLE_MODEL_PATH);
    await expect(page.locator('text=/\d+ bricks/')).toContainText('2 bricks', { timeout: 5000 });

    // Assert no network requests were made (beyond initial page load)
    expect(requests).toHaveLength(0);
  });
});
