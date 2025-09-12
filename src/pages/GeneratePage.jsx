import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/Sidebar';
import { FaUpload, FaCheckCircle, FaCalendarAlt, FaRedo, FaDownload } from 'react-icons/fa';

const GeneratePage = () => {
  const [file, setFile] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

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
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        toast.error(data.error);
      } else {
        setResult(data);
        toast.success('TFT généré avec succès !');
      }
    } catch {
      setError('Erreur lors de l’upload.');
      toast.error('Erreur lors de l’upload.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, padding: 32, width: '100%' }}>
        <ToastContainer position="top-right" autoClose={4000} />
        <h1 style={{ color: '#1800ad', fontWeight: 700, fontSize: 32, marginBottom: 8 }}>Générateur TFT Automatisé</h1>
        <p style={{ color: '#555', marginBottom: 24 }}>Traitez votre balance générale et générez automatiquement un TFT et des feuilles maîtresses (TFT) conforme SYSCOHADA.</p>
        <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 32, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            {/* Icône upload ou validation selon l'état */}
            {!result ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#1800ad', marginRight: 12 }}>
                <FaUpload size={20} color="#fff" />
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#1800ad', marginRight: 12 }}>
                <FaCheckCircle size={20} color="#fff" />
              </span>
            )}
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Sélection du fichier</h2>
              <div style={{ fontSize: 15, color: '#555', fontWeight: 400, marginTop: 2 }}>Chargez votre fichier CSV de balance générale</div>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Section upload visible seulement si aucun fichier n'est uploadé */}
            {!file ? (
              <div style={{
                background: '#fff',
                border: '1px solid #e3e7ed',
                borderRadius: 10,
                padding: '18px 24px',
                marginBottom: 20,
                boxShadow: '0 2px 8px #0001',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 480,
                width: '100%'
              }}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={e => setFile(e.target.files[0])}
                  style={{ display: 'block', marginBottom: 10 }}
                  required
                />
                <span style={{ color: '#888', fontSize: 13 }}>Formats acceptés : CSV • Taille max: 10MB</span>
                {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
              </div>
            ) : null}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              {/* Icône upload ou validation selon l'état */}
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#1800ad', marginRight: 12 }}>
                <FaCalendarAlt size={20} color="#fff" />
              </span>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Configuration</h2>
                <div style={{ fontSize: 15, color: '#555', fontWeight: 400, marginTop: 2 }}>Définissez les dates</div>
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: 24,
              marginBottom: 24,
              background: '#fff',
              border: '1px solid #e3e7ed',
              borderRadius: 10,
              padding: '18px 24px',
              maxWidth: 480,
              width: '100%'
            }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Date de début :</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, width: '100%' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 500, marginBottom: 6, display: 'block' }}>Date de fin :</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <button type="submit" disabled={loading} style={{ background: '#0a5328ff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <FaCheckCircle size={18} color="#fff" />
                </span>
                {loading ? 'Génération en cours...' : 'Générer le TFT'}
              </button>
              {file && (
                <button
                  type="button"
                  style={{ background: '#1800ad', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                  onClick={() => {
                    setFile(null);
                    setStartDate('');
                    setEndDate('');
                    setLoading(false);
                    setError('');
                    setResult(null);
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <FaRedo size={18} color="#fff" />
                  </span>
                  Recommencer
                </button>
              )}
            </div>
          </form>
        </section>
        {result && result.history && result.history.generated_files && (
          <section style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 32, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              {/* Icône résultats ou validation selon l'état */}
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#1800ad', marginRight: 12 }}>
                <FaDownload size={20} color="#fff" />
              </span>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Résultats</h2>
                <div style={{ fontSize: 15, color: '#555', fontWeight: 400, marginTop: 2 }}>Téléchargez le TFT et les feuilles maitresses générées.</div>
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {result.history.generated_files.map(f => (
                <li key={f.file} style={{ marginBottom: 18, display: 'flex', alignItems: 'center' }}>
                  <button
                    style={{ background: f.file_type === 'TFT' ? '#1800ad' : '#ff9800', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, fontSize: 15, cursor: 'pointer', marginRight: 16 }}
                    onClick={() => window.open(f.download_url.startsWith('http') ? f.download_url : `http://127.0.0.1:8000${f.download_url}`, '_blank')}
                  >
                    {f.file_type === 'TFT' ? 'Télécharger TFT' : `Télécharger Feuille maîtresse (${f.group_name})`}
                  </button>
                  <span style={{ color: '#888', fontSize: 13 }}>
                    {new Date(f.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
        <section style={{ background: '#f6f8fa', borderRadius: 8, padding: 18, marginBottom: 16, border: '1px solid #e3e7ed' }}>
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
}

export default GeneratePage;
