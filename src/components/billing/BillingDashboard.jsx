import React, { useState } from 'react';
import './BillingDashboard.css';
import SelectedShop from './SelectedShop';
import ProductGrid from './ProductGrid';
import CurrentBillPanel from './CurrentBillPanel';
import { useAppContext } from '../../context/AppContext';
import { sortBillItems } from '../../utils/sortUtils';

const BillingDashboard = () => {
  const { 
    bills,
    addBill, 
    currentBillItems: billItems, 
    setCurrentBillItems: setBillItems,
    currentShopName: shopName,
    setCurrentShopName: setShopName,
    currentBillId,
    setCurrentBillId
  } = useAppContext();

  const sortItems = (items) => {
    return [...items].sort(sortBillItems);
  };

  const handleAddToBill = (item) => {
    const existingIndex = billItems.findIndex(i => i.name === item.name);
    if (existingIndex >= 0) {
      const updatedItems = [...billItems];
      updatedItems[existingIndex].qty += item.qty;
      const currentRate = updatedItems[existingIndex].actualRate !== undefined ? updatedItems[existingIndex].actualRate : updatedItems[existingIndex].rate;
      updatedItems[existingIndex].amount = updatedItems[existingIndex].qty * currentRate;
      setBillItems(sortItems(updatedItems));
    } else {
      setBillItems(sortItems([...billItems, { ...item, actualRate: item.rate, id: Date.now() }]));
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
    
    const existingBill = currentBillId ? bills.find(b => b.id === currentBillId) : null;
    const billDate = existingBill ? existingBill.date : new Date().toISOString();

    const newBill = {
      id: currentBillId || `INV-${Date.now()}`,
      date: billDate,
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
    setCurrentBillId(null); // Clear bill ID
  };

  const handleClearBill = () => {
    if (window.confirm("Are you sure you want to clear all items from the current bill?")) {
      setBillItems([]);
      setShopName('');
      setCurrentBillId(null);
    }
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
          onClearBill={handleClearBill}
        />
      </div>
    </div>
  );
};

export default BillingDashboard;
