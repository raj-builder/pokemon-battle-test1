'use client';

import type { PokemonSpecies } from '@/engine/types';
import { TYPE_COLORS } from '@/data/type-colors';
import { TYPE_ICONS } from '@/data/type-icons';
import { MOVE_CATALOG } from '@/data/move-catalog';

interface TcgCardProps {
  pokemon: PokemonSpecies;
  showReroll?: boolean;
  onReroll?: () => void;
  isOpponent?: boolean;
}

/**
 * Pokemon TCG-style trading card component.
 *
 * Displays a Pokemon with its stats, types, and moves
 * in a card format matching the original app's design.
 *
 * Accessibility:
 * - Descriptive alt text on sprite
 * - Type badges include text labels (not color-only)
 * - Stats shown as text + visual bars
 * - Reroll button has accessible label
 */
export default function TcgCard({
  pokemon,
  showReroll = false,
  onReroll,
  isOpponent = false,
}: TcgCardProps) {
  const primaryType = pokemon.types[0];
  const typeColor = TYPE_COLORS[primaryType];

  // Stat bar width (relative to max stat of 255)
  const statBar = (value: number) =>
    `${Math.min(100, Math.round((value / 255) * 100))}%`;

  const stats = pokemon.baseStats;

  return (
    <div
      className={`
        w-[170px] sm:w-[180px] flex-shrink-0 rounded-[14px] overflow-hidden
        relative cursor-default transition-transform
        shadow-[0_6px_24px_rgba(0,0,0,0.6)] bg-[var(--color-bg-card)]
        border-2 border-transparent hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.7)]
      `}
    >
      {/* Card header — colored by type */}
      <div
        className="px-2.5 py-2 flex justify-between items-center"
        style={{ background: typeColor.bg }}
      >
        <span
          className="font-bold text-[11px] capitalize tracking-wide"
          style={{ color: typeColor.text }}
        >
          {pokemon.slug.replace(/-/g, ' ')}
        </span>
        <span
          className="text-[9px] font-bold opacity-80"
          style={{ color: typeColor.text }}
        >
          #{String(pokemon.id).padStart(3, '0')}
        </span>
      </div>

      {/* Sprite */}
      <div className="flex justify-center py-3 bg-[var(--color-bg-primary)]/60">
        {isOpponent ? (
          <div
            className="w-[80px] h-[80px] rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-2xl"
            aria-label="Hidden Pokemon"
          >
            ?
          </div>
        ) : (
          <img
            src={pokemon.spriteUrl}
            alt={`${pokemon.slug} sprite`}
            className="w-[80px] h-[80px] pixelated"
            style={{ imageRendering: 'pixelated' }}
            loading="lazy"
          />
        )}
      </div>

      {/* Type badges */}
      <div className="flex gap-1 px-2.5 py-1.5">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className="type-badge"
            style={{
              background: TYPE_COLORS[type].bg,
              color: TYPE_COLORS[type].text,
            }}
            aria-label={`${type} type`}
          >
            {type}
          </span>
        ))}
      </div>

      {/* Stats */}
      {!isOpponent && (
        <div className="px-2.5 py-1.5 space-y-0.5">
          {[
            { key: 'HP', value: stats.hp },
            { key: 'ATK', value: stats.attack },
            { key: 'DEF', value: stats.defense },
            { key: 'SP.A', value: stats.specialAttack },
            { key: 'SP.D', value: stats.specialDefense },
            { key: 'SPD', value: stats.speed },
          ].map(({ key, value }) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-[8px] text-[var(--color-text-dim)] w-7 font-bold">
                {key}
              </span>
              <div className="flex-1 h-1.5 bg-[#1a1f2e] rounded overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{
                    width: statBar(value),
                    background: typeColor.bg,
                    opacity: 0.8,
                  }}
                />
              </div>
              <span className="text-[8px] text-[var(--color-text-dim)] w-5 text-right">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Moves */}
      {!isOpponent && (
        <div className="px-2 pb-2.5 space-y-1">
          {pokemon.moveIds.slice(0, 4).map((moveId) => {
            const move = MOVE_CATALOG[moveId];
            const moveType = move?.type ?? 'normal';
            const movePower = move?.power ?? 0;
            const icon = TYPE_ICONS[moveType];
            return (
              <div
                key={moveId}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-md
                           bg-[var(--color-bg-primary)]/40"
              >
                <span className="text-[9px] flex-shrink-0" aria-hidden="true">
                  {icon}
                </span>
                <span className="text-[9px] text-[var(--color-text-secondary)] capitalize truncate flex-1">
                  {moveId.replace(/-/g, ' ')}
                </span>
                {movePower > 0 && (
                  <span className="text-[8px] text-[var(--color-text-dim)] font-bold flex-shrink-0">
                    {movePower}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reroll button */}
      {showReroll && onReroll && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReroll();
          }}
          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full
                     bg-black/50 hover:bg-black/80 text-white text-sm
                     flex items-center justify-center transition-colors
                     min-h-[44px] min-w-[44px] -mt-2 -mr-2"
          aria-label={`Reroll ${pokemon.slug}`}
          title="Reroll this card"
        >
          ⟳
        </button>
      )}
    </div>
  );
}
