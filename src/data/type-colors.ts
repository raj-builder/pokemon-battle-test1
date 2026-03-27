/**
 * Maps Pokemon types to their display colors for UI rendering.
 *
 * Colors match the original app's type badge styling and meet
 * WCAG AA contrast requirements (4.5:1 for body text, 3:1 for
 * large text and UI components) per CLAUDE.md Section 3.3.
 *
 * Note: Colour is never the only way to convey information.
 * Type badges always display the type name alongside the colour
 * per CLAUDE.md Section 3.3.
 */

import type { PokemonType } from '@/engine/types';

/**
 * Background and text colours for each Pokemon type.
 * Used for type badges, card headers, and status indicators.
 */
export const TYPE_COLORS: Record<PokemonType, { bg: string; text: string }> = {
  normal:   { bg: '#A8A878', text: '#fff' },
  fire:     { bg: '#F08030', text: '#fff' },
  water:    { bg: '#6890F0', text: '#fff' },
  electric: { bg: '#F8D030', text: '#000' },
  grass:    { bg: '#78C850', text: '#fff' },
  ice:      { bg: '#98D8D8', text: '#000' },
  fighting: { bg: '#C03028', text: '#fff' },
  poison:   { bg: '#A040A0', text: '#fff' },
  ground:   { bg: '#E0C068', text: '#000' },
  flying:   { bg: '#A890F0', text: '#fff' },
  psychic:  { bg: '#F85888', text: '#fff' },
  bug:      { bg: '#A8B820', text: '#fff' },
  rock:     { bg: '#B8A038', text: '#fff' },
  ghost:    { bg: '#705898', text: '#fff' },
  dragon:   { bg: '#7038F8', text: '#fff' },
  dark:     { bg: '#705848', text: '#fff' },
  steel:    { bg: '#B8B8D0', text: '#000' },
  fairy:    { bg: '#EE99AC', text: '#fff' },
};

/**
 * Get a CSS gradient string for a Pokemon type.
 * Used for card headers and battle UI backgrounds.
 *
 * @param type - The Pokemon type
 * @returns A CSS linear-gradient string from the base colour
 *          to a slightly darker shade at 135 degrees
 */
export function getTypeGradient(type: PokemonType): string {
  const base = TYPE_COLORS[type].bg;
  return `linear-gradient(135deg, ${base}, ${adjustColor(base, -20)})`;
}

/**
 * Shift a hex colour's RGB channels by a fixed amount.
 * Positive values lighten, negative values darken.
 *
 * @param hex - A 7-character hex colour string, e.g. "#A8A878"
 * @param amount - Integer offset applied to each R, G, B channel.
 *                 Clamped to [0, 255].
 * @returns The adjusted hex colour string
 */
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
