// src/app/actions.ts
'use server'

import { discoverMovies, searchMovies, getMovieDetail, getMovieCredits } from '@/lib/tmdb'

export async function fetchFilteredMovies(params: Record<string, string>) {
  return discoverMovies(params)
}

export async function fetchSearchMovies(query: string) {
  return searchMovies(query)
}

// --- TAMBAHKAN DUA FUNGSI INI ---
export async function fetchMovieDetailSafe(id: number) {
  return getMovieDetail(id)
}

export async function fetchMovieCreditsSafe(id: number) {
  return getMovieCredits(id)
}