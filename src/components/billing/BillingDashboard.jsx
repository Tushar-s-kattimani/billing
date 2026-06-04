import React, { useState } from 'react';
import './BillingDashboard.css';
import SelectedShop from './SelectedShop';
import ProductGrid from './ProductGrid';
import CurrentBillPanel from './CurrentBillPanel';
import { useAppContext } from '../../context/AppContext';

const BillingDashboard = () => {
  const { 
    addBill, 
    currentBillItems: billItems, 
    setCurrentBillItems: setBillItems,
    currentShopName: shopName,
    setCurrentShopName: setShopName
  } = useAppContext();

  const handleAddToBill = (item) => {
    const existingIndex = billItems.findIndex(i => i.name === item.name);
    if (existingIndex >= 0) {
      const updatedItems = [...billItems];
      updatedItems[existingIndex].qty += item.qty;
      const currentRate = updatedItems[existingIndex].actualRate !== undefined ? updatedItems[existingIndex].actualRate : updatedItems[existingIndex].rate;
      updatedItems[existingIndex].amount = updatedItems[existingIndex].qty * currentRate;
      setBillItems(updatedItems);
    } else {
      setBillItems([...billItems, { ...item, actualRate: item.rate, id: Date.now() }]);
    }
  };

  const handleUpdateItemRate = (name, newRate) => {
    const updatedItems = billItems.map(item => {
      if (item.name === name) {
        return { ...item, actualRate: newRate, amount: item.qty * newRate };
      }
      return item;
    });
    setBillItems(updatedItems);
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
        <CurrentBillPanel 
          items={billItems} 
          onSaveBill={handleSaveBill} 
          onRemoveItem={(name) => setBillItems(billItems.filter(i => i.name !== name))} 
          onUpdateItemRate={handleUpdateItemRate}
        />
      </div>
    </div>
  );
};

export default BillingDashboard;
