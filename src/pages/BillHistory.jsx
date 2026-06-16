import React, { useState } from 'react';
import './BillHistory.css';
import { Search, ListPlus, CheckCircle, ChevronDown, ChevronUp, Edit, Printer, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { robotoRegular, robotoBold } from '../RobotoFont';

const BillHistory = () => {
  const { bills, unclearBill, currentBillItems, setCurrentBillItems, setCurrentShopName } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const handleDownloadSinglePDF = (bill) => {
    const doc = new jsPDF();
    doc.addFileToVFS('Roboto-Regular.ttf', robotoRegular);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.addFileToVFS('Roboto-Bold.ttf', robotoBold);
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto');
    
    // Header
    doc.setFontSize(22);
    doc.setFont('Roboto', 'bold');
    doc.text("SHRI GAJANAN ENTERPRISES GHATAPRABHA", 14, 20);
    
    doc.setFontSize(12);
    doc.setFont('Roboto', 'bold');
    doc.text("GSTIN: 29AHSPK1222F1ZD | Mob: 9448860040", 14, 28);
    
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);
    
    doc.setFontSize(14);
    doc.setFont('Roboto', 'bold');
    doc.text(`To: ${bill.shopName}`, 14, 40);
    
    doc.setFontSize(12);
    doc.setFont('Roboto', 'bold');
    doc.text(`Invoice ID: ${bill.id}`, 14, 48);
    
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const dateStr = new Date(bill.date).toLocaleDateString('en-IN', options);
    doc.text(`Date: ${dateStr}`, 14, 54);
    
    // Table
    const tableData = bill.items.map((item, idx) => [
      idx + 1,
      item.name,
      `${item.qty} ${item.unit}`,
      `₹ ${item.actualRate !== undefined ? item.actualRate : item.rate}`,
      `₹ ${item.amount}`
    ]);
    
    autoTable(doc, {
      startY: 60,
      head: [['S.No', 'Item Name', 'Quantity', 'Rate', 'Total Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { font: 'Roboto', fillColor: [240, 240, 240], textColor: [0, 0, 0], halign: 'center', fontStyle: 'bold', fontSize: 12 },
      styles: { font: 'Roboto', textColor: [0, 0, 0], fontSize: 11, fontStyle: 'bold', cellPadding: 5, lineColor: [150, 150, 150], lineWidth: 0.2 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
      }
    });
    
    // Totals
    const finalY = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(14);
    doc.setFont('Roboto', 'bold');
    doc.text(`Total Items: ${bill.totalItems} (${bill.totalQty} Cases)`, 14, finalY);
    
    doc.setFontSize(16);
    doc.text(`Grand Total: ₹ ${bill.grandTotal.toFixed(2)}`, 130, finalY);
    
    doc.save(`Invoice_${bill.id}.pdf`);
  };

  const toggleRow = (id) => {
    if (expandedRow === id) setExpandedRow(null);
    else setExpandedRow(id);
  };

  const handleEdit = (bill) => {
    if (currentBillItems.length > 0) {
      if (!window.confirm("Editing this bill will overwrite your current unsaved draft. Continue?")) {
        return;
      }
    }
    setCurrentBillItems(bill.items);
    setCurrentShopName(bill.shopName || '');
    navigate('/');
  };

  // Filter bills based on search term and date
  const filteredBills = bills.filter(b => {
    const matchesSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (b.shopName && b.shopName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesDate = true;
    if (dateFilter) {
      const billDateObj = new Date(b.date);
      // Format as YYYY-MM-DD in local time
      const year = billDateObj.getFullYear();
      const month = String(billDateObj.getMonth() + 1).padStart(2, '0');
      const day = String(billDateObj.getDate()).padStart(2, '0');
      const billDate = `${year}-${month}-${day}`;
      matchesDate = billDate === dateFilter;
    }
    
    return matchesSearch && matchesDate;
  });

  const handleBatchDownloadPDF = () => {
    if (filteredBills.length === 0) return;
    
    const doc = new jsPDF();
    doc.addFileToVFS('Roboto-Regular.ttf', robotoRegular);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.addFileToVFS('Roboto-Bold.ttf', robotoBold);
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto');
    
    doc.setFontSize(22);
    doc.setFont('Roboto', 'bold');
    doc.text("Detailed Saved Bills Report", 14, 20);
    
    doc.setFontSize(12);
    doc.setFont('Roboto', 'bold');
    if (dateFilter) {
      doc.text(`Date: ${dateFilter}`, 14, 28);
    } else {
      doc.text(`Showing All History`, 14, 28);
    }

    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);
    
    // Build a single massive master table with grouped bills
    const tableData = [];
    let serialNum = 1;

    filteredBills.forEach(bill => {
      bill.items.forEach((item, itemIndex) => {
        if (itemIndex === 0) {
          tableData.push([
            serialNum++,
            bill.id,
            bill.shopName,
            item.name,
            `${item.qty} ${item.unit}`,
            `₹ ${item.actualRate !== undefined ? item.actualRate : item.rate}`,
            `₹ ${item.amount}`
          ]);
        } else {
          tableData.push([
            '', // Empty S.No
            '', // Empty Inv ID
            '', // Empty Shop Name
            item.name,
            `${item.qty} ${item.unit}`,
            `₹ ${item.actualRate !== undefined ? item.actualRate : item.rate}`,
            `₹ ${item.amount}`
          ]);
        }
      });
      
      // Add a sub-total row for the bill
      tableData.push([
        { 
          content: `Total for ${bill.shopName} (${bill.totalItems} Items):`, 
          colSpan: 6, 
          styles: { halign: 'right', fontStyle: 'bold', fillColor: [255, 243, 205], textColor: [0, 0, 0] } 
        },
        { 
          content: `₹ ${bill.grandTotal.toFixed(2)}`, 
          styles: { halign: 'right', fontStyle: 'bold', fillColor: [255, 243, 205], textColor: [0, 0, 0] } 
        }
      ]);
    });

    autoTable(doc, {
      startY: 38,
      head: [['S.No', 'Inv ID', 'Shop Name', 'Item Name', 'Qty', 'Rate', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { font: 'Roboto', fillColor: [240, 240, 240], textColor: [0, 0, 0], halign: 'center', fontStyle: 'bold', fontSize: 11 },
      styles: { font: 'Roboto', textColor: [0, 0, 0], fontSize: 10, fontStyle: 'bold', cellPadding: 4, lineColor: [150, 150, 150], lineWidth: 0.2 },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 40 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 20, halign: 'right' },
        6: { cellWidth: 25, halign: 'right' },
      }
    });
    
    // Add Grand Total sum at the very bottom
    let currentY = doc.lastAutoTable.finalY + 15;
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }
    const totalSum = filteredBills.reduce((sum, b) => sum + b.grandTotal, 0);
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Black color
    doc.text(`GRAND TOTAL FOR REPORT: ₹ ${totalSum.toFixed(2)}`, 14, currentY);
    
    doc.save(dateFilter ? `Detailed_Bills_Report_${dateFilter}.pdf` : `Detailed_Bills_Report_All.pdf`);
  };

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
          <div className="date-filter" style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', outline: 'none' }}
            />
            {dateFilter && (
              <button 
                onClick={() => setDateFilter('')} 
                className="btn btn-secondary" 
                style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem' }}
              >
                Clear Date
              </button>
            )}
            {filteredBills.length > 0 && (
              <button 
                onClick={handleBatchDownloadPDF}
                className="btn btn-primary"
                style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Download size={16} />
                Download PDF ({filteredBills.length})
              </button>
            )}
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
                        onClick={() => handleDownloadSinglePDF(bill)}
                        title="Download PDF"
                        style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pepsi-blue)' }}
                      >
                        <Download size={16} />
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
                          <tfoot>
                            <tr>
                              <th colSpan="3" style={{ padding: '0.75rem 1rem', textAlign: 'right', borderTop: '2px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Items: {bill.totalItems} ({bill.totalQty} Cases)
                              </th>
                              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', borderTop: '2px solid var(--border-color)', fontSize: '1.05rem', color: 'var(--pepsi-blue)' }}>
                                Grand Total: ₹ {bill.grandTotal.toFixed(2)}
                              </th>
                            </tr>
                          </tfoot>
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
