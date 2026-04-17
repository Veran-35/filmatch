'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { Search, Bookmark, LogOut, ChevronDown } from 'lucide-react'

interface Props {
  onSearch: (q: string) => void
}

export default function Navbar({ onSearch }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const dropRef = useRef<HTMLDivElement>(null)

  // Auth is handled globally now


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSearchInput(val: string) {
    setSearchVal(val)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearch(val), 800)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setDropOpen(false)
    router.refresh()
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-10 h-16 transition-all duration-300 ${
      scrolled ? 'bg-[#080808]/95 backdrop-blur-md border-b border-white/5' : 'bg-gradient-to-b from-[#080808]/90 to-transparent'
    }`}>
      {/* Logo */}
      <Link href="/" className="font-display text-[28px] tracking-wider text-red-500 select-none">
        Fil<span className="text-[#f0ede6]">Match</span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchVal}
            onChange={e => handleSearchInput(e.target.value)}
            placeholder="Search films…"
            className="bg-white/6 border border-white/10 rounded-md text-[#f0ede6] text-sm px-4 pr-9 py-2 w-32 focus:w-48 md:w-52 md:focus:w-72 focus:border-red-500 outline-none transition-all duration-300 placeholder:text-white/30"
          />
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        </div>

        {/* Auth */}
        {user ? (
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropOpen(p => !p)}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 font-medium text-xs">
                {((user.user_metadata?.username || user.email)?.[0] ?? 'U').toUpperCase()}
              </div>
              <ChevronDown size={14} className={`transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropOpen && (
              <div className="absolute right-0 top-11 w-44 bg-[#1a1a1a] border border-white/8 rounded-lg overflow-hidden shadow-xl">
                <div className="px-4 py-2.5 border-b border-white/6">
                  <p className="text-xs text-white/40 truncate">{user.user_metadata?.username || (user.email ? user.email.split('@')[0] : 'User')}</p>
                </div>
                <Link
                  href="/watchlist"
                  onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Bookmark size={14} /> My Watchlist
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/auth"
            className="text-sm font-medium bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  )
}
