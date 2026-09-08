import sqlite3
import chromadb
from mcp.server.mcpserver import MCPServer

mcp = MCPServer("ScreenplayReferenceServer")

# Connect to database and vector collection
chroma_client = chromadb.PersistentClient(path="./screenplay_db")
dialogue_collection = chroma_client.get_or_create_collection(name="screenplay_dialogues")
SQLITE_DB = "movies_metadata.db"

@mcp.tool()
def search_top_movies(genre: str = None, min_rating: float = 8.0, limit: int = 5) -> str:
    """Search IMDb Top 1000 movies by genre and rating."""
    conn = sqlite3.connect(SQLITE_DB)
    cursor = conn.cursor()
    query = "SELECT Series_Title, Released_Year, IMDB_Rating, Genre, Director, Overview FROM movies WHERE IMDB_Rating >= ?"
    params = [min_rating]
    if genre:
        query += " AND Genre LIKE ?"
        params.append(f"%{genre}%")
    query += " ORDER BY IMDB_Rating DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return "No movies found matching the criteria."

    results = []
    for r in rows:
        results.append(f"Title: {r[0]} ({r[1]})\nRating: {r[2]} | Genre: {r[3]}\nDirector: {r[4]}\nLogline: {r[5]}")
    return "\n\n".join(results)

@mcp.tool()
def search_dialogue_and_scenes(query: str, movie_title: str = None, limit: int = 2) -> str:
    """Semantic vector search across movie scenes and dialogues."""
    where_filter = {"movie_title": movie_title} if movie_title else None
    results = dialogue_collection.query(
        query_texts=[query],
        n_results=limit,
        where=where_filter
    )

    if not results or not results["documents"][0]:
        return "No matching dialogues or scenes found in the indexed scripts."

    output = []
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        output.append(f"=== Film: {meta['movie_title']} (Scene {meta['scene_idx']}) ===\n{doc}")
    return "\n\n".join(output)

if __name__ == "__main__":
    mcp.run(transport="stdio")
