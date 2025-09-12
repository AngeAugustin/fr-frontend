// API Auth functions
const API_URL = 'http://127.0.0.1:8000/api';

export async function register({ username, email, password }) {
  const res = await fetch(`${API_URL}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function login({ username, password }) {
  const res = await fetch(`${API_URL}/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function refreshToken(refresh) {
  const res = await fetch(`${API_URL}/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh })
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}


export async function logout() {
  const access = getAccessToken();
  try {
    await fetch(`${API_URL}/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': access ? `Bearer ${access}` : undefined
      }
    });
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    // Optionnel : gérer l'erreur
  }
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
}

export function setTokens({ access, refresh }) {
  localStorage.setItem('access', access);
  localStorage.setItem('refresh', refresh);
}

export function getAccessToken() {
  return localStorage.getItem('access');
}

export function getRefreshToken() {
  return localStorage.getItem('refresh');
}
