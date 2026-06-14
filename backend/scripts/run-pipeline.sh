#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3001}"
URL="http://localhost:${PORT}/pipeline/run"
LOG_DIR="$(dirname "$0")/../logs"
LOG_FILE="${LOG_DIR}/pipeline.log"

mkdir -p "$LOG_DIR"

echo "" >> "$LOG_FILE"
echo "=== $(date '+%Y-%m-%d %H:%M:%S') ===" >> "$LOG_FILE"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  --max-time 600)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP $HTTP_CODE" >> "$LOG_FILE"
echo "$BODY" >> "$LOG_FILE"

if [ "$HTTP_CODE" != "200" ]; then
  echo "[pipeline cron] FAILED — HTTP $HTTP_CODE. Check $LOG_FILE" >&2
  exit 1
fi

echo "[pipeline cron] OK — $(date '+%Y-%m-%d %H:%M:%S')"
