'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/game-store';
import { useUiStore } from '@/store/ui-store';
import PrivacyScreen from '@/components/handoff/PrivacyScreen';
import { TYPE_COLORS } from '@/data/type-colors';
import { getActivePokemon, getRemainingCount } from '@/engine/battle-engine';
import { selectAiMove } from '@/engine/ai-strategy';
import { SeededRandom } from '@/engine/seeded-random';
import { SIM_SPEED_PRESETS } from '@/engine/constants';
import type { BattleAction, BattleEvent, BattlePokemon } from '@/engine/types';

/**
 * Step 3: Battle page.
 *
 * Displays:
 * - Team strips (HP bars for all Pokemon)
 * - Dual battle panels (active Pokemon for each side)
 * - Move buttons for the active player
 * - Battle log
 * - Result overlay on completion
 *
 * Supports manual play, AI simulation, and 2-player handoff.
 */
export default function BattlePage() {
  const router = useRouter();
  const { battleState, submitActions, mode, player1Name, player2Name, resetGame } =
    useGameStore();
  const {
    simSpeed,
    simPaused,
    simAbort,
    setSimPaused,
    setSimAbort,
    setShowForfeitConfirm,
    showForfeitConfirm,
    showPrivacy,
  } = useUiStore();

  const logRef = useRef<HTMLDivElement>(null);
  const pendingP1ActionRef = useRef<BattleAction | null>(null);
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState<'player1' | 'player2'>('player1');

  // Auto-scroll battle log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battleState?.eventLog.length]);

  // AI simulation loop
  useEffect(() => {
    if (!battleState || battleState.phase === 'finished') return;
    if (mode !== 'ai_simulation') return;
    if (simPaused || simAbort) return;

    const delay = SIM_SPEED_PRESETS[simSpeed]?.delayMs ?? 700;
    const rng = new SeededRandom(Date.now());

    const timer = setTimeout(() => {
      const p1Pokemon = getActivePokemon(battleState.player1);
      const p2Pokemon = getActivePokemon(battleState.player2);

      const action1 = selectAiMove(p1Pokemon, p2Pokemon, 'player1', rng, 'standard');
      const action2 = selectAiMove(p2Pokemon, p1Pokemon, 'player2', rng, 'standard');

      submitActions(action1, action2);
    }, delay);

    return () => clearTimeout(timer);
  }, [battleState, mode, simSpeed, simPaused, simAbort, submitActions]);

  // Handle manual move selection
  const handleMoveSelect = useCallback(
    (moveIndex: number) => {
      if (!battleState || battleState.phase !== 'awaiting_action') return;

      const playerAction: BattleAction = {
        playerId: currentTurnPlayer,
        type: 'use_move',
        moveIndex,
      };

      if (mode === 'two_player') {
        if (currentTurnPlayer === 'player1') {
          // Store P1 action and switch to P2
          setCurrentTurnPlayer('player2');
          showPrivacy(player2Name);
          // Store the action temporarily
          pendingP1ActionRef.current = playerAction;
          return;
        } else {
          // P2 selected, resolve round with both actions
          const p1Action = pendingP1ActionRef.current;
          if (!p1Action) return;
          submitActions(p1Action, playerAction);
          pendingP1ActionRef.current = null;
          setCurrentTurnPlayer('player1');
          // Show privacy screen for next round (unless battle just ended via store update)
          showPrivacy(player1Name);
          return;
        }
      }

      // vs CPU mode: player picks, CPU auto-picks
      if (mode === 'vs_cpu') {
        const cpuPokemon = getActivePokemon(battleState.player2);
        const playerPokemon = getActivePokemon(battleState.player1);
        const rng = new SeededRandom(Date.now());
        const cpuAction = selectAiMove(
          cpuPokemon,
          playerPokemon,
          'player2',
          rng,
          'standard'
        );
        submitActions(playerAction, cpuAction);
      }
    },
    [battleState, mode, currentTurnPlayer, submitActions, showPrivacy, player1Name, player2Name]
  );

  // Handle forfeit
  const handleForfeit = useCallback(() => {
    setShowForfeitConfirm(false);
    resetGame();
    router.push('/play');
  }, [resetGame, router, setShowForfeitConfirm]);

  // Handle play again
  const handlePlayAgain = useCallback(() => {
    resetGame();
    router.push('/play');
  }, [resetGame, router]);

  // Redirect to team builder if no battle state (direct URL access or refresh)
  useEffect(() => {
    if (!battleState) {
      router.replace('/play');
    }
  }, [battleState, router]);

  if (!battleState) {
    return (
      <div className="text-center py-20 text-[var(--color-text-muted)]">
        Loading battle...
      </div>
    );
  }

  const p1Active = getActivePokemon(battleState.player1);
  const p2Active = getActivePokemon(battleState.player2);
  const isFinished = battleState.phase === 'finished';
  const activePokemon =
    currentTurnPlayer === 'player1' ? p1Active : p2Active;

  return (
    <div className="space-y-4">
      <PrivacyScreen />

      {/* Team strips */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <TeamStrip
          team={battleState.player1.team}
          label={player1Name}
          color="var(--color-player1)"
          activeIndex={battleState.player1.activePokemonIndex}
        />
        <TeamStrip
          team={battleState.player2.team}
          label={mode === 'two_player' ? player2Name : 'CPU'}
          color="var(--color-player2)"
          activeIndex={battleState.player2.activePokemonIndex}
          reverse
        />
      </div>

      {/* Dual battle panels */}
      <div className="flex flex-col md:flex-row gap-4">
        <BattlePanel
          pokemon={p1Active}
          label={player1Name}
          isPlayer
        />
        <div className="flex items-center justify-center text-2xl font-bold text-[var(--color-text-dim)]">
          VS
        </div>
        <BattlePanel
          pokemon={p2Active}
          label={mode === 'two_player' ? player2Name : 'CPU'}
          flip
        />
      </div>

      {/* Move buttons (manual mode only) */}
      {!isFinished && mode !== 'ai_simulation' && (
        <div className="bg-[var(--color-bg-tertiary)] rounded-xl p-4 border border-[var(--color-border)]">
          <div className="text-center text-[10px] text-[var(--color-text-muted)] mb-2 font-bold tracking-wider">
            {mode === 'two_player'
              ? `${currentTurnPlayer === 'player1' ? player1Name : player2Name}'S TURN`
              : 'CHOOSE YOUR MOVE'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {activePokemon.moves.map((move, idx) => (
              <button
                key={move.id}
                onClick={() => handleMoveSelect(idx)}
                className="min-h-11 px-3 py-2 rounded-lg text-left transition-all
                           border border-[var(--color-border)] hover:border-[var(--color-border-focus)]
                           bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-card)]
                           focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]"
                aria-label={`Use ${move.id.replace(/-/g, ' ')}, ${move.type} type, ${move.power} power`}
              >
                <div className="font-semibold text-xs text-white capitalize">
                  {move.id.replace(/-/g, ' ')}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="type-badge text-[7px]"
                    style={{
                      background: TYPE_COLORS[move.type].bg,
                      color: TYPE_COLORS[move.type].text,
                    }}
                  >
                    {move.type}
                  </span>
                  {move.power > 0 && (
                    <span className="text-[9px] text-[var(--color-text-dim)]">
                      PWR {move.power}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI simulation controls */}
      {mode === 'ai_simulation' && !isFinished && (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setSimPaused(!simPaused)}
            className="min-h-11 px-4 py-2 bg-[var(--color-bg-secondary)] text-white
                       rounded-lg text-xs font-semibold border border-[var(--color-border)]"
          >
            {simPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>
      )}

      {/* Battle log */}
      <div
        ref={logRef}
        className="bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)]
                   p-3 max-h-40 overflow-y-auto text-xs space-y-1"
        role="log"
        aria-label="Battle log"
        aria-live="polite"
      >
        {battleState.eventLog.map((event, idx) => (
          <BattleLogEntry key={idx} event={event} p1Name={player1Name} p2Name={player2Name} />
        ))}
      </div>

      {/* Forfeit button */}
      {!isFinished && (
        <div className="text-center">
          <button
            onClick={() => setShowForfeitConfirm(true)}
            className="min-h-11 px-4 py-2 text-red-400 hover:text-red-300
                       text-xs font-semibold transition-colors"
          >
            Forfeit Battle
          </button>
        </div>
      )}

      {/* Forfeit confirmation dialog */}
      {showForfeitConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-[var(--color-bg-card)] rounded-xl p-6 max-w-sm mx-4 border border-[var(--color-border)]">
            <h3 className="font-bold text-white mb-2">Forfeit Battle?</h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Are you sure you want to forfeit? Your opponent will be declared the winner.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleForfeit}
                className="min-h-11 flex-1 py-2 bg-red-600 hover:bg-red-700 text-white
                           rounded-lg text-sm font-semibold transition-colors"
              >
                Forfeit
              </button>
              <button
                onClick={() => setShowForfeitConfirm(false)}
                className="min-h-11 flex-1 py-2 bg-[var(--color-bg-secondary)] text-white
                           rounded-lg text-sm font-semibold border border-[var(--color-border)]
                           transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result overlay */}
      {isFinished && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="bg-[var(--color-bg-card)] rounded-2xl p-8 max-w-md mx-4
                          border border-[var(--color-border)] text-center space-y-4">
            <h2 className="font-[var(--font-display)] text-lg text-white">
              {battleState.winner === 'player1' ? player1Name : player2Name} WINS!
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              All of{' '}
              {battleState.winner === 'player1' ? (mode === 'two_player' ? player2Name : 'CPU') : player1Name}
              &apos;s Pokemon fainted.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <button
                onClick={handlePlayAgain}
                className="min-h-11 px-6 py-2.5 bg-[var(--color-player1)] hover:bg-blue-500
                           text-white font-bold text-sm rounded-xl transition-colors"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Team Strip Component ──

function TeamStrip({
  team,
  label,
  color,
  activeIndex,
  reverse = false,
}: {
  team: readonly BattlePokemon[];
  label: string;
  color: string;
  activeIndex: number;
  reverse?: boolean;
}) {
  return (
    <div className={`flex-1 ${reverse ? 'text-right' : ''}`}>
      <div
        className="text-[10px] font-bold tracking-wider mb-1"
        style={{ color }}
      >
        {label.toUpperCase()}&apos;S TEAM
      </div>
      <div className={`flex gap-1 ${reverse ? 'flex-row-reverse' : ''}`}>
        {team.map((pokemon, idx) => {
          const hpPct = (pokemon.currentHp / pokemon.maxHp) * 100;
          const isFainted = pokemon.currentHp <= 0;
          const isActive = idx === activeIndex;

          return (
            <div
              key={idx}
              className={`flex-1 rounded-md overflow-hidden ${
                isActive ? 'ring-2 ring-white' : ''
              } ${isFainted ? 'opacity-40' : ''}`}
              aria-label={`${pokemon.species.slug}: ${Math.round(hpPct)}% HP`}
            >
              <div className="h-2 bg-[var(--color-bg-secondary)]">
                <div
                  className="h-full hp-bar-fill rounded-sm"
                  style={{
                    width: `${hpPct}%`,
                    background:
                      hpPct > 50
                        ? 'var(--color-hp-high)'
                        : hpPct > 25
                          ? 'var(--color-hp-mid)'
                          : 'var(--color-hp-low)',
                  }}
                  role="progressbar"
                  aria-valuenow={pokemon.currentHp}
                  aria-valuemin={0}
                  aria-valuemax={pokemon.maxHp}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Battle Panel Component ──

function BattlePanel({
  pokemon,
  label,
  isPlayer = false,
  flip = false,
}: {
  pokemon: BattlePokemon;
  label: string;
  isPlayer?: boolean;
  flip?: boolean;
}) {
  const hpPct = Math.round((pokemon.currentHp / pokemon.maxHp) * 100);

  return (
    <div
      className={`flex-1 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] p-4
                  ${isPlayer ? 'border-l-4 border-l-[var(--color-player1)]' : 'border-r-4 border-r-[var(--color-player2)]'}`}
    >
      {/* Name and number */}
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-sm capitalize text-white">
          {pokemon.species.slug.replace(/-/g, ' ')}
        </span>
        <span className="text-[10px] text-[var(--color-text-dim)]">
          #{String(pokemon.species.id).padStart(3, '0')}
        </span>
      </div>

      {/* Sprite */}
      <div className="flex justify-center py-2">
        <img
          src={pokemon.species.spriteUrl}
          alt={`${pokemon.species.slug} sprite`}
          className={`w-20 h-20 sm:w-24 sm:h-24 ${flip ? 'scale-x-[-1]' : ''}`}
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Types */}
      <div className="flex gap-1 justify-center mb-2">
        {pokemon.species.types.map((type) => (
          <span
            key={type}
            className="type-badge"
            style={{
              background: TYPE_COLORS[type].bg,
              color: TYPE_COLORS[type].text,
            }}
          >
            {type}
          </span>
        ))}
      </div>

      {/* HP bar */}
      <div className="text-center text-[10px] text-[var(--color-text-dim)] font-bold mb-1">
        HP
      </div>
      <div className="h-3 bg-[var(--color-bg-primary)] rounded-full overflow-hidden mb-1">
        <div
          className="h-full hp-bar-fill rounded-full"
          style={{
            width: `${hpPct}%`,
            background:
              hpPct > 50
                ? 'var(--color-hp-high)'
                : hpPct > 25
                  ? 'var(--color-hp-mid)'
                  : 'var(--color-hp-low)',
          }}
          role="progressbar"
          aria-valuenow={pokemon.currentHp}
          aria-valuemin={0}
          aria-valuemax={pokemon.maxHp}
          aria-label={`${pokemon.species.slug} health: ${hpPct}%`}
        />
      </div>
      <div className="text-center text-xs text-[var(--color-text-muted)]">
        {hpPct}%
      </div>
    </div>
  );
}

// ── Battle Log Entry ──

function BattleLogEntry({
  event,
  p1Name,
  p2Name,
}: {
  event: BattleEvent;
  p1Name: string;
  p2Name: string;
}) {
  const getPlayerName = (playerId: string) =>
    playerId === 'player1' ? p1Name : p2Name;

  switch (event.type) {
    case 'battle_start':
      return (
        <div className="text-[var(--color-player1)] font-bold">
          ⚔️ Battle Start!
        </div>
      );
    case 'round_start':
      return (
        <div className="text-[var(--color-text-dim)] mt-1 font-semibold">
          — Round {event.roundNumber} —
        </div>
      );
    case 'move_used':
      return (
        <div className="text-[var(--color-text-secondary)]">
          {String(event.data.pokemon).replace(/-/g, ' ')} used{' '}
          <span className="text-white font-semibold">
            {String(event.data.move).replace(/-/g, ' ')}
          </span>
          !
        </div>
      );
    case 'damage_dealt': {
      const effectiveness = Number(event.data.effectiveness ?? 1);
      const isCritical = Boolean(event.data.isCritical);
      return (
        <div>
          <span className="text-[var(--color-text-secondary)]">
            {String(event.data.damage)} damage to {String(event.data.target).replace(/-/g, ' ')}.
          </span>
          {isCritical && (
            <span className="text-yellow-400 ml-1">Critical hit!</span>
          )}
          {effectiveness > 1 && (
            <span className="text-green-400 ml-1">Super effective!</span>
          )}
          {effectiveness < 1 && effectiveness > 0 && (
            <span className="text-orange-400 ml-1">Not very effective...</span>
          )}
          {effectiveness === 0 && (
            <span className="text-gray-400 ml-1">No effect!</span>
          )}
        </div>
      );
    }
    case 'pokemon_fainted':
      return (
        <div className="text-red-400 font-semibold">
          {String(event.data.pokemon).replace(/-/g, ' ')} fainted!
        </div>
      );
    case 'pokemon_sent_out':
      return (
        <div className="text-[var(--color-text-secondary)]">
          {getPlayerName(String(event.data.playerId))} sent out{' '}
          <span className="text-white font-semibold">
            {String(event.data.pokemon).replace(/-/g, ' ')}
          </span>
          !
        </div>
      );
    case 'battle_end':
      return (
        <div className="text-[var(--color-player1)] font-bold mt-1">
          🏆 {getPlayerName(String(event.data.winner))} wins the battle!
        </div>
      );
    default:
      return null;
  }
}
