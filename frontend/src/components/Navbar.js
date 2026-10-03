function Navbar({ user, activeView, setActiveView, notifications, logout }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <img className="brand-logo" src="/agdalryad-logo.png" alt="Agdal Ryad" />
        <div>
          <p className="eyebrow">Gestion du Stock</p>
          <h1>Agdal Ryad</h1>
        </div>
      </div>
      <nav className="nav-list">
        <button className={activeView === 'stock' ? 'active' : ''} onClick={() => setActiveView('stock')}>
          <span className="nav-icon">📦</span>
          <span>Stock</span>
          {notifications.length > 0 && user.role === 'stock' && (
            <span className="nav-badge">{notifications.length}</span>
          )}
        </button>
        {user.role === 'stock' && (
          <button className={activeView === 'bons' ? 'active' : ''} onClick={() => setActiveView('bons')}>
            <span className="nav-icon">🏢</span>
            <span>Bons de Sortie</span>
          </button>
        )}
        {user.role === 'prix' && (
          <button className={activeView === 'rapport' ? 'active' : ''} onClick={() => setActiveView('rapport')}>
            <span className="nav-icon">📄</span>
            <span>Rapport</span>
          </button>
        )}
      </nav>
      <div className="account-box">
        <span className="account-name">{user.name}</span>
        <strong>Compte {user.role === 'stock' ? 'Stock' : 'Prix'}</strong>
        <button className="ghost-button" onClick={logout}>Déconnexion</button>
      </div>
    </aside>
  );
}

export default Navbar;
