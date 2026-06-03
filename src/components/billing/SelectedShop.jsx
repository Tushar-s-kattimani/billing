import React from 'react';
import './SelectedShop.css';
import { Store } from 'lucide-react';
const SelectedShop = ({ shopName, setShopName }) => {

  return (
    <div className="card selected-shop-card" style={{marginBottom: '1rem'}}>
      <div className="shop-info-main" style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
        <div className="shop-icon" style={{backgroundColor: 'var(--pepsi-blue)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)'}}>
          <Store size={24} />
        </div>
        <div style={{flex: 1}}>
          <div className="text-sm text-secondary font-medium uppercase tracking-wide mb-1" style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>
            Customer / Shop Name
          </div>
          <input 
            type="text" 
            placeholder="Search or Enter Shop Name..." 
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--pepsi-blue)',
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SelectedShop;
