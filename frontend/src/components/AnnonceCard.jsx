// Pictogramme maison (toit + façade + porte), en lien avec le currentColor du parent.
function IconeMaison() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M10 30 L32 12 L54 30" />
      <path d="M16 26 V52 H48 V26" />
      <rect x="27" y="38" width="10" height="14" />
    </svg>
  );
}

// Pictogramme immeuble (façade + grille de fenêtres), pour les appartements.
function IconeImmeuble() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
      <rect x="14" y="8" width="36" height="48" />
      <path d="M22 18h6M36 18h6M22 28h6M36 28h6M22 38h6M36 38h6" />
      <path d="M27 56v-10h10v10" />
    </svg>
  );
}

// Affiche une annonce classée : ses caractéristiques, son score et les
// raisons qui ont contribué à ce score.
export default function AnnonceCard({ resultat }) {
  const { annonce, pourcentage, raisons } = resultat;

  return (
    <article className="annonce-card">
      <div className="annonce-card__vignette">
        {annonce.type === 'maison' ? <IconeMaison /> : <IconeImmeuble />}
      </div>
      <div className="annonce-card__contenu">
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
      </div>
    </article>
  );
}
