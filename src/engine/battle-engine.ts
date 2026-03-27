/**
 * Centralized battle resolution engine (BE-001, BE-004).
 *
 * This is a pure-function engine: no side effects, no DOM access,
 * no framework imports. All randomness flows through SeededRandom.
 *
 * The engine handles:
 * - Turn order (speed-based, ties broken by seeded RNG)
 * - Damage resolution via damage-calculator
 * - Pokemon fainting and switching
 * - Battle end detection
 * - Event logging for battle log and replay
 *
 * All battle outcomes (manual turns, auto-simulation, replays)
 * are computed by this single engine — no duplicated logic paths.
 */

import type {
  BattleState,
  BattleAction,
  BattleEvent,
  BattlePokemon,
  PlayerState,
  RoundResult,
  TurnResult,
  MatchConfig,
  GameMode,
  DrawMode,
  BattlePhase,
} from './types';
import { calculateDamage } from './damage-calculator';
import type { SeededRandom } from './seeded-random';
import { TEAM_SIZE, RULES_ENGINE_VERSION } from './constants';

// ──────────────────────────────────────────
// Battle State Creation
// ──────────────────────────────────────────

/**
 * Create an initial BattleState from a config and two player states.
 *
 * @param config - Match configuration (immutable for the match lifetime)
 * @param player1 - Player 1's state (team, name)
 * @param player2 - Player 2's state (team, name)
 * @returns A new BattleState ready for the first round
 */
export function createBattleState(
  config: MatchConfig,
  player1: PlayerState,
  player2: PlayerState
): BattleState {
  const startEvent: BattleEvent = {
    type: 'battle_start',
    roundNumber: 0,
    timestamp: Date.now(),
    data: {
      player1Name: player1.name,
      player2Name: player2.name,
      mode: config.mode,
      drawMode: config.drawMode,
    },
  };

  return {
    config,
    player1: { ...player1, activePokemonIndex: 0 },
    player2: { ...player2, activePokemonIndex: 0 },
    phase: 'awaiting_action',
    currentRound: 1,
    eventLog: [startEvent],
    roundResults: [],
    winner: null,
  };
}

// ──────────────────────────────────────────
// Round Resolution
// ──────────────────────────────────────────

/**
 * Resolve a single round of battle.
 *
 * Pure function: takes current state + actions + RNG,
 * returns the result without mutating inputs.
 *
 * Turn order: faster Pokemon goes first.
 * Ties broken by seeded RNG coin flip.
 * If the first turn causes a faint that ends the battle,
 * the second turn is null.
 *
 * @param state - Current battle state (not mutated)
 * @param action1 - Player 1's chosen action
 * @param action2 - Player 2's chosen action
 * @param rng - Seeded PRNG instance
 * @returns RoundResult with turn results and events
 */
export function resolveRound(
  state: BattleState,
  action1: BattleAction,
  action2: BattleAction,
  rng: SeededRandom
): RoundResult {
  const events: BattleEvent[] = [];
  const roundNumber = state.currentRound;

  // Round start event
  events.push({
    type: 'round_start',
    roundNumber,
    timestamp: Date.now(),
    data: {},
  });

  // Determine turn order by speed
  const p1Pokemon = getActivePokemon(state.player1);
  const p2Pokemon = getActivePokemon(state.player2);
  const p1Speed = p1Pokemon.species.baseStats.speed;
  const p2Speed = p2Pokemon.species.baseStats.speed;

  let firstAction: BattleAction;
  let secondAction: BattleAction;

  if (p1Speed > p2Speed) {
    firstAction = action1;
    secondAction = action2;
  } else if (p2Speed > p1Speed) {
    firstAction = action2;
    secondAction = action1;
  } else {
    // Speed tie — break with RNG
    if (rng.chance(0.5)) {
      firstAction = action1;
      secondAction = action2;
    } else {
      firstAction = action2;
      secondAction = action1;
    }
  }

  // Resolve first turn
  const firstTurn = resolveTurn(state, firstAction, rng, events, roundNumber);

  // Check if battle ended after first turn
  const stateAfterFirst = applyTurnResult(state, firstAction, firstTurn);
  if (isBattleOver(stateAfterFirst)) {
    // Add battle end event
    const winner = getWinner(stateAfterFirst);
    events.push({
      type: 'battle_end',
      roundNumber,
      timestamp: Date.now(),
      data: { winner },
    });

    return {
      roundNumber,
      firstTurn,
      secondTurn: null,
      events,
    };
  }

  // Resolve second turn (using state after first turn)
  const secondTurn = resolveTurn(
    stateAfterFirst,
    secondAction,
    rng,
    events,
    roundNumber
  );

  // Check if battle ended after second turn
  const stateAfterSecond = applyTurnResult(
    stateAfterFirst,
    secondAction,
    secondTurn
  );
  if (isBattleOver(stateAfterSecond)) {
    const winner = getWinner(stateAfterSecond);
    events.push({
      type: 'battle_end',
      roundNumber,
      timestamp: Date.now(),
      data: { winner },
    });
  }

  return {
    roundNumber,
    firstTurn,
    secondTurn,
    events,
  };
}

// ──────────────────────────────────────────
// Single Turn Resolution
// ──────────────────────────────────────────

/**
 * Resolve a single turn within a round.
 */
