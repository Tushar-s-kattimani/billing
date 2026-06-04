import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Initial Mock Data Fallback
const initialProducts = [
  { 
    id: 1, name: 'Pepsi', 
    variants: [{size: '250ml', rate: 320}, {size: '600ml', rate: 450}, {size: '750ml', rate: 480}, {size: '1L', rate: 550}, {size: '2L', rate: 900}] 
  },
  { 
    id: 2, name: 'Pepsi Black', 
    variants: [{size: '250ml', rate: 340}, {size: '600ml', rate: 460}, {size: '750ml', rate: 500}] 
  },
  { 
    id: 3, name: 'Diet Pepsi', 
    variants: [{size: '250ml', rate: 330}, {size: '600ml', rate: 450}] 
  },
  { 
    id: 4, name: 'Mirinda', 
    variants: [{size: '250ml', rate: 310}, {size: '600ml', rate: 440}, {size: '1L', rate: 540}, {size: '2L', rate: 880}] 
  },
  { 
    id: 5, name: '7UP', 
    variants: [{size: '250ml', rate: 315}, {size: '600ml', rate: 445}, {size: '750ml', rate: 485}, {size: '1L', rate: 545}, {size: '2L', rate: 890}] 
  },
  { 
    id: 6, name: 'Mountain Dew', 
    variants: [{size: '250ml', rate: 325}, {size: '600ml', rate: 455}, {size: '1L', rate: 560}] 
  },
  { 
    id: 7, name: 'Aquafina Water', 
    variants: [{size: '500ml', rate: 150}, {size: '1L', rate: 210}, {size: '2L', rate: 380}] 
  },
];

export const AppProvider = ({ children, user }) => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isFirebaseError, setIsFirebaseError] = useState(false);

  const userKey = user ? user.email : 'guest';
  const getStorageKey = (type) => `billing_${type}_${userKey}`;

  // Initialize with localStorage to prevent blank screens during network lag
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem(getStorageKey('products'));
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [bills, setBills] = useState(() => {
    const saved = localStorage.getItem(getStorageKey('history'));
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch true state from Firebase on mount or when user changes
  useEffect(() => {
    if (!user) return;
    
    const fetchFromFirebase = async () => {
      try {
        const prodDoc = await getDoc(doc(db, "users", userKey, "data", "products"));
        if (prodDoc.exists() && prodDoc.data().items) setProducts(prodDoc.data().items);

        const billDoc = await getDoc(doc(db, "users", userKey, "data", "bills"));
        if (billDoc.exists() && billDoc.data().items) setBills(billDoc.data().items);
      } catch (err) {
        console.error("Firebase connection error. Falling back to local storage.", err);
        setIsFirebaseError(true);
      }
      setDataLoaded(true);
    };

    fetchFromFirebase();
  }, [userKey]);

  // Save to Firebase and LocalStorage whenever products change
  useEffect(() => {
    localStorage.setItem(getStorageKey('products'), JSON.stringify(products));
    if (dataLoaded && !isFirebaseError && user) {
      setDoc(doc(db, "users", userKey, "data", "products"), { items: products }).catch(console.error);
    }
  }, [products, dataLoaded, isFirebaseError, userKey]);

  // Save to Firebase and LocalStorage whenever bills change
  useEffect(() => {
    localStorage.setItem(getStorageKey('history'), JSON.stringify(bills));
    if (dataLoaded && !isFirebaseError && user) {
      setDoc(doc(db, "users", userKey, "data", "bills"), { items: bills }).catch(console.error);
    }
  }, [bills, dataLoaded, isFirebaseError, userKey]);

  const addProduct = (newProduct) => setProducts([...products, newProduct]);
  const deleteProduct = (id) => setProducts(products.filter(p => p.id !== id));
  const editProduct = (id, updatedProduct) => setProducts(products.map(p => p.id === id ? { ...updatedProduct, id } : p));
  const moveProduct = (id, direction) => {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      const newProducts = [...products];
      [newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]];
      setProducts(newProducts);
    } else if (direction === 'down' && index < products.length - 1) {
      const newProducts = [...products];
      [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];
      setProducts(newProducts);
    }
  };

  const addBill = (newBill) => setBills([newBill, ...bills]); // Add newest to the top
  const updateBillStatus = (id, isPrinted) => setBills(bills.map(b => b.id === id ? { ...b, isPrinted } : b));
  const clearBill = (id) => setBills(bills.map(b => b.id === id ? { ...b, isCleared: true } : b));
  const clearAllBills = () => setBills(bills.map(b => ({ ...b, isCleared: true })));
  const deleteBill = (id) => setBills(bills.filter(b => b.id !== id));

  return (
    <AppContext.Provider value={{ 
      products, addProduct, deleteProduct, editProduct, moveProduct,
      bills, addBill, updateBillStatus, clearBill, clearAllBills, deleteBill 
    }}>
      {children}
    </AppContext.Provider>
  );
};
