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

## Local Preview

Build a local frontend copy that points at a local API and stores the files in an ignored repo directory:

```bash
./run_local_preview.sh --build-only
```

Serve it directly:

```bash
./run_local_preview.sh
```

Defaults:

- frontend files go to `.local-run/`
- frontend serves on `http://127.0.0.1:8000`
- API target is `http://127.0.0.1:8001`

You can override those with:

```bash
SPIN7_API_URL=http://127.0.0.1:9001 SPIN7_PREVIEW_PORT=8010 ./run_local_preview.sh
```
