import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { suggererDeco, STYLES_INTERIEUR_VALIDES, TEMPERAMENTS_VALIDES } from '../src/deco.js';

describe('suggererDeco', () => {
  test('résout vers un style précis pour chaque combinaison valide', () => {
    for (const style of STYLES_INTERIEUR_VALIDES) {
      for (const temperament of TEMPERAMENTS_VALIDES) {
        const resultat = suggererDeco({ styleInterieur: style, temperament });
        assert.ok(resultat.nom, `pas de nom pour ${style}/${temperament}`);
        assert.ok(resultat.description, `pas de description pour ${style}/${temperament}`);
      }
    }
  });

  test('se replie sur chaleureux/pragmatique si les traits sont absents', () => {
    const resultat = suggererDeco({});
    assert.deepEqual(resultat, suggererDeco({ styleInterieur: 'chaleureux', temperament: 'pragmatique' }));
  });

  test('ignore une valeur invalide et se replie sur le défaut', () => {
    const resultat = suggererDeco({ styleInterieur: 'n-importe-quoi', temperament: 'creatif' });
    assert.equal(resultat.nom, suggererDeco({ styleInterieur: 'chaleureux', temperament: 'creatif' }).nom);
  });

  test('deux profils différents donnent des styles différents', () => {
    const a = suggererDeco({ styleInterieur: 'minimaliste', temperament: 'calme' });
    const b = suggererDeco({ styleInterieur: 'colore', temperament: 'energique' });
    assert.notEqual(a.nom, b.nom);
  });

  test('sans couleur/lumière/hobbies, pas de modificateurs ni de touches', () => {
    const resultat = suggererDeco({});
    assert.deepEqual(resultat.modificateurs, []);
    assert.deepEqual(resultat.touches, []);
  });

  test('ajoute un modificateur pour la couleur et un pour la lumière', () => {
    const resultat = suggererDeco({ couleur: 'vif', lumiere: 'tamise' });
    assert.equal(resultat.modificateurs.length, 2);
  });

  test('ignore une couleur ou une lumière invalide', () => {
    const resultat = suggererDeco({ couleur: 'n-importe-quoi', lumiere: 'autre' });
    assert.deepEqual(resultat.modificateurs, []);
  });

  test('ajoute une touche personnalisée par hobby reconnu, dans le même ordre', () => {
    const resultat = suggererDeco({ hobbies: ['musique', 'jardinage'] });
    assert.equal(resultat.touches.length, 2);
    assert.ok(resultat.touches[0].includes('instruments'));
    assert.ok(resultat.touches[1].includes('plantes'));
  });

  test("n'ajoute pas de touche pour un hobby sans lien avec la déco", () => {
    const resultat = suggererDeco({ hobbies: ['sport_salle', 'jeux_video'] });
    assert.deepEqual(resultat.touches, []);
  });

  test('deux profils avec les mêmes traits de base mais des hobbies différents restent uniques', () => {
    const musicien = suggererDeco({ styleInterieur: 'epure', temperament: 'calme', hobbies: ['musique'] });
    const jardinier = suggererDeco({ styleInterieur: 'epure', temperament: 'calme', hobbies: ['jardinage'] });
    assert.equal(musicien.nom, jardinier.nom); // même style de base
    assert.notDeepEqual(musicien.touches, jardinier.touches); // mais personnalisation différente
  });
});
