export interface Movie {
  title: string
  year: string
  rating: number
  genre: string
  director: string
  overview: string
}

export interface Reference {
  movie_title: string
  scene_idx: number
  text: string
}

export interface ConsultResponse {
  advice: string
  references: Reference[]
  top_movies: Movie[]
}
