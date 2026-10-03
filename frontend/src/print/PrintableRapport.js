import { formatDh } from '../utils/format';

function PrintableRapport({ rapport }) {
  return (
    <section className="bon-preview report-preview">
      <div className="print-actions">
        <button className="primary-button" onClick={() => window.print()}>Imprimer</button>
      </div>
      <article className="paper report-paper">
        <div className="report-letterhead">
          <strong>ROYAUME DU MAROC</strong>
          <span>Ministère de l'Intérieur</span>
          <span>Wilaya de la Région Rabat-Salé-Kénitra</span>
          <span>Préfecture de Rabat</span>
          <span>Commune de Rabat</span>
          <span>Arrondissement Agdal-Ryad</span>
          <span>Direction des Services</span>
          <span>Division des Affaires Financière</span>
          <span>Service Matériel Fourniture et Informatique</span>
        </div>

        <h2 className="report-title">
          Evaluation financière du {rapport.category.name} en date du : 31/12/{rapport.year}
        </h2>

        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Référence Produit</th>
                <th>Désignation des prestations</th>
                <th>Somme des sorties du {rapport.period_start} au {rapport.period_end} quantité</th>
                <th>Situation du stock au {rapport.period_end} quantité</th>
                <th>PU en (DH)</th>
                <th>Montant total des sorties en (DH)</th>
                <th>Valeur du stock au {rapport.period_end} en (DH)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="report-category-row">
                <td colSpan="7">{rapport.category.name}</td>
              </tr>
              {rapport.lines.map((line) => (
                <tr key={line.reference}>
                  <td>{line.reference}</td>
                  <td>{line.designation}</td>
                  <td>{line.sorties_quantity}</td>
                  <td>{line.stock_quantity}</td>
                  <td>{formatDh(line.unit_price)}</td>
                  <td>{formatDh(line.sorties_amount)}</td>
                  <td>{formatDh(line.stock_value)}</td>
                </tr>
              ))}
              <tr className="report-total-row">
                <td colSpan="5">MONTANT HT</td>
                <td>{formatDh(rapport.totals.sorties_ht)}</td>
                <td>{formatDh(rapport.totals.stock_ht)}</td>
              </tr>
              <tr className="report-total-row">
                <td colSpan="5">TVA 20%</td>
                <td>{formatDh(rapport.totals.sorties_tva)}</td>
                <td>{formatDh(rapport.totals.stock_tva)}</td>
              </tr>
              <tr className="report-total-row">
                <td colSpan="5">MONTANT T.T.C</td>
                <td>{formatDh(rapport.totals.sorties_ttc)}</td>
                <td>{formatDh(rapport.totals.stock_ttc)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export default PrintableRapport;
