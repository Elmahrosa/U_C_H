#!/usr/bin/env bash
set -e
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
PIDS=()
cleanup() { for pid in "${PIDS[@]}"; do kill "$pid" 2>/dev/null || true; done; }
trap cleanup EXIT INT TERM

echo -e "${BLUE}=== U_C_H Enterprise Demo ===${NC}"
cd backend
[ ! -f ".env" ] && cp .env.example .env 2>/dev/null
npm install --silent
npm run start &
PIDS+=($!)
cd ..

for i in {1..30}; do
  curl -sf http://localhost:5000/health > /dev/null 2>&1 && echo -e "${GREEN}Backend ready${NC}" && break
  sleep 1
done

cd frontend
npm install --silent
npm run start &
PIDS+=($!)
cd ..

sleep 3
echo -e "${GREEN}Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "${GREEN}Backend:  ${BLUE}http://localhost:5000/health${NC}"
echo -e "${YELLOW}Ctrl+C to stop${NC}"
wait
