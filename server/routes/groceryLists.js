import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// GET /api/grocery-lists - Get all grocery lists
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT
        gl.*,
        COUNT(gli.id) as item_count,
        SUM(CASE WHEN gli.checked = 1 THEN 1 ELSE 0 END) as checked_count
      FROM grocery_lists gl
      LEFT JOIN grocery_list_items gli ON gl.id = gli.list_id
      GROUP BY gl.id
      ORDER BY gl.created_at DESC
    `);
    const lists = stmt.all();

    res.json(lists);
  } catch (error) {
    console.error('Error fetching grocery lists:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/grocery-lists/preview - Preview ingredients for date range (no save)
router.get('/preview', (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'start_date and end_date are required'
      });
    }

    // Get all meal plans in date range (including custom items)
    const mealPlansStmt = db.prepare(`
      SELECT mp.*, r.ingredients
      FROM meal_plans mp
      LEFT JOIN recipes r ON mp.recipe_id = r.id
      WHERE mp.planned_date >= ? AND mp.planned_date <= ?
    `);
    const mealPlans = mealPlansStmt.all(start_date, end_date);

    // Extract and consolidate ingredients
    const ingredientMap = new Map();

    mealPlans.forEach(plan => {
      // Handle custom items
      if (plan.custom_item) {
        const cleanItem = plan.custom_item.trim().toLowerCase();
        if (cleanItem) {
          const count = ingredientMap.get(cleanItem) || 0;
          ingredientMap.set(cleanItem, count + 1);
        }
      }

      // Handle recipe ingredients
      if (plan.ingredients) {
        const ingredients = JSON.parse(plan.ingredients || '[]');
        ingredients.forEach(ingredient => {
          const cleanIngredient = ingredient.trim().toLowerCase();
          if (cleanIngredient) {
            const count = ingredientMap.get(cleanIngredient) || 0;
            ingredientMap.set(cleanIngredient, count + 1);
          }
        });
      }
    });

    // Convert to array format
    const items = Array.from(ingredientMap.entries()).map(([ingredient, count]) => ({
      ingredient,
      quantity: count > 1 ? `x${count}` : '',
      checked: false
    }));

    res.json({ items });
  } catch (error) {
    console.error('Error previewing grocery list:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/grocery-lists/:id - Get grocery list with items
router.get('/:id', (req, res) => {
  try {
    const listStmt = db.prepare('SELECT * FROM grocery_lists WHERE id = ?');
    const list = listStmt.get(req.params.id);

    if (!list) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    const itemsStmt = db.prepare(`
      SELECT * FROM grocery_list_items
      WHERE list_id = ?
      ORDER BY checked, ingredient
    `);
    const items = itemsStmt.all(req.params.id);

    res.json({ ...list, items });
  } catch (error) {
    console.error('Error fetching grocery list:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/grocery-lists/generate - Generate grocery list from meal plans
router.post('/generate', (req, res) => {
  try {
    const { start_date, end_date, name } = req.body;

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'start_date and end_date are required'
      });
    }

    // Create grocery list
    const listName = name || `Grocery List ${start_date} to ${end_date}`;
    const createListStmt = db.prepare(`
      INSERT INTO grocery_lists (name, start_date, end_date)
      VALUES (?, ?, ?)
    `);
    const listResult = createListStmt.run(listName, start_date, end_date);
    const listId = listResult.lastInsertRowid;

    // Get all meal plans in date range (including custom items)
    const mealPlansStmt = db.prepare(`
      SELECT mp.*, r.ingredients
      FROM meal_plans mp
      LEFT JOIN recipes r ON mp.recipe_id = r.id
      WHERE mp.planned_date >= ? AND mp.planned_date <= ?
    `);
    const mealPlans = mealPlansStmt.all(start_date, end_date);

    // Extract and consolidate ingredients
    const ingredientMap = new Map();

    mealPlans.forEach(plan => {
      // Handle custom items
      if (plan.custom_item) {
        const cleanItem = plan.custom_item.trim().toLowerCase();
        if (cleanItem) {
          const count = ingredientMap.get(cleanItem) || 0;
          ingredientMap.set(cleanItem, count + 1);
        }
      }

      // Handle recipe ingredients
      if (plan.ingredients) {
        const ingredients = JSON.parse(plan.ingredients || '[]');
        ingredients.forEach(ingredient => {
          const cleanIngredient = ingredient.trim().toLowerCase();
          if (cleanIngredient) {
            const count = ingredientMap.get(cleanIngredient) || 0;
            ingredientMap.set(cleanIngredient, count + 1);
          }
        });
      }
    });

    // Insert items into grocery list
    const insertItemStmt = db.prepare(`
      INSERT INTO grocery_list_items (list_id, ingredient, quantity)
      VALUES (?, ?, ?)
    `);

    for (const [ingredient, count] of ingredientMap.entries()) {
      const quantity = count > 1 ? `x${count}` : '';
      insertItemStmt.run(listId, ingredient, quantity);
    }

    res.status(201).json({
      success: true,
      id: listId,
      message: 'Grocery list generated',
      item_count: ingredientMap.size
    });
  } catch (error) {
    console.error('Error generating grocery list:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/grocery-lists - Create empty grocery list
router.post('/', (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const stmt = db.prepare(`
      INSERT INTO grocery_lists (name)
      VALUES (?)
    `);
    const result = stmt.run(name);

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Grocery list created'
    });
  } catch (error) {
    console.error('Error creating grocery list:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/grocery-lists/:id/items - Add item to grocery list
router.post('/:id/items', (req, res) => {
  try {
    const { ingredient, quantity } = req.body;

    if (!ingredient) {
      return res.status(400).json({ error: 'ingredient is required' });
    }

    const stmt = db.prepare(`
      INSERT INTO grocery_list_items (list_id, ingredient, quantity)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(req.params.id, ingredient, quantity || null);

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Item added'
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/grocery-lists/:listId/items/:itemId - Toggle item checked status
router.patch('/:listId/items/:itemId', (req, res) => {
  try {
    const { checked } = req.body;

    const stmt = db.prepare(`
      UPDATE grocery_list_items
      SET checked = ?
      WHERE id = ? AND list_id = ?
    `);
    const result = stmt.run(
      checked ? 1 : 0,
      req.params.itemId,
      req.params.listId
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ success: true, message: 'Item updated' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/grocery-lists/:listId/items/:itemId - Delete item
router.delete('/:listId/items/:itemId', (req, res) => {
  try {
    const stmt = db.prepare(`
      DELETE FROM grocery_list_items
      WHERE id = ? AND list_id = ?
    `);
    const result = stmt.run(req.params.itemId, req.params.listId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/grocery-lists/:id - Delete grocery list
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM grocery_lists WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Grocery list not found' });
    }

    res.json({ success: true, message: 'Grocery list deleted' });
  } catch (error) {
    console.error('Error deleting grocery list:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
