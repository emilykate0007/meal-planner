import { useState } from 'react';
import { useRecipes } from '../../hooks/useRecipes';
import RecipeCard from './RecipeCard';
import './RecipeLibrary.css';

export default function RecipeLibrary() {
  const [search, setSearch] = useState('');
  const [meal, setMeal] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { recipes, loading, error, updateRecipe, deleteRecipe } = useRecipes({
    search: debouncedSearch,
    meal,
  });

  const handleSearchChange = (value) => {
    setSearch(value);
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="recipe-library">
      <div className="library-header">
        <h2>Recipe Library</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />
          <select
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            className="filter-select"
          >
            <option value="">All Meals</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading recipes...</div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <p>No recipes found. Add recipes from your Make.com workflow!</p>
        </div>
      ) : (
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onUpdate={updateRecipe}
              onDelete={deleteRecipe}
            />
          ))}
        </div>
      )}
    </div>
  );
}
