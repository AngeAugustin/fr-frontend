import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedPage from './pages/ProtectedPage';
import GeneratePage from './pages/GeneratePage';
import HistoryPage from './pages/HistoryPage';

const Router = () => (
  <BrowserRouter>
    <Routes>
  <Route path="/" element={<Navigate to="/login" />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/protected" element={<ProtectedPage />} />
  <Route path="/generate" element={<GeneratePage />} />
  <Route path="/history" element={<HistoryPage />} />
    </Routes>
  </BrowserRouter>
);

export default Router;
