import { useState, useMemo } from 'react';
import { useMealPlans } from '../../hooks/useMealPlans';
import DayCard from './DayCard';
import AddMealModal from './AddMealModal';
import LiveGroceryList from './LiveGroceryList';
import './WeekView.css';

export default function WeekView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const weekDates = useMemo(() => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  const startDate = weekDates[0].toISOString().split('T')[0];
  const endDate = weekDates[6].toISOString().split('T')[0];

  const { mealPlans, loading, addMealPlan, deleteMealPlan } = useMealPlans(startDate, endDate);

  const getMealsForDate = (date, mealType) => {
    const dateStr = date.toISOString().split('T')[0];
    return mealPlans.filter(
      (plan) => plan.planned_date === dateStr && plan.meal_type === mealType
    );
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleAddMeal = (date, mealType) => {
    setSelectedSlot({ date: date.toISOString().split('T')[0], mealType });
    setShowAddMeal(true);
  };

  const handleMealAdded = async (recipeId) => {
    try {
      await addMealPlan({
        recipe_id: recipeId,
        planned_date: selectedSlot.date,
        meal_type: selectedSlot.mealType,
      });
      setShowAddMeal(false);
      setSelectedSlot(null);
    } catch (error) {
      alert('Failed to add meal');
    }
  };

  const handleAddQuickItem = async (date, mealType, itemName) => {
    try {
      await addMealPlan({
        custom_item: itemName,
        planned_date: date.toISOString().split('T')[0],
        meal_type: mealType,
      });
    } catch (error) {
      alert('Failed to add item');
    }
  };


  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  if (loading) {
    return <div className="loading">Loading meal plan...</div>;
  }

  return (
    <div className="week-view">
      <div className="week-header">
        <h2>Meal Planner</h2>
        <div className="week-controls">
          <button onClick={handlePreviousWeek} className="btn btn-secondary">← Previous</button>
          <span className="week-range">{formatWeekRange()}</span>
          <button onClick={handleNextWeek} className="btn btn-secondary">Next →</button>
        </div>
      </div>

      <div className="week-content">
        <div className="week-grid">
          {weekDates.map((date) => (
            <DayCard
              key={date.toISOString()}
              date={date}
              breakfastMeals={getMealsForDate(date, 'Breakfast')}
              lunchMeals={getMealsForDate(date, 'Lunch')}
              dinnerMeals={getMealsForDate(date, 'Dinner')}
              onAddMeal={handleAddMeal}
              onAddQuickItem={handleAddQuickItem}
              onDeleteMeal={deleteMealPlan}
            />
          ))}
        </div>

        <div className="grocery-sidebar">
          <LiveGroceryList startDate={startDate} endDate={endDate} mealPlans={mealPlans} />
        </div>
      </div>

      {showAddMeal && (
        <AddMealModal
          onClose={() => {
            setShowAddMeal(false);
            setSelectedSlot(null);
          }}
          onSelectRecipe={handleMealAdded}
        />
      )}
    </div>
  );
}
