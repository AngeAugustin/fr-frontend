import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../assets/A.png';
import { logout } from '../api/auth';
import { FaHistory, FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const isActive = (path) => pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo et titre */}
        <div className="header-brand">
          <Link to="/history" className="brand-link">
            <img src={logo} alt="Logo" className="header-logo" />
            <span className="brand-title">Financial Reports</span>
          </Link>
        </div>

        {/* Navigation desktop */}
        <nav className="header-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link 
                to="/history" 
                className={`nav-link ${isActive('/history') ? 'active' : ''}`}
              >
                <FaHistory size={18} />
                <span>Historique</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Menu utilisateur */}
        <div className="header-user">
          <div className="user-menu">
            <button 
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={`${user.name} - ${user.email}`}
            >
              <FaUserCircle size={32} className="user-avatar" />
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <FaUserCircle size={40} className="dropdown-avatar" />
                  <div>
                    <div className="dropdown-name">{user.name}</div>
                    <div className="dropdown-email">{user.email}</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item user-dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt size={16} />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Menu mobile */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              <li className="mobile-nav-item">
                <Link 
                  to="/history" 
                  className={`mobile-nav-link ${isActive('/history') ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaHistory size={18} />
                  <span>Historique</span>
                </Link>
              </li>
            </ul>
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <FaUserCircle size={32} className="mobile-user-avatar" />
                <div>
                  <div className="mobile-user-name">{user.name}</div>
                  <div className="mobile-user-email">{user.email}</div>
                </div>
              </div>
              <button 
                className="mobile-logout-btn"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <FaSignOutAlt size={16} />
                <span>Déconnexion</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
