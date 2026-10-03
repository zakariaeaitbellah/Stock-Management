function PrintableBon({ bon }) {
  return (
    <section className="bon-preview">
      <div className="print-actions">
        <button className="primary-button" onClick={() => window.print()}>Imprimer</button>
      </div>
      <article className="paper official-bon-paper">
        <header className="official-bon-header">
          <div className="official-header-block official-header-left">
            <strong>ROYAUME DU MAROC</strong>
            <span>Ministère de l'Intérieur</span>
            <span>Wilaya de la Région Rabat Salé Kénitra</span>
            <span>Préfecture de Rabat</span>
            <span>Commune de Rabat</span>
            <span>Arrondissement Agdal Ryad</span>
            <span>Direction de l'Arrondissement</span>
            <span>Service de Matériel de la Logistique</span>
            <span>et de la Digitalisation</span>
          </div>

          <img className="official-logo" src="/docx-header-image-preview.png" alt="Logo arrondissement Agdal Ryad" />

          <div className="official-header-block official-header-right" dir="rtl">
            <strong>المملكة المغربية</strong>
            <span>وزارة الداخلية</span>
            <span>ولاية جهة الرباط سلا القنيطرة</span>
            <span>عمالة الرباط</span>
            <span>جماعة الرباط</span>
            <span>مقاطعة أكدال الرياض</span>
            <span>مديرية المقاطعة</span>
            <span>مصلحة العتاد واللوجستيك</span>
            <span>والرقمنة</span>
          </div>
        </header>

        <h2 className="official-bon-title">Bon de Sortie N° {bon.bon_number}</h2>

        <p className="official-bon-intro">
          Je soussigné : <span className="dotted-line"></span> / Service : <strong>{bon.service.name}</strong>
          <br />
          certifie avoir reçu du Service de Matériel de la Logistique et de la Digitalisation les articles indiqués ci-dessous:
        </p>

        <table className="official-bon-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Désignation de l'article</th>
              <th>Quantité</th>
              <th>Quantité en lettres</th>
            </tr>
          </thead>
          <tbody>
            {bon.lines.length ? (
              bon.lines.map((line) => (
                <tr key={`${line.number}-${line.article}`}>
                  <td>{line.number}</td>
                  <td>
                    <span className="designation-name">{line.article}</span>
                    {line.ing && <span className="designation-ing">ING : {line.ing}</span>}
                  </td>
                  <td>{line.quantity}</td>
                  <td>{line.quantity_words}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">Aucun article pour ce service pendant ce mois.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="official-signature-row">
          <span>Le réceptionnaire</span>
        </div>
      </article>
    </section>
  );
}

export default PrintableBon;
