import { useState, useEffect } from 'react';
import { groceryListsAPI } from '../../services/api';
import './LiveGroceryList.css';

export default function LiveGroceryList({ startDate, endDate, mealPlans }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localChecked, setLocalChecked] = useState(new Set());

  useEffect(() => {
    fetchItems();
  }, [startDate, endDate, mealPlans]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await groceryListsAPI.preview(startDate, endDate);
      setItems(data.items || []);
    } catch (error) {
      console.error('Error fetching grocery preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChecked = (ingredient) => {
    const newChecked = new Set(localChecked);
    if (newChecked.has(ingredient)) {
      newChecked.delete(ingredient);
    } else {
      newChecked.add(ingredient);
    }
    setLocalChecked(newChecked);
  };

  const handleSaveList = async () => {
    try {
      await groceryListsAPI.generate(startDate, endDate, `Week of ${startDate}`);
      alert('Grocery list saved! View it in the Grocery Lists tab.');
    } catch (error) {
      alert('Failed to save grocery list');
    }
  };

  if (loading) {
    return (
      <div className="live-grocery-list">
        <div className="live-list-header">
          <h3>Grocery List</h3>
        </div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  const uncheckedItems = items.filter(item => !localChecked.has(item.ingredient));
  const checkedItems = items.filter(item => localChecked.has(item.ingredient));

  return (
    <div className="live-grocery-list">
      <div className="live-list-header">
        <h3>Grocery List</h3>
        {items.length > 0 && (
          <button onClick={handleSaveList} className="save-list-btn" title="Save to Grocery Lists">
            💾 Save
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-list">
          <p>Add meals to your week to see ingredients here!</p>
        </div>
      ) : (
        <div className="live-items-container">
          {uncheckedItems.length > 0 && (
            <div className="live-items-section">
              {uncheckedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="live-grocery-item"
                  onClick={() => toggleChecked(item.ingredient)}
                >
                  <div className="item-checkbox">☐</div>
                  <div className="item-text">
                    <span className="item-name">{item.ingredient}</span>
                    {item.quantity && <span className="item-qty">{item.quantity}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {checkedItems.length > 0 && (
            <div className="live-items-section checked">
              {checkedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="live-grocery-item checked"
                  onClick={() => toggleChecked(item.ingredient)}
                >
                  <div className="item-checkbox">☑</div>
                  <div className="item-text">
                    <span className="item-name">{item.ingredient}</span>
                    {item.quantity && <span className="item-qty">{item.quantity}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
