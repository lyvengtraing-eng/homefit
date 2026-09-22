import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { scoreAnnonce, classerAnnonces, deduireAmbiancePreferee, POIDS } from '../src/moteur.js';

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
});

describe('classerAnnonces', () => {
  test('trie les annonces du meilleur score au moins bon', () => {
    const autre = { ...annonceBase, id: 2, ville: 'Lyon', prix: 999999 };
    const classement = classerAnnonces({ ville: 'Nantes', budgetMax: 350000 }, [autre, annonceBase]);
    assert.equal(classement[0].annonce.id, 1);
    assert.ok(classement[0].score > classement[1].score);
  });
});
