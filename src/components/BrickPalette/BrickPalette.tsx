import { useBrickStore } from '../../store/useBrickStore';
import { LEGO_COLORS } from '../../domain/colorPalette';

/**
 * BrickPalette - color selection.
 * FR-BRICK-002: >=10 LEGO colors with official names as tooltips.
 * NFR-A11Y-001: aria-label, aria-pressed, keyboard accessible.
 */
export function BrickPalette() {
  const activeColorId = useBrickStore(state => state.activeColorId);
  const setActiveColor = useBrickStore(state => state.setActiveColor);

  return (
    <section aria-label="Color palette">
      <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Color</h2>
      <div className="grid grid-cols-4 gap-1" role="listbox" aria-label="LEGO colors">
        {LEGO_COLORS.map(color => (
          <button
            key={color.id}
            data-testid={`color-swatch-${color.id}`}
            onClick={() => setActiveColor(color.id)}
            title={color.name}
            aria-label={color.name}
            aria-pressed={activeColorId === color.id}
            className={`w-full aspect-square rounded cursor-pointer border-2 transition-all ${
              activeColorId === color.id
                ? 'border-white scale-110'
                : 'border-transparent hover:border-gray-400'
            }`}
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>
      <p className="text-gray-400 text-xs mt-1">
        {LEGO_COLORS.find(c => c.id === activeColorId)?.name ?? 'Select a color'}
      </p>
    </section>
  );
}
