import React, { useState } from 'react';
import './ProductGrid.css';
import { Plus, Minus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ProductCard = ({ product, onAddToBill }) => {
  const [activeVariant, setActiveVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    if (onAddToBill) {
      const finalQty = quantity === '' || quantity < 1 ? 1 : quantity;
      onAddToBill({
        name: `${product.name} ${activeVariant.size}`,
        qty: finalQty,
        rate: activeVariant.rate,
        amount: finalQty * activeVariant.rate,
        unit: 'Cases'
      });
      setQuantity(1); // Reset qty after adding
    }
  };

  const handleQtyChange = (delta) => {
    const currentQty = quantity === '' ? 0 : quantity;
    setQuantity(Math.max(1, currentQty + delta));
  };

  return (
    <div className="product-card">

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        
        <div className="size-selector">
          {product.variants.map(variant => (
            <button 
              key={variant.size}
              className={`size-btn ${activeVariant.size === variant.size ? 'active' : ''}`}
              onClick={() => setActiveVariant(variant)}
            >
              {variant.size}
            </button>
          ))}
        </div>
        
        <div className="product-rate">
          ₹ {activeVariant.rate}/cs (Wholesale)
        </div>
      </div>
      
      <div className="card-actions">
        <div className="qty-selector">
          <button className="qty-btn" onClick={() => handleQtyChange(-1)}><Minus size={14}/></button>
          <input 
            type="text" 
            className="qty-input" 
            value={quantity} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) setQuantity(Math.max(1, val));
              else if (e.target.value === '') setQuantity('');
            }}
            onBlur={() => {
              if (quantity === '' || quantity < 1) setQuantity(1);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAdd();
              }
            }}
          />
          <button className="qty-btn" onClick={() => handleQtyChange(1)}><Plus size={14}/></button>
        </div>
        <button className="btn btn-primary add-btn" onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
};

const ProductGrid = ({ onAddToBill }) => {
  const { products } = useAppContext();

  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} onAddToBill={onAddToBill} />
      ))}
    </div>
  );
};

export default ProductGrid;
