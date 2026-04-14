import { test, expect, Page } from '@playwright/test';

// Helper to generate brick data for import
function generateBricks(count: number) {
  const bricks = [];
  for (let i = 0; i < count; i++) {
    bricks.push({
      id: `brick-${i}`,
      x: i % 10,
      y: 0,
      z: Math.floor(i / 10),
      type: '1x1',
      colorId: 'bright-red',
      rotation: 0,
    });
  }
  return { version: '1.0', bricks };
}

// Helper to measure FPS while orbiting camera
async function measureFPSDuringOrbit(page: Page, durationMs: number): Promise<number> {
  // Inject FPS measurement script
  const fps = await page.evaluate(async (duration) => {
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
  });
  return fps;
}

// Helper to simulate camera orbit by dragging the canvas
async function orbitCamera(page: Page, durationMs: number) {
  const canvas = await page.locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas not found');

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  const radius = Math.min(box.width, box.height) * 0.3;

  // Perform a circular drag to orbit
  await page.mouse.move(centerX + radius, centerY);
  await page.mouse.down();

  const startTime = Date.now();
  while (Date.now() - startTime < durationMs) {
    const angle = ((Date.now() - startTime) / durationMs) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    await page.mouse.move(x, y);
    await page.waitForTimeout(16); // ~60fps
  }

  await page.mouse.up();
}

test.describe('Instanced Rendering Performance — FR-PERF-001', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas', { timeout: 10000 });
  });

  test('T-FE-PERF-001-02: Scene renders 100 bricks at ≥ 60 FPS during camera orbit', async ({ page }) => {
    // Generate 100 bricks and import them
    const bricks100 = generateBricks(100);
    const blob = new Blob([JSON.stringify(bricks100)], { type: 'application/json' });
    const file = new File([blob], 'bricks-100.json', { type: 'application/json' });

    // Use the import button (assuming there's an import button with data-testid)
    // We'll need to set up a file chooser
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('[data-testid="btn-import"]'), // adjust selector as needed
    ]);
    await fileChooser.setFiles([file]);

    // Wait for import to complete
    await page.waitForTimeout(1000);

    // Orbit camera for 2 seconds and measure FPS
    const orbitDuration = 2000;
    const fpsPromise = measureFPSDuringOrbit(page, orbitDuration);
    await orbitCamera(page, orbitDuration);
    const avgFps = await fpsPromise;

    expect(avgFps).toBeGreaterThanOrEqual(60);
  });

  test('T-PERF-PERF-001-01: 500 bricks render at ≥ 30 FPS during camera orbit', async ({ page }) => {
    const bricks500 = generateBricks(500);
    const blob = new Blob([JSON.stringify(bricks500)], { type: 'application/json' });
    const file = new File([blob], 'bricks-500.json', { type: 'application/json' });

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('[data-testid="btn-import"]'),
    ]);
    await fileChooser.setFiles([file]);
    await page.waitForTimeout(2000); // allow time to render

    const orbitDuration = 5000;
    const fpsPromise = measureFPSDuringOrbit(page, orbitDuration);
    await orbitCamera(page, orbitDuration);
    const avgFps = await fpsPromise;

    expect(avgFps).toBeGreaterThanOrEqual(30);
  });

  test('T-PERF-SCALE-001-01: 1000-brick model loads without crash', async ({ page }) => {
    const bricks1000 = generateBricks(1000);
    const blob = new Blob([JSON.stringify(bricks1000)], { type: 'application/json' });
    const file = new File([blob], 'bricks-1000.json', { type: 'application/json' });

    // Import 1000 bricks
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('[data-testid="btn-import"]'),
    ]);
    await fileChooser.setFiles([file]);

    // Wait for import and rendering
    await page.waitForTimeout(3000);

    // Check for any console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Verify that the scene contains 1000 bricks by checking the store via evaluate
    const brickCount = await page.evaluate(() => {
      // Access the store; this assumes the store is accessible via window or a global hook
      // For now, we'll try to get it from the React component tree if there's a test hook
      // If not, we might need to add a test-only global. But we can check the scene graph instead.
      const canvas = document.querySelector('canvas');
      const r3f = (canvas as any).__r3f;
      if (!r3f) return 0;
      const scene = r3f.scene;
      let count = 0;
      scene.traverse((obj: any) => {
        if (obj instanceof THREE.InstancedMesh) {
          count += obj.count;
        }
      });
      return count;
    });

    expect(brickCount).toBe(1000);
    expect(errors).toHaveLength(0);
  });
});
