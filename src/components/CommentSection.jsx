import React, { useState } from 'react';
import { FaComment, FaEdit, FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import { addOrUpdateComment, deleteComment } from '../api/comments';
import { toast } from 'react-toastify';
import './CommentSection.css';

const CommentSection = ({ 
  generatedFileId, 
  groupName, 
  initialComment, 
  onCommentUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(initialComment || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setComment(initialComment || '');
  };

  const handleSave = async () => {
    if (comment.length > 2000) {
      toast.error('Le commentaire ne peut pas dépasser 2000 caractères');
      return;
    }

    setIsLoading(true);
    try {
      await addOrUpdateComment(generatedFileId, comment);
      setIsEditing(false);
      onCommentUpdate(comment);
      toast.success('Commentaire sauvegardé avec succès');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la sauvegarde du commentaire');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteComment(generatedFileId);
      setComment('');
      setIsEditing(false);
      onCommentUpdate('');
      toast.success('Commentaire supprimé avec succès');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression du commentaire');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-header">
        <div className="comment-title">
          <FaComment size={14} />
          <span>Commentaire - {groupName}</span>
        </div>
        {!isEditing && (
          <div className="comment-actions">
            <button 
              className="comment-btn edit-btn"
              onClick={handleEdit}
              title="Modifier le commentaire"
            >
              <FaEdit size={12} />
            </button>
            {comment && (
              <button 
                className="comment-btn delete-btn"
                onClick={handleDelete}
                disabled={isLoading}
                title="Supprimer le commentaire"
              >
                <FaTrash size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="comment-content">
        {isEditing ? (
          <div className="comment-edit">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ajoutez un commentaire pour cette feuille maîtresse..."
              maxLength={2000}
              className="comment-textarea"
              disabled={isLoading}
            />
            <div className="comment-edit-actions">
              <div className="comment-char-count">
                {comment.length}/2000 caractères
              </div>
              <div className="comment-edit-buttons">
                <button 
                  className="comment-btn cancel-btn"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <FaTimes size={12} />
                  Annuler
                </button>
                <button 
                  className="comment-btn save-btn"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  <FaSave size={12} />
                  {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
            <div className="comment-help">
              <small>💡 Astuce : Ctrl+Entrée pour sauvegarder, Échap pour annuler</small>
            </div>
          </div>
        ) : (
          <div className="comment-display">
            {comment ? (
              <div className="comment-text">
                {comment}
              </div>
            ) : (
              <div className="comment-placeholder">
                <FaComment size={20} />
                <p>Aucun commentaire pour cette feuille maîtresse</p>
                <button 
                  className="add-comment-btn"
                  onClick={handleEdit}
                >
                  <FaEdit size={12} />
                  Ajouter un commentaire
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
