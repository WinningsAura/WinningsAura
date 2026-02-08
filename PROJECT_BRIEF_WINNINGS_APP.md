# Project Brief — Winnings App

## Project Name
Winnings App (Sports Prize Money Viewer)

## Purpose
A web app to display prize money data from the provided Excel file (`Winnings.xlsx`) with a glossy UI and sport/category selection.

## Current Scope
- Local-first build (before cloud deployment)
- No authentication/login
- Readable, glossy dashboard UI
- Ability to switch sport/category view

## Input Data
- Source file: `Winnings.xlsx`
- Converted snapshot: `winnings.csv`
- Current dataset structure is primarily **prize tiers by round/category** (Singles/Doubles/Mixed Doubles), not full player-by-player winnings history.

## Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Hosting target (recommended): Vercel

## Implementation Done
- Generated project at: `winnings-web/`
- Added UI with:
  - Player name input (for context/display)
  - Category selector: Singles / Doubles / Mixed Doubles
  - Prize-money table by round and tournament
- Added structured data file:
  - `winnings-web/src/data/winnings.ts`
- Main app page:
  - `winnings-web/src/app/page.tsx`

## Run Locally
```powershell
cd C:\Users\yagna\.openclaw\workspace\winnings-web
npm install
npm run dev
```
Open: `http://localhost:3000`

## Known Notes
1. The uploaded sheet currently does not map winnings directly per individual player record.
2. If a player-level sheet is provided later, app can be upgraded to:
   - player search + exact total winnings
   - sport filter + event/year filters
   - charts/trends and ranking views

## Deployment Options Considered
1. Vercel (best for this Next.js app)
2. Render/Railway
3. Docker + VPS (advanced control)

## Recommended Next Steps
1. Confirm final data model (category-level vs player-level).
2. If player-level data exists, share expanded sheet and map columns.
3. Add sorting/filtering and currency formatting improvements.
4. Run production build test: `npm run build`.
5. Deploy to Vercel and attach domain.

## Quick Recall Summary
"Winnings app is a Next.js + Tailwind local web dashboard built from `Winnings.xlsx`, currently showing prize tiers by round/category with a glossy UI and sport selection. Next milestone is deploy to Vercel and/or upgrade to true player-level winnings when richer data is provided."
