import React, { useState } from 'react';
import './Products.css';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Products = () => {
  const { products, addProduct, deleteProduct, editProduct } = useAppContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [newProduct, setNewProduct] = useState({ name: '', variants: [{ size: '', rate: '' }] });

  // Handlers
  const handleDelete = (id) => {
    deleteProduct(id);
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    // Create deep copy of variants to avoid mutating original state
    setNewProduct({
      name: product.name,
      variants: product.variants.map(v => ({ ...v }))
    });
    setIsModalOpen(true);
  };

  const handleAddVariantRow = () => {
    setNewProduct({
      ...newProduct,
      variants: [...newProduct.variants, { size: '', rate: '' }]
    });
  };

  const handleRemoveVariantRow = (index) => {
    const updatedVariants = newProduct.variants.filter((_, i) => i !== index);
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = newProduct.variants.map((v, i) => {
      if (i === index) return { ...v, [field]: value };
      return v;
    });
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const handleSaveProduct = () => {
    if (newProduct.name && newProduct.variants.some(v => v.size && v.rate)) {
      const validVariants = newProduct.variants
        .filter(v => v.size && v.rate)
        .map(v => ({ size: v.size, rate: Number(v.rate) }));
        
      if (editingId) {
        editProduct(editingId, {
          name: newProduct.name,
          variants: validVariants
        });
      } else {
        addProduct({
          id: Date.now(),
          name: newProduct.name,
          variants: validVariants
        });
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setNewProduct({ name: '', variants: [{ size: '', rate: '' }] });
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="products-page">
      <div className="page-header">
        <h1 className="page-title">Products Inventory</h1>
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => {
            setEditingId(null);
            setNewProduct({ name: '', variants: [{ size: '', rate: '' }] });
            setIsModalOpen(true);
          }}>
            <Plus size={16} className="mr-2" style={{marginRight: '8px'}} />
            Add Product
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Available Sizes</th>
              <th>Base Rate / Case</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td style={{ fontWeight: 600 }}>{product.name}</td>
                <td>{product.variants.map(v => v.size).join(', ')}</td>
                <td>₹ {product.variants.length > 0 ? product.variants[0].rate : 0}.00 (Starts at)</td>
                <td>
                  <div className="action-cell">
                    <button className="icon-btn" title="Edit" onClick={() => handleEditClick(product)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="icon-btn delete" title="Delete" onClick={() => handleDelete(product.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            
            <div className="form-group">
              <label>Product Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g., Slice Mango"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Product Variants (Sizes & Rates)</label>
              {newProduct.variants.map((variant, index) => (
                <div key={index} className="variant-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Size (e.g. 600ml)"
                    value={variant.size}
                    onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                  />
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="Rate (₹)"
                    value={variant.rate}
                    onChange={(e) => handleVariantChange(index, 'rate', e.target.value)}
                  />
                  {newProduct.variants.length > 1 && (
                    <button 
                      className="icon-btn delete" 
                      onClick={() => handleRemoveVariantRow(index)}
                      style={{ padding: '0.5rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button 
                className="btn btn-secondary" 
                onClick={handleAddVariantRow}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', marginTop: '0.25rem' }}
              >
                + Add Another Size
              </button>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveProduct}>{editingId ? 'Save Changes' : 'Save Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
