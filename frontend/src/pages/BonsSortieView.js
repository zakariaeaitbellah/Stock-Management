import { useState } from 'react';
import PrintableBon from '../print/PrintableBon';

function BonsSortieView({ api, services, setMessage }) {
  const today = new Date();
  const [serviceId, setServiceId] = useState('');
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [bon, setBon] = useState(null);

  async function loadBon(event) {
    event.preventDefault();

    try {
      const params = new URLSearchParams({ service_id: serviceId, month, year, refresh: Date.now() });
      const data = await api.request(`/bons-sortie?${params.toString()}`);
      setBon(data);
      setMessage(`Bon charge: ${data.lines.length} ligne(s).`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <form className="filters-bar" onSubmit={loadBon}>
        <label>
          Service
          <select value={serviceId} onChange={(event) => setServiceId(event.target.value)} required>
            <option value="">Choisir un service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </label>
        <label>
          Mois
          <select value={month} onChange={(event) => setMonth(event.target.value)}>
            {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>{String(value).padStart(2, '0')}</option>
            ))}
          </select>
        </label>
        <label>
          Année
          <input type="number" value={year} min="2000" max="2100" onChange={(event) => setYear(event.target.value)} />
        </label>
        <button className="primary-button" type="submit">Afficher</button>
      </form>

      {bon && <PrintableBon bon={bon} />}
    </>
  );
}

export default BonsSortieView;
