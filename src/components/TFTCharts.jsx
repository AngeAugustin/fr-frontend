import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart,
  Scatter,
  ScatterChart
} from 'recharts';
import { FaChartBar, FaChartPie, FaChartLine, FaChartArea, FaTable, FaMoneyBillWave, FaListAlt, FaUsers, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './TFTCharts.css';

const TFTCharts = ({ tftData, title = "Visualisations TFT" }) => {
  const [activeChart, setActiveChart] = useState('bar');
  const [showNegativeValues, setShowNegativeValues] = useState(true);

  // Transformer les données TFT pour les graphiques
  const chartData = useMemo(() => {
    if (!tftData || typeof tftData !== 'object') return [];

    return Object.entries(tftData).map(([code, data]) => {
      const montant = data.montant || data.amount || 0;
      const comptes = data.comptes || [];
      
      return {
        code,
        montant: showNegativeValues ? montant : Math.abs(montant),
        montantAbs: Math.abs(montant),
        comptesCount: comptes.length,
        fluxType: montant > 0 ? 'Entrée' : montant < 0 ? 'Sortie' : 'Neutre',
        classeFlux: getClasseFlux(code),
        natureFlux: getNatureFlux(montant, code),
        impact: getImpact(montant),
        // Données pour les comptes
        comptes: comptes.map(compte => ({
          account_number: compte.account_number,
          account_label: compte.account_label,
          balance: compte.balance || 0,
          entries_count: compte.entries_count || 0
        }))
      };
    }).sort((a, b) => Math.abs(b.montant) - Math.abs(a.montant));
  }, [tftData, showNegativeValues]);

  // Données pour le graphique en secteurs (top 10)
  const pieData = useMemo(() => {
    return chartData.slice(0, 10).map(item => ({
      name: item.code,
      value: Math.abs(item.montant),
      fluxType: item.fluxType,
      color: item.fluxType === 'Entrée' ? '#10b981' : item.fluxType === 'Sortie' ? '#ef4444' : '#6b7280'
    }));
  }, [chartData]);

  // Données pour le graphique de répartition par type de flux
  const fluxTypeData = useMemo(() => {
    const grouped = chartData.reduce((acc, item) => {
      const type = item.fluxType;
      if (!acc[type]) {
        acc[type] = { type, total: 0, count: 0 };
      }
      acc[type].total += Math.abs(item.montant);
      acc[type].count += 1;
      return acc;
    }, {});

    return Object.values(grouped).map(item => ({
      ...item,
      color: item.type === 'Entrée' ? '#10b981' : item.type === 'Sortie' ? '#ef4444' : '#6b7280'
    }));
  }, [chartData]);

  // Données pour le graphique par classe de flux
  const classeFluxData = useMemo(() => {
    const grouped = chartData.reduce((acc, item) => {
      const classe = item.classeFlux;
      if (!acc[classe]) {
        acc[classe] = { classe, total: 0, count: 0 };
      }
      acc[classe].total += Math.abs(item.montant);
      acc[classe].count += 1;
      return acc;
    }, {});

    return Object.values(grouped).map(item => ({
      ...item,
      color: getClasseFluxColor(item.classe)
    }));
  }, [chartData]);

  // Configuration des couleurs
  const COLORS = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#6b7280',
    operationnel: '#3b82f6',
    investissement: '#8b5cf6',
    financement: '#f59e0b'
  };

  // Fonctions utilitaires
  function getClasseFlux(code) {
    if (code.includes('OPER') || code.includes('OP')) return 'Opérationnel';
    if (code.includes('INV') || code.includes('INVEST')) return 'Investissement';
    if (code.includes('FIN') || code.includes('FINANCE')) return 'Financement';
    return 'Autre';
  }

  function getNatureFlux(montant, code) {
    if (montant > 0) return 'Encaissement';
    if (montant < 0) return 'Décaissement';
    return 'Neutre';
  }

  function getImpact(montant) {
    const abs = Math.abs(montant);
    if (abs > 1000000) return 'Significatif';
    if (abs > 100000) return 'Modéré';
    return 'Mineur';
  }

  function getClasseFluxColor(classe) {
    switch (classe) {
      case 'Opérationnel': return '#3b82f6';
      case 'Investissement': return '#8b5cf6';
      case 'Financement': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  // Composant de tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`Code: ${label}`}</p>
          <p className="tooltip-value">
            Montant: {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'XOF',
              minimumFractionDigits: 0
            }).format(data.montant)}
          </p>
          <p className="tooltip-info">Type: {data.fluxType}</p>
          <p className="tooltip-info">Classe: {data.classeFlux}</p>
          <p className="tooltip-info">Comptes: {data.comptesCount}</p>
        </div>
      );
    }
    return null;
  };

  // Rendu des graphiques
  const renderChart = () => {
    switch (activeChart) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="code" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0,
                  notation: 'compact'
                }).format(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="montant" 
                fill="#3b82f6"
                name="Montant (XOF)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0
                }).format(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="code" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0,
                  notation: 'compact'
                }).format(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="montant" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Montant (XOF)"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="code" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0,
                  notation: 'compact'
                }).format(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="montant" 
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Montant (XOF)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="code" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                tickFormatter={(value) => new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0,
                  notation: 'compact'
                }).format(value)}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="montant" 
                fill="#3b82f6"
                name="Montant (XOF)"
                radius={[4, 4, 0, 0]}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="comptesCount" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Nombre de comptes"
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  if (!tftData || Object.keys(tftData).length === 0) {
    return (
      <div className="tft-charts-container">
        <div className="no-data-message">
          <FaChartBar size={48} />
          <h3>Aucune donnée TFT disponible</h3>
          <p>Les données du Tableau de Flux de Trésorerie ne sont pas encore chargées.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tft-charts-container">
      <div className="tft-charts-header">
        <h3 className="charts-title">
          <FaChartBar size={20} />
          {title}
        </h3>
        <div className="charts-controls">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={showNegativeValues}
              onChange={(e) => setShowNegativeValues(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            Afficher les valeurs négatives
          </label>
        </div>
      </div>

      {/* Statistiques résumées - Affichées en premier */}
      <div className="tft-stats">
         <div className="stat-card total-flux">
           <div className="stat-icon">
             <FaMoneyBillWave size={24} />
           </div>
           <div className="stat-content">
             <h4>Total des Flux</h4>
             <p className="stat-value">
               {new Intl.NumberFormat('fr-FR', {
                 style: 'currency',
                 currency: 'XOF',
                 minimumFractionDigits: 0
               }).format(chartData.reduce((sum, item) => sum + item.montant, 0))}
             </p>
           </div>
         </div>
         <div className="stat-card rubriques">
           <div className="stat-icon">
             <FaListAlt size={24} />
           </div>
           <div className="stat-content">
             <h4>Nombre de Rubriques</h4>
             <p className="stat-value">{chartData.length}</p>
           </div>
         </div>
         <div className="stat-card comptes">
           <div className="stat-icon">
             <FaUsers size={24} />
           </div>
           <div className="stat-content">
             <h4>Total des Comptes</h4>
             <p className="stat-value">
               {chartData.reduce((sum, item) => sum + item.comptesCount, 0)}
             </p>
           </div>
         </div>
         <div className="stat-card flux-positifs">
           <div className="stat-icon">
             <FaArrowUp size={24} />
           </div>
           <div className="stat-content">
             <h4>Flux Positifs</h4>
             <p className="stat-value">
               {chartData.filter(item => item.montant > 0).length}
             </p>
           </div>
         </div>
         <div className="stat-card flux-negatifs">
           <div className="stat-icon">
             <FaArrowDown size={24} />
           </div>
           <div className="stat-content">
             <h4>Flux Négatifs</h4>
             <p className="stat-value">
               {chartData.filter(item => item.montant < 0).length}
             </p>
           </div>
         </div>
       </div>

      <div className="charts-tabs">
        <button
          className={`chart-tab ${activeChart === 'bar' ? 'active' : ''}`}
          onClick={() => setActiveChart('bar')}
        >
          <FaChartBar size={16} />
          Barres
        </button>
        <button
          className={`chart-tab ${activeChart === 'pie' ? 'active' : ''}`}
          onClick={() => setActiveChart('pie')}
        >
          <FaChartPie size={16} />
          Secteurs
        </button>
        <button
          className={`chart-tab ${activeChart === 'line' ? 'active' : ''}`}
          onClick={() => setActiveChart('line')}
        >
          <FaChartLine size={16} />
          Lignes
        </button>
        <button
          className={`chart-tab ${activeChart === 'area' ? 'active' : ''}`}
          onClick={() => setActiveChart('area')}
        >
          <FaChartArea size={16} />
          Aires
        </button>
        <button
          className={`chart-tab ${activeChart === 'composed' ? 'active' : ''}`}
          onClick={() => setActiveChart('composed')}
        >
          <FaTable size={16} />
          Composé
        </button>
      </div>

      <div className="chart-container">
        {renderChart()}
      </div>

      {/* Graphiques supplémentaires */}
      <div className="additional-charts">
        <div className="chart-section">
          <h4>Répartition par Type de Flux</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fluxTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }) => `${type} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
              >
                {fluxTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0
                }).format(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h4>Répartition par Classe de Flux</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classeFluxData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="classe" />
              <YAxis 
                tickFormatter={(value) => new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0,
                  notation: 'compact'
                }).format(value)}
              />
              <Tooltip 
                formatter={(value) => new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0
                }).format(value)}
              />
              <Legend />
              <Bar 
                dataKey="total" 
                fill="#3b82f6"
                name="Total (XOF)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TFTCharts;
