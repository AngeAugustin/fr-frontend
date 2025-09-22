import React from 'react';
import { FaSort, FaSortUp, FaSortDown, FaRandom } from 'react-icons/fa';
import './SortControls.css';

const SortControls = ({ sortBy, sortOrder, onSortChange, onOrderChange }) => {
  const sortOptions = [
    { value: 'uploaded_at', label: 'Date d\'upload', icon: '📅' },
    { value: 'start_date', label: 'Date de début', icon: '📆' },
    { value: 'end_date', label: 'Date de fin', icon: '🗓️' },
    { value: 'status', label: 'Statut', icon: '⚡' },
    { value: 'file_size', label: 'Taille du fichier', icon: '📊' },
    { value: 'id', label: 'ID', icon: '🔢' }
  ];

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      // Si c'est le même critère, changer l'ordre
      onOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouveau critère, commencer par asc
      onSortChange(newSortBy);
      onOrderChange('asc');
    }
  };

  const getSortIcon = (optionValue) => {
    if (optionValue !== sortBy) {
      return <FaSort className="sort-icon inactive" />;
    }
    return sortOrder === 'asc' ? 
      <FaSortUp className="sort-icon active" /> : 
      <FaSortDown className="sort-icon active" />;
  };

  return (
    <div className="sort-controls">
      <div className="sort-label">
        <FaRandom size={14} />
        <span>Trier par</span>
      </div>
      <div className="sort-options">
        {sortOptions.map(option => (
          <button
            key={option.value}
            className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
            onClick={() => handleSortChange(option.value)}
            title={`Trier par ${option.label}`}
          >
            <span className="sort-option-icon">{option.icon}</span>
            <span className="sort-option-label">{option.label}</span>
            {getSortIcon(option.value)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortControls;
