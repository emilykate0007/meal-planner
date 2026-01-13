import express from 'express';
import OpenAI from 'openai';
import db from '../db/database.js';

const router = express.Router();

// POST /api/recipes/from-url - Parse recipe from URL using OpenAI
router.post('/from-url', async (req, res) => {
  try {
    const { url, openaiApiKey } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!openaiApiKey) {
      return res.status(400).json({ error: 'OpenAI API key is required' });
    }

    console.log(`Parsing recipe from URL: ${url}`);

    // Initialize OpenAI with user's API key
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Fetch the webpage content
    const response = await fetch(url);
    const html = await response.text();

    // Extract text content (basic extraction - remove HTML tags)
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 15000); // Limit to avoid token limits

    // Use OpenAI to extract recipe information
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a recipe extraction assistant. Extract recipe information from the provided text and return it as JSON with these exact fields:
{
  "Recipe Name": "string",
  "Ingredients": "string (newline-separated list)",
  "Instructions": "string",
  "Tags": "string (newline-separated list)",
  "Main Ingredients": "string (newline-separated list of 2-5 key ingredients)",
  "Cook Time": "string (e.g., '30 min')",
  "Servings": "string (e.g., '4')",
  "Rating": "string (1-5 or null)",
  "Leftover Score": "string (Good/No/null)",
  "Notes": "string (any helpful tips or warnings)",
  "Source URL": "string (the URL provided)",
  "Image URL": "string (main recipe image URL or null)",
  "Meal": "string (Breakfast/Lunch/Dinner/Dessert/Snack)"
}

For Ingredients and Tags, use \\n to separate items. Extract all ingredients with their quantities. Be thorough and accurate.`
        },
        {
          role: 'user',
          content: `Extract the recipe from this webpage (URL: ${url}):\n\n${textContent}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const recipeData = JSON.parse(completion.choices[0].message.content);

    // Ensure Source URL is set
    recipeData['Source URL'] = url;

    console.log('Recipe extracted:', recipeData['Recipe Name']);

    // Save to database using webhook logic
    const getValue = (...keys) => {
      for (const key of keys) {
        if (recipeData[key] !== undefined && recipeData[key] !== null && recipeData[key] !== '') {
          return recipeData[key];
        }
      }
      return null;
    };

    const parseList = (...keys) => {
      const value = getValue(...keys);
      if (!value) return JSON.stringify([]);
      if (Array.isArray(value)) return JSON.stringify(value);
      if (typeof value === 'string') {
        return JSON.stringify(value.split('\n').filter(i => i.trim()));
      }
      return JSON.stringify([]);
    };

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

    if (!recipe.recipe_name) {
      return res.status(400).json({
        error: 'Could not extract recipe name from the URL. Please make sure the URL contains a recipe.'
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
      recipe: {
        id: result.lastInsertRowid,
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        tags: JSON.parse(recipe.tags),
        main_ingredients: JSON.parse(recipe.main_ingredients)
      },
      message: 'Recipe added successfully'
    });
  } catch (error) {
    console.error('Parse recipe error:', error);
    res.status(500).json({
      error: 'Failed to parse recipe',
      message: error.message
    });
  }
});

export default router;
