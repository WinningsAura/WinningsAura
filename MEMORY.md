# MEMORY.md

## User Preferences
- User expects continuity across sessions and wants important context persisted.
- User prefers direct iterative website edits with immediate deploys to Vercel.

## Active Project: WinningsAura Website
- Repo/workspace path: `C:\Users\yagna\.openclaw\workspace\winnings-web`
- Live site: `https://winnings-aura.vercel.app`
- Core data source workflow currently stabilized as:
  - Update `data/Winnings.xlsx`
  - Sync to `data/winnings-sheets/*.csv`
  - App API prefers CSV snapshots for consistent rendering.

## Latest Stable State (2026-02-24)
- Privacy policy page exists and is linked in footer.
- Footer includes About Us, Contact Us, Privacy Policy links.
- About page content restored in CSV snapshot.
- Tennis page:
  - Currency formatting fixes applied.
  - WTA 250 non-tournament column removed.
  - Grand Slams category buttons styled consistently with ATP/WTA buttons.
  - Tennis-court header visual shown for both Grand Slams and ATP/WTA views.
- Golf page:
  - Header visual improved.
  - Menu dropdown layering/click/hover issues fixed.
  - Women’s event name mojibake fixed.
- Cricket page:
  - Header visual added.
  - Menu clipping fixed.
  - Central Contracts table headers standardized to: Country, Central Retainer, Test Fee, ODI Fee, T20 Fee.

## Notes
- Multiple website changes were committed and pushed throughout the session; user confirmed current look is good.
- Compare Sports rule (2026-03-24): For Tennis Grand Slams, treat displayed prize values as Men's reference and use the same values for comparisons (including Women filter until dedicated split data is added).
- Compare Sports rule (2026-03-24): Golf and Cricket Women categories are available in current source sheets and must be included in Women-filter comparisons.
