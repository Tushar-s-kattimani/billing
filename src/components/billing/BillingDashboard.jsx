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

  const handleUpdateItemRate = (name, rawRate) => {
    const newRate = rawRate === '' ? '' : Number(rawRate);
    if (newRate !== '' && newRate < 0) return;

    const updatedItems = billItems.map(item => {
      if (item.name === name) {
        const rateNum = newRate === '' ? 0 : newRate;
        const qtyNum = item.qty === '' ? 0 : item.qty;
        return { ...item, actualRate: newRate, amount: qtyNum * rateNum };
      }
      return item;
    });
    setBillItems(updatedItems);
  };

  const handleUpdateItemQty = (name, rawQty) => {
    const newQty = rawQty === '' ? '' : Number(rawQty);
    if (newQty !== '' && newQty < 0) return;

    const updatedItems = billItems.map(item => {
      if (item.name === name) {
        const currentRate = item.actualRate !== undefined ? item.actualRate : item.rate;
        const qtyNum = newQty === '' ? 0 : newQty;
        return { ...item, qty: newQty, amount: qtyNum * currentRate };
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
          onUpdateItemQty={handleUpdateItemQty}
        />
      </div>
    </div>
  );
};

export default BillingDashboard;
