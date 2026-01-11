import { useState, useEffect } from 'react';
import { recipesAPI } from '../services/api';

export function useRecipes(filters = {}) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipesAPI.getAll(filters);
      setRecipes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [JSON.stringify(filters)]);

  const updateRecipe = async (id, updates) => {
    try {
      await recipesAPI.update(id, updates);
      await fetchRecipes();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteRecipe = async (id) => {
    try {
      await recipesAPI.delete(id);
      await fetchRecipes();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    recipes,
    loading,
    error,
    refetch: fetchRecipes,
    updateRecipe,
    deleteRecipe,
  };
}
