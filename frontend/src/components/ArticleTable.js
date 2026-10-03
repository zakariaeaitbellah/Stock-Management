import ArticleRow from './ArticleRow';

function ArticleTable({ api, user, articles, services, reloadArticles, setMessage }) {
  if (!articles.length) {
    return <p className="empty-state">Aucun article trouvé.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Article</th>
            <th>Quantité</th>
            <th>Dernier ajout</th>
            {user.role === 'prix' && <th>Prix&#40;DH&#41;</th>}
            {user.role === 'stock' && <th>Seuil / Actions</th>}
            {user.role === 'prix' && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <ArticleRow
              key={article.id}
              api={api}
              user={user}
              article={article}
              services={services}
              reloadArticles={reloadArticles}
              setMessage={setMessage}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ArticleTable;
