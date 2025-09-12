import React from "react";
import "./ContextMenu.css";

export default function ContextMenu({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="context-menu-overlay" onClick={onClose}>
      <div className="context-menu" onClick={e => e.stopPropagation()}>
        <button className="context-menu-close" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
}
