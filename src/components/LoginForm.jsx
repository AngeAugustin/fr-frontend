import React, { useState } from 'react';
import GoogleButton from './GoogleButton';
import './LoginForm.css';
import { Link, useNavigate } from 'react-router-dom';
import { login, setTokens } from '../api/auth';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login({ username, password });
      setTokens(data);
      // Stocker username et email si présents dans la réponse
      if (data.username) localStorage.setItem('username', data.username);
      if (data.email) localStorage.setItem('email', data.email);
      // Optionnel : stocker le remember dans localStorage
      if (remember) localStorage.setItem('remember', 'true');
      else localStorage.removeItem('remember');
      navigate('/history');
    } catch (err) {
      setError(err?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <h1 style={{ color: '#1800ad' }}>Bon retour !</h1>
      <p className="login-subtext">Veuillez entrer vos identifiants</p>
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
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="login-input"
          required
        />
        <div className="login-options">
          <label className="login-checkbox-label">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />
            Se souvenir de moi
          </label>
          <a href="#" className="login-forgot">Mot de passe oublié ?</a>
        </div>
        <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
      </form>
      <div className="login-bottom-text">
        Vous n'avez pas de compte ? <Link to="/register" className="login-signup">S'inscrire</Link>
      </div>
    </div>
  );
};

export default LoginForm;
