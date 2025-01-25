import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CategoryList from './components/CategoryList';
import AddCategory from './components/AddCategory';
import EditCategory from './components/EditCategory';
import "./index.css";

function App() {
  return (
    <div className="App">
      <Router>
      <Routes>
        <Route path="/" element={<CategoryList />} />
        <Route path="/edit-category/:id" element={<EditCategory />} />
        <Route path="/add-category" element={<AddCategory />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App; 