import { isLowStock } from '../utils/stock';

function ArticleName({ article }) {
  const isLow = isLowStock(article);

  return (
    <div className="article-name-display">
      <strong>{article.name}</strong>
      {article.ing && <span>ING : {article.ing}</span>}
      {isLow && (
        <span className="low-stock-inline">
          Stock faible : {article.quantity} restant(s), seuil {article.low_stock_threshold}
        </span>
      )}
    </div>
  );
}

export default ArticleName;
