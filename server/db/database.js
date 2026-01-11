import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'meal-planner.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initDatabase() {
  // Recipes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_name TEXT NOT NULL,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      tags TEXT,
      main_ingredients TEXT,
      cook_time TEXT,
      servings TEXT,
      rating INTEGER,
      leftover_score TEXT,
      notes TEXT,
      source_url TEXT,
      image_url TEXT,
      meal TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Meal plans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meal_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER,
      custom_item TEXT,
      planned_date DATE NOT NULL,
      meal_type TEXT,
      servings INTEGER DEFAULT 1,
      notes TEXT,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      CHECK ((recipe_id IS NOT NULL AND custom_item IS NULL) OR (recipe_id IS NULL AND custom_item IS NOT NULL))
    )
  `);

  // Migration: Add custom_item column if it doesn't exist
  try {
    const columns = db.pragma('table_info(meal_plans)');
    const hasCustomItem = columns.some(col => col.name === 'custom_item');

    if (!hasCustomItem) {
      console.log('Migrating meal_plans table to support custom items...');

      // Create new table with updated schema
      db.exec(`
        CREATE TABLE meal_plans_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipe_id INTEGER,
          custom_item TEXT,
          planned_date DATE NOT NULL,
          meal_type TEXT,
          servings INTEGER DEFAULT 1,
          notes TEXT,
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
          CHECK ((recipe_id IS NOT NULL AND custom_item IS NULL) OR (recipe_id IS NULL AND custom_item IS NOT NULL))
        )
      `);

      // Copy existing data
      db.exec(`
        INSERT INTO meal_plans_new (id, recipe_id, planned_date, meal_type, servings, notes)
        SELECT id, recipe_id, planned_date, meal_type, servings, notes FROM meal_plans
      `);

      // Replace old table
      db.exec('DROP TABLE meal_plans');
      db.exec('ALTER TABLE meal_plans_new RENAME TO meal_plans');

      console.log('Migration complete!');
    }
  } catch (err) {
    // Table doesn't exist yet, will be created above
  }

  // Grocery lists table
  db.exec(`
    CREATE TABLE IF NOT EXISTS grocery_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date DATE,
      end_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Grocery list items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS grocery_list_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      ingredient TEXT NOT NULL,
      quantity TEXT,
      checked BOOLEAN DEFAULT 0,
      FOREIGN KEY (list_id) REFERENCES grocery_lists(id) ON DELETE CASCADE
    )
  `);

  console.log('Database initialized successfully');
}

// Initialize on import
initDatabase();

export default db;
