#!/bin/bash

# Path to your context file - using a relative path that works across environments
CONTEXT_FILE="$HOME/Code/doc-tales/tools/amazon-q/q-context.txt"
PROJECT_DIR="$HOME/Code/doc-tales"

# Check if the file exists
if [ ! -f "$CONTEXT_FILE" ]; then
    echo "Context file not found: $CONTEXT_FILE"
    exit 1
fi

# Detect environment
if [[ "$(uname)" == "Darwin" ]]; then
  ENV="MacOS"
elif grep -q Microsoft /proc/version 2>/dev/null; then
  ENV="WSL 2 Ubuntu"
else
  ENV="VS Codespace"
fi

# Get Git information
cd "$PROJECT_DIR"
GIT_BRANCH=$(git branch --show-current 2>/dev/null)
GIT_STATUS=$(git status -s 2>/dev/null)
RECENT_COMMITS=$(git log --oneline -n 3 2>/dev/null)

# Create dynamic Git context
GIT_CONTEXT=""
if [ ! -z "$GIT_BRANCH" ]; then
  GIT_CONTEXT="Current branch: $GIT_BRANCH. "
  
  if [ ! -z "$GIT_STATUS" ]; then
    GIT_CONTEXT+="There are uncommitted changes. "
  else
    GIT_CONTEXT+="Working tree is clean. "
  fi
  
  if [ ! -z "$RECENT_COMMITS" ]; then
    GIT_CONTEXT+="Recent commits: $(echo "$RECENT_COMMITS" | tr '\n' ' ')"
  fi
fi

# Read the base context file
BASE_CONTEXT=$(cat "$CONTEXT_FILE")

# Combine base context with dynamic Git context
FULL_CONTEXT="$BASE_CONTEXT Current environment: $ENV. $GIT_CONTEXT"

# Launch Q with the combined context
# The --context flag is no longer supported, so we pass the context as the first input
q chat "$FULL_CONTEXT"
