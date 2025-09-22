import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedPage from './pages/ProtectedPage';
import HistoryPage from './pages/HistoryPage';
import DetailsPage from './pages/DetailsPage';

const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/protected" element={<ProtectedPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/details/:reportId" element={<DetailsPage />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
