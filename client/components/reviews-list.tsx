"use client"

import { useEffect, useState } from "react"
import type { Review } from "@/types/review"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface ReviewsListProps {
  reviews: Review[]
  loading: boolean
}

const CreateCard = ({ card }: { card: Review }) => (
  <div className="p-4 rounded-lg mx-4 shadow hover:shadow-lg transition-all duration-200 w-72 shrink-0">
    <div className="flex gap-2">
      <Avatar>
        <AvatarImage src={card.userAvatar} />
        <AvatarFallback>{card.userName[0]}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <p>{card.userName}</p>
        </div>
        <span className="text-xs text-slate-500">{new Date(card.createdAt).toLocaleDateString()}</span>
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
  </div>
)

export function ReviewsList({ reviews, loading }: ReviewsListProps) {
  if (loading) {
    return (
      <div className="marquee-row w-full mx-auto max-w-5xl overflow-hidden relative">
        <div className="marquee-inner flex transform-gpu min-w-[200%] pt-10 pb-5">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="p-4 rounded-lg mx-4 shadow w-72 shrink-0 animate-pulse bg-muted h-48" />
          ))}
        </div>
      </div>
    )
  }

  if (reviews.length === 0) {
    return <p className="text-center text-muted-foreground">Chưa có đánh giá nào.</p>
  }

  const duplicatedReviews = [...reviews, ...reviews]

  return (
    <>
      <style>{`
        @keyframes marqueeScroll {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
        }

        .marquee-inner {
            animation: marqueeScroll 25s linear infinite;
        }

        .marquee-reverse {
            animation-direction: reverse;
        }
    `}</style>

      <div className="marquee-row w-full mx-auto max-w-5xl overflow-hidden relative">
        <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent"></div>
        <div className="marquee-inner flex transform-gpu min-w-[200%] pt-10 pb-5">
          {duplicatedReviews.map((review, index) => (
            <CreateCard key={index} card={review} />
          ))}
        </div>
        <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent"></div>
      </div>
    </>
  )
}
