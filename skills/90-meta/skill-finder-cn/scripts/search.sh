#!/bin/bash
# Skill search script

QUERY="$1"
LIMIT="${2:-10}"

if [ -z "$QUERY" ]; then
    echo "Usage: search.sh <keyword> [count]"
    exit 1
fi

echo "🔍 Search: $QUERY"
echo "================================"

clawhub search "$QUERY" --limit "$LIMIT"
