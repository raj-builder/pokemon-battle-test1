'use client';

import { useGameStore } from '@/store/game-store';
import { PLAYER_NAME_MAX_LENGTH } from '@/engine/constants';
import { sanitizePlayerName } from '@/engine/validators';

export default function Header() {
  const {
    player1Name,
    player2Name,
    setPlayerName,
    scores,
    mode,
  } = useGameStore();

  const handleNameChange = (
    player: 'player1' | 'player2',
    value: string
  ) => {
    const sanitized = sanitizePlayerName(value);
    setPlayerName(player, sanitized);
  };

  return (
    <header className="text-center py-6 px-5" role="banner">
      {/* Title */}
      <h1
        className="font-[var(--font-display)] text-xl sm:text-2xl text-white tracking-[4px] mb-1"
        style={{
          textShadow: '3px 3px 0 #1a237e, 0 0 30px rgba(100,120,255,.5)',
        }}
      >
        POKEMON BATTLE
      </h1>
      <p className="text-xs text-[var(--color-text-muted)] tracking-wider mb-4">
        5v5 Team Battle
      </p>

      {/* Player names and scores */}
      <div className="flex items-center justify-center gap-4 sm:gap-5 flex-wrap">
        {/* Player 1 name input */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="player1-name"
            className="text-[11px] text-[var(--color-text-muted)] font-bold tracking-wider"
          >
            {mode === 'two_player' ? 'P1' : 'TRAINER'}
          </label>
          <input
            id="player1-name"
            className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-white
                       font-[var(--font-display)] text-[10px] py-1.5 px-2.5 w-[120px] sm:w-[140px]
                       outline-none focus:border-[var(--color-border-focus)]"
            value={player1Name}
            maxLength={PLAYER_NAME_MAX_LENGTH}
            placeholder="Player 1"
            onChange={(e) => handleNameChange('player1', e.target.value)}
            aria-label="Player 1 name"
          />
        </div>

        {/* Score display */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-[10px] font-bold tracking-[2px] mb-0.5 text-[var(--color-player1)]">
              {player1Name.slice(0, 8).toUpperCase()}
            </div>
            <div className="font-[var(--font-display)] text-base text-white">
              {scores.player1Wins}
            </div>
          </div>
          <div className="text-[var(--color-text-dim)] text-xl">|</div>
          <div className="text-center">
            <div className="text-[10px] font-bold tracking-[2px] mb-0.5 text-[var(--color-player2)]">
              {mode === 'two_player'
                ? player2Name.slice(0, 8).toUpperCase()
                : 'CPU'}
            </div>
            <div className="font-[var(--font-display)] text-base text-white">
              {scores.player2Wins}
            </div>
          </div>
        </div>

        {/* Player 2 name input (only in 2-player mode) */}
        {mode === 'two_player' && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="player2-name"
              className="text-[11px] text-[var(--color-text-muted)] font-bold tracking-wider"
            >
              P2
            </label>
            <input
              id="player2-name"
              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md text-white
                         font-[var(--font-display)] text-[10px] py-1.5 px-2.5 w-[120px] sm:w-[140px]
                         outline-none focus:border-[var(--color-border-focus)]"
              value={player2Name}
              maxLength={PLAYER_NAME_MAX_LENGTH}
              placeholder="Player 2"
              onChange={(e) => handleNameChange('player2', e.target.value)}
              aria-label="Player 2 name"
            />
          </div>
        )}
      </div>
    </header>
  );
}
