/**
 * Game state management with Zustand.
 *
 * Central store for match state, teams, and session scores.
 * All battle state changes go through this store, which delegates
 * to the battle engine for resolution.
 *
 * CLAUDE.md Section 2: "Stateless by default" — state lives in
 * the store, not in component local state. Components are pure
 * renders of store data.
 */
'use client';

import { create } from 'zustand';
import type {
  BattleState,
  BattleAction,
  MatchConfig,
  PlayerState,
  PokemonSpecies,
  BattlePokemon,
  GameMode,
  DrawMode,
  PoolFilters,
  Move,
} from '@/engine/types';
import {
  createBattleState,
  resolveRound,
  applyRoundResult,
  getActivePokemon,
  getRemainingCount,
} from '@/engine/battle-engine';
import { SeededRandom, generateMasterSeed } from '@/engine/seeded-random';
import { TEAM_SIZE, RULES_ENGINE_VERSION } from '@/engine/constants';

// ──────────────────────────────────────────
// Session scores (in-memory only, reset on page reload)
// ──────────────────────────────────────────

interface SessionScores {
  player1Wins: number;
  player2Wins: number;
}

// ──────────────────────────────────────────
// Game Store State
// ──────────────────────────────────────────

interface GameStoreState {
  // Match configuration
  mode: GameMode;
  drawMode: DrawMode;
  filters: PoolFilters;
  masterSeed: number;

  // Player names
  player1Name: string;
  player2Name: string;

  // Team building
  player1Species: PokemonSpecies[];
  player2Species: PokemonSpecies[];

  // Battle state (null if not in battle)
  battleState: BattleState | null;

  // RNG instance (not serialized)
  rng: SeededRandom | null;

  // Session scores
  scores: SessionScores;

  // Current step in the flow
  currentStep: 'build' | 'arrange' | 'battle';

  // For 2-player: which player is currently setting up
  activeSetupPlayer: 'player1' | 'player2';

  // Mirrored draw pool (if mirrored mode)
  mirroredPool: PokemonSpecies[] | null;
}

interface GameStoreActions {
  // Configuration
  setMode: (mode: GameMode) => void;
  setDrawMode: (drawMode: DrawMode) => void;
  setFilters: (filters: PoolFilters) => void;
  setPlayerName: (player: 'player1' | 'player2', name: string) => void;

  // Team building
  setPlayerSpecies: (player: 'player1' | 'player2', species: PokemonSpecies[]) => void;
  setMirroredPool: (pool: PokemonSpecies[]) => void;

  // Flow control
  setCurrentStep: (step: 'build' | 'arrange' | 'battle') => void;
  setActiveSetupPlayer: (player: 'player1' | 'player2') => void;

  // Match lifecycle
  initializeMatch: () => void;
  startBattle: (
    player1Team: BattlePokemon[],
    player2Team: BattlePokemon[]
  ) => void;
  submitActions: (action1: BattleAction, action2: BattleAction) => void;
  endMatch: (winner: 'player1' | 'player2') => void;
  resetGame: () => void;

  // Scores
  resetScores: () => void;
}

type GameStore = GameStoreState & GameStoreActions;

// ──────────────────────────────────────────
// Default State
// ──────────────────────────────────────────

const DEFAULT_STATE: GameStoreState = {
  mode: 'two_player',
  drawMode: 'independent',
  filters: { type: null, generation: null },
  masterSeed: 0,
  player1Name: 'Player 1',
  player2Name: 'Player 2',
  player1Species: [],
  player2Species: [],
  battleState: null,
  rng: null,
  scores: { player1Wins: 0, player2Wins: 0 },
  currentStep: 'build',
  activeSetupPlayer: 'player1',
  mirroredPool: null,
};

// ──────────────────────────────────────────
// Store
// ──────────────────────────────────────────

export const useGameStore = create<GameStore>()(
  (set, get) => ({
      ...DEFAULT_STATE,

      // ── Configuration ──

      setMode: (mode) => set({ mode }),
      setDrawMode: (drawMode) => set({ drawMode }),
      setFilters: (filters) => set({ filters }),
      setPlayerName: (player, name) => {
        if (player === 'player1') set({ player1Name: name });
        else set({ player2Name: name });
      },

      // ── Team Building ──

      setPlayerSpecies: (player, species) => {
        if (player === 'player1') set({ player1Species: species });
        else set({ player2Species: species });
      },

      setMirroredPool: (pool) => set({ mirroredPool: pool }),

      // ── Flow Control ──

      setCurrentStep: (step) => set({ currentStep: step }),
      setActiveSetupPlayer: (player) => set({ activeSetupPlayer: player }),

      // ── Match Lifecycle ──

      initializeMatch: () => {
        const seed = generateMasterSeed();
        const rng = new SeededRandom(seed);
        set({ masterSeed: seed, rng });
      },

      startBattle: (player1Team, player2Team) => {
        const state = get();
        const config: MatchConfig = {
          matchId: crypto.randomUUID(),
          mode: state.mode,
          drawMode: state.drawMode,
          teamSize: TEAM_SIZE,
          masterSeed: state.masterSeed,
          rulesVersion: RULES_ENGINE_VERSION,
          createdAt: new Date().toISOString(),
        };

        const player1: PlayerState = {
          name: state.player1Name,
          playerId: 'player1',
          team: player1Team,
          activePokemonIndex: 0,
        };

        const player2: PlayerState = {
          name: state.player2Name,
          playerId: 'player2',
          team: player2Team,
          activePokemonIndex: 0,
        };

        const battleState = createBattleState(config, player1, player2);
        set({ battleState, currentStep: 'battle' });
      },

      submitActions: (action1, action2) => {
        const { battleState, rng } = get();
        if (!battleState || !rng) return;

        const roundResult = resolveRound(battleState, action1, action2, rng);
        const newState = applyRoundResult(battleState, roundResult);
        set({ battleState: newState });

        // If battle ended, update scores
        if (newState.winner) {
          get().endMatch(newState.winner);
        }
      },

      endMatch: (winner) => {
        const { scores } = get();
        const newScores = { ...scores };
        if (winner === 'player1') newScores.player1Wins++;
        else newScores.player2Wins++;
        set({ scores: newScores });
      },

      resetGame: () => {
        set({
          battleState: null,
          rng: null,
          player1Species: [],
          player2Species: [],
          currentStep: 'build',
          activeSetupPlayer: 'player1',
          mirroredPool: null,
          masterSeed: 0,
        });
      },

      // ── Scores ──

      resetScores: () => {
        set({ scores: { player1Wins: 0, player2Wins: 0 } });
      },
  })
);
