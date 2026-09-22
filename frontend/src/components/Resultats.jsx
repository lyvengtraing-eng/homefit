import AnnonceCard from './AnnonceCard';

// Affiche la suggestion déco puis le classement des annonces, avec un bouton
// pour revenir modifier ses critères.
export default function Resultats({ donnees, onModifier }) {
  const { deco, resultats } = donnees;

  return (
    <div className="resultats">
      <button className="resultats__retour" onClick={onModifier}>
        ← Modifier mes critères
      </button>

      <section className="deco-suggestion">
        <h2>Ton style déco : {deco.nom}</h2>
        <p>{deco.description}</p>
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
