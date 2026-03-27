/**
 * Type-to-emoji mapping for move display.
 * Used alongside text labels (never as sole indicator per CLAUDE.md Section 3.3).
 */
import type { PokemonType } from '@/engine/types';

export const TYPE_ICONS: Record<PokemonType, string> = {
  normal: '⭐',
  fire: '🔥',
  water: '💧',
  electric: '⚡',
  grass: '🌿',
  ice: '❄️',
  fighting: '🥊',
  poison: '☠️',
  ground: '🌍',
  flying: '🌪️',
  psychic: '🔮',
  bug: '🐛',
  rock: '🪨',
  ghost: '👻',
  dragon: '🐉',
  dark: '🌑',
  steel: '⚙️',
  fairy: '✨',
};

/** Category icons for physical/special/status */
export const CATEGORY_ICONS: Record<string, string> = {
  physical: '💥',
  special: '🌀',
  status: '🔄',
};
