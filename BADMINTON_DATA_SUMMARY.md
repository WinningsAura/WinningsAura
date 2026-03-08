# Badminton Prize-Money Data Summary (2024–2026)

## Files created
- `winnings-web/data/winnings-sheets/Badminton_2024.csv`
- `winnings-web/data/winnings-sheets/Badminton_2025.csv`
- `winnings-web/data/winnings-sheets/Badminton_2026.csv`

## Coverage included
- 3 seasons (2024, 2025, 2026)
- All 5 disciplines in each included event row:
  - MS, WS, MD, WD, XD
- BWF World Tour major tiers represented each season (World Tour Finals + Super 1000 core events)
- Major events included:
  - 2024 Olympic badminton
  - 2025 BWF World Championships
  - 2026 continental placeholder (Asian Championships)

## Source strategy used
Because direct access to BWF official domains (`bwfbadminton.com` / corporate BWF pages) was blocked by Cloudflare from this environment, I used publicly accessible event-level season pages as fallback references (primarily Wikipedia season pages), and an official Olympics event page for Paris 2024.

## Data quality notes / current status
1. **Second pass completed (official regulation-based payouts)**
   - Round-level payouts for BWF World Tour events now populated using BWF official regulation tables from:
   - `https://system.bwfbadminton.com/documents/folder_1_81/Statutes/CHAPTER-5---TECHNICAL-REGULATIONS/Section%205.3.5%20-%20Distribution%20of%20Prize%20Money.pdf`
   - Applied tables:
     - Grade 2, Level 2 & 3 (Super 1000 events): Table 2
     - Grade 2, Level 1 (World Tour Finals): Table 1
2. **How values were computed**
   - Amounts are calculated as: `event total purse × BWF percentage`.
   - Doubles amounts are per pair (as specified by BWF table note `* per pair`).
3. **Still intentionally `N/A`**
   - Non-World-Tour placeholder rows (e.g., Olympics/World Championships/Asian Championships) remain `N/A` where no compatible official per-round purse table was used in this pass.
4. **2026 season caveat**
   - 2026 rows still depend on published purse totals available at extraction time; if organizers revise purse totals, computed payouts should be recalculated.

## Recommended follow-up
For tournament-specific overrides (if any event deviates from the default distribution tables), verify against each tournament's official prospectus PDF and replace computed values where needed.