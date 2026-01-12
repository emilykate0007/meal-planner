import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Bulk import recipes
router.post('/recipes/bulk', (req, res) => {
  try {
    const { recipes } = req.body;

    if (!Array.isArray(recipes)) {
      return res.status(400).json({ error: 'recipes must be an array' });
    }

    const insertStmt = db.prepare(`
      INSERT INTO recipes (
        recipe_name, ingredients, instructions, tags, main_ingredients,
        cook_time, servings, rating, leftover_score, notes,
        source_url, image_url, meal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let imported = 0;
    let skipped = 0;
    const errors = [];

    for (const recipe of recipes) {
      try {
        // Helper function to ensure JSON array format
        const ensureArray = (value) => {
          if (!value) return JSON.stringify([]);
          if (typeof value === 'string') {
            // If it's newline-separated, split it
            return JSON.stringify(
              value.split('\n')
                .map(item => item.trim())
                .filter(item => item.length > 0)
            );
          }
          if (Array.isArray(value)) return JSON.stringify(value);
          return JSON.stringify([]);
        };

        // Skip if no recipe name
        if (!recipe.recipe_name && !recipe['Recipe Name'] && !recipe.Name) {
          skipped++;
          continue;
        }

        const recipeName = recipe.recipe_name || recipe['Recipe Name'] || recipe.Name;
        const ingredients = ensureArray(recipe.ingredients || recipe.Ingredients);
        const instructions = recipe.instructions || recipe.Instructions || '';
        const tags = ensureArray(recipe.tags || recipe.Tags);
        const mainIngredients = ensureArray(recipe.main_ingredients || recipe['Main Ingredients']);
        const cookTime = recipe.cook_time || recipe['Cook Time'] || null;
        const servings = recipe.servings || recipe.Servings || null;
        const rating = recipe.rating || recipe.Rating || recipe.Stars || null;
        const leftoverScore = recipe.leftover_score || recipe['Leftover Score'] || recipe['Leftover Friendly'] || null;
        const notes = recipe.notes || recipe.Notes || null;
        const sourceUrl = recipe.source_url || recipe['Source URL'] || null;
        const imageUrl = recipe.image_url || recipe['Image URL'] || null;
        const meal = recipe.meal || recipe.Meal || null;

        insertStmt.run(
          recipeName,
          ingredients,
          instructions,
          tags,
          mainIngredients,
          cookTime,
          servings,
          rating,
          leftoverScore,
          notes,
          sourceUrl,
          imageUrl,
          meal
        );

        imported++;
      } catch (error) {
        skipped++;
        errors.push({
          recipe: recipe.recipe_name || recipe['Recipe Name'] || 'unknown',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      imported,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import recipes', message: error.message });
  }
});

export default router;
