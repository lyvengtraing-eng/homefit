import AnnonceCardDuo from './AnnonceCardDuo';

// Affiche le résultat du matching à deux : points communs / friction entre
// les deux profils, les deux suggestions déco côte à côte, puis le
// classement combiné des annonces.
export default function ResultatsDuo({ donnees, onModifier }) {
  const { decoA, decoB, frictions, pointsCommuns, resultats } = donnees;

  return (
    <div className="resultats">
      <div className="resultats__actions">
        <button onClick={onModifier}>← Recommencer</button>
      </div>

      <h2>Vous deux, face à face</h2>

      {(pointsCommuns.length > 0 || frictions.length > 0) && (
        <section className="duo-bilan">
          {pointsCommuns.length > 0 && (
            <div className="duo-bilan__colonne duo-bilan__colonne--communs">
              <h3>✅ Vous êtes alignés sur</h3>
              <ul>
                {pointsCommuns.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}
          {frictions.length > 0 && (
            <div className="duo-bilan__colonne duo-bilan__colonne--frictions">
              <h3>⚡ Ça frotte un peu sur</h3>
              <ul>
                {frictions.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <div className="deco-duo">
        <section className="deco-suggestion deco-duo__colonne">
          <h2>Style déco — Personne 1 : {decoA.nom}</h2>
          <p>{decoA.description}</p>
          {decoA.modificateurs.map((m, i) => (
            <p key={i}>{m}</p>
          ))}
        </section>
        <section className="deco-suggestion deco-duo__colonne">
          <h2>Style déco — Personne 2 : {decoB.nom}</h2>
          <p>{decoB.description}</p>
          {decoB.modificateurs.map((m, i) => (
            <p key={i}>{m}</p>
          ))}
        </section>
      </div>

      <h2>Logements qui vous correspondent, à tous les deux</h2>
      <div className="resultats__liste">
        {resultats.map((resultat) => (
          <AnnonceCardDuo key={resultat.annonce.id} resultat={resultat} />
        ))}
      </div>
    </div>
  );
}
