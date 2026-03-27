/**
 * UI state management with Zustand.
 *
 * Manages transient UI state that doesn't need persistence:
 * - Simulation speed and pause state
 * - Privacy screen visibility
 * - Overlay visibility
 * - Loading states
 */
'use client';

import { create } from 'zustand';

interface UiStoreState {
  // Simulation controls
  simSpeed: number; // 1-5, maps to SIM_SPEED_PRESETS
  simPaused: boolean;
  simAbort: boolean;

  // Privacy handoff
  showPrivacyScreen: boolean;
  privacyScreenPlayerName: string;

  // Overlays
  showShareOverlay: boolean;
  showResultOverlay: boolean;
  showOnboarding: boolean;
  showForfeitConfirm: boolean;

  // Loading
  isLoadingPokemon: boolean;
  loadingProgress: { current: number; total: number } | null;

  // Battle log auto-scroll
  battleLogAutoScroll: boolean;
}

interface UiStoreActions {
  setSimSpeed: (speed: number) => void;
  setSimPaused: (paused: boolean) => void;
  setSimAbort: (abort: boolean) => void;

  showPrivacy: (playerName: string) => void;
  hidePrivacy: () => void;

  setShowShareOverlay: (show: boolean) => void;
  setShowResultOverlay: (show: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setShowForfeitConfirm: (show: boolean) => void;

  setLoadingPokemon: (loading: boolean) => void;
  setLoadingProgress: (progress: { current: number; total: number } | null) => void;

  setBattleLogAutoScroll: (auto: boolean) => void;

  resetUi: () => void;
}

type UiStore = UiStoreState & UiStoreActions;

const DEFAULT_STATE: UiStoreState = {
  simSpeed: 2,
  simPaused: false,
  simAbort: false,
  showPrivacyScreen: false,
  privacyScreenPlayerName: '',
  showShareOverlay: false,
  showResultOverlay: false,
  showOnboarding: false,
  showForfeitConfirm: false,
  isLoadingPokemon: false,
  loadingProgress: null,
  battleLogAutoScroll: true,
};

export const useUiStore = create<UiStore>()((set) => ({
  ...DEFAULT_STATE,

  setSimSpeed: (speed) => set({ simSpeed: Math.max(1, Math.min(5, speed)) }),
  setSimPaused: (paused) => set({ simPaused: paused }),
  setSimAbort: (abort) => set({ simAbort: abort }),

  showPrivacy: (playerName) =>
    set({ showPrivacyScreen: true, privacyScreenPlayerName: playerName }),
  hidePrivacy: () =>
    set({ showPrivacyScreen: false, privacyScreenPlayerName: '' }),

  setShowShareOverlay: (show) => set({ showShareOverlay: show }),
  setShowResultOverlay: (show) => set({ showResultOverlay: show }),
  setShowOnboarding: (show) => set({ showOnboarding: show }),
  setShowForfeitConfirm: (show) => set({ showForfeitConfirm: show }),

  setLoadingPokemon: (loading) => set({ isLoadingPokemon: loading }),
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),

  setBattleLogAutoScroll: (auto) => set({ battleLogAutoScroll: auto }),

  resetUi: () => set(DEFAULT_STATE),
}));
