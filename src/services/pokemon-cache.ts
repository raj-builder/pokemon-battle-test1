/**
 * Pokemon data cache service.
 *
 * CLAUDE.md Section 6.2: Cached data includes fetchedAt, sourceUrl,
 * dataHash, and ttlSeconds. App code queries this cache, never the
 * external API directly.
 *
 * Uses localStorage as the cache backend (IndexedDB would be better
 * for large datasets but adds complexity for v1).
 *
 * If cache is stale or missing, shows last known data and queues
 * a refresh — does not block the user.
 */

import type { PokemonSpecies } from '@/engine/types';
import { POKEMON_CACHE_TTL_SECONDS } from '@/engine/constants';

const CACHE_KEY = 'pokemon-battle-cache';

interface CacheEntry {
  species: PokemonSpecies;
  fetchedAt: string;
  ttlSeconds: number;
}

interface CacheStore {
  entries: Record<number, CacheEntry>;
  lastUpdated: string;
}

/**
 * Get the cache from localStorage.
 */
function getCache(): CacheStore {
  if (typeof window === 'undefined') {
    return { entries: {}, lastUpdated: '' };
  }
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return { entries: {}, lastUpdated: '' };
    return JSON.parse(raw) as CacheStore;
  } catch {
    return { entries: {}, lastUpdated: '' };
  }
}

/**
 * Save the cache to localStorage.
 */
function saveCache(cache: CacheStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/**
 * Check if a cache entry is still fresh.
 */
function isFresh(entry: CacheEntry): boolean {
  const fetchedAt = new Date(entry.fetchedAt).getTime();
  const now = Date.now();
  const ageSeconds = (now - fetchedAt) / 1000;
  return ageSeconds < entry.ttlSeconds;
}

/**
 * Get a cached Pokemon by ID.
 * Returns null if not cached.
 */
export function getCachedPokemon(id: number): PokemonSpecies | null {
  const cache = getCache();
  const entry = cache.entries[id];
  if (!entry) return null;
  return entry.species;
}

/**
 * Get all cached Pokemon.
 * Returns whatever is in cache, regardless of freshness.
 * Freshness is used to decide whether to trigger a background refresh.
 */
export function getAllCachedPokemon(): PokemonSpecies[] {
  const cache = getCache();
  return Object.values(cache.entries).map((e) => e.species);
}

/**
 * Check if the cache needs a refresh.
 * Returns true if any entries are stale or cache is empty.
 */
export function isCacheStale(): boolean {
  const cache = getCache();
  const entries = Object.values(cache.entries);
  if (entries.length === 0) return true;
  return entries.some((e) => !isFresh(e));
}

/**
 * Store Pokemon data in the cache.
 */
export function cachePokemon(species: PokemonSpecies[]): void {
  const cache = getCache();
  const now = new Date().toISOString();

  for (const s of species) {
    cache.entries[s.id] = {
      species: s,
      fetchedAt: now,
      ttlSeconds: POKEMON_CACHE_TTL_SECONDS,
    };
  }

  cache.lastUpdated = now;
  saveCache(cache);
}

/**
 * Get the timestamp of the last cache update.
 * Returns null if cache has never been populated.
 */
export function getLastCacheUpdate(): string | null {
  const cache = getCache();
  return cache.lastUpdated || null;
}

/**
 * Clear the entire cache.
 */
export function clearCache(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CACHE_KEY);
}
