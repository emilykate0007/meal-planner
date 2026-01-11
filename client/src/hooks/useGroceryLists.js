import { useState, useEffect, useCallback } from 'react';
import { groceryListsAPI } from '../services/api';

export function useGroceryLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await groceryListsAPI.getAll();
      setLists(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const generateList = async (startDate, endDate, name) => {
    try {
      await groceryListsAPI.generate(startDate, endDate, name);
      await fetchLists();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteList = async (id) => {
    try {
      await groceryListsAPI.delete(id);
      await fetchLists();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    lists,
    loading,
    error,
    refetch: fetchLists,
    generateList,
    deleteList,
  };
}

export function useGroceryList(listId) {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchList = useCallback(async () => {
    if (!listId) return;

    try {
      setLoading(true);
      const data = await groceryListsAPI.getById(listId);
      setList(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const addItem = async (ingredient, quantity) => {
    try {
      await groceryListsAPI.addItem(listId, ingredient, quantity);
      await fetchList();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleItem = async (itemId, checked) => {
    try {
      await groceryListsAPI.toggleItem(listId, itemId, checked);
      await fetchList();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await groceryListsAPI.deleteItem(listId, itemId);
      await fetchList();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    list,
    loading,
    error,
    refetch: fetchList,
    addItem,
    toggleItem,
    deleteItem,
  };
}
