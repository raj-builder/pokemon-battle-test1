/**
 * PokeAPI data fetcher service.
 *
 * CLAUDE.md Section 6: "Pull once, cache, serve many."
 * This service fetches from PokeAPI, normalizes the response
 * into PokemonSpecies format, and stores it in the cache.
 *
 * App code should never call this directly — use the cache
 * service instead, which falls back to this fetcher on cache miss.
 */

import type { PokemonSpecies, PokemonType, PokemonBaseStats } from '@/engine/types';
import {
  POKEAPI_BASE_URL,
  API_FETCH_TIMEOUT_MS,
  API_QUICK_CHECK_TIMEOUT_MS,
  GENERATION_RANGES,
} from '@/engine/constants';

/**
 * Check if PokeAPI is reachable.
 * Uses a quick timeout to avoid blocking the UI.
 */
export async function checkApiConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      API_QUICK_CHECK_TIMEOUT_MS
    );

    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/1`, {
      signal: controller.signal,
      method: 'HEAD',
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Determine the generation of a Pokemon by its National Dex ID.
 */
function getGeneration(id: number): number {
  for (const [gen, [start, end]] of Object.entries(GENERATION_RANGES)) {
    if (id >= start && id <= end) return Number(gen);
  }
  return 1; // fallback
}

/**
 * Normalize a raw PokeAPI response into a PokemonSpecies object.
 */
function normalizeApiResponse(data: Record<string, unknown>): PokemonSpecies {
  const id = data.id as number;
  const name = data.name as string;

  // Extract types
  const typesRaw = data.types as Array<{ type: { name: string } }>;
  const types = typesRaw.map((t) => t.type.name as PokemonType) as [
    PokemonType,
    ...PokemonType[]
  ];

  // Extract stats
  const statsRaw = data.stats as Array<{
    stat: { name: string };
    base_stat: number;
  }>;
  const statsMap: Record<string, number> = {};
  for (const s of statsRaw) {
    statsMap[s.stat.name] = s.base_stat;
  }

  const baseStats: PokemonBaseStats = {
    hp: statsMap['hp'] ?? 50,
    attack: statsMap['attack'] ?? 50,
    defense: statsMap['defense'] ?? 50,
    specialAttack: statsMap['special-attack'] ?? 50,
    specialDefense: statsMap['special-defense'] ?? 50,
    speed: statsMap['speed'] ?? 50,
  };

  // Extract moves (pick first 4 available)
  const movesRaw = data.moves as Array<{ move: { name: string } }>;
  const moveIds = movesRaw
    .slice(0, 20)
    .map((m) => m.move.name)
    .slice(0, 4);

  // Sprite URL
  const sprites = data.sprites as Record<string, unknown>;
  const spriteUrl =
    (sprites?.front_default as string) ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  return {
    id,
    slug: name,
    nameKey: `pokemon.${name}`,
    types,
    baseStats,
    moveIds,
    spriteUrl,
    generation: getGeneration(id),
  };
}

/**
 * Fetch a single Pokemon from PokeAPI by ID.
 *
 * @param id - National Dex ID
 * @returns Normalized PokemonSpecies or null on failure
 */
export async function fetchPokemonById(
  id: number
): Promise<PokemonSpecies | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      API_FETCH_TIMEOUT_MS
    );

    const response = await fetch(`${POKEAPI_BASE_URL}/pokemon/${id}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    return normalizeApiResponse(data);
  } catch {
    return null;
  }
}

/**
 * Fetch multiple Pokemon from PokeAPI by IDs.
 *
 * Fetches in parallel with a concurrency limit to avoid
 * overwhelming the API (fair use).
 *
 * @param ids - Array of National Dex IDs
 * @param onProgress - Optional callback for progress tracking
 * @returns Array of successfully fetched PokemonSpecies
 */
export async function fetchPokemonBatch(
  ids: number[],
  onProgress?: (current: number, total: number) => void
): Promise<PokemonSpecies[]> {
  const results: PokemonSpecies[] = [];
  const concurrency = 5; // Max parallel requests (fair use)

  for (let i = 0; i < ids.length; i += concurrency) {
    const batch = ids.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((id) => fetchPokemonById(id))
    );

    for (const result of batchResults) {
      if (result) results.push(result);
    }

    onProgress?.(Math.min(i + concurrency, ids.length), ids.length);
  }

  return results;
}
