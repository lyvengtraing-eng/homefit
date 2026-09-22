import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  scoreAnnonce,
  classerAnnonces,
  deduireAmbiancePreferee,
  calculerScoreMax,
  pourcentageCompatibilite,
  POIDS,
} from '../src/moteur.js';

const annonceBase = {
  id: 1,
  ville: 'Nantes',
  type: 'maison',
  prix: 300000,
  ambiance: 'calme',
  proximiteEcoles: 'bonne',
  proximiteNature: 'bonne',
  equipements: ['jardin', 'garage'],
};

describe('deduireAmbiancePreferee', () => {
  test('utilise le choix explicite du profil en priorité', () => {
    assert.equal(deduireAmbiancePreferee({ ambiance: 'animee', hobbies: ['lecture'] }), 'animee');
  });

  test("infère 'animee' à partir du hobby sorties si rien n'est choisi", () => {
    assert.equal(deduireAmbiancePreferee({ hobbies: ['sorties'] }), 'animee');
  });

  test("infère 'calme' à partir du hobby lecture si rien n'est choisi", () => {
    assert.equal(deduireAmbiancePreferee({ hobbies: ['lecture'] }), 'calme');
  });

  test('renvoie null si aucun indice disponible', () => {
    assert.equal(deduireAmbiancePreferee({ hobbies: ['jeux_video'] }), null);
  });
});

describe('scoreAnnonce', () => {
  test('bonifie une annonce dans le budget', () => {
    const { score, raisons } = scoreAnnonce({ budgetMax: 350000 }, annonceBase);
    assert.ok(score >= POIDS.budget);
    assert.ok(raisons.includes('Dans le budget'));
  });

  test('pénalise une annonce hors budget proportionnellement au dépassement', () => {
    const proche = scoreAnnonce({ budgetMax: 290000 }, annonceBase).score;
    const loin = scoreAnnonce({ budgetMax: 150000 }, annonceBase).score;
    assert.ok(loin < proche, 'un dépassement plus important doit pénaliser davantage');
  });

  test('bonifie la ville recherchée', () => {
    const avec = scoreAnnonce({ ville: 'Nantes' }, annonceBase).score;
    const sans = scoreAnnonce({ ville: 'Lyon' }, annonceBase).score;
    assert.ok(avec > sans);
  });

  test("bonifie fortement la proximité des écoles si le profil l'exige", () => {
    const { score, raisons } = scoreAnnonce({ ecoleImportante: 'oui' }, annonceBase);
    assert.ok(score >= POIDS.ecole);
    assert.ok(raisons.some((r) => r.includes('écoles')));
  });

  test('pénalise une mauvaise proximité écoles si le profil l\'exige', () => {
    const annonceLoin = { ...annonceBase, proximiteEcoles: 'faible' };
    const { score } = scoreAnnonce({ ecoleImportante: 'oui', typeLogement: 'appartement' }, annonceLoin);
    assert.ok(score < 0);
  });

  test('bonifie la nature pour un profil coureur', () => {
    const { score, raisons } = scoreAnnonce({ hobbies: ['course_a_pied'] }, annonceBase);
    assert.ok(score >= POIDS.nature);
    assert.ok(raisons.some((r) => r.includes('courir')));
  });

  test("n'accorde pas le bonus nature à un hobby sans lien avec l'extérieur", () => {
    const { score } = scoreAnnonce({ hobbies: ['jeux_video'], typeLogement: 'appartement' }, annonceBase);
    assert.equal(score, 0);
  });

  test('bonifie un équipement en lien avec un hobby (jardinage -> jardin)', () => {
    const { score, raisons } = scoreAnnonce({ hobbies: ['jardinage'] }, annonceBase);
    assert.ok(score > 0);
    assert.ok(raisons.some((r) => r.includes('jardin')));
  });

  test("n'accorde pas le bonus équipement si l'annonce ne l'a pas", () => {
    const sansGarage = { ...annonceBase, equipements: ['jardin'] };
    const { score } = scoreAnnonce({ hobbies: ['bricolage'], typeLogement: 'appartement' }, sansGarage);
    assert.equal(score, 0);
  });

  test('bonifie un musicien avec une pièce dédiée (20 m²+)', () => {
    const avecSalle = { ...annonceBase, equipements: ['jardin', 'salle_dediee'] };
    const { score, raisons } = scoreAnnonce({ hobbies: ['musique'], typeLogement: 'appartement' }, avecSalle);
    assert.ok(score > 0);
    assert.ok(raisons.some((r) => r.includes('dédiée')));
  });

  test("bonifie un haltérophile avec un grand volume sous plafond", () => {
    const avecVolume = { ...annonceBase, equipements: ['jardin', 'grand_volume'] };
    const { score, raisons } = scoreAnnonce({ hobbies: ['halterophilie'], typeLogement: 'appartement' }, avecVolume);
    assert.ok(score > 0);
    assert.ok(raisons.some((r) => r.includes('volume')));
  });

  test('bonifie un propriétaire d\'animaux à la fois sur le jardin et la proximité nature', () => {
    const { score, raisons } = scoreAnnonce({ hobbies: ['animaux'], typeLogement: 'appartement' }, annonceBase);
    assert.equal(score, POIDS.nature + POIDS.equipement);
    assert.ok(raisons.some((r) => r.includes('animal')));
    assert.ok(raisons.some((r) => r.includes('jardin')));
  });

  test('bonifie un profil vie nocturne (sorties) avec une terrasse pour recevoir', () => {
    const avecTerrasse = { ...annonceBase, ambiance: 'animee', equipements: ['jardin', 'terrasse'] };
    const { score } = scoreAnnonce({ hobbies: ['sorties'], typeLogement: 'appartement' }, avecTerrasse);
    // Ambiance animée (+POIDS.ambiance, déduite du hobby) + équipement terrasse.
    assert.equal(score, POIDS.ambiance + POIDS.equipement);
  });

  test('bonifie un profil calme/studieux avec une pièce dédiée pour sa bibliothèque', () => {
    const avecSalle = { ...annonceBase, equipements: ['jardin', 'salle_dediee'] };
    const { score } = scoreAnnonce({ hobbies: ['lecture'], typeLogement: 'appartement' }, avecSalle);
    // Ambiance calme (+POIDS.ambiance, déduite du hobby) + équipement pièce dédiée.
    assert.equal(score, POIDS.ambiance + POIDS.equipement);
  });
});

