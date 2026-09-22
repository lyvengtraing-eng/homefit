// Moteur de suggestion de style déco — module pur, une table de correspondance
// déterministe entre deux traits de personnalité (style d'intérieur préféré,
// tempérament) et un style déco avec sa description.

const STYLES_INTERIEUR_VALIDES = ['minimaliste', 'chaleureux', 'colore', 'epure', 'classique'];
const TEMPERAMENTS_VALIDES = ['calme', 'energique', 'creatif', 'pragmatique'];

const STYLES_DECO = {
  minimaliste: {
    calme: { nom: 'Scandinave épuré', description: 'Lignes simples, bois clair, tons neutres — un intérieur apaisant et fonctionnel.' },
    energique: { nom: 'Minimaliste moderne', description: 'Espaces dégagés, touches de couleur vive, mobilier design.' },
    creatif: { nom: 'Minimaliste japonais', description: "Épure zen avec quelques pièces d'art choisies avec soin." },
    pragmatique: { nom: 'Fonctionnel scandinave', description: 'Rangements malins, matériaux naturels, esprit pratique avant tout.' },
  },
  chaleureux: {
    calme: { nom: 'Cocooning bohème', description: 'Textiles doux, plantes, lumière tamisée — un cocon apaisant.' },
    energique: { nom: 'Éclectique chaleureux', description: 'Mélange de couleurs chaudes, objets chinés, ambiance conviviale.' },
    creatif: { nom: 'Bohème artistique', description: 'Motifs, matières et couleurs mixés avec caractère et créativité.' },
    pragmatique: { nom: 'Rustique confortable', description: 'Bois brut, matières naturelles, confort avant tout.' },
  },
  colore: {
    calme: { nom: 'Pastel doux', description: 'Palette de couleurs douces, ambiance sereine et lumineuse.' },
    energique: { nom: 'Éclectique pop', description: 'Couleurs vives, mélange de styles, énergie et bonne humeur.' },
    creatif: { nom: 'Maximaliste artistique', description: "Motifs audacieux, œuvres d'art, un intérieur qui raconte une histoire." },
    pragmatique: { nom: 'Coloré fonctionnel', description: 'Touches de couleur ciblées dans un espace bien organisé.' },
  },
  epure: {
    calme: { nom: 'Minimaliste zen', description: 'Espace dégagé, matières naturelles, calme visuel.' },
    energique: { nom: 'Moderne industriel', description: 'Structures apparentes, métal et bois, esprit loft dynamique.' },
    creatif: { nom: 'Épure design', description: 'Pièces de designer choisies, espace comme une galerie.' },
    pragmatique: { nom: 'Épuré fonctionnel', description: 'Chaque objet a sa place, esthétique sobre et efficace.' },
  },
  classique: {
    calme: { nom: 'Classique chic', description: 'Meubles intemporels, matières nobles, élégance discrète.' },
    energique: { nom: 'Classique revisité', description: 'Codes classiques twistés avec des touches contemporaines.' },
    creatif: { nom: 'Classique éclectique', description: 'Antiquités et pièces modernes mélangées avec caractère.' },
    pragmatique: { nom: 'Classique confortable', description: 'Élégance sobre et intemporelle, pensée pour le quotidien.' },
  },
};

/**
 * Suggère un style déco à partir du style d'intérieur préféré et du
 * tempérament déclarés dans le profil. Toujours résout vers une valeur
 * (repli sur 'chaleureux' / 'pragmatique' si un trait manque).
 */
function suggererDeco(profil) {
  const style = STYLES_INTERIEUR_VALIDES.includes(profil.styleInterieur) ? profil.styleInterieur : 'chaleureux';
  const temperament = TEMPERAMENTS_VALIDES.includes(profil.temperament) ? profil.temperament : 'pragmatique';
  return STYLES_DECO[style][temperament];
}

export { STYLES_INTERIEUR_VALIDES, TEMPERAMENTS_VALIDES, STYLES_DECO, suggererDeco };
