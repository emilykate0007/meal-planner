import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET /api/recipes - Get all recipes with optional filters
router.get('/', (req, res) => {
  try {
    const { search, meal, tags } = req.query;

    let query = 'SELECT * FROM recipes WHERE 1=1';
    const params = [];

    // Search filter
    if (search) {
      query += ` AND (recipe_name LIKE ? OR ingredients LIKE ? OR main_ingredients LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    // Meal type filter
    if (meal) {
      query += ` AND meal = ?`;
      params.push(meal);
    }

    // Tags filter
    if (tags) {
      query += ` AND tags LIKE ?`;
      params.push(`%${tags}%`);
    }

    query += ' ORDER BY created_at DESC';

    const stmt = db.prepare(query);
    const recipes = stmt.all(...params);

    // Parse JSON fields
    const parsedRecipes = recipes.map(recipe => ({
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients || '[]'),
      tags: JSON.parse(recipe.tags || '[]'),
      main_ingredients: JSON.parse(recipe.main_ingredients || '[]')
    }));

    res.json(parsedRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/recipes/:id - Get single recipe
router.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM recipes WHERE id = ?');
    const recipe = stmt.get(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Parse JSON fields
    const parsedRecipe = {
      ...recipe,
      ingredients: JSON.parse(recipe.ingredients || '[]'),
      tags: JSON.parse(recipe.tags || '[]'),
      main_ingredients: JSON.parse(recipe.main_ingredients || '[]')
    };

    res.json(parsedRecipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/recipes/:id - Update recipe (rating, notes, etc.)
router.patch('/:id', (req, res) => {
  try {
    const { rating, notes, leftover_score } = req.body;
    const updates = [];
    const params = [];

    if (rating !== undefined) {
      updates.push('rating = ?');
      params.push(rating);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    if (leftover_score !== undefined) {
      updates.push('leftover_score = ?');
      params.push(leftover_score);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);
    const query = `UPDATE recipes SET ${updates.join(', ')} WHERE id = ?`;

    const stmt = db.prepare(query);
    const result = stmt.run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json({ success: true, message: 'Recipe updated' });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/recipes/:id - Delete recipe
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM recipes WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    res.json({ success: true, message: 'Recipe deleted' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
