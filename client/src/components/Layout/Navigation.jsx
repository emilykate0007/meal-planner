import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <span className="brand-icon">🍳</span>
        <h1>Meal Planner</h1>
      </div>
      <div className="nav-links">
        <Link
          to="/"
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
        >
          <span className="nav-icon">📚</span>
          <span>Recipes</span>
        </Link>
        <Link
          to="/meal-planner"
          className={`nav-link ${isActive('/meal-planner') ? 'active' : ''}`}
        >
          <span className="nav-icon">📅</span>
          <span>Meal Planner</span>
        </Link>
        <Link
          to="/grocery-lists"
          className={`nav-link ${isActive('/grocery-lists') ? 'active' : ''}`}
        >
          <span className="nav-icon">🛒</span>
          <span>Grocery Lists</span>
        </Link>
      </div>
    </nav>
  );
}
