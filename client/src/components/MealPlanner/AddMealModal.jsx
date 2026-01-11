import { useState } from 'react';
import { useRecipes } from '../../hooks/useRecipes';
import './AddMealModal.css';

export default function AddMealModal({ onClose, onSelectRecipe }) {
  const [search, setSearch] = useState('');
  const { recipes, loading } = useRecipes({ search });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-meal-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <h2>Add Recipe to Meal Plan</h2>

        <input
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
          autoFocus
        />

        <div className="recipe-list">
          {loading ? (
            <div className="loading">Loading recipes...</div>
          ) : recipes.length === 0 ? (
            <div className="empty-state">No recipes found</div>
          ) : (
            recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="recipe-list-item"
                onClick={() => onSelectRecipe(recipe.id)}
              >
                {recipe.image_url && (
                  <img src={recipe.image_url} alt={recipe.recipe_name} />
                )}
                <div className="recipe-info">
                  <div className="recipe-name">{recipe.recipe_name}</div>
                  <div className="recipe-meta">
                    {recipe.cook_time && <span>⏱ {recipe.cook_time}</span>}
                    {recipe.meal && <span className="meal-badge">{recipe.meal}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
