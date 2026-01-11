# Meal Planner

A full-stack meal planning web application that integrates with Make.com to automatically import recipes, plan weekly meals, and generate smart grocery lists.

## Features

- **Recipe Library**: Browse and search your recipe collection with filters by meal type, tags, and ingredients
- **Meal Planner**: Visual weekly calendar to plan breakfast, lunch, and dinner
- **Grocery Lists**: Automatically generate consolidated grocery lists from your meal plans
- **Make.com Integration**: Seamlessly import recipes via webhook from your Make.com workflow

## Tech Stack

- **Backend**: Node.js + Express + SQLite (better-sqlite3)
- **Frontend**: React + Vite
- **Routing**: React Router
- **Styling**: CSS Modules

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone or navigate to the project directory:
```bash
cd /Users/emilydobbs/Desktop/meal-planner
```

2. Install all dependencies (both server and client):
```bash
npm run install:all
```

Alternatively, install dependencies separately:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Running the Application

#### Development Mode (Recommended)

Run both the server and client concurrently:
```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:3001`
- Frontend development server on `http://localhost:5173`

#### Run Separately

Server only:
```bash
npm run dev:server
```

Client only:
```bash
npm run dev:client
```

## Make.com Integration

### Setting Up the Webhook

1. Open your Make.com scenario
2. Replace the "Notion: Create Item" module with "HTTP: Make a Request"
3. Configure the HTTP module:
   - **URL**: `http://localhost:3001/api/webhook/recipe` (development)
   - **Method**: `POST`
   - **Headers**:
     - `Content-Type`: `application/json`
   - **Body**: Your existing JSON structure with these fields:
     ```json
     {
       "Recipe Name": "...",
       "Ingredients": "ingredient1\\ningredient2\\n...",
       "Instructions": "...",
       "Tags": "tag1\\ntag2\\n...",
       "Main Ingredients": "...",
       "Cook Time": "...",
       "Servings": "...",
       "Rating": 3,
       "Notes": "...",
       "Source URL": "...",
       "Image URL": "...",
       "Meal": "Dinner"
     }
     ```

### Testing the Webhook

1. Start the development server: `npm run dev`
2. Use your Apple Shortcuts workflow to share a recipe
3. Make.com will process it and send to your local webhook
4. The recipe should appear in your Recipe Library immediately

## Using the App

### Recipe Library
- View all imported recipes in a grid layout
- Search by recipe name, ingredients, or tags
- Filter by meal type (Breakfast, Lunch, Dinner)
- Click any recipe to view full details
- Rate recipes and add personal notes
- Delete recipes you no longer want

### Meal Planner
- View the current week with Monday-Sunday
- Each day has three meal slots: Breakfast, Lunch, Dinner
- Click "+ Add [Meal]" to search and select a recipe
- Navigate between weeks using Previous/Next buttons
- Generate a grocery list for the entire week

### Grocery Lists
- Auto-generated from your meal plans
- Ingredients are automatically consolidated
- Check off items as you shop
- Manually add additional items
- View multiple saved grocery lists
- Delete old lists when done

## Project Structure

```
meal-planner/
├── server/               # Backend Express API
│   ├── db/
│   │   ├── database.js   # SQLite setup and schema
│   │   └── meal-planner.db  # Database file (created automatically)
│   ├── routes/
│   │   ├── webhook.js    # Make.com webhook endpoint
│   │   ├── recipes.js    # Recipe CRUD operations
│   │   ├── mealPlans.js  # Meal planning operations
│   │   └── groceryLists.js  # Grocery list operations
│   └── server.js         # Express app entry point
├── client/               # Frontend React app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API service layer
│   │   └── App.jsx       # Main app component
│   └── index.html
├── package.json          # Root package with scripts
└── README.md
```

## API Endpoints

### Recipes
- `GET /api/recipes` - List all recipes (supports filters)
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/webhook/recipe` - Receive recipe from Make.com
- `PATCH /api/recipes/:id` - Update recipe (rating, notes)
- `DELETE /api/recipes/:id` - Delete recipe

### Meal Plans
- `GET /api/meal-plans?start=YYYY-MM-DD&end=YYYY-MM-DD` - Get meal plans
- `POST /api/meal-plans` - Add meal to plan
- `PATCH /api/meal-plans/:id` - Update meal plan
- `DELETE /api/meal-plans/:id` - Remove from plan

### Grocery Lists
- `GET /api/grocery-lists` - List all grocery lists
- `GET /api/grocery-lists/:id` - Get list with items
- `POST /api/grocery-lists/generate` - Generate from date range
- `POST /api/grocery-lists/:id/items` - Add item
- `PATCH /api/grocery-lists/:listId/items/:itemId` - Toggle checked
- `DELETE /api/grocery-lists/:id` - Delete list

## Database

The app uses SQLite for data storage. The database file is automatically created at `server/db/meal-planner.db` when you first run the server.

### Tables
- **recipes**: All imported recipes with ingredients, instructions, etc.
- **meal_plans**: Scheduled meals linked to recipes by date and meal type
- **grocery_lists**: Saved grocery list metadata
- **grocery_list_items**: Individual items in each grocery list

## Deployment

### Local Production Build

1. Build the frontend:
```bash
cd client && npm run build
```

2. Serve the built files:
   - Configure Express to serve the `client/dist` folder
   - Or use a static file server

### Production Considerations

- Use environment variables for configuration
- Set up proper CORS policies
- Use a production-ready database (PostgreSQL) for multi-user scenarios
- Deploy backend and frontend separately or together
- Update Make.com webhook URL to your production domain
- Consider using ngrok for testing webhooks locally

## Troubleshooting

### Database Issues
- Delete `server/db/meal-planner.db` and restart to reset the database

### Webhook Not Working
- Ensure the server is running on port 3001
- Check Make.com scenario logs for errors
- Verify the webhook URL matches your server address
- For local testing, use ngrok to expose your local server

### Port Conflicts
- Change server port in `server/server.js` (default: 3001)
- Change client port in `client/vite.config.js` (default: 5173)

## Future Enhancements

- Recipe scaling (adjust servings)
- Nutrition information
- Meal prep mode
- Recipe sharing/export
- Mobile app
- Cloud deployment
- Multi-user support with authentication

## License

MIT

## Contributing

This is a personal project, but feel free to fork and customize for your own use!