function resolveTurn(
  state: BattleState,
  action: BattleAction,
  rng: SeededRandom,
  events: BattleEvent[],
  roundNumber: number
): TurnResult {
  const attacker =
    action.playerId === 'player1' ? state.player1 : state.player2;
  const defender =
    action.playerId === 'player1' ? state.player2 : state.player1;

  const attackerPokemon = getActivePokemon(attacker);
  const defenderPokemon = getActivePokemon(defender);
  const move = attackerPokemon.moves[action.moveIndex];

  // Log move used
  events.push({
    type: 'move_used',
    roundNumber,
    timestamp: Date.now(),
    data: {
      playerId: action.playerId,
      pokemon: attackerPokemon.species.slug,
      move: move.id,
    },
  });

  // Calculate damage
  const damageResult = calculateDamage(
    attackerPokemon,
    defenderPokemon,
    move,
    rng
  );

  // Log damage
  if (damageResult.damage > 0) {
    events.push({
      type: 'damage_dealt',
      roundNumber,
      timestamp: Date.now(),
      data: {
        playerId: action.playerId,
        target: defenderPokemon.species.slug,
        damage: damageResult.damage,
        isCritical: damageResult.isCritical,
        effectiveness: damageResult.effectiveness,
      },
    });
  }

  // Check if target faints
  const newHp = defenderPokemon.currentHp - damageResult.damage;
  const targetFainted = newHp <= 0;

  if (targetFainted) {
    events.push({
      type: 'pokemon_fainted',
      roundNumber,
      timestamp: Date.now(),
      data: {
        playerId: defender.playerId,
        pokemon: defenderPokemon.species.slug,
      },
    });

    // Check if there's a next Pokemon to send out
    const nextIndex = getNextAlivePokemonIndex(defender);
    if (nextIndex !== null) {
      const nextPokemon = defender.team[nextIndex];
      events.push({
        type: 'pokemon_sent_out',
        roundNumber,
        timestamp: Date.now(),
        data: {
          playerId: defender.playerId,
          pokemon: nextPokemon.species.slug,
        },
      });
    }
  }

  return {
    action,
    move,
    damage: damageResult.damage,
    isCritical: damageResult.isCritical,
    effectiveness: damageResult.effectiveness,
    targetFainted,
  };
}

// ──────────────────────────────────────────
// State Application (immutable updates)
// ──────────────────────────────────────────

/**
 * Apply a turn result to the battle state, returning a new state.
 * Does not mutate the input state.
 */
function applyTurnResult(
  state: BattleState,
  action: BattleAction,
  turn: TurnResult
): BattleState {
  const defenderKey =
    action.playerId === 'player1' ? 'player2' : 'player1';
  const defender = state[defenderKey];
  const defenderPokemon = getActivePokemon(defender);

  // Apply damage
  const newHp = Math.max(0, defenderPokemon.currentHp - turn.damage);
  const updatedTeam = defender.team.map((p, i) =>
    i === defender.activePokemonIndex
      ? { ...p, currentHp: newHp }
      : p
  );

  // If fainted, switch to next alive Pokemon
  let newActiveIndex = defender.activePokemonIndex;
  if (newHp <= 0) {
    const nextIndex = getNextAlivePokemonIndex({
      ...defender,
      team: updatedTeam,
    });
    if (nextIndex !== null) {
      newActiveIndex = nextIndex;
    }
  }

  return {
    ...state,
    [defenderKey]: {
      ...defender,
      team: updatedTeam,
      activePokemonIndex: newActiveIndex,
    },
  };
}

/**
 * Apply a full round result to the battle state.
 * Returns a new BattleState with updated HP, active Pokemon,
 * events, and phase.
 */
export function applyRoundResult(
  state: BattleState,
  result: RoundResult
): BattleState {
  let newState = { ...state };

  // Apply first turn
  newState = applyTurnResult(newState, result.firstTurn.action, result.firstTurn);

  // Apply second turn if it exists
  if (result.secondTurn) {
    newState = applyTurnResult(
      newState,
      result.secondTurn.action,
      result.secondTurn
    );
  }

  // Update events and round results
  const newEventLog = [...newState.eventLog, ...result.events];
  const newRoundResults = [...newState.roundResults, result];

  // Check for battle end
  const battleOver = isBattleOver(newState);
  const winner = battleOver ? getWinner(newState) : null;
  const phase: BattlePhase = battleOver ? 'finished' : 'awaiting_action';

  return {
    ...newState,
    currentRound: state.currentRound + 1,
    eventLog: newEventLog,
    roundResults: newRoundResults,
    winner,
    phase,
  };
}

// ──────────────────────────────────────────
// Helper Functions
// ──────────────────────────────────────────

/** Get the currently active Pokemon for a player. */
export function getActivePokemon(player: PlayerState): BattlePokemon {
  return player.team[player.activePokemonIndex];
}

/** Get the number of remaining (non-fainted) Pokemon for a player. */
export function getRemainingCount(player: PlayerState): number {
  return player.team.filter((p) => p.currentHp > 0).length;
}

/**
 * Get the index of the next alive Pokemon after the current one.
 * Returns null if no alive Pokemon remain.
 */
function getNextAlivePokemonIndex(player: PlayerState): number | null {
  for (let i = player.activePokemonIndex + 1; i < player.team.length; i++) {
    if (player.team[i].currentHp > 0) return i;
  }
  return null;
}

/** Check if the battle is over (one side has no remaining Pokemon). */
export function isBattleOver(state: BattleState): boolean {
  return (
    getRemainingCount(state.player1) === 0 ||
    getRemainingCount(state.player2) === 0
  );
}

/** Get the winner of the battle (assumes battle is over). */
export function getWinner(
  state: BattleState
): 'player1' | 'player2' | null {
  if (getRemainingCount(state.player1) === 0) return 'player2';
  if (getRemainingCount(state.player2) === 0) return 'player1';
  return null;
}
