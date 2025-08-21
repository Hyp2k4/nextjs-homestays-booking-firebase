"use client"

import { useState } from "react"
import type { Review } from "@/types/review"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Heart } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ReviewService } from "@/lib/review-service"
import { toast } from "sonner"

interface ReviewsListProps {
  reviews: Review[]
  loading: boolean
  hostId?: string
}

const ReviewCard = ({
  card,
  allowReply,
  hostId,
  isFeatured,
}: {
  card: Review
  allowReply: boolean
  hostId?: string
  isFeatured: boolean
}) => {
  const { user } = useAuth()
  const [reply, setReply] = useState("")
  const [isReplying, setIsReplying] = useState(false)

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("You must be logged in to reply.")
      return
    }
    if (reply.trim() === "") {
      toast.error("Please provide a reply.")
      return
    }

    setIsReplying(true)
    try {
      const replyData = {
        userId: user.id,
        userName: user.name || "Host",
        userAvatar: user.avatar || "",
        comment: reply,
      }
      await ReviewService.addReplyToReview(card.id, replyData)
      toast.success("Reply submitted successfully!")
      setReply("")
    } catch (error) {
      console.error("Failed to submit reply:", error)
      toast.error("Failed to submit reply. Please try again.")
    } finally {
      setIsReplying(false)
    }
  }

  const [isLiked, setIsLiked] = useState(user ? card.likedBy?.includes(user.id) : false)
  const [likeCount, setLikeCount] = useState(card.likedBy?.length || 0)

  const handleLike = async () => {
    if (!user) {
      toast.error("You must be logged in to like a review.")
      return
    }
    try {
      // Optimistic UI update
      setIsLiked(!isLiked)
      setLikeCount(likeCount + (isLiked ? -1 : 1))
      await ReviewService.toggleReviewLike(card.id, user.id)
    } catch (error) {
      // Revert on error
      setIsLiked(isLiked)
      setLikeCount(likeCount)
      console.error("Failed to like review:", error)
      toast.error("Failed to update like status.")
    }
  }

  const toDate = (timestamp: any): Date => {
    if (timestamp?.toDate) {
      return timestamp.toDate()
    }
    return new Date(timestamp)
  }

  const repliesToShow = isFeatured
    ? card.replies?.filter((reply) => reply.userId === hostId)
    : card.replies

  return (
    <div className="p-4 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 w-full">
      <div className="flex gap-2">
        <Avatar>
          <AvatarImage src={card.userAvatar} />
          <AvatarFallback>{card.userName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <p className="font-semibold">{card.userName}</p>
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(toDate(card.createdAt), { addSuffix: true, locale: vi })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < card.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <p className="text-sm py-4 text-gray-800">{card.comment}</p>
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleLike} className="hover:bg-transparent">
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    isLiked ? "text-red-500 fill-red-500" : "text-gray-500"
                  }`}
                />
                {likeCount}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {/* To show user names, we would need to fetch user data based on IDs in likedBy array */}
              <p>{likeCount} people liked this</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {repliesToShow && repliesToShow.length > 0 && (
        <div className="space-y-4 mt-4 pt-4 border-t">
          {repliesToShow.map((reply) => (
            <div key={reply.id} className="flex gap-2">
              <Avatar>
                <AvatarImage src={reply.userAvatar} />
                <AvatarFallback>{reply.userName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col bg-gray-100 p-2 rounded-lg w-full">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">{reply.userName}</p>
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(toDate(reply.createdAt), { addSuffix: true, locale: vi })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{reply.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {allowReply && user && (
        <form onSubmit={handleReplySubmit} className="space-y-2 mt-2">
          <Textarea
            placeholder="Write a reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={2}
          />
          <Button type="submit" disabled={isReplying} size="sm">
            {isReplying ? "Replying..." : "Reply"}
          </Button>
        </form>
      )}
    </div>
  )
}

export function ReviewsList({ reviews, loading, hostId }: ReviewsListProps) {
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(5)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="p-4 rounded-lg shadow w-full h-48 animate-pulse bg-muted" />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return <p className="text-center text-muted-foreground">Chưa có đánh giá nào.</p>
  }

  const featuredReviews = reviews.filter(review => review.rating >= 4).slice(0, 4)
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

  const handleShowMore = () => {
    setVisibleReviewsCount(prevCount => prevCount + 5)
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Featured Reviews Section */}
      {featuredReviews.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Đánh giá nổi bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                card={review}
                allowReply={false}
                hostId={hostId}
                isFeatured={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Reviews Section */}
      <div>
        <div className="flex items-center mb-6">
          <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
          <span className="ml-2 font-bold text-2xl">
            {averageRating.toFixed(1)}
          </span>
          <span className="ml-2 text-muted-foreground text-lg">({reviews.length} đánh giá)</span>
        </div>
        <h2 className="text-2xl font-bold mb-4">Tất cả đánh giá ({reviews.length})</h2>
        <div className="space-y-6">
          {reviews.slice(0, visibleReviewsCount).map((review) => (
            <ReviewCard
              key={review.id}
              card={review}
              allowReply={true}
              hostId={hostId}
              isFeatured={false}
            />
          ))}
        </div>
        {visibleReviewsCount < reviews.length && (
          <div className="text-center mt-8">
            <Button onClick={handleShowMore} variant="outline">
              Xem thêm đánh giá
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
