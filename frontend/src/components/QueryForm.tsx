const GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Film-Noir',
  'History',
  'Horror',
  'Music',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sport',
  'Thriller',
  'War',
  'Western',
]

interface Props {
  value: string
  onChange: (v: string) => void
  minRating: number
  onMinRatingChange: (v: number) => void
}

export default function QueryForm({ value, onChange, minRating, onMinRatingChange }: Props) {
  return (
    <>
      <div className="form-group">
        <label className="form-label" htmlFor="genre">Genre</label>
        <select
          id="genre"
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">— Any genre —</option>
          {GENRES.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="rating">
          Min IMDb Rating
        </label>
        <div className="range-row">
          <input
            id="rating"
            type="range"
            min={7}
            max={9.5}
            step={0.1}
            value={minRating}
            onChange={e => onMinRatingChange(parseFloat(e.target.value))}
          />
          <span className="range-value">★ {minRating.toFixed(1)}</span>
        </div>
      </div>
    </>
  )
}
