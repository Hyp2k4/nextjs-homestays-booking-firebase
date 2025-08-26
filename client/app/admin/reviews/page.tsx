"use client"

import { useState, useEffect } from "react"
import { AdminDashboardLayout } from "@/components/admin/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag
} from "lucide-react"
import { onSnapshot, collection, orderBy, query, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import type { Review as FireReview, Reply } from "@/types/review"
import { Textarea } from "@/components/ui/textarea"
import { ReviewService } from "@/lib/review-service"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { toast } from "sonner"

interface ReviewUI {
  id: string
  userName: string
  userEmail?: string
  propertyId: string
  propertyName?: string
  rating: number
  comment: string
  createdAt: string
  helpful: number
}




export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewUI[]>([])
  const [loading, setLoading] = useState(true)
  const [replyMap, setReplyMap] = useState<Record<string, string>>({})
  const { user: adminUser } = useAdminAuth()

  useEffect(() => {
    // Listen to all reviews in realtime
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, async (snap) => {
      const items: ReviewUI[] = []
      for (const d of snap.docs) {
        const r = d.data() as FireReview
        // Property name lookup (optional best-effort)
        let propertyName: string | undefined
        try {
          const propRef = doc(db, "homestays", r.propertyId)
          const propDoc = await getDoc(propRef)
          if (propDoc.exists()) propertyName = (propDoc.data() as any).name
        } catch {}
        items.push({
          id: d.id,
          userName: r.userName,
          userEmail: undefined,
          propertyId: r.propertyId,
          propertyName,
          rating: r.rating,
          comment: r.comment,
          createdAt: (typeof r.createdAt?.toDate === "function" ? r.createdAt.toDate() : new Date(r.createdAt)).toISOString(),
          helpful: (r.likedBy?.length || 0)
        })
      }
      setReviews(items)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handleReply = async (reviewId: string) => {
    const content = replyMap[reviewId]?.trim()
    if (!content) return
    try {
      await ReviewService.addReplyToReview(reviewId, {
        userId: adminUser?.id || "admin",
        userName: adminUser?.name || "Admin",
        userAvatar: adminUser?.avatar,
        comment: content,
      })
      setReplyMap(prev => ({ ...prev, [reviewId]: "" }))
      toast.success("Đã trả lời đánh giá")
    } catch (e) {
      console.error(e)
      toast.error("Trả lời thất bại")
    }
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <AdminDashboardLayout title="Reviews">
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-neutral-200 rounded w-32"></div>
                <div className="h-6 bg-neutral-200 rounded w-20"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-neutral-200 rounded w-full"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <AdminDashboardLayout title="Reviews Management">
      <div className="space-y-8">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">All Reviews</h2>
            <p className="text-neutral-600 mt-1">Moderate and manage customer reviews</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                className="pl-10 pr-4 py-2 w-64 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Reviews</p>
                <p className="text-2xl font-bold text-neutral-900">{reviews.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Average Rating</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0).toFixed(1)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {review.userName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">{review.userName}</h4>
                    <p className="text-sm text-neutral-500">{review.userEmail}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-neutral-900">{review.propertyName}</h5>
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-neutral-600 ml-2">{review.rating}/5</span>
                  </div>
                </div>
                <p className="text-neutral-700 leading-relaxed">{review.comment}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{review.helpful} helpful</span>
                  </div>
                </div>

                {/* Reply box */}
                <div className="flex items-start space-x-3">
                  <Textarea
                    placeholder="Trả lời đánh giá..."
                    value={replyMap[review.id] || ""}
                    onChange={(e) => setReplyMap(prev => ({ ...prev, [review.id]: e.target.value }))}
                    rows={2}
                  />
                  <Button onClick={() => handleReply(review.id)} size="sm">
                    Trả lời
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
