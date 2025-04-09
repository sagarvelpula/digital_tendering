
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Redirect to Dashboard if authenticated, otherwise to Login
const Index = () => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />;
};

export default Index;
