import { useState } from 'react';

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

// Vignette d'une annonce : photo d'illustration + crédit si disponible, sinon
// repli sur un pictogramme maison/immeuble (aussi utilisé si l'image échoue à charger).
export default function AnnonceVignette({ annonce }) {
  const [imageEnErreur, setImageEnErreur] = useState(false);

  if (annonce.image && !imageEnErreur) {
    return (
      <div className="annonce-card__vignette annonce-card__vignette--photo">
        <img
          className="annonce-card__image"
          src={annonce.image}
          alt=""
          loading="lazy"
          style={{ objectPosition: `center ${annonce.imageFocusY ?? '50%'}` }}
          onError={() => setImageEnErreur(true)}
        />
        {annonce.creditPhoto && <span className="annonce-card__credit">{annonce.creditPhoto}</span>}
      </div>
    );
  }

  return (
    <div className="annonce-card__vignette">
      {annonce.type === 'maison' ? <IconeMaison /> : <IconeImmeuble />}
    </div>
  );
}
