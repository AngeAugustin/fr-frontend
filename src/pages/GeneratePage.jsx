import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import { FaUpload, FaCheckCircle, FaCalendarAlt, FaRedo, FaDownload, FaChevronDown, FaChevronUp, FaTable, FaFileExcel } from 'react-icons/fa';
import './GeneratePage.css';

const GeneratePage = () => {
  const [file, setFile] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [expandedFiles, setExpandedFiles] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    if (!file || file.type !== 'text/csv') {
      setError('Veuillez sélectionner un fichier CSV.');
      toast.error('Veuillez sélectionner un fichier CSV.');
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/reports/upload-balance/', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.error || errorData.detail || `Erreur ${res.status}: ${res.statusText}`;
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }
      
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        toast.error(data.error);
      } else {
        setResult(data);
        setExpandedFiles({}); // Reset expanded files
        toast.success('TFT généré avec succès !');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de l\'upload.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
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
    
    // Debug: afficher la structure des données TFT
    console.log('TFT Data structure:', entries.slice(0, 2));
    console.log('TFT Columns:', properties);
    if (entries.length > 0) {
      console.log('First TFT entry:', entries[0]);
      console.log('First entry values:', entries[0][1]);
      console.log('All column values for first entry:', Object.entries(entries[0][1]));
    }

    return (
      <div style={{ marginTop: 16 }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#333', fontSize: 16 }}>{title}</h4>
        <div className="data-table-container">
          <table className="data-table">
            <thead style={{ background: '#f0f8ff' }}>
              <tr>
                <th style={{ 
                  padding: '10px 8px', 
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
                    padding: '10px 8px', 
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
                    padding: '10px 8px', 
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
                      padding: '10px 8px', 
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
      console.log(`Using comptes_n for ${groupName}:`, accountsData.length, 'accounts');
      if (accountsData.length > 0) {
        console.log(`Sample account structure for ${groupName}:`, accountsData[0]);
        console.log(`Account keys:`, Object.keys(accountsData[0]));
      }
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
      <div className="data-table-container">
        <table className="data-table">
          <thead style={{ background: '#f0f8ff' }}>
            <tr>
              {excelColumns.map(col => (
                <th key={col.key} style={{ 
                  padding: '8px 6px', 
                  textAlign: col.align || 'center', 
                  borderBottom: '2px solid #1800ad', 
                  borderRight: '1px solid #d0d0d0',
                  fontWeight: 700,
                  background: '#e6f3ff',
                  color: '#1800ad',
                  fontSize: 11,
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
                    padding: '8px 6px', 
                    textAlign: col.align || 'left',
                    borderRight: '1px solid #e0e0e0',
                    fontSize: 11,
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

  // Fonction pour rendre les feuilles maîtresses comme des tableaux Excel avec colonnes détaillées
  const renderFeuillesMaitresses = (data) => {
    if (!data || typeof data !== 'object') return null;
    
    const entries = Object.entries(data);
    if (entries.length === 0) return <p>Aucune donnée disponible</p>;

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

    return (
      <div style={{ marginTop: 16 }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#333', fontSize: 16 }}>Feuilles Maîtresses - Détail des comptes</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {entries.map(([groupName, groupData]) => {
            // Vérifier si groupData contient des comptes détaillés dans comptes_n
            const hasDetailedAccounts = groupData && typeof groupData === 'object' && (
              groupData.comptes_n && Array.isArray(groupData.comptes_n) && groupData.comptes_n.length > 0
            );
            const isDetailedData = Array.isArray(groupData) || hasDetailedAccounts;
            
            if (!isDetailedData) {
              // Format ancien - affichage des totaux par groupe
              return (
                <div key={groupName} style={{ 
                  background: '#fff', 
                  border: '2px solid #e3e7ed', 
                  borderRadius: 8, 
                  padding: 20,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <h5 style={{ 
                    margin: '0 0 16px 0', 
                    color: '#1800ad', 
                    fontSize: 16, 
                    fontWeight: 700,
                    paddingBottom: 12,
                    borderBottom: '3px solid #1800ad',
                    textAlign: 'center',
                    background: '#f8f9fa',
                    padding: '12px',
                    borderRadius: '6px 6px 0 0',
                    margin: '-20px -20px 16px -20px'
                  }}>
                    📊 {groupName} (Totaux)
                  </h5>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead style={{ background: '#fff2e6' }}>
                        <tr>
                          <th style={{ 
                            padding: '12px 16px', 
                            textAlign: 'left', 
                            borderBottom: '2px solid #ff9800', 
                            fontWeight: 700,
                            background: '#ffe6cc',
                            color: '#e65100',
                            fontSize: 14,
                            borderRight: '1px solid #ffcc80'
                          }}>
                            Description
                          </th>
                          <th style={{ 
                            padding: '12px 16px', 
                            textAlign: 'right', 
                            borderBottom: '2px solid #ff9800', 
                            fontWeight: 700,
                            background: '#ffe6cc',
                            color: '#e65100',
                            fontSize: 14
                          }}>
                            Montant (XOF)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(groupData).map(([key, value], index) => (
                          <tr key={key} style={{ 
                            borderBottom: '1px solid #f0f0f0',
                            background: index % 2 === 0 ? '#fff' : '#fafafa'
                          }}>
                            <td style={{ 
                              padding: '12px 16px', 
                              fontWeight: 600, 
                              color: '#333',
                              borderRight: '1px solid #f0f0f0',
                              background: '#f8f9fa'
                            }}>
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </td>
                            <td style={{ 
                              padding: '12px 16px', 
                              textAlign: 'right', 
                              fontWeight: 700,
                              color: '#1800ad',
                              fontSize: 14
                            }}>
                              {typeof value === 'number' ? 
                                new Intl.NumberFormat('fr-FR', { 
                                  style: 'currency', 
                                  currency: 'XOF',
                                  minimumFractionDigits: 0 
                                }).format(value) : 
                                String(value)
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            // Format nouveau - tableau détaillé comme Excel
            let accountsData;
            
            if (Array.isArray(groupData)) {
              accountsData = groupData;
            } else if (hasDetailedAccounts) {
              // Utiliser les comptes détaillés du tableau comptes_n
              accountsData = groupData.comptes_n;
              console.log(`Using comptes_n for ${groupName}:`, accountsData.length, 'accounts');
              if (accountsData.length > 0) {
                console.log(`Sample account structure for ${groupName}:`, accountsData[0]);
                console.log(`Account keys:`, Object.keys(accountsData[0]));
              }
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
            
            // Debug: afficher la structure des données
            console.log(`Final accountsData for ${groupName}:`, accountsData.length, 'accounts');
            
            return (
              <div key={groupName} style={{ 
                background: '#fff', 
                border: '2px solid #e3e7ed', 
                borderRadius: 8, 
                padding: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <h5 style={{ 
                  margin: '0 0 16px 0', 
                  color: '#1800ad', 
                  fontSize: 16, 
                  fontWeight: 700,
                  paddingBottom: 12,
                  borderBottom: '3px solid #1800ad',
                  textAlign: 'center',
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '6px 6px 0 0',
                  margin: '-20px -20px 16px -20px'
                }}>
                  📊 {groupName} ({accountsData.length} comptes)
                </h5>
                <div style={{ overflowX: 'auto', border: '1px solid #d0d0d0', borderRadius: 4 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: '1200px' }}>
                    <thead style={{ background: '#f0f8ff' }}>
                      <tr>
                        {excelColumns.map(col => (
                          <th key={col.key} style={{ 
                            padding: '8px 6px', 
                            textAlign: col.align || 'center', 
                            borderBottom: '2px solid #1800ad', 
                            borderRight: '1px solid #d0d0d0',
                            fontWeight: 700,
                            background: '#e6f3ff',
                            color: '#1800ad',
                            fontSize: 11,
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
                              padding: '8px 6px', 
                              textAlign: col.align || 'left',
                              borderRight: '1px solid #e0e0e0',
                              fontSize: 11,
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
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="generate-container">
      <Sidebar />
      <MainContent>
        <ToastContainer position="top-right" autoClose={4000} />
        <h1 className="generate-title">Générateur TFT Automatisé</h1>
        <p className="generate-subtitle">Traitez votre balance générale et générez automatiquement un TFT et des feuilles maîtresses (TFT) conforme SYSCOHADA.</p>
        <section className="generate-section animate-fade-in">
          <div className="section-header">
            <div className="section-icon">
              {!result ? <FaUpload size={20} /> : <FaCheckCircle size={20} />}
            </div>
            <div>
              <h2 className="section-title">Sélection du fichier</h2>
              <div className="section-description">Chargez votre fichier CSV de balance générale</div>
            </div>
          </div>
          <form className="generate-form" onSubmit={handleSubmit}>
            {/* Section upload visible seulement si aucun fichier n'est uploadé */}
            {!file ? (
              <div className="file-drop-zone">
                <input
                  type="file"
                  accept=".csv"
                  onChange={e => setFile(e.target.files[0])}
                  className="form-input"
                  required
                />
                <span style={{ color: '#888', fontSize: 13, marginTop: 8, display: 'block' }}>Formats acceptés : CSV • Taille max: 10MB</span>
                {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
              </div>
            ) : null}
            <div className="section-header">
              <div className="section-icon">
                <FaCalendarAlt size={20} />
              </div>
              <div>
                <h2 className="section-title">Configuration</h2>
                <div className="section-description">Définissez les dates</div>
              </div>
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">Date de début :</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  required 
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date de fin :</label>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                  required 
                  className="form-input"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <FaCheckCircle size={18} />
                    Générer le TFT
                  </>
                )}
              </button>
              {file && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setFile(null);
                    setStartDate('');
                    setEndDate('');
                    setLoading(false);
                    setError('');
                    setResult(null);
                  }}
                >
                  <FaRedo size={18} />
                  Recommencer
                </button>
              )}
            </div>
          </form>
        </section>
        {result && (
          <>
            {/* Contrôle de cohérence - Affichage en cartes */}
            {result.coherence && (
              <section className="generate-section animate-fade-in">
                <div className="section-header">
                  <div className="section-icon" style={{ background: result.coherence.is_coherent ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : 'linear-gradient(135deg, #dc3545 0%, #e74c3c 100%)' }}>
                    <FaCheckCircle size={20} />
                  </div>
                  <div>
                    <h2 className="section-title">Contrôle de cohérence</h2>
                    <div className="section-description">
                      {result.coherence.is_coherent ? 'TFT cohérent' : 'TFT non cohérent'}
                    </div>
                  </div>
                </div>
                
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h4 className="metric-title">Variation TFT</h4>
                    <div className="metric-value">
                      {new Intl.NumberFormat('fr-FR', { 
                        style: 'currency', 
                        currency: 'XOF',
                        minimumFractionDigits: 0 
                      }).format(result.coherence.variation_tft || 0)}
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <h4 className="metric-title">Variation Trésorerie</h4>
                    <div className="metric-value">
                      {new Intl.NumberFormat('fr-FR', { 
                        style: 'currency', 
                        currency: 'XOF',
                        minimumFractionDigits: 0 
                      }).format(result.coherence.variation_treso || 0)}
                    </div>
                  </div>
                  
                  <div className="metric-card">
                    <h4 className="metric-title">Statut</h4>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 600, 
                      color: result.coherence.is_coherent ? '#28a745' : '#dc3545',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <FaCheckCircle size={16} />
                      {result.coherence.is_coherent ? 'Cohérent' : 'Non cohérent'}
                    </div>
                  </div>
                </div>
                
                {result.coherence.details && Object.keys(result.coherence.details).length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <h4 style={{ margin: '0 0 16px 0', color: '#333', fontSize: 16 }}>Détails du contrôle</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      {Object.entries(result.coherence.details).map(([key, value]) => (
                        <div key={key} style={{ 
                          background: '#f8f9fa', 
                          borderRadius: 8, 
                          padding: 16, 
                          border: '1px solid #e3e7ed',
                          borderLeft: '4px solid #1800ad'
                        }}>
                          <h5 style={{ 
                            margin: '0 0 8px 0', 
                            color: '#333', 
                            fontSize: 14, 
                            fontWeight: 600,
                            textTransform: 'capitalize'
                          }}>
                            {key.replace(/_/g, ' ')}
                          </h5>
                          <div style={{ 
                            fontSize: 14, 
                            color: '#666',
                            wordBreak: 'break-word'
                          }}>
                            {typeof value === 'object' ? (
                              <div>
                                {Object.entries(value).map(([subKey, subValue]) => (
                                  <div key={subKey} style={{ marginBottom: 4 }}>
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
              </section>
            )}

            {/* Fichiers générés - Menus dépliants */}
            <section className="generate-section animate-fade-in">
              <div className="section-header">
                <div className="section-icon">
                  <FaTable size={20} />
                </div>
                <div>
                  <h2 className="section-title">Données générées</h2>
                  <div className="section-description">Consultez les données TFT et feuilles maîtresses</div>
                </div>
              </div>

              {/* TFT JSON */}
              {result.tft_json && (
                <div style={{ marginBottom: 24 }}>
                  <div 
                    className="expandable-header"
                    onClick={() => toggleFileExpansion('tft')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FaFileExcel size={20} color="#1800ad" style={{ marginRight: 12 }} />
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#333' }}>Tableau de Flux de Trésorerie (TFT)</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#666' }}>
                          {Object.keys(result.tft_json).length} rubriques
                        </p>
                      </div>
                    </div>
                    {expandedFiles.tft ? <FaChevronUp size={16} color="#666" /> : <FaChevronDown size={16} color="#666" />}
                  </div>
                  
                  {expandedFiles.tft && (
                    <div className="expandable-content">
                      <div className="data-table-container">
                        {renderTFTAsTable(result.tft_json, 'Tableau de Flux de Trésorerie (TFT)')}
                      </div>
                      {result.history?.generated_files?.find(f => f.file_type === 'TFT') && (
                        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                          <button
                            className="export-btn"
                            onClick={() => {
                              const tftFile = result.history.generated_files.find(f => f.file_type === 'TFT');
                              window.open(tftFile.download_url.startsWith('http') ? tftFile.download_url : `http://127.0.0.1:8000${tftFile.download_url}`, '_blank');
                            }}
                          >
                            <FaDownload size={14} />
                            📊 Exporter TFT Excel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Feuilles maîtresses - Un menu dépliant par groupe */}
              {result.feuilles_maitresses_json && Object.entries(result.feuilles_maitresses_json).map(([groupName, groupData]) => {
                const hasDetailedAccounts = groupData && typeof groupData === 'object' && (
                  groupData.comptes_n && Array.isArray(groupData.comptes_n) && groupData.comptes_n.length > 0
                );
                const accountsCount = hasDetailedAccounts ? groupData.comptes_n.length : 1;
                
                return (
                  <div key={groupName} style={{ marginBottom: 24 }}>
                    <div 
                      className="expandable-header"
                      onClick={() => toggleFileExpansion(`feuille_${groupName}`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaFileExcel size={20} color="#ff9800" style={{ marginRight: 12 }} />
                        <div>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#333' }}>{groupName}</h3>
                          <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#666' }}>
                            {accountsCount} compte{accountsCount > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {expandedFiles[`feuille_${groupName}`] ? <FaChevronUp size={16} color="#666" /> : <FaChevronDown size={16} color="#666" />}
                    </div>
                    
                    {expandedFiles[`feuille_${groupName}`] && (
                      <div className="expandable-content">
                        <div className="data-table-container">
                          {renderSingleFeuilleMaitresse(groupName, groupData)}
                        </div>
                        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {result.history?.generated_files?.filter(f => f.file_type === 'feuille_maitresse' && f.group_name === groupName).map(file => (
                            <button
                              key={file.download_url}
                              className="export-btn export-btn-orange"
                              onClick={() => window.open(file.download_url.startsWith('http') ? file.download_url : `http://127.0.0.1:8000${file.download_url}`, '_blank')}
                            >
                              <FaDownload size={14} />
                              📋 Exporter {groupName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          </>
        )}
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
}

export default GeneratePage;
