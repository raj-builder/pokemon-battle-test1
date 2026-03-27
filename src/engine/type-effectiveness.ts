/**
 * Pokemon type effectiveness chart.
 *
 * Full 18×18 matchup matrix returning damage multipliers:
 * - 0    = immune (e.g., Normal vs Ghost)
 * - 0.5  = not very effective (resisted)
 * - 1    = neutral
 * - 2    = super effective
 *
 * Source: Bulbapedia type chart (Gen VI onwards).
 * Dual-type effectiveness is the product of individual matchups.
 */
import type { PokemonType } from './types';

/**
 * Type effectiveness lookup table.
 * Key: attacking type → defending type → multiplier.
 * Only entries that differ from 1.0 (neutral) are stored.
 * Missing entries default to 1.0.
 */
const EFFECTIVENESS: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2,
    rock: 0.5, dragon: 0.5, steel: 2,
  },
  water: {
    fire: 2, water: 0.5, grass: 0.5, ground: 2,
    rock: 2, dragon: 0.5,
  },
  electric: {
    water: 2, electric: 0.5, grass: 0.5, ground: 0,
    flying: 2, dragon: 0.5,
  },
  grass: {
    fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2,
    flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5,
  },
  ice: {
    fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2,
    flying: 2, dragon: 2, steel: 0.5,
  },
  fighting: {
    normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5,
    bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5,
  },
  poison: {
    grass: 2, poison: 0.5, ground: 0.5, rock: 0.5,
    ghost: 0.5, steel: 0, fairy: 2,
  },
  ground: {
    fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0,
    bug: 0.5, rock: 2, steel: 2,
  },
  flying: {
    electric: 0.5, grass: 2, fighting: 2, bug: 2,
    rock: 0.5, steel: 0.5,
  },
  psychic: {
    fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5,
  },
  bug: {
    fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5,
    psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5,
  },
  rock: {
    fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2,
    bug: 2, steel: 0.5,
  },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: {
    fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5,
  },
  steel: {
    fire: 0.5, water: 0.5, electric: 0.5, ice: 2,
    rock: 2, steel: 0.5, fairy: 2,
  },
  fairy: {
    fire: 0.5, poison: 0.5, fighting: 2, dragon: 2,
    dark: 2, steel: 0.5,
  },
};

/**
 * Get the type effectiveness multiplier for a single
 * attacking type vs a single defending type.
 *
 * @param attackType - The attacking move's type
 * @param defendType - One of the defender's types
 * @returns Multiplier: 0, 0.5, 1, or 2
 */
export function getTypeEffectiveness(
  attackType: PokemonType,
  defendType: PokemonType
): number {
  return EFFECTIVENESS[attackType]?.[defendType] ?? 1;
}

/**
 * Get the combined type effectiveness multiplier for
 * an attacking type vs a defender with 1-2 types.
 *
 * For dual-type defenders, the result is the product of
 * the individual matchups (can be 0, 0.25, 0.5, 1, 2, or 4).
 *
 * @param attackType - The attacking move's type
 * @param defenderTypes - Array of 1-2 defender types
 * @returns Combined multiplier
 */
export function getCombinedEffectiveness(
  attackType: PokemonType,
  defenderTypes: readonly PokemonType[]
): number {
  let multiplier = 1;
  for (const defType of defenderTypes) {
    multiplier *= getTypeEffectiveness(attackType, defType);
  }
  return multiplier;
}

/**
 * Get a human-readable effectiveness label for UI display.
 *
 * @param multiplier - The effectiveness multiplier
 * @returns i18n key suffix for the effectiveness label
 */
export function getEffectivenessLabelKey(multiplier: number): string | null {
  if (multiplier === 0) return 'battle.noEffect';
  if (multiplier < 1) return 'battle.notVeryEffective';
  if (multiplier > 1) return 'battle.superEffective';
  return null; // neutral, no special label
}
