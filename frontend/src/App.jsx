import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import JobsPage from './pages/JobsPage'
import JobDetailsPage from './pages/JobDetailsPage'
import ProfilePage from './pages/ProfilePage'
import CandidatesPage from './pages/CandidatesPage'
import CreateJobPage from './pages/CreateJobPage'
import MyJobsPage from './pages/MyJobsPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/jobs" element={
                <ProtectedRoute>
                  <JobsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/jobs/:id" element={
                <ProtectedRoute>
                  <JobDetailsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Recruiter only routes */}
              <Route path="/candidates" element={
                <ProtectedRoute requireRole="recruiter">
                  <CandidatesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/create-job" element={
                <ProtectedRoute requireRole="recruiter">
                  <CreateJobPage />
                </ProtectedRoute>
              } />
              
              <Route path="/my-jobs" element={
                <ProtectedRoute requireRole="recruiter">
                  <MyJobsPage />
                </ProtectedRoute>
              } />
              
              {/* 404 page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App