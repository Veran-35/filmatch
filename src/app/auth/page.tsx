'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/')
      router.refresh()
    } else {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { username: username.trim() || email.split('@')[0] }
        }
      })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess('Check your email to confirm your account!')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#080808] flex items-center justify-center px-4"
      style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(232,56,58,0.08) 0%, transparent 60%)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-display text-4xl tracking-wider text-red-500">
            Fil<span className="text-[#f0ede6]">Match</span>
          </span>
          <p className="text-white/40 text-sm mt-1">Find your next obsession</p>
        </div>

        {/* Card */}
        <div className="bg-[#161616] border border-white/8 rounded-xl p-8">
          {/* Tabs */}
          <div className="flex mb-7 bg-white/4 rounded-lg p-1">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all cursor-pointer capitalize ${
                  mode === m
                    ? 'bg-red-600 text-white shadow'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username (Only for register) */}
            {mode === 'register' && (
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-xs font-bold">@</div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Username (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg text-[#f0ede6] text-sm pl-10 pr-4 py-3 outline-none focus:border-red-500 transition-colors placeholder:text-white/25"
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg text-[#f0ede6] text-sm pl-10 pr-4 py-3 outline-none focus:border-red-500 transition-colors placeholder:text-white/25"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full bg-white/5 border border-white/10 rounded-lg text-[#f0ede6] text-sm pl-10 pr-10 py-3 outline-none focus:border-red-500 transition-colors placeholder:text-white/25"
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Error / Success */}
            {error   && <p className="text-red-400 text-xs bg-red-400/8 border border-red-400/15 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-green-400 text-xs bg-green-400/8 border border-green-400/15 rounded-lg px-3 py-2">{success}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors text-sm cursor-pointer"
            >
              {loading ? 'Loading…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/25 mt-5">
          Data via TMDB · Not affiliated with any streaming service
        </p>
      </div>
    </main>
  )
}
