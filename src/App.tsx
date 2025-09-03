import React from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Login } from './components/Login'
import { Register } from './components/Register'
import { Dashboard } from './components/Dashboard'
import { SharedNote } from './components/SharedNote'
import { AuthProvider, useAuth } from './context/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/shared/:noteId" element={<SharedNote />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth()
  
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Verifying authentication...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

export default App
