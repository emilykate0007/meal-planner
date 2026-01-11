import fs from 'fs';
import { parse } from 'csv-parse/sync';
import db from './db/database.js';

// Read CSV file path from command line argument
const csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.error('Usage: node import-notion.js <path-to-csv-file>');
  console.error('Example: node import-notion.js ~/Desktop/recipes-export.csv');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(csvFilePath)) {
  console.error(`File not found: ${csvFilePath}`);
  process.exit(1);
}

console.log(`Reading CSV file: ${csvFilePath}`);

// Read and parse CSV (remove BOM if present)
let fileContent = fs.readFileSync(csvFilePath, 'utf-8');
if (fileContent.charCodeAt(0) === 0xFEFF) {
  fileContent = fileContent.slice(1);
}

const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  bom: true,
});

console.log(`Found ${records.length} recipes to import`);

// Prepare insert statement
const insertStmt = db.prepare(`
  INSERT INTO recipes (
    recipe_name, ingredients, instructions, tags, main_ingredients,
    cook_time, servings, rating, leftover_score, notes,
    source_url, image_url, meal
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let imported = 0;
let skipped = 0;

// Process each record
for (const record of records) {
  try {
    // Helper function to parse newline-separated values
    const parseList = (value) => {
      if (!value || value.trim() === '') return JSON.stringify([]);
      return JSON.stringify(
        value.split('\n')
          .map(item => item.trim())
          .filter(item => item.length > 0)
      );
    };

    // Transform Notion export to database format
    const recipe = {
      recipe_name: record['Name'] || record['Recipe Name'] || '',
      ingredients: parseList(record['Ingredients']),
      instructions: record['Instructions'] || '',
      tags: parseList(record['Tags']),
      main_ingredients: parseList(record['Main Ingredients']),
      cook_time: record['Cook Time'] || null,
      servings: record['Servings'] || null,
      rating: record['Rating'] ? parseInt(record['Rating']) : (record['Stars'] ? parseInt(record['Stars']) : null),
      leftover_score: record['Leftover Friendly'] || record['Leftover Score'] || null,
      notes: record['Notes'] || null,
      source_url: record['Source URL'] || null,
      image_url: record['Image URL'] || null,
      meal: record['Meal'] || null,
    };

    // Skip if recipe name is empty
    if (!recipe.recipe_name) {
      console.log(`⚠️  Skipping recipe with no name`);
      skipped++;
      continue;
    }

    // Insert into database
    insertStmt.run(
      recipe.recipe_name,
      recipe.ingredients,
      recipe.instructions,
      recipe.tags,
      recipe.main_ingredients,
      recipe.cook_time,
      recipe.servings,
      recipe.rating,
      recipe.leftover_score,
      recipe.notes,
      recipe.source_url,
      recipe.image_url,
      recipe.meal
    );

    imported++;
    console.log(`✓ Imported: ${recipe.recipe_name}`);
  } catch (error) {
    console.error(`✗ Error importing recipe: ${record['Recipe Name'] || 'unknown'}`, error.message);
    skipped++;
  }
}

console.log('\n=== Import Complete ===');
console.log(`✓ Successfully imported: ${imported} recipes`);
if (skipped > 0) {
  console.log(`⚠️  Skipped: ${skipped} recipes`);
}
console.log('\nYou can now view your recipes in the app at http://localhost:5173');
