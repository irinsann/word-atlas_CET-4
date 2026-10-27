# Word Atlas · CET-4 free-study edition

Uses the supplied Words_all.md: 4,449 source rows deduplicated into 4,445 entries, preserving distinct meanings, pronunciation variants and case-sensitive headwords. No fixed-day schedule or daily allowance remains. Choose optional rounds, browse A–Z and review with FSRS.

[Use the app online](https://irinsann.github.io/word-atlas_CET-4/). No installation or account is required. Progress stays in the current browser; export a backup from the profile page to transfer it.

For local use, run `npm ci` then `npm run dev`, or double-click `start-cet4.cmd`. Open http://127.0.0.1:5194/. Local and online progress are stored separately. See README.md for details and source provenance.

GitHub Pages is deployed automatically by `.github/workflows/pages.yml` on pushes to `main`, after tests, vocabulary validation and a production build. Set the repository's Pages source to GitHub Actions. The build uses the repository name as its base path.

Based on https://github.com/designfuchen/word-atlas. Original code: MIT. Reused content: Word Atlas contributors — CC BY 4.0. This fork is independently maintained by irinsann.
