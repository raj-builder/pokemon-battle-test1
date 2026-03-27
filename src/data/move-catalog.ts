/**
 * Normalized move catalog for the Pokemon Battle Simulator.
 *
 * Every move used by fallback Pokemon data is defined here with accurate
 * game data (type, category, power, accuracy, PP) sourced from PokeAPI.
 *
 * Data source: PokeAPI (https://pokeapi.co/) — cached and normalized per
 * CLAUDE.md Section 6 (pull once, cache, serve many).
 *
 * Backlog references: BE-006 (normalized schema)
 */

import type { Move, PokemonType, MoveCategory } from '@/engine/types';

// ──────────────────────────────────────────
// Helper: slug to camelCase for i18n nameKey
// ──────────────────────────────────────────

function slugToCamelCase(slug: string): string {
  return slug.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function createMove(
  id: string,
  type: PokemonType,
  category: MoveCategory,
  power: number,
  accuracy: number,
  pp: number,
): Move {
  return Object.freeze({
    id,
    nameKey: `moves.${slugToCamelCase(id)}`,
    type,
    category,
    power,
    accuracy,
    pp,
  });
}

// ──────────────────────────────────────────
// Move Catalog
// ──────────────────────────────────────────
// All values sourced from PokeAPI move data.
// power: 0 for status moves
// accuracy: 0 means the move bypasses accuracy checks (always hits)
// ──────────────────────────────────────────

export const MOVE_CATALOG: Record<string, Move> = {
  // ── Normal-type moves ──
  'tackle':         createMove('tackle',         'normal',   'physical', 40,  100, 35),
  'scratch':        createMove('scratch',        'normal',   'physical', 40,  100, 35),
  'pound':          createMove('pound',          'normal',   'physical', 40,  100, 35),
  'body-slam':      createMove('body-slam',      'normal',   'physical', 85,  100, 15),
  'double-slap':    createMove('double-slap',    'normal',   'physical', 15,  85,  10),
  'fury-swipes':    createMove('fury-swipes',    'normal',   'physical', 18,  80,  15),
  'quick-attack':   createMove('quick-attack',   'normal',   'physical', 40,  100, 30),
  'slam':           createMove('slam',           'normal',   'physical', 80,  75,  20),
  'stomp':          createMove('stomp',          'normal',   'physical', 65,  100, 20),
  'headbutt':       createMove('headbutt',       'normal',   'physical', 70,  100, 15),
  'thrash':         createMove('thrash',         'normal',   'physical', 120, 100, 10),
  'take-down':      createMove('take-down',      'normal',   'physical', 90,  85,  20),
  'double-edge':    createMove('double-edge',    'normal',   'physical', 120, 100, 15),
  'strength':       createMove('strength',       'normal',   'physical', 80,  100, 15),
  'chip-away':      createMove('chip-away',      'normal',   'physical', 70,  100, 20),
  'slash':          createMove('slash',          'normal',   'physical', 70,  100, 20),
  'vice-grip':      createMove('vice-grip',      'normal',   'physical', 55,  100, 30),
  'wrap':           createMove('wrap',           'normal',   'physical', 15,  90,  20),
  'egg-bomb':       createMove('egg-bomb',       'normal',   'physical', 100, 75,  10),
  'fake-out':       createMove('fake-out',       'normal',   'physical', 40,  100, 10),
  'extreme-speed':  createMove('extreme-speed',  'normal',   'physical', 80,  100,  5),
  'bide':           createMove('bide',           'normal',   'physical',  0,    0, 10),
  'swift':          createMove('swift',          'normal',   'special',  60,    0, 20),
  'hyper-beam':     createMove('hyper-beam',     'normal',   'special', 150,  90,   5),
  'hyper-voice':    createMove('hyper-voice',    'normal',   'special',  90,  100, 10),
  'leer':           createMove('leer',           'normal',   'status',    0,  100, 30),
  'roar':           createMove('roar',           'normal',   'status',    0,    0, 20),
  'sing':           createMove('sing',           'normal',   'status',    0,   55, 15),
  'smokescreen':    createMove('smokescreen',    'normal',   'status',    0,  100, 20),
  'defense-curl':   createMove('defense-curl',   'normal',   'status',    0,    0, 40),
  'harden':         createMove('harden',         'normal',   'status',    0,    0, 30),
  'disable':        createMove('disable',        'normal',   'status',    0,  100, 20),
  'screech':        createMove('screech',        'normal',   'status',    0,   85, 40),

  // ── Fire-type moves ──
  'ember':          createMove('ember',          'fire',     'special',  40,  100, 25),
  'flamethrower':   createMove('flamethrower',   'fire',     'special',  90,  100, 15),
  'fire-blast':     createMove('fire-blast',     'fire',     'special', 110,  85,   5),
  'fire-spin':      createMove('fire-spin',      'fire',     'special',  35,  85,  15),
  'eruption':       createMove('eruption',       'fire',     'special', 150, 100,   5),
  'incinerate':     createMove('incinerate',     'fire',     'special',  60,  100, 15),
  'flame-charge':   createMove('flame-charge',   'fire',     'physical', 50, 100, 20),
  'fire-punch':     createMove('fire-punch',     'fire',     'physical', 75, 100, 15),
  'fire-fang':      createMove('fire-fang',      'fire',     'physical', 65,  95, 15),
  'blaze-kick':     createMove('blaze-kick',     'fire',     'physical', 85,  90, 10),
  'pyro-ball':      createMove('pyro-ball',      'fire',     'physical', 120, 90,  5),
  'heat-crash':     createMove('heat-crash',     'fire',     'physical', 80, 100, 10), // Variable power in games (40-120 by weight ratio); 80 as average baseline

  // ── Water-type moves ──
  'water-gun':      createMove('water-gun',      'water',    'special',  40,  100, 25),
  'bubble-beam':    createMove('bubble-beam',    'water',    'special',  65,  100, 20),
  'surf':           createMove('surf',           'water',    'special',  90,  100, 15),
  'sparkling-aria': createMove('sparkling-aria', 'water',    'special',  90,  100, 10),
  'water-shuriken': createMove('water-shuriken', 'water',    'special',  15,  100, 20),
  'snipe-shot':     createMove('snipe-shot',     'water',    'special',  80,  100, 15),
  'flip-turn':      createMove('flip-turn',      'water',    'physical', 60,  100, 20),
  'aqua-tail':      createMove('aqua-tail',      'water',    'physical', 90,  90,  10),
  'jet-punch':      createMove('jet-punch',      'water',    'physical', 60,  100, 15),
  'wave-crash':     createMove('wave-crash',     'water',    'physical', 120, 100, 10),
  'withdraw':       createMove('withdraw',       'water',    'status',    0,    0, 40),

  // ── Electric-type moves ──
  'thunder-shock':  createMove('thunder-shock',  'electric', 'special',  40,  100, 30),
  'thunderbolt':    createMove('thunderbolt',    'electric', 'special',  90,  100, 15),
  'thunder':        createMove('thunder',        'electric', 'special', 110,  70,  10),
  'thunder-wave':   createMove('thunder-wave',   'electric', 'status',    0,   90, 20),
  'wild-charge':    createMove('wild-charge',    'electric', 'physical', 90, 100, 15),

  // ── Grass-type moves ──
  'vine-whip':      createMove('vine-whip',      'grass',    'physical', 45,  100, 25),
  'razor-leaf':     createMove('razor-leaf',     'grass',    'physical', 55,  95,  25),
  'leaf-blade':     createMove('leaf-blade',     'grass',    'physical', 90,  100, 15),
  'solar-blade':    createMove('solar-blade',    'grass',    'physical', 125, 100, 10),
  'wood-hammer':    createMove('wood-hammer',    'grass',    'physical', 120, 100, 15),
  'drum-beating':   createMove('drum-beating',   'grass',    'physical', 80,  100, 10),
  'grassy-glide':   createMove('grassy-glide',   'grass',    'physical', 55,  100, 20),
  'leafage':        createMove('leafage',        'grass',    'physical', 40,  100, 40),
  'absorb':         createMove('absorb',         'grass',    'special',  20,  100, 25),
  'mega-drain':     createMove('mega-drain',     'grass',    'special',  40,  100, 15),
  'energy-ball':    createMove('energy-ball',    'grass',    'special',  90,  100, 10),
  'magical-leaf':   createMove('magical-leaf',   'grass',    'special',  60,    0, 20),
  'leech-seed':     createMove('leech-seed',     'grass',    'status',    0,   90, 10),
  'synthesis':      createMove('synthesis',      'grass',    'status',    0,    0,  5),

  // ── Ice-type moves ──
  'ice-beam':       createMove('ice-beam',       'ice',      'special',  90,  100, 10),
  'blizzard':       createMove('blizzard',       'ice',      'special', 110,  70,   5),
  'powder-snow':    createMove('powder-snow',    'ice',      'special',  40,  100, 25),
  'icy-wind':       createMove('icy-wind',       'ice',      'special',  55,  95,  15),
  'ice-punch':      createMove('ice-punch',      'ice',      'physical', 75, 100, 15),
  'ice-fang':       createMove('ice-fang',       'ice',      'physical', 65,  95, 15),
  'mist':           createMove('mist',           'ice',      'status',    0,    0, 30),

  // ── Fighting-type moves ──
  'karate-chop':    createMove('karate-chop',    'fighting', 'physical', 50, 100, 25),
  'low-kick':       createMove('low-kick',       'fighting', 'physical',  0, 100, 20), // Variable power based on target weight
  'seismic-toss':   createMove('seismic-toss',   'fighting', 'physical',  0, 100, 20), // Damage = user's level
  'submission':     createMove('submission',     'fighting', 'physical', 80,  80, 20),
  'close-combat':   createMove('close-combat',   'fighting', 'physical', 120, 100, 5),
  'mach-punch':     createMove('mach-punch',     'fighting', 'physical', 40, 100, 30),
  'sky-uppercut':   createMove('sky-uppercut',   'fighting', 'physical', 85,  90, 15),
  'double-kick':    createMove('double-kick',    'fighting', 'physical', 30, 100, 30),
  'cross-chop':     createMove('cross-chop',     'fighting', 'physical', 100, 80,  5),
  'high-jump-kick': createMove('high-jump-kick', 'fighting', 'physical', 130, 90, 10),
  'arm-thrust':     createMove('arm-thrust',     'fighting', 'physical', 15, 100, 20),
  'hammer-arm':     createMove('hammer-arm',     'fighting', 'physical', 100, 90, 10),
  'sacred-sword':   createMove('sacred-sword',   'fighting', 'physical', 90, 100, 15),
  'body-press':     createMove('body-press',     'fighting', 'physical', 80, 100, 10),
  'focus-blast':    createMove('focus-blast',     'fighting', 'special', 120, 70,   5),

  // ── Poison-type moves ──
  'sludge-bomb':    createMove('sludge-bomb',    'poison',   'special',  90, 100, 10),
  'sludge-wave':    createMove('sludge-wave',    'poison',   'special',  95, 100, 10),

  // ── Ground-type moves ──
  'bone-club':      createMove('bone-club',      'ground',   'physical', 65,  85, 20),
  'bone-rush':      createMove('bone-rush',      'ground',   'physical', 25,  90, 10),
  'earthquake':     createMove('earthquake',     'ground',   'physical', 100, 100, 10),
  'magnitude':      createMove('magnitude',      'ground',   'physical',  0, 100, 30), // Variable power (10-150)
  'bulldoze':       createMove('bulldoze',       'ground',   'physical', 60, 100, 20),
  'mud-slap':       createMove('mud-slap',       'ground',   'special',  20, 100, 10),
  'sand-attack':    createMove('sand-attack',    'ground',   'status',    0, 100, 15),

  // ── Flying-type moves ──
  'wing-attack':    createMove('wing-attack',    'flying',   'physical', 60,  100, 35),
  'drill-peck':     createMove('drill-peck',     'flying',   'physical', 80,  100, 20),
  'peck':           createMove('peck',           'flying',   'physical', 35,  100, 35),
  'aerial-ace':     createMove('aerial-ace',     'flying',   'physical', 60,    0, 20),
  'fly':            createMove('fly',            'flying',   'physical', 90,   95, 15),
  'acrobatics':     createMove('acrobatics',     'flying',   'physical', 55,  100, 15),
  'air-slash':      createMove('air-slash',      'flying',   'special',  75,   95, 15),
  'air-cutter':     createMove('air-cutter',     'flying',   'special',  60,   95, 25),
  'fury-attack':    createMove('fury-attack',    'normal',   'physical', 15,   85, 20),

  // ── Psychic-type moves ──
  'confusion':      createMove('confusion',      'psychic',  'special',  50, 100, 25),
  'psybeam':        createMove('psybeam',        'psychic',  'special',  65, 100, 20),
  'psychic':        createMove('psychic',        'psychic',  'special',  90, 100, 10),
  'psyshock':       createMove('psyshock',       'psychic',  'special',  80, 100, 10),
  'extrasensory':   createMove('extrasensory',   'psychic',  'special',  80, 100, 20),
  'zen-headbutt':   createMove('zen-headbutt',   'psychic',  'physical', 80,  90, 15),
  'reflect':        createMove('reflect',        'psychic',  'status',    0,    0, 20),
  'teleport':       createMove('teleport',       'psychic',  'status',    0,    0, 20),
  'amnesia':        createMove('amnesia',        'psychic',  'status',    0,    0, 20),
  'rest':           createMove('rest',           'psychic',  'status',    0,    0, 5),
  'agility':        createMove('agility',        'psychic',  'status',    0,    0, 30),

  // ── Bug-type moves ──
  'x-scissor':      createMove('x-scissor',      'bug',      'physical', 80, 100, 15),
  'pin-missile':    createMove('pin-missile',    'bug',      'physical', 25,  95, 20),

  // ── Rock-type moves ──
  'rock-throw':     createMove('rock-throw',     'rock',     'physical', 50,  90, 15),
  'rock-slide':     createMove('rock-slide',     'rock',     'physical', 75,  90, 10),

  // ── Ghost-type moves ──
  'lick':           createMove('lick',           'ghost',    'physical', 30,  100, 30),
  'shadow-ball':    createMove('shadow-ball',    'ghost',    'special',  80,  100, 15),
  'shadow-sneak':   createMove('shadow-sneak',   'ghost',    'physical', 40,  100, 30),
  'shadow-claw':    createMove('shadow-claw',    'ghost',    'physical', 70,  100, 15),
  'night-shade':    createMove('night-shade',    'ghost',    'special',   0,  100, 15), // Damage = user's level
  'hex':            createMove('hex',            'ghost',    'special',  65,  100, 10),
  'confuse-ray':    createMove('confuse-ray',    'ghost',    'status',    0,  100, 10),
  'curse':          createMove('curse',          'ghost',    'status',    0,    0, 10),
  'hypnosis':       createMove('hypnosis',       'psychic',  'status',    0,   60, 20),

  // ── Dragon-type moves ──
  'dragon-rage':    createMove('dragon-rage',    'dragon',   'special',   0,  100, 10), // Fixed 40 damage
  'dragon-claw':    createMove('dragon-claw',    'dragon',   'physical', 80,  100, 15),
  'dragon-breath':  createMove('dragon-breath',  'dragon',   'special',  60,  100, 20),
  'dragon-pulse':   createMove('dragon-pulse',   'dragon',   'special',  85,  100, 10),
  'dragon-rush':    createMove('dragon-rush',    'dragon',   'physical', 100, 75,  10),
  'dragon-darts':   createMove('dragon-darts',   'dragon',   'physical', 50,  100, 10),
  'outrage':        createMove('outrage',        'dragon',   'physical', 120, 100, 10),
  'dragon-dance':   createMove('dragon-dance',   'dragon',   'status',    0,    0, 20),

  // ── Dark-type moves ──
  'bite':           createMove('bite',           'dark',     'physical', 60,  100, 25),
  'crunch':         createMove('crunch',         'dark',     'physical', 80,  100, 15),
  'pursuit':        createMove('pursuit',        'dark',     'physical', 40,  100, 20),
  'faint-attack':   createMove('faint-attack',   'dark',     'physical', 60,    0, 20),
  'night-slash':    createMove('night-slash',    'dark',     'physical', 70,  100, 15),
  'sucker-punch':   createMove('sucker-punch',   'dark',     'physical', 70,  100,  5),
  'knock-off':      createMove('knock-off',      'dark',     'physical', 65,  100, 20),
  'darkest-lariat': createMove('darkest-lariat', 'dark',     'physical', 85,  100, 10),
  'dark-pulse':     createMove('dark-pulse',     'dark',     'special',  80,  100, 15),
  'nasty-plot':     createMove('nasty-plot',     'dark',     'status',    0,    0, 20),
  'pay-day':        createMove('pay-day',        'normal',   'physical', 40,  100, 20),
  'tearful-look':   createMove('tearful-look',   'normal',   'status',    0,    0, 20),

  // ── Steel-type moves ──
  'iron-tail':      createMove('iron-tail',      'steel',    'physical', 100, 75,  15),
  'steel-wing':     createMove('steel-wing',     'steel',    'physical', 70,  90,  25),
  'metal-claw':     createMove('metal-claw',     'steel',    'physical', 50,  95,  35),
  'meteor-mash':    createMove('meteor-mash',    'steel',    'physical', 90,  90,  10),
  'bullet-punch':   createMove('bullet-punch',   'steel',    'physical', 40,  100, 30),
  'flash-cannon':   createMove('flash-cannon',   'steel',    'special',  80,  100, 10),
  'king-shield':    createMove('king-shield',    'steel',    'status',    0,    0, 10),
  'hone-claws':     createMove('hone-claws',     'dark',     'status',    0,    0, 15),

  // ── Fairy-type moves ──
  'moonblast':      createMove('moonblast',      'fairy',    'special',  95,  100, 15),
  'dazzling-gleam': createMove('dazzling-gleam', 'fairy',    'special',  80,  100, 10),
  'moonlight':      createMove('moonlight',      'fairy',    'status',    0,    0,  5),
  'play-rough':     createMove('play-rough',     'fairy',    'physical', 90,  90,  10),
  'draining-kiss':  createMove('draining-kiss',  'fairy',    'special',  50,  100, 10),
  'charm':          createMove('charm',          'fairy',    'status',    0,  100, 20),

  // ── Normal-type status/utility (additional) ──
  'soft-boiled':    createMove('soft-boiled',    'normal',   'status',    0,    0, 5),
  'yawn':           createMove('yawn',           'normal',   'status',    0,    0, 10),
  'court-change':   createMove('court-change',   'normal',   'status',    0,  100, 10),
  'morning-sun':    createMove('morning-sun',    'normal',   'status',    0,    0,  5),

  // ── Fighting-type moves (additional) ──
  'aura-sphere':    createMove('aura-sphere',    'fighting', 'special',  80,    0, 20),
} as const;

// ──────────────────────────────────────────
// Lookup Helpers
// ──────────────────────────────────────────

/**
 * Retrieve a move by its slug ID.
 *
 * @param id - Move slug, e.g. "thunder-shock"
 * @returns The frozen Move object
 * @throws Error if the move ID is not found in the catalog
 *
 * Traceability: Every move returned traces to MOVE_CATALOG entries
 * whose values are sourced from PokeAPI move data.
 */
export function getMoveById(id: string): Move {
  const move = MOVE_CATALOG[id];
  if (!move) {
    throw new Error(
      `Move not found: "${id}". ` +
      `Check that the move ID exists in MOVE_CATALOG (src/data/move-catalog.ts). ` +
      `Available moves: ${Object.keys(MOVE_CATALOG).length} entries.`
    );
  }
  return move;
}

/**
 * Resolve an array of move IDs into a tuple of exactly 4 Move objects.
 *
 * @param moveIds - Array of exactly 4 move slug strings
 * @returns A tuple of 4 Move objects in the same order as the input
 * @throws Error if any move ID is not found or if the array length is not 4
 *
 * Traceability: Each returned Move traces to MOVE_CATALOG.
 * Used by team-generation logic to hydrate BattlePokemon.moves.
 */
export function getMovesForPokemon(
  moveIds: readonly string[],
): [Move, Move, Move, Move] {
  if (moveIds.length !== 4) {
    throw new Error(
      `Expected exactly 4 move IDs, received ${moveIds.length}. ` +
      `Move IDs: [${moveIds.join(', ')}]`
    );
  }

  return [
    getMoveById(moveIds[0]),
    getMoveById(moveIds[1]),
    getMoveById(moveIds[2]),
    getMoveById(moveIds[3]),
  ];
}
