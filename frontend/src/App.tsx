import { useState } from 'react'
import { consult } from './api'
import type { ConsultResponse } from './types'
import QueryForm from './components/QueryForm'
import AdviceCard from './components/AdviceCard'
import ReferencesPanel from './components/ReferencesPanel'
import MoviesPanel from './components/MoviesPanel'

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function App() {
  const [sceneIdea, setSceneIdea] = useState('')
  const [genre, setGenre] = useState('')
  const [minRating, setMinRating] = useState(8.0)

  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<ConsultResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sceneIdea.trim()) return
    setStatus('loading')
    setResult(null)
    setErrorMsg('')
    try {
      const data = await consult(sceneIdea, genre, minRating)
      setResult(data)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  const canSubmit = sceneIdea.trim().length > 0 && status !== 'loading'

  return (
    <div className="app">
      <header className="app-header">
        <span className="logo-icon">🎬</span>
        <div>
          <h1>Muse</h1>
          <p>Screenplay Reference Assistant · Find the perfect cinematic quote for your scene</p>
        </div>
      </header>

      <main className="app-body">
        {/* ── Left panel: input form ── */}
        <aside>
          <form onSubmit={handleSubmit}>
            <div className="card">
              <div className="card-title">✍ Your Scene</div>

              <div className="form-group">
                <label className="form-label" htmlFor="scene">Scene idea or description</label>
                <textarea
                  id="scene"
                  placeholder="e.g. A detective confronts a villain in a rainy alley and they talk about destiny…"
                  value={sceneIdea}
                  onChange={e => setSceneIdea(e.target.value)}
                />
              </div>

              <QueryForm
                value={genre}
                onChange={setGenre}
                minRating={minRating}
                onMinRatingChange={setMinRating}
              />

              <button
                type="submit"
                className="btn-primary"
                disabled={!canSubmit}
              >
                {status === 'loading' ? (
                  <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Consulting…
                  </>
                ) : (
                  <>✦ Get Screenplay Advice</>
                )}
              </button>
            </div>
          </form>
        </aside>

        {/* ── Right panel: results ── */}
        <section className="results-panel">
          {status === 'idle' && (
            <div className="empty-state">
              <span className="empty-icon">🎭</span>
              <p>
                Describe your scene, choose a genre and hit <strong>Get Screenplay Advice</strong> to find
                cinematic references from the IMDb Top 1000.
              </p>
            </div>
          )}

          {status === 'loading' && (
            <div className="spinner-wrap">
              <div className="spinner" />
              <p>Searching screenplays and consulting Gemini…</p>
            </div>
          )}

          {status === 'error' && (
            <div className="error-box">
              <span>⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {status === 'done' && result && (
            <>
              <AdviceCard advice={result.advice} />
              <ReferencesPanel references={result.references} />
              <MoviesPanel movies={result.top_movies} />
            </>
          )}
        </section>
      </main>
    </div>
  )
}
