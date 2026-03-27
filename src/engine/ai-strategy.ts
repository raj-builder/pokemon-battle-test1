/**
 * AI / CPU move selection strategy.
 *
 * Encapsulates how the computer selects moves during battle.
 * Currently implements a simple "best move by expected damage"
 * strategy. Extensible for future difficulty levels.
 *
 * Used for:
 * - vs_cpu mode (CPU opponent)
 * - ai_simulation mode (both sides auto-play)
 */

import type { BattlePokemon, BattleAction, Move } from './types';
import { getCombinedEffectiveness } from './type-effectiveness';
import { STAB_MULTIPLIER } from './constants';
import type { SeededRandom } from './seeded-random';

/**
 * AI difficulty levels for future expansion.
 * Currently only 'standard' is implemented.
 */
export type AiDifficulty = 'random' | 'standard' | 'smart';

/**
 * Estimate the effective power of a move against a target.
 *
 * Takes into account:
 * - Base move power
 * - STAB bonus
 * - Type effectiveness
 *
 * Does NOT account for critical hits or random variance
 * (those are resolved at damage calculation time).
 *
 * @param move - The move to evaluate
 * @param attacker - The attacking Pokemon
 * @param defender - The defending Pokemon
 * @returns Estimated effective power (higher = better)
 */
function estimateMovePower(
  move: Move,
  attacker: BattlePokemon,
  defender: BattlePokemon
): number {
  if (move.power === 0) return 0;

  let power = move.power;

  // STAB
  if (attacker.species.types.includes(move.type)) {
    power *= STAB_MULTIPLIER;
  }

  // Type effectiveness
  power *= getCombinedEffectiveness(move.type, defender.species.types);

  return power;
}

/**
 * Select the best move for the AI to use.
 *
 * Strategy varies by difficulty:
 * - random: pick any move at random
 * - standard: pick the move with highest estimated power
 * - smart: (future) consider HP, stat matchups, etc.
 *
 * @param attacker - The AI's active Pokemon
 * @param defender - The opponent's active Pokemon
 * @param playerId - The AI's player ID
 * @param rng - Seeded PRNG
 * @param difficulty - AI difficulty level (default: 'standard')
 * @returns A BattleAction for the selected move
 */
export function selectAiMove(
  attacker: BattlePokemon,
  defender: BattlePokemon,
  playerId: 'player1' | 'player2',
  rng: SeededRandom,
  difficulty: AiDifficulty = 'standard'
): BattleAction {
  let moveIndex: number;

  switch (difficulty) {
    case 'random': {
      moveIndex = rng.nextInt(0, attacker.moves.length - 1);
      break;
    }

    case 'standard': {
      // Pick the move with highest estimated power
      let bestPower = -1;
      let bestIndex = 0;

      for (let i = 0; i < attacker.moves.length; i++) {
        const power = estimateMovePower(attacker.moves[i], attacker, defender);
        if (power > bestPower) {
          bestPower = power;
          bestIndex = i;
        }
      }

      moveIndex = bestIndex;
      break;
    }

    case 'smart': {
      // Future: more sophisticated strategy
      // For now, same as standard
      let bestPower = -1;
      let bestIndex = 0;

      for (let i = 0; i < attacker.moves.length; i++) {
        const power = estimateMovePower(attacker.moves[i], attacker, defender);
        if (power > bestPower) {
          bestPower = power;
          bestIndex = i;
        }
      }

      moveIndex = bestIndex;
      break;
    }
  }

  return {
    playerId,
    type: 'use_move',
    moveIndex,
  };
}
