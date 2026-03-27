'use client';

import { useUiStore } from '@/store/ui-store';

/**
 * Privacy handoff screen for 2-player mode on one device (UX-003).
 *
 * Shown between player turns during setup and battle.
 * Full-screen overlay prevents peeking at the other player's team.
 */
export default function PrivacyScreen() {
  const { showPrivacyScreen, privacyScreenPlayerName, hidePrivacy } =
    useUiStore();

  if (!showPrivacyScreen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center
                 bg-[var(--color-bg-primary)] text-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Pass device to ${privacyScreenPlayerName}`}
    >
      {/* Shield icon */}
      <div className="text-6xl mb-6" aria-hidden="true">
        🛡️
      </div>

      {/* Instruction */}
      <h2 className="font-[var(--font-display)] text-sm sm:text-base text-white mb-4 leading-relaxed">
        Pass the device to
      </h2>
      <p className="font-[var(--font-display)] text-lg sm:text-xl text-[var(--color-player1)] mb-8">
        {privacyScreenPlayerName}
      </p>
      <p className="text-sm text-[var(--color-text-muted)] mb-10">
        Don&apos;t peek at the other player&apos;s team!
      </p>

      {/* Ready button */}
      <button
        onClick={hidePrivacy}
        className="min-h-11 min-w-[200px] px-8 py-3
                   bg-[var(--color-player1)] hover:bg-blue-500
                   text-white font-bold text-sm rounded-xl
                   transition-colors focus-visible:ring-2 focus-visible:ring-white"
        autoFocus
      >
        I&apos;m ready — show my cards
      </button>
    </div>
  );
}
