// API Comments functions
import { authFetch } from './authFetch';

const API_URL = 'http://127.0.0.1:8000/api';

/**
 * Ajouter ou mettre à jour un commentaire pour une feuille maîtresse
 * @param {number} generatedFileId - ID de la feuille maîtresse
 * @param {string} comment - Le commentaire à ajouter/modifier
 * @returns {Promise<Object>} Réponse de l'API
 */
export async function addOrUpdateComment(generatedFileId, comment) {
  const res = await authFetch(`${API_URL}/reports/comment/${generatedFileId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment })
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.detail || `Erreur ${res.status}: ${res.statusText}`);
  }
  
  return await res.json();
}

/**
 * Récupérer l'historique avec les commentaires
 * @returns {Promise<Object>} Historique avec commentaires
 */
export async function getHistoryWithComments() {
  const res = await authFetch(`${API_URL}/reports/balance-history/`);
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.detail || `Erreur ${res.status}: ${res.statusText}`);
  }
  
  return await res.json();
}

/**
 * Supprimer un commentaire (mettre à null)
 * @param {number} generatedFileId - ID de la feuille maîtresse
 * @returns {Promise<Object>} Réponse de l'API
 */
export async function deleteComment(generatedFileId) {
  const res = await authFetch(`${API_URL}/reports/comment/${generatedFileId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment: null })
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || errorData.detail || `Erreur ${res.status}: ${res.statusText}`);
  }
  
  return await res.json();
}
