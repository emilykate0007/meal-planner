import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// POST /api/webhook/recipe - Receive recipe from Make.com
router.post('/recipe', (req, res) => {
  try {
    const data = req.body;

    // Helper to get value from multiple possible field names
    const getValue = (...keys) => {
      for (const key of keys) {
        if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
          return data[key];
        }
      }
      return null;
    };

    // Helper to parse list values (handles both strings and arrays)
    const parseList = (...keys) => {
      const value = getValue(...keys);
      if (!value) return JSON.stringify([]);
      if (Array.isArray(value)) return JSON.stringify(value);
      if (typeof value === 'string') {
        return JSON.stringify(value.split('\n').filter(i => i.trim()));
      }
      return JSON.stringify([]);
    };

    // Transform Make.com format to database format (try multiple field name variations)
    const recipe = {
      recipe_name: getValue('Recipe Name', 'recipeName', 'recipe_name', 'name', 'Name'),
      ingredients: parseList('Ingredients', 'ingredients'),
      instructions: getValue('Instructions', 'instructions') || '',
      tags: parseList('Tags', 'tags'),
      main_ingredients: parseList('Main Ingredients', 'mainIngredients', 'main_ingredients'),
      cook_time: getValue('Cook Time', 'cookTime', 'cook_time'),
      servings: getValue('Servings', 'servings'),
      rating: getValue('Rating', 'rating', 'Stars', 'stars') ? parseInt(getValue('Rating', 'rating', 'Stars', 'stars')) : null,
      leftover_score: getValue('Leftover Score', 'leftoverScore', 'leftover_score', 'Leftover Friendly'),
      notes: getValue('Notes', 'notes'),
      source_url: getValue('Source URL', 'sourceUrl', 'source_url', 'url'),
      image_url: getValue('Image URL', 'imageUrl', 'image_url', 'image'),
      meal: getValue('Meal', 'meal')
    };

    // Validate required fields
    if (!recipe.recipe_name) {
      console.error('Missing recipe name. Received data:', JSON.stringify(data, null, 2));
      return res.status(400).json({
        success: false,
        error: 'Recipe name is required',
        received_fields: Object.keys(data)
      });
    }

    // Insert into database
    const stmt = db.prepare(`
      INSERT INTO recipes (
        recipe_name, ingredients, instructions, tags, main_ingredients,
        cook_time, servings, rating, leftover_score, notes,
        source_url, image_url, meal
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
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

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Recipe added successfully'
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
