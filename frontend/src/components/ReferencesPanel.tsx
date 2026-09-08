import type { Reference } from '../types'

interface Props {
  references: Reference[]
}

export default function ReferencesPanel({ references }: Props) {
  if (references.length === 0) return null

  return (
    <div className="card">
      <div className="card-title">🎞 Screenplay References</div>
      <p className="section-label">{references.length} scene{references.length > 1 ? 's' : ''} retrieved from vector store</p>
      <div className="ref-list">
        {references.map(ref => (
          <div key={`${ref.movie_title}-${ref.scene_idx}`} className="ref-item">
            <div className="ref-header">
              <span className="ref-title">{ref.movie_title}</span>
              <span className="ref-badge">Scene {ref.scene_idx}</span>
            </div>
            <div className="ref-text">{ref.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
