/**
 * Normalized fallback Pokemon data for the Pokemon Battle Simulator.
 *
 * This file contains a curated set of 83 Pokemon species from the original app,
 * normalized into the canonical PokemonSpecies interface format. This data is
 * used when PokeAPI is unreachable or as a local cache seed, ensuring the game
 * can operate fully offline.
 *
 * Source: Original app fallback array, manually verified against PokeAPI.
 * Sprite URLs: PokeAPI/sprites GitHub repository (public domain sprites).
 *
 * Covers all nine generations (Gen I through Gen IX) for type and generation
 * diversity during team building.
 */

import type { PokemonSpecies, PokemonType } from '@/engine/types';
import { GENERATION_RANGES } from '@/engine/constants';

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────

/**
 * Determines a Pokemon's generation number based on its National Dex ID.
 *
 * Uses GENERATION_RANGES from constants to map ID ranges to generations.
 * Returns 0 if the ID does not fall into any known range (should not happen
 * with valid National Dex IDs 1-1025).
 *
 * @param id - National Pokedex ID
 * @returns Generation number (1-9), or 0 if ID is out of range
 */
function getGeneration(id: number): number {
  for (const [gen, [start, end]] of Object.entries(GENERATION_RANGES)) {
    if (id >= start && id <= end) {
      return Number(gen);
    }
  }
  return 0;
}

/**
 * Constructs the sprite URL for a given Pokemon ID.
 * Uses the PokeAPI/sprites GitHub repository for stable, cacheable URLs.
 */
function spriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

/**
 * Shorthand factory for building a PokemonSpecies record.
 * Reduces boilerplate in the large fallback array below.
 */
function species(
  id: number,
  slug: string,
  types: [PokemonType, ...PokemonType[]],
  hp: number,
  attack: number,
  defense: number,
  specialAttack: number,
  specialDefense: number,
  speed: number,
  moveIds: string[],
): PokemonSpecies {
  return {
    id,
    slug,
    nameKey: `pokemon.${slug}`,
    types,
    baseStats: { hp, attack, defense, specialAttack, specialDefense, speed },
    moveIds,
    spriteUrl: spriteUrl(id),
    generation: getGeneration(id),
  };
}

// ──────────────────────────────────────────
// Fallback Pokemon Data (83 species)
// ──────────────────────────────────────────

/**
 * Complete fallback Pokemon roster, sorted by National Dex ID.
 *
 * Each entry is a fully normalized PokemonSpecies object.
 * Data origin: original app fallback array, cross-referenced with PokeAPI.
 */
