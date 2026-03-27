# Spin7 — Project Status

_Last updated: 2026-03-23_

---

## What It Is

Spin7 is a multiplayer word-scoring game. Every round all players see the same 8 letters and secretly submit one word. When everyone has submitted, words are revealed simultaneously, scores are updated, and a new rack is spun. The player who first hits the score target wins the meta-round; most meta-round wins takes the match.

**Live URLs**
- Frontend: https://pcleddy.github.io/spin7/
- API: https://masterp99-spin7-api.hf.space
- Repo: https://github.com/pcleddy/spin7

---

## Component Status

### API (`spin7-api/`) — ✅ Functional

FastAPI v3.0.0, deployed on HuggingFace Spaces (Docker, port 7860).

**Implemented endpoints:**

| Method | Path | Status |
|--------|------|--------|
| `POST` | `/spin7` | ✅ |
| `POST` | `/spin7/{id}/join` | ✅ |
| `POST` | `/spin7/{id}/start` | ✅ |
| `GET`  | `/spin7/{id}` | ✅ |
| `POST` | `/spin7/{id}/play` | ✅ |
| `POST` | `/spin7/{id}/pass` | ✅ |
| `POST` | `/spin7/{id}/check_word` | ✅ (live dictionary validation) |
| `POST` | `/spin7/{id}/continue` | ✅ (advances to next meta-round) |
| `POST` | `/spin7/{id}/rematch` | ✅ (same players, fresh match) |
| `POST` | `/spin7/{id}/chat` | ✅ |
| `GET`  | `/health` | ✅ |

**Key mechanics implemented:**
- Simultaneous play — all players submit secretly before reveal
- Meta-round structure (1/3/5 meta-rounds, configurable score target)
- Score resets each meta-round; meta-win tallied to overall winner
- Joker (`*`) tile: covers one missing letter family, with repeat-letter penalty
- Length bonus: +2 pts per letter beyond 7
- Guaranteed vowel in every rack
- Dictionary: sowpods (~267k words) with NLTK fallback
- Auto-start when lobby fills; auto-expire after 4 hours
- Up to 6 players

### Frontend (`spin7-frontend/`) — ✅ Functional

Single `index.html`, served via GitHub Pages. No build step.

**Implemented:**
- Setup → Lobby → Game → Game Over flow
- Simultaneous play UI: submit locks in, shows who has submitted (not what)
- Round reveal with best-word summary and tone (green/yellow/red by score)
- Slot-reel letter animation on new racks
- Live word feedback: letters highlight as you type, real-time point preview
- Scoreboard with progress bars and meta-win counts
- Permanent right-rail side panel: in-game chat + past board history
- Meta-round celebration banner with continue flow
- Rematch flow
- Saved settings (last username, game settings)
- Auto-filled name, `?game=GAMEID` join links
- `sessionStorage` persistence across refresh

---

## SPEC.md Is Outdated

`SPEC.md` describes an earlier turn-based design and is no longer accurate. Key divergences:

| Topic | SPEC.md | Actual |
|-------|---------|--------|
| Play style | Turn-based (one active player) | Simultaneous (everyone submits each round) |
| Game structure | `num_rounds` flat rounds | `num_meta_rounds` with score reset each meta-round |
| Max players | 4 | 6 |
| Score target default | 100 | 200 |
| Game state fields | `current_player`, `turn_number`, `round_number` | `submitted_players`, `meta_round`, `round_num` |
| Missing endpoints | — | `/check_word`, `/continue`, `/rematch`, `/chat` not in SPEC |

---

## Recent Development (git log summary)

**API** — 16 commits from init to current:
- Core init → meta-rounds, blank tile, simultaneous play → sowpods dictionary → joker rules, house scoring, 8-letter racks, length bonus → rematch + 6-player support → live `/check_word` endpoint

**Frontend** — 15 commits:
- Init → meta-round UI, chat panel → simultaneous play UI → slot-reel animation → joker tile + house scoring → rematch flow + 6-player setup → side panel (chat + past boards)

---

## Known Limitations / Gaps

- **In-memory state only** — server restart wipes all active games
- **SPEC.md is stale** — should be rewritten to match current simultaneous-play architecture
- **No spectator mode** — any viewer who polls the game can see `current_letters`, which isn't a problem for simultaneous play but could leak info in theory
- **No persistence / accounts** — games live max 4 hours, no history across sessions
- **README in `spin7-api/`** still describes the NLTK-only dictionary and missing endpoints

---

## What's Next (suggested)

1. Rewrite `SPEC.md` to reflect simultaneous play and current API surface
2. Update `spin7-api/README.md` to list all endpoints and note sowpods dictionary
3. Consider a timed-submission mode (countdown per round) to prevent one player blocking the round indefinitely
4. Persistence (e.g., Redis or a lightweight DB) to survive server restarts
5. Spectator role that doesn't reveal letters until the round resolves
