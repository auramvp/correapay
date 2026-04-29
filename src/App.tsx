/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import { Client, PaymentOrder, DashboardStats, AuthorizedUser } from './types';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Orders from './components/Orders';
import Correa from './components/Correa';
import Login from './components/Login';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Preload audio
  const coinSound = useMemo(() => new Audio('/sound/picpay_coin.mp3'), []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('bancafacil_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([]);

  // Auth & Sync
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync Data
  useEffect(() => {
    if (!currentUser) return;

    // Sync Clients
    const clientsUnsubscribe = onSnapshot(
      query(collection(db, 'clients'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
        setClients(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'clients')
    );

    // Sync Orders
    const ordersUnsubscribe = onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentOrder));
        setOrders(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'orders')
    );

    // Sync Users
    const usersUnsubscribe = onSnapshot(
      query(collection(db, 'users'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuthorizedUser));
        setAuthorizedUsers(data);
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'users')
    );

    return () => {
      clientsUnsubscribe();
      ordersUnsubscribe();
      usersUnsubscribe();
    };
  }, [currentUser]);

  // Apply theme
  useEffect(() => {
    const themeColor = isDarkMode ? '#050B1E' : '#f1f5f9';
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bancafacil_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bancafacil_theme', 'light');
    }
  }, [isDarkMode]);

  // Derived stats
  const stats: DashboardStats = useMemo(() => {
    const totalVolume = orders.reduce((sum, o) => sum + o.amount, 0);
    const totalFees = orders.reduce((sum, o) => sum + o.fee, 0);
    return {
      totalVolume,
      totalFees,
      activeClients: clients.length,
      transactionCount: orders.length
    };
  }, [orders, clients]);

  const addClient = async (client: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'clients'), {
        ...client,
        createdAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'clients');
    }
  };

  const addOrder = async (order: Omit<PaymentOrder, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'orders'), {
        ...order,
        responsibleName: currentUser?.displayName || currentUser?.email || 'N/A',
        createdAt: Date.now(),
      });
      
      // Play coin sound
      coinSound.currentTime = 0;
      coinSound.volume = 1.0;
      coinSound.play().catch(err => console.warn('Could not play audio:', err));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'orders');
    }
  };

  const addAuthorizedUser = async (user: Omit<AuthorizedUser, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'users'), {
        ...user,
        createdAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    }
  };

  const updateClient = async (id: string, clientData: Partial<Omit<Client, 'id' | 'createdAt'>>) => {
    try {
      await updateDoc(doc(db, 'clients', id), clientData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${id}`);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${id}`);
    }
  };

  const updateOrder = async (id: string, orderData: Partial<Omit<PaymentOrder, 'id' | 'createdAt'>>) => {
    try {
      await updateDoc(doc(db, 'orders', id), orderData);
      
      // Play coin sound if order is completed
      if (orderData.status === 'completed') {
        coinSound.currentTime = 0;
        coinSound.volume = 1.0;
        coinSound.play().catch(err => console.warn('Could not play audio:', err));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${id}`);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${id}`);
    }
  };

  const updateAuthorizedUser = async (id: string, data: Partial<AuthorizedUser>) => {
    try {
      await updateDoc(doc(db, 'users', id), data);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${id}`);
    }
  };

  const deleteAuthorizedUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${id}`);
    }
  };

  const userRole = useMemo(() => {
    if (currentUser?.email?.toLowerCase() === 'correapay@gmail.com') return 'admin';
    const profile = authorizedUsers.find(u => u.email.toLowerCase() === currentUser?.email?.toLowerCase());
    return profile?.role || 'user';
  }, [authorizedUsers, currentUser]);

  // Bootstrap Admin Profile
  useEffect(() => {
    if (currentUser?.email?.toLowerCase() === 'correapay@gmail.com' && authorizedUsers.length > 0) {
      const isAdminRegistered = authorizedUsers.some(u => u.email.toLowerCase() === 'correapay@gmail.com' && u.role === 'admin');
      if (!isAdminRegistered) {
        const existingProfile = authorizedUsers.find(u => u.email.toLowerCase() === 'correapay@gmail.com');
        if (existingProfile) {
          updateAuthorizedUser(existingProfile.id, { role: 'admin' });
        } else {
          addAuthorizedUser({
            name: 'Administrador CorreaPay',
            email: 'correapay@gmail.com',
            role: 'admin',
            status: 'active'
          });
        }
      }
    }
  }, [currentUser, authorizedUsers]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} recentOrders={orders.slice(0, 5)} clients={clients} />;
      case 'clients':
        return <Clients clients={clients} onAdd={addClient} onUpdate={updateClient} onDelete={deleteClient} />;
      case 'orders':
        return <Orders orders={orders} clients={clients} onAdd={addOrder} onUpdate={updateOrder} onDelete={deleteOrder} />;
      case 'correa':
        // Only admins can see this anyway, but double check
        return userRole === 'admin' ? <Correa users={authorizedUsers} onAdd={addAuthorizedUser} onUpdate={updateAuthorizedUser} onDelete={deleteAuthorizedUser} /> : null;
      default:
        return <Dashboard stats={stats} recentOrders={orders.slice(0, 5)} clients={clients} />;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      isDarkMode={isDarkMode}
      toggleTheme={() => setIsDarkMode(!isDarkMode)}
      onLogout={() => signOut(auth)}
      userRole={userRole}
    >
      {renderContent()}
    </Layout>
  );
}

