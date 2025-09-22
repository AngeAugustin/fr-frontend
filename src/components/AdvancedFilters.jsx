import React, { useState, useEffect } from 'react';
import { FaSearch, FaCalendarAlt, FaFilter, FaTimes, FaSave, FaDownload, FaUndo, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './AdvancedFilters.css';

const AdvancedFilters = ({ 
  filters, 
  onFiltersChange, 
  onReset, 
  onSave, 
  onLoad,
  totalResults,
  filteredResults 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filtres rapides prédéfinis
  const quickFilters = [
    { id: 'all', label: 'Tous', icon: '📊' },
    { id: 'today', label: 'Aujourd\'hui', icon: '📅' },
    { id: 'week', label: 'Cette semaine', icon: '📆' },
    { id: 'month', label: 'Ce mois', icon: '🗓️' },
    { id: 'errors', label: 'Avec erreurs', icon: '⚠️' },
    { id: 'success', label: 'Succès', icon: '✅' },
    { id: 'coherent', label: 'Cohérents', icon: '🔗' },
    { id: 'recent', label: 'Récents', icon: '🆕' }
  ];

  // Périodes prédéfinies
  const periodPresets = [
    { id: 'today', label: 'Aujourd\'hui', getDates: () => {
      const today = new Date();
      return { start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
    }},
    { id: 'yesterday', label: 'Hier', getDates: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday.toISOString().split('T')[0], end: yesterday.toISOString().split('T')[0] };
    }},
    { id: 'thisWeek', label: 'Cette semaine', getDates: () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      return { start: startOfWeek.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
    }},
    { id: 'lastWeek', label: 'Semaine dernière', getDates: () => {
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      const startOfLastWeek = new Date(lastWeek);
      startOfLastWeek.setDate(lastWeek.getDate() - lastWeek.getDay());
      return { start: startOfLastWeek.toISOString().split('T')[0], end: lastWeek.toISOString().split('T')[0] };
    }},
    { id: 'thisMonth', label: 'Ce mois', getDates: () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start: startOfMonth.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
    }},
    { id: 'lastMonth', label: 'Mois dernier', getDates: () => {
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start: lastMonth.toISOString().split('T')[0], end: endOfLastMonth.toISOString().split('T')[0] };
    }}
  ];

  // Gestion des suggestions de recherche
  const handleSearchChange = (value) => {
    onFiltersChange('searchText', value);
    
    // Simuler des suggestions (à remplacer par une vraie API)
    if (value.length > 2) {
      const suggestions = [
        `ID: ${value}`,
        `Fichier: ${value}.csv`,
        `Période: ${value}`,
        `Statut: ${value}`
      ].filter(s => s.toLowerCase().includes(value.toLowerCase()));
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Appliquer un filtre rapide
  const applyQuickFilter = (filterId) => {
    const today = new Date();
    
    switch (filterId) {
      case 'today':
        onFiltersChange('uploadDate', today.toISOString().split('T')[0]);
        break;
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        onFiltersChange('periodStart', startOfWeek.toISOString().split('T')[0]);
        onFiltersChange('periodEnd', today.toISOString().split('T')[0]);
        break;
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        onFiltersChange('periodStart', startOfMonth.toISOString().split('T')[0]);
        onFiltersChange('periodEnd', today.toISOString().split('T')[0]);
        break;
      case 'errors':
        onFiltersChange('statusFilter', 'error');
        break;
      case 'success':
        onFiltersChange('statusFilter', 'success');
        break;
      case 'coherent':
        onFiltersChange('coherenceFilter', 'coherent');
        break;
      case 'recent':
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 7);
        onFiltersChange('periodStart', recentDate.toISOString().split('T')[0]);
        break;
      default:
        onReset();
    }
  };

  // Appliquer une période prédéfinie
  const applyPeriodPreset = (preset) => {
    const dates = preset.getDates();
    onFiltersChange('periodStart', dates.start);
    onFiltersChange('periodEnd', dates.end);
  };

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  return (
    <div className="advanced-filters-container">
      {/* En-tête des filtres */}
      <div className="filters-header">
        <div className="filters-title-section">
          <h3 className="filters-title">
            <FaFilter size={18} />
            Filtres avancés
          </h3>
          <div className="filters-stats">
            <span className="results-count">
              {filteredResults} / {totalResults} résultats
            </span>
            {hasActiveFilters && (
              <span className="active-indicator">Filtres actifs</span>
            )}
          </div>
        </div>
        <div className="filters-actions">
          <button 
            className="toggle-advanced-btn"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
            {showAdvanced ? 'Masquer' : 'Afficher'} les filtres
          </button>
        </div>
      </div>

      {/* Filtres rapides */}
      <div className="quick-filters-section">
        <div className="quick-filters">
          {quickFilters.map(filter => (
            <button
              key={filter.id}
              className={`quick-filter-btn ${filters.activeQuickFilter === filter.id ? 'active' : ''}`}
              onClick={() => {
                applyQuickFilter(filter.id);
                onFiltersChange('activeQuickFilter', filter.id);
              }}
            >
              <span className="quick-filter-icon">{filter.icon}</span>
              <span className="quick-filter-label">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="filters-content">
          <div className="filters-grid">
            {/* Recherche intelligente */}
            <div className="filter-group search-group">
              <label className="filter-label">
                <FaSearch size={14} />
                Recherche intelligente
              </label>
              <div className="search-container">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    className="search-input"
                    value={filters.searchText || ''}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Rechercher par ID, fichier, période..."
                  />
                  {filters.searchText && (
                    <button 
                      className="clear-search-btn"
                      onClick={() => handleSearchChange('')}
                    >
                      <FaTimes size={12} />
                    </button>
                  )}
                </div>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="search-suggestions">
                    {searchSuggestions.map((suggestion, index) => (
                      <div 
                        key={index}
                        className="suggestion-item"
                        onClick={() => {
                          handleSearchChange(suggestion);
                          setShowSuggestions(false);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Périodes prédéfinies */}
            <div className="filter-group period-presets-group">
              <label className="filter-label">
                <FaCalendarAlt size={14} />
                Périodes prédéfinies
              </label>
              <div className="period-presets">
                {periodPresets.map(preset => (
                  <button
                    key={preset.id}
                    className="preset-btn"
                    onClick={() => applyPeriodPreset(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtres de date personnalisés */}
            <div className="filter-group">
              <label className="filter-label">Date de début</label>
              <div className="filter-input-wrapper">
                <input
                  type="date"
                  className="filter-input"
                  value={filters.periodStart || ''}
                  onChange={(e) => onFiltersChange('periodStart', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Date de fin</label>
              <div className="filter-input-wrapper">
                <input
                  type="date"
                  className="filter-input"
                  value={filters.periodEnd || ''}
                  onChange={(e) => onFiltersChange('periodEnd', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Date d'upload</label>
              <div className="filter-input-wrapper">
                <input
                  type="date"
                  className="filter-input"
                  value={filters.uploadDate || ''}
                  onChange={(e) => onFiltersChange('uploadDate', e.target.value)}
                />
              </div>
            </div>

            {/* Filtres de statut */}
            <div className="filter-group">
              <label className="filter-label">Statut</label>
              <div className="filter-input-wrapper">
                <select
                  className="filter-select"
                  value={filters.statusFilter || ''}
                  onChange={(e) => onFiltersChange('statusFilter', e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="success">✅ Succès</option>
                  <option value="error">❌ Erreur</option>
                  <option value="pending">⏳ En attente</option>
                  <option value="processing">🔄 En cours</option>
                </select>
              </div>
            </div>

            {/* Filtres de cohérence */}
            <div className="filter-group">
              <label className="filter-label">Cohérence</label>
              <div className="filter-input-wrapper">
                <select
                  className="filter-select"
                  value={filters.coherenceFilter || ''}
                  onChange={(e) => onFiltersChange('coherenceFilter', e.target.value)}
                >
                  <option value="">Tous</option>
                  <option value="coherent">🔗 Cohérents</option>
                  <option value="incoherent">⚠️ Non cohérents</option>
                </select>
              </div>
            </div>

            {/* Filtres de fichiers générés */}
            <div className="filter-group">
              <label className="filter-label">Fichiers générés</label>
              <div className="filter-input-wrapper">
                <select
                  className="filter-select"
                  value={filters.filesGenerated || ''}
                  onChange={(e) => onFiltersChange('filesGenerated', e.target.value)}
                >
                  <option value="">Tous</option>
                  <option value="0">📭 Aucun</option>
                  <option value="1-3">📄 1-3 fichiers</option>
                  <option value="4+">📚 4+ fichiers</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions des filtres */}
          <div className="filters-actions-bottom">
            <button className="action-btn save-btn" onClick={onSave}>
              <FaSave size={14} />
              Sauvegarder
            </button>
            <button className="action-btn load-btn" onClick={onLoad}>
              <FaDownload size={14} />
              Charger
            </button>
            <button className="action-btn reset-btn" onClick={onReset}>
              <FaUndo size={14} />
              Réinitialiser
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
