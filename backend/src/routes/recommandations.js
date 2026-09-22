import { Router } from 'express';
import annonces from '../data/annonces.js';
import {
  classerAnnonces,
  classerAnnoncesDuo,
  identifierFrictions,
  identifierPointsCommuns,
  HOBBIES_VALIDES,
  AMBIANCES_VALIDES,
  TYPES_LOGEMENT_VALIDES,
} from '../moteur.js';
import { suggererDeco, STYLES_INTERIEUR_VALIDES, TEMPERAMENTS_VALIDES, COULEURS_VALIDES, LUMIERES_VALIDES } from '../deco.js';

const router = Router();

// Reconstruit et valide un profil à partir d'un corps de requête (utilisé
// pour un profil seul et pour chacun des deux profils du mode duo).
// Retourne soit { erreur }, soit { profil, texteLibre }.
function construireEtValiderProfil(corps) {
  const {
    hobbies = [],
    ambiance,
    ecoleImportante,
    typeLogement,
    budgetMax,
    ville,
    piecesMin,
    styleInterieur,
    temperament,
    couleur,
    lumiere,
    texteLibre,
  } = corps ?? {};

  if (!Array.isArray(hobbies) || hobbies.some((h) => !HOBBIES_VALIDES.includes(h))) {
    return { erreur: `Le champ "hobbies" doit être un tableau parmi : ${HOBBIES_VALIDES.join(', ')}.` };
  }
  if (ambiance !== undefined && ambiance !== null && !AMBIANCES_VALIDES.includes(ambiance)) {
    return { erreur: `Le champ "ambiance" doit être parmi : ${AMBIANCES_VALIDES.join(', ')}.` };
  }
  if (typeLogement !== undefined && typeLogement !== null && !TYPES_LOGEMENT_VALIDES.includes(typeLogement)) {
    return { erreur: `Le champ "typeLogement" doit être parmi : ${TYPES_LOGEMENT_VALIDES.join(', ')}.` };
  }
  if (budgetMax !== undefined && budgetMax !== null && (!Number.isFinite(budgetMax) || budgetMax < 0)) {
    return { erreur: 'Le champ "budgetMax" doit être un nombre positif.' };
  }
  if (piecesMin !== undefined && piecesMin !== null && (!Number.isFinite(piecesMin) || piecesMin < 0)) {
    return { erreur: 'Le champ "piecesMin" doit être un nombre positif.' };
  }
  if (styleInterieur !== undefined && styleInterieur !== null && !STYLES_INTERIEUR_VALIDES.includes(styleInterieur)) {
    return { erreur: `Le champ "styleInterieur" doit être parmi : ${STYLES_INTERIEUR_VALIDES.join(', ')}.` };
  }
  if (temperament !== undefined && temperament !== null && !TEMPERAMENTS_VALIDES.includes(temperament)) {
    return { erreur: `Le champ "temperament" doit être parmi : ${TEMPERAMENTS_VALIDES.join(', ')}.` };
  }
  if (couleur !== undefined && couleur !== null && !COULEURS_VALIDES.includes(couleur)) {
    return { erreur: `Le champ "couleur" doit être parmi : ${COULEURS_VALIDES.join(', ')}.` };
  }
  if (lumiere !== undefined && lumiere !== null && !LUMIERES_VALIDES.includes(lumiere)) {
    return { erreur: `Le champ "lumiere" doit être parmi : ${LUMIERES_VALIDES.join(', ')}.` };
  }

  const profil = {
    hobbies,
    ambiance,
    ecoleImportante,
    typeLogement,
    budgetMax,
    ville,
    piecesMin,
    styleInterieur,
    temperament,
    couleur,
    lumiere,
  };

  return { profil, texteLibre: typeof texteLibre === 'string' ? texteLibre : null };
}

// POST /api/recommandations — classe les annonces pour un profil donné et
// suggère un style déco. Le profil est reconstruit à partir du questionnaire
// (et éventuellement d'un texte libre, non exploité par le moteur codé à la
// main, juste renvoyé tel quel pour affichage).
router.post('/', (req, res) => {
  const resultat = construireEtValiderProfil(req.body);
  if (resultat.erreur) return res.status(400).json({ erreur: resultat.erreur });

  const { profil, texteLibre } = resultat;
  const classement = classerAnnonces(profil, annonces);
  const deco = suggererDeco(profil);

  res.json({ deco, texteLibre, resultats: classement });
});

// POST /api/recommandations/duo — même principe mais pour deux profils à la
// fois (couple, colocation...) : classe les annonces par compatibilité
// combinée, suggère un style déco pour chacun, et relève les points de
// friction/communs entre les deux profils.
router.post('/duo', (req, res) => {
  const { profilA: corpsA, profilB: corpsB } = req.body ?? {};

  const resultatA = construireEtValiderProfil(corpsA);
  if (resultatA.erreur) return res.status(400).json({ erreur: `Profil 1 : ${resultatA.erreur}` });

  const resultatB = construireEtValiderProfil(corpsB);
  if (resultatB.erreur) return res.status(400).json({ erreur: `Profil 2 : ${resultatB.erreur}` });

  const { profil: profilA } = resultatA;
  const { profil: profilB } = resultatB;

  const classement = classerAnnoncesDuo(profilA, profilB, annonces);

  res.json({
    decoA: suggererDeco(profilA),
    decoB: suggererDeco(profilB),
    frictions: identifierFrictions(profilA, profilB),
    pointsCommuns: identifierPointsCommuns(profilA, profilB),
    resultats: classement,
  });
});

export default router;
