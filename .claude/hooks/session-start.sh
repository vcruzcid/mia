#!/bin/bash
# Auto-runs at the start of every Claude Code session.
# Outputs context that Claude reads before responding to the first message.

BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
LAST_COMMITS=$(git log --oneline -3 2>/dev/null || echo "no git history")
GIT_STATUS=$(git status --short 2>/dev/null || echo "")

# Auto-install dependencies if node_modules is missing (common in fresh worktrees)
if [[ ! -d "node_modules" ]]; then
  echo "[session-start] node_modules missing — running npm install..." >&2
  npm install --silent 2>/dev/null
fi

# Warn if on protected branch
BRANCH_WARNING=""
if [[ "$BRANCH" == "main" || "$BRANCH" == "dev" ]]; then
  BRANCH_WARNING="WARNING: You are on '$BRANCH'. Do not commit directly. Create a feature branch first."
fi

echo "=== MIA Session Context ==="
echo "Branch: $BRANCH"
if [[ -n "$BRANCH_WARNING" ]]; then
  echo "$BRANCH_WARNING"
fi
echo ""
echo "Last 3 commits:"
echo "$LAST_COMMITS"
echo ""
if [[ -n "$GIT_STATUS" ]]; then
  echo "Uncommitted changes:"
  echo "$GIT_STATUS"
else
  echo "Working tree: clean"
fi
echo "==========================="