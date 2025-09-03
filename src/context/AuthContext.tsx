import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: number
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Utility function to check if token exists
const getStoredToken = (): string | null => {
  return localStorage.getItem('token')
}

// Utility function to check if user is authenticated
const isTokenValid = (): boolean => {
  const token = getStoredToken()
  if (!token) return false
  
  try {
    // Basic JWT token structure check
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // Decode payload to check expiration (optional)
    const payload = JSON.parse(atob(parts[1]))
    const now = Date.now() / 1000
    
    return payload.exp > now
  } catch (error) {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()
    setupAxiosInterceptors()
  }, [])

  const setupAxiosInterceptors = () => {
    // Response interceptor to handle token expiration
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          console.log('Token expired, logging out...')
          logout()
        }
        return Promise.reject(error)
      }
    )
  }

  const initializeAuth = async () => {
    const token = getStoredToken()
    if (token && isTokenValid()) {
      // Set the authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      try {
        // Verify token and get user info from /me endpoint
        const response = await axios.get(`${API_BASE_URL}/auth/me`)
        setUser(response.data)
      } catch (error) {
        // Token is invalid or expired
        console.log('Token verification failed:', error)
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        setUser(null)
      }
    } else {
      // Token doesn't exist or is invalid
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
    }
    setLoading(false)
  }

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      })
      
      const { access_token } = response.data
      
      // Store token and set authorization header
      localStorage.setItem('token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // Get user info from /me endpoint
      const userResponse = await axios.get(`${API_BASE_URL}/auth/me`)
      setUser(userResponse.data)
    } catch (error) {
      // Clean up on login failure
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      throw new Error('Login failed')
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password
      })
      
      // Auto-login after registration
      await login(username, password)
    } catch (error) {
      throw new Error('Registration failed')
    }
  }

  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    
    // Optional: Redirect to login page
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}