import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET /api/meal-plans - Get meal plans for date range
router.get('/', (req, res) => {
  try {
    const { start, end } = req.query;

    let query = `
      SELECT
        mp.*,
        r.recipe_name,
        r.image_url,
        r.cook_time,
        r.tags
      FROM meal_plans mp
      LEFT JOIN recipes r ON mp.recipe_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (start) {
      query += ' AND mp.planned_date >= ?';
      params.push(start);
    }

    if (end) {
      query += ' AND mp.planned_date <= ?';
      params.push(end);
    }

    query += ' ORDER BY mp.planned_date, mp.meal_type';

    const stmt = db.prepare(query);
    const mealPlans = stmt.all(...params);

    // Parse JSON fields and handle custom items
    const parsedPlans = mealPlans.map(plan => ({
      ...plan,
      recipe_name: plan.custom_item || plan.recipe_name,
      tags: plan.tags ? JSON.parse(plan.tags || '[]') : [],
      is_custom: !!plan.custom_item
    }));

    res.json(parsedPlans);
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/meal-plans - Add recipe or custom item to meal plan
router.post('/', (req, res) => {
  try {
    const { recipe_id, custom_item, planned_date, meal_type, servings, notes } = req.body;

    // Validate: must have either recipe_id or custom_item, not both
    if ((!recipe_id && !custom_item) || (recipe_id && custom_item)) {
      return res.status(400).json({
        error: 'Either recipe_id or custom_item is required (but not both)'
      });
    }

    if (!planned_date || !meal_type) {
      return res.status(400).json({
        error: 'planned_date and meal_type are required'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO meal_plans (recipe_id, custom_item, planned_date, meal_type, servings, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      recipe_id || null,
      custom_item || null,
      planned_date,
      meal_type,
      servings || 1,
      notes || null
    );

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: custom_item ? 'Custom item added to plan' : 'Meal added to plan'
    });
  } catch (error) {
    console.error('Error adding meal plan:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/meal-plans/:id - Update meal plan
router.patch('/:id', (req, res) => {
  try {
    const { planned_date, meal_type, servings, notes } = req.body;
    const updates = [];
    const params = [];

    if (planned_date !== undefined) {
      updates.push('planned_date = ?');
      params.push(planned_date);
    }
    if (meal_type !== undefined) {
      updates.push('meal_type = ?');
      params.push(meal_type);
    }
    if (servings !== undefined) {
      updates.push('servings = ?');
      params.push(servings);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);
    const query = `UPDATE meal_plans SET ${updates.join(', ')} WHERE id = ?`;

    const stmt = db.prepare(query);
    const result = stmt.run(...params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    res.json({ success: true, message: 'Meal plan updated' });
  } catch (error) {
    console.error('Error updating meal plan:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/meal-plans/:id - Remove meal from plan
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM meal_plans WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Meal plan not found' });
    }

    res.json({ success: true, message: 'Meal removed from plan' });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
