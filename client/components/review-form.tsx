"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ReviewService } from "@/lib/review-service"
import { Star } from "lucide-react"
import { toast } from "sonner"

interface ReviewFormProps {
  propertyId: string // This is the homestayId
  roomId?: string
  onReviewSubmit: () => void
}

export function ReviewForm({ propertyId, roomId, onReviewSubmit }: ReviewFormProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  if (!user || rating === 0 || comment.trim() === "") {
      toast.error("Please provide a rating and a comment.")
      return
    }

    if (user.role === "host") {
      toast.error("Hosts cannot submit reviews.")
      return
    }

    setIsSubmitting(true)
    try {
      await ReviewService.addReview({
        propertyId, // homestayId
        roomId: roomId || "", // Pass roomId if it exists
        userId: user.id,
        userName: user.name || "Anonymous",
        userAvatar: user.avatar || undefined,
        rating,
        comment,
      })
      toast.success("Review submitted successfully!")
      onReviewSubmit()
      setRating(0)
      setComment("")
    } catch (error) {
      console.error("Failed to submit review:", error)
      toast.error("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Write a review</h3>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`cursor-pointer ${
                star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
      </div>
      <Textarea
        placeholder="Share your experience..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  )
}
