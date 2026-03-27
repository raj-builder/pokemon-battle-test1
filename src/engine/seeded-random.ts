/**
 * Seeded pseudo-random number generator (BE-002).
 *
 * Wraps the `seedrandom` library to provide deterministic
 * random sequences from a master seed. Every call consumes
 * one step in the sequence, enabling exact replay of matches.
 *
 * No direct `Math.random()` calls should exist in battle or
 * draw logic — all randomness flows through this module.
 */
import seedrandom from 'seedrandom';

export class SeededRandom {
  private rng: seedrandom.PRNG;
  private _seed: number;
  private _callCount: number;

  /**
   * Create a new seeded PRNG.
   * @param seed - Numeric seed for reproducibility
   */
  constructor(seed: number) {
    this._seed = seed;
    this._callCount = 0;
    this.rng = seedrandom(seed.toString());
  }

  /** The seed this PRNG was initialized with. */
  get seed(): number {
    return this._seed;
  }

  /** Number of random values consumed so far. */
  get callCount(): number {
    return this._callCount;
  }

  /**
   * Generate a random float in [0, 1).
   * Each call advances the PRNG by one step.
   */
  next(): number {
    this._callCount++;
    return this.rng();
  }

  /**
   * Generate a random integer in [min, max] (inclusive).
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate a random float in [min, max).
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /**
   * Return true with the given probability.
   * @param chance - Probability in [0, 1]
   */
  chance(chance: number): boolean {
    return this.next() < chance;
  }

  /**
   * Shuffle an array in-place using Fisher-Yates algorithm.
   * Returns the same array reference (mutated).
   * @param array - Array to shuffle
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  /**
   * Pick a random element from an array.
   * @param array - Non-empty array to pick from
   * @throws Error if array is empty
   */
  pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from an empty array');
    }
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Pick N unique random elements from an array.
   * @param array - Array to pick from
   * @param count - Number of elements to pick
   * @throws Error if count exceeds array length
   */
  pickN<T>(array: readonly T[], count: number): T[] {
    if (count > array.length) {
      throw new Error(
        `Cannot pick ${count} elements from array of length ${array.length}`
      );
    }
    const copy = [...array];
    this.shuffle(copy);
    return copy.slice(0, count);
  }

  /**
   * Create a child PRNG with a derived seed.
   * Useful for isolating randomness in subsystems
   * (e.g., draw vs battle) while keeping determinism.
   * @param salt - Additional value mixed into the seed
   */
  fork(salt: number): SeededRandom {
    const derivedSeed = Math.floor(this.next() * 2147483647) ^ salt;
    return new SeededRandom(derivedSeed);
  }
}

/**
 * Generate a master seed for a new match.
 * Uses crypto.getRandomValues for high-quality entropy.
 * This is the only place non-deterministic randomness is used.
 */
export function generateMasterSeed(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0];
  }
  // Fallback for environments without crypto
  return Math.floor(Math.random() * 2147483647);
}
