/**
 * Core type definitions for the Pokemon Battle Simulator.
 *
 * These types are framework-agnostic (no React/Next.js imports).
 * They define the canonical data model used by the battle engine,
 * state management, UI components, and persistence layer.
 *
 * Backlog references: BE-001 (battle-state model), BE-006 (normalized schema)
 */

// ──────────────────────────────────────────
// Pokemon Elemental Types (the 18 standard types)
// ──────────────────────────────────────────

export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

/** All 18 Pokemon types as an array for iteration. */
export const ALL_POKEMON_TYPES: readonly PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
] as const;

// ──────────────────────────────────────────
// Move Definitions
// ──────────────────────────────────────────

export type MoveCategory = 'physical' | 'special' | 'status';

/**
 * A normalized move definition.
 * Source: PokeAPI move data, cached and normalized.
 */
export interface Move {
  /** Unique slug, e.g. "thunder-shock" */
  readonly id: string;
  /** i18n translation key for the move name */
  readonly nameKey: string;
  /** Elemental type of the move */
  readonly type: PokemonType;
  /** physical / special / status */
  readonly category: MoveCategory;
  /**
   * Base power of the move (0 for status moves).
   * Source: PokeAPI move.power field.
   * Used in damage formula: see damage-calculator.ts
   */
  readonly power: number;
  /**
   * Accuracy as a percentage (1-100). 0 = always hits (bypass accuracy check).
   * Source: PokeAPI move.accuracy field.
   */
  readonly accuracy: number;
  /** Max PP (for display only — no PP tracking in v1) */
  readonly pp: number;
}

// ──────────────────────────────────────────
// Pokemon Species (static data from DB/cache)
// ──────────────────────────────────────────

export interface PokemonBaseStats {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly specialAttack: number;
  readonly specialDefense: number;
  readonly speed: number;
}

/**
 * A normalized Pokemon species definition.
 * Source: PokeAPI pokemon data, cached and normalized.
 * Backlog: BE-006 (normalized schema)
 */
export interface PokemonSpecies {
  /** National Dex ID */
  readonly id: number;
  /** Lowercase slug, e.g. "pikachu" */
  readonly slug: string;
  /** i18n translation key for the display name */
  readonly nameKey: string;
  /** Array of 1-2 elemental types */
  readonly types: readonly [PokemonType, ...PokemonType[]];
  /** Base stats */
  readonly baseStats: PokemonBaseStats;
  /** Available move IDs (slugs) that this species can learn */
  readonly moveIds: readonly string[];
  /** Sprite URL for battle display */
  readonly spriteUrl: string;
  /** Generation number (1-9) */
  readonly generation: number;
}

// ──────────────────────────────────────────
// Battle Pokemon (instance in a match)
// ──────────────────────────────────────────

/**
 * A Pokemon instance within a battle.
 * Wraps a species with mutable battle state (HP).
 */
export interface BattlePokemon {
  /** Reference to the species definition */
  readonly species: PokemonSpecies;
  /** The 4 moves selected for this battle */
  readonly moves: readonly [Move, Move, Move, Move];
  /** Current HP (mutated during battle) */
  currentHp: number;
  /** Max HP for this instance (derived from species.baseStats.hp) */
  readonly maxHp: number;
}

// ──────────────────────────────────────────
// Player State
// ──────────────────────────────────────────

export interface PlayerState {
  /** Display name of the player */
  readonly name: string;
  /** Player identifier */
  readonly playerId: 'player1' | 'player2';
  /** Ordered team of Pokemon (typically 5) */
  readonly team: BattlePokemon[];
  /** Index of the currently active Pokemon in the team array */
  activePokemonIndex: number;
}

// ──────────────────────────────────────────
// Match Configuration
// ──────────────────────────────────────────

/** Primary game mode selection. */
export type GameMode = 'two_player' | 'vs_cpu' | 'ai_simulation';

/** Draw mode for team generation. */
export type DrawMode = 'independent' | 'mirrored';

/**
 * Immutable configuration for a match.
 * Set once at match creation, never changes during the match.
 */
export interface MatchConfig {
  /** Unique match ID (UUID v4) */
  readonly matchId: string;
  /** Game mode */
  readonly mode: GameMode;
  /** Draw mode for team generation */
  readonly drawMode: DrawMode;
  /**
   * Team size (number of Pokemon per player).
   * Default: 5 (from TEAM_SIZE constant)
   */
  readonly teamSize: number;
  /**
   * Master RNG seed for reproducibility (BE-002).
   * All randomness in the match derives from this seed.
   */
  readonly masterSeed: number;
  /**
   * Rules engine version string (BE-011).
   * Stored with every match so old replays are interpretable.
   */
  readonly rulesVersion: string;
  /** Match creation timestamp in ISO 8601 UTC */
  readonly createdAt: string;
}

// ──────────────────────────────────────────
// Battle Actions
// ──────────────────────────────────────────

