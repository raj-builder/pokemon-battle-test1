/**
 * Post-battle analysis utility (pure functions, no framework imports).
 *
 * Computes summary statistics from a completed BattleState:
 * - MVP for each side (most total damage dealt)
 * - Total damage dealt and received per Pokemon
 * - Key type matchup highlights (super effective moments)
 * - 1-2 improvement tips based on team ordering and type matchups
 *
 * CLAUDE.md Section 5: Every number shown in the UI traces to this
 * named function with a docstring. All formulas documented inline.
 */

import type {
  BattleState,
  BattlePokemon,
  BattleEvent,
} from './types';
import { getCombinedEffectiveness } from './type-effectiveness';

// ──────────────────────────────────────────
// Types
// ──────────────────────────────────────────

export interface PokemonBattleStats {
  /** Pokemon slug for identification */
  readonly slug: string;
  /** Pokemon display name (slug with hyphens → spaces) */
  readonly displayName: string;
  /** Pokemon sprite URL */
  readonly spriteUrl: string;
  /** Pokemon types */
  readonly types: readonly string[];
  /** Total damage dealt across all rounds */
  readonly totalDamageDealt: number;
  /** Total damage received across all rounds */
  readonly totalDamageReceived: number;
  /** Number of opponents knocked out */
  readonly knockouts: number;
  /** Whether this Pokemon survived the battle */
  readonly survived: boolean;
  /** HP remaining at end of battle (0 if fainted) */
  readonly remainingHp: number;
  /** Max HP */
  readonly maxHp: number;
}

export interface KeyMoment {
  /** i18n description key */
  readonly descriptionKey: string;
  /** Interpolation values for the i18n template */
  readonly values: Record<string, string | number>;
}

export interface ImprovementTip {
  /** i18n key for the tip */
  readonly tipKey: string;
  /** Interpolation values */
  readonly values: Record<string, string | number>;
}

export interface BattleSummary {
  /** Winner player ID */
  readonly winner: 'player1' | 'player2';
  /** MVP for player 1 (most damage dealt) */
  readonly player1Mvp: PokemonBattleStats;
  /** MVP for player 2 (most damage dealt) */
  readonly player2Mvp: PokemonBattleStats;
  /** Per-Pokemon stats for player 1's team (battle order) */
  readonly player1Stats: PokemonBattleStats[];
  /** Per-Pokemon stats for player 2's team (battle order) */
  readonly player2Stats: PokemonBattleStats[];
  /** Key moments from the battle (max 3) */
  readonly keyMoments: KeyMoment[];
  /** Improvement tips (1-2) */
  readonly tips: ImprovementTip[];
  /** Total rounds played */
  readonly totalRounds: number;
}

// ──────────────────────────────────────────
// Constants
// ──────────────────────────────────────────

/** Maximum number of key moments to display in the summary. */
const MAX_KEY_MOMENTS = 3;

/** Effectiveness threshold considered "super effective" (2x or higher). */
const SUPER_EFFECTIVE_THRESHOLD = 2;

// ──────────────────────────────────────────
// Analyzer
// ──────────────────────────────────────────

/**
 * Analyze a completed battle and produce a summary.
 *
 * Iterates through the battle eventLog to compute per-Pokemon
 * damage dealt/received, identify MVPs, highlight key type
 * matchups, and generate improvement tips.
 *
 * @param battleState - A completed BattleState (phase === 'finished')
 * @returns BattleSummary with all computed stats
 *
 * Data sources:
 * - battleState.eventLog: chronological events with attacker/defender/damage data
 * - battleState.player1.team / player2.team: final HP values
 * - battleState.roundResults: turn-level data with effectiveness and crits
 *
 * Formulas:
 * - MVP: argmax(totalDamageDealt) per side
 * - totalDamageDealt: SUM of damage from all 'damage_dealt' events where playerId matches
 * - totalDamageReceived: SUM of damage from all 'damage_dealt' events where target matches
 * - knockouts: COUNT of 'pokemon_fainted' events caused by a Pokemon's attacks
 */
