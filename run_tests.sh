#!/usr/bin/env bash
set -euo pipefail

FRONTEND_ROOT="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$FRONTEND_ROOT/.." && pwd)"

source ~/bin/venv/bin/activate

echo "== Backend logic tests =="
(cd "$PROJECT_ROOT/spin7-api" && pytest tests/test_game_logic.py)

echo
echo "== Backend API tests =="
(cd "$PROJECT_ROOT/spin7-api" && pytest tests/test_api.py)

echo
echo "== Frontend logic tests =="
(cd "$FRONTEND_ROOT" && node --test tests/frontend_logic.test.js)

echo
echo "== Frontend script syntax =="
awk '/<script>/{flag=1;next}/<\/script>/{flag=0}flag' "$FRONTEND_ROOT/index.html" > /tmp/spin7_frontend.js
node --check /tmp/spin7_frontend.js

echo
echo "All local tests passed."
