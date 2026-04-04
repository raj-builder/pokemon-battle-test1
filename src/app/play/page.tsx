'use client';

import { useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/game-store';
import { useUiStore } from '@/store/ui-store';
import TcgCard from '@/components/cards/TcgCard';
import PrivacyScreen from '@/components/handoff/PrivacyScreen';
import type { PokemonSpecies, GameMode, DrawMode } from '@/engine/types';
import { FALLBACK_POKEMON } from '@/data/pokemon-fallback';
import { SeededRandom, generateMasterSeed } from '@/engine/seeded-random';
import {
  generateMirroredPool,
  generateIndependentDraw,
  rerollIndependentSlot,
  filterPokemonPool,
} from '@/engine/mirrored-draw';
import { TEAM_SIZE } from '@/engine/constants';

/**
 * Step 1: Build Team page.
 *
 * Supports:
 * - Mode selection (2-Player Battle / Practice vs CPU)
 * - Draw mode (Independent / Mirrored)
 * - Type and Generation filters
 * - Card display with reroll
 * - 2-player handoff flow
 */
export default function BuildTeamPage() {
  const router = useRouter();
  const {
    mode,
    drawMode,
    filters,
    player1Species,
    player2Species,
    activeSetupPlayer,
    masterSeed,
    setMode,
    setDrawMode,
    setFilters,
    setPlayerSpecies,
    setActiveSetupPlayer,
    initializeMatch,
  } = useGameStore();

  const { showPrivacy } = useUiStore();

  // Initialize match seed on first load
  useEffect(() => {
    if (masterSeed === 0) {
      initializeMatch();
    }
  }, [masterSeed, initializeMatch]);

  // Generate initial hand when seed is ready
  useEffect(() => {
    if (masterSeed === 0) return;
    if (player1Species.length > 0) return; // Already has a hand

    const rng = new SeededRandom(masterSeed);
    const p1Draw = generateIndependentDraw(FALLBACK_POKEMON, filters, rng.fork(1));
    setPlayerSpecies('player1', p1Draw);

    if (mode !== 'two_player') {
      const p2Draw = generateIndependentDraw(FALLBACK_POKEMON, filters, rng.fork(2));
      setPlayerSpecies('player2', p2Draw);
    }
  }, [masterSeed, filters, mode, player1Species.length, setPlayerSpecies]);

  // Auto-regenerate hand when filters change (after initial draw)
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    if (masterSeed === 0) return;
    // Skip if this is the initial render (no previous filters)
    if (prevFiltersRef.current === filters) return;
    prevFiltersRef.current = filters;

    // Regenerate the current player's hand with new filters
    const rng = new SeededRandom(Date.now());
    const newDraw = generateIndependentDraw(FALLBACK_POKEMON, filters, rng);
    setPlayerSpecies(activeSetupPlayer, newDraw);

    if (mode !== 'two_player') {
      const p2Rng = new SeededRandom(Date.now() + 1);
      const p2Draw = generateIndependentDraw(FALLBACK_POKEMON, filters, p2Rng);
      setPlayerSpecies('player2', p2Draw);
    }
  }, [filters, masterSeed, activeSetupPlayer, mode, setPlayerSpecies]);

  // Reroll a single card
  const handleReroll = useCallback(
    (index: number) => {
      const currentSpecies =
        activeSetupPlayer === 'player1' ? player1Species : player2Species;
      const rng = new SeededRandom(Date.now()); // Fresh seed for rerolls
      const updated = rerollIndependentSlot(
        currentSpecies,
        index,
        FALLBACK_POKEMON,
        filters,
        rng
      );
      setPlayerSpecies(activeSetupPlayer, updated);
    },
    [activeSetupPlayer, player1Species, player2Species, filters, setPlayerSpecies]
  );

  // Reroll all cards
  const handleRerollAll = useCallback(() => {
    const rng = new SeededRandom(Date.now());
    const newDraw = generateIndependentDraw(FALLBACK_POKEMON, filters, rng);
    setPlayerSpecies(activeSetupPlayer, newDraw);
  }, [activeSetupPlayer, filters, setPlayerSpecies]);

  // Confirm team and proceed
  const handleConfirmTeam = useCallback(() => {
    if (mode === 'two_player' && activeSetupPlayer === 'player1') {
      // Player 1 done, switch to Player 2
      const { player2Name } = useGameStore.getState();
      setActiveSetupPlayer('player2');

      // Generate Player 2's initial hand
      const rng = new SeededRandom(Date.now());
      const p2Draw = generateIndependentDraw(FALLBACK_POKEMON, filters, rng);
      setPlayerSpecies('player2', p2Draw);

      showPrivacy(player2Name);
    } else {
      // Both players done (or CPU mode), go to arrange
      if (mode === 'two_player') {
        // Reset to player1 so the arrange page starts with P1
        setActiveSetupPlayer('player1');
      }
      router.push('/play/arrange');
    }
  }, [mode, activeSetupPlayer, filters, setActiveSetupPlayer, setPlayerSpecies, showPrivacy, router]);

  const currentSpecies =
    activeSetupPlayer === 'player1' ? player1Species : player2Species;
  const currentPlayerLabel =
    activeSetupPlayer === 'player1'
      ? useGameStore.getState().player1Name
      : useGameStore.getState().player2Name;

  // Calculate available pool size for current filters
  const poolInfo = useMemo(() => {
    const pool = filterPokemonPool(FALLBACK_POKEMON, filters);
    return {
      count: pool.length,
      isLimited: pool.length < TEAM_SIZE,
      hasFilter: filters.type !== null || filters.generation !== null,
    };
  }, [filters]);

  return (
    <div className="space-y-6">
      <PrivacyScreen />

      {/* Title */}
      <div className="text-center">
        <h2 className="font-[var(--font-display)] text-[11px] sm:text-sm text-white tracking-wider mb-1">
          BUILD YOUR TEAM
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
          {mode === 'two_player' && (
            <span className="text-[var(--color-player1)] font-semibold">
              {currentPlayerLabel}
            </span>
          )}{' '}
          — Your 5 cards. Tap the reroll button on any card to swap it.
        </p>
      </div>

      {/* Mode selectors (only visible for Player 1) */}
      {activeSetupPlayer === 'player1' && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {/* Game mode */}
          <div className="flex gap-2">
            <ModeButton
              active={mode === 'two_player'}
              onClick={() => setMode('two_player')}
              label="2-Player Battle"
            />
            <ModeButton
              active={mode === 'vs_cpu'}
              onClick={() => setMode('vs_cpu')}
              label="Practice vs CPU"
            />
          </div>

          {/* Draw mode */}
          <div className="flex gap-2">
            <ModeButton
              active={drawMode === 'independent'}
              onClick={() => setDrawMode('independent')}
              label="Independent Draw"
              small
            />
            <ModeButton
              active={drawMode === 'mirrored'}
              onClick={() => setDrawMode('mirrored')}
              label="Mirrored Draw"
              small
            />
          </div>
        </div>
      )}

      {/* Filters */}
      {activeSetupPlayer === 'player1' && (
        <div className="flex justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="type-filter"
              className="text-[10px] text-[var(--color-text-muted)] font-bold"
            >
              TYPE
            </label>
            <select
              id="type-filter"
              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md
                         text-[var(--color-text-primary)] text-[11px] py-1 px-2 outline-none
                         focus:border-[var(--color-border-focus)]"
              value={filters.type ?? ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: (e.target.value || null) as PokemonSpecies['types'][0] | null,
                })
              }
            >
              <option value="">Any Type</option>
              {[
                'normal', 'fire', 'water', 'electric', 'grass', 'ice',
                'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
                'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
              ].map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="gen-filter"
              className="text-[10px] text-[var(--color-text-muted)] font-bold"
            >
              GEN
            </label>
            <select
              id="gen-filter"
              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md
                         text-[var(--color-text-primary)] text-[11px] py-1 px-2 outline-none
                         focus:border-[var(--color-border-focus)]"
              value={filters.generation ?? ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  generation: e.target.value ? Number(e.target.value) : null,
                })
              }
            >
              <option value="">Any Gen</option>
              {[
                [1, 'Kanto'], [2, 'Johto'], [3, 'Hoenn'], [4, 'Sinnoh'],
                [5, 'Unova'], [6, 'Kalos'], [7, 'Alola'], [8, 'Galar'],
                [9, 'Paldea'],
              ].map(([num, region]) => (
                <option key={num} value={num}>
                  Gen {num} ({region})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Pool size info / limited pool warning */}
      {poolInfo.hasFilter && (
        <div className={`text-center text-xs px-4 py-2 rounded-lg mx-auto max-w-md ${
          poolInfo.isLimited
            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]'
        }`}>
          {poolInfo.isLimited ? (
            <>
              <span className="font-semibold">Limited pool:</span> Only {poolInfo.count} Pokemon match
              {filters.type ? ` ${filters.type} type` : ''}
              {filters.type && filters.generation ? ' in' : ''}
              {filters.generation ? ` Gen ${filters.generation}` : ''}.
              Some Pokemon may repeat.
            </>
          ) : (
            <>
              {poolInfo.count} Pokemon available
              {filters.type ? ` (${filters.type} type)` : ''}
              {filters.generation ? ` in Gen ${filters.generation}` : ''}
            </>
          )}
        </div>
      )}

      {/* Card hand */}
      <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-5 lg:gap-6 justify-center">
        {currentSpecies.map((species, index) => (
          <TcgCard
            key={`${species.id}-${index}`}
            pokemon={species}
            showReroll
            onReroll={() => handleReroll(index)}
          />
        ))}
      </div>

      {/* Action buttons — bottom sticky on mobile */}
      <div
        className="flex gap-3 justify-center flex-wrap sticky bottom-0
                   bg-[var(--color-bg-primary)] py-4 border-t border-[var(--color-border)]
                   sm:static sm:bg-transparent sm:border-0 sm:py-0"
      >
        <button
          onClick={handleConfirmTeam}
          disabled={currentSpecies.length < TEAM_SIZE}
          className="min-h-11 px-6 py-2.5 text-white font-bold text-sm rounded-xl transition-all
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus-visible:ring-2 focus-visible:ring-white
                     shadow-lg hover:shadow-xl hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)' }}
        >
          {mode === 'two_player' && activeSetupPlayer === 'player1'
            ? 'CONFIRM & PASS TO P2'
            : 'ARRANGE ORDER →'}
        </button>
        <button
          onClick={handleRerollAll}
          className="min-h-11 px-4 py-2.5 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]
                     text-[var(--color-text-primary)] font-semibold text-sm rounded-xl
                     border border-[var(--color-border)] transition-colors
                     focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
        >
          Reroll All 5
        </button>
      </div>
    </div>
  );
}

// ── Helper component for mode selection buttons ──

function ModeButton({
  active,
  onClick,
  label,
  small = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        min-h-11 rounded-lg font-semibold transition-colors
        focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]
        ${small ? 'px-3 py-1.5 text-[10px]' : 'px-4 py-2 text-xs'}
        ${
          active
            ? 'bg-[var(--color-player1)] text-white'
            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-border-focus)]'
        }
      `}
    >
      {label}
    </button>
  );
}