describe('calculerScoreMax', () => {
  test("ne compte que le type de logement si le profil n'active aucun autre critère", () => {
    assert.equal(calculerScoreMax({}), POIDS.type);
  });

  test('additionne uniquement les critères réellement activés par le profil', () => {
    const max = calculerScoreMax({ budgetMax: 300000, ville: 'Nantes', ecoleImportante: 'oui' });
    assert.equal(max, POIDS.type + POIDS.budget + POIDS.ville + POIDS.ecole);
  });

  test('compte un bonus équipement par hobby pertinent', () => {
    const max = calculerScoreMax({ hobbies: ['bricolage', 'cuisine'] });
    assert.equal(max, POIDS.type + POIDS.equipement * 2);
  });

  test('ajoute aussi le bonus nature si un hobby y donne droit (ex : jardinage)', () => {
    const max = calculerScoreMax({ hobbies: ['jardinage'] });
    assert.equal(max, POIDS.type + POIDS.nature + POIDS.equipement);
  });

  test("n'ajoute pas de bonus équipement pour un hobby sans équipement associé", () => {
    const max = calculerScoreMax({ hobbies: ['jeux_video'] });
    assert.equal(max, POIDS.type);
  });
});

describe('pourcentageCompatibilite', () => {
  test('calcule le pourcentage exact et arrondit', () => {
    assert.equal(pourcentageCompatibilite(15, 20), 75);
    assert.equal(pourcentageCompatibilite(1, 3), 33);
  });

  test('ne descend jamais sous 0 même avec un score négatif', () => {
    assert.equal(pourcentageCompatibilite(-10, 20), 0);
  });

  test('ne dépasse jamais 100', () => {
    assert.equal(pourcentageCompatibilite(30, 20), 100);
  });

  test('renvoie 0 si le score maximum est nul (évite la division par zéro)', () => {
    assert.equal(pourcentageCompatibilite(0, 0), 0);
  });
});

describe('classerAnnonces', () => {
  test('trie les annonces du meilleur score au moins bon', () => {
    const autre = { ...annonceBase, id: 2, ville: 'Lyon', prix: 999999 };
    const classement = classerAnnonces({ ville: 'Nantes', budgetMax: 350000 }, [autre, annonceBase]);
    assert.equal(classement[0].annonce.id, 1);
    assert.ok(classement[0].score > classement[1].score);
  });

  test('inclut un pourcentage de compatibilité entre 0 et 100 pour chaque annonce', () => {
    const classement = classerAnnonces({ ville: 'Nantes', budgetMax: 350000 }, [annonceBase]);
    assert.ok(classement[0].pourcentage >= 0 && classement[0].pourcentage <= 100);
  });

  test('une correspondance parfaite donne 100% de compatibilité', () => {
    const profil = { budgetMax: 350000, ville: 'Nantes', ecoleImportante: 'oui', ambiance: 'calme' };
    const classement = classerAnnonces(profil, [annonceBase]);
    assert.equal(classement[0].pourcentage, 100);
  });
});
