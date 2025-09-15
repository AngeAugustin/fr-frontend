


import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import { FaHistory, FaFileAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaDownload, FaEye, FaChevronDown, FaChevronUp, FaTable, FaFileExcel } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import './HistoryPage.css';
import ContextMenu from '../components/ContextMenu';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20); // Nombre d'éléments par page
  const [loadingMore, setLoadingMore] = useState(false);

  // Filtres
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [expandedFiles, setExpandedFiles] = useState({});
  const [viewMode, setViewMode] = useState('table'); // 'table' ou 'cards'

  // Fonction pour compter les résultats filtrés
  const getFilteredHistory = () => {
    return history.filter(item => {
      // Filtre période
      const startOk = !periodStart || item.start_date >= periodStart;
      const endOk = !periodEnd || item.end_date <= periodEnd;
      // Filtre date upload
      const uploadOk = !uploadDate || item.uploaded_at.slice(0,10) === uploadDate;
      // Filtre statut
      const statusOk = !statusFilter || (() => {
        const status = typeof item.status === 'string' ? item.status.toLowerCase() : item.status;
        switch (statusFilter) {
          case 'success':
            return status === 'ok' || status === 'success';
          case 'error':
            return status === 'error' || status === 'failed';
          case 'pending':
            return status === 'pending';
          default:
            return true;
        }
      })();
      // Filtre texte
      const search = searchText.trim().toLowerCase();
      const textOk = !search ||
        item.id.toString().includes(search) ||
        (item.file && item.file.toLowerCase().includes(search)) ||
        (item.start_date && item.start_date.includes(search)) ||
        (item.end_date && item.end_date.includes(search));
      return startOk && endOk && uploadOk && statusOk && textOk;
    });
  };

  const filteredHistory = getFilteredHistory();
  const hasActiveFilters = periodStart || periodEnd || uploadDate || statusFilter || searchText.trim();

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setPeriodStart('');
    setPeriodEnd('');
    setUploadDate('');
    setStatusFilter('');
    setSearchText('');
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

  // Fonction pour rendre une carte d'historique
  const renderHistoryCard = (item) => {
    const hasGeneratedFiles = item.generated_files && item.generated_files.length > 0;
    const generatedFilesCount = hasGeneratedFiles ? item.generated_files.length : 0;
    
    return (
      <div key={item.id} className="history-card">
        <div className="history-card-header">
          <div className="history-card-id">
            <FaFileAlt size={16} />
            <span>Rapport #{item.id}</span>
          </div>
          {renderStatus(item)}
        </div>
        
        <div className="history-card-content">
          <div className="history-card-info">
            <div className="info-row">
              <span className="info-label">
                <FaDownload size={14} />
                Fichier
              </span>
              <span className="info-value">
                {item.file ? item.file.split('/').pop() : 'Non spécifié'}
              </span>
            </div>
            
            <div className="info-row">
              <span className="info-label">
                <FaCalendarAlt size={14} />
                Période
              </span>
              <span className="info-value">
                {item.start_date} - {item.end_date}
              </span>
            </div>
            
            <div className="info-row">
              <span className="info-label">
                <FaCalendarAlt size={14} />
                Upload
              </span>
              <span className="info-value">
                {new Date(item.uploaded_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
            
            {item.coherence && (
              <div className="info-row">
                <span className="info-label">
                  <FaCheckCircle size={14} />
                  Cohérence
                </span>
                <span className={`info-value ${item.coherence.is_coherent ? 'coherent' : 'incoherent'}`}>
                  {item.coherence.is_coherent ? 'Cohérent' : 'Non cohérent'}
                </span>
              </div>
            )}
          </div>
          
          <div className="history-card-actions">
            <div className="generated-files-info">
              <span className="files-count">
                {generatedFilesCount} fichier{generatedFilesCount > 1 ? 's' : ''} généré{generatedFilesCount > 1 ? 's' : ''}
              </span>
            </div>
            
            <button
              className="view-details-btn"
              onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
              title="Voir les détails"
            >
              <FaEye size={16} />
              Voir détails
            </button>
          </div>
        </div>
        
        {item.error_message && (
          <div className="history-card-error">
            <MdError size={16} />
            <span>{item.error_message}</span>
          </div>
        )}
      </div>
    );
  };

  // Fonction de chargement paginée
  const fetchHistory = async (page = 1, append = false) => {
    if (!append) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');
    
    try {
      // Construire l'URL avec les paramètres de pagination
      const url = new URL('http://127.0.0.1:8000/api/reports/balance-history/');
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', itemsPerPage.toString());
      
      const res = await fetch(url.toString());
      
      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.error || errorData.detail || `Erreur ${res.status}: ${res.statusText}`;
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }
      
      const data = await res.json();
      
      // Gérer la réponse paginée ou non-paginée
      if (data.history) {
        // Format non-paginé (rétrocompatibilité)
        const allHistory = data.history;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageHistory = allHistory.slice(startIndex, endIndex);
        
        if (append) {
          setHistory(prev => [...prev, ...pageHistory]);
        } else {
          setHistory(pageHistory);
          setTotalItems(allHistory.length);
          setTotalPages(Math.ceil(allHistory.length / itemsPerPage));
        }
        
        if (pageHistory.length === 0 && !append) {
          toast.info('Aucun historique trouvé.');
        }
      } else if (data.data) {
        // Format paginé (nouveau format API)
        if (append) {
          setHistory(prev => [...prev, ...data.data]);
        } else {
          setHistory(data.data);
        }
        setTotalItems(data.total || data.data.length);
        setTotalPages(data.totalPages || Math.ceil((data.total || data.data.length) / itemsPerPage));
        
        if (data.data.length === 0 && !append) {
          toast.info('Aucun historique trouvé.');
        }
      } else {
        setError('Format de réponse invalide.');
        toast.error('Format de réponse invalide.');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la récupération de l\'historique.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
    
    setLoading(false);
    setLoadingMore(false);
  };

  // Chargement initial
  useEffect(() => {
    fetchHistory(1);
  }, []);

  // Fonction pour charger une page spécifique
  const loadPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      fetchHistory(page);
    }
  };

  // Fonction pour charger plus d'éléments (infinite scroll)
  const loadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchHistory(nextPage, true); // append = true
    }
  };

  // Fonction pour basculer l'état d'expansion d'un fichier
  const toggleFileExpansion = (fileKey) => {
    setExpandedFiles(prev => ({
      ...prev,
      [fileKey]: !prev[fileKey]
    }));
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
      <div style={{ marginTop: 16 }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: 16 }}>{title}</h4>
        <div style={{ overflowX: 'auto', border: '1px solid #e3e7ed', borderRadius: 4 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
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
                            <div style={{ fontSize: '11px' }}>
                              <div 
                                style={{ 
                                  cursor: 'pointer', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  fontWeight: 600,
                                  color: '#1800ad'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const accordionId = `comptes_${code}_${prop}`;
                                  const accordion = document.getElementById(accordionId);
                                  if (accordion) {
                                    accordion.style.display = accordion.style.display === 'none' ? 'block' : 'none';
                                  }
                                }}
                              >
                                📋 Comptes ({cellValue.length}) ▼
                              </div>
                              <div 
                                id={`comptes_${code}_${prop}`}
                                style={{ 
                                  display: 'none', 
                                  marginTop: '8px', 
                                  padding: '8px', 
                                  background: '#f8f9fa', 
                                  borderRadius: '4px',
                                  border: '1px solid #e3e7ed'
                                }}
                              >
                                {cellValue.map((compte, index) => (
                                  <div key={compte.id || index} style={{ 
                                    marginBottom: index < cellValue.length - 1 ? '6px' : '0',
                                    paddingBottom: index < cellValue.length - 1 ? '6px' : '0',
                                    borderBottom: index < cellValue.length - 1 ? '1px solid #e0e0e0' : 'none'
                                  }}>
                                    <div style={{ fontWeight: 600, color: '#333', fontSize: '10px' }}>
                                      {compte.account_number} - {compte.account_label}
                                    </div>
                                    <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
                                      Solde: <span style={{ 
                                        fontWeight: 600, 
                                        color: compte.balance >= 0 ? '#28a745' : '#dc3545' 
                                      }}>
                                        {new Intl.NumberFormat('fr-FR', { 
                                          style: 'currency', 
                                          currency: 'XOF',
                                          minimumFractionDigits: 0 
                                        }).format(compte.balance)}
                                      </span>
                                      {compte.entries_count && (
                                        <span style={{ marginLeft: '8px' }}>
                                          | Écritures: {compte.entries_count}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
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

  // Fonction pour rendre une seule feuille maîtresse
  const renderSingleFeuilleMaitresse = (groupName, groupData) => {
    // Colonnes Excel selon l'image fournie
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
      <div style={{ overflowX: 'auto', border: '1px solid #d0d0d0', borderRadius: 4 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
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

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <MainContent>
        <ToastContainer position="top-right" autoClose={4000} />
        <h1 className="generate-title">Historique des uploads</h1>
        <p className="generate-subtitle">Consultez l'historique des uploads de fichiers CSV et des rapports générés.</p>
        {loading && (
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
              <p style={{ color: '#666', margin: 0 }}>Chargement de l'historique...</p>
            </div>
          </div>
        )}
        {error && <div className="status-error"><MdError size={20} /> {error}</div>}
        {!loading && !error && (
          <div>
            {/* En-tête avec compteur de résultats */}
            <div className="results-header">
              <div className="results-info">
                <h2 className="results-title">
                  Résultats de l'historique
                  <span className="results-count">
                    {filteredHistory.length} résultat{filteredHistory.length > 1 ? 's' : ''}
                    {totalItems > 0 && (
                      <span className="results-total"> sur {totalItems}</span>
                    )}
                  </span>
                </h2>
                
                {/* Informations de pagination */}
                {totalPages > 1 && (
                  <div className="pagination-info">
                    <span className="page-indicator">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <span className="items-per-page">
                      {itemsPerPage} éléments par page
                    </span>
                  </div>
                )}
                
                {/* Toggle de vue */}
                <div className="view-toggle">
                  <span className="view-toggle-label">Vue :</span>
                  <div className="view-toggle-buttons">
                    <button 
                      className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setViewMode('table')}
                      title="Vue tableau"
                    >
                      <FaTable size={16} />
                      Tableau
                    </button>
                    <button 
                      className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                      onClick={() => setViewMode('cards')}
                      title="Vue cartes"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <rect x="3" y="8" width="18" height="8" rx="1" fill="currentColor" opacity="0.1"/>
                      </svg>
                      Cartes
                    </button>
                  </div>
                </div>
                {hasActiveFilters && (
                  <div className="active-filters">
                    <span className="active-filters-label">Filtres actifs :</span>
                    <div className="active-filters-list">
                      {periodStart && (
                        <span className="filter-badge">
                          Début: {new Date(periodStart).toLocaleDateString('fr-FR')}
                          <button onClick={() => setPeriodStart('')} className="filter-badge-remove">×</button>
                        </span>
                      )}
                      {periodEnd && (
                        <span className="filter-badge">
                          Fin: {new Date(periodEnd).toLocaleDateString('fr-FR')}
                          <button onClick={() => setPeriodEnd('')} className="filter-badge-remove">×</button>
                        </span>
                      )}
                      {uploadDate && (
                        <span className="filter-badge">
                          Upload: {new Date(uploadDate).toLocaleDateString('fr-FR')}
                          <button onClick={() => setUploadDate('')} className="filter-badge-remove">×</button>
                        </span>
                      )}
                      {statusFilter && (
                        <span className="filter-badge">
                          Statut: {statusFilter === 'success' ? 'Succès' : statusFilter === 'error' ? 'Erreur' : statusFilter === 'pending' ? 'En attente' : statusFilter}
                          <button onClick={() => setStatusFilter('')} className="filter-badge-remove">×</button>
                        </span>
                      )}
                      {searchText.trim() && (
                        <span className="filter-badge">
                          Recherche: "{searchText}"
                          <button onClick={() => setSearchText('')} className="filter-badge-remove">×</button>
                        </span>
                      )}
                    </div>
                    <button onClick={resetFilters} className="reset-filters-btn">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M4 12a8 8 0 0 1 8-8V2l4 4-4 4V8a6 6 0 1 0 6 6h2a8 8 0 0 1-16 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Réinitialiser
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Barre de recherche et filtres sur une seule ligne */}
            <div className="history-filters">
              {/* Champ de recherche */}
              <div className="filter-group">
                <label className="filter-label" htmlFor="search-input">Rechercher</label>
                <div className="filter-input-wrapper">
                  <span className="filter-icon">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#888" strokeWidth="2"/><path d="M20 20l-4-4" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
                  </span>
                  <input
                    id="search-input"
                    className="filter-input"
                    type="text"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder="Rechercher par ID, fichier, période..."
                  />
                </div>
              </div>
              {/* Champ période début */}
              <div className="filter-group">
                <label className="filter-label" htmlFor="period-start">Date de début</label>
                <div className="filter-input-wrapper">
                  <span className="filter-icon">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3" stroke="#888" strokeWidth="2"/><path d="M16 3v4M8 3v4" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
                  </span>
                  <input
                    id="period-start"
                    className="filter-input filter-date-input"
                    type="date"
                    value={periodStart}
                    onChange={e => setPeriodStart(e.target.value)}
                    placeholder="jj/mm/aaaa"
                  />
                </div>
              </div>
              {/* Champ période fin */}
              <div className="filter-group">
                <label className="filter-label" htmlFor="period-end">Date de fin</label>
                <div className="filter-input-wrapper">
                  <span className="filter-icon">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3" stroke="#888" strokeWidth="2"/><path d="M16 3v4M8 3v4" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
                  </span>
                  <input
                    id="period-end"
                    className="filter-input filter-date-input"
                    type="date"
                    value={periodEnd}
                    onChange={e => setPeriodEnd(e.target.value)}
                    placeholder="jj/mm/aaaa"
                  />
                </div>
              </div>
              {/* Champ date d'upload */}
              <div className="filter-group">
                <label className="filter-label" htmlFor="upload-date">Date d’upload</label>
                <div className="filter-input-wrapper">
                  <span className="filter-icon">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3" stroke="#888" strokeWidth="2"/><path d="M16 3v4M8 3v4" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
                  </span>
                  <input
                    id="upload-date"
                    className="filter-input filter-date-input"
                    type="date"
                    value={uploadDate}
                    onChange={e => setUploadDate(e.target.value)}
                    placeholder="jj/mm/aaaa"
                  />
                </div>
              </div>
              {/* Champ statut */}
              <div className="filter-group">
                <label className="filter-label" htmlFor="status-filter">Statut</label>
                <div className="filter-input-wrapper">
                  <span className="filter-icon">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#888" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
                  </span>
                  <select
                    id="status-filter"
                    className="filter-select"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tous</option>
                    <option value="success">Succès</option>
                    <option value="error">Erreur</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Affichage des données filtrées */}
            {history.length === 0 ? (
              <div className="no-data-message">
                <div className="no-data-icon">
                  <FaFileAlt size={48} color="#ccc" />
                </div>
                <h3>Aucun upload trouvé</h3>
                <p>Il n'y a actuellement aucun historique d'upload dans le système.</p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="no-results-message">
                <div className="no-results-icon">
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" stroke="#ccc" strokeWidth="2"/>
                    <path d="M20 20l-4-4" stroke="#ccc" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M11 8v6M8 11h6" stroke="#ccc" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>Aucun résultat trouvé</h3>
                <p>Aucun élément ne correspond aux critères de recherche actuels.</p>
                <button onClick={resetFilters} className="reset-filters-btn-large">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path d="M4 12a8 8 0 0 1 8-8V2l4 4-4 4V8a6 6 0 1 0 6 6h2a8 8 0 0 1-16 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'table' ? (
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th><FaFileAlt /> ID</th>
                        <th><FaDownload /> Fichier</th>
                        <th><FaCalendarAlt /> Période</th>
                        <th><FaCalendarAlt /> Date d'upload</th>
                        <th>Status</th>
                        <th>Fichiers générés</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map(item => (
                    <tr
                      key={item.id}
                      className={openMenuId === item.id ? 'history-row-active' : ''}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={e => {
                        if (e.target.closest('.eye-icon')) {
                          e.currentTarget.classList.add('history-row-hover');
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.classList.remove('history-row-hover');
                      }}
                    >
                      <td>{item.id}</td>
                      <td>
                        {item.file ? item.file.split('/').pop() : ''}
                      </td>
                      <td>{item.start_date} - {item.end_date}</td>
                      <td className="upload-date"><FaCalendarAlt /> {new Date(item.uploaded_at).toLocaleDateString()}</td>
                      <td>
                        {(() => {
                          const status = typeof item.status === 'string' ? item.status.toLowerCase() : item.status;
                          if (status === 'ok' || status === 'success') {
                            return <span className="status-ok"><FaCheckCircle title="Succès" /></span>;
                          } else if (status === 'error' || status === 'failed') {
                            return <span className="status-error"><FaTimesCircle title="Erreur" /></span>;
                          } else if (status === 'pending') {
                            return <span style={{ color: '#888', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><FaHistory title="En attente" /></span>;
                          } else {
                            return <span style={{ color: '#888', fontWeight: 600 }} title={item.status}><FaFileAlt /></span>;
                          }
                        })()}
                        {item.error_message && (
                          <span style={{ marginLeft: 8 }}>
                            <MdError title="Erreur" />
                          </span>
                        )}
                      </td>
                      <td style={{ position: 'relative' }}>
                        <span
                          className="eye-icon"
                          style={{ display: 'inline-block' }}
                          onMouseEnter={e => {
                            e.currentTarget.closest('tr').classList.add('history-row-hover');
                          }}
                          onMouseLeave={e => {
                            if (openMenuId !== item.id) {
                              e.currentTarget.closest('tr').classList.remove('history-row-hover');
                            }
                          }}
                        >
                          <button
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              outline: 'none',
                            }}
                            title="Voir les fichiers générés"
                            onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                          >
                            <FaEye size={22} color="#4f6af7" />
                          </button>
                        </span>
                        {openMenuId === item.id && (
                          <ContextMenu open={true} onClose={() => setOpenMenuId(null)}>
                            <div style={{ fontWeight: 600, marginBottom: 16, color: '#3a3a4d', fontSize: 18 }}>Détails du rapport #{item.id}</div>
                            
                            {/* Contrôle de cohérence - Affichage en cartes */}
                            {item.coherence && (
                              <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: item.coherence.is_coherent ? '#28a745' : '#dc3545', marginRight: 8 }}>
                                    <FaCheckCircle size={14} color="#fff" />
                                  </span>
                                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#333' }}>Contrôle de cohérence</h3>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
                                  <div style={{ background: '#f8f9fa', borderRadius: 4, padding: 8, border: '1px solid #e3e7ed' }}>
                                    <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: 11, fontWeight: 600 }}>Variation TFT</h4>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1800ad' }}>
                                      {new Intl.NumberFormat('fr-FR', { 
                                        style: 'currency', 
                                        currency: 'XOF',
                                        minimumFractionDigits: 0 
                                      }).format(item.coherence.variation_tft || 0)}
                                    </div>
                                  </div>
                                  
                                  <div style={{ background: '#f8f9fa', borderRadius: 4, padding: 8, border: '1px solid #e3e7ed' }}>
                                    <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: 11, fontWeight: 600 }}>Variation Trésorerie</h4>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1800ad' }}>
                                      {new Intl.NumberFormat('fr-FR', { 
                                        style: 'currency', 
                                        currency: 'XOF',
                                        minimumFractionDigits: 0 
                                      }).format(item.coherence.variation_treso || 0)}
                                    </div>
                                  </div>
                                  
                                  <div style={{ background: '#f8f9fa', borderRadius: 4, padding: 8, border: '1px solid #e3e7ed' }}>
                                    <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: 11, fontWeight: 600 }}>Statut</h4>
                                    <div style={{ 
                                      fontSize: 12, 
                                      fontWeight: 600, 
                                      color: item.coherence.is_coherent ? '#28a745' : '#dc3545',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}>
                                      <FaCheckCircle size={10} />
                                      {item.coherence.is_coherent ? 'Cohérent' : 'Non cohérent'}
                                    </div>
                                  </div>
                                </div>
                                
                                {item.coherence.details && Object.keys(item.coherence.details).length > 0 && (
                                  <div style={{ marginTop: 12 }}>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: 12 }}>Détails du contrôle</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6 }}>
                                      {Object.entries(item.coherence.details).map(([key, value]) => (
                                        <div key={key} style={{ 
                                          background: '#f8f9fa', 
                                          borderRadius: 4, 
                                          padding: 8, 
                                          border: '1px solid #e3e7ed',
                                          borderLeft: '3px solid #1800ad'
                                        }}>
                                          <h5 style={{ 
                                            margin: '0 0 4px 0', 
                                            color: '#333', 
                                            fontSize: 10, 
                                            fontWeight: 600,
                                            textTransform: 'capitalize'
                                          }}>
                                            {key.replace(/_/g, ' ')}
                                          </h5>
                                          <div style={{ 
                                            fontSize: 10, 
                                            color: '#666',
                                            wordBreak: 'break-word'
                                          }}>
                                            {typeof value === 'object' ? (
                                              <div>
                                                {Object.entries(value).map(([subKey, subValue]) => (
                                                  <div key={subKey} style={{ marginBottom: 1 }}>
                                                    <strong>{subKey}:</strong> {subValue}
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <span>{value}</span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* TFT JSON */}
                            {item.tft_json && (
                              <div style={{ marginBottom: 16 }}>
                                <div 
                                  style={{ 
                                    background: '#f8f9fa', 
                                    borderRadius: 4, 
                                    padding: 8, 
                                    border: '1px solid #e3e7ed',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                  }}
                                  onClick={() => toggleFileExpansion(`tft_${item.id}`)}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <FaFileExcel size={14} color="#1800ad" style={{ marginRight: 6 }} />
                                    <div>
                                      <h3 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#333' }}>Tableau de Flux de Trésorerie (TFT)</h3>
                                      <p style={{ margin: '1px 0 0 0', fontSize: 10, color: '#666' }}>
                                        {Object.keys(item.tft_json).length} rubriques
                                      </p>
                                    </div>
                                  </div>
                                  {expandedFiles[`tft_${item.id}`] ? <FaChevronUp size={12} color="#666" /> : <FaChevronDown size={12} color="#666" />}
                                </div>
                                
                                {expandedFiles[`tft_${item.id}`] && (
                                  <div style={{ marginTop: 8, padding: 12, background: '#fff', border: '1px solid #e3e7ed', borderRadius: 4 }}>
                                    {renderTFTAsTable(item.tft_json, 'Données TFT')}
                                    {item.generated_files?.find(f => f.file_type === 'TFT') && (
                                      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                                  <button
                                    style={{
                                            background: '#28a745', 
                                      color: '#fff',
                                      border: 'none',
                                            borderRadius: 3, 
                                            padding: '6px 12px', 
                                      fontWeight: 500,
                                            fontSize: 11, 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4
                                          }}
                                          onClick={() => {
                                            const tftFile = item.generated_files.find(f => f.file_type === 'TFT');
                                            window.open(tftFile.download_url.startsWith('http') ? tftFile.download_url : `http://127.0.0.1:8000${tftFile.download_url}`, '_blank');
                                          }}
                                        >
                                          <FaDownload size={10} />
                                          📊 Exporter TFT Excel
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Feuilles maîtresses - Un menu dépliant par groupe */}
                            {item.feuilles_maitresses_json && Object.entries(item.feuilles_maitresses_json).map(([groupName, groupData]) => {
                              const hasDetailedAccounts = groupData && typeof groupData === 'object' && (
                                groupData.comptes_n && Array.isArray(groupData.comptes_n) && groupData.comptes_n.length > 0
                              );
                              const accountsCount = hasDetailedAccounts ? groupData.comptes_n.length : 1;
                              
                              return (
                                <div key={groupName} style={{ marginBottom: 12 }}>
                                  <div 
                                    style={{ 
                                      background: '#f8f9fa', 
                                      borderRadius: 4, 
                                      padding: 8, 
                                      border: '1px solid #e3e7ed',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between'
                                    }}
                                    onClick={() => toggleFileExpansion(`feuille_${item.id}_${groupName}`)}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <FaFileExcel size={14} color="#ff9800" style={{ marginRight: 6 }} />
                                      <div>
                                        <h3 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#333' }}>{groupName}</h3>
                                        <p style={{ margin: '1px 0 0 0', fontSize: 10, color: '#666' }}>
                                          {accountsCount} compte{accountsCount > 1 ? 's' : ''}
                                        </p>
                                      </div>
                                    </div>
                                    {expandedFiles[`feuille_${item.id}_${groupName}`] ? <FaChevronUp size={12} color="#666" /> : <FaChevronDown size={12} color="#666" />}
                                  </div>
                                  
                                  {expandedFiles[`feuille_${item.id}_${groupName}`] && (
                                    <div style={{ marginTop: 8, padding: 12, background: '#fff', border: '1px solid #e3e7ed', borderRadius: 4 }}>
                                      {renderSingleFeuilleMaitresse(groupName, groupData)}
                                      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {item.generated_files?.filter(f => f.file_type === 'feuille_maitresse' && f.group_name === groupName).map(file => (
                                          <button
                                            key={file.download_url}
                                            style={{ 
                                              background: '#ff9800', 
                                      color: '#fff',
                                      border: 'none',
                                              borderRadius: 3, 
                                              padding: '6px 12px', 
                                      fontWeight: 500,
                                              fontSize: 11, 
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                              gap: 4
                                    }}
                                            onClick={() => window.open(file.download_url.startsWith('http') ? file.download_url : `http://127.0.0.1:8000${file.download_url}`, '_blank')}
                                  >
                                            <FaDownload size={10} />
                                            📋 Exporter {groupName}
                                  </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </ContextMenu>
                        )}
                      </td>
                    </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="history-cards-container">
                    {filteredHistory.map(item => renderHistoryCard(item))}
                  </div>
                )}
                
                {/* Composant de pagination */}
                {totalPages > 1 && (
                  <div className="pagination-container">
                    <div className="pagination-controls">
                      <button
                        className="pagination-btn pagination-btn-prev"
                        onClick={() => loadPage(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        title="Page précédente"
                      >
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Précédent
                      </button>
                      
                      <div className="pagination-pages">
                        {(() => {
                          const pages = [];
                          const maxVisiblePages = 5;
                          let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                          let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                          
                          if (endPage - startPage + 1 < maxVisiblePages) {
                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                          }
                          
                          // Bouton première page
                          if (startPage > 1) {
                            pages.push(
                              <button
                                key={1}
                                className="pagination-page"
                                onClick={() => loadPage(1)}
                                disabled={loading}
                              >
                                1
                              </button>
                            );
                            if (startPage > 2) {
                              pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
                            }
                          }
                          
                          // Pages visibles
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <button
                                key={i}
                                className={`pagination-page ${i === currentPage ? 'active' : ''}`}
                                onClick={() => loadPage(i)}
                                disabled={loading}
                              >
                                {i}
                              </button>
                            );
                          }
                          
                          // Bouton dernière page
                          if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                              pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
                            }
                            pages.push(
                              <button
                                key={totalPages}
                                className="pagination-page"
                                onClick={() => loadPage(totalPages)}
                                disabled={loading}
                              >
                                {totalPages}
                              </button>
                            );
                          }
                          
                          return pages;
                        })()}
                      </div>
                      
                      <button
                        className="pagination-btn pagination-btn-next"
                        onClick={() => loadPage(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        title="Page suivante"
                      >
                        Suivant
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                          <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    
                    {/* Bouton "Charger plus" pour UX alternative */}
                    <div className="load-more-container">
                      <button
                        className="load-more-btn"
                        onClick={loadMore}
                        disabled={currentPage === totalPages || loadingMore}
                      >
                        {loadingMore ? (
                          <>
                            <div className="loading-spinner-small"></div>
                            Chargement...
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                              <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Charger plus ({totalPages - currentPage} page{totalPages - currentPage > 1 ? 's' : ''} restante{totalPages - currentPage > 1 ? 's' : ''})
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Modal de détails - partagé entre les deux vues */}
            {openMenuId && (
              <ContextMenu open={true} onClose={() => setOpenMenuId(null)}>
                {(() => {
                  const item = filteredHistory.find(item => item.id === openMenuId);
                  if (!item) return null;
                  
                  return (
                    <>
                      <div style={{ fontWeight: 600, marginBottom: 16, color: '#3a3a4d', fontSize: 18 }}>Détails du rapport #{item.id}</div>
                      
                      {/* Contrôle de cohérence */}
                      {item.coherence && (
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: item.coherence.is_coherent ? '#28a745' : '#dc3545', marginRight: 8 }}>
                              <FaCheckCircle size={14} color="#fff" />
                            </span>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#333' }}>Contrôle de cohérence</h3>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
                            <div style={{ background: '#f8f9fa', borderRadius: 4, padding: 8, border: '1px solid #e3e7ed' }}>
                              <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: 11, fontWeight: 600 }}>Variation TFT</h4>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#1800ad' }}>
                                {new Intl.NumberFormat('fr-FR', { 
                                  style: 'currency', 
                                  currency: 'XOF',
                                  minimumFractionDigits: 0 
                                }).format(item.coherence.variation_tft || 0)}
                              </div>
                            </div>
                            
                            <div style={{ background: '#f8f9fa', borderRadius: 4, padding: 8, border: '1px solid #e3e7ed' }}>
                              <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: 11, fontWeight: 600 }}>Variation Trésorerie</h4>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#1800ad' }}>
                                {new Intl.NumberFormat('fr-FR', { 
                                  style: 'currency', 
                                  currency: 'XOF',
                                  minimumFractionDigits: 0 
                                }).format(item.coherence.variation_treso || 0)}
                              </div>
                            </div>
                            
                            <div style={{ background: '#f8f9fa', borderRadius: 4, padding: 8, border: '1px solid #e3e7ed' }}>
                              <h4 style={{ margin: '0 0 4px 0', color: '#333', fontSize: 11, fontWeight: 600 }}>Statut</h4>
                              <div style={{ 
                                fontSize: 12, 
                                fontWeight: 600, 
                                color: item.coherence.is_coherent ? '#28a745' : '#dc3545',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                <FaCheckCircle size={10} />
                                {item.coherence.is_coherent ? 'Cohérent' : 'Non cohérent'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TFT JSON */}
                      {item.tft_json && (
                        <div style={{ marginBottom: 16 }}>
                          <div 
                            style={{ 
                              background: '#f8f9fa', 
                              borderRadius: 4, 
                              padding: 8, 
                              border: '1px solid #e3e7ed',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                            onClick={() => toggleFileExpansion(`tft_${item.id}`)}
                          >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <FaFileExcel size={14} color="#1800ad" style={{ marginRight: 6 }} />
                              <div>
                                <h3 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#333' }}>Tableau de Flux de Trésorerie (TFT)</h3>
                                <p style={{ margin: '1px 0 0 0', fontSize: 10, color: '#666' }}>
                                  {Object.keys(item.tft_json).length} rubriques
                                </p>
                              </div>
                            </div>
                            {expandedFiles[`tft_${item.id}`] ? <FaChevronUp size={12} color="#666" /> : <FaChevronDown size={12} color="#666" />}
                          </div>
                          
                          {expandedFiles[`tft_${item.id}`] && (
                            <div style={{ marginTop: 8, padding: 12, background: '#fff', border: '1px solid #e3e7ed', borderRadius: 4 }}>
                              {renderTFTAsTable(item.tft_json, 'Données TFT')}
                              {item.generated_files?.find(f => f.file_type === 'TFT') && (
                                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                                  <button
                                    style={{
                                      background: '#28a745', 
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: 3, 
                                      padding: '6px 12px', 
                                      fontWeight: 500,
                                      fontSize: 11, 
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                    onClick={() => {
                                      const tftFile = item.generated_files.find(f => f.file_type === 'TFT');
                                      window.open(tftFile.download_url.startsWith('http') ? tftFile.download_url : `http://127.0.0.1:8000${tftFile.download_url}`, '_blank');
                                    }}
                                  >
                                    <FaDownload size={10} />
                                    📊 Exporter TFT Excel
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Feuilles maîtresses */}
                      {item.feuilles_maitresses_json && Object.entries(item.feuilles_maitresses_json).map(([groupName, groupData]) => {
                        const hasDetailedAccounts = groupData && typeof groupData === 'object' && (
                          groupData.comptes_n && Array.isArray(groupData.comptes_n) && groupData.comptes_n.length > 0
                        );
                        const accountsCount = hasDetailedAccounts ? groupData.comptes_n.length : 1;
                        
                        return (
                          <div key={groupName} style={{ marginBottom: 12 }}>
                            <div 
                              style={{ 
                                background: '#f8f9fa', 
                                borderRadius: 4, 
                                padding: 8, 
                                border: '1px solid #e3e7ed',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                              onClick={() => toggleFileExpansion(`feuille_${item.id}_${groupName}`)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <FaFileExcel size={14} color="#ff9800" style={{ marginRight: 6 }} />
                                <div>
                                  <h3 style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#333' }}>{groupName}</h3>
                                  <p style={{ margin: '1px 0 0 0', fontSize: 10, color: '#666' }}>
                                    {accountsCount} compte{accountsCount > 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                              {expandedFiles[`feuille_${item.id}_${groupName}`] ? <FaChevronUp size={12} color="#666" /> : <FaChevronDown size={12} color="#666" />}
                            </div>
                            
                            {expandedFiles[`feuille_${item.id}_${groupName}`] && (
                              <div style={{ marginTop: 8, padding: 12, background: '#fff', border: '1px solid #e3e7ed', borderRadius: 4 }}>
                                {renderSingleFeuilleMaitresse(groupName, groupData)}
                                <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                  {item.generated_files?.filter(f => f.file_type === 'feuille_maitresse' && f.group_name === groupName).map(file => (
                                    <button
                                      key={file.download_url}
                                      style={{ 
                                        background: '#ff9800', 
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 3, 
                                        padding: '6px 12px', 
                                        fontWeight: 500,
                                        fontSize: 11, 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                      }}
                                      onClick={() => window.open(file.download_url.startsWith('http') ? file.download_url : `http://127.0.0.1:8000${file.download_url}`, '_blank')}
                                    >
                                      <FaDownload size={10} />
                                      📋 Exporter {groupName}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  );
                })()}
              </ContextMenu>
            )}
          </div>
        )}

      {/* Section Informations importantes en bas */}
      <section className="info-section">
        <strong style={{ fontSize: '1.1rem', color: '#333' }}>Informations importantes</strong>
        <div className="info-badges">
          <span className="info-badge">Format CSV requis</span>
          <span className="info-badge info-badge-success">Validation automatique</span>
          <span className="info-badge info-badge-warning">Conforme SYSCOHADA</span>
          <span className="info-badge info-badge-error">Export Excel</span>
        </div>
        <div style={{ marginTop: 16, color: '#555', fontSize: 14, lineHeight: 1.6 }}>
          Le système traite automatiquement votre balance générale et génère un TFT complet avec toutes les rubriques SYSCOHADA. Les contrôles de cohérence sont effectués automatiquement et les fichiers d'export sont disponibles immédiatement.
        </div>
      </section>
      </MainContent>
    </div>
  );
};

export default HistoryPage;
