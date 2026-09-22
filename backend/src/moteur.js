// Moteur de recommandation — module pur (pas d'IA, pas de DB), entièrement
// testable : calcule un score et des raisons pour chaque annonce en fonction
// du profil (hobbies, budget, ambiance recherchée, importance des écoles...).

const HOBBIES_VALIDES = [
  'course_a_pied',
  'jardinage',
  'bricolage',
  'cuisine',
  'lecture',
  'sport_salle',
  'sorties',
  'reception',
  'teletravail',
  'jeux_video',
];

const AMBIANCES_VALIDES = ['calme', 'equilibree', 'animee'];
const TYPES_LOGEMENT_VALIDES = ['maison', 'appartement', 'peu_importe'];

const POIDS = {
  budget: 20,
  ville: 15,
  type: 10,
  ecole: 15,
  nature: 15,
  ambiance: 10,
  equipement: 8,
};

// Équipement bonus associé à chaque hobby, quand l'annonce le propose.
const MAPPING_HOBBY_EQUIPEMENT = {
  jardinage: 'jardin',
  bricolage: 'garage',
  cuisine: 'grande_cuisine',
  teletravail: 'bureau',
  reception: 'terrasse',
};

// Hobbies qui rendent la proximité de la nature (parcs, forêts, pistes) pertinente.
const HOBBIES_NATURE = ['course_a_pied', 'jardinage'];

/**
 * Déduit l'ambiance préférée du profil : le choix explicite du questionnaire
 * prime, sinon on l'infère à partir des hobbies (repli, jamais bloquant).
 */
function deduireAmbiancePreferee(profil) {
  if (profil.ambiance) return profil.ambiance;
  const hobbies = profil.hobbies ?? [];
  if (hobbies.includes('sorties')) return 'animee';
  if (hobbies.includes('lecture')) return 'calme';
  return null;
}

/**
 * Calcule le score d'une annonce pour un profil donné, ainsi que la liste des
 * raisons qui ont fait gagner des points (utilisées pour l'affichage).
 */
function scoreAnnonce(profil, annonce) {
  let score = 0;
  const raisons = [];

  // Budget : bonus si dans le budget, pénalité progressive au-delà.
  if (Number.isFinite(profil.budgetMax) && profil.budgetMax > 0) {
    if (annonce.prix <= profil.budgetMax) {
      score += POIDS.budget;
      raisons.push('Dans le budget');
    } else {
      const depassement = (annonce.prix - profil.budgetMax) / profil.budgetMax;
      score -= Math.min(POIDS.budget * 1.5, depassement * 60);
    }
  }

  // Ville recherchée.
  if (profil.ville && annonce.ville.toLowerCase() === profil.ville.trim().toLowerCase()) {
    score += POIDS.ville;
    raisons.push(`À ${annonce.ville}, la ville recherchée`);
  }

  // Type de logement.
  if (!profil.typeLogement || profil.typeLogement === 'peu_importe' || profil.typeLogement === annonce.type) {
    score += POIDS.type;
  }

  // Proximité des écoles, seulement si le profil l'indique importante.
  if (profil.ecoleImportante === 'oui') {
    if (annonce.proximiteEcoles === 'bonne') {
      score += POIDS.ecole;
      raisons.push('Très proche des écoles');
    } else if (annonce.proximiteEcoles === 'moyenne') {
      score += POIDS.ecole * 0.3;
    } else {
      score -= POIDS.ecole * 0.5;
    }
  }

  // Proximité de la nature, pertinente pour la course à pied / le jardinage.
  const aimeNature = (profil.hobbies ?? []).some((h) => HOBBIES_NATURE.includes(h));
  if (aimeNature) {
    if (annonce.proximiteNature === 'bonne') {
      score += POIDS.nature;
      raisons.push('Cadre nature à proximité, parfait pour courir ou jardiner');
    } else if (annonce.proximiteNature === 'moyenne') {
      score += POIDS.nature * 0.3;
    } else {
      score -= POIDS.nature * 0.3;
    }
  }

  // Ambiance du quartier.
  const ambiancePreferee = deduireAmbiancePreferee(profil);
  if (ambiancePreferee && ambiancePreferee === annonce.ambiance) {
    score += POIDS.ambiance;
    raisons.push(`Ambiance ${annonce.ambiance} qui correspond à ton profil`);
  }

  // Équipements en lien avec les hobbies déclarés.
  for (const hobby of profil.hobbies ?? []) {
    const equipement = MAPPING_HOBBY_EQUIPEMENT[hobby];
    if (equipement && annonce.equipements.includes(equipement)) {
      score += POIDS.equipement;
      raisons.push(`Équipement adapté : ${equipement.replace(/_/g, ' ')}`);
    }
  }

  return { score: Math.round(score * 10) / 10, raisons };
}

/**
 * Classe toutes les annonces pour un profil donné, du meilleur score au moins bon.
 */
function classerAnnonces(profil, listeAnnonces) {
  return listeAnnonces
    .map((annonce) => ({ annonce, ...scoreAnnonce(profil, annonce) }))
    .sort((a, b) => b.score - a.score);
}

export {
  HOBBIES_VALIDES,
  AMBIANCES_VALIDES,
  TYPES_LOGEMENT_VALIDES,
  POIDS,
  scoreAnnonce,
  classerAnnonces,
  deduireAmbiancePreferee,
};
