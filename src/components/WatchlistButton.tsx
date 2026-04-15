'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import type { TMDBMovie } from '@/types'

interface Props {
  movie: Pick<TMDBMovie, 'id' | 'title' | 'poster_path'>
  className?: string
  showLabel?: boolean
}

export default function WatchlistButton({ movie, className = '', showLabel = false }: Props) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id

  useEffect(() => {
    if (!authLoading) {
      if (userId) {
        checkSaved(userId)
      } else {
        setSaved(false)
      }
    }
  }, [movie.id, userId, authLoading])

  async function checkSaved(uid: string) {
    const { data } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', uid)
      .eq('movie_id', movie.id)
      .single()
    setSaved(!!data)
  }

  async function toggle() {
    if (!userId) { router.push('/auth'); return }
    setLoading(true)
    if (saved) {
      await supabase.from('watchlist').delete()
        .eq('user_id', userId).eq('movie_id', movie.id)
      setSaved(false)
    } else {
      await supabase.from('watchlist').insert({
        user_id: userId,
        movie_id: movie.id,
        movie_title: movie.title,
        movie_poster: movie.poster_path,
      })
      setSaved(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Remove from watchlist' : 'Add to watchlist'}
      className={`flex items-center gap-2 transition-all ${
        saved
          ? 'text-amber-400 hover:text-amber-300'
          : 'text-white/50 hover:text-white'
      } disabled:opacity-50 ${className}`}
    >
      {saved
        ? <BookmarkCheck size={18} className="fill-amber-400" />
        : <Bookmark size={18} />
      }
      {showLabel && (
        <span className="text-sm font-medium">
          {saved ? 'Saved' : 'Watchlist'}
        </span>
      )}
    </button>
  )
}
