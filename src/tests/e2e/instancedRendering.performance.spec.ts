/**
 * Instanced Rendering Performance E2E Tests — FR-PERF-001
 *
 * Test IDs:
 *   T-FE-PERF-001-02  — Scene renders 100 bricks at ≥ 60 FPS during camera orbit
 *   T-PERF-PERF-001-01 — 500 bricks render at ≥ 30 FPS (Playwright + rAF timing)
 *   T-PERF-SCALE-001-01 — 1,000-brick model loads without crash
 *
 * Spectra-FRs: FR-PERF-001
 * Spectra-Tests: T-FE-PERF-001-02, T-PERF-PERF-001-01, T-PERF-SCALE-001-01
 */
import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Generate a brick model JSON payload with `count` bricks. */
function generateBrickModel(count: number) {
  const bricks = Array.from({ length: count }, (_, i) => ({
    id: `brick-${i}`,
    x: i % 10,
    y: 0,
    z: Math.floor(i / 10),
    type: '1x1' as const,
    colorId: 'bright-red',
    rotation: 0,
  }));
  return { version: '1.0', bricks };
}

/**
 * Measure average FPS over `durationMs` using requestAnimationFrame.
 * Runs entirely in the browser context via page.evaluate.
 */
async function measureFPS(page: Page, durationMs: number): Promise<number> {
  return page.evaluate(async (duration: number) => {
    let frames = 0;
    const start = performance.now();
    return new Promise<number>((resolve) => {
      function tick() {
        frames++;
        if (performance.now() - start < duration) {
          requestAnimationFrame(tick);
        } else {
          resolve(frames / (duration / 1000));
        }
      }
      requestAnimationFrame(tick);
    });
  }, durationMs);
}

/**
 * Simulate camera orbit by performing a circular mouse drag on the canvas.
 * Runs for `durationMs` milliseconds.
 */
async function orbitCamera(page: Page, durationMs: number): Promise<void> {
  const canvas = page.locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas bounding box not found');

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const radius = Math.min(box.width, box.height) * 0.3;

  await page.mouse.move(cx + radius, cy);
  await page.mouse.down();

  const startTime = Date.now();
  while (Date.now() - startTime < durationMs) {
    const elapsed = Date.now() - startTime;
    const angle = (elapsed / durationMs) * Math.PI * 2;
    await page.mouse.move(
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius
    );
    await page.waitForTimeout(16); // ~60 fps tick
  }

  await page.mouse.up();
}

/**
 * Import a brick model JSON file via the import button.
 * Waits for the file chooser dialog and sets the file.
 */
async function importBrickModel(
  page: Page,
  model: ReturnType<typeof generateBrickModel>,
  filename: string
): Promise<void> {
  const json = JSON.stringify(model);

  // Trigger file chooser and set the file in one atomic operation
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('[data-testid="btn-import"]'),
  ]);

  await fileChooser.setFiles([
    {
      name: filename,
      mimeType: 'application/json',
      buffer: Buffer.from(json),
    },
  ]);
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe('Instanced Rendering Performance — FR-PERF-001', () => {
  // Collect console errors during each test
  const consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;

    // Track WebGL / JS errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 10_000 });
    // Allow R3F to fully initialise
    await page.waitForTimeout(500);
  });

  // -------------------------------------------------------------------------
  // T-FE-PERF-001-02 — 100 bricks at ≥ 60 FPS
  // -------------------------------------------------------------------------
  test(
    'T-FE-PERF-001-02: Scene renders 100 bricks at ≥ 60 FPS during camera orbit',
    async ({ page }) => {
      await importBrickModel(page, generateBrickModel(100), 'bricks-100.json');
      await page.waitForTimeout(1000); // allow render to settle

      // Measure FPS and orbit simultaneously
      const orbitDuration = 2000;
      const [avgFps] = await Promise.all([
        measureFPS(page, orbitDuration),
        orbitCamera(page, orbitDuration),
      ]);

      expect(avgFps).toBeGreaterThanOrEqual(60);
      expect(consoleErrors).toHaveLength(0);
    }
  );

  // -------------------------------------------------------------------------
  // T-PERF-PERF-001-01 — 500 bricks at ≥ 30 FPS
  // -------------------------------------------------------------------------
  test(
    'T-PERF-PERF-001-01: 500 bricks render at ≥ 30 FPS during camera orbit',
    async ({ page }) => {
      await importBrickModel(page, generateBrickModel(500), 'bricks-500.json');
      await page.waitForTimeout(2000); // allow render to settle

      const orbitDuration = 5000;
      const [avgFps] = await Promise.all([
        measureFPS(page, orbitDuration),
        orbitCamera(page, orbitDuration),
      ]);

      expect(avgFps).toBeGreaterThanOrEqual(30);
      expect(consoleErrors).toHaveLength(0);
    }
  );

  // -------------------------------------------------------------------------
  // T-PERF-SCALE-001-01 — 1,000 bricks load without crash
  // -------------------------------------------------------------------------
  test(
    'T-PERF-SCALE-001-01: 1,000-brick model loads without crash',
    async ({ page }) => {
      await importBrickModel(page, generateBrickModel(1000), 'bricks-1000.json');

      // Allow time for full render
      await page.waitForTimeout(3000);

      // Verify scene contains 1000 instanced bricks
      const totalBrickCount = await page.evaluate(() => {
        const canvas = document.querySelector('canvas');
        const r3f = (canvas as any)?.__r3f;
        if (!r3f?.scene) return -1;

        let count = 0;
        r3f.scene.traverse((obj: any) => {
          // THREE.InstancedMesh check via duck-typing (THREE may not be in scope)
          if (obj.isInstancedMesh) count += obj.count;
        });
        return count;
      });

      expect(totalBrickCount).toBe(1000);

      // Zero WebGL / JS errors
      expect(consoleErrors).toHaveLength(0);
    }
  );
});
