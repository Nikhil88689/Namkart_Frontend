import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { NoteEditor } from './NoteEditor'
import { NoteCard } from './NoteCard'
import { PublicNotes } from './PublicNotes'

interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  is_public: boolean
  owner_id: number
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'my-notes' | 'public-notes'>('my-notes')
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notes`)
      setNotes(response.data)
    } catch (err) {
      setError('Failed to fetch notes')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNote = async (title: string, content: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/notes`, {
        title,
        content
      })
      setNotes([response.data, ...notes])
      setShowEditor(false)
    } catch (err) {
      setError('Failed to create note')
    }
  }

  const handleUpdateNote = async (id: number, title: string, content: string) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/notes/${id}`, {
        title,
        content
      })
      setNotes(notes.map(note => note.id === id ? response.data : note))
      setEditingNote(null)
      setShowEditor(false)
    } catch (err) {
      setError('Failed to update note')
    }
  }

  const handleDeleteNote = async (id: number) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/notes/${id}`)
      setNotes(notes.filter(note => note.id !== id))
    } catch (err) {
      setError('Failed to delete note')
    }
  }

  const handleShareNote = async (id: number, isPublic: boolean) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/notes/${id}/share`, {
        is_public: isPublic
      })
      
      setNotes(notes.map(note => 
        note.id === id ? { ...note, is_public: isPublic } : note
      ))
      
      if (isPublic && response.data.share_url) {
        const shareUrl = `${window.location.origin}${response.data.share_url}`
        navigator.clipboard.writeText(shareUrl)
        alert(`Note shared! URL copied to clipboard: ${shareUrl}`)
      } else {
        alert('Note sharing disabled')
      }
    } catch (err) {
      setError('Failed to update sharing settings')
    }
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setShowEditor(true)
  }

  const handleNewNote = () => {
    setEditingNote(null)
    setShowEditor(true)
  }

  const closeEditor = () => {
    setShowEditor(false)
    setEditingNote(null)
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-title">
              <div className="app-logo">
                <span className="logo-icon">📝</span>
                <h1 className="dashboard-title">My Notes</h1>
              </div>
              <p className="dashboard-subtitle">Organize your thoughts and ideas</p>
            </div>
            
            <div className="header-actions">
              <div className="user-info">
                <div className="user-avatar">
                  <span className="avatar-icon">👤</span>
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.username}</span>
                  <span className="user-role">Personal Workspace</span>
                </div>
              </div>
              
              <div className="action-buttons">
                <button onClick={handleNewNote} className="btn-primary-dashboard">
                  <span className="btn-icon">✨</span>
                  New Note
                </button>
                <button onClick={logout} className="btn-secondary-dashboard">
                  <span className="btn-icon">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
            <button onClick={() => setError('')} className="error-close">×</button>
          </div>
        )}

        {showEditor && (
          <NoteEditor
            note={editingNote}
            onSave={editingNote ? 
              (title: string, content: string) => handleUpdateNote(editingNote.id, title, content) :
              handleCreateNote
            }
            onCancel={closeEditor}
          />
        )}

        <main className="dashboard-content">
          <div className="content-tabs">
            <div className="tab-navigation">
              <button 
                className={`tab-button ${ activeTab === 'my-notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('my-notes')}
              >
                <span className="tab-icon">📝</span>
                <span className="tab-text">My Notes</span>
                <span className="tab-badge">{notes.length}</span>
              </button>
              <button 
                className={`tab-button ${ activeTab === 'public-notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('public-notes')}
              >
                <span className="tab-icon">🌐</span>
                <span className="tab-text">Explore Public</span>
              </button>
            </div>
          </div>

          {activeTab === 'my-notes' ? (
            <>
              <div className="content-header">
                <h2 className="section-title">Your Notes</h2>
                <div className="notes-count">
                  <span className="count-number">{notes.length}</span>
                  <span className="count-label">{notes.length === 1 ? 'note' : 'notes'}</span>
                </div>
              </div>
              
              <div className="notes-container">
                {notes.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3 className="empty-title">No notes yet</h3>
                    <p className="empty-description">Start your journey by creating your first note!</p>
                    <button onClick={handleNewNote} className="btn-primary-empty">
                      <span className="btn-icon">✨</span>
                      Create Your First Note
                    </button>
                  </div>
                ) : (
                  <div className="notes-grid">
                    {notes.map(note => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={() => handleEditNote(note)}
                        onDelete={() => handleDeleteNote(note.id)}
                        onShare={(isPublic: boolean) => handleShareNote(note.id, isPublic)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <PublicNotes />
          )}
        </main>
      </div>
    </div>
  )
}