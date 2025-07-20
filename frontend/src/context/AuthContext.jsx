import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.user)
      setIsAuthenticated(true)
    } catch (error) {
      // Try to refresh token
      try {
        await api.post('/auth/refresh')
        const response = await api.get('/auth/me')
        setUser(response.data.user)
        setIsAuthenticated(true)
      } catch (refreshError) {
        setUser(null)
        setIsAuthenticated(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      setUser(response.data.user)
      setIsAuthenticated(true)
      return { success: true, user: response.data.user }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      setUser(response.data.user)
      setIsAuthenticated(true)
      return { success: true, user: response.data.user }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      // This would typically call an update profile endpoint
      // For now, we'll just update the local user state
      const updatedUser = { ...user, ...profileData }
      setUser(updatedUser)
      return { success: true, user: updatedUser }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      }
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}