#!/bin/bash
set -euo pipefail

# =============================================================================
# TurnoLink — Zero-downtime deploy script
# Usage:
#   ./scripts/deploy.sh          # deploy all (api + web)
#   ./scripts/deploy.sh web      # deploy only web
#   ./scripts/deploy.sh api      # deploy only api
#   ./scripts/deploy.sh db       # run migration only (no restart)
# =============================================================================

ROOT="/var/www/turnolink/backend"
cd "$ROOT"

COMPONENT="${1:-all}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="/var/log/turnolink-deploy-${TIMESTAMP}.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1" | tee -a "$LOG_FILE"; }
ok()  { echo -e "${GREEN}[$(date +%H:%M:%S)] ✓${NC} $1" | tee -a "$LOG_FILE"; }
warn(){ echo -e "${YELLOW}[$(date +%H:%M:%S)] ⚠${NC} $1" | tee -a "$LOG_FILE"; }
err() { echo -e "${RED}[$(date +%H:%M:%S)] ✗${NC} $1" | tee -a "$LOG_FILE"; exit 1; }

# --- Pre-flight checks ---
log "Deploy started: component=$COMPONENT"

# Check disk space (need at least 1GB free for build)
FREE_KB=$(df / --output=avail | tail -1 | tr -d ' ')
if [ "$FREE_KB" -lt 1048576 ]; then
  err "Less than 1GB disk free. Aborting. Run: du -sh /var/www/turnolink/backend/node_modules/.cache"
fi

# Check PM2 processes are running
if ! pm2 pid turnolink-api > /dev/null 2>&1; then
  err "PM2 process 'turnolink-api' not found"
fi
if ! pm2 pid web > /dev/null 2>&1; then
  err "PM2 process 'web' not found"
fi

# --- Git pull (if on main) ---
BRANCH=$(git branch --show-current)
if [ "$BRANCH" = "main" ]; then
  log "Pulling latest from origin/main..."
  git pull origin main --ff-only 2>&1 | tee -a "$LOG_FILE" || warn "Git pull failed — deploying local state"
fi

# --- Install deps if lockfile changed ---
if git diff HEAD@{1} --name-only 2>/dev/null | grep -q "pnpm-lock.yaml"; then
  log "Lockfile changed — installing dependencies..."
  pnpm install --frozen-lockfile 2>&1 | tee -a "$LOG_FILE"
  ok "Dependencies installed"
fi

# --- Database migration (always safe to run — Prisma skips if no pending) ---
run_migration() {
  log "Checking for pending migrations..."
  cd "$ROOT/apps/api"
  if npx --package=prisma@5 prisma migrate status 2>&1 | grep -q "pending"; then
    warn "Pending migrations found — applying..."
    npx --package=prisma@5 prisma migrate deploy 2>&1 | tee -a "$LOG_FILE"
    ok "Migrations applied"
  else
    ok "No pending migrations"
  fi
  # Always regenerate client in case schema changed
  npx --package=prisma@5 prisma generate 2>&1 | tee -a "$LOG_FILE"
  cd "$ROOT"
}

# --- Build API ---
build_api() {
  log "Building API..."
  START=$(date +%s)
  pnpm build:api 2>&1 | tee -a "$LOG_FILE"
  END=$(date +%s)
  ok "API built in $((END - START))s"
}

# --- Build Web ---
build_web() {
  log "Building Web..."
  START=$(date +%s)
  pnpm build:web 2>&1 | tee -a "$LOG_FILE"
  END=$(date +%s)
  ok "Web built in $((END - START))s"
}

# --- Graceful reload (zero-downtime) ---
reload_api() {
  log "Reloading API (graceful, rolling)..."
  pm2 reload turnolink-api --update-env 2>&1 | tee -a "$LOG_FILE"
  sleep 3
  # Verify health
  if curl -sf http://localhost:3001/api/health > /dev/null 2>&1; then
    ok "API healthy after reload"
  else
    warn "API health check failed — check logs: pm2 logs turnolink-api --lines 20"
  fi
}

reload_web() {
  log "Reloading Web (graceful, rolling)..."

  # Check if web is in crash loop or waiting state — if so, delete and restart fresh
  WEB_STATUS=$(pm2 jlist 2>/dev/null | python3 -c "
import sys,json
procs = json.load(sys.stdin)
for p in procs:
  if p['name'] == 'web':
    s = p.get('pm2_env',{}).get('status','')
    if s in ('errored','stopping','stopped'):
      print('dead'); sys.exit()
    r = p.get('pm2_env',{}).get('restart_time',0)
    if r > 10:
      print('unstable'); sys.exit()
print('ok')
" 2>/dev/null || echo "ok")

  if [ "$WEB_STATUS" = "dead" ] || [ "$WEB_STATUS" = "unstable" ]; then
    warn "Web in bad state ($WEB_STATUS) — doing fresh start instead of reload"
    pm2 delete web 2>&1 | tee -a "$LOG_FILE" || true
    pm2 start "$ROOT/ecosystem.config.js" --only web 2>&1 | tee -a "$LOG_FILE"
  else
    pm2 reload web --update-env 2>&1 | tee -a "$LOG_FILE"
  fi

  # Wait and verify — retry up to 15s
  local attempts=0
  while [ $attempts -lt 5 ]; do
    sleep 3
    if curl -sf http://localhost:3000 > /dev/null 2>&1; then
      ok "Web healthy after reload"
      pm2 save 2>&1 | tee -a "$LOG_FILE"
      return 0
    fi
    attempts=$((attempts + 1))
    warn "Web not responding yet (attempt $attempts/5)..."
  done

  # If still not responding, force fresh start
  warn "Web failed to respond — forcing fresh start..."
  pm2 delete web 2>&1 | tee -a "$LOG_FILE" || true
  pm2 start "$ROOT/ecosystem.config.js" --only web 2>&1 | tee -a "$LOG_FILE"
  sleep 5
  if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    ok "Web recovered after fresh start"
    pm2 save 2>&1 | tee -a "$LOG_FILE"
  else
    err "Web STILL not responding after fresh start. Manual intervention needed."
  fi
}

# --- Execute based on component ---
case "$COMPONENT" in
  all)
    run_migration
    build_api
    build_web
    reload_api
    reload_web
    ;;
  api)
    run_migration
    build_api
    reload_api
    ;;
  web)
    build_web
    reload_web
    ;;
  db)
    run_migration
    ;;
  *)
    err "Unknown component: $COMPONENT. Use: all, api, web, db"
    ;;
esac

ok "Deploy complete! Log: $LOG_FILE"
echo ""
pm2 status
