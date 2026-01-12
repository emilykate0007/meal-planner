#!/bin/bash

echo "Fetching all recipe IDs..."
RECIPE_IDS=$(curl -s https://meal-planner-lupl.onrender.com/api/recipes | grep -o '"id":[0-9]*' | grep -o '[0-9]*')

TOTAL=$(echo "$RECIPE_IDS" | wc -l | xargs)
echo "Found $TOTAL recipes to delete"
echo ""

COUNT=0
for ID in $RECIPE_IDS; do
  COUNT=$((COUNT + 1))
  curl -s -X DELETE "https://meal-planner-lupl.onrender.com/api/recipes/$ID" > /dev/null
  echo "[$COUNT/$TOTAL] Deleted recipe $ID"
done

echo ""
echo "✅ All recipes deleted!"
