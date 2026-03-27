/**
 * Mirrored-draw logic for the match engine (BE-003).
 *
 * In mirrored-draw mode, both players receive the same Pokemon
 * pool (or equivalent starting choices). This reduces luck bias
 * and better showcases tactical skill in sequencing and move choices.
 *
 * The pool is generated deterministically from a seed, so the
 * same seed + filters always produce the same pool.
 */

import type { PokemonSpecies, PoolFilters } from './types';
import type { SeededRandom } from './seeded-random';
import { MIRRORED_DRAW_POOL_SIZE, TEAM_SIZE } from './constants';

/**
 * Filter a master Pokemon list by type and generation.
 *
 * @param allPokemon - The full available Pokemon list
 * @param filters - Type and generation filters (null = no filter)
 * @returns Filtered array of Pokemon species
 */
export function filterPokemonPool(
  allPokemon: readonly PokemonSpecies[],
  filters: PoolFilters
): PokemonSpecies[] {
  let pool = [...allPokemon];

  if (filters.type) {
    pool = pool.filter((p) => p.types.includes(filters.type!));
  }

  if (filters.generation) {
    pool = pool.filter((p) => p.generation === filters.generation);
  }

  return pool;
}

/**
 * Generate a shared mirrored-draw pool.
 *
 * Both players receive the same pool of Pokemon to choose from.
 * Each player independently selects their team of TEAM_SIZE
 * from this shared pool. Duplicates are allowed (both players
 * can pick the same Pokemon).
 *
 * @param allPokemon - The full available Pokemon list (from cache/fallback)
 * @param filters - Type and generation filters
 * @param rng - Seeded PRNG for deterministic pool generation
 * @param poolSize - Number of Pokemon in the shared pool (default: MIRRORED_DRAW_POOL_SIZE)
 * @returns Array of PokemonSpecies available to both players
 * @throws Error if filtered pool is smaller than requested poolSize
 */
export function generateMirroredPool(
  allPokemon: readonly PokemonSpecies[],
  filters: PoolFilters,
  rng: SeededRandom,
  poolSize: number = MIRRORED_DRAW_POOL_SIZE
): PokemonSpecies[] {
  const filteredPool = filterPokemonPool(allPokemon, filters);

  if (filteredPool.length < poolSize) {
    // If filtered pool is too small, use whatever we have
    // but ensure we have at least TEAM_SIZE
    if (filteredPool.length < TEAM_SIZE) {
      throw new Error(
        `Filtered pool has only ${filteredPool.length} Pokemon, but ${TEAM_SIZE} are required. Try broader filters.`
      );
    }
    return rng.shuffle([...filteredPool]);
  }

  return rng.pickN(filteredPool, poolSize);
}

/**
 * Generate an independent draw for one player.
 *
 * In independent draw mode, each player draws their own team
 * independently from the full filtered pool.
 *
 * @param allPokemon - The full available Pokemon list
 * @param filters - Type and generation filters
 * @param rng - Seeded PRNG (should be a fork for each player)
 * @param teamSize - Number of Pokemon to draw (default: TEAM_SIZE)
 * @returns Array of PokemonSpecies for one player's initial hand
 */
export function generateIndependentDraw(
  allPokemon: readonly PokemonSpecies[],
  filters: PoolFilters,
  rng: SeededRandom,
  teamSize: number = TEAM_SIZE
): PokemonSpecies[] {
  const filteredPool = filterPokemonPool(allPokemon, filters);

  if (filteredPool.length === 0) {
    throw new Error(
      'No Pokemon match the selected filters. Try broader filters.'
    );
  }

  // Enough unique Pokemon — pick without duplicates
  if (filteredPool.length >= teamSize) {
    return rng.pickN(filteredPool, teamSize);
  }

  // Pool smaller than team size — use all unique first, then pad randomly
  // This avoids unnecessary duplicates when pool is small
  const team: PokemonSpecies[] = rng.shuffle([...filteredPool]);
  while (team.length < teamSize) {
    team.push(rng.pick(filteredPool));
  }
  return team;
}

/**
 * Reroll a single slot in the mirrored pool.
 *
 * In mirrored mode, rerolling replaces one Pokemon with another
 * from the available pool. Both players see the same replacement
 * (mirrored rerolls use the same RNG sequence).
 *
 * @param currentPool - Current mirrored pool
 * @param slotIndex - Index of the slot to reroll
 * @param allPokemon - Full available Pokemon list
 * @param filters - Active filters
 * @param rng - Seeded PRNG
 * @returns Updated pool with the slot replaced
 */
export function rerollMirroredSlot(
  currentPool: readonly PokemonSpecies[],
  slotIndex: number,
  allPokemon: readonly PokemonSpecies[],
  filters: PoolFilters,
  rng: SeededRandom
): PokemonSpecies[] {
  const filteredPool = filterPokemonPool(allPokemon, filters);
  const currentIds = new Set(currentPool.map((p) => p.id));

  // Find candidates not already in the pool
  let candidates = filteredPool.filter((p) => !currentIds.has(p.id));
  if (candidates.length === 0) {
    // All candidates exhausted, allow duplicates
    candidates = filteredPool;
  }

  const replacement = rng.pick(candidates);
  const newPool = [...currentPool];
  newPool[slotIndex] = replacement;
  return newPool;
}

/**
 * Reroll a single slot in an independent draw.
 *
 * @param currentTeam - Current team
 * @param slotIndex - Index to reroll
 * @param allPokemon - Full available Pokemon list
 * @param filters - Active filters
 * @param rng - Seeded PRNG
 * @returns Updated team with the slot replaced
 */
export function rerollIndependentSlot(
  currentTeam: readonly PokemonSpecies[],
  slotIndex: number,
  allPokemon: readonly PokemonSpecies[],
  filters: PoolFilters,
  rng: SeededRandom
): PokemonSpecies[] {
  const filteredPool = filterPokemonPool(allPokemon, filters);
  const currentIds = new Set(currentTeam.map((p) => p.id));

  let candidates = filteredPool.filter((p) => !currentIds.has(p.id));
  if (candidates.length === 0) {
    candidates = filteredPool;
  }

  const replacement = rng.pick(candidates);
  const newTeam = [...currentTeam];
  newTeam[slotIndex] = replacement;
  return newTeam;
}
