import React, { useState } from 'react';
import './BillHistory.css'; // Reusing the same styles
import { Search, CheckCircle2, Trash2, Printer } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CurrentSavedBills = () => {
  const { bills, clearBill, clearAllBills, updateBillStatus } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [billsPerPage, setBillsPerPage] = useState(4);
  const [showLoadSheet, setShowLoadSheet] = useState(false);

  // Filter for ONLY bills that haven't been cleared yet, and apply search
  const pendingBills = bills.filter(b => 
    !b.isCleared && b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClear = (id) => {
    clearBill(id);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all current bills? They will still be available in the Bill History.")) {
      clearAllBills();
    }
  };

  const handleBatchPrint = () => {
    // Mark all pending as printed
    pendingBills.forEach(b => updateBillStatus(b.id, true));
    
    // Slight delay to allow state to update before printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const generateLoadSheet = () => {
    const products = {};
    const sizeSet = new Set();
    let grandTotalCases = 0;
    
    pendingBills.forEach(bill => {
      bill.items.forEach(item => {
        sizeSet.add(item.unit);
        if (!products[item.name]) products[item.name] = {};
        if (!products[item.name][item.unit]) products[item.name][item.unit] = 0;
        products[item.name][item.unit] += item.qty;
        grandTotalCases += item.qty;
      });
    });
    
    const allSizes = Array.from(sizeSet).sort((a, b) => {
      const aIsMl = a.toLowerCase().includes('ml');
      const bIsMl = b.toLowerCase().includes('ml');
      if (aIsMl && !bIsMl) return -1;
      if (!aIsMl && bIsMl) return 1;
      return parseInt(a) - parseInt(b);
    });
    
    return { products, allSizes, grandTotalCases };
  };
  const { products: loadSheetProducts, allSizes: loadSheetSizes, grandTotalCases } = generateLoadSheet();

  const handlePrintLoadSheet = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <h1 className="history-title">Current Saved Bills (Daily Queue)</h1>
        <div className="history-actions">
          <div className="search-box">
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by Invoice ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {pendingBills.length > 0 && (
            <div className="print-controls" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'white', padding: '0.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <select 
                value={billsPerPage} 
                onChange={(e) => setBillsPerPage(Number(e.target.value))}
                style={{ border: 'none', outline: 'none', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
              >
                <option value={1}>1 per page</option>
                <option value={2}>2 per page</option>
                <option value={4}>4 per page</option>
                <option value={6}>6 per page</option>
                <option value={9}>9 per page</option>
              </select>
              <button className="btn btn-primary" onClick={() => setShowLoadSheet(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                View Load Sheet
              </button>
              <button className="btn btn-primary" onClick={handleBatchPrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <Printer size={16} /> Batch Print PDF
              </button>
            </div>
          )}
          {pendingBills.length > 0 && (
            <button className="btn btn-secondary" onClick={handleClearAll} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trash2 size={16} /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="bills-list">
        {pendingBills.length === 0 ? (
          <div className="empty-state">
            All caught up! No pending bills in the current queue.
          </div>
        ) : (
          pendingBills.map(bill => (
            <div key={bill.id} className="bill-detail-card">
              <div className="bill-card-header">
                <div className="bill-info">
                  <h3>{bill.id}</h3>
                  <div style={{fontSize: '1.25rem', fontWeight: '800', color: 'var(--pepsi-blue)', marginBottom: '0.25rem', textTransform: 'uppercase'}}>
                    {bill.shopName}
                  </div>
                  <span className="bill-date">{formatDate(bill.date)}</span>
                </div>
                <div className="bill-actions">
                  <span className={`status-badge ${bill.isPrinted ? 'printed' : 'unprinted'}`}>
                    {bill.isPrinted ? 'Printed' : 'Unprinted'}
                  </span>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleClear(bill.id)}
                    title="Remove from this list (keeps in Bill History)"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                  >
                    <CheckCircle2 size={16} />
                    Clear Bill
                  </button>
                </div>
              </div>
              
              <div className="bill-items-table">
                <table style={{ fontSize: '1.1rem' }}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th style={{textAlign: 'right'}}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{fontWeight: 'bold'}}>{item.name}</td>
                        <td style={{fontWeight: 'bold'}}>{item.qty} {item.unit}</td>
                        <td style={{fontWeight: 'bold'}}>₹ {item.rate}</td>
                        <td style={{textAlign: 'right', fontWeight: 'bold'}}>₹ {item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="bill-card-footer">
                <div className="bill-totals">
                  <span>Total Items: {bill.totalItems} ({bill.totalQty} Cases)</span>
                  <span className="grand-total-text">Grand Total: ₹ {bill.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load Sheet Modal */}
      {showLoadSheet && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <h2 className="modal-title" style={{ margin: 0 }}>Daily Load Sheet (Picking List)</h2>
              <button className="btn btn-primary" onClick={handlePrintLoadSheet}>
                <Printer size={16} className="mr-2" style={{marginRight: '8px'}} />
                Print Sheet
              </button>
            </div>
            
            <div className="load-sheet-content" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {Object.keys(loadSheetProducts).length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No items to load.</p>
              ) : (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead style={{ backgroundColor: 'var(--pepsi-blue)', color: 'white' }}>
                      <tr>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Product</th>
                        {loadSheetSizes.map(size => (
                          <th key={size} style={{ padding: '0.75rem 1rem' }}>{size}</th>
                        ))}
                        <th style={{ padding: '0.75rem 1rem', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(loadSheetProducts).sort().map(([productName, sizes]) => {
                        const rowTotal = loadSheetSizes.reduce((sum, size) => sum + (sizes[size] || 0), 0);
                        return (
                          <tr key={productName} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '500' }}>{productName}</td>
                            {loadSheetSizes.map(size => (
                              <td key={size} style={{ padding: '0.75rem 1rem' }}>
                                {sizes[size] ? <span style={{fontWeight: 'bold', color: 'var(--pepsi-blue)'}}>{sizes[size]}</span> : '-'}
                              </td>
                            ))}
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold', borderLeft: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                              {rowTotal}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Total Cases</th>
                        {loadSheetSizes.map(size => {
                          const colTotal = Object.values(loadSheetProducts).reduce((sum, s) => sum + (s[size] || 0), 0);
                          return <th key={size} style={{ padding: '0.75rem 1rem' }}>{colTotal}</th>;
                        })}
                        <th style={{ padding: '0.75rem 1rem', borderLeft: '1px solid var(--border-color)', fontSize: '1.1rem', color: 'var(--pepsi-blue)' }}>
                          {grandTotalCases}
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowLoadSheet(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Container */}
      <div className={`print-container ${showLoadSheet ? 'print-load-sheet-layout' : `print-layout-${billsPerPage}`}`}>
        {showLoadSheet ? (
          <div className="print-load-sheet">
            <h1 style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px', textTransform: 'uppercase' }}>
              Daily Load Sheet
            </h1>
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>Date: {new Date().toLocaleDateString('en-IN')}</p>
            
            {Object.keys(loadSheetProducts).length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #000', textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'left', backgroundColor: '#f0f0f0' }}>Product</th>
                    {loadSheetSizes.map(size => (
                      <th key={size} style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#f0f0f0' }}>{size}</th>
                    ))}
                    <th style={{ border: '2px solid #000', padding: '10px', backgroundColor: '#e0e0e0' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(loadSheetProducts).sort().map(([productName, sizes]) => {
                    const rowTotal = loadSheetSizes.reduce((sum, size) => sum + (sizes[size] || 0), 0);
                    return (
                      <tr key={productName}>
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>{productName}</td>
                        {loadSheetSizes.map(size => (
                          <td key={size} style={{ border: '1px solid #000', padding: '8px' }}>
                            {sizes[size] || '-'}
                          </td>
                        ))}
                        <td style={{ border: '2px solid #000', padding: '8px', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
                          {rowTotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <th style={{ border: '2px solid #000', padding: '10px', textAlign: 'left', backgroundColor: '#e0e0e0' }}>Total Cases</th>
                    {loadSheetSizes.map(size => {
                      const colTotal = Object.values(loadSheetProducts).reduce((sum, s) => sum + (s[size] || 0), 0);
                      return <th key={size} style={{ border: '2px solid #000', padding: '10px', backgroundColor: '#e0e0e0' }}>{colTotal}</th>;
                    })}
                    <th style={{ border: '2px solid #000', padding: '10px', fontSize: '1.2em', backgroundColor: '#d0d0d0' }}>
                      {grandTotalCases}
                    </th>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        ) : (
          pendingBills.map(bill => (
            <div key={`print-${bill.id}`} className="print-receipt">
              <div className="print-header">
                <h2>SHRI GAJANAN ENTERPRISES GHATAPRABHA</h2>
                <p>GSTIN: 29AHSPK1222F1ZD | Mob: 9448860040</p>
                <div style={{marginTop: '10px', marginBottom: '10px', padding: '4px 0', borderTop: '1px solid #000', borderBottom: '1px solid #000'}}>
                  <p style={{margin: 0, fontWeight: 'bold', fontSize: '1.2em', textTransform: 'uppercase'}}>To: {bill.shopName}</p>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '5px'}}>
                  <p>Invoice: {bill.id}</p>
                  <p>Date: {formatDate(bill.date)}</p>
                </div>
              </div>
              <table className="print-items">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th style={{textAlign: 'right'}}>Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{fontWeight: 'bold'}}>{item.name}</td>
                      <td style={{fontWeight: 'bold'}}>{item.qty} {item.unit}</td>
                      <td style={{textAlign: 'right', fontWeight: 'bold'}}>₹ {item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="print-totals">
                <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #000', paddingTop: '8px', marginTop: '8px'}}>
                  <span>Items: {bill.totalItems} ({bill.totalQty})</span>
                  <strong>Total: ₹ {bill.grandTotal.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CurrentSavedBills;
