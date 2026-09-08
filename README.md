# Muse 🎬

**Screenplay Reference Assistant** — helps scriptwriters find apt cinematic references and
iconic quotes from popular movies for the scenes they are writing.

---

## How it works

1. You describe your scene idea in plain English.
2. The backend performs a **semantic vector search** across indexed screenplay scenes (ChromaDB).
3. It also queries the **IMDb Top 1000 SQLite database** for highly-rated films in your chosen genre.
4. Both context sets are passed to **Gemini**, which produces tailored screenplay advice with recommended quotes.

---

## Project structure

```
muse/
├── Agentic_Cinema_Hackathon.ipynb   # original data-ingestion + agent notebook
├── backend/
│   ├── main.py                      # FastAPI server
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── vite.config.ts
    ├── package.json
    └── src/
        ├── App.tsx
        ├── api.ts
        ├── types.ts
        ├── index.css
        └── components/
            ├── QueryForm.tsx
            ├── AdviceCard.tsx
            ├── ReferencesPanel.tsx
            └── MoviesPanel.tsx
```

---

## Setup

### 1 — Seed the databases (run once)

Open and run **all cells** in `Agentic_Cinema_Hackathon.ipynb` (locally or on Colab).  
This will produce:

| Artifact | Path |
|---|---|
| SQLite movie metadata | `movies_metadata.db` |
| ChromaDB vector store | `screenplay_db/` |

Copy both into the project root (same directory as this README).

### 2 — Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Create your private local configuration, then add your own Gemini API key
cp .env.example .env
# Edit .env and replace add_your_own_key_here with your key

# Optional – override DB paths
# export SQLITE_DB_PATH=../movies_metadata.db
# export CHROMA_PATH=../screenplay_db

uvicorn main:app --reload --port 8000
```

`backend/.env` is intentionally excluded from Git. Each teammate should create
their own copy from `.env.example`; never commit a real API key.

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`.

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

> The Vite dev server proxies `/api/*` → `http://localhost:8000` automatically.

### Production build

```bash
cd frontend && npm run build
# Serve dist/ with any static host, or mount it from FastAPI's StaticFiles.
```

---

## API

`POST /api/consult`

```json
{
  "scene_idea": "A detective confronts a villain in a rainy alley…",
  "genre": "Crime",
  "min_rating": 8.0
}
```

Response:

```json
{
  "advice": "...(Gemini markdown)...",
  "references": [{ "movie_title": "Se7en", "scene_idx": 3, "text": "..." }],
  "top_movies": [{ "title": "The Godfather", "year": "1972", "rating": 9.2, ... }]
}
```
