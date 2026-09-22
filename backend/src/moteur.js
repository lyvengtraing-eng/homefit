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
  'musique',
  'halterophilie',
  'animaux',
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
  // Musicien : a besoin d'une pièce à part qu'il peut s'approprier (≥ 20 m²).
  musique: 'salle_dediee',
  // Accro à l'haltérophilie : a besoin d'un grand volume/hauteur sous plafond
  // pour installer ses machines (rack, anneaux...).
  halterophilie: 'grand_volume',
  // Animaux de compagnie : profite d'un jardin, en plus du bonus nature
  // (parc à proximité) ci-dessous.
  animaux: 'jardin',
  // Vie nocturne : un espace extérieur pour recevoir, en plus de l'ambiance animée.
  sorties: 'terrasse',
  // Calme et studieux : une pièce à part pour s'installer sa propre bibliothèque.
  lecture: 'salle_dediee',
};

// Libellés lisibles des équipements, pour les raisons affichées à l'utilisateur.
const LABELS_EQUIPEMENT = {
  jardin: 'jardin',
  garage: 'garage',
  grande_cuisine: 'grande cuisine',
  bureau: 'bureau',
  terrasse: 'terrasse',
  salle_dediee: 'pièce dédiée (20 m²+)',
  grand_volume: 'grand volume sous plafond',
};

// Hobbies qui rendent la proximité de la nature (parcs, forêts, pistes) pertinente.
const HOBBIES_NATURE = ['course_a_pied', 'jardinage', 'animaux'];

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
      raisons.push('Cadre nature à proximité, parfait pour courir, jardiner ou promener un animal');
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
      raisons.push(`Équipement adapté : ${LABELS_EQUIPEMENT[equipement] ?? equipement.replace(/_/g, ' ')}`);
    }
  }

  return { score: Math.round(score * 10) / 10, raisons };
}

/**
 * Score maximum atteignable pour CE profil (pas un plafond global) : seuls
 * les critères que le profil active réellement (budget renseigné, ville
 * renseignée, écoles importantes...) comptent, pour que le pourcentage de
 * compatibilité reste honnête même si le profil n'a rempli que peu de champs.
 */
function calculerScoreMax(profil) {
  let max = POIDS.type; // toujours atteignable, même sans préférence de type

  if (Number.isFinite(profil.budgetMax) && profil.budgetMax > 0) max += POIDS.budget;
  if (profil.ville) max += POIDS.ville;
  if (profil.ecoleImportante === 'oui') max += POIDS.ecole;

  const aimeNature = (profil.hobbies ?? []).some((h) => HOBBIES_NATURE.includes(h));
  if (aimeNature) max += POIDS.nature;

  if (deduireAmbiancePreferee(profil)) max += POIDS.ambiance;

  const nombreEquipementsPertinents = (profil.hobbies ?? []).filter((h) => MAPPING_HOBBY_EQUIPEMENT[h]).length;
  max += nombreEquipementsPertinents * POIDS.equipement;

  return max;
}

/**
 * Convertit un score brut en pourcentage de compatibilité par rapport au
 * score maximum atteignable pour ce profil, borné entre 0 et 100.
 */
function pourcentageCompatibilite(score, scoreMax) {
  if (scoreMax <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((score / scoreMax) * 100)));
}

/**
 * Classe toutes les annonces pour un profil donné, du meilleur score au moins
 * bon, avec un pourcentage de compatibilité relatif au score maximum atteignable.
 */
function classerAnnonces(profil, listeAnnonces) {
  const scoreMax = calculerScoreMax(profil);
  return listeAnnonces
    .map((annonce) => {
      const { score, raisons } = scoreAnnonce(profil, annonce);
      return { annonce, score, raisons, pourcentage: pourcentageCompatibilite(score, scoreMax) };
    })
    .sort((a, b) => b.score - a.score);
}

export {
  HOBBIES_VALIDES,
  AMBIANCES_VALIDES,
  TYPES_LOGEMENT_VALIDES,
  POIDS,
  scoreAnnonce,
  calculerScoreMax,
  pourcentageCompatibilite,
  classerAnnonces,
  deduireAmbiancePreferee,
};
