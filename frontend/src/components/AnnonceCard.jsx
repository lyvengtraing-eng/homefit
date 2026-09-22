// Affiche une annonce classée : ses caractéristiques, son score et les
// raisons qui ont contribué à ce score.
export default function AnnonceCard({ resultat }) {
  const { annonce, pourcentage, raisons } = resultat;

  return (
    <article className="annonce-card">
      <header className="annonce-card__entete">
        <h3>{annonce.titre}</h3>
        <span className="annonce-card__score">{pourcentage}% compatible</span>
      </header>
      <p className="annonce-card__meta">
        {annonce.ville} — {annonce.type === 'maison' ? 'Maison' : 'Appartement'} — {annonce.surface} m² —{' '}
        {annonce.pieces} pièces — {annonce.prix.toLocaleString('fr-FR')} €
      </p>
      <p className="annonce-card__description">{annonce.description}</p>
      {raisons.length > 0 && (
        <ul className="annonce-card__raisons">
          {raisons.map((raison, i) => (
            <li key={i}>{raison}</li>
          ))}
        </ul>
      )}
    </article>
  );
}
