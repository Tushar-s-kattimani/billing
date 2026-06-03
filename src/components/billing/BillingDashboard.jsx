import React, { useState } from 'react';
import './BillingDashboard.css';
import SelectedShop from './SelectedShop';
import ProductGrid from './ProductGrid';
import CurrentBillPanel from './CurrentBillPanel';
import { useAppContext } from '../../context/AppContext';

const BillingDashboard = () => {
  const [billItems, setBillItems] = useState([]);
  const [shopName, setShopName] = useState('');
  const { addBill } = useAppContext();

  const handleAddToBill = (item) => {
    const existingIndex = billItems.findIndex(i => i.name === item.name);
    if (existingIndex >= 0) {
      const updatedItems = [...billItems];
      updatedItems[existingIndex].qty += item.qty;
      updatedItems[existingIndex].amount = updatedItems[existingIndex].qty * updatedItems[existingIndex].rate;
      setBillItems(updatedItems);
    } else {
      setBillItems([...billItems, { ...item, id: Date.now() }]);
    }
  };

  const handleSaveBill = (totalItems, totalQty, grandTotal) => {
    if (billItems.length === 0) return;
    
    const newBill = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      shopName: shopName || 'Cash Sale', // Default to Cash Sale if empty
      items: billItems,
      totalItems,
      totalQty,
      grandTotal,
      isPrinted: false,
      isCleared: false
    };
    
    addBill(newBill);
    setBillItems([]); // Clear cart
    setShopName(''); // Clear shop name
  };

  return (
    <div className="dashboard-container">
      <div className="left-column">
        <SelectedShop shopName={shopName} setShopName={setShopName} />
        
        <div className="products-section">
          <ProductGrid onAddToBill={handleAddToBill} />
        </div>
      </div>
      
      <div className="right-column">
        <CurrentBillPanel items={billItems} onSaveBill={handleSaveBill} onRemoveItem={(name) => setBillItems(billItems.filter(i => i.name !== name))} />
      </div>
    </div>
  );
};

export default BillingDashboard;
