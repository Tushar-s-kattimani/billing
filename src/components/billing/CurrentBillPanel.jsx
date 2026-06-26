import React, { useState } from 'react';
import './CurrentBillPanel.css';
import { Banknote, Smartphone, CreditCard as CardIcon, Building, Save, Printer, PauseCircle, Share2, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { ESCPOSBuilder } from '../../utils/escposBuilder';

const CurrentBillPanel = ({ items, shopName, onSaveBill, onRemoveItem, onUpdateItemRate, onUpdateItemQty, onClearBill }) => {
  const totalItems = items.length;
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const grandTotal = items.reduce((sum, item) => sum + item.amount, 0);

  const { isBluetoothConnected, printerCharacteristic } = useAppContext();

  const handlePrint = async () => {
    if (isBluetoothConnected && printerCharacteristic) {
      try {
        const builder = new ESCPOSBuilder();
        builder.init();
        
        // Header
        builder.align('center');
        builder.bold(true).size(true, true).textLine('SHRI GAJANAN ENTERPRISES GHATAPRABHA').size(false, false).bold(false);
        builder.textLine('GSTIN: 29AHSPK1222F1ZD | Mob: 9448860040');
        builder.bold(true).textLine('TAX INVOICE').bold(false);
        builder.feed(1);
        
        // Customer
        if (shopName) {
          builder.align('left');
          builder.bold(true).text('To: ').bold(false).textLine(shopName);
          builder.feed(1);
        }

        // Table Header
        builder.align('left');
        builder.separator('-');
        builder.itemRow('Item', 'Qty', 'Rate', 'Amount');
        builder.separator('-');

        // Items
        items.forEach(item => {
          const rate = item.actualRate !== undefined ? item.actualRate : item.rate;
          builder.itemRow(item.name, item.qty.toString(), rate.toString(), item.amount.toString());
        });

        builder.separator('-');
        
        // Totals
        builder.align('right');
        builder.bold(true).textLine(`Total Items: ${totalItems} (${totalQty} Cases)`).bold(false);
        builder.size(false, true).bold(true).textLine(`Grand Total: Rs ${grandTotal.toFixed(2)}`).bold(false).size(false, false);
        
        // Footer
        builder.feed(1);
        builder.align('center');
        builder.textLine('Thank you for your business!');
        builder.feed(3);
        builder.cut();

        const data = builder.build();
        
        const CHUNK_SIZE = 512;
        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
          const chunk = data.slice(i, i + CHUNK_SIZE);
          if (printerCharacteristic.properties.writeWithoutResponse) {
             await printerCharacteristic.writeValueWithoutResponse(chunk);
          } else {
             await printerCharacteristic.writeValue(chunk);
          }
        }
        return;
      } catch (err) {
        console.error('Bluetooth printing failed, falling back to window.print', err);
        alert('Bluetooth print failed. Falling back to normal print. ' + err.message);
      }
    }

    const style = document.createElement('style');
    style.id = 'thermal-print-style';
    style.innerHTML = `
      @media print {
        @page { margin: 0; size: 80mm auto; }
        html, body { max-width: 80mm !important; margin: 0 auto !important; padding: 0 !important; font-size: 12px !important; color: #000 !important; font-family: "Bookman Old Style", serif !important; }
        .bill-table th, .bill-table td { padding: 2px 4px !important; font-size: 11px !important; line-height: 1.2 !important; }
        .item-name-cell { font-size: 12px !important; }
      }
    `;
    document.head.appendChild(style);
    
    // Force browser to recalculate styles before printing
    window.getComputedStyle(document.body).getPropertyValue('color');
    
    // Call print synchronously so the browser doesn't block it as a popup
    window.print();
    
    setTimeout(() => {
      const injectedStyle = document.getElementById('thermal-print-style');
      if (injectedStyle) {
        document.head.removeChild(injectedStyle);
      }
    }, 1000);
  };

  return (
    <div className="bill-panel">
      {/* Print-only receipt header */}
      <div className="print-only print-header" style={{ textAlign: 'center', paddingBottom: '8px', borderBottom: '1px dashed #000', marginBottom: '8px' }}>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 'bold' }}>SHRI GAJANAN ENTERPRISES GHATAPRABHA</h2>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>GSTIN: 29AHSPK1222F1ZD | Mob: 9448860040</p>
        <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 'bold' }}>TAX INVOICE</p>
        {shopName && (
          <div style={{ fontSize: '12px', textAlign: 'left', marginTop: '6px' }}>
            <strong>To:</strong> {shopName}
          </div>
        )}
      </div>

      <div className="bill-header print-hidden" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2 className="bill-title" style={{margin: 0}}>Current Bill</h2>
        {items.length > 0 && (
          <button 
            className="btn btn-secondary print-hidden" 
            onClick={onClearBill} 
            style={{padding: '0.25rem 0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center'}}
          >
            <Trash2 size={14} style={{marginRight: '4px'}} /> Clear All
          </button>
        )}
      </div>

      <div className="bill-table-container">
        <table className="bill-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Qty</th>
              <th>Rate</th>
              <th style={{textAlign: 'right'}}>Amount</th>
              <th className="print-hidden"></th>
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
                <td className="print-hidden" style={{textAlign: 'center', cursor: 'pointer', color: 'var(--pepsi-red)', width: '30px'}} onClick={() => onRemoveItem && onRemoveItem(item.name)}>
                  <Trash2 size={16} />
                </td>
              </tr>
            ))}
            {items.length > 0 && (
              <tr className="print-only">
                <td style={{ borderBottom: '1px solid var(--border-color)', height: '3rem' }}></td>
                <td style={{ borderBottom: '1px solid var(--border-color)' }}></td>
                <td style={{ borderBottom: '1px solid var(--border-color)' }}></td>
                <td style={{ borderBottom: '1px solid var(--border-color)' }}></td>
              </tr>
            )}
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
        <button className="btn btn-secondary btn-full" onClick={handlePrint}><Printer size={16} className="mr-2" style={{marginRight: '8px'}} /> Print Bill</button>
        <button className="btn btn-primary btn-full" onClick={() => onSaveBill(totalItems, totalQty, grandTotal)} disabled={items.length === 0}>
          <Save size={16} className="mr-2" style={{marginRight: '8px'}} /> Save Bill
        </button>
      </div>

    </div>
  );
};

export default CurrentBillPanel;
