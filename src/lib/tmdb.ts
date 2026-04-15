import type { TMDBMovie, TMDBMovieDetail, TMDBCredits } from '@/types'

const BASE = 'https://api.themoviedb.org/3'
// PERUBAHAN 1: Hapus NEXT_PUBLIC_ agar token tidak bocor ke browser.
// Pastikan kamu menggunakan Read Access Token yang panjang dari TMDB.
const TOKEN = process.env.TMDB_READ_ACCESS_TOKEN!
export const IMG = 'https://image.tmdb.org/t/p'

async function tmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${endpoint}`)
  url.searchParams.set('language', 'en-US')
  
  // Masukkan parameter tambahan jika ada
  Object.entries(params).forEach(([k, v]) => { 
    if (v) url.searchParams.set(k, v) 
  })

  // PERUBAHAN 2: Gunakan Header Authorization, bukan query param api_key
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${TOKEN}`
    },
    next: { revalidate: 3600 }
  }

  const res = await fetch(url.toString(), options)
  
  if (!res.ok) {
    throw new Error(`TMDB ${res.status} pada endpoint: ${endpoint}`)
  }
  
  return res.json()
}

// ── DISCOVER ──
export async function discoverMovies(params: {
  sort_by?: string
  with_genres?: string
  primary_release_year?: string
  'vote_average.gte'?: string
  'vote_count.gte'?: string
  page?: string
}): Promise<{ results: TMDBMovie[]; total_pages: number; total_results: number }> {
  return tmdb('/discover/movie', {
    'vote_count.gte': '100',
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v ?? '')])),
  })
}

// ── NOW PLAYING (for hero) ──
export async function getNowPlaying(): Promise<{ results: TMDBMovie[] }> {
  return tmdb('/movie/now_playing', { page: '1' })
}

// ── TRENDING ──
export async function getTrending(): Promise<{ results: TMDBMovie[] }> {
  return tmdb('/trending/movie/week')
}

// ── DETAIL ──
export async function getMovieDetail(id: number): Promise<TMDBMovieDetail> {
  return tmdb(`/movie/${id}`, { append_to_response: 'videos' })
}

// ── CREDITS ──
export async function getMovieCredits(id: number): Promise<TMDBCredits> {
  return tmdb(`/movie/${id}/credits`)
}

// ── SEARCH ──
export async function searchMovies(query: string, page = 1): Promise<{ results: TMDBMovie[] }> {
  return tmdb('/search/movie', { query, page: String(page) })
}

// ── SIMILAR ──
export async function getSimilarMovies(id: number): Promise<{ results: TMDBMovie[] }> {
  return tmdb(`/movie/${id}/similar`)
}

// ── HELPERS ──
export function posterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w342') {
  return path ? `${IMG}/${size}${path}` : null
}

export function backdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280') {
  return path ? `${IMG}/${size}${path}` : null
}

export const GENRES = [
  { id: '',    name: 'All' },
  { id: '28',  name: 'Action' },
  { id: '18',  name: 'Drama' },
  { id: '878', name: 'Sci-Fi' },
  { id: '53',  name: 'Thriller' },
  { id: '35',  name: 'Comedy' },
  { id: '27',  name: 'Horror' },
  { id: '16',  name: 'Animation' },
  { id: '10749', name: 'Romance' },
  { id: '99',  name: 'Documentary' },
  { id: '14',  name: 'Fantasy' },
  { id: '80',  name: 'Crime' },
] as const