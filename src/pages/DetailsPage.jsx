import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import FeuilleMaitresseTabs from '../components/FeuilleMaitresseTabs';
import CommentSection from '../components/CommentSection';
import { FaHistory, FaFileAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaDownload, FaChevronDown, FaChevronUp, FaFileExcel, FaArrowLeft, FaBuilding, FaHandHoldingUsd, FaCogs, FaPlay, FaStop, FaWater, FaCoins, FaBalanceScale, FaCalculator, FaDatabase, FaShieldAlt, FaExclamationTriangle, FaInfoCircle, FaChartBar, FaMoneyBillWave, FaPercent, FaSearch, FaClipboardCheck, FaChartLine, FaExchangeAlt, FaWallet, FaCashRegister } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import TFTCharts from '../components/TFTCharts';
import './DetailsPage.css';

const DetailsPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedFiles, setExpandedFiles] = useState({});
  const [tftFilters, setTftFilters] = useState({
    code: '',
    montant: { min: '', max: '' },
    comptes: { search: '', sortBy: 'account_number', sortOrder: 'asc' },
    showFilters: false,
    // Nouveaux filtres avancés
    fluxType: 'all', // all, positive, negative, zero
    montantSeuil: 'all', // all, tres-eleve, eleve, moyen, faible
    classeFlux: 'all', // all, operationnel, investissement, financement
    natureFlux: 'all', // all, encaissement, decaissement, neutre
    nombreComptes: 'all', // all, peu, moyen, beaucoup
    typeComptes: 'all', // all, clients, fournisseurs, banques, charges, produits, immobilisations, autres
    activiteComptes: 'all', // all, actifs, inactifs
    impact: 'all', // all, significatif, modere, mineur
    tri: { critere: 'code', ordre: 'asc' } // code, montant, nombre_comptes, impact
  });
  
  const [accountsFilters, setAccountsFilters] = useState({
    search: '',
    sortBy: 'account_number',
    sortOrder: 'asc',
    filterBy: 'all' // all, positive, negative, zero
  });
  
  const [accountsModal, setAccountsModal] = useState({
    isOpen: false,
    code: '',
    accounts: []
  });

  // Fonction pour gérer la mise à jour des commentaires
  const handleCommentUpdate = (groupName, newComment) => {
    setReport(prevReport => {
      if (!prevReport) return prevReport;
      
      return {
        ...prevReport,
        generated_files: prevReport.generated_files?.map(file => {
          if (file.file_type === 'feuille_maitresse' && file.group_name === groupName) {
            return { ...file, comment: newComment };
          }
          return file;
        }) || []
      };
    });
  };

  // Fonction pour basculer l'état d'expansion d'un fichier
  const toggleFileExpansion = (fileKey) => {
    setExpandedFiles(prev => ({
      ...prev,
      [fileKey]: !prev[fileKey]
    }));
  };

  // Fonction pour gérer les filtres TFT
  const handleTftFilterChange = (filterType, value) => {
    setTftFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Fonction pour réinitialiser les filtres TFT
  const resetTftFilters = () => {
    setTftFilters({
      code: '',
      montant: { min: '', max: '' },
      comptes: { search: '', sortBy: 'account_number', sortOrder: 'asc' },
      showFilters: false,
      fluxType: 'all',
      montantSeuil: 'all',
      classeFlux: 'all',
      natureFlux: 'all',
      nombreComptes: 'all',
      typeComptes: 'all',
      activiteComptes: 'all',
      impact: 'all',
      tri: { critere: 'code', ordre: 'asc' }
    });
  };

  // Fonction pour sauvegarder les filtres préférés
  const saveTftFilters = () => {
    const filtersToSave = { ...tftFilters };
    delete filtersToSave.showFilters; // Ne pas sauvegarder l'état d'affichage
    localStorage.setItem('tftFilters', JSON.stringify(filtersToSave));
    toast.success('Filtres sauvegardés !');
  };

  // Fonction pour charger les filtres sauvegardés
  const loadTftFilters = () => {
    const savedFilters = localStorage.getItem('tftFilters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setTftFilters(prev => ({ ...prev, ...parsed }));
        toast.success('Filtres restaurés !');
      } catch (error) {
        toast.error('Erreur lors du chargement des filtres');
      }
    } else {
      toast.info('Aucun filtre sauvegardé');
    }
  };

  // Fonctions utilitaires pour analyser les données TFT
  const getFluxType = (montant) => {
    if (montant > 0) return 'positive';
    if (montant < 0) return 'negative';
    return 'zero';
  };

  const getMontantSeuil = (montant, maxMontant) => {
    const absMontant = Math.abs(montant);
    const pourcentage = maxMontant > 0 ? (absMontant / maxMontant) * 100 : 0;
    
    if (pourcentage >= 80) return 'tres-eleve';
    if (pourcentage >= 50) return 'eleve';
    if (pourcentage >= 20) return 'moyen';
    return 'faible';
  };

  const getClasseFlux = (code) => {
    const codeStr = code.toString().toLowerCase();
    if (codeStr.includes('operationnel') || codeStr.includes('opérationnel') || codeStr.includes('operating')) return 'operationnel';
    if (codeStr.includes('investissement') || codeStr.includes('invest') || codeStr.includes('capex')) return 'investissement';
    if (codeStr.includes('financement') || codeStr.includes('finance') || codeStr.includes('debt')) return 'financement';
    return 'autre';
  };

  const getNatureFlux = (montant, code) => {
    const codeStr = code.toString().toLowerCase();
    if (montant > 0) {
      if (codeStr.includes('encaissement') || codeStr.includes('recette') || codeStr.includes('vente')) return 'encaissement';
      return 'encaissement';
    } else if (montant < 0) {
      if (codeStr.includes('decaissement') || codeStr.includes('paiement') || codeStr.includes('depense')) return 'decaissement';
      return 'decaissement';
    }
    return 'neutre';
  };

  const getNombreComptes = (comptes) => {
    const count = Array.isArray(comptes) ? comptes.length : 0;
    if (count === 0) return 'aucun';
    if (count <= 3) return 'peu';
    if (count <= 10) return 'moyen';
    return 'beaucoup';
  };

  const getTypeComptes = (comptes) => {
    if (!Array.isArray(comptes) || comptes.length === 0) return 'aucun';
    
    const types = new Set();
    comptes.forEach(compte => {
      const num = compte.account_number?.toString() || '';
      if (num.startsWith('411') || num.startsWith('412')) types.add('clients');
      else if (num.startsWith('401') || num.startsWith('402')) types.add('fournisseurs');
      else if (num.startsWith('512') || num.startsWith('513')) types.add('banques');
      else if (num.startsWith('6')) types.add('charges');
      else if (num.startsWith('7')) types.add('produits');
      else if (num.startsWith('2')) types.add('immobilisations');
      else types.add('autres');
    });
    
    return Array.from(types);
  };

  const getActiviteComptes = (comptes) => {
    if (!Array.isArray(comptes) || comptes.length === 0) return 'aucun';
    
    const totalEntries = comptes.reduce((sum, compte) => sum + (compte.entries_count || 0), 0);
    const avgEntries = totalEntries / comptes.length;
    
    if (avgEntries > 20) return 'actifs';
    if (avgEntries > 5) return 'moderement-actifs';
    return 'inactifs';
  };

  const getImpact = (montant, maxMontant) => {
    const absMontant = Math.abs(montant);
    const pourcentage = maxMontant > 0 ? (absMontant / maxMontant) * 100 : 0;
    
    if (pourcentage >= 50) return 'significatif';
    if (pourcentage >= 20) return 'modere';
    return 'mineur';
  };

  // Fonction pour gérer les filtres des comptes
  const handleAccountsFilterChange = (filterType, value) => {
    setAccountsFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Fonction pour ouvrir la modal des comptes
  const openAccountsModal = (code, accounts) => {
    setAccountsModal({
      isOpen: true,
      code: code,
      accounts: accounts
    });
  };

  // Fonction pour fermer la modal des comptes
  const closeAccountsModal = () => {
    setAccountsModal({
      isOpen: false,
      code: '',
      accounts: []
    });
  };

  // Fonction pour trier et filtrer les comptes
  const getFilteredAndSortedAccounts = (accounts) => {
    if (!Array.isArray(accounts)) return [];

    let filtered = accounts.filter(account => {
      // Filtre par recherche
      if (accountsFilters.search) {
        const searchTerm = accountsFilters.search.toLowerCase();
        const matchesNumber = account.account_number?.toLowerCase().includes(searchTerm);
        const matchesLabel = account.account_label?.toLowerCase().includes(searchTerm);
        if (!matchesNumber && !matchesLabel) return false;
      }

      // Filtre par type de solde
      const balance = account.balance || 0;
      switch (accountsFilters.filterBy) {
        case 'positive':
          return balance > 0;
        case 'negative':
          return balance < 0;
        case 'zero':
          return balance === 0;
        default:
          return true;
      }
    });

    // Tri des comptes
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (accountsFilters.sortBy) {
        case 'account_number':
          aValue = a.account_number || '';
          bValue = b.account_number || '';
          break;
        case 'account_label':
          aValue = a.account_label || '';
          bValue = b.account_label || '';
          break;
        case 'balance':
          aValue = a.balance || 0;
          bValue = b.balance || 0;
          break;
        case 'entries_count':
          aValue = a.entries_count || 0;
          bValue = b.entries_count || 0;
          break;
        default:
          aValue = a.account_number || '';
          bValue = b.account_number || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return accountsFilters.sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return accountsFilters.sortOrder === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
    });

    return filtered;
  };

  // Fonction pour filtrer les données TFT
  const getFilteredTftData = (tftData) => {
    if (!tftData) return {};
    
    // Calculer les métriques globales pour les seuils
    const allMontants = Object.values(tftData).map(data => Math.abs(data.montant || data.amount || 0));
    const maxMontant = Math.max(...allMontants, 1);
    
    let filtered = Object.entries(tftData).reduce((filtered, [code, data]) => {
      const montant = data.montant || data.amount || 0;
      const comptes = data.comptes || [];
      
      // Filtre par code
      if (tftFilters.code && !code.toLowerCase().includes(tftFilters.code.toLowerCase())) {
        return filtered;
      }
      
      // Filtre par montant min/max
      if (tftFilters.montant.min && montant < parseFloat(tftFilters.montant.min)) {
        return filtered;
      }
      if (tftFilters.montant.max && montant > parseFloat(tftFilters.montant.max)) {
        return filtered;
      }
      
      // Filtre par type de flux
      if (tftFilters.fluxType !== 'all') {
        const fluxType = getFluxType(montant);
        if (fluxType !== tftFilters.fluxType) {
          return filtered;
        }
      }
      
      // Filtre par seuil de montant
      if (tftFilters.montantSeuil !== 'all') {
        const montantSeuil = getMontantSeuil(montant, maxMontant);
        if (montantSeuil !== tftFilters.montantSeuil) {
          return filtered;
        }
      }
      
      // Filtre par classe de flux
      if (tftFilters.classeFlux !== 'all') {
        const classeFlux = getClasseFlux(code);
        if (classeFlux !== tftFilters.classeFlux) {
          return filtered;
        }
      }
      
      // Filtre par nature de flux
      if (tftFilters.natureFlux !== 'all') {
        const natureFlux = getNatureFlux(montant, code);
        if (natureFlux !== tftFilters.natureFlux) {
          return filtered;
        }
      }
      
      // Filtre par nombre de comptes
      if (tftFilters.nombreComptes !== 'all') {
        const nombreComptes = getNombreComptes(comptes);
        if (nombreComptes !== tftFilters.nombreComptes) {
          return filtered;
        }
      }
      
      // Filtre par type de comptes
      if (tftFilters.typeComptes !== 'all') {
        const typesComptes = getTypeComptes(comptes);
        if (!typesComptes.includes(tftFilters.typeComptes)) {
          return filtered;
        }
      }
      
      // Filtre par activité des comptes
      if (tftFilters.activiteComptes !== 'all') {
        const activiteComptes = getActiviteComptes(comptes);
        if (activiteComptes !== tftFilters.activiteComptes) {
          return filtered;
        }
      }
      
      // Filtre par impact
      if (tftFilters.impact !== 'all') {
        const impact = getImpact(montant, maxMontant);
        if (impact !== tftFilters.impact) {
          return filtered;
        }
      }
      
      // Filtre par comptes (recherche)
      if (tftFilters.comptes.search && comptes.length > 0) {
        const hasMatchingAccount = comptes.some(compte => 
          compte.account_number?.toLowerCase().includes(tftFilters.comptes.search.toLowerCase()) ||
          compte.account_label?.toLowerCase().includes(tftFilters.comptes.search.toLowerCase())
        );
        if (!hasMatchingAccount) {
          return filtered;
        }
      }
      
      filtered[code] = data;
      return filtered;
    }, {});
    
    // Tri des résultats
    const entries = Object.entries(filtered);
    entries.sort(([codeA, dataA], [codeB, dataB]) => {
      let aValue, bValue;
      
      switch (tftFilters.tri.critere) {
        case 'code':
          aValue = codeA;
          bValue = codeB;
          break;
        case 'montant':
          aValue = dataA.montant || dataA.amount || 0;
          bValue = dataB.montant || dataB.amount || 0;
          break;
        case 'nombre_comptes':
          aValue = (dataA.comptes || []).length;
          bValue = (dataB.comptes || []).length;
          break;
        case 'impact':
          aValue = getImpact(dataA.montant || dataA.amount || 0, maxMontant);
          bValue = getImpact(dataB.montant || dataB.amount || 0, maxMontant);
          break;
        default:
          aValue = codeA;
          bValue = codeB;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return tftFilters.tri.ordre === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return tftFilters.tri.ordre === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
    });
    
    return Object.fromEntries(entries);
  };

  // Fonction pour obtenir l'icône appropriée selon le titre de la carte
  const getCardIcon = (title) => {
    const titleLower = title.toLowerCase();
    
    // Types de flux financiers spécifiques
    if (titleLower.includes('investissement') || titleLower.includes('invest') || titleLower.includes('capex')) {
      return <FaBuilding size={24} />;
    } else if (titleLower.includes('financement') || titleLower.includes('finance') || titleLower.includes('debt')) {
      return <FaHandHoldingUsd size={24} />;
    } else if (titleLower.includes('opérationnel') || titleLower.includes('operationnel') || titleLower.includes('operating')) {
      return <FaCogs size={24} />;
    } else if (titleLower.includes('ouverture') || titleLower.includes('opening') || titleLower.includes('début')) {
      return <FaPlay size={24} />;
    } else if (titleLower.includes('clôture') || titleLower.includes('cloture') || titleLower.includes('closing') || titleLower.includes('fin')) {
      return <FaStop size={24} />;
    } else if (titleLower.includes('flux') || titleLower.includes('flow')) {
      return <FaWater size={24} />;
    } else if (titleLower.includes('treso') || titleLower.includes('trésorerie') || titleLower.includes('cash')) {
      return <FaCoins size={24} />;
    } else if (titleLower.includes('balance') || titleLower.includes('solde')) {
      return <FaBalanceScale size={24} />;
    } else if (titleLower.includes('calcul') || titleLower.includes('compt')) {
      return <FaCalculator size={24} />;
    } else if (titleLower.includes('data') || titleLower.includes('donnée')) {
      return <FaDatabase size={24} />;
    } else if (titleLower.includes('config') || titleLower.includes('param')) {
      return <FaCogs size={24} />;
    } else if (titleLower.includes('security') || titleLower.includes('sécurité')) {
      return <FaShieldAlt size={24} />;
    } else if (titleLower.includes('warning') || titleLower.includes('alerte')) {
      return <FaExclamationTriangle size={24} />;
    } else if (titleLower.includes('info') || titleLower.includes('information')) {
      return <FaInfoCircle size={24} />;
    } else if (titleLower.includes('chart') || titleLower.includes('graphique')) {
      return <FaChartBar size={24} />;
    } else if (titleLower.includes('money') || titleLower.includes('argent') || titleLower.includes('montant')) {
      return <FaMoneyBillWave size={24} />;
    } else if (titleLower.includes('percent') || titleLower.includes('pourcentage')) {
      return <FaPercent size={24} />;
    } else if (titleLower.includes('search') || titleLower.includes('recherche')) {
      return <FaSearch size={24} />;
    } else if (titleLower.includes('check') || titleLower.includes('vérification') || titleLower.includes('contrôle')) {
      return <FaClipboardCheck size={24} />;
    } else if (titleLower.includes('trend') || titleLower.includes('tendance')) {
      return <FaChartLine size={24} />;
    } else if (titleLower.includes('exchange') || titleLower.includes('échange') || titleLower.includes('transfert')) {
      return <FaExchangeAlt size={24} />;
    } else if (titleLower.includes('wallet') || titleLower.includes('portefeuille')) {
      return <FaWallet size={24} />;
    } else if (titleLower.includes('register') || titleLower.includes('caisse')) {
      return <FaCashRegister size={24} />;
    } else {
      return <FaCheckCircle size={24} />;
    }
  };

  // Fonction pour rendre le statut avec style
  const renderStatus = (item) => {
    const status = typeof item.status === 'string' ? item.status.toLowerCase() : item.status;
    if (status === 'ok' || status === 'success') {
      return (
        <div className="status-badge status-success">
          <FaCheckCircle size={14} />
          <span>Succès</span>
        </div>
      );
    } else if (status === 'error' || status === 'failed') {
      return (
        <div className="status-badge status-error">
          <FaTimesCircle size={14} />
          <span>Erreur</span>
        </div>
      );
    } else if (status === 'pending') {
      return (
        <div className="status-badge status-pending">
          <FaHistory size={14} />
          <span>En attente</span>
        </div>
      );
    } else {
      return (
        <div className="status-badge status-unknown">
          <FaFileAlt size={14} />
          <span>{item.status}</span>
        </div>
      );
    }
  };

  // Fonction pour rendre le TFT comme un tableau Excel
  const renderTFTAsTable = (data, title) => {
    if (!data || typeof data !== 'object') return null;
    
    const entries = Object.entries(data);
    if (entries.length === 0) return <p>Aucune donnée disponible</p>;

    // Collecter toutes les propriétés uniques pour créer les colonnes
    const allProperties = new Set();
    entries.forEach(([_, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.keys(value).forEach(key => allProperties.add(key));
      }
    });
    
    const properties = Array.from(allProperties);

    return (
      <div style={{ marginTop: 16, width: '100%' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: 16 }}>{title}</h4>
        <div style={{ overflowX: 'auto', border: '1px solid #e3e7ed', borderRadius: 4, width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: '100%' }}>
            <thead style={{ background: '#f0f8ff' }}>
              <tr>
                <th style={{ 
                  padding: '8px 6px', 
                  textAlign: 'center', 
                  borderBottom: '2px solid #1800ad', 
                  fontWeight: 700,
                  background: '#e6f3ff',
                  color: '#1800ad',
                  fontSize: 12
                }}>
                  Code
                </th>
                {properties.map(prop => (
                  <th key={prop} style={{ 
                    padding: '8px 6px', 
                    textAlign: 'center', 
                    borderBottom: '2px solid #1800ad', 
                    fontWeight: 700,
                    background: '#e6f3ff',
                    color: '#1800ad',
                    fontSize: 12,
                    textTransform: 'capitalize'
                  }}>
                    {prop.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map(([code, value], index) => (
                <tr key={code} style={{ 
                  borderBottom: '1px solid #e3e7ed',
                  background: index % 2 === 0 ? '#fff' : '#fafafa'
                }}>
                  <td style={{ 
                    padding: '8px 6px', 
                    fontWeight: 700, 
                    color: '#1800ad',
                    textAlign: 'center',
                    background: '#f8f9fa',
                    borderRight: '1px solid #e3e7ed'
                  }}>
                    {code}
                  </td>
                  {properties.map(prop => (
                    <td key={prop} style={{ 
                      padding: '8px 6px', 
                      textAlign: prop === 'montant' || prop === 'amount' ? 'right' : 'left',
                      fontWeight: prop === 'montant' || prop === 'amount' ? 600 : 'normal'
                    }}>
                      {(() => {
                        const cellValue = value[prop];
                        
                        // Format spécial pour la colonne "Comptes" (array d'objets)
                        if (prop === 'comptes' && Array.isArray(cellValue) && cellValue.length > 0) {
                          return (
                            <div className="accounts-container">
                              <div 
                                className="accounts-header"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAccountsModal(code, cellValue);
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span>📋</span>
                                  <span>Comptes</span>
                                </div>
                                <div className="accounts-count">
                                  {cellValue.length}
                                </div>
                                <span className="accounts-arrow">👁️</span>
                              </div>
                            </div>
                          );
                        }
                        
                        // Vérifier si la valeur est un objet complexe
                        if (typeof cellValue === 'object' && cellValue !== null) {
                          return JSON.stringify(cellValue);
                        }
                        
                        if (prop === 'montant' || prop === 'amount') {
                          return cellValue !== undefined && cellValue !== null ? 
                            new Intl.NumberFormat('fr-FR', { 
                              style: 'currency', 
                              currency: 'XOF',
                              minimumFractionDigits: 0 
                            }).format(cellValue) : 
                            '-';
                        }
                        
                        return String(cellValue || '-');
                      })()}
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

  // Fonction pour rendre une seule feuille maîtresse avec la nouvelle structure
  const renderSingleFeuilleMaitresse = (groupName, groupData) => {
    // Vérifier si les données sont dans le nouveau format
    const isNewFormat = groupData && (
      groupData.has_two_exercices !== undefined ||
      groupData.exercice_n ||
      groupData.exercice_n1 ||
      groupData.comparatif
    );

    if (isNewFormat) {
      // Utiliser le nouveau composant avec onglets
      const generatedFile = report?.generated_files?.find(f => f.file_type === 'feuille_maitresse' && f.group_name === groupName);
      return (
        <FeuilleMaitresseTabs 
          groupName={groupName} 
          groupData={groupData}
          generatedFileId={generatedFile?.id}
          comment={generatedFile?.comment}
          onCommentUpdate={(newComment) => handleCommentUpdate(groupName, newComment)}
        />
      );
    }

    // Fallback pour l'ancien format (compatibilité temporaire)
    const excelColumns = [
      { key: 'id', label: 'ID', width: '60px' },
      { key: 'account_number', label: 'Numéro Compte', width: '120px' },
      { key: 'account_label', label: 'Libellé Compte', width: '200px' },
      { key: 'account_class', label: 'Classe Compte', width: '120px' },
      { key: 'balance', label: 'Solde', width: '120px', align: 'right', format: 'currency' },
      { key: 'total_debit', label: 'Total Débit', width: '120px', align: 'right', format: 'currency' },
      { key: 'total_credit', label: 'Total Crédit', width: '120px', align: 'right', format: 'currency' },
      { key: 'entries_count', label: 'Nb Écritures', width: '100px', align: 'right' },
      { key: 'created_at', label: 'Date Création', width: '120px' },
      { key: 'financial_report_id', label: 'ID Rapport', width: '100px' },
      { key: 'account_lookup_key', label: 'Clé Recherche', width: '120px' },
      { key: 'exercice', label: 'Exercice', width: '100px' }
    ];

    // Vérifier si groupData contient des comptes détaillés dans comptes_n
    const hasDetailedAccounts = groupData && typeof groupData === 'object' && (
      groupData.comptes_n && Array.isArray(groupData.comptes_n) && groupData.comptes_n.length > 0
    );

    let accountsData;
    
    if (hasDetailedAccounts) {
      // Utiliser les comptes détaillés du tableau comptes_n
      accountsData = groupData.comptes_n;
    } else {
      // Fallback - convertir les totaux en format Excel
      accountsData = [{
        id: 1,
        account_number: groupName,
        account_label: groupName,
        account_class: 'Groupe',
        balance: groupData.balance || groupData.solde_n || 0,
        total_debit: groupData.total_debit || groupData.debit_total || 0,
        total_credit: groupData.total_credit || groupData.credit_total || 0,
        entries_count: groupData.entries_count || groupData.nb_ecritures || 0,
        created_at: groupData.created_at || new Date().toISOString().split('T')[0],
        financial_report_id: groupData.financial_report_id || '-',
        account_lookup_key: groupData.account_lookup_key || groupName,
        exercice: groupData.exercice || new Date().getFullYear()
      }];
    }

    return (
      <div style={{ overflowX: 'auto', border: '1px solid #d0d0d0', borderRadius: 4, width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: '100%' }}>
          <thead style={{ background: '#f0f8ff' }}>
            <tr>
              {excelColumns.map(col => (
                <th key={col.key} style={{ 
                  padding: '6px 4px', 
                  textAlign: col.align || 'center', 
                  borderBottom: '2px solid #1800ad', 
                  borderRight: '1px solid #d0d0d0',
                  fontWeight: 700,
                  background: '#e6f3ff',
                  color: '#1800ad',
                  fontSize: 10,
                  width: col.width,
                  whiteSpace: 'nowrap'
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accountsData.map((account, index) => (
              <tr key={account.id || index} style={{ 
                borderBottom: '1px solid #e0e0e0',
                background: index % 2 === 0 ? '#fff' : '#fafafa'
              }}>
                {excelColumns.map(col => (
                  <td key={col.key} style={{ 
                    padding: '6px 4px', 
                    textAlign: col.align || 'left',
                    borderRight: '1px solid #e0e0e0',
                    fontSize: 10,
                    fontWeight: col.format === 'currency' ? 600 : 'normal',
                    color: col.format === 'currency' ? '#1800ad' : '#333'
                  }}>
                    {col.format === 'currency' ? (
                      account[col.key] !== undefined && account[col.key] !== null ? 
                        new Intl.NumberFormat('fr-FR', { 
                          style: 'currency', 
                          currency: 'XOF',
                          minimumFractionDigits: 0 
                        }).format(account[col.key]) : 
                        '-'
                    ) : (
                      String(account[col.key] || '-')
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Charger les détails du rapport
  const fetchReportDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/reports/balance-history/`);
      
      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.error || errorData.detail || `Erreur ${res.status}: ${res.statusText}`;
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }
      
      const data = await res.json();
      
      // Trouver le rapport spécifique
      let reportData = null;
      if (data.history) {
        reportData = data.history.find(item => item.id.toString() === reportId);
      } else if (data.data) {
        reportData = data.data.find(item => item.id.toString() === reportId);
      }
      
      if (!reportData) {
        setError('Rapport non trouvé');
        toast.error('Rapport non trouvé');
        return;
      }
      
      setReport(reportData);
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la récupération des détails du rapport.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (reportId) {
      fetchReportDetails();
    }
  }, [reportId]);

  // Gestion de la fermeture de la modal avec la touche Échap
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && accountsModal.isOpen) {
        closeAccountsModal();
      }
    };

    if (accountsModal.isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body quand la modal est ouverte
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [accountsModal.isOpen]);

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <main className="main-content">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '40px', 
            background: '#fff', 
            borderRadius: 12, 
            boxShadow: '0 2px 8px #0001',
            marginBottom: 32
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: 40, 
                height: 40, 
                border: '4px solid #f3f3f3', 
                borderTop: '4px solid #1800ad', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#666', margin: 0 }}>Chargement des détails...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Header />
        <main className="main-content">
          <div className="error-message">
            <MdError size={48} color="#dc3545" />
            <h2>Erreur</h2>
            <p>{error}</p>
            <button 
              className="back-button"
              onClick={() => navigate('/history')}
            >
              <FaArrowLeft size={16} />
              Retour à l'historique
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page-container">
        <Header />
        <main className="main-content">
          <div className="no-data-message">
            <FaFileAlt size={48} color="#ccc" />
            <h3>Rapport non trouvé</h3>
            <p>Le rapport demandé n'existe pas ou a été supprimé.</p>
            <button 
              className="back-button"
              onClick={() => navigate('/history')}
            >
              <FaArrowLeft size={16} />
              Retour à l'historique
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header />
      <main className="main-content details-page-container">
        <ToastContainer position="top-right" autoClose={4000} />
        
        {/* En-tête avec bouton retour */}
        <div className="details-header">
          <button 
            className="back-button"
            onClick={() => navigate('/history')}
          >
            <FaArrowLeft size={16} />
            Retour à l'historique
          </button>
          <div className="details-title-section">
            <h1 className="details-title">Détails du rapport #{report.id}</h1>
            {renderStatus(report)}
          </div>
        </div>

        {/* Informations générales */}
        <div className="details-section">
          <h2 className="section-title">Informations générales</h2>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-card-header">
                <FaDownload size={16} />
                <span>Fichier</span>
              </div>
              <div className="info-card-content">
                {report.file ? report.file.split('/').pop() : 'Non spécifié'}
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-card-header">
                <FaCalendarAlt size={16} />
                <span>Période</span>
              </div>
              <div className="info-card-content">
                {report.start_date} - {report.end_date}
              </div>
            </div>
            
            <div className="info-card">
              <div className="info-card-header">
                <FaCalendarAlt size={16} />
                <span>Date d'upload</span>
              </div>
              <div className="info-card-content">
                {new Date(report.uploaded_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
            
            {report.coherence && (
              <div className="info-card">
                <div className="info-card-header">
                  <FaCheckCircle size={16} />
                  <span>Cohérence</span>
                </div>
                <div className={`info-card-content ${report.coherence.is_coherent ? 'coherent' : 'incoherent'}`}>
                  {report.coherence.is_coherent ? 'Cohérent' : 'Non cohérent'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contrôle de cohérence */}
        {report.coherence && (
          <div className="details-section">
            <h2 className="section-title">
              <FaCheckCircle size={20} />
              Contrôle de cohérence
            </h2>
            
            
            <div className="coherence-grid">
              <div className="coherence-card tft-card">
                <div className="coherence-card-background">
                  <div className="coherence-card-pattern"></div>
                </div>
                <div className="coherence-card-content">
                  <div className="coherence-card-header">
                    <div className="coherence-card-icon">
                      <FaFileExcel size={20} />
                    </div>
                    <h4>Variation TFT</h4>
                    <div className={`trend-indicator ${(report.coherence.variation_tft || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {(report.coherence.variation_tft || 0) >= 0 ? '↗' : '↘'}
                    </div>
                  </div>
                  <div className="coherence-value">
                    {new Intl.NumberFormat('fr-FR', { 
                      style: 'currency', 
                      currency: 'XOF',
                      minimumFractionDigits: 0 
                    }).format(report.coherence.variation_tft || 0)}
                  </div>
                  <div className="coherence-indicator">
                    <div className="coherence-indicator-bar">
                      <div 
                        className={`coherence-indicator-fill ${Math.abs(report.coherence.variation_tft || 0) > 1000000 ? 'high' : Math.abs(report.coherence.variation_tft || 0) > 100000 ? 'medium' : 'low'}`}
                        style={{ 
                          width: `${Math.min(Math.abs(report.coherence.variation_tft || 0) / 10000000 * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="coherence-indicator-label">
                      {Math.abs(report.coherence.variation_tft || 0) > 1000000 ? 'Élevée' : 
                       Math.abs(report.coherence.variation_tft || 0) > 100000 ? 'Moyenne' : 'Faible'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="coherence-card treso-card">
                <div className="coherence-card-background">
                  <div className="coherence-card-pattern"></div>
                </div>
                <div className="coherence-card-content">
                  <div className="coherence-card-header">
                    <div className="coherence-card-icon">
                      <FaCheckCircle size={20} />
                    </div>
                    <h4>Variation Trésorerie</h4>
                    <div className={`trend-indicator ${(report.coherence.variation_treso || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {(report.coherence.variation_treso || 0) >= 0 ? '↗' : '↘'}
                    </div>
                  </div>
                  <div className="coherence-value">
                    {new Intl.NumberFormat('fr-FR', { 
                      style: 'currency', 
                      currency: 'XOF',
                      minimumFractionDigits: 0 
                    }).format(report.coherence.variation_treso || 0)}
                  </div>
                  <div className="coherence-indicator">
                    <div className="coherence-indicator-bar">
                      <div 
                        className={`coherence-indicator-fill ${Math.abs(report.coherence.variation_treso || 0) > 1000000 ? 'high' : Math.abs(report.coherence.variation_treso || 0) > 100000 ? 'medium' : 'low'}`}
                        style={{ 
                          width: `${Math.min(Math.abs(report.coherence.variation_treso || 0) / 10000000 * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="coherence-indicator-label">
                      {Math.abs(report.coherence.variation_treso || 0) > 1000000 ? 'Élevée' : 
                       Math.abs(report.coherence.variation_treso || 0) > 100000 ? 'Moyenne' : 'Faible'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="coherence-card level-card">
                <div className="coherence-card-background">
                  <div className="coherence-card-pattern"></div>
                </div>
                <div className="coherence-card-content">
                  <div className="coherence-card-header">
                    <div className="coherence-card-icon">
                      <FaHistory size={20} />
                    </div>
                    <h4>Niveau de cohérence</h4>
                    <div className={`coherence-level-badge ${report.coherence.is_coherent ? 'coherent' : 'incoherent'}`}>
                      {report.coherence.is_coherent ? '✓' : '⚠'}
                    </div>
                  </div>
                  <div className="coherence-level">
                    <div className="coherence-level-circle">
                      <div className={`coherence-level-fill ${report.coherence.is_coherent ? 'coherent' : 'incoherent'}`}>
                        {report.coherence.is_coherent ? '100%' : '30%'}
                      </div>
                    </div>
                    <div className="coherence-level-text">
                      <span className="coherence-level-title">Cohérence</span>
                      <span className="coherence-level-desc">
                        {report.coherence.is_coherent ? 'Excellente' : 'À améliorer'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {report.coherence.details && Object.keys(report.coherence.details).length > 0 && (
              <div className="coherence-details">
                <h4 className="details-section-title">
                  <FaCheckCircle size={20} />
                  Détails du contrôle
                </h4>
                <div className="details-cards-grid">
                  {Object.entries(report.coherence.details).map(([key, value], index) => {
                    const cardThemes = [
                      'blue',
                      'orange', 
                      'red',
                      'purple'
                    ];
                    const theme = cardThemes[index % cardThemes.length];
                    
                    // Formater la valeur pour l'affichage
                    const formatValue = (val) => {
                      if (typeof val === 'number') {
                        return val.toLocaleString('fr-FR');
                      }
                      if (typeof val === 'string' && !isNaN(parseFloat(val))) {
                        return parseFloat(val).toLocaleString('fr-FR');
                      }
                      return val;
                    };
                    
                    return (
                      <div key={key} className={`detail-card ${theme}`}>
                        <div className="detail-card-content">
                          <div className="detail-card-header">
                            <div className="detail-card-icon">
                              {getCardIcon(key.replace(/_/g, ' '))}
                            </div>
                            <h5 className="detail-card-title">{key.replace(/_/g, ' ')}</h5>
                          </div>
                          <div className="detail-card-body">
                            <div className="detail-value">
                              {typeof value === 'object' ? (
                                <div className="detail-object">
                                  {Object.entries(value).map(([subKey, subValue]) => (
                                    <div key={subKey} className="detail-sub-item">
                                      <span className="detail-sub-key">{subKey}:</span>
                                      <span className="detail-sub-value">{formatValue(subValue)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="detail-simple-value">
                                  {formatValue(value)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TFT JSON */}
        {report.tft_json && (
          <div className="details-section">
            <div className="tft-header">
              <div className="tft-title-section">
                <h2 className="section-title">
                  <FaFileExcel size={20} />
                  Tableau de Flux de Trésorerie (TFT)
                </h2>
                <p style={{ color: '#666', margin: '4px 0 0 0' }}>
                  {Object.keys(getFilteredTftData(report.tft_json)).length} / {Object.keys(report.tft_json).length} rubriques
                </p>
              </div>
              <div className="tft-actions-section">
                <button
                  className="filter-toggle-btn"
                  onClick={() => handleTftFilterChange('showFilters', !tftFilters.showFilters)}
                >
                  🔍 Filtres
                </button>
                {report.generated_files?.find(f => f.file_type === 'TFT') && (
                  <button
                    className="export-btn tft-btn"
                    onClick={() => {
                      const tftFile = report.generated_files.find(f => f.file_type === 'TFT');
                      window.open(tftFile.download_url.startsWith('http') ? tftFile.download_url : `http://127.0.0.1:8000${tftFile.download_url}`, '_blank');
                    }}
                  >
                    <FaDownload size={12} />
                    📊 Exporter TFT Excel
                  </button>
                )}
              </div>
            </div>
            
            {tftFilters.showFilters && (
              <div className="tft-filters">
                {/* Première ligne - Filtres de base */}
                <div className="filter-row">
                  <div className="filter-group">
                    <label>🔍 Code</label>
                    <input
                      type="text"
                      placeholder="Rechercher par code..."
                      value={tftFilters.code}
                      onChange={(e) => handleTftFilterChange('code', e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label>💰 Montant Min</label>
                    <input
                      type="number"
                      placeholder="Montant minimum"
                      value={tftFilters.montant.min}
                      onChange={(e) => handleTftFilterChange('montant', { ...tftFilters.montant, min: e.target.value })}
                    />
                  </div>
                  <div className="filter-group">
                    <label>💰 Montant Max</label>
                    <input
                      type="number"
                      placeholder="Montant maximum"
                      value={tftFilters.montant.max}
                      onChange={(e) => handleTftFilterChange('montant', { ...tftFilters.montant, max: e.target.value })}
                    />
                  </div>
                  <div className="filter-group">
                    <label>📋 Comptes</label>
                    <input
                      type="text"
                      placeholder="Rechercher dans les comptes..."
                      value={tftFilters.comptes.search}
                      onChange={(e) => handleTftFilterChange('comptes', { ...tftFilters.comptes, search: e.target.value })}
                    />
                  </div>
                </div>

                {/* Deuxième ligne - Filtres financiers */}
                <div className="filter-row">
                  <div className="filter-group">
                    <label>📈 Type de Flux</label>
                    <select
                      value={tftFilters.fluxType}
                      onChange={(e) => handleTftFilterChange('fluxType', e.target.value)}
                    >
                      <option value="all">Tous</option>
                      <option value="positive">Positifs</option>
                      <option value="negative">Négatifs</option>
                      <option value="zero">Zéro</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>📊 Seuil de Montant</label>
                    <select
                      value={tftFilters.montantSeuil}
                      onChange={(e) => handleTftFilterChange('montantSeuil', e.target.value)}
                    >
                      <option value="all">Tous</option>
                      <option value="tres-eleve">Très élevé (≥80%)</option>
                      <option value="eleve">Élevé (≥50%)</option>
                      <option value="moyen">Moyen (≥20%)</option>
                      <option value="faible">Faible (&lt;20%)</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>🏷️ Classe de Flux</label>
                    <select
                      value={tftFilters.classeFlux}
                      onChange={(e) => handleTftFilterChange('classeFlux', e.target.value)}
                    >
                      <option value="all">Toutes</option>
                      <option value="operationnel">Opérationnel</option>
                      <option value="investissement">Investissement</option>
                      <option value="financement">Financement</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>💸 Nature de Flux</label>
                    <select
                      value={tftFilters.natureFlux}
                      onChange={(e) => handleTftFilterChange('natureFlux', e.target.value)}
                    >
                      <option value="all">Toutes</option>
                      <option value="encaissement">Encaissement</option>
                      <option value="decaissement">Décaissement</option>
                      <option value="neutre">Neutre</option>
                    </select>
                  </div>
                </div>

                {/* Troisième ligne - Filtres par comptes */}
                <div className="filter-row">
                  <div className="filter-group">
                    <label>🔢 Nombre de Comptes</label>
                    <select
                      value={tftFilters.nombreComptes}
                      onChange={(e) => handleTftFilterChange('nombreComptes', e.target.value)}
                    >
                      <option value="all">Tous</option>
                      <option value="aucun">Aucun</option>
                      <option value="peu">Peu (1-3)</option>
                      <option value="moyen">Moyen (4-10)</option>
                      <option value="beaucoup">Beaucoup (&gt;10)</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>🏦 Type de Comptes</label>
                    <select
                      value={tftFilters.typeComptes}
                      onChange={(e) => handleTftFilterChange('typeComptes', e.target.value)}
                    >
                      <option value="all">Tous</option>
                      <option value="clients">Clients</option>
                      <option value="fournisseurs">Fournisseurs</option>
                      <option value="banques">Banques</option>
                      <option value="charges">Charges</option>
                      <option value="produits">Produits</option>
                      <option value="immobilisations">Immobilisations</option>
                      <option value="autres">Autres</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>⚡ Activité des Comptes</label>
                    <select
                      value={tftFilters.activiteComptes}
                      onChange={(e) => handleTftFilterChange('activiteComptes', e.target.value)}
                    >
                      <option value="all">Tous</option>
                      <option value="actifs">Actifs</option>
                      <option value="moderement-actifs">Modérément actifs</option>
                      <option value="inactifs">Inactifs</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>🎯 Impact</label>
                    <select
                      value={tftFilters.impact}
                      onChange={(e) => handleTftFilterChange('impact', e.target.value)}
                    >
                      <option value="all">Tous</option>
                      <option value="significatif">Significatif (≥50%)</option>
                      <option value="modere">Modéré (≥20%)</option>
                      <option value="mineur">Mineur (&lt;20%)</option>
                    </select>
                  </div>
                </div>

                {/* Quatrième ligne - Tri et actions */}
                <div className="filter-row">
                  <div className="filter-group">
                    <label>🔄 Trier par</label>
                    <select
                      value={tftFilters.tri.critere}
                      onChange={(e) => handleTftFilterChange('tri', { ...tftFilters.tri, critere: e.target.value })}
                    >
                      <option value="code">Code</option>
                      <option value="montant">Montant</option>
                      <option value="nombre_comptes">Nombre de comptes</option>
                      <option value="impact">Impact</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>📊 Ordre</label>
                    <select
                      value={tftFilters.tri.ordre}
                      onChange={(e) => handleTftFilterChange('tri', { ...tftFilters.tri, ordre: e.target.value })}
                    >
                      <option value="asc">Croissant</option>
                      <option value="desc">Décroissant</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <button className="reset-filters-btn" onClick={resetTftFilters}>
                      🗑️ Réinitialiser
                    </button>
                  </div>
                  <div className="filter-group">
                    <button className="save-filters-btn" onClick={saveTftFilters}>
                      💾 Sauvegarder
                    </button>
                  </div>
                  <div className="filter-group">
                    <button className="load-filters-btn" onClick={loadTftFilters}>
                      📂 Charger
                    </button>
                  </div>
                  <div className="filter-group">
                    <div className="filter-stats">
                      <span className="filter-count">
                        {Object.keys(getFilteredTftData(report.tft_json)).length} / {Object.keys(report.tft_json).length} rubriques
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Graphiques TFT */}
            <div className="tft-visualizations">
              <TFTCharts 
                tftData={getFilteredTftData(report.tft_json)} 
                title="Visualisations du Tableau de Flux de Trésorerie"
              />
            </div>
            
            <div className="tft-content">
              {renderTFTAsTable(getFilteredTftData(report.tft_json), 'Données TFT')}
            </div>
          </div>
        )}

        {/* Feuilles maîtresses */}
        {report.feuilles_maitresses_json && Object.entries(report.feuilles_maitresses_json).map(([groupName, groupData]) => {
          const getAccountsCount = () => {
            if (groupData.exercice_n && Array.isArray(groupData.exercice_n)) {
              return groupData.exercice_n.length;
            }
            if (groupData.comptes_n && Array.isArray(groupData.comptes_n)) {
              return groupData.comptes_n.length;
            }
            return 1;
          };

          const accountsCount = getAccountsCount();
          const hasTwoExercices = groupData.has_two_exercices;
          const exercicesInfo = groupData.exercices ? groupData.exercices.join(' / ') : '';
          
          // Vérifier si les données sont dans le nouveau format
          const isNewFormat = groupData && (
            groupData.has_two_exercices !== undefined ||
            groupData.exercice_n ||
            groupData.exercice_n1 ||
            groupData.comparatif
          );
          
          return (
            <div key={groupName} className="details-section">
              <div 
                className="expandable-header"
                onClick={() => toggleFileExpansion(`feuille_${report.id}_${groupName}`)}
              >
                <div className="expandable-title">
                  <FaFileExcel size={16} color="#ff9800" />
                  <div>
                    <h3>{groupName}</h3>
                    <p>
                      {accountsCount} compte{accountsCount > 1 ? 's' : ''}
                      {hasTwoExercices && exercicesInfo && ` • Exercices ${exercicesInfo}`}
                      {hasTwoExercices && ' • Comparatif disponible'}
                    </p>
                  </div>
                </div>
                {expandedFiles[`feuille_${report.id}_${groupName}`] ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
              </div>
              
              {expandedFiles[`feuille_${report.id}_${groupName}`] && (
                <div className="expandable-content">
                  {renderSingleFeuilleMaitresse(groupName, groupData)}
                  
                  {/* Section commentaires - seulement pour l'ancien format */}
                  {!isNewFormat && report.generated_files?.filter(f => f.file_type === 'feuille_maitresse' && f.group_name === groupName).map(file => (
                    <CommentSection
                      key={file.id}
                      generatedFileId={file.id}
                      groupName={groupName}
                      initialComment={file.comment}
                      onCommentUpdate={(newComment) => handleCommentUpdate(groupName, newComment)}
                    />
                  ))}
                  
                  <div className="export-buttons">
                    {report.generated_files?.filter(f => f.file_type === 'feuille_maitresse' && f.group_name === groupName).map(file => (
                      <button
                        key={file.download_url}
                        className="export-btn feuille-btn"
                        onClick={() => window.open(file.download_url.startsWith('http') ? file.download_url : `http://127.0.0.1:8000${file.download_url}`, '_blank')}
                      >
                        <FaDownload size={12} />
                        📋 Exporter {groupName}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Message d'erreur si présent */}
        {report.error_message && (
          <div className="details-section error-section">
            <h2 className="section-title error-title">
              <MdError size={20} />
              Message d'erreur
            </h2>
            <div className="error-content">
              {report.error_message}
            </div>
          </div>
        )}

        {/* Modal des comptes */}
        {accountsModal.isOpen && (
          <div className="modal-overlay" onClick={closeAccountsModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  📋 Comptes - {accountsModal.code}
                </h3>
                <button className="modal-close" onClick={closeAccountsModal}>
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                {/* Contrôles de tri et filtrage */}
                <div className="accounts-controls">
                  <input
                    type="text"
                    className="accounts-search"
                    placeholder="Rechercher un compte..."
                    value={accountsFilters.search}
                    onChange={(e) => handleAccountsFilterChange('search', e.target.value)}
                  />
                  <select
                    className="accounts-sort"
                    value={accountsFilters.sortBy}
                    onChange={(e) => handleAccountsFilterChange('sortBy', e.target.value)}
                  >
                    <option value="account_number">Numéro</option>
                    <option value="account_label">Libellé</option>
                    <option value="balance">Solde</option>
                    <option value="entries_count">Écritures</option>
                  </select>
                  <select
                    className="accounts-sort"
                    value={accountsFilters.sortOrder}
                    onChange={(e) => handleAccountsFilterChange('sortOrder', e.target.value)}
                  >
                    <option value="asc">Croissant</option>
                    <option value="desc">Décroissant</option>
                  </select>
                  <select
                    className="accounts-sort"
                    value={accountsFilters.filterBy}
                    onChange={(e) => handleAccountsFilterChange('filterBy', e.target.value)}
                  >
                    <option value="all">Tous</option>
                    <option value="positive">Positifs</option>
                    <option value="negative">Négatifs</option>
                    <option value="zero">Zéro</option>
                  </select>
                </div>

                {/* Résumé des comptes avec métriques avancées */}
                <div className="accounts-summary">
                  {(() => {
                    const totalBalance = accountsModal.accounts.reduce((sum, compte) => sum + (compte.balance || 0), 0);
                    const positiveAccounts = accountsModal.accounts.filter(c => (c.balance || 0) > 0);
                    const negativeAccounts = accountsModal.accounts.filter(c => (c.balance || 0) < 0);
                    const zeroAccounts = accountsModal.accounts.filter(c => (c.balance || 0) === 0);
                    const totalEntries = accountsModal.accounts.reduce((sum, compte) => sum + (compte.entries_count || 0), 0);
                    const avgBalance = accountsModal.accounts.length > 0 ? totalBalance / accountsModal.accounts.length : 0;
                    const filteredCount = getFilteredAndSortedAccounts(accountsModal.accounts).length;
                    
                    return (
                      <>
                        <div className="summary-item">
                          <span>💰 Total:</span>
                          <span className="summary-value">
                            {new Intl.NumberFormat('fr-FR', { 
                              style: 'currency', 
                              currency: 'XOF',
                              minimumFractionDigits: 0 
                            }).format(totalBalance)}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span>📈 Positifs:</span>
                          <span className="summary-value">
                            {positiveAccounts.length} ({((positiveAccounts.length / accountsModal.accounts.length) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="summary-item">
                          <span>📉 Négatifs:</span>
                          <span className="summary-value">
                            {negativeAccounts.length} ({((negativeAccounts.length / accountsModal.accounts.length) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="summary-item">
                          <span>⚖️ Zéro:</span>
                          <span className="summary-value">
                            {zeroAccounts.length} ({((zeroAccounts.length / accountsModal.accounts.length) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="summary-item">
                          <span>📝 Écritures:</span>
                          <span className="summary-value">
                            {totalEntries.toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span>📊 Moyenne:</span>
                          <span className="summary-value">
                            {new Intl.NumberFormat('fr-FR', { 
                              style: 'currency', 
                              currency: 'XOF',
                              minimumFractionDigits: 0 
                            }).format(avgBalance)}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span>🔍 Filtrés:</span>
                          <span className="summary-value">
                            {filteredCount} / {accountsModal.accounts.length}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Liste des comptes filtrés et triés */}
                <div className="accounts-list-modal">
                  {getFilteredAndSortedAccounts(accountsModal.accounts).map((compte, index) => {
                    const getAccountType = (accountNumber) => {
                      if (!accountNumber) return 'autres';
                      const num = accountNumber.toString();
                      if (num.startsWith('411') || num.startsWith('412')) return 'clients';
                      if (num.startsWith('401') || num.startsWith('402')) return 'fournisseurs';
                      if (num.startsWith('512') || num.startsWith('513')) return 'banques';
                      if (num.startsWith('6')) return 'charges';
                      if (num.startsWith('7')) return 'produits';
                      if (num.startsWith('2')) return 'immobilisations';
                      return 'autres';
                    };

                    const getAccountIcon = (accountNumber) => {
                      const type = getAccountType(accountNumber);
                      const icons = {
                        clients: '👥',
                        fournisseurs: '🏢',
                        banques: '🏦',
                        charges: '📉',
                        produits: '📈',
                        immobilisations: '🏗️',
                        autres: '📊'
                      };
                      return icons[type] || '📊';
                    };

                    const getActivityLevel = (entriesCount) => {
                      if (!entriesCount) return 'no-activity';
                      if (entriesCount > 50) return 'high-activity';
                      if (entriesCount > 10) return 'medium-activity';
                      return 'low-activity';
                    };

                    const balance = compte.balance || 0;
                    const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'zero';
                    const activityLevel = getActivityLevel(compte.entries_count);
                    const accountType = getAccountType(compte.account_number);
                    const maxBalance = Math.max(...accountsModal.accounts.map(c => Math.abs(c.balance || 0)));
                    const balancePercentage = maxBalance > 0 ? (Math.abs(balance) / maxBalance) * 100 : 0;
                    
                    // Métriques avancées pour le compte
                    const isHighValue = Math.abs(balance) > (maxBalance * 0.5);
                    const isActive = (compte.entries_count || 0) > 10;
                    const isRecent = compte.created_at && new Date(compte.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    const riskLevel = balance < 0 && Math.abs(balance) > (maxBalance * 0.3) ? 'high' : 
                                    balance < 0 ? 'medium' : 'low';

                    return (
                      <div key={compte.id || index} className="account-item">
                        <div className={`account-icon ${accountType}`}>
                          {getAccountIcon(compte.account_number)}
                        </div>
                        
                        <div className="account-details">
                          <div className="account-number">
                            {compte.account_number}
                          </div>
                          <div className="account-label">
                            {compte.account_label}
                          </div>
                          <div className="account-meta">
                            <div className={`account-balance ${balanceClass}`}>
                              {new Intl.NumberFormat('fr-FR', { 
                                style: 'currency', 
                                currency: 'XOF',
                                minimumFractionDigits: 0 
                              }).format(balance)}
                            </div>
                            {compte.entries_count && (
                              <div className="account-entries">
                                <span className="account-entries-icon">📝</span>
                                <span>{compte.entries_count}</span>
                              </div>
                            )}
                          </div>
                          <div className="balance-bar">
                            <div 
                              className={`balance-fill ${balanceClass}`}
                              style={{ width: `${balancePercentage}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="account-indicators">
                          <div className={`account-indicator ${activityLevel}`}></div>
                          {isHighValue && <div className="account-indicator high-value" title="Valeur élevée">💎</div>}
                          {isActive && <div className="account-indicator active" title="Compte actif">⚡</div>}
                          {isRecent && <div className="account-indicator recent" title="Créé récemment">🆕</div>}
                          <div className={`account-indicator risk-${riskLevel}`} title={`Risque ${riskLevel}`}></div>
                        </div>

                        <div className="account-tooltip">
                          <div><strong>{accountType}</strong></div>
                          <div>Écritures: {compte.entries_count || 0}</div>
                          <div>Activité: {activityLevel.replace('-', ' ')}</div>
                          {isHighValue && <div>💎 Valeur élevée</div>}
                          {isActive && <div>⚡ Actif</div>}
                          {isRecent && <div>🆕 Récent</div>}
                          <div>Risque: {riskLevel}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DetailsPage;
