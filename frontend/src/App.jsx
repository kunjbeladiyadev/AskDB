import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AskDBChat from './pages/AskDBChat';
import DatabasePage from './pages/Database';
import SchemaExplorer from './pages/SchemaExplorer';
import QueryHistory from './pages/QueryHistory';
import SettingsPage from './pages/Settings';

// Route Protection Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    // Redirect unauthorized users to login
    return <Navigate to="/login" replace={true} />;
  }

  return children;
};

// Redirect Authed Users away from login/signup
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace={true} />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {/* Toast notifications config */}
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-dark-card dark:text-dark-text border dark:border-dark-border text-xs font-semibold rounded-xl p-3.5',
              duration: 3000,
            }}
          />
          <Routes>
            {/* Public Marketing Route */}
            <Route path="/" element={<Landing />} />

            {/* Auth Routes (Guest Only) */}
            <Route path="/login" element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            } />
            <Route path="/signup" element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            } />

            {/* Application Dashboard Routes (Protected) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <AskDBChat />
              </ProtectedRoute>
            } />
            <Route path="/databases" element={
              <ProtectedRoute>
                <DatabasePage />
              </ProtectedRoute>
            } />
            <Route path="/schema" element={
              <ProtectedRoute>
                <SchemaExplorer />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <QueryHistory />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace={true} />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
