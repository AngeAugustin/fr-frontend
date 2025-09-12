import React, { useEffect, useState } from 'react';
import { authFetch } from '../api/authFetch';
import LogoutButton from '../components/LogoutButton';

const ProtectedPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    authFetch('/api/protected-endpoint')
      .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err?.detail || 'Access denied'));
  }, []);

  return (
    <div style={{padding: 32}}>
      <h2>Protected Page</h2>
      {error && <div style={{color: 'red'}}>{error}</div>}
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Loading...</p>}
      <LogoutButton />
    </div>
  );
};

export default ProtectedPage;
