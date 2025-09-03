import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  is_public: boolean
  owner_id: number
}

interface PublicNote extends Note {
  owner_username?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function SharedNote() {
  const { noteId } = useParams<{ noteId: string }>()
  const navigate = useNavigate()
  const [note, setNote] = useState<PublicNote | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSharedNote()
  }, [noteId])

  const fetchSharedNote = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shared/${noteId}`)
      setNote(response.data)
    } catch (err) {
      setError('Note not found or not publicly shared')
    } finally {
      setLoading(false)
    }
  }

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  const copyShareUrl = () => {
    const shareUrl = window.location.href
    navigator.clipboard.writeText(shareUrl)
    alert('Share URL copied to clipboard!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return formatDate(dateString)
  }

  if (loading) {
    return (
      <div className="shared-note-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading shared note...</p>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="shared-note-error">
        <div className="error-content">
          <div className="error-icon">📄</div>
          <h2 className="error-title">Note Not Found</h2>
          <p className="error-message">
            {error || 'This note does not exist or is not publicly shared.'}
          </p>
          <div className="error-actions">
            <button onClick={goBack} className="btn-secondary-error">
              <span className="btn-icon">←</span>
              Go Back
            </button>
            <a href="/" className="btn-primary-error">
              <span className="btn-icon">🏠</span>
              Notes App Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="shared-note-page">
      <div className="shared-note-container">
        {/* Navigation Header */}
        <div className="shared-note-nav">
          <div className="nav-brand">
            <div className="brand-icon">📝</div>
            <div className="brand-info">
              <span className="brand-title">Notes App</span>
              <span className="brand-subtitle">Shared Knowledge</span>
            </div>
          </div>
          
          <div className="nav-actions">
            <button onClick={copyShareUrl} className="nav-action-btn" title="Copy share link">
              <span className="action-icon">🔗</span>
              <span className="action-text">Share</span>
            </button>
            <a href="/" className="nav-action-btn" title="Go to Notes App">
              <span className="action-icon">🏠</span>
              <span className="action-text">Home</span>
            </a>
          </div>
        </div>

        {/* Main Content */}
        <div className="shared-note-content">
          <article className="note-article">
            {/* Header */}
            <header className="note-header">
              <div className="note-title-section">
                <h1 className="note-title">{note.title}</h1>
                <div className="note-badge">
                  <span className="badge-icon">🌐</span>
                  <span className="badge-text">Public Note</span>
                </div>
              </div>
              
              {/* Author & Meta Info */}
              <div className="note-meta-section">
                {note.owner_username && (
                  <div className="note-author">
                    <div className="author-avatar">
                      <span className="avatar-icon">👤</span>
                    </div>
                    <div className="author-info">
                      <span className="author-label">Created by</span>
                      <span className="author-name">{note.owner_username}</span>
                    </div>
                  </div>
                )}
                
                <div className="note-timestamps">
                  <div className="timestamp-item">
                    <span className="timestamp-icon">📅</span>
                    <div className="timestamp-info">
                      <span className="timestamp-label">Created</span>
                      <span className="timestamp-value">{getRelativeTime(note.created_at)}</span>
                      <span className="timestamp-full">{formatDate(note.created_at)}</span>
                    </div>
                  </div>
                  
                  {note.updated_at !== note.created_at && (
                    <div className="timestamp-item">
                      <span className="timestamp-icon">✏️</span>
                      <div className="timestamp-info">
                        <span className="timestamp-label">Updated</span>
                        <span className="timestamp-value">{getRelativeTime(note.updated_at)}</span>
                        <span className="timestamp-full">{formatDate(note.updated_at)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>
            
            {/* Content */}
            <div className="note-body">
              <div className="note-content-text">
                {note.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="content-paragraph">
                    {paragraph || '\u00A0'} {/* Non-breaking space for empty lines */}
                  </p>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <footer className="note-footer">
              <div className="footer-info">
                <div className="info-item">
                  <span className="info-icon">📊</span>
                  <span className="info-text">{note.content.length} characters</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🗺️</span>
                  <span className="info-text">{note.content.split('\n').length} paragraphs</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🔗</span>
                  <span className="info-text">Shareable</span>
                </div>
              </div>
              
              <div className="footer-actions">
                <button onClick={copyShareUrl} className="footer-action-btn">
                  <span className="btn-icon">🔗</span>
                  Copy Link
                </button>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  )
}