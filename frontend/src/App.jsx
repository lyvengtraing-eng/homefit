import { useState } from 'react';
import { api } from './api';
import Questionnaire from './components/Questionnaire';
import Resultats from './components/Resultats';
import './App.css';

// Composant racine : bascule entre le questionnaire et les résultats, et
// porte l'appel à l'API de recommandation.
function App() {
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);

  const validerProfil = async (profil) => {
    setChargement(true);
    setErreur(null);
    try {
      const reponse = await api.obtenirRecommandations(profil);
      setDonnees(reponse);
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="app">
      <header className="app__entete">
        <h1>HomeFit</h1>
        <p className="app__accroche">Trouve le logement (et le style déco) qui te correspond vraiment.</p>
      </header>

      {erreur && (
        <div className="app__erreur">
          {erreur}
          <button onClick={() => setErreur(null)} aria-label="Fermer">
            ×
          </button>
        </div>
      )}

      {chargement && <p className="app__chargement">Recherche des meilleurs logements…</p>}

      {!chargement && !donnees && <Questionnaire onValider={validerProfil} />}
      {!chargement && donnees && <Resultats donnees={donnees} onModifier={() => setDonnees(null)} />}
    </div>
  );
}

export default App;
