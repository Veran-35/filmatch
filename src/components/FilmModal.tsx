'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Clock, Calendar, TrendingUp } from 'lucide-react'
import { fetchMovieDetailSafe, fetchMovieCreditsSafe } from '@/app/action'
import { backdropUrl } from '@/lib/tmdb'
import type { TMDBMovieDetail, TMDBCredits } from '@/types'
import WatchlistButton from './WatchlistButton'
import StarRating from './StarRating'
import CommentSection from './CommentSection'

interface Props {
  movieId: number | null
  onClose: () => void
}

export default function FilmModal({ movieId, onClose }: Props) {
  const [movie, setMovie] = useState<TMDBMovieDetail | null>(null)
  const [credits, setCredits] = useState<TMDBCredits | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (id: number) => {
    setLoading(true)
    setMovie(null)
    const [m, c] = await Promise.all([fetchMovieDetailSafe(id), fetchMovieCreditsSafe(id)])
    setMovie(m)
    setCredits(c)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (movieId) { load(movieId) }
  }, [movieId, load])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // lock scroll
  useEffect(() => {
    document.body.style.overflow = movieId ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [movieId])

  if (!movieId) return null

  const backdrop = movie ? backdropUrl(movie.backdrop_path, 'w1280') : null
  const director = credits?.crew.find(c => c.job === 'Director')
  const cast = credits?.cast.slice(0, 5).map(c => c.name).join(', ')
  const trailer = movie?.videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube')
  const year = movie?.release_date?.slice(0, 4)

  return (
    <div
      className="fixed inset-0 z-500 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#141414] border border-white/8 rounded-xl shadow-2xl">

        {/* Backdrop */}
        <div className="relative h-64 overflow-hidden rounded-t-xl">
          {backdrop
            ? <img src={backdrop} alt={movie?.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-[#1a1a1a]" />
          }
          <div className="absolute inset-0 bg-linear-to-t from-[#141414] via-[#141414]/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-red-600/70 transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 md:px-7 pb-5 md:pb-7">
          {loading && (
            <div className="space-y-3 py-4">
              {[80, 50, 100, 70].map((w, i) => (
                <div key={i} className="h-4 rounded bg-white/5 animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          )}

          {movie && (
            <>
              <h2 className="font-display text-3xl md:text-4xl tracking-wider leading-none mb-3">
                {movie.title.toUpperCase()}
              </h2>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/50 mb-4">
                <span className="text-amber-400 font-medium">★ {movie.vote_average.toFixed(1)}</span>
                {year && <span className="flex items-center gap-1"><Calendar size={12} />{year}</span>}
                {movie.runtime && <span className="flex items-center gap-1"><Clock size={12} />{movie.runtime} min</span>}
                <span className="flex items-center gap-1"><TrendingUp size={12} />{movie.vote_count.toLocaleString()} votes</span>
                {director && <span>Dir. {director.name}</span>}
              </div>

              {/* Overview */}
              <p className="text-sm text-white/65 leading-relaxed mb-4 font-light">{movie.overview}</p>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map(g => (
                  <span key={g.id} className="text-xs px-2.5 py-1 rounded bg-white/6 border border-white/8 text-white/50">
                    {g.name}
                  </span>
                ))}
              </div>

              {/* Cast */}
              {cast && (
                <p className="text-xs text-white/35 mb-5">
                  <span className="text-white/50 mr-1">Cast:</span>{cast}
                </p>
              )}

              {/* Rating */}
              <div className="mb-5">
                <StarRating movieId={movie.id} movieTitle={movie.title} />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-5 py-2.5 rounded transition-colors"
                  >
                    ▶ Watch Trailer
                  </a>
                )}
                <WatchlistButton
                  movie={movie}
                  showLabel
                  className="flex items-center gap-2 bg-white/8 hover:bg-white/12 border border-white/10 text-white/70 text-sm px-5 py-2.5 rounded transition-all"
                />
                <a
                  href={`https://www.themoviedb.org/movie/${movie.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/30 hover:text-white/60 transition-colors"
                >
                  TMDB →
                </a>
              </div>

              {/* Comment Section */}
              <CommentSection movieId={movie.id} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
