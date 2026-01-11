import { useState } from 'react';
import RecipeDetail from './RecipeDetail';
import './RecipeCard.css';

export default function RecipeCard({ recipe, onUpdate, onDelete }) {
  const [showDetail, setShowDetail] = useState(false);

  const renderRating = () => {
    if (!recipe.rating) return null;
    return (
      <div className="rating">
        {'★'.repeat(recipe.rating)}{'☆'.repeat(5 - recipe.rating)}
      </div>
    );
  };

  return (
    <>
      <div className="recipe-card" onClick={() => setShowDetail(true)}>
        {recipe.image_url && (
          <div className="recipe-image">
            <img src={recipe.image_url} alt={recipe.recipe_name} />
          </div>
        )}
        <div className="recipe-content">
          <h3 className="recipe-title">{recipe.recipe_name}</h3>
          {renderRating()}
          <div className="recipe-meta">
            {recipe.cook_time && (
              <span className="meta-item">⏱ {recipe.cook_time}</span>
            )}
            {recipe.servings && (
              <span className="meta-item">🍽 {recipe.servings}</span>
            )}
            {recipe.meal && (
              <span className={`meta-item meal-badge ${recipe.meal.toLowerCase()}`}>
                {recipe.meal}
              </span>
            )}
          </div>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="recipe-tags">
              {recipe.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {showDetail && (
        <RecipeDetail
          recipe={recipe}
          onClose={() => setShowDetail(false)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
