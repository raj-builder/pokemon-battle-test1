/**
 * Rules engine versioning (BE-011).
 *
 * Every match is tagged with a rules version so that old
 * replays remain interpretable when battle formulas change.
 * This module provides version checking and compatibility.
 */

import { RULES_ENGINE_VERSION } from './constants';

/**
 * Get the current rules engine version.
 * Stamped on every new match.
 */
export function getCurrentRulesVersion(): string {
  return RULES_ENGINE_VERSION;
}

/**
 * Check if a rules version is compatible with the current engine.
 *
 * Compatibility follows semver:
 * - Same MAJOR version = compatible (minor/patch changes are backwards-compatible)
 * - Different MAJOR version = incompatible
 *
 * @param version - Rules version from a stored match
 * @returns true if the match can be replayed with the current engine
 */
export function isCompatibleVersion(version: string): boolean {
  const currentMajor = RULES_ENGINE_VERSION.split('.')[0];
  const matchMajor = version.split('.')[0];
  return currentMajor === matchMajor;
}

/**
 * Parse a rules version string into components.
 */
export function parseVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
} {
  const parts = version.split('.').map(Number);
  return {
    major: parts[0] ?? 0,
    minor: parts[1] ?? 0,
    patch: parts[2] ?? 0,
  };
}
