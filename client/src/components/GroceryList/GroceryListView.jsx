import { useState } from 'react';
import { useGroceryList } from '../../hooks/useGroceryLists';
import GroceryItem from './GroceryItem';
import './GroceryListView.css';

export default function GroceryListView({ listId, onBack }) {
  const [newIngredient, setNewIngredient] = useState('');
  const { list, loading, addItem, toggleItem, deleteItem } = useGroceryList(listId);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newIngredient.trim()) return;

    try {
      await addItem(newIngredient, '');
      setNewIngredient('');
    } catch (error) {
      alert('Failed to add item');
    }
  };

  if (loading) {
    return <div className="loading">Loading grocery list...</div>;
  }

  if (!list) {
    return <div className="error-message">Grocery list not found</div>;
  }

  const uncheckedItems = list.items.filter((item) => !item.checked);
  const checkedItems = list.items.filter((item) => item.checked);

  return (
    <div className="grocery-list-view">
      <div className="list-header">
        <button onClick={onBack} className="back-button">← Back to Lists</button>
        <h2>{list.name}</h2>
        {list.start_date && list.end_date && (
          <p className="date-range">
            {new Date(list.start_date).toLocaleDateString()} -{' '}
            {new Date(list.end_date).toLocaleDateString()}
          </p>
        )}
      </div>

      <form onSubmit={handleAddItem} className="add-item-form">
        <input
          type="text"
          placeholder="Add an item..."
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          className="add-item-input"
        />
        <button type="submit" className="btn btn-primary">Add</button>
      </form>

      <div className="items-container">
        {uncheckedItems.length > 0 && (
          <div className="items-section">
            <h3>To Buy ({uncheckedItems.length})</h3>
            <div className="items-list">
              {uncheckedItems.map((item) => (
                <GroceryItem
                  key={item.id}
                  item={item}
                  onToggle={(checked) => toggleItem(item.id, checked)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {checkedItems.length > 0 && (
          <div className="items-section">
            <h3>Completed ({checkedItems.length})</h3>
            <div className="items-list">
              {checkedItems.map((item) => (
                <GroceryItem
                  key={item.id}
                  item={item}
                  onToggle={(checked) => toggleItem(item.id, checked)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {list.items.length === 0 && (
          <div className="empty-state">
            <p>No items in this list yet. Add some items above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
