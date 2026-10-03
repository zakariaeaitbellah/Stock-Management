import { useState } from 'react';
import PrintableRapport from '../print/PrintableRapport';

function RapportView({ api, categories, setMessage }) {
  const today = new Date();
  const [categoryId, setCategoryId] = useState('');
  const [year, setYear] = useState(today.getFullYear());
  const [rapport, setRapport] = useState(null);

  async function loadRapport(event) {
    event.preventDefault();

    try {
      const params = new URLSearchParams({ category_id: categoryId, year, refresh: Date.now() });
      const data = await api.request(`/rapports-financiers?${params.toString()}`);
      setRapport(data);
      setMessage(`Rapport charge: ${data.lines.length} article(s).`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <form className="filters-bar" onSubmit={loadRapport}>
        <label>
          Catégorie
          <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
            <option value="">Choisir une catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label>
          Année
          <input type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(event.target.value)} />
        </label>
        <button className="primary-button" type="submit">Afficher</button>
      </form>

      {rapport && <PrintableRapport rapport={rapport} />}
    </>
  );
}

export default RapportView;
