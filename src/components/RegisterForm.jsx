import React, { useState } from 'react';
import GoogleButton from './GoogleButton';
import './LoginForm.css';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ username, email, password });
      navigate('/login');
    } catch (err) {
      setError(err?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h1 style={{ color: '#1800ad' }}>Créer votre compte</h1>
      <p className="login-subtext">Inscrivez-vous pour commencer</p>
      <GoogleButton />
      <div className="login-separator">
        <span>ou</span>
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div style={{color: 'red', marginBottom: 8}}>{error}</div>}
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="login-input"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="login-input"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="login-input"
          required
        />
  <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Inscription...' : 'S\'inscrire'}</button>
      </form>
      <div className="login-bottom-text">
        Avez-vous un compte ? <Link to="/login" className="login-signup">Se connecter</Link>
      </div>
    </div>
  );
};

export default RegisterForm;
