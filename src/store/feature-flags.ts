/**
 * Runtime feature flags.
 *
 * CLAUDE.md Section 2: "Feature flags over big-bang releases."
 * Wrap new behavior in a flag so it can be turned off instantly.
 *
 * Flags are stored in localStorage for persistence.
 * Defaults come from DEFAULT_FEATURE_FLAGS in constants.
 */
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_FEATURE_FLAGS } from '@/engine/constants';

type FeatureFlags = typeof DEFAULT_FEATURE_FLAGS;

interface FeatureFlagStore {
  flags: FeatureFlags;
  setFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => void;
  resetFlags: () => void;
  isEnabled: (key: keyof FeatureFlags) => boolean;
}

export const useFeatureFlags = create<FeatureFlagStore>()(
  persist(
    (set, get) => ({
      flags: { ...DEFAULT_FEATURE_FLAGS },

      setFlag: (key, value) =>
        set((state) => ({
          flags: { ...state.flags, [key]: value },
        })),

      resetFlags: () => set({ flags: { ...DEFAULT_FEATURE_FLAGS } }),

      isEnabled: (key) => get().flags[key],
    }),
    {
      name: 'pokemon-battle-feature-flags',
    }
  )
);
