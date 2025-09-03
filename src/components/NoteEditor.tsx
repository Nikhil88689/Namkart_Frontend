import React, { useState, useEffect } from 'react'

interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  is_public: boolean
  owner_id: number
}

interface NoteEditorProps {
  note?: Note | null
  onSave: (title: string, content: string) => void
  onCancel: () => void
}

export function NoteEditor({ note, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
    } else {
      setTitle('')
      setContent('')
    }
  }, [note])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && content.trim()) {
      setIsSaving(true)
      try {
        await onSave(title.trim(), content.trim())
      } finally {
        setIsSaving(false)
      }
    }
  }

  return (
    <div className="note-editor-overlay">
      <div className="note-editor-container">
        <div className="note-editor">
          <div className="editor-header">
            <div className="editor-title-section">
              <div className="editor-icon">
                {note ? '✏️' : '✨'}
              </div>
              <div className="editor-title-text">
                <h2 className="editor-title">
                  {note ? 'Edit Note' : 'Create New Note'}
                </h2>
                <p className="editor-subtitle">
                  {note ? 'Make your changes below' : 'Capture your thoughts and ideas'}
                </p>
              </div>
            </div>
            <button onClick={onCancel} className="editor-close-btn">
              <span className="close-icon">×</span>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="editor-form">
            <div className="form-section">
              <div className="input-group-editor">
                <label htmlFor="note-title" className="input-label-editor">
                  <span className="label-icon">📝</span>
                  Title
                </label>
                <div className="input-wrapper-editor">
                  <input
                    type="text"
                    id="note-title"
                    className="form-input-editor"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your note a descriptive title..."
                    required
                    maxLength={100}
                  />
                  <div className="input-border"></div>
                </div>
              </div>
              
              <div className="input-group-editor">
                <label htmlFor="note-content" className="input-label-editor">
                  <span className="label-icon">📄</span>
                  Content
                </label>
                <div className="textarea-wrapper">
                  <textarea
                    id="note-content"
                    className="form-textarea-editor"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your note content here...\n\n• You can use bullet points\n• Add multiple paragraphs\n• Express your ideas freely"
                    rows={12}
                    required
                  />
                  <div className="textarea-border"></div>
                </div>
              </div>
            </div>
            
            <div className="editor-actions">
              <div className="action-info">
                <span className="char-count">
                  {content.length} characters
                </span>
              </div>
              <div className="action-buttons">
                <button 
                  type="button" 
                  onClick={onCancel} 
                  className="btn-cancel-editor"
                  disabled={isSaving}
                >
                  <span className="btn-icon">🚫</span>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`btn-save-editor ${isSaving ? 'saving' : ''}`}
                  disabled={isSaving || !title.trim() || !content.trim()}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-small"></span>
                      {note ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">{note ? '💾' : '✨'}</span>
                      {note ? 'Update Note' : 'Create Note'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}