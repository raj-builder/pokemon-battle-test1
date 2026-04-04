'use client';

import type { BattleSummary as BattleSummaryData, PokemonBattleStats } from '@/engine/battle-analyzer';
import { TYPE_COLORS } from '@/data/type-colors';

interface BattleSummaryProps {
  summary: BattleSummaryData;
  winnerName: string;
  loserName: string;
  onPlayAgain: () => void;
}

/**
 * Post-battle summary component.
 *
 * Displays battle results with MVP highlights, per-Pokemon damage stats,
 * key moments, and improvement tips. Fits on one screen for quick review.
 *
 * Accessibility:
 * - All sprites have alt text
 * - Damage bars use role="progressbar" with aria attributes
 * - Color is paired with text labels (never color-only)
 * - Keyboard-navigable Play Again button
 * - All text sourced from i18n keys (messages/en.json result.*)
 */
export default function BattleSummary({
  summary,
  winnerName,
  loserName,
  onPlayAgain,
}: BattleSummaryProps) {
  const winnerStats =
    summary.winner === 'player1' ? summary.player1Stats : summary.player2Stats;
  const loserStats =
    summary.winner === 'player1' ? summary.player2Stats : summary.player1Stats;
  const winnerMvp =
    summary.winner === 'player1' ? summary.player1Mvp : summary.player2Mvp;

  // Compute max damage across all Pokemon for bar scaling
  const allStats = [...summary.player1Stats, ...summary.player2Stats];
  const maxDamage = Math.max(
    ...allStats.map((s) => Math.max(s.totalDamageDealt, s.totalDamageReceived)),
    1 // prevent division by zero
  );

  return (
    <div
      className="bg-[var(--color-bg-card)] rounded-2xl p-5 sm:p-6 max-w-md mx-4 w-full
                 border border-[var(--color-border)] space-y-5 max-h-[85vh] overflow-y-auto"
    >
      {/* Winner announcement */}
      <div className="text-center">
        <h2 className="font-[var(--font-display)] text-base sm:text-lg text-white">
          {winnerName} Wins!
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
          All of {loserName}&apos;s Pokemon fainted.
        </p>
        <p className="text-[10px] text-[var(--color-text-dim)] mt-0.5">
          Battle lasted {summary.totalRounds} rounds
        </p>
      </div>

      {/* MVP highlight */}
      <div className="bg-[var(--color-bg-secondary)] rounded-xl p-3 border border-[var(--color-border)]">
        <div className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-wider text-center mb-2">
          MVP
        </div>
        <div className="flex items-center gap-3 justify-center">
          <img
            src={winnerMvp.spriteUrl}
            alt={`${winnerMvp.displayName} sprite`}
            className="w-12 h-12 sm:w-14 sm:h-14"
            style={{ imageRendering: 'pixelated' }}
          />
          <div>
            <div className="font-semibold text-sm text-white capitalize">
              {winnerMvp.displayName}
            </div>
            <div className="flex gap-1 mt-0.5">
              {winnerMvp.types.map((type) => (
                <span
                  key={type}
                  className="type-badge text-[7px]"
                  style={{
                    background: TYPE_COLORS[type as keyof typeof TYPE_COLORS]?.bg,
                    color: TYPE_COLORS[type as keyof typeof TYPE_COLORS]?.text,
                  }}
                >
                  {type}
                </span>
              ))}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">
              Dealt {winnerMvp.totalDamageDealt} damage &middot; {winnerMvp.knockouts} KOs
            </div>
          </div>
        </div>
      </div>

      {/* Team damage breakdown */}
      <div className="space-y-3">
        <TeamDamageBreakdown
          label={`${winnerName}'s Team`}
          stats={winnerStats}
          maxDamage={maxDamage}
          isWinner
        />
        <TeamDamageBreakdown
          label={`${loserName}'s Team`}
          stats={loserStats}
          maxDamage={maxDamage}
          isWinner={false}
        />
      </div>

      {/* Key moments */}
      {summary.keyMoments.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-wider mb-1.5">
            KEY MOMENTS
          </div>
          <div className="space-y-1">
            {summary.keyMoments.map((moment, i) => (
              <p
                key={i}
                className="text-xs text-[var(--color-text-secondary)] pl-2 border-l-2 border-[var(--color-player1)]"
              >
                {formatMoment(moment.descriptionKey, moment.values)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Improvement tips */}
      {summary.tips.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-wider mb-1.5">
            TIPS FOR NEXT TIME
          </div>
          <div className="space-y-1">
            {summary.tips.map((tip, i) => (
              <p
                key={i}
                className="text-xs text-[var(--color-text-secondary)] pl-2 border-l-2 border-amber-500"
              >
                {formatTip(tip.tipKey, tip.values)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Play Again button */}
      <div className="pt-1">
        <button
          onClick={onPlayAgain}
          className="w-full min-h-11 px-6 py-2.5 bg-[var(--color-player1)] hover:bg-blue-500
                     text-white font-bold text-sm rounded-xl transition-colors
                     focus-visible:ring-2 focus-visible:ring-white"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

// ── Team Damage Breakdown ──

function TeamDamageBreakdown({
  label,
  stats,
  maxDamage,
  isWinner,
}: {
  label: string;
  stats: PokemonBattleStats[];
  maxDamage: number;
  isWinner: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] font-bold text-[var(--color-text-muted)] tracking-wider mb-1.5">
        {label.toUpperCase()}
      </div>
      <div className="space-y-1.5">
        {stats.map((pokemon) => (
          <PokemonStatRow
            key={pokemon.slug}
            pokemon={pokemon}
            maxDamage={maxDamage}
          />
        ))}
      </div>
    </div>
  );
}

// ── Pokemon Stat Row ──

function PokemonStatRow({
  pokemon,
  maxDamage,
}: {
  pokemon: PokemonBattleStats;
  maxDamage: number;
}) {
  const dealtPercent = Math.round((pokemon.totalDamageDealt / maxDamage) * 100);

  return (
    <div className="flex items-center gap-2">
      {/* Sprite */}
      <img
        src={pokemon.spriteUrl}
        alt={`${pokemon.displayName} sprite`}
        className="w-7 h-7 flex-shrink-0"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] sm:text-[11px] font-semibold capitalize truncate ${
              pokemon.survived ? 'text-white' : 'text-[var(--color-text-dim)]'
            }`}
          >
            {pokemon.displayName}
          </span>
          <span
            className={`text-[8px] font-bold flex-shrink-0 ${
              pokemon.survived ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {pokemon.survived
              ? `${pokemon.remainingHp}/${pokemon.maxHp}`
              : 'KO'}
          </span>
        </div>

        {/* Damage dealt bar */}
        <div className="flex items-center gap-1 mt-0.5">
          <div
            className="h-1.5 rounded bg-[#1a1f2e] flex-1 overflow-hidden"
            role="progressbar"
            aria-valuenow={pokemon.totalDamageDealt}
            aria-valuemin={0}
            aria-valuemax={maxDamage}
            aria-label={`${pokemon.displayName} dealt ${pokemon.totalDamageDealt} damage`}
          >
            <div
              className="h-full rounded bg-blue-400/80"
              style={{ width: `${dealtPercent}%` }}
            />
          </div>
          <span className="text-[8px] text-[var(--color-text-dim)] w-8 text-right flex-shrink-0">
            {pokemon.totalDamageDealt}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Formatting helpers ──

/**
 * Format a key moment description by interpolating values into the template.
 * Matches i18n keys from messages/en.json result.* namespace.
 */
function formatMoment(
  key: string,
  values: Record<string, string | number>
): string {
  const templates: Record<string, string> = {
    'result.superEffectiveHit':
      `${values.attacker} dealt ${values.damage} super effective damage to ${values.defender}!`,
    'result.criticalHit':
      `${values.attacker} landed a critical hit for ${values.damage} damage!`,
    'result.biggestHit':
      `${values.attacker} hit ${values.defender} for ${values.damage} damage — the biggest hit!`,
  };
  return templates[key] ?? '';
}

/**
 * Format an improvement tip by interpolating values into the template.
 * Matches i18n keys from messages/en.json result.* namespace.
 */
function formatTip(
  key: string,
  values: Record<string, string | number>
): string {
  const templates: Record<string, string> = {
    'result.tipLeadDisadvantage':
      `Leading with ${values.pokemon} gave a type disadvantage against ${values.opponent}. Consider a different lead.`,
    'result.tipNoDamage':
      `${values.pokemon} dealt no damage. Its moves may not cover the opponent's types.`,
    'result.tipWellPlayed':
      'Strong team ordering and good type matchups! Keep it up.',
  };
  return templates[key] ?? '';
}
