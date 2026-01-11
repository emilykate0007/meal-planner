import { useState } from 'react';
import './DayCard.css';

export default function DayCard({
  date,
  breakfastMeals,
  lunchMeals,
  dinnerMeals,
  onAddMeal,
  onAddQuickItem,
  onDeleteMeal,
}) {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = date.getDate();
  const isToday = new Date().toDateString() === date.toDateString();

  const MealSlot = ({ mealType, meals }) => {
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [quickItem, setQuickItem] = useState('');

    const handleQuickAdd = (e) => {
      e.preventDefault();
      if (quickItem.trim()) {
        onAddQuickItem(date, mealType, quickItem.trim());
        setQuickItem('');
        setShowQuickAdd(false);
      }
    };

    const mealIcons = {
      'Breakfast': '☀️',
      'Lunch': '🥗',
      'Dinner': '🌙'
    };

    return (
      <div className={`meal-slot ${mealType.toLowerCase()}`}>
        <div className="meal-type">
          <span>{mealIcons[mealType]}</span>
          {mealType}
        </div>
        {meals.length > 0 ? (
          meals.map((meal) => (
            <div key={meal.id} className="meal-item">
              <div className="meal-name">{meal.recipe_name}</div>
              {meal.cook_time && !meal.is_custom && (
                <div className="meal-time">⏱ {meal.cook_time}</div>
              )}
              {meal.is_custom && <div className="custom-badge">🍽️</div>}
              <button
                onClick={() => onDeleteMeal(meal.id)}
                className="remove-meal"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))
        ) : showQuickAdd ? (
          <form onSubmit={handleQuickAdd} className="quick-add-form">
            <input
              type="text"
              value={quickItem}
              onChange={(e) => setQuickItem(e.target.value)}
              placeholder="e.g., Apple, Yogurt..."
              className="quick-add-input"
              autoFocus
            />
            <div className="quick-add-buttons">
              <button type="submit" className="quick-add-save">✓</button>
              <button
                type="button"
                onClick={() => {
                  setShowQuickAdd(false);
                  setQuickItem('');
                }}
                className="quick-add-cancel"
              >
                ×
              </button>
            </div>
          </form>
        ) : (
          <div className="add-meal-options">
            <button
              onClick={() => onAddMeal(date, mealType)}
              className="add-meal-button"
            >
              + Recipe
            </button>
            <button
              onClick={() => setShowQuickAdd(true)}
              className="add-meal-button quick"
            >
              + Quick Add
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`day-card ${isToday ? 'today' : ''}`}>
      <div className="day-header">
        <div className="day-name">{dayName}</div>
        <div className="day-number">{dayNumber}</div>
      </div>
      <div className="day-meals">
        <MealSlot mealType="Breakfast" meals={breakfastMeals} />
        <MealSlot mealType="Lunch" meals={lunchMeals} />
        <MealSlot mealType="Dinner" meals={dinnerMeals} />
      </div>
    </div>
  );
}
