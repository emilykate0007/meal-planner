import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import RecipeLibrary from './components/RecipeLibrary/RecipeLibrary';
import WeekView from './components/MealPlanner/WeekView';
import GroceryLists from './components/GroceryList/GroceryLists';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<RecipeLibrary />} />
          <Route path="/meal-planner" element={<WeekView />} />
          <Route path="/grocery-lists" element={<GroceryLists />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
