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
  'velo',
  'oenologie',
  'automobile',
  'fumeur',
  'mobilite_reduite',
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
  pieces: 15,
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
  // Cycliste : un local vélo sécurisé, en plus du bonus nature (pistes cyclables).
  velo: 'local_velo',
  // Œnologie : une cave pour stocker/faire vieillir les bouteilles.
  oenologie: 'cave',
  // Passion automobile/mécanique : un garage pour bricoler ou stocker le véhicule.
  automobile: 'garage',
  // Fumeur : un espace extérieur pour fumer sans gêner personne.
  fumeur: 'balcon',
  // Mobilité réduite : un accès de plain-pied ou un ascenseur.
  mobilite_reduite: 'ascenseur',
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
  local_velo: 'local à vélo sécurisé',
  cave: 'cave',
  balcon: 'balcon',
  ascenseur: 'ascenseur',
};

// Hobbies qui rendent la proximité de la nature (parcs, forêts, pistes) pertinente.
const HOBBIES_NATURE = ['course_a_pied', 'jardinage', 'animaux', 'velo'];

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

  // Nombre de pièces minimum (famille nombreuse, besoin d'espace...).
  if (Number.isFinite(profil.piecesMin) && profil.piecesMin > 0) {
    if (annonce.pieces >= profil.piecesMin) {
      score += POIDS.pieces;
      raisons.push(`Assez de pièces (${annonce.pieces})`);
    } else {
      const manque = profil.piecesMin - annonce.pieces;
      score -= manque * (POIDS.pieces / 3);
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
  if (Number.isFinite(profil.piecesMin) && profil.piecesMin > 0) max += POIDS.pieces;

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

/**
 * Points de friction entre deux profils : préférences qui divergent assez
 * pour valoir la peine d'être signalées (ambiance, type de logement, budget).
 */
function identifierFrictions(profilA, profilB) {
  const frictions = [];

  const ambianceA = deduireAmbiancePreferee(profilA);
  const ambianceB = deduireAmbiancePreferee(profilB);
  if (ambianceA && ambianceB && ambianceA !== ambianceB) {
    frictions.push(`Ambiance recherchée différente : ${ambianceA} d'un côté, ${ambianceB} de l'autre`);
  }

  if (
    profilA.typeLogement &&
    profilB.typeLogement &&
    profilA.typeLogement !== 'peu_importe' &&
    profilB.typeLogement !== 'peu_importe' &&
    profilA.typeLogement !== profilB.typeLogement
  ) {
    frictions.push(`Type de logement différent : ${profilA.typeLogement} d'un côté, ${profilB.typeLogement} de l'autre`);
  }

  if (
    Number.isFinite(profilA.budgetMax) &&
    Number.isFinite(profilB.budgetMax) &&
    profilA.budgetMax > 0 &&
    profilB.budgetMax > 0
  ) {
    const ecart = Math.abs(profilA.budgetMax - profilB.budgetMax) / Math.max(profilA.budgetMax, profilB.budgetMax);
    if (ecart > 0.25) {
      frictions.push(
        `Budgets assez éloignés : ${profilA.budgetMax.toLocaleString('fr-FR')} € d'un côté, ${profilB.budgetMax.toLocaleString('fr-FR')} € de l'autre`
      );
    }
  }

  return frictions;
}

/**
 * Points communs entre deux profils : hobbies partagés, même ambiance
 * recherchée — ce qui rend le duo plus facile à satisfaire.
 */
function identifierPointsCommuns(profilA, profilB) {
  const communs = [];

  const hobbiesA = new Set(profilA.hobbies ?? []);
  const hobbiesCommuns = (profilB.hobbies ?? []).filter((h) => hobbiesA.has(h));
  if (hobbiesCommuns.length > 0) {
    communs.push(`Hobbies en commun : ${hobbiesCommuns.join(', ')}`);
  }

  const ambianceA = deduireAmbiancePreferee(profilA);
  const ambianceB = deduireAmbiancePreferee(profilB);
  if (ambianceA && ambianceA === ambianceB) {
    communs.push(`Même ambiance recherchée : ${ambianceA}`);
  }

  return communs;
}

/**
 * Classe les annonces pour DEUX profils à la fois (couple, colocation...) :
 * calcule le score de chacun séparément, puis un score de compatibilité duo
 * qui favorise les annonces bonnes pour les deux plutôt que excellentes pour
 * l'un et mauvaises pour l'autre (pénalité sur l'écart entre les deux scores).
 */
function classerAnnoncesDuo(profilA, profilB, listeAnnonces) {
  const classementA = classerAnnonces(profilA, listeAnnonces);
  const classementB = classerAnnonces(profilB, listeAnnonces);
  const parIdB = new Map(classementB.map((resultat) => [resultat.annonce.id, resultat]));

  return classementA
    .map((resultatA) => {
      const resultatB = parIdB.get(resultatA.annonce.id);
      const ecart = Math.abs(resultatA.pourcentage - resultatB.pourcentage);
      const pourcentageDuo = Math.max(0, Math.round((resultatA.pourcentage + resultatB.pourcentage) / 2 - ecart * 0.15));

      return {
        annonce: resultatA.annonce,
        pourcentageA: resultatA.pourcentage,
        pourcentageB: resultatB.pourcentage,
        pourcentageDuo,
        raisonsA: resultatA.raisons,
        raisonsB: resultatB.raisons,
      };
    })
    .sort((a, b) => b.pourcentageDuo - a.pourcentageDuo);
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
  identifierFrictions,
  identifierPointsCommuns,
  classerAnnoncesDuo,
};
