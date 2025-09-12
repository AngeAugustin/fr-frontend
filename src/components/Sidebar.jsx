
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/A.png';
import { logout } from '../api/auth';
import { FaFileAlt, FaHistory, FaUserCircle } from 'react-icons/fa';


const Sidebar = () => {
  const [showLogout, setShowLogout] = React.useState(false);
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
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="sidebar-logo" />
      </div>
      <nav className="sidebar-nav"> 
        <ul>
          <li className={pathname === '/generate' ? 'active' : ''}>
            <Link to="/generate">
              <span className="sidebar-icon">
                <FaFileAlt size={20} />
              </span>
              Génération
            </Link>
          </li>
          <li className={pathname === '/history' ? 'active' : ''}>
            <Link to="/history">
              <span className="sidebar-icon">
                <FaHistory size={20} />
              </span>
              Historique
            </Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div
          className="sidebar-user"
          style={{display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer'}}
          onClick={() => setShowLogout(v => !v)}
        >
          <FaUserCircle size={36} className="sidebar-avatar" style={{marginRight: 8, color: '#1800ad'}} />
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
            <span className="sidebar-username" style={{fontWeight: 'bold', marginBottom: 0}}>{user.name}</span>
            {user.email && (
              <span className="sidebar-email" style={{ fontSize: '0.9em', color: '#555', marginTop: 0 }}>{user.email}</span>
            )}
          </div>
        </div>
        {showLogout && (
          <button className="sidebar-logout" onClick={handleLogout}>Déconnexion</button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
import React from 'react';
