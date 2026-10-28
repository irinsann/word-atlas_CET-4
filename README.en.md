# Word Atlas · CET-4 free-study edition

Uses the supplied Words_all.md and a third-party core wordbook. After spelling corrections and duplicate merges there are 4,843 entries: 4,558 in the default CET-4 learning pool (outline vocabulary and explicitly labeled foundational supplements), and 285 in an optional extension pool (211 CET-6 words/listed family forms and 74 additional words outside the outline). All 305 previously unmatched items have individual review decisions. New words, due reviews, distractors and typing exercises stay within the selected pool. Each pool prioritizes relevant core words and retains stable mixed order. See the [scope review](docs/vocabulary-review.md). No fixed-day schedule or daily allowance remains.

[Use the app online](https://irinsann.github.io/word-atlas_CET-4/). No installation or account is required. Progress stays in the current browser; export a backup from the profile page to transfer it.

For local use, run `npm ci` then `npm run dev`, or double-click `start-cet4.cmd`. Open http://127.0.0.1:5194/. Local and online progress are stored separately. See README.md for details and source provenance.

GitHub Pages is deployed automatically by `.github/workflows/pages.yml` on pushes to `main`, after tests, vocabulary validation and a production build. Set the repository's Pages source to GitHub Actions. The build reads the configured Pages base path, supporting both repository subdirectories and custom domains.

Based on https://github.com/designfuchen/word-atlas. Original code: MIT. Reused content: Word Atlas contributors — CC BY 4.0. This fork is independently maintained by irinsann.
