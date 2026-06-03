import React from 'react';
import './ProductTabs.css';
import { useAppContext } from '../../context/AppContext';

const ProductTabs = ({ activeCategory, setActiveCategory }) => {
  const { categories } = useAppContext();
  
  // Use dynamic categories, fallback to empty array if undefined
  const displayCategories = categories && categories.length > 0 
    ? categories 
    : ['Pepsi', 'Mirinda', '7UP', 'Mountain Dew', 'Aquafina Water', 'Slice', 'Other Water'];

  return (
    <div className="product-tabs-container">
      {displayCategories.map((category) => (
        <button
          key={category}
          className={`tab-btn ${activeCategory === category ? 'active' : ''}`}
          onClick={() => setActiveCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default ProductTabs;
