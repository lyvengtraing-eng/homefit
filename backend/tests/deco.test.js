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
});
