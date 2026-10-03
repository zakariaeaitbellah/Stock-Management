const API_URL = 'http://127.0.0.1:8000/api';

export function createApi(token) {
  async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const hasBody = response.status !== 204;
    const data = hasBody ? await response.json(): null;

    if (!response.ok) {
      const errors = data?.errors ? Object.values(data.errors).flat().join(' ') : '';
      throw new Error(data?.message || errors || 'Une erreur est survenue.');
    }

    return data;
  }

  return { request };
}
