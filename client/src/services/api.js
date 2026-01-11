const API_BASE = '/api';

// Helper function for API calls
async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Recipes API
export const recipesAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/recipes${query ? `?${query}` : ''}`);
  },

  getById: (id) => fetchAPI(`/recipes/${id}`),

  update: (id, data) =>
    fetchAPI(`/recipes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    fetchAPI(`/recipes/${id}`, {
      method: 'DELETE',
    }),
};

// Meal Plans API
export const mealPlansAPI = {
  getByDateRange: (startDate, endDate) => {
    const params = new URLSearchParams({ start: startDate, end: endDate });
    return fetchAPI(`/meal-plans?${params}`);
  },

  add: (mealPlan) =>
    fetchAPI('/meal-plans', {
      method: 'POST',
      body: JSON.stringify(mealPlan),
    }),

  update: (id, data) =>
    fetchAPI(`/meal-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    fetchAPI(`/meal-plans/${id}`, {
      method: 'DELETE',
    }),
};

// Grocery Lists API
export const groceryListsAPI = {
  getAll: () => fetchAPI('/grocery-lists'),

  getById: (id) => fetchAPI(`/grocery-lists/${id}`),

  preview: (startDate, endDate) => {
    const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
    return fetchAPI(`/grocery-lists/preview?${params}`);
  },

  generate: (startDate, endDate, name) =>
    fetchAPI('/grocery-lists/generate', {
      method: 'POST',
      body: JSON.stringify({ start_date: startDate, end_date: endDate, name }),
    }),

  create: (name) =>
    fetchAPI('/grocery-lists', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  addItem: (listId, ingredient, quantity) =>
    fetchAPI(`/grocery-lists/${listId}/items`, {
      method: 'POST',
      body: JSON.stringify({ ingredient, quantity }),
    }),

  toggleItem: (listId, itemId, checked) =>
    fetchAPI(`/grocery-lists/${listId}/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ checked }),
    }),

  deleteItem: (listId, itemId) =>
    fetchAPI(`/grocery-lists/${listId}/items/${itemId}`, {
      method: 'DELETE',
    }),

  delete: (id) =>
    fetchAPI(`/grocery-lists/${id}`, {
      method: 'DELETE',
    }),
};
