// React import removed as it's not needed in React 17+

interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
  is_public: boolean
  owner_id: number
}

interface NoteCardProps {
  note: Note
  onEdit: () => void
  onDelete: () => void
  onShare: (isPublic: boolean) => void
}

export function NoteCard({ note, onEdit, onDelete, onShare }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  return (
    <div className="note-card">
      <div className="note-header">
        <h3 className="note-title">{note.title}</h3>
        <div className="note-actions">
          <button onClick={onEdit} className="btn-icon" title="Edit">
            ✏️
          </button>
          <button onClick={onDelete} className="btn-icon" title="Delete">
            🗑️
          </button>
          <button 
            onClick={() => onShare(!note.is_public)} 
            className={`btn-icon ${note.is_public ? 'shared' : ''}`}
            title={note.is_public ? 'Stop sharing' : 'Share note'}
          >
            {note.is_public ? '🔗' : '🔒'}
          </button>
        </div>
      </div>
      
      <div className="note-content">
        <p>{truncateContent(note.content)}</p>
      </div>
      
      <div className="note-footer">
        <div className="note-meta">
          <small>Created: {formatDate(note.created_at)}</small>
          {note.updated_at !== note.created_at && (
            <small>Updated: {formatDate(note.updated_at)}</small>
          )}
        </div>
        
        {note.is_public && (
          <div className="sharing-indicator">
            <span className="share-badge">Public</span>
          </div>
        )}
      </div>
    </div>
  )
}