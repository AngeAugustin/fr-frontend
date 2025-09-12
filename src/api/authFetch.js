// Utilitaire pour requêtes protégées avec gestion du token et refresh
import { getAccessToken, getRefreshToken, refreshToken, setTokens, logout } from './auth';

export async function authFetch(url, options = {}) {
  let access = getAccessToken();
  if (!options.headers) options.headers = {};
  options.headers['Authorization'] = `Bearer ${access}`;

  let res = await fetch(url, options);
  if (res.status === 401 && getRefreshToken()) {
    // Token expiré, on tente le refresh
    try {
      const data = await refreshToken(getRefreshToken());
      setTokens({ access: data.access, refresh: getRefreshToken() });
      options.headers['Authorization'] = `Bearer ${data.access}`;
      res = await fetch(url, options);
    } catch {
      logout();
      throw new Error('Session expired, please login again');
    }
  }
  return res;
}
