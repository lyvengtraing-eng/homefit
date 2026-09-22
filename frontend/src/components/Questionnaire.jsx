import { useState } from 'react';
import { HOBBIES, AMBIANCES, TYPES_LOGEMENT, STYLES_INTERIEUR, TEMPERAMENTS, COULEURS, LUMIERES } from '../constants';

// Questionnaire de profil : hobbies, ambiance recherchée, budget, ville,
// importance des écoles, traits de personnalité (pour la déco), et un champ
// libre optionnel. Appelle onValider(profil) à la soumission.
export default function Questionnaire({ onValider, titre = 'Parle-nous de toi', texteBouton = 'Voir mes recommandations' }) {
  const [hobbies, setHobbies] = useState([]);
  const [ambiance, setAmbiance] = useState('');
  const [typeLogement, setTypeLogement] = useState('peu_importe');
  const [ecoleImportante, setEcoleImportante] = useState('non');
  const [budgetMax, setBudgetMax] = useState('');
  const [ville, setVille] = useState('');
  const [piecesMin, setPiecesMin] = useState('');
  const [styleInterieur, setStyleInterieur] = useState('chaleureux');
  const [temperament, setTemperament] = useState('pragmatique');
  const [couleur, setCouleur] = useState('');
  const [lumiere, setLumiere] = useState('');
  const [texteLibre, setTexteLibre] = useState('');

  // Coche/décoche un hobby dans la sélection multiple.
  const basculerHobby = (valeur) => {
    setHobbies((actuel) => (actuel.includes(valeur) ? actuel.filter((h) => h !== valeur) : [...actuel, valeur]));
  };

  const soumettre = (e) => {
    e.preventDefault();
    onValider({
      hobbies,
      ambiance: ambiance || null,
      typeLogement,
      ecoleImportante,
      budgetMax: budgetMax === '' ? null : Number(budgetMax),
      ville: ville.trim() || null,
      piecesMin: piecesMin === '' ? null : Number(piecesMin),
      styleInterieur,
      temperament,
      couleur: couleur || null,
      lumiere: lumiere || null,
      texteLibre: texteLibre.trim() || null,
    });
  };

  return (
    <form className="questionnaire" onSubmit={soumettre}>
      <h2>{titre}</h2>

      <fieldset>
        <legend>Tes hobbies</legend>
        <div className="questionnaire__cases">
          {HOBBIES.map((h) => (
            <label key={h.valeur} className="case-a-cocher">
              <input
                type="checkbox"
                checked={hobbies.includes(h.valeur)}
                onChange={() => basculerHobby(h.valeur)}
              />
              {h.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Ambiance de quartier recherchée</legend>
        <div className="questionnaire__radios">
          {AMBIANCES.map((a) => (
            <label key={a.valeur} className="case-a-cocher">
              <input
                type="radio"
                name="ambiance"
                value={a.valeur}
                checked={ambiance === a.valeur}
                onChange={(e) => setAmbiance(e.target.value)}
              />
              {a.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Type de logement</legend>
        <div className="questionnaire__radios">
          {TYPES_LOGEMENT.map((t) => (
            <label key={t.valeur} className="case-a-cocher">
              <input
                type="radio"
                name="typeLogement"
                value={t.valeur}
                checked={typeLogement === t.valeur}
                onChange={(e) => setTypeLogement(e.target.value)}
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Avoir des écoles à proximité, c'est important ?</legend>
        <div className="questionnaire__radios">
          <label className="case-a-cocher">
            <input type="radio" name="ecole" value="oui" checked={ecoleImportante === 'oui'} onChange={() => setEcoleImportante('oui')} />
            Oui
          </label>
          <label className="case-a-cocher">
            <input type="radio" name="ecole" value="non" checked={ecoleImportante === 'non'} onChange={() => setEcoleImportante('non')} />
            Non
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Budget et ville</legend>
        <label className="questionnaire__champ">
          Budget maximum (€)
          <input type="number" min="0" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="ex : 300000" />
        </label>
        <label className="questionnaire__champ">
          Ville recherchée
          <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} placeholder="ex : Nantes" />
        </label>
        <label className="questionnaire__champ">
          Nombre de pièces minimum
          <input type="number" min="1" value={piecesMin} onChange={(e) => setPiecesMin(e.target.value)} placeholder="ex : 4" />
        </label>
      </fieldset>

      <fieldset>
        <legend>Ton style d'intérieur préféré</legend>
        <div className="questionnaire__radios">
          {STYLES_INTERIEUR.map((s) => (
            <label key={s.valeur} className="case-a-cocher">
              <input
                type="radio"
                name="styleInterieur"
                value={s.valeur}
                checked={styleInterieur === s.valeur}
                onChange={(e) => setStyleInterieur(e.target.value)}
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Ton tempérament</legend>
        <div className="questionnaire__radios">
          {TEMPERAMENTS.map((t) => (
            <label key={t.valeur} className="case-a-cocher">
              <input
                type="radio"
                name="temperament"
                value={t.valeur}
                checked={temperament === t.valeur}
                onChange={(e) => setTemperament(e.target.value)}
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Ton rapport à la couleur (optionnel)</legend>
        <div className="questionnaire__radios">
          {COULEURS.map((c) => (
            <label key={c.valeur} className="case-a-cocher">
              <input
                type="radio"
                name="couleur"
                value={c.valeur}
                checked={couleur === c.valeur}
                onChange={(e) => setCouleur(e.target.value)}
              />
              {c.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Ton rapport à la lumière (optionnel)</legend>
        <div className="questionnaire__radios">
          {LUMIERES.map((l) => (
            <label key={l.valeur} className="case-a-cocher">
              <input
                type="radio"
                name="lumiere"
                value={l.valeur}
                checked={lumiere === l.valeur}
                onChange={(e) => setLumiere(e.target.value)}
              />
              {l.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Envie de préciser (optionnel) ?</legend>
        <textarea
          value={texteLibre}
          onChange={(e) => setTexteLibre(e.target.value)}
          placeholder="Décris-toi et tes envies en quelques mots..."
          rows={3}
        />
      </fieldset>

      <button type="submit" className="questionnaire__valider">
        {texteBouton}
      </button>
    </form>
  );
}
