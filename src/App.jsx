import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import BillingDashboard from './components/billing/BillingDashboard';
import Products from './pages/Products';
import BillHistory from './pages/BillHistory';
import CurrentSavedBills from './pages/CurrentSavedBills';
import Login from './components/Login';
import { auth, onAuthStateChanged } from './firebase';

import { AppProvider } from './context/AppContext';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Loading...</div>;
  }

  if (!user) {
    return <Login onLoginSuccess={() => {}} />; // auth state change will handle the rest
  }

  return (
    <AppProvider user={user}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<BillingDashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="current-bills" element={<CurrentSavedBills />} />
            <Route path="bills" element={<BillHistory />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
