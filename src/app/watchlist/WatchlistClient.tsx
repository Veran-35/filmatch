'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, Star, Film } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { posterUrl } from '@/lib/tmdb'
import type { WatchlistItem, Rating } from '@/types'

interface Props {
  watchlist: WatchlistItem[]
  ratings: Rating[]
  userId: string
}

export default function WatchlistClient({ watchlist: initial, ratings, userId }: Props) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(initial)
  const [activeTab, setActiveTab] = useState<'watchlist' | 'rated'>('watchlist')
  const supabase = createClient()

  const ratingMap = Object.fromEntries(ratings.map(r => [r.movie_id, r.score]))

  async function removeFromWatchlist(movieId: number) {
    await supabase.from('watchlist').delete().eq('user_id', userId).eq('movie_id', movieId)
    setWatchlist(prev => prev.filter(w => w.movie_id !== movieId))
  }

  const items = activeTab === 'watchlist' ? watchlist : ratings

  return (
    <main className="min-h-screen bg-[#080808] pt-20 md:pt-24 px-4 md:px-6 pb-10 md:pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-sm text-white/30 hover:text-white/60 transition-colors mb-4 inline-block">
          ← Back to Browse
        </Link>
        <h1 className="font-display text-4xl md:text-5xl tracking-wider text-[#f0ede6]">MY FILMS</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-white/4 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'watchlist' ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Film size={14} />
          Watchlist
          <span className="bg-white/10 text-xs px-1.5 py-0.5 rounded-full">{watchlist.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('rated')}
          className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'rated' ? 'bg-red-600 text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Star size={14} />
          Rated
          <span className="bg-white/10 text-xs px-1.5 py-0.5 rounded-full">{ratings.length}</span>
        </button>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-20 text-white/30">
          <Film size={40} className="mx-auto mb-4 opacity-20" />
          <p className="font-display text-2xl tracking-wider mb-2">NOTHING HERE YET</p>
          <p className="text-sm">
            {activeTab === 'watchlist'
              ? 'Start adding films from the browse page'
              : 'Rate films to track what you thought'}
          </p>
          <Link href="/" className="inline-block mt-6 text-sm text-red-500 hover:text-red-400 transition-colors">
            Browse films →
          </Link>
        </div>
      )}

      {/* Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {activeTab === 'watchlist' && watchlist.map(item => {
            const poster = posterUrl(item.movie_poster, 'w342')
            const userRating = ratingMap[item.movie_id]
            return (
              <div key={item.id} className="group relative rounded-lg overflow-hidden border border-white/6 bg-[#161616]">
                {poster
                  ? <img src={poster} alt={item.movie_title} className="w-full aspect-[2/3] object-cover" />
                  : <div className="w-full aspect-[2/3] bg-[#1e1e1e] flex items-center justify-center text-white/20 font-display text-sm p-3 text-center">{item.movie_title.toUpperCase()}</div>
                }
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                  <button
                    onClick={() => removeFromWatchlist(item.movie_id)}
                    className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-medium bg-black/50 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-white/80 truncate">{item.movie_title}</p>
                  {userRating && (
                    <p className="text-xs text-amber-400 mt-0.5">★ {userRating}/10</p>
                  )}
                </div>
              </div>
            )
          })}

          {activeTab === 'rated' && ratings.map(item => {
            const watchlistItem = watchlist.find(w => w.movie_id === item.movie_id)
            const poster = posterUrl(watchlistItem?.movie_poster ?? null, 'w342')
            return (
              <div key={item.id} className="rounded-lg overflow-hidden border border-white/6 bg-[#161616]">
                {poster
                  ? <img src={poster} alt={item.movie_title} className="w-full aspect-[2/3] object-cover" />
                  : <div className="w-full aspect-[2/3] bg-[#1e1e1e] flex items-center justify-center text-white/20 font-display text-sm p-3 text-center">{item.movie_title.toUpperCase()}</div>
                }
                <div className="p-2.5">
                  <p className="text-xs font-medium text-white/80 truncate">{item.movie_title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">{item.score}/10</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
