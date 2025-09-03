import { useState, useEffect } from 'react'
import axios from 'axios'

interface PublicNote {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  is_public: boolean
  owner_id: number
  owner_username: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function PublicNotes() {
  const [publicNotes, setPublicNotes] = useState<PublicNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPublicNotes()
  }, [])

  const fetchPublicNotes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/public-notes`)
      setPublicNotes(response.data)
    } catch (err) {
      setError('Failed to fetch public notes')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const copyShareUrl = (noteId: number) => {
    const shareUrl = `${window.location.origin}/shared/${noteId}`
    navigator.clipboard.writeText(shareUrl)
    alert('Share URL copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="public-notes-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading public notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="public-notes-container">
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      <div className="section-header">
        <div className="section-title-area">
          <h2 className="section-title">
            <span className="section-icon">🌐</span>
            Explore Public Notes
          </h2>
          <p className="section-subtitle">Discover notes shared by the community</p>
        </div>
        <div className="notes-count">
          <span className="count-number">{publicNotes.length}</span>
          <span className="count-label">{publicNotes.length === 1 ? 'public note' : 'public notes'}</span>
        </div>
      </div>

      <div className="public-notes-grid">
        {publicNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌍</div>
            <h3 className="empty-title">No public notes yet</h3>
            <p className="empty-description">
              Be the first to share your knowledge with the community!<br />
              Create a note and click the share button to make it public.
            </p>
          </div>
        ) : (
          publicNotes.map(note => (
            <div key={note.id} className="public-note-card">
              <div className="note-header">
                <div className="note-title-section">
                  <h3 className="note-title">{note.title}</h3>
                  <div className="note-author">
                    <span className="author-icon">👤</span>
                    <span className="author-name">by {note.owner_username}</span>
                  </div>
                </div>
                <div className="note-actions">
                  <button 
                    onClick={() => copyShareUrl(note.id)}
                    className="action-btn share-btn"
                    title="Copy share link"
                  >
                    🔗
                  </button>
                  <a 
                    href={`/shared/${note.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn view-btn"
                    title="View full note"
                  >
                    👁️
                  </a>
                </div>
              </div>
              
              <div className="note-content">
                <p className="content-preview">
                  {truncateContent(note.content)}
                </p>
              </div>
              
              <div className="note-footer">
                <div className="note-meta">
                  <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    <span className="meta-text">Created {formatDate(note.created_at)}</span>
                  </div>
                  {note.updated_at !== note.created_at && (
                    <div className="meta-item">
                      <span className="meta-icon">✏️</span>
                      <span className="meta-text">Updated {formatDate(note.updated_at)}</span>
                    </div>
                  )}
                </div>
                <div className="public-badge">
                  <span className="badge-icon">🌐</span>
                  <span className="badge-text">Public</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}