# Spin7 — Technical Specification

_Current as of 2026-03-23 · API v3.0.0_

---

## Overview

Spin7 is a multiplayer word-scoring game for 2–6 players. Every round all players see the **same 8 letters** and secretly submit one word. When the last player submits, the round resolves simultaneously — all words are revealed, scores are updated, and a fresh rack is spun. The first player whose cumulative score reaches or exceeds the score target wins that **meta-round**. Most meta-round wins takes the match.

**Live URLs**
- Frontend: https://pcleddy.github.io/spin7/
- API: https://masterp99-spin7-api.hf.space
- Repo: https://github.com/pcleddy/spin7

---

## Game Rules

### Setup (Creator Choices)

| Setting | Options | Default |
|---------|---------|---------|
| Meta-rounds | 1, 3, 5 | 3 |
| Score target (meta-round win) | 100, 200, 500, 1000 | 200 |
| Max players | 2–6 | 2 |

### Round Structure

1. All players see the **same rack** of 8 unique letters (guaranteed to contain at least one vowel).
2. Each player secretly submits one word — or passes — before anyone else's choice is revealed.
3. Once every player has submitted, the round **resolves**: all words are shown simultaneously, points are added to each player's score.
4. If any player's cumulative score has reached the target, the meta-round ends (see below). Otherwise a new rack is spun and the next round begins.

### Word Rules

- Must be 2–20 letters.
- Must be spelled using only letters present in the current rack. Any shown letter may be used more than once in the word.
- One **joker tile** (`*`) may be in the rack. It can substitute for exactly one missing letter family (see Joker section).
- Must exist in the dictionary.

### Pass

A player may pass instead of playing a word. A pass scores 0 points and still counts as a submission for the round.

### Meta-Round End

When one or more players hit the score target after a round resolves:

- The player with the highest score wins the meta-round (tie goes to the earlier joiner).
- That player's `meta_wins` counter increments.
- All players' scores reset to 0.
- If more meta-rounds remain, a **continue banner** is displayed until any player calls `/continue`.
- If all meta-rounds are done, the match ends. The player with the most meta-round wins is the match winner (tie goes to the earlier joiner).

### Lobby Auto-Start

If the lobby fills to `max_players` before the creator manually starts, the game auto-starts immediately.

---

## Scoring

### Letter Values

| Pts | Letters |
|-----|---------|
| 1 | A E I O U L N S T R |
| 2 | D G |
| 3 | B C M P |
| 4 | F H V W Y |
| 6 | K |
| 7 | J X |
| 9 | Q Z |
| 0 | `*` (joker) |

### Formula

```
score = base_points − joker_repeat_penalty + length_bonus

base_points         = Σ letter_value(ch) for ch in word
length_bonus        = max(0, word_length − 7) × 2
joker_repeat_penalty = max(0, count(joker_letter_in_word) − 1) × value(joker_letter)
```

The `joker_repeat_penalty` only applies when a joker tile was used. It deducts the face value of the substituted letter for each additional occurrence of that letter beyond the first.

---

## Joker Tile (`*`)

- If the rack contains a `*`, a player may use it to substitute for **exactly one missing letter family**.
- The joker covers all occurrences of that letter needed by the word (e.g., if the word needs two Ss and S is not in the rack, the joker covers both — but the repeat penalty applies for the second S).
- The joker tile itself is worth 0 points.
- A word that can be spelled from the non-joker letters in the rack does not consume the joker.

---

## Letter Distribution

Letters are drawn without replacement from a weighted bag so every rack has 8 unique symbols:

```
A=7  B=2  C=2  D=4  E=9  F=2  G=3  H=2  I=7  J=1  K=1  L=4  M=2
N=6  O=6  P=2  Q=1  R=6  S=4  T=6  U=3  V=2  W=2  X=1  Y=2  Z=1  *=3
```

If the drawn rack contains no vowel, one non-vowel, non-joker tile is replaced with a randomly weighted vowel.

---

## Dictionary

- Primary: `sowpods.txt` (full tournament word list, ~267k words)
- Fallback: NLTK `words` corpus, used only if `sowpods.txt` is missing or fails a sanity check (< 50k words)
- Words filtered to alphabetic, length 2–20, stored uppercase
- `/health` reports the active source and dictionary size

---

## API

