import AnnonceCard from './AnnonceCard';

// Affiche la suggestion déco puis le classement des annonces, avec un bouton
// pour revenir modifier ses critères.
export default function Resultats({ donnees, onModifier, onComparerDuo }) {
  const { deco, resultats } = donnees;

  return (
    <div className="resultats">
      <div className="resultats__actions">
        <button onClick={onModifier}>← Modifier mes critères</button>
        <button onClick={onComparerDuo}>👫 Comparer avec quelqu'un</button>
      </div>

      <section className="deco-suggestion">
        <h2>Ton style déco : {deco.nom}</h2>
        <p>{deco.description}</p>
        {deco.modificateurs.map((modificateur, i) => (
          <p key={i}>{modificateur}</p>
        ))}
        {deco.touches.length > 0 && (
          <>
            <p className="deco-suggestion__touches-titre">Des touches rien que pour toi :</p>
            <ul className="deco-suggestion__touches">
              {deco.touches.map((touche, i) => (
                <li key={i}>{touche}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <h2>Logements qui te correspondent</h2>
      <div className="resultats__liste">
        {resultats.map((resultat) => (
          <AnnonceCard key={resultat.annonce.id} resultat={resultat} />
        ))}
      </div>
    </div>
  );
}
