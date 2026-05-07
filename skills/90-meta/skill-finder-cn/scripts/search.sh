#!/bin/bash
# Search the public PostPlus skills repository listing.

QUERY="$1"
LIMIT="${2:-10}"

if [ -z "$QUERY" ]; then
    echo "Usage: search.sh <keyword> [count]"
    exit 1
fi

echo "Search: $QUERY"
echo "================================"

npx -y skills add PostPlusAI/postplus-skills --global --list \
    | grep -i -- "$QUERY" \
    | head -n "$LIMIT"
