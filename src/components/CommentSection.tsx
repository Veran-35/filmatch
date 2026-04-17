'use client'

import { useEffect, useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/AuthProvider'
import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import type { Comment } from '@/types'

interface Props {
  movieId: number
}

export default function CommentSection({ movieId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Edit & Menu States
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    loadComments()
  }, [movieId])

  async function loadComments() {
    setLoading(true)
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles:user_id(username, avatar_url)')
      .eq('movie_id', movieId)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      setComments(data as any as Comment[])
    }
    setLoading(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || !content.trim()) return

    setSubmitting(true)
    const { error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        movie_id: movieId,
        content: content.trim()
      })

    if (!error) {
      setContent('')
      loadComments() // Reload to get the new comment with profile info
    } else {
      console.error("Error inserting comment:", error)
    }
    setSubmitting(false)
  }

  async function handleUpdate(commentId: string) {
    if (!user || !editContent.trim()) return

    const { error } = await supabase
      .from('comments')
      .update({ content: editContent.trim() })
      .eq('id', commentId)
      .eq('user_id', user.id)

    if (!error) {
      setEditingCommentId(null)
      loadComments()
    } else {
      console.error("Error updating comment:", error)
    }
  }

  async function handleDelete(commentId: string) {
    if (!user) return
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id)
    
    if (!error) {
      loadComments()
    } else {
      console.error("Error deleting comment:", error)
    }
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-6">
      <h3 className="text-xl font-display mb-4 font-bold tracking-wider text-white/90">COMMENTS</h3>
      
      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 resize-none h-24 mb-3 transition-all"
            disabled={submitting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="bg-amber-400 hover:bg-amber-500 text-black font-semibold text-sm px-5 py-2.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-5 mb-8 text-center text-sm text-white/50">
          Please log in to leave a comment.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-5">
        {loading ? (
          <div className="animate-pulse space-y-5">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-white/5 rounded w-1/4" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-white/40 italic">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <img
                src={comment.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${comment.profiles?.username || 'User'}&background=random`}
                alt={comment.profiles?.username || 'User'}
                className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
              />
              <div className="flex-1 bg-[#1a1a1a]/50 border border-white/5 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-white/90">
                      {comment.profiles?.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-white/30">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {user?.id === comment.user_id && (
                    <div className="relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                        className="p-1 rounded hover:bg-white/5 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-white/50 hover:text-white" />
                      </button>
                      
                      {openMenuId === comment.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-1 w-32 bg-[#2a2a2a] shadow-xl border border-white/10 rounded-md overflow-hidden z-20">
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id)
                                setEditContent(comment.content)
                                setOpenMenuId(null)
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-white/70 hover:bg-white/5 hover:text-white flex items-center gap-2"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(comment.id)
                                setOpenMenuId(null)
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-red-500/70 hover:bg-red-500/10 hover:text-red-500 flex items-center gap-2"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {editingCommentId === comment.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-black/50 border border-white/20 rounded p-2 text-sm text-white focus:outline-none focus:border-amber-400/50 resize-y min-h-[60px]"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(comment.id)}
                        disabled={!editContent.trim() || editContent.trim() === comment.content}
                        className="bg-amber-400 hover:bg-amber-500 text-black font-semibold text-xs px-3 py-1.5 rounded transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
