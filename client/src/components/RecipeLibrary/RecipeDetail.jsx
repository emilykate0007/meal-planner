import { useState } from 'react';
import './RecipeDetail.css';

export default function RecipeDetail({ recipe, onClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(recipe.rating || 0);
  const [notes, setNotes] = useState(recipe.notes || '');

  const handleSave = async () => {
    try {
      await onUpdate(recipe.id, { rating, notes });
      setIsEditing(false);
    } catch (error) {
      alert('Failed to update recipe');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      try {
        await onDelete(recipe.id);
        onClose();
      } catch (error) {
        alert('Failed to delete recipe');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content recipe-detail" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        {recipe.image_url && (
          <div className="detail-image">
            <img src={recipe.image_url} alt={recipe.recipe_name} />
          </div>
        )}

        <div className="detail-body">
          <h2>{recipe.recipe_name}</h2>

          <div className="detail-meta">
            {recipe.cook_time && <span>⏱ {recipe.cook_time}</span>}
            {recipe.servings && <span>🍽 {recipe.servings} servings</span>}
            {recipe.meal && <span className="meal-badge">{recipe.meal}</span>}
          </div>

          {recipe.main_ingredients && recipe.main_ingredients.length > 0 && (
            <div className="detail-section">
              <h3>Main Ingredients</h3>
              <div className="ingredient-list">
                {recipe.main_ingredients.map((ing, idx) => (
                  <span key={idx} className="ingredient-badge">{ing}</span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>Ingredients</h3>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          </div>

          <div className="detail-section">
            <h3>Instructions</h3>
            <div className="instructions">{recipe.instructions}</div>
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="detail-section">
              <h3>Tags</h3>
              <div className="tags-list">
                {recipe.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>Rating</h3>
            {isEditing ? (
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`star-button ${rating >= star ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            ) : (
              <div className="rating-display">
                {rating > 0 ? '★'.repeat(rating) + '☆'.repeat(5 - rating) : 'Not rated'}
              </div>
            )}
          </div>

          <div className="detail-section">
            <h3>Notes</h3>
            {isEditing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes..."
                rows={4}
              />
            ) : (
              <p className="notes-text">{notes || 'No notes yet'}</p>
            )}
          </div>

          {recipe.source_url && (
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-link"
            >
              View Original Recipe →
            </a>
          )}

          <div className="detail-actions">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="btn btn-primary">Save</button>
                <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                  Edit Rating & Notes
                </button>
                <button onClick={handleDelete} className="btn btn-danger">Delete</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
