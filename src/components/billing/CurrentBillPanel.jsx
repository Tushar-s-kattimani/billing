import React, { useState } from 'react';
import './CurrentBillPanel.css';
import { Banknote, Smartphone, CreditCard as CardIcon, Building, Save, Printer, PauseCircle, Share2, Trash2 } from 'lucide-react';

const CurrentBillPanel = ({ items, onSaveBill, onRemoveItem, onUpdateItemRate, onUpdateItemQty }) => {
  const totalItems = items.length;
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const grandTotal = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bill-panel">
      <div className="bill-header">
        <h2 className="bill-title">Current Bill</h2>
      </div>

      <div className="bill-table-container">
        <table className="bill-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Qty</th>
              <th>Rate</th>
              <th style={{textAlign: 'right'}}>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td className="item-name-cell">{item.name}</td>
                <td className="item-qty-cell">
                  <div style={{display: 'flex', alignItems: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap'}}>
                    <input 
                      className="print-hidden"
                      type="number" 
                      min="1"
                      value={item.qty === 0 && item.qty !== '' ? '' : item.qty} 
                      onChange={(e) => onUpdateItemQty && onUpdateItemQty(item.name, e.target.value)}
                      style={{width: '60px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}
                    />
                    <span className="print-only" style={{fontWeight: 'bold', marginRight: '4px'}}>
                      {item.qty}
                    </span>
                    <span style={{marginLeft: '4px'}}>{item.unit}</span>
                  </div>
                </td>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', flexWrap: 'nowrap', whiteSpace: 'nowrap'}}>
                    <span style={{marginRight: '4px'}}>₹</span>
                    <input 
                      className="print-hidden"
                      type="number" 
                      min="0"
                      value={item.actualRate !== undefined ? (item.actualRate === 0 && item.actualRate !== '' ? '' : item.actualRate) : item.rate} 
                      onChange={(e) => onUpdateItemRate && onUpdateItemRate(item.name, e.target.value)}
                      style={{width: '70px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}
                    />
                    <span className="print-only" style={{fontWeight: 'bold'}}>
                      {item.actualRate !== undefined ? item.actualRate : item.rate}
                    </span>
                  </div>
                </td>
                <td className="item-amount-cell">₹ {item.amount}</td>
                <td style={{textAlign: 'center', cursor: 'pointer', color: 'var(--pepsi-red)', width: '30px'}} onClick={() => onRemoveItem && onRemoveItem(item.name)}>
                  <Trash2 size={16} />
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                  No items added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bill-summary">
        <div className="summary-row total-items">
          <span>Total Items: {totalItems}</span>
          <span>Total Qty: {totalQty} Cases</span>
        </div>
        <div className="summary-row grand-total">
          <span>Grand Total</span>
          <span>₹ {grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn btn-secondary btn-full" onClick={() => window.print()}><Printer size={16} className="mr-2" style={{marginRight: '8px'}} /> Print Bill</button>
        <button className="btn btn-primary btn-full" onClick={() => onSaveBill(totalItems, totalQty, grandTotal)} disabled={items.length === 0}>
          <Save size={16} className="mr-2" style={{marginRight: '8px'}} /> Save Bill
        </button>
      </div>

    </div>
  );
};

export default CurrentBillPanel;
