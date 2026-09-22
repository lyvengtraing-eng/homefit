const BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3002/api';

// Effectue un appel fetch vers l'API backend et lève une erreur exploitable en cas d'échec.
async function requete(chemin, options) {
  const reponse = await fetch(`${BASE_URL}${chemin}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const corps = await reponse.json().catch(() => null);

  if (!reponse.ok) {
    const erreur = new Error(corps?.erreur ?? `Erreur ${reponse.status}`);
    erreur.statut = reponse.status;
    erreur.details = corps;
    throw erreur;
  }

  return corps;
}

export const api = {
  // Envoie le profil (questionnaire + texte libre) et récupère le classement des annonces + la suggestion déco.
  obtenirRecommandations: (profil) => requete('/recommandations', { method: 'POST', body: JSON.stringify(profil) }),
  // Envoie deux profils (couple, colocation...) et récupère un classement combiné + les points de friction/communs.
  obtenirRecommandationsDuo: (profilA, profilB) =>
    requete('/recommandations/duo', { method: 'POST', body: JSON.stringify({ profilA, profilB }) }),
};
