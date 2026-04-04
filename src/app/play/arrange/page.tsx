'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/game-store';
import { useUiStore } from '@/store/ui-store';
import PrivacyScreen from '@/components/handoff/PrivacyScreen';
import type { PokemonSpecies, BattlePokemon, Move } from '@/engine/types';
import { TYPE_COLORS } from '@/data/type-colors';
import { MOVE_CATALOG, getMovesForPokemon } from '@/data/move-catalog';
import { TEAM_SIZE, SIM_SPEED_PRESETS } from '@/engine/constants';

/**
 * Step 2: Arrange Order page.
 *
 * Players drag (or tap arrows on mobile) to set their battle order.
 * First Pokemon in the list fights first.
 *
 * In 2-player mode, Player 1 arranges, then passes to Player 2.
 */
export default function ArrangePage() {
  const router = useRouter();
  const {
    mode,
    player1Species,
    player2Species,
    activeSetupPlayer,
    setPlayerSpecies,
    setActiveSetupPlayer,
    startBattle,
  } = useGameStore();

  const { simSpeed, setSimSpeed, showPrivacy } = useUiStore();

  const [battleMode, setBattleMode] = useState<'user' | 'ai'>('user');

  const currentSpecies =
    activeSetupPlayer === 'player1' ? player1Species : player2Species;
  const currentPlayerLabel =
    activeSetupPlayer === 'player1'
      ? useGameStore.getState().player1Name
      : useGameStore.getState().player2Name;

  // Move item up in the order
  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return;
      const arr = [...currentSpecies];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      setPlayerSpecies(activeSetupPlayer, arr);
    },
    [currentSpecies, activeSetupPlayer, setPlayerSpecies]
  );

  // Move item down in the order
  const moveDown = useCallback(
    (index: number) => {
      if (index >= currentSpecies.length - 1) return;
      const arr = [...currentSpecies];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      setPlayerSpecies(activeSetupPlayer, arr);
    },
    [currentSpecies, activeSetupPlayer, setPlayerSpecies]
  );

  // Convert species to BattlePokemon
  const speciesToBattlePokemon = (species: PokemonSpecies): BattlePokemon => {
    const moves = getMovesForPokemon(species.moveIds);
    return {
      species,
      moves,
      currentHp: species.baseStats.hp,
      maxHp: species.baseStats.hp,
    };
  };

  // Start the battle
  const handleStartBattle = useCallback(() => {
    if (mode === 'two_player' && activeSetupPlayer === 'player1') {
      // Player 1 done arranging, switch to Player 2
      const { player2Name } = useGameStore.getState();
      setActiveSetupPlayer('player2');
      showPrivacy(player2Name);
      return;
    }

    // Both players done — build battle teams
    const p1Team = player1Species.map(speciesToBattlePokemon);
    const p2Team = player2Species.map(speciesToBattlePokemon);

    // Update game mode in store
    if (battleMode === 'ai') {
      useGameStore.getState().setMode('ai_simulation');
    }

    startBattle(p1Team, p2Team);
    router.push('/play/battle');
  }, [
    mode,
    activeSetupPlayer,
    player1Species,
    player2Species,
    battleMode,
    setActiveSetupPlayer,
    showPrivacy,
    startBattle,
    router,
  ]);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <PrivacyScreen />

      {/* Title */}
      <div className="text-center">
        <h2 className="font-[var(--font-display)] text-[11px] sm:text-sm text-white tracking-wider mb-1">
          ARRANGE ORDER
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
          {mode === 'two_player' && (
            <span className="text-[var(--color-player1)] font-semibold">
              {currentPlayerLabel}
            </span>
          )}{' '}
          — Drag to set battle order. First Pokemon fights first.
        </p>
      </div>

      {/* Arrange list */}
      <div className="space-y-2">
        {currentSpecies.map((species, index) => (
          <div
            key={`${species.id}-${index}`}
            className="flex items-center gap-2 bg-[var(--color-bg-secondary)] rounded-xl
                       border border-[var(--color-border)] p-3 transition-colors"
          >
            {/* Position number */}
            <span className="text-[var(--color-text-dim)] font-bold text-sm w-6 text-center">
              {index + 1}
            </span>

            {/* Sprite */}
            <img
              src={species.spriteUrl}
              alt={`${species.slug} sprite`}
              className="w-10 h-10"
              style={{ imageRendering: 'pixelated' }}
              loading="lazy"
            />

            {/* Name and types */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm capitalize text-white truncate">
                {species.slug.replace(/-/g, ' ')}
              </div>
              <div className="flex gap-1 mt-0.5">
                {species.types.map((type) => (
                  <span
                    key={type}
                    className="type-badge text-[8px]"
                    style={{
                      background: TYPE_COLORS[type].bg,
                      color: TYPE_COLORS[type].text,
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* HP */}
            <span className="text-xs text-[var(--color-text-dim)] font-bold">
              HP {species.baseStats.hp}
            </span>

            {/* Reorder buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center
                           text-[var(--color-text-muted)] hover:text-white
                           disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors"
                aria-label={`Move ${species.slug} up`}
              >
                ▲
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === currentSpecies.length - 1}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center
                           text-[var(--color-text-muted)] hover:text-white
                           disabled:opacity-30 disabled:cursor-not-allowed
                           transition-colors"
                aria-label={`Move ${species.slug} down`}
              >
                ▼
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Battle mode selector */}
      {(mode === 'vs_cpu' || (mode === 'two_player' && activeSetupPlayer === 'player2')) && (
        <div className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-xl p-4">
          <div className="text-[11px] font-bold text-[var(--color-text-muted)] tracking-wider text-center mb-3">
            BATTLE MODE
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setBattleMode('user')}
              className={`min-h-11 px-4 py-2 rounded-lg font-semibold text-xs transition-colors
                ${
                  battleMode === 'user'
                    ? 'bg-[var(--color-player1)] text-white'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                }`}
            >
              🎮 You Control
            </button>
            <button
              onClick={() => setBattleMode('ai')}
              className={`min-h-11 px-4 py-2 rounded-lg font-semibold text-xs transition-colors
                ${
                  battleMode === 'ai'
                    ? 'bg-[var(--color-player1)] text-white'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                }`}
            >
              🤖 AI Simulation
            </button>
          </div>

          {/* Speed slider for AI mode */}
          {battleMode === 'ai' && (
            <div className="flex items-center gap-3 mt-3 justify-center">
              <span className="text-xs text-[var(--color-text-muted)]">Speed</span>
              <input
                type="range"
                min={1}
                max={5}
                value={simSpeed}
                onChange={(e) => setSimSpeed(Number(e.target.value))}
                className="w-24"
                aria-label="Simulation speed"
              />
              <span className="text-xs text-[var(--color-text-secondary)] w-16">
                {SIM_SPEED_PRESETS[simSpeed]?.labelKey.split('.').pop() ?? 'Normal'}
              </span>
            </div>
          )}

          <p className="text-center text-[11px] text-[var(--color-text-dim)] mt-2">
            {battleMode === 'user'
              ? 'Pick your moves each turn and battle.'
              : 'Sit back and watch — AI controls both sides.'}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div
        className="flex gap-3 justify-center flex-wrap sticky bottom-0
                   bg-[var(--color-bg-primary)] py-4 border-t border-[var(--color-border)]
                   sm:static sm:bg-transparent sm:border-0 sm:py-0"
      >
        <button
          onClick={handleStartBattle}
          className="min-h-11 px-6 py-2.5 bg-[var(--color-player1)] hover:bg-blue-500
                     text-white font-bold text-sm rounded-xl transition-colors
                     focus-visible:ring-2 focus-visible:ring-white"
        >
          {mode === 'two_player' && activeSetupPlayer === 'player1'
            ? 'CONFIRM & PASS TO P2'
            : 'START BATTLE'}
        </button>
        <button
          onClick={() => router.push('/play')}
          className="min-h-11 px-4 py-2.5 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]
                     text-[var(--color-text-primary)] font-semibold text-sm rounded-xl
                     border border-[var(--color-border)] transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
