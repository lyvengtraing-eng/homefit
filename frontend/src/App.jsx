import { useState } from 'react';
import { api } from './api';
import Questionnaire from './components/Questionnaire';
import Resultats from './components/Resultats';
import ResultatsDuo from './components/ResultatsDuo';
import './App.css';

// Composant racine : bascule entre 4 vues (questionnaire solo, résultats
// solo, questionnaire de la 2e personne, résultats duo) et porte les appels
// à l'API de recommandation.
function App() {
  const [vue, setVue] = useState('questionnaire');
  const [profilA, setProfilA] = useState(null);
  const [donnees, setDonnees] = useState(null);
  const [donneesDuo, setDonneesDuo] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState(null);

  const validerProfil = async (profil) => {
    setChargement(true);
    setErreur(null);
    try {
      const reponse = await api.obtenirRecommandations(profil);
      setProfilA(profil);
      setDonnees(reponse);
      setVue('resultats');
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  };

  const validerProfilDuo = async (profilB) => {
    setChargement(true);
    setErreur(null);
    try {
      const reponse = await api.obtenirRecommandationsDuo(profilA, profilB);
      setDonneesDuo(reponse);
      setVue('resultatsDuo');
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  };

  const recommencer = () => {
    setDonnees(null);
    setDonneesDuo(null);
    setProfilA(null);
    setVue('questionnaire');
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

      {!chargement && vue === 'questionnaire' && <Questionnaire onValider={validerProfil} />}

      {!chargement && vue === 'resultats' && donnees && (
        <Resultats donnees={donnees} onModifier={recommencer} onComparerDuo={() => setVue('questionnaireDuo')} />
      )}

      {!chargement && vue === 'questionnaireDuo' && (
        <Questionnaire
          onValider={validerProfilDuo}
          titre="Et pour la deuxième personne ?"
          texteBouton="Voir notre compatibilité"
        />
      )}

      {!chargement && vue === 'resultatsDuo' && donneesDuo && (
        <ResultatsDuo donnees={donneesDuo} onModifier={recommencer} />
      )}
    </div>
  );
}

export default App;
