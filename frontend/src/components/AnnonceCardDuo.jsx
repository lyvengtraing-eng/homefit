import AnnonceVignette from './AnnonceVignette';

// Affiche une annonce classée en mode duo : score combiné mis en avant, puis
// le détail par personne (pourcentage + raisons de chacun).
export default function AnnonceCardDuo({ resultat }) {
  const { annonce, pourcentageA, pourcentageB, pourcentageDuo, raisonsA, raisonsB } = resultat;

  return (
    <article className="annonce-card">
      <AnnonceVignette annonce={annonce} />
      <div className="annonce-card__contenu">
        <header className="annonce-card__entete">
          <h3>{annonce.titre}</h3>
          <span className="annonce-card__score">{pourcentageDuo}% pour le duo</span>
        </header>
        <p className="annonce-card__meta">
          {annonce.ville} — {annonce.type === 'maison' ? 'Maison' : 'Appartement'} — {annonce.surface} m² —{' '}
          {annonce.pieces} pièces — {annonce.prix.toLocaleString('fr-FR')} €
        </p>
        <p className="annonce-card__description">{annonce.description}</p>

        <div className="annonce-card-duo__detail">
          <div className="annonce-card-duo__personne">
            <p className="annonce-card-duo__personne-score">Personne 1 — {pourcentageA}%</p>
            {raisonsA.length > 0 && (
              <ul className="annonce-card__raisons">
                {raisonsA.map((raison, i) => (
                  <li key={i}>{raison}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="annonce-card-duo__personne">
            <p className="annonce-card-duo__personne-score">Personne 2 — {pourcentageB}%</p>
            {raisonsB.length > 0 && (
              <ul className="annonce-card__raisons">
                {raisonsB.map((raison, i) => (
                  <li key={i}>{raison}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
