import { useEffect, useState } from 'react';
import ArticleTable from '../components/ArticleTable';

const emptyArticleForm = {
  category_id: '',
  name: '',
  ing: '',
  quantity: 0,
  low_stock_threshold: '',
};

function StockView(props) {
  const {
    api,
    user,
    categories,
    services,
    articles,
    selectedCategory,
    setSelectedCategory,
    search,
    setSearch,
    loading,
    reloadArticles,
    setMessage,
  } = props;
  const [articleForm, setArticleForm] = useState(emptyArticleForm);

  useEffect(() => {
    setArticleForm((current) => ({ ...current, category_id: selectedCategory }));
  }, [selectedCategory]);

  async function createArticle(event) {
    event.preventDefault();
    if (!window.confirm('Valider cet ajout ?')) {
      return;
    }

    try {
      await api.request('/articles', {
        method: 'POST',
        body: JSON.stringify({
          ...articleForm,
          ing: articleForm.ing || null,
          quantity: Number(articleForm.quantity),
          low_stock_threshold: articleForm.low_stock_threshold === '' ? null : Number(articleForm.low_stock_threshold),
        }),
      });
      setArticleForm({ ...emptyArticleForm, category_id: selectedCategory });
      setMessage('Article ajouté.');
      await reloadArticles();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <section className="filters-bar">
        <label>
          Catégorie
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            <option value="">Choisir une catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>
          Recherche
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nom de l'article" />
        </label>
      </section>

      {user.role === 'stock' && selectedCategory && (
        <form className="inline-form" onSubmit={createArticle}>
          <input
            value={articleForm.name}
            onChange={(event) => setArticleForm({ ...articleForm, name: event.target.value })}
            placeholder="Nouvel article"
            required
          />
          <input
            value={articleForm.ing}
            onChange={(event) => setArticleForm({ ...articleForm, ing: event.target.value })}
            placeholder="ING (inventaire)"
          />
          <input
            type="number"
            min="0"
            value={articleForm.quantity}
            onChange={(event) => setArticleForm({ ...articleForm, quantity: event.target.value })}
            placeholder="Quantité"
            required
          />
          <input
            type="number"
            min="0"
            value={articleForm.low_stock_threshold}
            onChange={(event) => setArticleForm({ ...articleForm, low_stock_threshold: event.target.value })}
            placeholder="Seuil alerte"
          />
          <button className="primary-button" type="submit">Ajouter</button>
        </form>
      )}

      <section className="table-section">
        {!selectedCategory ? (
          <p className="empty-state">Choisissez une catégorie pour afficher les articles.</p>
        ) : loading ? (
          <p className="empty-state">Chargement des articles...</p>
        ) : (
          <ArticleTable
            api={api}
            user={user}
            articles={articles}
            services={services}
            reloadArticles={reloadArticles}
            setMessage={setMessage}
          />
        )}
      </section>
    </>
  );
}

export default StockView;
