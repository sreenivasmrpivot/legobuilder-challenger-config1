import { BrickColor } from '../store/types';

/**
 * LEGO color palette - domain layer.
 * FR-BRICK-002: at least 10 standard LEGO colors with official names.
 */
export const LEGO_COLORS: BrickColor[] = [
  { id: 'bright-red',        name: 'Bright Red',        hex: '#C91A09' },
  { id: 'bright-blue',       name: 'Bright Blue',       hex: '#006CB7' },
  { id: 'bright-yellow',     name: 'Bright Yellow',     hex: '#FFD700' },
  { id: 'bright-green',      name: 'Bright Green',      hex: '#4B9F4A' },
  { id: 'white',             name: 'White',             hex: '#FFFFFF' },
  { id: 'black',             name: 'Black',             hex: '#1B2A34' },
  { id: 'reddish-brown',     name: 'Reddish Brown',     hex: '#82422A' },
  { id: 'dark-bluish-gray',  name: 'Dark Bluish Gray',  hex: '#6C6E68' },
  { id: 'light-bluish-gray', name: 'Light Bluish Gray', hex: '#AFB5C7' },
  { id: 'bright-orange',     name: 'Bright Orange',     hex: '#FE8A18' },
  { id: 'medium-blue',       name: 'Medium Blue',       hex: '#5A93DB' },
  { id: 'sand-green',        name: 'Sand Green',        hex: '#A0BCAC' },
];

export const DEFAULT_COLOR_ID = 'bright-red';

export function getColorById(id: string): BrickColor {
  return LEGO_COLORS.find(c => c.id === id) ?? LEGO_COLORS[0];
}
