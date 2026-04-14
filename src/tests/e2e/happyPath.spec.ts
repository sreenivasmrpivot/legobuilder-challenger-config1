import { test, expect } from '@playwright/test';

test.describe('Happy Path: First-Time Build', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 10000 });
  });

  test('T-E2E-HAPPY-001-01: app loads with canvas and toolbar', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('[data-testid="tool-place"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-testid="color-swatch-bright-red"]')).toBeVisible();
    await expect(page.locator('[data-testid="brick-type-1x1"]')).toBeVisible();
  });

  test('T-E2E-SCREENSHOT-001-01: placing a brick changes the canvas', async ({ page }) => {
    const baseline = await page.screenshot();
    await page.locator('canvas').click({ position: { x: 400, y: 300 } });
    await page.waitForTimeout(200);
    const afterPlacement = await page.screenshot();
    expect(Buffer.compare(baseline, afterPlacement)).not.toBe(0);
  });

  test('save button shows success notification (FR-PERS-001)', async ({ page }) => {
    await page.locator('canvas').click({ position: { x: 400, y: 300 } });
    await page.waitForTimeout(100);
    await page.click('[data-testid="btn-save"]');
    await expect(page.locator('[data-testid="notification"]')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('[data-testid="notification"]')).toContainText('saved');
  });
});
