/**
 * Deterministic damage calculator for the battle engine.
 *
 * Implements a simplified Gen V damage formula with:
 * - Physical vs Special split (uses ATK/DEF or SP.ATK/SP.DEF)
 * - STAB (Same Type Attack Bonus)
 * - Type effectiveness (single and dual types)
 * - Critical hits (1/16 chance, 1.5x multiplier)
 * - Random damage variance [0.85, 1.00]
 * - Minimum damage of 1
 *
 * All randomness flows through SeededRandom — no Math.random().
 *
 * Formula:
 *   baseDamage = floor(((2 * LEVEL / 5 + 2) * movePower * atk / def) / 50 + 2)
 *   finalDamage = floor(baseDamage * STAB * typeEff * crit * variance)
 *   damage = max(MINIMUM_DAMAGE, finalDamage)
 *
 * Backlog: BE-004 (centralized battle resolution)
 */

import type { BattlePokemon, Move } from './types';
import {
  EFFECTIVE_LEVEL,
  MINIMUM_DAMAGE,
  STAB_MULTIPLIER,
  CRITICAL_HIT_CHANCE,
  CRITICAL_HIT_MULTIPLIER,
  DAMAGE_VARIANCE_MIN,
  DAMAGE_VARIANCE_MAX,
} from './constants';
import { getCombinedEffectiveness } from './type-effectiveness';
import type { SeededRandom } from './seeded-random';

/**
 * Result of a damage calculation.
 * Includes the final damage and all contributing factors
 * for display and logging.
 */
export interface DamageResult {
  /** Final damage value (always >= MINIMUM_DAMAGE for non-immune) */
  readonly damage: number;
  /** Whether a critical hit occurred */
  readonly isCritical: boolean;
  /**
   * Type effectiveness multiplier.
   * 0 = immune, <1 = resisted, 1 = neutral, >1 = super effective
   */
  readonly effectiveness: number;
  /** Whether STAB was applied */
  readonly hasStab: boolean;
}

/**
 * Calculate damage for one attack.
 *
 * @param attacker - The attacking Pokemon
 * @param defender - The defending Pokemon
 * @param move - The move being used
 * @param rng - Seeded PRNG for deterministic results
 * @returns DamageResult with all calculation details
 */
export function calculateDamage(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  move: Move,
  rng: SeededRandom
): DamageResult {
  // Status moves deal no damage
  if (move.category === 'status' || move.power === 0) {
    return {
      damage: 0,
      isCritical: false,
      effectiveness: 1,
      hasStab: false,
    };
  }

  // Type effectiveness
  const effectiveness = getCombinedEffectiveness(
    move.type,
    defender.species.types
  );

  // Immune — no damage
  if (effectiveness === 0) {
    return {
      damage: 0,
      isCritical: false,
      effectiveness: 0,
      hasStab: false,
    };
  }

  // Select relevant stats based on move category
  const atk =
    move.category === 'physical'
      ? attacker.species.baseStats.attack
      : attacker.species.baseStats.specialAttack;
  const def =
    move.category === 'physical'
      ? defender.species.baseStats.defense
      : defender.species.baseStats.specialDefense;

  // Base damage formula (simplified Gen V)
  // damage = floor(((2 * level / 5 + 2) * power * atk / def) / 50 + 2)
  const levelFactor = Math.floor((2 * EFFECTIVE_LEVEL) / 5) + 2;
  let baseDamage = Math.floor(
    (levelFactor * move.power * atk) / (def * 50) + 2
  );

  // STAB — same type attack bonus
  const hasStab = attacker.species.types.includes(move.type);
  if (hasStab) {
    baseDamage = Math.floor(baseDamage * STAB_MULTIPLIER);
  }

  // Type effectiveness
  baseDamage = Math.floor(baseDamage * effectiveness);

  // Critical hit check
  const isCritical = rng.chance(CRITICAL_HIT_CHANCE);
  if (isCritical) {
    baseDamage = Math.floor(baseDamage * CRITICAL_HIT_MULTIPLIER);
  }

  // Random variance [0.85, 1.00]
  const variance = rng.nextFloat(DAMAGE_VARIANCE_MIN, DAMAGE_VARIANCE_MAX);
  let finalDamage = Math.floor(baseDamage * variance);

  // Enforce minimum damage
  finalDamage = Math.max(MINIMUM_DAMAGE, finalDamage);

  return {
    damage: finalDamage,
    isCritical,
    effectiveness,
    hasStab,
  };
}
