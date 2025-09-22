import React from 'react';
import FeuilleMaitresseTabs from './FeuilleMaitresseTabs';

// Données de démonstration pour tester le composant
const demoData = {
  financier: {
    has_two_exercices: true,
    exercices: [2025, 2024],
    exercice_n: [
      {
        Compte: "0000050-01",
        Libellé: "Banque",
        Solde: 10000,
        Débit: 10000,
        Crédit: 0,
        Exercice: 2025,
        Date_Creation: "2025-01-15"
      },
      {
        Compte: "0000051-01",
        Libellé: "Caisse",
        Solde: 5000,
        Débit: 5000,
        Crédit: 0,
        Exercice: 2025,
        Date_Creation: "2025-01-15"
      }
    ],
    exercice_n1: [
      {
        Compte: "0000050-01",
        Libellé: "Banque",
        Solde: 12000,
        Débit: 12000,
        Crédit: 0,
        Exercice: 2024,
        Date_Creation: "2024-01-15"
      },
      {
        Compte: "0000051-01",
        Libellé: "Caisse",
        Solde: 3000,
        Débit: 3000,
        Crédit: 0,
        Exercice: 2024,
        Date_Creation: "2024-01-15"
      }
    ],
    comparatif: [
      {
        Compte: "0000050-01",
        Libellé: "Banque",
        Solde_N: 10000,
        "Solde_N-1": 12000,
        Variation: -2000,
        "%_Evolution": -16.67,
        Débit_N: 10000,
        Crédit_N: 0,
        "Débit_N-1": 12000,
        "Crédit_N-1": 0,
        Exercices: "2025/2024"
      },
      {
        Compte: "0000051-01",
        Libellé: "Caisse",
        Solde_N: 5000,
        "Solde_N-1": 3000,
        Variation: 2000,
        "%_Evolution": 66.67,
        Débit_N: 5000,
        Crédit_N: 0,
        "Débit_N-1": 3000,
        "Crédit_N-1": 0,
        Exercices: "2025/2024"
      }
    ]
  },
  "Clients-Ventes": {
    has_two_exercices: false,
    exercices: [2025],
    exercice_n: [
      {
        Compte: "0001000-01",
        Libellé: "Clients",
        Solde: 25000,
        Débit: 25000,
        Crédit: 0,
        Exercice: 2025,
        Date_Creation: "2025-01-15"
      }
    ]
  }
};

const FeuilleMaitresseDemo = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#1800ad', marginBottom: '30px' }}>
        Démonstration - Nouvelle Structure des Feuilles Maîtresses
      </h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          Groupe Financier (2 exercices - avec comparatif)
        </h2>
        <FeuilleMaitresseTabs 
          groupName="Financier" 
          groupData={demoData.financier} 
        />
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          Groupe Clients-Ventes (1 exercice)
        </h2>
        <FeuilleMaitresseTabs 
          groupName="Clients-Ventes" 
          groupData={demoData["Clients-Ventes"]} 
        />
      </div>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        border: '1px solid #e3e7ed'
      }}>
        <h3 style={{ color: '#1800ad', marginBottom: '15px' }}>
          Fonctionnalités implémentées :
        </h3>
        <ul style={{ color: '#333', lineHeight: '1.6' }}>
          <li>✅ Système d'onglets avec design épuré et icônes</li>
          <li>✅ Détection automatique du nombre d'exercices</li>
          <li>✅ Tableaux spécialisés pour chaque type d'onglet</li>
          <li>✅ Formatage des variations et pourcentages avec couleurs</li>
          <li>✅ Gestion des comptes manquants avec indicateurs</li>
          <li>✅ Formatage monétaire XOF</li>
          <li>✅ Design responsive</li>
          <li>✅ Animations et transitions fluides</li>
        </ul>
      </div>
    </div>
  );
};

export default FeuilleMaitresseDemo;
