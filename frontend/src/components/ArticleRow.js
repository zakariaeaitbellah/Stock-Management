import { useEffect, useState } from 'react';
import ArticleName from './ArticleName';
import { formatDate, normalizePrice } from '../utils/format';
import { isLowStock } from '../utils/stock';

function ArticleRow({ api, user, article, services, reloadArticles, setMessage }) {
  const [name, setName] = useState(article.name);
  const [ing, setIng] = useState(article.ing || '');
  const [quantity, setQuantity] = useState(article.quantity);
  const [threshold, setThreshold] = useState(article.low_stock_threshold || '');
  const [movementQuantity, setMovementQuantity] = useState(1);
  const [serviceId, setServiceId] = useState('');
  const [price, setPrice] = useState(article.price || '');
  const [moving, setMoving] = useState(false);
  const normalizedCurrentPrice = normalizePrice(article.price);
  const normalizedEditedPrice = normalizePrice(price);
  const priceChanged = normalizedEditedPrice !== null && normalizedEditedPrice !== normalizedCurrentPrice;

  useEffect(() => {
    setName(article.name);
    setIng(article.ing || '');
    setQuantity(article.quantity);
    setThreshold(article.low_stock_threshold || '');
    setPrice(article.price || '');
  }, [article]);

  async function updateArticle() {
    if (!window.confirm('Valider ces changements ?')) {
      return;
    }

    try {
      await api.request(`/articles/${article.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          ing: ing || null,
          quantity: Number(quantity),
          low_stock_threshold: threshold === '' ? null : Number(threshold),
        }),
      });
      setMessage('Article modifié.');
      await reloadArticles();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteArticle() {
    if (!window.confirm('Supprimer cet article ?')) {
      return;
    }

    try {
      await api.request(`/articles/${article.id}`, { method: 'DELETE' });
      setMessage('article supprimé.');
      await reloadArticles();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function moveStock(type, withoutService = false) {
    const selectedServiceId = withoutService ? '' : serviceId;
    const quantity = Number(movementQuantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setMessage('La quantite doit etre au moins 1.');
      return;
    }

    setMoving(true);

    try {
      const result = await api.request(`/articles/${article.id}/movements`, {
        method: 'POST',
        body: JSON.stringify({
          type,
          quantity,
          service_id: type === 'decrease' && selectedServiceId ? Number(selectedServiceId) : null,
        }),
      });

      if (selectedServiceId && type === 'decrease') {
        const serviceName = result.movement?.service?.name || 'service selectionne';
        const total = result.bon_line?.quantity;
        setMessage(`${quantity} ${article.name} ajoute(s) au bon de sortie de ${serviceName}.${total ? ` Total mensuel: ${total}.` : ''}`);
      } else {
        setMessage(`Stock mis a jour: ${quantity} ${article.name}.`);
      }

      setMovementQuantity(1);
      await reloadArticles();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setMoving(false);
    }
  }

  async function updatePrice() {
    if (!window.confirm('Valider ce changement de prix ?')) {
      return;
    }

    try {
      await api.request(`/articles/${article.id}/price`, {
        method: 'PATCH',
        body: JSON.stringify({ price }),
      });
      setMessage('Prix modifié.');
      await reloadArticles();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <tr>
      <td>
        {user.role === 'stock' ? (
          <div className="article-name-edit">
            <input value={name} onChange={(event) => setName(event.target.value)} />
            <input value={ing} onChange={(event) => setIng(event.target.value)} placeholder="ING : ..." />
            {isLowStock(article) && (
              <span className="low-stock-inline">
                Stock faible : {article.quantity} restant(s), seuil {article.low_stock_threshold}
              </span>
            )}
          </div>
        ) : (
          <ArticleName article={article} />
        )}
      </td>
      <td>
        {user.role === 'stock' ? (
          <div className="quantity-editor">
            <button
              type="button"
              className="quantity-step"
              title="Ajouter 1"
              onClick={() => setQuantity((value) => Number(value || 0) + 1)}
            >
              +
            </button>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
            <button
              type="button"
              className="quantity-step"
              title="Diminuer 1"
              onClick={() => setQuantity((value) => Math.max(0, Number(value || 0) - 1))}
            > 
            -
            </button>
          </div>
        ) : (
          article.quantity
        )}
      </td>
      <td>{formatDate(article.last_added_at)}</td>
      {user.role === 'prix' && (
        <td>
          <input
            inputMode="decimal"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="0,00"
          />
        </td>
      )}
      {user.role === 'stock' && (
        <td>
          <div className="actions-grid">
            <input
              type="number"
              min="0"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              placeholder="Seuil"
            />
            <input
              type="number"
              min="1"
              value={movementQuantity}
              onChange={(event) => setMovementQuantity(event.target.value)}
            />
            <select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
              <option value="">Sans service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="primary-button"
              title="Diminuer et ajouter au bon de sortie du service selectionne"
              onClick={() => moveStock('decrease')}
              disabled={!serviceId || moving}
            >
              {moving ? 'En cours...' : 'Valider sortie'}
            </button>
            <button type="button" onClick={updateArticle}>Enregistrer</button>
            <button type="button" className="danger-button" onClick={deleteArticle}>Supprimer</button>
          </div>
        </td>
      )}
      {user.role === 'prix' && (
        <td>
          <button onClick={updatePrice} disabled={!priceChanged}>Enregistrer le prix</button>
        </td>
      )}
    </tr>
  );
}

export default ArticleRow;
