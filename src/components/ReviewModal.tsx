'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ReviewModalProps {
  bookingId: string
  barberId: number
  barberName: string
  onClose: () => void
  onSuccess: () => void
}

export default function ReviewModal({ bookingId, barberId, barberName, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        barber_id: barberId,
        booking_id: bookingId,
        rating: rating,
        comment: comment
      })

    if (!error) {
      onSuccess()
      onClose()
    }

    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal border border-slate rounded-lg max-w-md w-full p-6">
        <h2 className="text-cream font-serif text-2xl mb-2">Leave a Review</h2>
        <p className="text-silver mb-6">How was your experience with {barberName}?</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-silver text-sm mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-4xl transition-colors"
                >
                  <span className={star <= rating ? 'text-gold' : 'text-slate'}>★</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-silver text-sm mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-obsidian border border-slate rounded-lg px-4 py-3 text-cream focus:border-gold outline-none"
              rows={4}
              placeholder="Share your experience..."
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-6 py-3 text-silver hover:text-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
