import express from 'express';
import cors from 'cors';
import webhookRouter from './routes/webhook.js';
import recipesRouter from './routes/recipes.js';
import mealPlansRouter from './routes/mealPlans.js';
import groceryListsRouter from './routes/groceryLists.js';
import importRouter from './routes/import.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/webhook', webhookRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/meal-plans', mealPlansRouter);
app.use('/api/grocery-lists', groceryListsRouter);
app.use('/api/import', importRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Meal Planner API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/api/webhook/recipe`);
});