/** An action a player can take during their turn. */
export interface BattleAction {
  readonly playerId: 'player1' | 'player2';
  readonly type: 'use_move';
  /** Index of the move in the active Pokemon's moves array (0-3) */
  readonly moveIndex: number;
}

// ──────────────────────────────────────────
// Battle Events (for logging and replay)
// ──────────────────────────────────────────

export type BattleEventType =
  | 'battle_start'
  | 'round_start'
  | 'move_used'
  | 'damage_dealt'
  | 'pokemon_fainted'
  | 'pokemon_sent_out'
  | 'battle_end';

/**
 * A single event in the battle log.
 * Events are append-only and ordered chronologically.
 */
export interface BattleEvent {
  readonly type: BattleEventType;
  readonly roundNumber: number;
  /** Monotonic timestamp (Date.now()) for ordering */
  readonly timestamp: number;
  /** Event-specific data (varies by type) */
  readonly data: Record<string, unknown>;
}

// ──────────────────────────────────────────
// Turn and Round Results
// ──────────────────────────────────────────

/** Result of one player's turn within a round. */
export interface TurnResult {
  /** The action taken */
  readonly action: BattleAction;
  /** The move used */
  readonly move: Move;
  /** Damage dealt to the target (0 for miss/status) */
  readonly damage: number;
  /** Was it a critical hit */
  readonly isCritical: boolean;
  /**
   * Type effectiveness multiplier.
   * 0 = immune, 0.25 = double resist, 0.5 = resist,
   * 1 = neutral, 2 = super effective, 4 = double super effective
   */
  readonly effectiveness: number;
  /** Did the target faint as a result of this turn */
  readonly targetFainted: boolean;
}

/**
 * Result of a complete round (both players act).
 * Speed determines who goes first. If the first turn ends
 * the battle, secondTurn is null.
 */
export interface RoundResult {
  readonly roundNumber: number;
  /** The faster player's turn (goes first) */
  readonly firstTurn: TurnResult;
  /** The slower player's turn (null if battle ended after first) */
  readonly secondTurn: TurnResult | null;
  /** All events generated during this round */
  readonly events: readonly BattleEvent[];
}

// ──────────────────────────────────────────
// Battle State (canonical model — BE-001)
// ──────────────────────────────────────────

/** Current phase of a battle. */
export type BattlePhase =
  | 'setup'            // Teams being built
  | 'arrange'          // Teams being ordered
  | 'awaiting_action'  // Waiting for player input
  | 'resolving'        // Engine processing a round
  | 'finished';        // Match complete

/**
 * The canonical battle state model (BE-001).
 * Single source of truth for all battle rendering,
 * simulation, and replay flows.
 */
export interface BattleState {
  readonly config: MatchConfig;
  readonly player1: PlayerState;
  readonly player2: PlayerState;
  readonly phase: BattlePhase;
  readonly currentRound: number;
  /** Ordered log of all events (append-only) */
  readonly eventLog: BattleEvent[];
  /** Ordered log of all round results (for replay) */
  readonly roundResults: RoundResult[];
  /** Who won (null if not finished) */
  readonly winner: 'player1' | 'player2' | null;
}

// ──────────────────────────────────────────
// Match Record (for history / persistence)
// ──────────────────────────────────────────

/**
 * A completed match record for persistence.
 * Stored in IndexedDB for match history and replay (BE-008).
 */
export interface MatchRecord {
  readonly matchId: string;
  readonly config: MatchConfig;
  readonly player1Name: string;
  readonly player2Name: string;
  readonly winner: 'player1' | 'player2';
  readonly finalScore: {
    readonly player1Remaining: number;
    readonly player2Remaining: number;
  };
  readonly completedAt: string;
  readonly roundResults: readonly RoundResult[];
}

// ──────────────────────────────────────────
// Pool Filters (for team generation)
// ──────────────────────────────────────────

/** Filters applied when generating a Pokemon pool for drawing. */
export interface PoolFilters {
  /** Filter by Pokemon type (null = any type) */
  readonly type: PokemonType | null;
  /** Filter by generation (null = any generation) */
  readonly generation: number | null;
}

// ──────────────────────────────────────────
// Cached Pokemon Data (API efficiency — CLAUDE.md Section 6)
// ──────────────────────────────────────────

/**
 * Wrapper for cached Pokemon data with metadata.
 * Per CLAUDE.md Section 6.2: cache records include
 * fetchedAt, sourceUrl, dataHash, and ttlSeconds.
 */
export interface CachedPokemonData {
  readonly species: PokemonSpecies;
  /** ISO 8601 UTC timestamp of when data was fetched */
  readonly fetchedAt: string;
  /** Source API URL, e.g. "https://pokeapi.co/api/v2/pokemon/25" */
  readonly sourceUrl: string;
  /** SHA-256 hash of the API response for change detection */
  readonly dataHash: string;
  /**
   * Cache time-to-live in seconds.
   * Default: 86400 (24 hours) from POKEMON_CACHE_TTL_SECONDS constant
   */
  readonly ttlSeconds: number;
}
