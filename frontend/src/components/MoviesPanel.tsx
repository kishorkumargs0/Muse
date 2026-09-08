import type { Movie } from '../types'

interface Props {
  movies: Movie[]
}

export default function MoviesPanel({ movies }: Props) {
  if (movies.length === 0) return null

  return (
    <div className="card">
      <div className="card-title">🏆 Top Matching Films</div>
      <p className="section-label">{movies.length} film{movies.length > 1 ? 's' : ''} from IMDb Top 1000</p>
      <div className="movie-list">
        {movies.map(m => (
          <div key={m.title} className="movie-item">
            <span className="movie-title">{m.title} ({m.year})</span>
            <span className="movie-rating">★ {m.rating}</span>
            <span className="movie-meta">{m.genre} · {m.director}</span>
            <span className="movie-overview">{m.overview}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
