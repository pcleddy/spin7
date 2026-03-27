#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$ROOT/.local-run"
API_URL="${SPIN7_API_URL:-http://127.0.0.1:8001}"
PORT="${SPIN7_PREVIEW_PORT:-8000}"
SERVE=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --build-only)
      SERVE=0
      shift
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    --api)
      API_URL="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: ./run_local_preview.sh [--build-only] [--port 8000] [--api http://127.0.0.1:8001]" >&2
      exit 1
      ;;
  esac
done

mkdir -p "$OUT_DIR"

sed -E "s|^const API = '.*';$|const API = '${API_URL}';|" "$ROOT/index.html" > "$OUT_DIR/index.html"
cp "$ROOT/game_logic.js" "$OUT_DIR/game_logic.js"
cp "$ROOT/board_logic.js" "$OUT_DIR/board_logic.js"

cat <<EOF
Local preview files are ready in:
  $OUT_DIR

Backend API:
  $API_URL
EOF

if [[ "$SERVE" -eq 0 ]]; then
  exit 0
fi

echo
echo "Serving local preview at http://127.0.0.1:${PORT}"
python3 -m http.server "$PORT" --directory "$OUT_DIR"
