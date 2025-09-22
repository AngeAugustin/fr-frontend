import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/Header';
import FeuilleMaitresseTabs from '../components/FeuilleMaitresseTabs';
import CommentSection from '../components/CommentSection';
import { FaArrowLeft, FaFileExcel, FaChevronDown, FaChevronUp, FaDownload } from 'react-icons/fa';
import './FeuillesMaitressePage.css';

const FeuillesMaitressePage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedFiles, setExpandedFiles] = useState({});

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
              <p style={{ color: '#666', margin: 0 }}>Chargement des feuilles maîtresses...</p>
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
            <h2>Erreur</h2>
            <p>{error}</p>
            <button 
              className="back-button"
              onClick={() => navigate(`/details/${reportId}`)}
            >
              <FaArrowLeft size={16} />
              Retour aux détails
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
      <main className="main-content feuilles-maitresse-container">
        <ToastContainer position="top-right" autoClose={4000} />
        
        {/* En-tête avec bouton retour */}
        <div className="feuilles-header">
          <button 
            className="back-button"
            onClick={() => navigate(`/details/${reportId}`)}
          >
            <FaArrowLeft size={16} />
            Retour aux détails
          </button>
          <div className="feuilles-title-section">
            <h1 className="feuilles-title">
              <FaFileExcel size={24} />
              Feuilles Maîtresses - Rapport #{report.id}
            </h1>
            <p className="feuilles-subtitle">
              {report.feuilles_maitresses_json ? Object.keys(report.feuilles_maitresses_json).length : 0} feuille{report.feuilles_maitresses_json && Object.keys(report.feuilles_maitresses_json).length > 1 ? 's' : ''} maîtresse{report.feuilles_maitresses_json && Object.keys(report.feuilles_maitresses_json).length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

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
            <div key={groupName} className="feuille-section">
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

        {/* Message si aucune feuille maîtresse */}
        {(!report.feuilles_maitresses_json || Object.keys(report.feuilles_maitresses_json).length === 0) && (
          <div className="no-data-message">
            <FaFileExcel size={48} color="#ccc" />
            <h3>Aucune feuille maîtresse</h3>
            <p>Ce rapport ne contient pas de feuilles maîtresses.</p>
            <button 
              className="back-button"
              onClick={() => navigate(`/details/${reportId}`)}
            >
              <FaArrowLeft size={16} />
              Retour aux détails
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FeuillesMaitressePage;
