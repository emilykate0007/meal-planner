import { useState, useEffect } from 'react';
import { mealPlansAPI } from '../services/api';

export function useMealPlans(startDate, endDate) {
  const [mealPlans, setMealPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMealPlans = async () => {
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      const data = await mealPlansAPI.getByDateRange(startDate, endDate);
      setMealPlans(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, [startDate, endDate]);

  const addMealPlan = async (mealPlan) => {
    try {
      await mealPlansAPI.add(mealPlan);
      await fetchMealPlans();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateMealPlan = async (id, updates) => {
    try {
      await mealPlansAPI.update(id, updates);
      await fetchMealPlans();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteMealPlan = async (id) => {
    try {
      await mealPlansAPI.delete(id);
      await fetchMealPlans();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    mealPlans,
    loading,
    error,
    refetch: fetchMealPlans,
    addMealPlan,
    updateMealPlan,
    deleteMealPlan,
  };
}
