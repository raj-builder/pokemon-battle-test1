# Changelog

## [2026-03-27] — Full redesign: Next.js migration with 2-player mode, battle engine, and mobile-first UI

### What changed
- Migrated from a single HTML file (1,565 lines) to a Next.js (App Router) + TypeScript + Tailwind CSS architecture
- Replaced CPU-first framing with 2-Player Battle as the default mode (UX-002)
- Added 3-step guided flow: Build Team → Arrange Order → Battle with step indicator (UX-001)
- Added private handoff flow for 2-player setup on one device (UX-003)
- Added mirrored-draw mode where both players get the same Pokemon pool (UX-004, BE-003)
- Built centralized deterministic battle engine with seeded randomness (BE-001, BE-002, BE-004)
- Implemented proper damage formula with type effectiveness, STAB, critical hits (BE-004)
- Added full 18×18 type effectiveness chart
- Normalized 83 fallback Pokemon into typed schema with 178 moves catalogued (BE-006)
- Added Zustand state management replacing 12+ global variables
- Added PokeAPI data caching with 24-hour TTL (CLAUDE.md Section 6)
- Added i18n support with English translation file (80+ strings)
- Added mobile-first responsive design with 44px touch targets (UX-010)
- Added persistent disclaimer footer for unofficial fan project status (UX-014)
- Added rules engine versioning for replay compatibility (BE-011)
- Added feature flags for gradual rollout (CLAUDE.md Section 2)
- Added structured telemetry logging stubs (BE-009)
- Preserved original app at /legacy.html for rollback

### Why
The original single-file app was CPU-focused and lacked the features needed for a serious offline practice simulator. This redesign transforms it into a 2-player local battle tool with proper type-based combat mechanics, deterministic replay support, and mobile-friendly UX — aligned with the product goal of serving global Pokemon card players who practice offline.

### Data & calculation notes
- Damage formula changed from `floor((atk/def) * random(40-70) * 0.5)` to simplified Gen V: `floor(((2*50/5+2) * power * atk/def) / 50 + 2) * STAB * typeEff * crit * variance[0.85-1.0]`
- Move powers now use actual game data instead of hash-based estimation
- HP values unchanged (still sourced from PokeAPI base stats)
- Type effectiveness uses standard Gen VI+ chart (18×18 matrix)

### Upgrade notes for the next engineer or AI session
- Run `npm install` to set up dependencies
- Run `npm run build` to verify the build succeeds
- Run `npm run dev` for local development
- The `.env.example` file documents all environment variables
- Original app preserved at `public/legacy.html`
- P1 enhancements (UX-005 through UX-013, BE-007, BE-008, BE-010) are next priority
- i18n strings are in `messages/en.json` — add locale files for other languages
- Match history persistence (BE-008) and onboarding (UX-011) feature flags default to off

### Credits & third-party use
- PokeAPI (https://pokeapi.co/) — Pokemon data, fair use, non-commercial. Attribution in UI footer.
- PokeAPI Sprites (GitHub) — Pokemon sprites, Nintendo/Creatures/GAME FREAK property, fan use only.
- Google Fonts — Press Start 2P (SIL OFL 1.1), Inter (SIL OFL 1.1).
- seedrandom (npm) — MIT license, seeded PRNG.
- Zustand (npm) — MIT license, state management.
- @dnd-kit (npm) — MIT license, drag-and-drop (installed, integration pending).
- @radix-ui/react-dialog (npm) — MIT license, accessible modals (installed, integration pending).
- framer-motion (npm) — MIT license, animations (installed, integration pending).
