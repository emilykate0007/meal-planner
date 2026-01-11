import { useState } from 'react';
import { useGroceryLists } from '../../hooks/useGroceryLists';
import GroceryListView from './GroceryListView';
import './GroceryLists.css';

export default function GroceryLists() {
  const [selectedListId, setSelectedListId] = useState(null);
  const { lists, loading, error, deleteList } = useGroceryLists();

  if (selectedListId) {
    return (
      <GroceryListView
        listId={selectedListId}
        onBack={() => setSelectedListId(null)}
      />
    );
  }

  const handleDeleteList = async (id) => {
    if (confirm('Are you sure you want to delete this grocery list?')) {
      try {
        await deleteList(id);
      } catch (error) {
        alert('Failed to delete list');
      }
    }
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="grocery-lists">
      <h2>Grocery Lists</h2>

      {loading ? (
        <div className="loading">Loading grocery lists...</div>
      ) : lists.length === 0 ? (
        <div className="empty-state">
          <p>No grocery lists yet. Generate one from your meal planner!</p>
        </div>
      ) : (
        <div className="lists-grid">
          {lists.map((list) => (
            <div key={list.id} className="list-card">
              <div
                className="list-content"
                onClick={() => setSelectedListId(list.id)}
              >
                <h3>{list.name}</h3>
                {list.start_date && list.end_date && (
                  <p className="list-dates">
                    {new Date(list.start_date).toLocaleDateString()} -{' '}
                    {new Date(list.end_date).toLocaleDateString()}
                  </p>
                )}
                <div className="list-stats">
                  <span>
                    {list.checked_count || 0} / {list.item_count || 0} items completed
                  </span>
                  {list.item_count > 0 && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${((list.checked_count || 0) / list.item_count) * 100}%`,
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteList(list.id);
                }}
                className="delete-list-button"
                title="Delete list"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