**Base URL:** `https://masterp99-spin7-api.hf.space`
**Framework:** FastAPI v3.0.0 · Python 3.11

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/spin7` | none | Create game |
| `POST` | `/spin7/{id}/join` | none | Join as player |
| `POST` | `/spin7/{id}/start` | creator token | Manually start game |
| `GET`  | `/spin7/{id}` | none | Poll game state |
| `POST` | `/spin7/{id}/play` | player token | Submit a word |
| `POST` | `/spin7/{id}/pass` | player token | Pass (0 pts) |
| `POST` | `/spin7/{id}/check_word` | player token | Validate a word without submitting |
| `POST` | `/spin7/{id}/continue` | player token | Advance to next meta-round |
| `POST` | `/spin7/{id}/rematch` | player token | Restart match with same players and settings |
| `POST` | `/spin7/{id}/chat` | player token | Send a chat message |
| `GET`  | `/health` | none | Health check + dictionary info |

---

### Request / Response Shapes

**POST /spin7**
```json
{
  "username": "alice",
  "num_meta_rounds": 3,
  "score_target": 200,
  "max_players": 2
}
→ { "game_id": "A1B2C3D4", "player_token": "<uuid>" }
```

**POST /spin7/{id}/join**
```json
{ "username": "bob" }
→ { "game_id": "...", "player_token": "<uuid>", "username": "bob" }
```
If the username is already taken, a numeric suffix is appended automatically. If joining fills the lobby, the game auto-starts.

**POST /spin7/{id}/start**
```json
{ "player_token": "<creator-uuid>" }
→ <game state>
```
Only the creator (index 0 player) may call this. Requires ≥ 2 players.

**GET /spin7/{id}**
```json
→ {
  "game_id": "A1B2C3D4",
  "status": "waiting|playing|finished",
  "num_meta_rounds": 3,
  "meta_round": 1,
  "round_num": 4,
  "score_target": 200,
  "max_players": 2,
  "players": [
    {
      "username": "alice",
      "score": 47,
      "meta_wins": 1,
      "history": [
        {
          "meta_round": 1,
          "round": 1,
          "word": "QUEST",
          "letters": ["Q","U","E","S","T","A","N","H"],
          "points": 14,
          "base_points": 14,
          "length_bonus": 0,
          "joker_letter": null,
          "joker_repeat_penalty": 0
        }
      ]
    }
  ],
  "current_letters": ["A","B","C","D","E","F","G","H"],
  "submitted_players": ["alice"],
  "meta_round_banner": null,
  "winner": null,
  "log": ["...last 20 events..."],
  "chat": ["...last 40 messages..."],
  "last_round_summary": { ... },
  "round_history": [ ... ]
}
```

Note: `submitted_players` lists who has submitted but **not what** — words remain hidden until all players have submitted.

**POST /spin7/{id}/play**
```json
{ "player_token": "<uuid>", "word": "quest" }
→ <game state>
```

**POST /spin7/{id}/pass**
```json
{ "player_token": "<uuid>" }
→ <game state>
```

**POST /spin7/{id}/check_word**
```json
{ "player_token": "<uuid>", "word": "quest" }
→ { "word": "QUEST", "in_dictionary": true }
```
Does not advance game state. Used by the frontend for live word feedback.

**POST /spin7/{id}/continue**
```json
{ "player_token": "<uuid>" }
→ <game state>
```
Clears the meta-round banner and starts the next meta-round. Any player may call this.

**POST /spin7/{id}/rematch**
```json
{ "player_token": "<uuid>" }
→ <game state>
```
Only valid when `status` is `"finished"`. Resets all scores, wins, and history; keeps the same players and settings.

**POST /spin7/{id}/chat**
```json
{ "player_token": "<uuid>", "message": "nice word!" }
→ { "ok": true }
```
Message is trimmed and capped at 200 characters. Last 40 messages are returned in game state.

---

### Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad request — invalid settings, word can't be formed, already submitted, game not in the right state |
| 403 | Wrong token or insufficient permissions |
| 404 | Game not found |

---

## State Machine

```
waiting → (start or lobby fills, ≥2 players) → playing ⇄ [meta_round_banner] → finished
                                                                                      ↓
                                                                               (rematch) → playing
```

- **`waiting`** — players may join; game has not started
- **`playing`** — active game; players submit words each round; `meta_round_banner` is set between meta-rounds (play/pass are blocked until `/continue` is called)
- **`finished`** — read-only; `winner` is set; `/rematch` is available

---

## Infrastructure

| Component | Host | Notes |
|-----------|------|-------|
| API | HuggingFace Spaces (`masterp99/spin7-api`) | Docker SDK, port 7860 |
| Frontend | GitHub Pages (`pcleddy/spin7`) | Single `index.html`, no build step |

- Game state is **in-memory** — server restart clears all active games
- Games auto-expire after **4 hours** (cleaned up lazily on the next `/spin7` create call)
- No authentication, no database, no accounts

---

## Frontend

- Single-file `index.html` (HTML + CSS + JS, no dependencies, no build step)
- Purple/pink gradient theme
- **Screens:** Setup → Lobby → Game → Game Over
- **Game screen layout:** main play area (letters, word input, scoreboard) + permanent right-rail side panel (chat + past board history)
- URL param `?game=GAMEID` pre-fills a join link for easy sharing
- `sessionStorage` stores `gameId` + `playerToken` — survives page refresh, clears on tab close
- **Rack animation:** letters animate in with a slot-reel `spin-in` keyframe each new round
- **Live word feedback:** letters highlight as you type; point preview updates in real time; `/check_word` validates against the dictionary before submission
- **Simultaneous play UI:** after submitting, player sees a "waiting" state showing only who has submitted, not what
- **Round reveal:** all words shown simultaneously with a best-word summary and tone (green / yellow ≥ 21 pts / red ≥ 31 pts)
- **Meta-round banner:** full-screen celebration with continue button between meta-rounds
- **Scoreboard:** progress bars toward target, meta-win counts per player, last 5 words as chips
- **Chat panel:** persistent right rail; visible during lobby and game
- **Board history panel:** past round results accessible in the right rail during play
- Polls `/spin7/{id}` every 1500 ms during active game
- Settings (username, game config) persisted in `localStorage`

---

## Known Limitations

- In-memory state only — no persistence across server restarts
- No spectator mode (all pollers see `current_letters`, though words are hidden until round resolves)
- No timed-submission mode — one slow player blocks the round indefinitely
