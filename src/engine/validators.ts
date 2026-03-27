/**
 * Input validation for battle actions and player data.
 *
 * CLAUDE.md Section 8: "Input validation happens on the server, always."
 * Since this is a client-side app, validation happens at the engine boundary.
 * UI validation is supplemental UX only, not the security boundary.
 */

import type { BattleAction, BattleState, PlayerState } from './types';
import { PLAYER_NAME_MAX_LENGTH, MOVES_PER_POKEMON, TEAM_SIZE } from './constants';

/**
 * Sanitize a player name to prevent XSS and limit length.
 *
 * @param name - Raw player name input
 * @returns Sanitized name (trimmed, limited, stripped of HTML)
 */
export function sanitizePlayerName(name: string): string {
  // Strip HTML tags
  let clean = name.replace(/<[^>]*>/g, '');
  // Remove control characters
  clean = clean.replace(/[\x00-\x1F\x7F]/g, '');
  // Trim and limit length
  clean = clean.trim().slice(0, PLAYER_NAME_MAX_LENGTH);
  // If empty after sanitization, return default
  return clean || 'Player';
}

/**
 * Validate a battle action against the current state.
 *
 * @param action - The action to validate
 * @param state - Current battle state
 * @returns null if valid, or an error message string if invalid
 */
export function validateBattleAction(
  action: BattleAction,
  state: BattleState
): string | null {
  // Check phase
  if (state.phase !== 'awaiting_action') {
    return `Cannot submit action in phase: ${state.phase}`;
  }

  // Check battle not over
  if (state.winner !== null) {
    return 'Battle is already over';
  }

  // Check player exists
  if (action.playerId !== 'player1' && action.playerId !== 'player2') {
    return `Invalid player ID: ${action.playerId}`;
  }

  // Check move index bounds
  const player = state[action.playerId];
  const activePokemon = player.team[player.activePokemonIndex];

  if (!activePokemon || activePokemon.currentHp <= 0) {
    return 'Active Pokemon is fainted';
  }

  if (action.moveIndex < 0 || action.moveIndex >= MOVES_PER_POKEMON) {
    return `Move index out of bounds: ${action.moveIndex} (valid: 0-${MOVES_PER_POKEMON - 1})`;
  }

  if (!activePokemon.moves[action.moveIndex]) {
    return `Move at index ${action.moveIndex} does not exist`;
  }

  return null; // Valid
}

/**
 * Validate that a team is correctly formed.
 *
 * @param player - Player state to validate
 * @returns null if valid, or an error message string if invalid
 */
export function validateTeam(player: PlayerState): string | null {
  if (!player.team || player.team.length !== TEAM_SIZE) {
    return `Team must have exactly ${TEAM_SIZE} Pokemon (got ${player.team?.length ?? 0})`;
  }

  for (let i = 0; i < player.team.length; i++) {
    const pokemon = player.team[i];
    if (!pokemon.species) {
      return `Pokemon at position ${i} has no species data`;
    }
    if (!pokemon.moves || pokemon.moves.length !== MOVES_PER_POKEMON) {
      return `Pokemon at position ${i} must have exactly ${MOVES_PER_POKEMON} moves`;
    }
    if (pokemon.maxHp <= 0) {
      return `Pokemon at position ${i} has invalid maxHp: ${pokemon.maxHp}`;
    }
    if (pokemon.currentHp !== pokemon.maxHp) {
      return `Pokemon at position ${i} should start at full HP`;
    }
  }

  return null; // Valid
}
