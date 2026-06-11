import React, { useState } from 'react';
import './BillHistory.css';
import { Search, ListPlus, CheckCircle, ChevronDown, ChevronUp, Trash2, Edit } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const BillHistory = () => {
  const { bills, unclearBill, deleteBill, currentBillItems, setCurrentBillItems, setCurrentShopName } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (id) => {
    if (expandedRow === id) setExpandedRow(null);
    else setExpandedRow(id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this bill from history?")) {
      deleteBill(id);
    }
  };

  const handleEdit = (bill) => {
    if (currentBillItems.length > 0) {
      if (!window.confirm("Editing this bill will overwrite your current unsaved draft. Continue?")) {
        return;
      }
    }
    setCurrentBillItems(bill.items);
    setCurrentShopName(bill.shopName || '');
    deleteBill(bill.id);
    navigate('/');
  };

  // Filter bills based on search term
  const filteredBills = bills.filter(b => 
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.shopName && b.shopName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePushToCurrent = (id) => {
    unclearBill(id);
    alert("Bill pushed back to Current Saved Bills (Daily Queue)!");
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <h1 className="history-title">Saved Bills History</h1>
        <div className="history-actions">
          <div className="search-box">
            <Search size={18} color="var(--text-muted)" />
              <input 
              type="text" 
              placeholder="Search by Invoice ID or Shop Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '250px' }}
            />
          </div>
        </div>
      </div>

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer / Shop</th>
              <th>Date & Time</th>
              <th>Total Items (Qty)</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map(bill => (
              <React.Fragment key={bill.id}>
                <tr className={expandedRow === bill.id ? 'expanded-parent-row' : ''}>
                  <td style={{ fontWeight: 600 }}>{bill.id}</td>
                  <td>{bill.shopName}</td>
                  <td>{formatDate(bill.date)}</td>
                  <td>{bill.totalItems} Items ({bill.totalQty} Cases)</td>
                  <td style={{ fontWeight: 600 }}>₹ {bill.grandTotal.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${bill.isPrinted ? 'printed' : 'unprinted'}`}>
                      {bill.isPrinted ? 'Printed' : 'Unprinted'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => toggleRow(bill.id)}
                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      >
                        {expandedRow === bill.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        Details
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleEdit(bill)}
                        title="Edit Bill"
                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--primary-color)' }}
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handlePushToCurrent(bill.id)}
                        title="Push to Current Queue"
                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      >
                        <ListPlus size={16} />
                        To Queue
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleDelete(bill.id)}
                        title="Delete Bill Permanently"
                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#dc2626', backgroundColor: 'transparent', border: '1px solid #fca5a5' }}
                      >
                        <Trash2 size={16} />
                        Clear
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedRow === bill.id && (
                  <tr className="expanded-details-row">
                    <td colSpan="7" style={{ padding: '0', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ padding: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>Bill Details: {bill.id}</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <thead style={{ backgroundColor: '#f1f5f9' }}>
                            <tr>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Product</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Qty</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Rate</th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bill.items.map((item, idx) => (
                              <tr key={idx}>
                                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', fontWeight: '500' }}>{item.name}</td>
                                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>{item.qty} {item.unit}</td>
                                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>₹ {item.actualRate !== undefined ? item.actualRate : item.rate}</td>
                                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', textAlign: 'right', fontWeight: '500' }}>₹ {item.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filteredBills.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No saved bills found. Generate and save a bill from the New Billing page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BillHistory;
