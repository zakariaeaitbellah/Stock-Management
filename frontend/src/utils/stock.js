export function isLowStock(article) {
  return article.low_stock_threshold !== null
    && article.low_stock_threshold !== undefined
    && Number(article.quantity) <= Number(article.low_stock_threshold);
}
