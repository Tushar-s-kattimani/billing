import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
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
  const [loadedUserKey, setLoadedUserKey] = useState(null);

  const userKey = user ? user.email : 'guest';
  const firebaseUserKey = user ? user.uid : 'guest';
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

  const [currentBillItems, setCurrentBillItems] = useState(() => {
    const saved = localStorage.getItem(getStorageKey('currentBillItems'));
    return saved ? JSON.parse(saved) : [];
  });

  const [currentShopName, setCurrentShopName] = useState(() => {
    return localStorage.getItem(getStorageKey('currentShopName')) || '';
  });

  const [currentBillId, setCurrentBillId] = useState(() => {
    return localStorage.getItem(getStorageKey('currentBillId')) || null;
  });

  useEffect(() => {
    localStorage.setItem(getStorageKey('currentBillItems'), JSON.stringify(currentBillItems));
  }, [currentBillItems, userKey]);

  useEffect(() => {
    localStorage.setItem(getStorageKey('currentShopName'), currentShopName);
  }, [currentShopName, userKey]);

  useEffect(() => {
    if (currentBillId) {
      localStorage.setItem(getStorageKey('currentBillId'), currentBillId);
    } else {
      localStorage.removeItem(getStorageKey('currentBillId'));
    }
  }, [currentBillId, userKey]);

  // Fetch true state from Firebase on mount or when user changes
  useEffect(() => {
    if (!user) return;
    
    const fetchFromFirebase = async () => {
      try {
        const prodDoc = await getDoc(doc(db, "users", firebaseUserKey, "data", "products"));
        if (prodDoc.exists() && prodDoc.data().items) {
          setProducts(prodDoc.data().items);
        } else {
          const saved = localStorage.getItem(`billing_products_${userKey}`);
          setProducts(saved ? JSON.parse(saved) : initialProducts);
        }

        // Fetch bills from individual documents in the 'bills' subcollection
        let fetchedBills = [];
        try {
          const billsQuerySnapshot = await getDocs(collection(db, "users", firebaseUserKey, "bills"));
          billsQuerySnapshot.forEach((doc) => {
            fetchedBills.push(doc.data());
          });
        } catch (err) {
          console.error("Error fetching bills subcollection", err);
        }

        // Migration from old single document to individual documents
        const oldBillDoc = await getDoc(doc(db, "users", firebaseUserKey, "data", "bills"));
        if (oldBillDoc.exists() && oldBillDoc.data().items) {
          const oldBills = oldBillDoc.data().items;
          const newBillIds = new Set(fetchedBills.map(b => b.id));
          const billsToMigrate = oldBills.filter(b => !newBillIds.has(b.id));

          if (billsToMigrate.length > 0) {
            const batch = writeBatch(db);
            billsToMigrate.forEach(bill => {
              const billRef = doc(db, "users", firebaseUserKey, "bills", String(bill.id));
              batch.set(billRef, bill);
            });
            await batch.commit().catch(err => console.error("Migration batch commit failed", err));
            fetchedBills = [...fetchedBills, ...billsToMigrate];
          }
        }

        // Migration from local storage for bills that didn't sync properly previously
        const saved = localStorage.getItem(`billing_history_${userKey}`);
        const localBills = saved ? JSON.parse(saved) : [];
        if (localBills.length > 0) {
          const newBillIds = new Set(fetchedBills.map(b => b.id));
          const localBillsToMigrate = localBills.filter(b => !newBillIds.has(b.id));

          if (localBillsToMigrate.length > 0) {
            const batch = writeBatch(db);
            localBillsToMigrate.forEach(bill => {
              const billRef = doc(db, "users", firebaseUserKey, "bills", String(bill.id));
              batch.set(billRef, bill);
            });
            await batch.commit().catch(err => console.error("Local migration batch commit failed", err));
            fetchedBills = [...fetchedBills, ...localBillsToMigrate];
          }
        }

        fetchedBills.sort((a, b) => new Date(b.date) - new Date(a.date));
        setBills(fetchedBills);

        const draftDoc = await getDoc(doc(db, "users", firebaseUserKey, "data", "draft"));
        if (draftDoc.exists()) {
          const data = draftDoc.data();
          if (data.currentBillItems) {
            setCurrentBillItems(data.currentBillItems);
          }
          if (data.currentShopName !== undefined) {
            setCurrentShopName(data.currentShopName);
          }
          if (data.currentBillId !== undefined) {
            setCurrentBillId(data.currentBillId);
          }
        }
      } catch (err) {
        console.error("Firebase connection error. Falling back to local storage.", err);
        alert("Firebase read error: " + err.message);
        setIsFirebaseError(true);
        const savedProd = localStorage.getItem(`billing_products_${userKey}`);
        setProducts(savedProd ? JSON.parse(savedProd) : initialProducts);
        const savedBills = localStorage.getItem(`billing_history_${userKey}`);
        setBills(savedBills ? JSON.parse(savedBills) : []);
        const savedDraft = localStorage.getItem(`billing_currentBillItems_${userKey}`);
        if (savedDraft) setCurrentBillItems(JSON.parse(savedDraft));
        const savedDraftId = localStorage.getItem(`billing_currentBillId_${userKey}`);
        if (savedDraftId) setCurrentBillId(savedDraftId);
      }
      setLoadedUserKey(userKey);
      setDataLoaded(true);
    };

    fetchFromFirebase();
  }, [userKey]);

  // Save to Firebase and LocalStorage whenever products change
  useEffect(() => {
    localStorage.setItem(getStorageKey('products'), JSON.stringify(products));
    if (dataLoaded && !isFirebaseError && user && loadedUserKey === userKey) {
      setDoc(doc(db, "users", firebaseUserKey, "data", "products"), { items: products })
        .catch(err => {
          console.error(err);
          alert("Firebase save products error: " + err.message);
        });
    }
  }, [products, dataLoaded, isFirebaseError, userKey, loadedUserKey, firebaseUserKey]);

  // Save to LocalStorage whenever bills change
  useEffect(() => {
    localStorage.setItem(getStorageKey('history'), JSON.stringify(bills));
  }, [bills, userKey]);

  // Save to Firebase whenever currentBillItems, currentShopName or currentBillId changes
  useEffect(() => {
    if (dataLoaded && !isFirebaseError && user && loadedUserKey === userKey) {
      setDoc(doc(db, "users", firebaseUserKey, "data", "draft"), { 
        currentBillItems,
        currentShopName,
        currentBillId: currentBillId || null
      }, { merge: true })
        .catch(err => {
          console.error("Firebase save draft error: ", err);
        });
    }
  }, [currentBillItems, currentShopName, currentBillId, dataLoaded, isFirebaseError, userKey, loadedUserKey, firebaseUserKey]);

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

  const addBill = (newBill) => {
    setBills(prev => {
      const index = prev.findIndex(b => b.id === newBill.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = newBill;
        updated.sort((a, b) => new Date(b.date) - new Date(a.date));
        return updated;
      }
      return [newBill, ...prev]; // Add newest to the top
    });
    if (user && loadedUserKey === userKey) {
      setDoc(doc(db, "users", firebaseUserKey, "bills", String(newBill.id)), newBill).catch(console.error);
    }
  };

  const updateBillStatus = (id, isPrinted) => {
    setBills(bills.map(b => b.id === id ? { ...b, isPrinted } : b));
    if (user && loadedUserKey === userKey) {
      setDoc(doc(db, "users", firebaseUserKey, "bills", String(id)), { isPrinted }, { merge: true }).catch(console.error);
    }
  };

  const clearBill = (id) => {
    setBills(bills.map(b => b.id === id ? { ...b, isCleared: true } : b));
    if (user && loadedUserKey === userKey) {
      setDoc(doc(db, "users", firebaseUserKey, "bills", String(id)), { isCleared: true }, { merge: true }).catch(console.error);
    }
  };

  const unclearBill = (id) => {
    setBills(bills.map(b => b.id === id ? { ...b, isCleared: false } : b));
    if (user && loadedUserKey === userKey) {
      setDoc(doc(db, "users", firebaseUserKey, "bills", String(id)), { isCleared: false }, { merge: true }).catch(console.error);
    }
  };

  const clearAllBills = () => {
    setBills(bills.map(b => ({ ...b, isCleared: true })));
    if (user && loadedUserKey === userKey) {
      const batch = writeBatch(db);
      bills.forEach(bill => {
        if (!bill.isCleared) {
          const billRef = doc(db, "users", firebaseUserKey, "bills", String(bill.id));
          batch.set(billRef, { isCleared: true }, { merge: true });
        }
      });
      batch.commit().catch(console.error);
    }
  };

  return (
    <AppContext.Provider value={{ 
      products, addProduct, deleteProduct, editProduct, moveProduct,
      bills, addBill, updateBillStatus, clearBill, unclearBill, clearAllBills,
      currentBillItems, setCurrentBillItems,
      currentShopName, setCurrentShopName,
      currentBillId, setCurrentBillId
    }}>
      {children}
    </AppContext.Provider>
  );
};
