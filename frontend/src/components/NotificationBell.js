import { useState } from 'react';

function NotificationBell({ notifications }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="notification-wrapper">
      <button className="notification-box" type="button" onClick={() => setOpen((value) => !value)}>
        <span className="notification-icon">🔔</span>
        {notifications.length > 0 && <span className="notification-count">{notifications.length}</span>}
        <div>
          <strong>Alertes stock</strong>
          <p>{notifications.length ? `${notifications.length} article(s) sous le seuil.` : 'Aucune alerte.'}</p>
        </div>
      </button>

      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">Articles en stock faible</div>
          {notifications.length ? (
            notifications.map((item) => (
              <div className="notification-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  {item.category && <span>{item.category}</span>}
                </div>
                <span>{item.quantity} / seuil {item.threshold}</span>
              </div>
            ))
          ) : (
            <div className="notification-empty">Aucun article sous le seuil.</div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
