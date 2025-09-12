import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';

const LogoutButton = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <button onClick={handleLogout} className="login-btn" style={{marginTop: 16}}>
      Logout
    </button>
  );
};

export default LogoutButton;
