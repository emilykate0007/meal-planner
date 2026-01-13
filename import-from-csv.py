#!/usr/bin/env python3
import csv
import json
import sys
import urllib.request
import urllib.error

if len(sys.argv) < 2:
    print("Usage: python3 import-from-csv.py <path-to-csv>")
    sys.exit(1)

csv_file = sys.argv[1]
api_url = "https://meal-planner-lupl.onrender.com/api/import/recipes/bulk"

print(f"Reading CSV file: {csv_file}")

recipes = []
with open(csv_file, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        # Only add if has a name
        if row.get('Name') or row.get('Recipe Name'):
            recipes.append(row)

print(f"Found {len(recipes)} recipes")
print(f"Uploading to {api_url}...")

data = json.dumps({"recipes": recipes}).encode('utf-8')

req = urllib.request.Request(
    api_url,
    data=data,
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print(f"\n✅ Success!")
        print(f"   Imported: {result.get('imported')} recipes")
        print(f"   Skipped: {result.get('skipped')} recipes")
        if result.get('errors'):
            print(f"   Errors: {len(result['errors'])}")
            for err in result['errors'][:5]:
                print(f"      - {err.get('recipe')}: {err.get('error')}")
except urllib.error.HTTPError as e:
    error_body = e.read().decode('utf-8')
    print(f"\n❌ Error: {e.code}")
    print(error_body)
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Error: {e}")
    sys.exit(1)

print("\nView your recipes at: https://meal-planner-pied-iota.vercel.app/recipes")
