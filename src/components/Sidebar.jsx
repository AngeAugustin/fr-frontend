
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/A.png';
import { logout } from '../api/auth';
import { FaFileAlt, FaHistory, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useSidebar } from '../contexts/SidebarContext';

const Sidebar = () => {
  const [showLogout, setShowLogout] = useState(false);
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Récupérer les infos utilisateur depuis localStorage
  const username = localStorage.getItem('username');
  const email = localStorage.getItem('email');
  const user = {
    name: username || 'Utilisateur',
    email: email || '',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'Utilisateur')}&background=007bff&color=fff`,
  };


  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="sidebar-toggle" onClick={toggleSidebar} title={isCollapsed ? 'Développer le menu' : 'Réduire le menu'}>
          <span className="toggle-icon">
            {isCollapsed ? <FaBars size={16} /> : <FaTimes size={16} />}
          </span>
        </button>
        {!isCollapsed && <img src={logo} alt="Logo" className="sidebar-logo" />}
        {isCollapsed && <img src={logo} alt="Logo" className="sidebar-logo-mini" />}
      </div>
      <nav className="sidebar-nav"> 
        <ul>
          <li className={pathname === '/generate' ? 'active' : ''}>
            <Link to="/generate" title={isCollapsed ? 'Génération' : ''}>
              <span className="sidebar-icon">
                <FaFileAlt size={20} />
              </span>
              {!isCollapsed && <span className="sidebar-text">Génération</span>}
            </Link>
          </li>
          <li className={pathname === '/history' ? 'active' : ''}>
            <Link to="/history" title={isCollapsed ? 'Historique' : ''}>
              <span className="sidebar-icon">
                <FaHistory size={20} />
              </span>
              {!isCollapsed && <span className="sidebar-text">Historique</span>}
            </Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div
          className="sidebar-user"
          onClick={() => setShowLogout(v => !v)}
          title={isCollapsed ? `${user.name} - ${user.email}` : ''}
        >
          <FaUserCircle size={36} className="sidebar-avatar" />
          {!isCollapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-username">{user.name}</span>
              {user.email && (
                <span className="sidebar-email">{user.email}</span>
              )}
            </div>
          )}
        </div>
        {showLogout && !isCollapsed && (
          <button className="sidebar-logout" onClick={handleLogout}>Déconnexion</button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
