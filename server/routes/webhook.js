import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// POST /api/webhook/recipe - Receive recipe from Make.com
router.post('/recipe', (req, res) => {
  try {
    const data = req.body;

    // Transform Make.com format to database format
    const recipe = {
      recipe_name: data['Recipe Name'],
      ingredients: JSON.stringify(
        data.Ingredients ? data.Ingredients.split('\n').filter(i => i.trim()) : []
      ),
      instructions: data.Instructions || '',
      tags: JSON.stringify(
        data.Tags ? data.Tags.split('\n').filter(t => t.trim()) : []
      ),
      main_ingredients: JSON.stringify(
        data['Main Ingredients'] ? data['Main Ingredients'].split('\n').filter(i => i.trim()) : []
      ),
      cook_time: data['Cook Time'] || null,
      servings: data.Servings || null,
      rating: data.Rating ? parseInt(data.Rating) : null,
      leftover_score: data['Leftover Score'] || null,
      notes: data.Notes || null,
      source_url: data['Source URL'] || null,
      image_url: data['Image URL'] || null,
      meal: data.Meal || null
    };

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
