'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'

interface Props {
  movieId: number
  movieTitle: string
}

export default function StarRating({ movieId, movieTitle }: Props) {
  const [userScore, setUserScore] = useState<number | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id

  useEffect(() => {
    if (!authLoading) {
      if (userId) {
        loadRating(userId)
      } else {
        setUserScore(null)
      }
    }
  }, [movieId, userId, authLoading])

  async function loadRating(uid: string) {
    const { data } = await supabase
      .from('ratings')
      .select('score')
      .eq('user_id', uid)
      .eq('movie_id', movieId)
      .single()
    if (data) setUserScore(data.score)
  }

  async function rate(score: number) {
    if (!userId) { router.push('/auth'); return }
    // upsert rating
    await supabase.from('ratings').upsert({
      user_id: userId,
      movie_id: movieId,
      movie_title: movieTitle,
      score,
    }, { onConflict: 'user_id,movie_id' })
    setUserScore(score)
  }

  const display = hovered ?? userScore ?? 0

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs text-white/40 uppercase tracking-widest">Your Rating</p>
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => rate(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            className="transition-transform hover:scale-110 cursor-pointer"
          >
            <Star
              size={18}
              className={`transition-colors ${
                n <= display
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-white/20'
              }`}
            />
          </button>
        ))}
        {userScore && (
          <span className="ml-2 text-sm text-amber-400 font-medium self-center">
            {userScore}/10
          </span>
        )}
      </div>
    </div>
  )
}
