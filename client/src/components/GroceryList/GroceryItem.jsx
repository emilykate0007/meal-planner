import './GroceryItem.css';

export default function GroceryItem({ item, onToggle, onDelete }) {
  return (
    <div className={`grocery-item ${item.checked ? 'checked' : ''}`}>
      <label className="checkbox-container">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span className="checkmark"></span>
      </label>
      <div className="item-content">
        <span className="item-name">{item.ingredient}</span>
        {item.quantity && <span className="item-quantity">{item.quantity}</span>}
      </div>
      <button
        onClick={onDelete}
        className="delete-button"
        title="Delete item"
      >
        ×
      </button>
    </div>
  );
}
