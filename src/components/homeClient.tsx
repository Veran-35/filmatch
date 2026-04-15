'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { fetchFilteredMovies, fetchSearchMovies } from '@/app/action'
import { posterUrl, backdropUrl, GENRES } from '@/lib/tmdb'
import type { TMDBMovie } from '@/types'
import Navbar from '@/components/Navbar'
import FilmModal from '@/components/FilmModal'
import WatchlistButton from '@/components/WatchlistButton'

interface Props {
  initialHero: TMDBMovie | null;
  initialTrending: TMDBMovie[];
  initialFilms: TMDBMovie[];
}

export default function HomeClient({ initialHero, initialTrending, initialFilms }: Props) {
  const [hero] = useState<TMDBMovie | null>(initialHero)
  const [trending] = useState<TMDBMovie[]>(initialTrending)
  const [films, setFilms] = useState<TMDBMovie[]>(initialFilms)

  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Filters
  const [genreId, setGenreId] = useState<string>('')
  const [sortBy, setSortBy] = useState('popularity.desc')
  const [year, setYear] = useState('')
  const [minRating, setMinRating] = useState('')

  const isMounted = useRef(false)

  // Load browse (called ONLY when filters change)
  const loadBrowse = useCallback(async () => {
    setLoading(true)
    const data = await fetchFilteredMovies({
      sort_by: sortBy,
      with_genres: genreId,
      primary_release_year: year,
      'vote_average.gte': minRating,
      'vote_count.gte': '80',
      page: '1',
    })
    setFilms(data.results.slice(0, 20))
    setLoading(false)
  }, [genreId, sortBy, year, minRating])

  useEffect(() => {
    if (isMounted.current) {
      loadBrowse()
    } else {
      isMounted.current = true
    }
  }, [loadBrowse])

  async function handleSearch(q: string) {
    if (!q.trim()) { loadBrowse(); return }
    setLoading(true)
    const data = await fetchSearchMovies(q)
    setFilms(data.results.slice(0, 20))
    setLoading(false)
  }

  const heroBackdrop = hero ? backdropUrl(hero.backdrop_path, 'w1280') : null

  return (
    <>
      <Navbar onSearch={handleSearch} />
      <FilmModal movieId={selectedId} onClose={() => setSelectedId(null)} />

      {/* ── HERO ── */}
      <section className="relative h-[88vh] min-h-130 flex items-end px-10 pb-20 overflow-hidden">
        {heroBackdrop && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url(${heroBackdrop})` }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-r from-[#080808]/92 via-[#080808]/50 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-[#080808] via-[#080808]/30 to-transparent" />

        {hero && (
          <div className="relative z-10 max-w-xl animate-[fadeUp_0.8s_ease_both]">
            <p className="flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase font-medium text-amber-400 mb-3">
              <span className="inline-block w-5 h-px bg-amber-400" />
              Now Playing
            </p>
            <h1 className="font-display text-[clamp(44px,6vw,76px)] leading-[0.94] tracking-wide mb-3 drop-shadow-2xl">
              {hero.title.toUpperCase()}
            </h1>
            <div className="flex items-center gap-3 text-sm text-white/50 mb-3 flex-wrap">
              <span className="text-amber-400 font-medium">★ {hero.vote_average.toFixed(1)}</span>
              <span>·</span>
              <span>{hero.release_date?.slice(0, 4)}</span>
              <span>·</span>
              <span>{hero.vote_count.toLocaleString('en-US')} votes</span>
            </div>
            <p className="text-sm text-white/60 font-light leading-relaxed max-w-md mb-6 line-clamp-3">
              {hero.overview}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedId(hero.id)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-6 py-3 rounded transition-colors cursor-pointer"
              >
                ▶ View Details
              </button>
              <button
                onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 bg-white/8 hover:bg-white/13 border border-white/10 text-white/80 text-sm font-medium px-6 py-3 rounded transition-all cursor-pointer"
              >
                Browse All
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── TRENDING ── */}
      {trending.length > 0 && (
        <section className="px-10 py-12">
          <h2 className="font-display text-3xl tracking-wider mb-6">
            TRENDING THIS WEEK
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {trending.map((movie) => (
              <button
                key={movie.id}
                onClick={() => setSelectedId(movie.id)}
                className="flex-shrink-0 group relative w-40 cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-lg aspect-[2/3] mb-2">
                  {movie.poster_path ? (
                    <img
                      src={posterUrl(movie.poster_path, 'w342')!}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-white/20 text-xs">
                      No Poster
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute top-2 left-2 bg-black/70 text-amber-400 text-xs font-medium px-1.5 py-0.5 rounded">
                    ★ {movie.vote_average.toFixed(1)}
                  </div>
                </div>
                <p className="text-sm text-white/80 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                  {movie.title}
                </p>
                <p className="text-xs text-white/30 mt-0.5">
                  {movie.release_date?.slice(0, 4)}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── BROWSE ── */}
      <section id="browse" className="px-10 py-12 border-t border-white/5">
        <h2 className="font-display text-3xl tracking-wider mb-6">
          BROWSE FILMS
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Genre filter */}
          <select
            value={genreId}
            onChange={(e) => setGenreId(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 text-white/80 text-sm rounded px-3 py-2 outline-none focus:border-amber-400/50 transition-colors cursor-pointer"
          >
            {GENRES.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          {/* Sort filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 text-white/80 text-sm rounded px-3 py-2 outline-none focus:border-amber-400/50 transition-colors cursor-pointer"
          >
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Highest Rated</option>
            <option value="primary_release_date.desc">Newest</option>
            <option value="revenue.desc">Highest Revenue</option>
          </select>

          {/* Year filter */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 text-white/80 text-sm rounded px-3 py-2 outline-none focus:border-amber-400/50 transition-colors cursor-pointer"
          >
            <option value="">All Years</option>
            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>

          {/* Min rating filter */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 text-white/80 text-sm rounded px-3 py-2 outline-none focus:border-amber-400/50 transition-colors cursor-pointer"
          >
            <option value="">Any Rating</option>
            <option value="7">7+ Rating</option>
            <option value="8">8+ Rating</option>
            <option value="9">9+ Rating</option>
          </select>
        </div>

        {/* Film grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] rounded-lg bg-white/5 mb-2" />
                <div className="h-4 rounded bg-white/5 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {films.map((movie) => (
              <div
                key={movie.id}
                onClick={() => setSelectedId(movie.id)}
                className="group text-left cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-lg aspect-[2/3] mb-2">
                  {movie.poster_path ? (
                    <img
                      src={posterUrl(movie.poster_path, 'w342')!}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-white/20 text-xs">
                      No Poster
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute top-2 left-2 bg-black/70 text-amber-400 text-xs font-medium px-1.5 py-0.5 rounded">
                    ★ {movie.vote_average.toFixed(1)}
                  </div>
                  <div
                    className="absolute bottom-0 inset-x-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <WatchlistButton
                      movie={movie}
                      className="bg-black/60 rounded-full p-1.5"
                    />
                  </div>
                </div>
                <p className="text-sm text-white/80 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                  {movie.title}
                </p>
                <p className="text-xs text-white/30 mt-0.5">
                  {movie.release_date?.slice(0, 4)}
                </p>
              </div>
            ))}
          </div>
        )}

        {films.length === 0 && !loading && (
          <div className="text-center py-20 text-white/30">
            <p className="text-lg mb-2">No films found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="px-10 py-8 border-t border-white/5 text-center text-white/20 text-xs">
        <p>FilMatch — Powered by TMDB</p>
      </footer>
    </>
  )
}