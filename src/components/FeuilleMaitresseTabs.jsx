import React, { useState } from 'react';
import Tabs from './Tabs';
import CommentSection from './CommentSection';
import './FeuilleMaitresseTabs.css';

const FeuilleMaitresseTabs = ({ groupName, groupData, generatedFileId, comment, onCommentUpdate }) => {
  const [activeTab, setActiveTab] = useState('exercice_n');

  // Déterminer les onglets disponibles selon la structure des données
  const getAvailableTabs = () => {
    const tabs = [];
    
    // Onglet Exercice N (toujours présent)
    if (groupData.exercice_n && Array.isArray(groupData.exercice_n)) {
      tabs.push({
        id: 'exercice_n',
        label: `Exercice ${groupData.exercices?.[0] || 'N'}`,
        icon: '📊',
        badge: groupData.exercice_n.length
      });
    }
    
    // Onglet Exercice N-1 (si disponible)
    if (groupData.has_two_exercices && groupData.exercice_n1 && Array.isArray(groupData.exercice_n1)) {
      tabs.push({
        id: 'exercice_n1',
        label: `Exercice ${groupData.exercices?.[1] || 'N-1'}`,
        icon: '📈',
        badge: groupData.exercice_n1.length
      });
    }
    
    // Onglet Comparatif (si deux exercices)
    if (groupData.has_two_exercices && groupData.comparatif && Array.isArray(groupData.comparatif)) {
      tabs.push({
        id: 'comparatif',
        label: 'Comparatif',
        icon: '⚖️',
        badge: groupData.comparatif.length
      });
    }
    
    return tabs;
  };

  const tabs = getAvailableTabs();
  
  // Si aucun onglet disponible, afficher un message
  if (tabs.length === 0) {
    return (
      <div className="feuille-maitresse-container">
        <div className="no-data-message">
          <span className="no-data-icon">📋</span>
          <p>Aucune donnée disponible pour {groupName}</p>
        </div>
      </div>
    );
  }

  // Obtenir les données de l'onglet actif
  const getCurrentData = () => {
    switch (activeTab) {
      case 'exercice_n':
        return groupData.exercice_n || [];
      case 'exercice_n1':
        return groupData.exercice_n1 || [];
      case 'comparatif':
        return groupData.comparatif || [];
      default:
        return [];
    }
  };

  const currentData = getCurrentData();

  return (
    <div className="feuille-maitresse-container">
      <Tabs 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        className="feuille-maitresse-tabs"
      />
      
      <div className="tab-content">
        {renderTableForTab(activeTab, currentData, groupData)}
        
        {/* Section commentaires */}
        {generatedFileId && (
          <CommentSection
            generatedFileId={generatedFileId}
            groupName={groupName}
            initialComment={comment}
            onCommentUpdate={onCommentUpdate}
          />
        )}
      </div>
    </div>
  );
};

// Fonction pour rendre le tableau selon le type d'onglet
const renderTableForTab = (tabType, data, groupData) => {
  if (!data || data.length === 0) {
    return (
      <div className="no-data-message">
        <span className="no-data-icon">📊</span>
        <p>Aucune donnée disponible pour cet onglet</p>
      </div>
    );
  }

  const columns = getColumnsForTab(tabType);
  
  return (
    <div className="table-container">
      <div className="table-header">
        <h4 className="table-title">
          {getTableTitle(tabType, groupData)}
        </h4>
        <div className="table-info">
          {data.length} compte{data.length > 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="feuille-maitresse-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th 
                  key={col.key} 
                  className={`table-header-cell ${col.align || 'left'}`}
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((account, index) => (
              <tr key={`${account.Compte || account.id || index}`} className="table-row">
                {columns.map(col => (
                  <td 
                    key={col.key} 
                    className={`table-cell ${col.align || 'left'} ${col.format || 'text'}`}
                  >
                    {renderCellValue(account, col, tabType)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Définir les colonnes selon le type d'onglet
const getColumnsForTab = (tabType) => {
  switch (tabType) {
    case 'exercice_n':
    case 'exercice_n1':
      return [
        { key: 'Compte', label: 'Compte', width: '120px' },
        { key: 'Libellé', label: 'Libellé', width: '200px' },
        { key: 'Solde', label: 'Solde', width: '120px', align: 'right', format: 'currency' },
        { key: 'Débit', label: 'Débit', width: '120px', align: 'right', format: 'currency' },
        { key: 'Crédit', label: 'Crédit', width: '120px', align: 'right', format: 'currency' },
        { key: 'Exercice', label: 'Exercice', width: '100px', align: 'center' },
        { key: 'Date_Creation', label: 'Date Création', width: '120px', align: 'center' }
      ];
    
    case 'comparatif':
      return [
        { key: 'Compte', label: 'Compte', width: '120px' },
        { key: 'Libellé', label: 'Libellé', width: '180px' },
        { key: 'Solde_N', label: 'Solde N', width: '100px', align: 'right', format: 'currency' },
        { key: 'Solde_N-1', label: 'Solde N-1', width: '100px', align: 'right', format: 'currency' },
        { key: 'Variation', label: 'Variation', width: '100px', align: 'right', format: 'variation' },
        { key: '%_Evolution', label: '% Évolution', width: '100px', align: 'right', format: 'percentage' },
        { key: 'Débit_N', label: 'Débit N', width: '90px', align: 'right', format: 'currency' },
        { key: 'Crédit_N', label: 'Crédit N', width: '90px', align: 'right', format: 'currency' },
        { key: 'Débit_N-1', label: 'Débit N-1', width: '90px', align: 'right', format: 'currency' },
        { key: 'Crédit_N-1', label: 'Crédit N-1', width: '90px', align: 'right', format: 'currency' },
        { key: 'Exercices', label: 'Exercices', width: '100px', align: 'center' }
      ];
    
    default:
      return [];
  }
};

// Obtenir le titre du tableau
const getTableTitle = (tabType, groupData) => {
  switch (tabType) {
    case 'exercice_n':
      return `Exercice ${groupData.exercices?.[0] || 'N'}`;
    case 'exercice_n1':
      return `Exercice ${groupData.exercices?.[1] || 'N-1'}`;
    case 'comparatif':
      return `Comparatif ${groupData.exercices?.[0] || 'N'} / ${groupData.exercices?.[1] || 'N-1'}`;
    default:
      return 'Données';
  }
};

// Rendre la valeur d'une cellule
const renderCellValue = (account, col, tabType) => {
  const value = account[col.key];
  
  // Gestion des valeurs manquantes
  if (value === undefined || value === null || value === '') {
    return <span className="missing-value">-</span>;
  }
  
  // Formatage selon le type
  switch (col.format) {
    case 'currency':
      return (
        <span className="currency-value">
          {new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'XOF',
            minimumFractionDigits: 0 
          }).format(value)}
        </span>
      );
    
    case 'variation':
      const variation = parseFloat(value);
      return (
        <span className={`variation-value ${variation >= 0 ? 'positive' : 'negative'}`}>
          {new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'XOF',
            minimumFractionDigits: 0 
          }).format(variation)}
        </span>
      );
    
    case 'percentage':
      const percentage = parseFloat(value);
      return (
        <span className={`percentage-value ${percentage >= 0 ? 'positive' : 'negative'}`}>
          {percentage.toFixed(2)}%
        </span>
      );
    
    case 'center':
      return <span className="centered-value">{value}</span>;
    
    default:
      return <span className="text-value">{value}</span>;
  }
};

export default FeuilleMaitresseTabs;
