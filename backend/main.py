"""
Muse – Screenplay Reference Assistant
FastAPI backend that wraps the ChromaDB + SQLite + Gemini pipeline.
"""

import os
import sqlite3
from pathlib import Path
from typing import Optional

import chromadb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from pydantic import BaseModel
from dotenv import load_dotenv

app = FastAPI(title="Muse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(Path(__file__).resolve().parent / ".env")
SQLITE_DB = os.environ.get("SQLITE_DB_PATH", str(PROJECT_ROOT / "movies_metadata.db"))
CHROMA_PATH = os.environ.get("CHROMA_PATH", str(PROJECT_ROOT / "screenplay_db"))

_chroma_client = None
_dialogue_collection = None


def get_collection():
    global _chroma_client, _dialogue_collection
    if _dialogue_collection is None:
        _chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
        _dialogue_collection = _chroma_client.get_or_create_collection(
            name="screenplay_dialogues"
        )
    return _dialogue_collection


def search_top_movies(
    genre: Optional[str], min_rating: float = 8.0, limit: int = 5
) -> list[dict]:
    conn = sqlite3.connect(SQLITE_DB)
    cursor = conn.cursor()
    query = (
        "SELECT Series_Title, Released_Year, IMDB_Rating, Genre, Director, Overview "
        "FROM movies WHERE IMDB_Rating >= ?"
    )
    params: list = [min_rating]
    if genre:
        query += " AND Genre LIKE ?"
        params.append(f"%{genre}%")
    query += " ORDER BY IMDB_Rating DESC LIMIT ?"
    params.append(limit)
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "title": row[0],
            "year": row[1],
            "rating": row[2],
            "genre": row[3],
            "director": row[4],
            "overview": row[5],
        }
        for row in rows
    ]


def search_dialogue_and_scenes(
    query: str, movie_title: Optional[str] = None, limit: int = 2
) -> list[dict]:
    collection = get_collection()
    if collection.count() == 0:
        return []
    limit = max(1, min(limit, collection.count()))
    where_filter = {"movie_title": movie_title} if movie_title else None
    query_args = {"query_texts": [query], "n_results": limit}
    if where_filter:
        query_args["where"] = where_filter
    results = collection.query(**query_args)
    if not results or not results["documents"][0]:
        return []
    return [
        {
            "movie_title": metadata["movie_title"],
            "scene_idx": metadata["scene_idx"],
            "text": document,
        }
        for document, metadata in zip(
            results["documents"][0], results["metadatas"][0]
        )
    ]


class ConsultRequest(BaseModel):
    scene_idea: str
    genre: str
    min_rating: float = 8.0


class ConsultResponse(BaseModel):
    advice: str
    references: list[dict]
    top_movies: list[dict]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/consult", response_model=ConsultResponse)
def consult(req: ConsultRequest):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")

    references = search_dialogue_and_scenes(req.scene_idea, limit=2)
    top_movies = search_top_movies(req.genre, min_rating=req.min_rating, limit=3)

    raw_refs = "\n\n".join(
        f"=== Film: {ref['movie_title']} (Scene {ref['scene_idx']}) ===\n{ref['text']}"
        for ref in references
    ) or "No screenplay references found in the indexed database."

    movie_context = "\n\n".join(
        f"Title: {movie['title']} ({movie['year']})\n"
        f"Rating: {movie['rating']} | Genre: {movie['genre']}\n"
        f"Director: {movie['director']}\nLogline: {movie['overview']}"
        for movie in top_movies
    ) or "No matching movies found."

    system_instruction = (
        "You are an expert Hollywood Screenwriting Consultant. "
        "Analyze the screenplay excerpts provided from the IMDb Top 1000 database.\n"
        "Help the writer pick out a popular quote from the movie that can be referenced "
        "by the writer in the script they provided.\n"
    )

    user_message = f"""
Writer's goal/scene idea:
"{req.scene_idea}"

Screenplay References retrieved:
{raw_refs}

Top Film Suggestions:
{movie_context}
"""

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-flash-lite-latest",
        contents=f"{system_instruction}\n\n{user_message}",
    )

    return ConsultResponse(
        advice=response.text,
        references=references,
        top_movies=top_movies,
    )