export function analyzeBattle(battleState: BattleState): BattleSummary {
  // Initialize per-Pokemon stats from team data
  const p1Stats = initializeStats(battleState.player1.team);
  const p2Stats = initializeStats(battleState.player2.team);

  // Track which Pokemon is active for each player to attribute damage
  let p1ActiveSlug = battleState.player1.team[0]?.species.slug ?? '';
  let p2ActiveSlug = battleState.player2.team[0]?.species.slug ?? '';

  // Collect key moment candidates (will pick top 3)
  const momentCandidates: Array<KeyMoment & { score: number }> = [];

  // Track the biggest single hit for key moments
  let biggestHit = { damage: 0, attackerSlug: '', defenderSlug: '', moveId: '' };

  // Iterate through events to accumulate stats
  for (const event of battleState.eventLog) {
    switch (event.type) {
      case 'pokemon_sent_out': {
        // Update active Pokemon tracker
        const sentPlayerId = event.data.playerId as string;
        const sentSlug = event.data.pokemon as string;
        if (sentPlayerId === 'player1') {
          p1ActiveSlug = sentSlug;
        } else {
          p2ActiveSlug = sentSlug;
        }
        break;
      }

      case 'damage_dealt': {
        const attackerId = event.data.playerId as string;
        const targetSlug = event.data.target as string;
        const damage = event.data.damage as number;
        const isCritical = event.data.isCritical as boolean;
        const effectiveness = event.data.effectiveness as number;

        // Determine attacker slug from active Pokemon tracker
        const attackerSlug =
          attackerId === 'player1' ? p1ActiveSlug : p2ActiveSlug;

        // Attribute damage dealt to attacker
        const attackerStats =
          attackerId === 'player1' ? p1Stats : p2Stats;
        const attackerEntry = attackerStats.get(attackerSlug);
        if (attackerEntry) {
          attackerEntry.totalDamageDealt += damage;
        }

        // Attribute damage received to target
        const defenderStats =
          attackerId === 'player1' ? p2Stats : p1Stats;
        const defenderEntry = defenderStats.get(targetSlug);
        if (defenderEntry) {
          defenderEntry.totalDamageReceived += damage;
        }

        // Track biggest hit
        if (damage > biggestHit.damage) {
          biggestHit = {
            damage,
            attackerSlug,
            defenderSlug: targetSlug,
            moveId: '', // will be populated from preceding move_used event
          };
        }

        // Collect super effective moments
        if (effectiveness >= SUPER_EFFECTIVE_THRESHOLD) {
          momentCandidates.push({
            descriptionKey: 'result.superEffectiveHit',
            values: {
              attacker: slugToName(attackerSlug),
              defender: slugToName(targetSlug),
              damage,
            },
            score: damage * effectiveness,
          });
        }

        // Collect critical hit moments
        if (isCritical && damage > 0) {
          momentCandidates.push({
            descriptionKey: 'result.criticalHit',
            values: {
              attacker: slugToName(attackerSlug),
              damage,
            },
            score: damage * 1.5,
          });
        }
        break;
      }

      case 'pokemon_fainted': {
        const faintedPlayerId = event.data.playerId as string;
        const faintedSlug = event.data.pokemon as string;

        // The attacker is the OTHER player's active Pokemon
        const attackerSlug =
          faintedPlayerId === 'player1' ? p2ActiveSlug : p1ActiveSlug;
        const attackerStats =
          faintedPlayerId === 'player1' ? p2Stats : p1Stats;
        const attackerEntry = attackerStats.get(attackerSlug);
        if (attackerEntry) {
          attackerEntry.knockouts += 1;
        }

        // Mark the fainted Pokemon
        const faintedStats =
          faintedPlayerId === 'player1' ? p1Stats : p2Stats;
        const faintedEntry = faintedStats.get(faintedSlug);
        if (faintedEntry) {
          faintedEntry.survived = false;
          faintedEntry.remainingHp = 0;
        }
        break;
      }
    }
  }

  // Finalize remaining HP for survivors from actual battle state
  for (const pokemon of battleState.player1.team) {
    const entry = p1Stats.get(pokemon.species.slug);
    if (entry && entry.survived) {
      entry.remainingHp = pokemon.currentHp;
    }
  }
  for (const pokemon of battleState.player2.team) {
    const entry = p2Stats.get(pokemon.species.slug);
    if (entry && entry.survived) {
      entry.remainingHp = pokemon.currentHp;
    }
  }

  // Convert maps to arrays (preserving battle order)
  const p1StatsArray = toStatsArray(p1Stats, battleState.player1.team);
  const p2StatsArray = toStatsArray(p2Stats, battleState.player2.team);

  // Determine MVPs (highest damage dealt per side)
  const p1Mvp = findMvp(p1StatsArray);
  const p2Mvp = findMvp(p2StatsArray);

  // Pick top key moments by score
  momentCandidates.sort((a, b) => b.score - a.score);
  const keyMoments: KeyMoment[] = momentCandidates
    .slice(0, MAX_KEY_MOMENTS)
    .map(({ descriptionKey, values }) => ({ descriptionKey, values }));

  // Add biggest hit if not already captured
  if (
    biggestHit.damage > 0 &&
    keyMoments.length < MAX_KEY_MOMENTS
  ) {
    const alreadyCaptured = keyMoments.some(
      (m) => m.values.damage === biggestHit.damage
    );
    if (!alreadyCaptured) {
      keyMoments.push({
        descriptionKey: 'result.biggestHit',
        values: {
          attacker: slugToName(biggestHit.attackerSlug),
          defender: slugToName(biggestHit.defenderSlug),
          damage: biggestHit.damage,
        },
      });
    }
  }

  // Generate improvement tips
  const tips = generateTips(battleState, p1StatsArray, p2StatsArray);

  return {
    winner: battleState.winner ?? 'player1',
    player1Mvp: p1Mvp,
    player2Mvp: p2Mvp,
    player1Stats: p1StatsArray,
    player2Stats: p2StatsArray,
    keyMoments,
    tips,
    totalRounds: battleState.currentRound,
  };
}

