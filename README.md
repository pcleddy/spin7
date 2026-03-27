# Spin7

Play the game: [https://pcleddy.github.io/spin7/](https://pcleddy.github.io/spin7/)

GitHub repo: [https://github.com/pcleddy/spin7](https://github.com/pcleddy/spin7)

## Project Layout

- `index.html` — GitHub Pages frontend
- `game_logic.js` — shared frontend scoring/spelling helpers
- `board_logic.js` — shared board/rejoin helpers
- `SPEC.md` — product and technical spec
- `GAMES.md` — shared board/lifecycle base spec
- `TESTS.md` — shared testing base spec
- `run_tests.sh` — local project test runner for frontend + sibling API repo

Sibling repo:

- `../spin7-api/` — FastAPI backend

## Testing

```bash
node --test tests/frontend_logic.test.js
```

Project-wide local runner:

```bash
./run_tests.sh
```
