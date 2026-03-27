# Pokemon Battle Simulator

**Unofficial fan-made Pokemon battle simulator for offline practice.**

Not affiliated with Nintendo, Creatures Inc., or GAME FREAK Inc. Not for commercial use.

## What is this?

A web-based 5v5 Pokemon team battle simulator designed for players who own physical Pokemon cards and want to:
- Practice building Pokemon sequences and hands
- Compare tactical decisions before real offline battles
- Run local 2-player battles on one shared device
- Reduce luck bias with mirrored-draw mode

## Features

- **2-Player Local Battle** — Two players take turns on one device with privacy handoff screens
- **Practice vs CPU** — Battle against an AI opponent
- **AI Simulation** — Watch both sides auto-play at adjustable speed
- **Mirrored Draw** — Both players draw from the same pool for fair tactical comparison
- **3-Step Flow** — Build Team → Arrange Order → Battle
- **83 Pokemon** from all 9 generations with 178 moves
- **Type Effectiveness** — Full 18×18 type chart with STAB, critical hits, and damage variance
- **Deterministic Engine** — Seeded randomness for reproducible battles
- **Mobile-First** — Responsive design with 44px touch targets
- **Offline Support** — Works without internet using cached/fallback data

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Test

```bash
npm test
```

## Project Structure

```
src/
├── app/                    # Next.js pages (App Router)
│   ├── play/               # Game flow: build → arrange → battle
│   └── layout.tsx          # Root layout with footer disclaimer
├── components/             # React components
│   ├── battle/             # Battle HUD, panels, log
│   ├── cards/              # TCG card display
│   ├── handoff/            # Privacy screen for 2-player
│   └── layout/             # Header, step indicator
├── engine/                 # Framework-agnostic battle logic
│   ├── types.ts            # Core type definitions
│   ├── battle-engine.ts    # Centralized battle resolution
│   ├── damage-calculator.ts # Deterministic damage formula
│   ├── type-effectiveness.ts # 18×18 type chart
│   ├── seeded-random.ts    # Seeded PRNG
│   └── mirrored-draw.ts   # Mirrored draw pool generation
├── data/                   # Static Pokemon and move data
├── store/                  # Zustand state management
└── services/               # API fetching and caching
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State**: Zustand
- **Data**: PokeAPI v2 (cached) + offline fallback
- **Deployment**: Vercel

## Environment Variables

See `.env.example` for all variables.

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_POKEAPI_BASE_URL` | PokeAPI base URL | `https://pokeapi.co/api/v2` |

## Data Attribution

- Pokemon data provided by [PokeAPI](https://pokeapi.co/) under fair use
- Pokemon is a trademark of Nintendo, Creatures Inc., and GAME FREAK Inc.
- This is an unofficial fan project — not for commercial use

## License

This project is for personal, non-commercial use only.
