export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids: number[]
}

export interface TMDBMovieDetail extends TMDBMovie {
  runtime: number | null
  genres: { id: number; name: string }[]
  tagline: string
  budget: number
  revenue: number
  videos?: {
    results: { key: string; site: string; type: string }[]
  }
}

export interface TMDBCredits {
  cast: { id: number; name: string; character: string; profile_path: string | null }[]
  crew: { id: number; name: string; job: string }[]
}

export interface WatchlistItem {
  id: string
  user_id: string
  movie_id: number
  movie_title: string
  movie_poster: string | null
  added_at: string
}

export interface Rating {
  id: string
  user_id: string
  movie_id: number
  movie_title: string
  score: number
  rated_at: string
}

export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

export interface GenreFilter {
  id: number | ''
  name: string
}

export interface Comment {
  id: string
  user_id: string
  movie_id: number
  content: string
  created_at: string
  profiles?: Profile | null
}
