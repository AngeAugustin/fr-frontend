
import React from 'react';
import './AuthLayout.css';
import loginImage from '../assets/login.png';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-left">
        {children}
      </div>
      <div className="auth-right">
        <div className="auth-image-wrapper">
          <img src={loginImage} alt="Login" className="auth-image" />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
