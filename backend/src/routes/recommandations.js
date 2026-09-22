import { Router } from 'express';
import annonces from '../data/annonces.js';
import { classerAnnonces, HOBBIES_VALIDES, AMBIANCES_VALIDES, TYPES_LOGEMENT_VALIDES } from '../moteur.js';
import { suggererDeco, STYLES_INTERIEUR_VALIDES, TEMPERAMENTS_VALIDES } from '../deco.js';

const router = Router();

// POST /api/recommandations — classe les annonces pour un profil donné et
// suggère un style déco. Le profil est reconstruit à partir du questionnaire
// (et éventuellement d'un texte libre, non exploité par le moteur codé à la
// main, juste renvoyé tel quel pour affichage).
router.post('/', (req, res) => {
  const {
    hobbies = [],
    ambiance,
    ecoleImportante,
    typeLogement,
    budgetMax,
    ville,
    styleInterieur,
    temperament,
    texteLibre,
  } = req.body ?? {};

  if (!Array.isArray(hobbies) || hobbies.some((h) => !HOBBIES_VALIDES.includes(h))) {
    return res.status(400).json({ erreur: `Le champ "hobbies" doit être un tableau parmi : ${HOBBIES_VALIDES.join(', ')}.` });
  }
  if (ambiance !== undefined && ambiance !== null && !AMBIANCES_VALIDES.includes(ambiance)) {
    return res.status(400).json({ erreur: `Le champ "ambiance" doit être parmi : ${AMBIANCES_VALIDES.join(', ')}.` });
  }
  if (typeLogement !== undefined && typeLogement !== null && !TYPES_LOGEMENT_VALIDES.includes(typeLogement)) {
    return res.status(400).json({ erreur: `Le champ "typeLogement" doit être parmi : ${TYPES_LOGEMENT_VALIDES.join(', ')}.` });
  }
  if (budgetMax !== undefined && budgetMax !== null && (!Number.isFinite(budgetMax) || budgetMax < 0)) {
    return res.status(400).json({ erreur: 'Le champ "budgetMax" doit être un nombre positif.' });
  }
  if (styleInterieur !== undefined && styleInterieur !== null && !STYLES_INTERIEUR_VALIDES.includes(styleInterieur)) {
    return res.status(400).json({ erreur: `Le champ "styleInterieur" doit être parmi : ${STYLES_INTERIEUR_VALIDES.join(', ')}.` });
  }
  if (temperament !== undefined && temperament !== null && !TEMPERAMENTS_VALIDES.includes(temperament)) {
    return res.status(400).json({ erreur: `Le champ "temperament" doit être parmi : ${TEMPERAMENTS_VALIDES.join(', ')}.` });
  }

  const profil = { hobbies, ambiance, ecoleImportante, typeLogement, budgetMax, ville, styleInterieur, temperament };

  const classement = classerAnnonces(profil, annonces);
  const deco = suggererDeco(profil);

  res.json({
    deco,
    texteLibre: typeof texteLibre === 'string' ? texteLibre : null,
    resultats: classement,
  });
});

export default router;
