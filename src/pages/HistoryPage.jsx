


import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { FaHistory, FaFileAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaDownload, FaEye } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import './HistoryPage.css';
import ContextMenu from '../components/ContextMenu';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtres
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [uploadDate, setUploadDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  // ...existing code...
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
  const res = await fetch('http://127.0.0.1:8000/api/reports/balance-history/');
        const data = await res.json();
        if (data.history) {
          setHistory(data.history);
        } else {
          setError('Aucun historique trouvé.');
        }
      } catch {
        setError('Erreur lors de la récupération de l’historique.');
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main className="history-container">
        <h1 style={{ color: '#1800ad', fontWeight: 700, fontSize: 32, marginBottom: 8 }}>Historique des uploads</h1>
        <p style={{ color: '#555', marginBottom: 24 }}>Consultez l'historique des uploads de fichiers CSV et des rapports générés.</p>
        {loading && <div>Chargement...</div>}
        {error && <div className="status-error"><MdError size={20} /> {error}</div>}
        {!loading && !error && (
          <div>
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
                    placeholder="Rechercher..."
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
                    <option value="OK">Succès</option>
                    <option value="ERROR">Erreur</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filtrage des données */}
            {history.length === 0 ? (
              <div>Aucun upload trouvé.</div>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th><FaFileAlt /> ID</th>
                    <th><FaDownload /> Fichier</th>
                    <th><FaCalendarAlt /> Période</th>
                    <th><FaCalendarAlt /> Date d’upload</th>
                    <th>Status</th>
                    <th>Fichiers générés</th>
                  </tr>
                </thead>
                <tbody>
                  {history
                    .filter(item => {
                      // Filtre période
                      const startOk = !periodStart || item.start_date >= periodStart;
                      const endOk = !periodEnd || item.end_date <= periodEnd;
                      // Filtre date upload
                      const uploadOk = !uploadDate || item.uploaded_at.slice(0,10) === uploadDate;
                      // Filtre statut
                      const statusOk = !statusFilter || (statusFilter === 'OK' ? item.status === 'OK' : item.status !== 'OK');
                      // Filtre texte
                      const search = searchText.trim().toLowerCase();
                      const textOk = !search ||
                        item.id.toString().includes(search) ||
                        (item.file && item.file.toLowerCase().includes(search)) ||
                        (item.start_date && item.start_date.includes(search)) ||
                        (item.end_date && item.end_date.includes(search));
                      return startOk && endOk && uploadOk && statusOk && textOk;
                    })
                    .map(item => (
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
                            <div style={{ fontWeight: 600, marginBottom: 18, color: '#3a3a4d', fontSize: 22 }}>Fichiers générés</div>
                            <ul className="generated-list" style={{ width: '100%', marginBottom: 16, maxWidth: 480 }}>
                              {item.generated_files.map(f => (
                                <li key={f.file} style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
                                  <button
                                    style={{
                                      background: f.file_type === 'TFT' ? '#1800ad' : '#ff9800',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: 6,
                                      padding: '10px 22px',
                                      fontWeight: 500,
                                      fontSize: 15,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 8,
                                    }}
                                    onClick={() => window.open(f.download_url.startsWith('http') ? f.download_url : `http://127.0.0.1:8000${f.download_url}`, '_blank')}
                                  >
                                    <FaDownload /> {f.file_type === 'TFT' ? 'Télécharger TFT' : `Feuille maîtresse (${f.group_name})`}
                                  </button>
                                  <span style={{ color: '#888', fontSize: 13, background: '#f3f3f3', borderRadius: 4, padding: '4px 10px' }}>
                                    <FaCalendarAlt style={{ marginRight: 4 }} /> {new Date(f.created_at).toLocaleDateString()}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </ContextMenu>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      {/* Section Informations importantes en bas */}
      <section style={{ background: '#f6f8fa', borderRadius: 8, padding: 18, margin: '32px 0 0 0', border: '1px solid #e3e7ed' }}>
        <strong>Informations importantes</strong>
        <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ background: '#1800ad', color: '#e3e7ed', borderRadius: 6, padding: '2px 10px', fontWeight: 500, fontSize: 13 }}>Format CSV requis</span>
            <span style={{ background: '#0a5328ff', color: '#e3e7ed', borderRadius: 6, padding: '2px 10px', fontWeight: 500, fontSize: 13 }}>Validation automatique</span>
            <span style={{ background: '#ff9800', color: '#e3e7ed', borderRadius: 6, padding: '2px 10px', fontWeight: 500, fontSize: 13 }}>Conforme SYSCOHADA</span>
            <span style={{ background: '#d73523ff', color: '#e3e7ed', borderRadius: 6, padding: '2px 10px', fontWeight: 500, fontSize: 13 }}>Export Excel</span>
        </div>
        <div style={{ marginTop: 10, color: '#555', fontSize: 14 }}>
          Le système traite automatiquement votre balance générale et génère un TFT complet avec toutes les rubriques SYSCOHADA. Les contrôles de cohérence sont effectués automatiquement et les fichiers d’export sont disponibles immédiatement.
        </div>
      </section>
    </main>
  </div>
  );
};

export default HistoryPage;
