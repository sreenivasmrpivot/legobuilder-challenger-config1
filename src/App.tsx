import { Toolbar } from './components/Toolbar/Toolbar';
import { BrickPalette } from './components/BrickPalette/BrickPalette';
import { BrickTypeSelector } from './components/BrickTypeSelector/BrickTypeSelector';
import { ActionBar } from './components/ActionBar/ActionBar';
import { Notification } from './components/ActionBar/Notification';
import { Scene3D } from './components/Scene3D/Scene3D';

/**
 * Root application component.
 * Layout: sidebar (UI controls) | canvas (3D scene)
 * Zustand store is global - no provider needed.
 */
export function App() {
  return (
    <div className="app-layout">
      <aside className="sidebar" role="complementary" aria-label="Builder controls">
        <div>
          <h1 className="text-white text-lg font-bold mb-4">LEGO Builder</h1>
        </div>
        <Toolbar />
        <BrickTypeSelector />
        <BrickPalette />
        <ActionBar />
      </aside>
      <main className="canvas-container" role="main" aria-label="3D building canvas">
        <Scene3D />
        <Notification />
      </main>
    </div>
  );
}
