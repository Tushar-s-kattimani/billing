import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { 
  LayoutDashboard, 
  Package, 
  History,
  Clock,
  Users,
  Receipt,
  LogOut,
  Settings as SettingsIcon
} from 'lucide-react';
import { auth, signOut } from '../firebase';

const Sidebar = ({ isOpen, closeSidebar }) => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">P</div>
          <h2>Pepsi Dist.</h2>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>New Billing</span>
        </NavLink>
        
        <NavLink to="/products" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Package size={20} />
          <span>Products</span>
        </NavLink>
        
        <NavLink to="/current-bills" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Clock size={20} />
          <span>Current Bills</span>
        </NavLink>
        
        <NavLink to="/bills" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Receipt size={20} />
          <span>Bill History</span>
        </NavLink>
        
        <NavLink to="/settings" onClick={closeSidebar} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <SettingsIcon size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={handleLogout} style={{width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text-secondary)'}}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
