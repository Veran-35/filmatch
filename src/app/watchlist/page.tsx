import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WatchlistClient from './WatchlistClient'

export default async function WatchlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: watchlist } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })

  const { data: ratings } = await supabase
    .from('ratings')
    .select('*')
    .eq('user_id', user.id)
    .order('rated_at', { ascending: false })

  return (
    <WatchlistClient
      watchlist={watchlist ?? []}
      ratings={ratings ?? []}
      userId={user.id}
    />
  )
}
