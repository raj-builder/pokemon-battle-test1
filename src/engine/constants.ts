/**
 * Named constants for the Pokemon Battle Simulator.
 *
 * CLAUDE.md Section 2: "No magic numbers."
 * Every threshold, limit, or constant lives here with
 * an explanatory comment describing its origin.
 */

/** Team size for each player. Standard 5v5 format. */
export const TEAM_SIZE = 5;

/** Number of moves each Pokemon brings into battle. */
export const MOVES_PER_POKEMON = 4;

/**
 * Critical hit chance as a fraction (1/16 = 6.25%).
 * Source: Pokemon Gen V base critical hit ratio (stage 0).
 */
export const CRITICAL_HIT_CHANCE = 1 / 16;

/**
 * Critical hit damage multiplier.
 * Source: Pokemon Gen VI onwards uses 1.5x (down from 2x in Gen V and earlier).
 */
export const CRITICAL_HIT_MULTIPLIER = 1.5;

/**
 * Random damage variance minimum (85%).
 * Source: mainline Pokemon games Gen III+.
 * Damage is multiplied by a random value in [0.85, 1.00].
 */
export const DAMAGE_VARIANCE_MIN = 0.85;

/**
 * Random damage variance maximum (100%).
 * Source: mainline Pokemon games Gen III+.
 */
export const DAMAGE_VARIANCE_MAX = 1.0;

/**
 * Minimum damage any attack can deal.
 * Prevents 0-damage softlock scenarios.
 */
export const MINIMUM_DAMAGE = 1;

/**
 * STAB (Same Type Attack Bonus) multiplier.
 * Applied when a Pokemon uses a move matching one of its types.
 * Source: all mainline Pokemon games since Gen I.
 */
export const STAB_MULTIPLIER = 1.5;

/**
 * Effective trainer level for damage formula.
 * We use a fixed level-50 equivalent for the simplified formula.
 * Source: competitive standard (VGC, Battle Stadium).
 */
export const EFFECTIVE_LEVEL = 50;

/**
 * Maximum base stat value for stat bar rendering.
 * Blissey has the highest single base stat at 255 (HP).
 */
export const MAX_STAT_VALUE = 255;

// ──────────────────────────────────────────
// API & Caching
// ──────────────────────────────────────────

/** PokeAPI base URL. Overridable via NEXT_PUBLIC_POKEAPI_BASE_URL env var. */
export const POKEAPI_BASE_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_POKEAPI_BASE_URL) ||
  'https://pokeapi.co/api/v2';

/**
 * PokeAPI fetch timeout in milliseconds.
 * If the API does not respond within this window, fall back to cached/offline data.
 */
export const API_FETCH_TIMEOUT_MS = 6000;

/**
 * Quick connectivity check timeout in milliseconds.
 * Used on startup to determine if PokeAPI is reachable.
 */
export const API_QUICK_CHECK_TIMEOUT_MS = 3500;

/**
 * Cache TTL for Pokemon data in seconds (24 hours).
 * Per CLAUDE.md Section 6.1: external sources pulled at most once per 24 hours.
 */
export const POKEMON_CACHE_TTL_SECONDS = 86400;

/**
 * Maximum number of rerolls per team-building phase.
 * -1 = unlimited rerolls.
 */
export const MAX_REROLLS = -1;

/**
 * Request counter warning threshold per session.
 * If PokeAPI requests exceed this count in one session, log a warning.
 * Per docs/api-costs.md: catches runaway API calls.
 */
export const API_REQUEST_WARNING_THRESHOLD = 50;

// ──────────────────────────────────────────
// Simulation Speed
// ──────────────────────────────────────────

/**
 * AI simulation speed presets.
 * Each level maps to a delay in milliseconds between moves.
 * Used when battleMode is 'ai_simulation'.
 */
export const SIM_SPEED_PRESETS: Record<
  number,
  { readonly labelKey: string; readonly delayMs: number }
> = {
  1: { labelKey: 'battle.speed.slow', delayMs: 1200 },
  2: { labelKey: 'battle.speed.normal', delayMs: 700 },
  3: { labelKey: 'battle.speed.fast', delayMs: 350 },
  4: { labelKey: 'battle.speed.veryFast', delayMs: 150 },
  5: { labelKey: 'battle.speed.instant', delayMs: 30 },
} as const;

// ──────────────────────────────────────────
// Rules Engine
// ──────────────────────────────────────────

/**
 * Current rules engine version (BE-011).
 * Increment when battle formula, type chart, or balance rules change.
 * Stored with every match so old replays remain interpretable.
 * Format: semver (MAJOR.MINOR.PATCH).
 */
export const RULES_ENGINE_VERSION = '1.0.0';

// ──────────────────────────────────────────
// Feature Flags
// ──────────────────────────────────────────

/**
 * Default feature flag values.
 * CLAUDE.md Section 2: "Feature flags over big-bang releases."
 * Wrap new behavior in a flag so it can be turned off instantly.
 */
export const DEFAULT_FEATURE_FLAGS = {
  /** Enable mirrored-draw mode option (UX-004, BE-003) */
  mirroredDraw: true,
  /** Enable 2-player battle mode (UX-002) */
  twoPlayerMode: true,
  /** Enable match history persistence (BE-008) */
  matchHistory: false,
  /** Enable telemetry event logging (BE-009) */
  telemetry: false,
  /** Show first-run onboarding tutorial (UX-011) */
  onboarding: false,
} as const;

// ──────────────────────────────────────────
// Generation Ranges
// ──────────────────────────────────────────

/**
 * Maps generation number to [startId, endId] in the National Pokedex.
 * Source: Bulbapedia National Pokedex ranges.
 */
export const GENERATION_RANGES: Record<number, readonly [number, number]> = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025],
} as const;

// ──────────────────────────────────────────
// Match History
// ──────────────────────────────────────────

/**
 * Maximum number of match records stored in IndexedDB.
 * Oldest records are evicted (LRU) when this limit is exceeded.
 */
export const MAX_MATCH_HISTORY_RECORDS = 100;

// ──────────────────────────────────────────
// UI Constants
// ──────────────────────────────────────────

/**
 * Minimum touch target size in pixels.
 * Source: WCAG 2.5.5 Target Size (Enhanced) — 44×44px minimum.
 */
export const MIN_TOUCH_TARGET_PX = 44;

/**
 * Default pool size for mirrored draw mode.
 * Both players choose from a shared pool of this many Pokemon.
 */
export const MIRRORED_DRAW_POOL_SIZE = 15;

/**
 * Player name maximum length.
 * Prevents layout overflow and potential abuse.
 */
export const PLAYER_NAME_MAX_LENGTH = 20;

/**
 * Default player names (i18n keys, resolved at render time).
 */
export const DEFAULT_PLAYER1_NAME_KEY = 'player.player1';
export const DEFAULT_PLAYER2_NAME_KEY = 'player.player2';