export const FALLBACK_POKEMON: readonly PokemonSpecies[] = [
  // ── Gen I (1-151) ──────────────────────
  species(1, 'bulbasaur', ['grass', 'poison'], 45, 49, 49, 65, 65, 45,
    ['tackle', 'vine-whip', 'razor-leaf', 'leech-seed']),

  species(4, 'charmander', ['fire'], 39, 52, 43, 60, 50, 65,
    ['scratch', 'ember', 'flamethrower', 'dragon-rage']),

  species(6, 'charizard', ['fire', 'flying'], 78, 84, 78, 109, 85, 100,
    ['flamethrower', 'fly', 'dragon-claw', 'fire-spin']),

  species(7, 'squirtle', ['water'], 44, 48, 65, 50, 64, 43,
    ['tackle', 'water-gun', 'bubble-beam', 'withdraw']),

  species(25, 'pikachu', ['electric'], 35, 55, 40, 50, 50, 90,
    ['thunder-shock', 'quick-attack', 'thunderbolt', 'iron-tail']),

  species(38, 'ninetales', ['fire'], 73, 76, 75, 81, 100, 100,
    ['ember', 'flamethrower', 'confuse-ray', 'fire-spin']),

  species(39, 'jigglypuff', ['normal', 'fairy'], 115, 45, 20, 45, 25, 20,
    ['sing', 'pound', 'body-slam', 'double-slap']),

  species(52, 'meowth', ['normal'], 40, 45, 35, 40, 40, 90,
    ['scratch', 'bite', 'pay-day', 'fury-swipes']),

  species(54, 'psyduck', ['water'], 50, 52, 48, 65, 50, 55,
    ['scratch', 'water-gun', 'confusion', 'disable']),

  species(58, 'growlithe', ['fire'], 55, 70, 45, 70, 50, 60,
    ['bite', 'ember', 'flamethrower', 'roar']),

  species(59, 'arcanine', ['fire'], 90, 110, 80, 100, 80, 95,
    ['bite', 'flamethrower', 'extreme-speed', 'fire-fang']),

  species(63, 'abra', ['psychic'], 25, 20, 15, 105, 55, 90,
    ['teleport', 'confusion', 'psybeam', 'reflect']),

  species(66, 'machop', ['fighting'], 70, 80, 50, 35, 35, 35,
    ['karate-chop', 'low-kick', 'seismic-toss', 'leer']),

  species(74, 'geodude', ['rock', 'ground'], 40, 80, 100, 30, 30, 20,
    ['tackle', 'rock-throw', 'magnitude', 'defense-curl']),

  species(78, 'rapidash', ['fire'], 65, 100, 70, 80, 80, 105,
    ['ember', 'flamethrower', 'stomp', 'agility']),

  species(79, 'slowpoke', ['water', 'psychic'], 90, 65, 65, 40, 40, 15,
    ['tackle', 'confusion', 'water-gun', 'amnesia']),

  species(92, 'gastly', ['ghost', 'poison'], 30, 35, 30, 100, 35, 80,
    ['lick', 'hypnosis', 'night-shade', 'curse']),

  species(94, 'gengar', ['ghost', 'poison'], 60, 65, 60, 130, 75, 110,
    ['shadow-ball', 'hypnosis', 'night-shade', 'sludge-bomb']),

  species(104, 'cubone', ['ground'], 50, 50, 95, 40, 50, 35,
    ['bone-club', 'headbutt', 'leer', 'bone-rush']),

  species(113, 'chansey', ['normal'], 250, 5, 5, 35, 105, 50,
    ['pound', 'egg-bomb', 'soft-boiled', 'double-slap']),

  species(123, 'scyther', ['bug', 'flying'], 70, 110, 80, 55, 80, 105,
    ['slash', 'wing-attack', 'quick-attack', 'agility']),

  species(127, 'pinsir', ['bug'], 65, 125, 100, 55, 70, 85,
    ['vice-grip', 'seismic-toss', 'slash', 'submission']),

  species(131, 'lapras', ['water', 'ice'], 130, 85, 80, 85, 95, 60,
    ['water-gun', 'ice-beam', 'body-slam', 'confuse-ray']),

  species(133, 'eevee', ['normal'], 55, 55, 50, 45, 65, 55,
    ['tackle', 'quick-attack', 'sand-attack', 'bite']),

  species(136, 'flareon', ['fire'], 65, 130, 60, 95, 110, 65,
    ['ember', 'flamethrower', 'fire-fang', 'leer']),

  species(143, 'snorlax', ['normal'], 160, 110, 65, 65, 110, 30,
    ['tackle', 'body-slam', 'yawn', 'rest']),

  species(144, 'articuno', ['ice', 'flying'], 90, 85, 100, 95, 125, 85,
    ['ice-beam', 'blizzard', 'powder-snow', 'mist']),

  species(145, 'zapdos', ['electric', 'flying'], 90, 90, 85, 125, 90, 100,
    ['thunderbolt', 'thunder', 'drill-peck', 'agility']),

  species(147, 'dratini', ['dragon'], 41, 64, 45, 50, 50, 50,
    ['wrap', 'thunder-wave', 'slam', 'agility']),

  species(149, 'dragonite', ['dragon', 'flying'], 91, 134, 95, 100, 100, 80,
    ['dragon-claw', 'thunder', 'fire-punch', 'hyper-beam']),

  // ── Gen II (152-251) ───────────────────
  species(152, 'chikorita', ['grass'], 45, 49, 65, 49, 65, 45,
    ['tackle', 'razor-leaf', 'reflect', 'poison-powder']),

  species(155, 'cyndaquil', ['fire'], 39, 52, 43, 60, 50, 65,
    ['tackle', 'ember', 'smokescreen', 'swift']),

  species(157, 'typhlosion', ['fire'], 78, 84, 78, 109, 85, 100,
    ['flamethrower', 'eruption', 'swift', 'smokescreen']),

  species(158, 'totodile', ['water'], 50, 65, 64, 44, 48, 43,
    ['scratch', 'water-gun', 'bite', 'leer']),

  species(196, 'espeon', ['psychic'], 65, 65, 60, 130, 95, 110,
    ['confusion', 'psybeam', 'psychic', 'morning-sun']),

  species(197, 'umbreon', ['dark'], 95, 65, 110, 60, 130, 65,
    ['bite', 'pursuit', 'faint-attack', 'moonlight']),

  species(227, 'skarmory', ['steel', 'flying'], 65, 80, 140, 40, 70, 70,
    ['steel-wing', 'fury-attack', 'air-slash', 'swift']),

  species(230, 'kingdra', ['water', 'dragon'], 75, 95, 95, 95, 95, 85,
    ['water-gun', 'dragon-breath', 'surf', 'smokescreen']),

  species(246, 'larvitar', ['rock', 'ground'], 50, 64, 50, 45, 50, 41,
    ['bite', 'rock-slide', 'screech', 'thrash']),

  species(248, 'tyranitar', ['rock', 'dark'], 100, 134, 110, 95, 100, 61,
    ['crunch', 'rock-slide', 'earthquake', 'hyper-beam']),

  // ── Gen III (252-386) ──────────────────
  species(252, 'treecko', ['grass'], 40, 45, 35, 65, 55, 70,
    ['pound', 'absorb', 'quick-attack', 'mega-drain']),

  species(255, 'torchic', ['fire'], 45, 60, 40, 70, 50, 45,
    ['scratch', 'ember', 'peck', 'sand-attack']),

  species(257, 'blaziken', ['fire', 'fighting'], 80, 120, 70, 110, 70, 80,
    ['blaze-kick', 'sky-uppercut', 'flamethrower', 'double-kick']),

  species(258, 'mudkip', ['water'], 50, 70, 50, 50, 50, 40,
    ['tackle', 'water-gun', 'mud-slap', 'bide']),

  species(310, 'manectric', ['electric'], 70, 75, 60, 105, 60, 105,
    ['thunderbolt', 'thunder', 'quick-attack', 'bite']),

  species(334, 'altaria', ['dragon', 'flying'], 75, 70, 90, 70, 105, 80,
    ['dragon-breath', 'sing', 'aerial-ace', 'take-down']),

  species(373, 'salamence', ['dragon', 'flying'], 95, 135, 80, 110, 80, 100,
    ['dragon-claw', 'flamethrower', 'crunch', 'aerial-ace']),

  species(376, 'metagross', ['steel', 'psychic'], 80, 135, 130, 95, 90, 70,
    ['meteor-mash', 'psychic', 'agility', 'zen-headbutt']),

  // ── Gen IV (387-493) ──────────────────
  species(389, 'torterra', ['grass', 'ground'], 95, 109, 105, 75, 85, 56,
    ['earthquake', 'wood-hammer', 'crunch', 'razor-leaf']),

  species(392, 'infernape', ['fire', 'fighting'], 76, 104, 71, 104, 71, 108,
    ['flamethrower', 'close-combat', 'mach-punch', 'nasty-plot']),

  species(395, 'empoleon', ['water', 'steel'], 84, 86, 88, 111, 101, 60,
    ['surf', 'flash-cannon', 'ice-beam', 'drill-peck']),

  species(405, 'luxray', ['electric'], 80, 120, 79, 95, 79, 70,
    ['thunderbolt', 'crunch', 'wild-charge', 'bite']),

  species(430, 'honchkrow', ['dark', 'flying'], 100, 125, 52, 105, 52, 71,
    ['night-slash', 'sucker-punch', 'fly', 'dark-pulse']),

  species(445, 'garchomp', ['dragon', 'ground'], 108, 130, 95, 80, 85, 102,
    ['dragon-claw', 'earthquake', 'crunch', 'dragon-rush']),

  species(448, 'lucario', ['fighting', 'steel'], 70, 110, 70, 115, 70, 90,
    ['aura-sphere', 'close-combat', 'bullet-punch', 'flash-cannon']),

  species(461, 'weavile', ['dark', 'ice'], 70, 120, 65, 45, 85, 125,
    ['night-slash', 'ice-punch', 'fake-out', 'aerial-ace']),

  species(472, 'gliscor', ['ground', 'flying'], 75, 95, 125, 45, 75, 95,
    ['earthquake', 'aerial-ace', 'x-scissor', 'knock-off']),

  // ── Gen V (494-649) ───────────────────
  species(500, 'emboar', ['fire', 'fighting'], 110, 123, 65, 100, 65, 65,
    ['flamethrower', 'hammer-arm', 'heat-crash', 'arm-thrust']),

  species(503, 'samurott', ['water'], 95, 100, 85, 108, 70, 70,
    ['surf', 'ice-beam', 'x-scissor', 'aqua-tail']),

  species(597, 'ferroseed', ['grass', 'steel'], 44, 50, 91, 24, 86, 10,
    ['tackle', 'metal-claw', 'pin-missile', 'harden']),

  species(609, 'chandelure', ['ghost', 'fire'], 60, 55, 90, 145, 90, 80,
    ['shadow-ball', 'flamethrower', 'energy-ball', 'hex']),

  species(612, 'haxorus', ['dragon'], 76, 147, 90, 60, 70, 97,
    ['dragon-claw', 'outrage', 'slash', 'dragon-dance']),

  species(635, 'hydreigon', ['dark', 'dragon'], 92, 105, 90, 125, 90, 98,
    ['dragon-pulse', 'dark-pulse', 'hyper-voice', 'flamethrower']),

  // ── Gen VI (650-721) ──────────────────
  species(658, 'greninja', ['water', 'dark'], 72, 95, 67, 103, 71, 122,
    ['water-shuriken', 'dark-pulse', 'ice-beam', 'extrasensory']),

  species(660, 'diggersby', ['normal', 'ground'], 85, 56, 77, 50, 77, 78,
    ['earthquake', 'quick-attack', 'take-down', 'bulldoze']),

  species(681, 'aegislash', ['steel', 'ghost'], 60, 50, 140, 50, 140, 60,
    ['shadow-ball', 'flash-cannon', 'sacred-sword', 'king-shield']),

  species(700, 'sylveon', ['fairy'], 95, 65, 65, 110, 130, 60,
    ['moonblast', 'psyshock', 'shadow-ball', 'dazzling-gleam']),

  species(706, 'goodra', ['dragon'], 90, 100, 70, 110, 150, 80,
    ['dragon-pulse', 'sludge-wave', 'thunderbolt', 'focus-blast']),

  // ── Gen VII (722-809) ─────────────────
  species(727, 'incineroar', ['fire', 'dark'], 95, 115, 90, 80, 90, 60,
    ['flamethrower', 'darkest-lariat', 'cross-chop', 'outrage']),

  species(730, 'primarina', ['water', 'fairy'], 80, 74, 74, 126, 116, 60,
    ['sparkling-aria', 'moonblast', 'hyper-voice', 'psychic']),

  species(754, 'lurantis', ['grass'], 70, 105, 90, 80, 90, 45,
    ['leaf-blade', 'solar-blade', 'x-scissor', 'synthesis']),

  species(760, 'bewear', ['normal', 'fighting'], 120, 125, 80, 55, 60, 60,
    ['hammer-arm', 'double-edge', 'strength', 'chip-away']),

  species(778, 'mimikyu', ['ghost', 'fairy'], 55, 90, 80, 50, 105, 96,
    ['shadow-sneak', 'play-rough', 'shadow-claw', 'charm']),

  // ── Gen VIII (810-905) ────────────────
  species(812, 'rillaboom', ['grass'], 100, 125, 90, 60, 70, 85,
    ['drum-beating', 'wood-hammer', 'earthquake', 'grassy-glide']),

  species(815, 'cinderace', ['fire'], 80, 116, 75, 65, 75, 119,
    ['pyro-ball', 'high-jump-kick', 'zen-headbutt', 'court-change']),

  species(818, 'inteleon', ['water'], 70, 85, 65, 125, 65, 120,
    ['snipe-shot', 'tearful-look', 'air-cutter', 'acrobatics']),

  species(884, 'duraludon', ['steel', 'dragon'], 70, 95, 115, 120, 50, 85,
    ['dragon-claw', 'flash-cannon', 'thunderbolt', 'body-press']),

  species(887, 'dragapult', ['dragon', 'ghost'], 88, 120, 75, 100, 75, 142,
    ['dragon-darts', 'shadow-ball', 'sucker-punch', 'fire-blast']),

  // ── Gen IX (906-1025) ─────────────────
  species(906, 'sprigatito', ['grass'], 40, 61, 54, 45, 45, 65,
    ['leafage', 'quick-attack', 'hone-claws', 'magical-leaf']),

  species(909, 'fuecoco', ['fire'], 67, 45, 59, 79, 40, 36,
    ['ember', 'bite', 'flame-charge', 'incinerate']),

  species(912, 'quaxly', ['water'], 55, 65, 45, 50, 45, 50,
    ['water-gun', 'pound', 'quick-attack', 'aerial-ace']),

  species(963, 'palafin', ['water'], 100, 70, 72, 53, 62, 100,
    ['flip-turn', 'jet-punch', 'wave-crash', 'draining-kiss']),

  species(967, 'frigibax', ['dragon', 'ice'], 65, 75, 45, 35, 45, 55,
    ['ice-fang', 'dragon-breath', 'tackle', 'icy-wind']),
] as const;

// ──────────────────────────────────────────
// Lookup Helpers
// ──────────────────────────────────────────

/**
 * Finds a Pokemon species by its National Dex ID.
 *
 * @param id - National Pokedex ID to look up
 * @returns The matching PokemonSpecies, or undefined if not in the fallback set
 */
export function getPokemonById(id: number): PokemonSpecies | undefined {
  return FALLBACK_POKEMON.find((p) => p.id === id);
}

/**
 * Finds a Pokemon species by its slug (lowercase name).
 *
 * @param slug - Pokemon slug, e.g. "pikachu"
 * @returns The matching PokemonSpecies, or undefined if not in the fallback set
 */
export function getPokemonBySlug(slug: string): PokemonSpecies | undefined {
  return FALLBACK_POKEMON.find((p) => p.slug === slug);
}
