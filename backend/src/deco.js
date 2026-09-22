// Moteur de suggestion de style déco — module pur, une table de correspondance
// déterministe entre deux traits de personnalité (style d'intérieur préféré,
// tempérament) donne le style de base ; deux traits supplémentaires (rapport
// à la couleur, rapport à la lumière) et les hobbies du profil ajoutent des
// touches qui rendent chaque suggestion unique sans faire exploser la table.

const STYLES_INTERIEUR_VALIDES = ['minimaliste', 'chaleureux', 'colore', 'epure', 'classique'];
const TEMPERAMENTS_VALIDES = ['calme', 'energique', 'creatif', 'pragmatique'];
const COULEURS_VALIDES = ['neutre', 'vif'];
const LUMIERES_VALIDES = ['lumineux', 'tamise'];

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

// Phrase ajoutée selon le rapport à la couleur (optionnel).
const MODIFICATEURS_COULEUR = {
  neutre: 'Palette de tons neutres et naturels, pour ne jamais se lasser.',
  vif: 'Quelques touches de couleurs vives et assumées viennent dynamiser l\'ensemble.',
};

// Phrase ajoutée selon le rapport à la lumière (optionnel).
const MODIFICATEURS_LUMIERE = {
  lumineux: 'Priorité à la lumière naturelle, avec de grandes ouvertures dégagées.',
  tamise: "Une ambiance tamisée, pensée pour un bon éclairage d'appoint le soir.",
};

// Touche personnalisée par hobby, en lien avec la déco (indépendante du
// moteur de recommandation de logement, mais réutilise les mêmes valeurs).
const MAPPING_HOBBY_TOUCHE = {
  musique: 'un mur ou une étagère pour exposer tes instruments ou ta collection de vinyles',
  lecture: 'une bibliothèque murale bien éclairée, pensée pour la lecture',
  jardinage: 'un coin plantes près d\'une fenêtre lumineuse',
  animaux: 'des matières résistantes et faciles à nettoyer pour tes compagnons',
  cuisine: 'un îlot central convivial, pensé pour cuisiner à plusieurs',
  sorties: 'un coin bar pour recevoir avant de sortir',
  reception: 'un salon modulable pensé pour accueillir du monde',
  oenologie: 'une cave ou un bar à vin mis en valeur',
  automobile: 'une déco d\'inspiration garage/atelier dans un coin dédié',
  halterophilie: 'un espace fonctionnel et dégagé pour ton matériel',
  velo: 'un support mural pour exposer ton vélo comme un objet déco',
  teletravail: 'un bureau bien délimité, à l\'écart du bruit',
};

/**
 * Suggère un style déco à partir du style d'intérieur préféré et du
 * tempérament déclarés dans le profil (toujours résolu, avec repli sur
 * 'chaleureux' / 'pragmatique' si un trait manque), enrichi de modificateurs
 * couleur/lumière (optionnels) et de touches personnalisées tirées des
 * hobbies — ce qui rend le résultat unique à chaque profil.
 */
function suggererDeco(profil) {
  const style = STYLES_INTERIEUR_VALIDES.includes(profil.styleInterieur) ? profil.styleInterieur : 'chaleureux';
  const temperament = TEMPERAMENTS_VALIDES.includes(profil.temperament) ? profil.temperament : 'pragmatique';
  const base = STYLES_DECO[style][temperament];

  const modificateurs = [];
  if (COULEURS_VALIDES.includes(profil.couleur)) modificateurs.push(MODIFICATEURS_COULEUR[profil.couleur]);
  if (LUMIERES_VALIDES.includes(profil.lumiere)) modificateurs.push(MODIFICATEURS_LUMIERE[profil.lumiere]);

  const touches = (profil.hobbies ?? [])
    .map((hobby) => MAPPING_HOBBY_TOUCHE[hobby])
    .filter(Boolean);

  return { nom: base.nom, description: base.description, modificateurs, touches };
}

export {
  STYLES_INTERIEUR_VALIDES,
  TEMPERAMENTS_VALIDES,
  COULEURS_VALIDES,
  LUMIERES_VALIDES,
  STYLES_DECO,
  suggererDeco,
};
