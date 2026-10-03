export function formatDate(value) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-FR').format(new Date(value));
}

export function formatDh(value) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function normalizePrice(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(String(value).replace(',', '.'));

  return Number.isFinite(number) ? Math.round(number * 100) / 100 : null;
}
