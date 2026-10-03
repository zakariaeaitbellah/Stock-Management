import { useEffect, useMemo, useState } from 'react';
import { createApi } from './api/api';
import Navbar from './components/Navbar';
import NotificationBell from './components/NotificationBell';
import BonsSortieView from './pages/BonsSortieView';
import LoginPage from './pages/LoginPage';
import RapportView from './pages/RapportView';
import StockView from './pages/StockView';
import './App.css';

function App() {
  const  [token, setToken] = useState(() => localStorage.getItem('stock_token'));
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('stock');
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [articles, setArticles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);


  const api = useMemo(() => createApi(token), [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    api.request('/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('stock_token');
        setToken(null);
      });
  }, [api, token]);

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([
      api.request('/categories'),
      api.request('/services'),
      user.role === 'stock' ? api.request('/notifications/low-stock') : Promise.resolve([]),
    ])
      .then(([categoryData, serviceData, notificationData]) => {
        setCategories(categoryData);
        setServices(serviceData);
        setNotifications(notificationData);
      })
      .catch((error) => setMessage(error.message));
  }, [api, user]);

  useEffect(() => {
    if (!user || !selectedCategory) {
      setArticles([]);
      return;
    }

    const params = new URLSearchParams({ category_id: selectedCategory });
    if (search) {
      params.set('search', search);
    }

    setLoading(true);
    
    api.request(`/articles?${params.toString()}`)
      .then(setArticles)
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, [api, search, selectedCategory, user]);

  async function login(credentials) {
    const data = await api.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    localStorage.setItem('stock_token', data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function logout() {
    await api.request('/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('stock_token');
    setToken(null);
    setUser(null);
    setArticles([]);
  }

  async function reloadArticles() {
    if (!selectedCategory) {
      return;
    }

    const params = new URLSearchParams({ category_id: selectedCategory });
    if (search) {
      params.set('search', search);
    }

    const data = await api.request(`/articles?${params.toString()}`);
    setArticles(data);

    if (user?.role === 'stock') {
      setNotifications(await api.request('/notifications/low-stock'));
    }
  }

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <div className="app-shell">
      <Navbar
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        notifications={notifications}
        logout={logout}
      />

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {activeView === 'rapport' ? 'Evaluation financière' : activeView === 'stock' ? 'Articles' : 'Document mensuel'}
            </p>
            <h2>
              {activeView === 'rapport' ? 'Rapport financier par catégorie' : activeView === 'stock' ? 'Stock par catégorie' : 'Bon de sortie par service'}
            </h2>
          </div>
          {user.role === 'stock' && <NotificationBell notifications={notifications} />}
        </header>

        {message && (
          <div className="status-message">
            <span>{message}</span>
            <button onClick={() => setMessage('')}>Fermer</button>
          </div>
        )}

        {activeView === 'stock' ? (
          <StockView
            api={api}
            user={user}
            categories={categories}
            services={services}
            articles={articles}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            search={search}
            setSearch={setSearch}
            loading={loading}
            reloadArticles={reloadArticles}
            setMessage={setMessage}
          />
        ) : activeView === 'rapport' ? (
          <RapportView api={api} categories={categories} setMessage={setMessage} />
        ) : (
          <BonsSortieView api={api} services={services} setMessage={setMessage} />
        )}
      </main>
    </div>
  );
}

export default App;
