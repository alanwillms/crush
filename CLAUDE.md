# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build
npm run serve    # Preview production build
```

No lint or test scripts are configured.

## Architecture

A match-3 puzzle game (Candy Crush style) built with TypeScript, Vite, and FabricJS (HTML5 Canvas).

### Entry Point

`main.js` bootstraps the game: sets global config values on `window` (`_tileSize`, `_horizontalTiles`, `_verticalTiles`, `_pointerHeight`, `_piecesImages`), preloads sprite images, creates a FabricJS canvas, then instantiates `Game`.

### Class Responsibilities

- **`Game`** (`src/game.ts`) — Top-level controller. Handles `mouse:down`/`mouse:up` FabricJS events, validates that the target swap is adjacent and in-bounds, calls `board.swap()`, reverts if no matches, plays sound, updates `Pointer` stats.

- **`Board`** (`src/board.ts`) — 9×9 grid (`pieces: Piece[][]`). Owns the full game loop: `fillBoard()` → `getMatches()` → `removeMatches()` → `dropPieces()` → cascade via `animateRemoveMatches()`. Uses matrix transposition internally for column-wise piece dropping. Board is locked during animation to block user input.

- **`Piece`** (`src/piece.ts`) — A single circle tile. Has a `type` (1–6 mapped to sprite), row, column, uuid. Key methods: `move()` (500 ms FabricJS animation), `animateDestroy()`, `regenerate()` (replaces with a new random piece).

- **`Pointer`** (`src/pointer.ts`) — Renders a score line on canvas: `"{destroyed} pieces {moves} movements"`.

- **`Sound`** (`src/sound.ts`) — Plays `move.wav` on valid swap.

- **`piece-types.ts`** — Maps piece type numbers (1–6) to sprite paths in `/pieces/`.

### Sprites & Assets

Colored circle sprites live in `/pieces/01.png`–`/pieces/06.png`. Background texture is `pattern.png`. Sound is `move.wav`.
