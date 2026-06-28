import React, { useState, useEffect } from 'react';
import './Header.css';
import { Search, Clock, Menu } from 'lucide-react';
import { auth } from '../firebase';

const Header = ({ toggleSidebar }) => {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const userEmail = auth.currentUser?.email || '';

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      setCurrentDateTime(now.toLocaleDateString('en-US', options).replace(',', ' |'));
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="header-search">
          <Search className="search-icon" />
        <input 
          type="text" 
          placeholder="Search Shop by Name or Mobile Number" 
          className="search-input"
        />
        </div>
      </div>
      <div className="header-right">
        <div className="datetime">
          <Clock size={16} />
          {currentDateTime || 'Tuesday, 26 Oct 2023 | 11:30 AM'}
        </div>
        
        <div className="profile-section">
          <div className="avatar">👤</div>
          <div className="profile-info">
            <span className="profile-name" style={{fontSize: '0.75rem'}}>{userEmail}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