// ──────────────────────────────────────────
// Internal Helpers
// ──────────────────────────────────────────

/** Mutable version of PokemonBattleStats for accumulation. */
interface MutableStats {
  slug: string;
  displayName: string;
  spriteUrl: string;
  types: readonly string[];
  totalDamageDealt: number;
  totalDamageReceived: number;
  knockouts: number;
  survived: boolean;
  remainingHp: number;
  maxHp: number;
}

/** Initialize a stats map from a team's Pokemon. */
function initializeStats(
  team: readonly BattlePokemon[]
): Map<string, MutableStats> {
  const map = new Map<string, MutableStats>();
  for (const pokemon of team) {
    map.set(pokemon.species.slug, {
      slug: pokemon.species.slug,
      displayName: slugToName(pokemon.species.slug),
      spriteUrl: pokemon.species.spriteUrl,
      types: pokemon.species.types,
      totalDamageDealt: 0,
      totalDamageReceived: 0,
      knockouts: 0,
      survived: true,
      remainingHp: pokemon.maxHp,
      maxHp: pokemon.maxHp,
    });
  }
  return map;
}

/** Convert a stats map to an array preserving team battle order. */
function toStatsArray(
  map: Map<string, MutableStats>,
  team: readonly BattlePokemon[]
): PokemonBattleStats[] {
  return team.map((pokemon) => {
    const entry = map.get(pokemon.species.slug);
    if (!entry) {
      return {
        slug: pokemon.species.slug,
        displayName: slugToName(pokemon.species.slug),
        spriteUrl: pokemon.species.spriteUrl,
        types: pokemon.species.types,
        totalDamageDealt: 0,
        totalDamageReceived: 0,
        knockouts: 0,
        survived: pokemon.currentHp > 0,
        remainingHp: pokemon.currentHp,
        maxHp: pokemon.maxHp,
      };
    }
    return { ...entry };
  });
}

/**
 * Find the MVP — the Pokemon with the highest total damage dealt.
 * Falls back to the first Pokemon if all dealt 0.
 */
function findMvp(stats: PokemonBattleStats[]): PokemonBattleStats {
  let mvp = stats[0];
  for (const s of stats) {
    if (s.totalDamageDealt > mvp.totalDamageDealt) {
      mvp = s;
    }
  }
  return mvp;
}

/** Convert a Pokemon slug (e.g. "mr-mime") to display name ("Mr Mime"). */
function slugToName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate 1-2 improvement tips based on battle data.
 *
 * Tip logic:
 * 1. If the loser's lead had a type disadvantage vs the winner's lead,
 *    suggest reordering.
 * 2. If any Pokemon on the losing side dealt zero damage, suggest
 *    better type coverage.
 * 3. If neither applies, give a positive "well played" tip.
 */
function generateTips(
  battleState: BattleState,
  p1Stats: PokemonBattleStats[],
  p2Stats: PokemonBattleStats[]
): ImprovementTip[] {
  const tips: ImprovementTip[] = [];
  const winner = battleState.winner;
  if (!winner) return tips;

  const loserStats = winner === 'player1' ? p2Stats : p1Stats;
  const winnerStats = winner === 'player1' ? p1Stats : p2Stats;

  const loserLead = loserStats[0];
  const winnerLead = winnerStats[0];

  // Tip 1: Lead type disadvantage
  if (loserLead && winnerLead) {
    const effectiveness = getCombinedEffectiveness(
      winnerLead.types[0] as Parameters<typeof getCombinedEffectiveness>[0],
      loserLead.types as unknown as Parameters<typeof getCombinedEffectiveness>[1]
    );
    if (effectiveness >= SUPER_EFFECTIVE_THRESHOLD) {
      tips.push({
        tipKey: 'result.tipLeadDisadvantage',
        values: {
          pokemon: loserLead.displayName,
          opponent: winnerLead.displayName,
        },
      });
    }
  }

  // Tip 2: Zero-damage Pokemon
  const zeroDamagePokemon = loserStats.find(
    (s) => s.totalDamageDealt === 0
  );
  if (zeroDamagePokemon && tips.length < 2) {
    tips.push({
      tipKey: 'result.tipNoDamage',
      values: {
        pokemon: zeroDamagePokemon.displayName,
      },
    });
  }

  // Fallback: positive tip if nothing else
  if (tips.length === 0) {
    tips.push({
      tipKey: 'result.tipWellPlayed',
      values: {},
    });
  }

  return tips;
}
