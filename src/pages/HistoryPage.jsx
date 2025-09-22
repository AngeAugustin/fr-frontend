


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import { FaHistory, FaFileAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaDownload, FaEye, FaTable } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import './HistoryPage.css';

const HistoryPage = () => {
  const navigate = useNavigate();
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
              onClick={() => viewReportDetails(item.id)}
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

  // Fonction pour naviguer vers la page de détails
  const viewReportDetails = (reportId) => {
    navigate(`/details/${reportId}`);
  };


  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
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
                    <tr key={item.id}>
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
                      <td>
                        <button
                          className="view-details-btn"
                          onClick={() => viewReportDetails(item.id)}
                          title="Voir les détails"
                        >
                          <FaEye size={16} />
                          Voir détails
                        </button>
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
      </main>
    </div>
  );
};

export default HistoryPage;
