"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Heart, 
  X, 
  Trash2, 
  ExternalLink,
  MapPin,
  Users,
  Calendar
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useWishlist } from "@/hooks/use-wishlist"
import { WishlistItem } from "@/lib/wishlist-service"
import { WishlistLoading } from "@/components/travel/loading"

interface WishlistModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WishlistModal({ isOpen, onClose }: WishlistModalProps) {
  const { wishlist, wishlistCount, loading, removeFromWishlist, clearWishlist } = useWishlist()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const handleRemoveItem = async (roomId: string) => {
    setRemovingId(roomId)
    await removeFromWishlist(roomId)
    setRemovingId(null)
  }

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
      await clearWishlist()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            <span>My Wishlist</span>
            {wishlistCount > 0 && (
              <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {wishlistCount} {wishlistCount === 1 ? 'room' : 'rooms'}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Your saved rooms for future bookings
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <WishlistLoading />
          ) : wishlist.length === 0 ? (
            <EmptyWishlist onClose={onClose} />
          ) : (
            <div className="space-y-4">
              {/* Clear All Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>

              {/* Wishlist Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishlist.map((item) => (
                  <WishlistItemCard
                    key={item.roomId}
                    item={item}
                    onRemove={handleRemoveItem}
                    isRemoving={removingId === item.roomId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EmptyWishlist({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center py-12">
      <Heart className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        Your wishlist is empty
      </h3>
      <p className="text-neutral-600 mb-6 max-w-sm mx-auto">
        Start exploring and save your favorite rooms for future bookings
      </p>
      <div className="space-y-3">
        <Link href="/rooms">
          <Button onClick={onClose} className="w-full sm:w-auto">
            Browse Rooms
          </Button>
        </Link>
        <Link href="/homestays">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Explore Homestays
          </Button>
        </Link>
      </div>
    </div>
  )
}

interface WishlistItemCardProps {
  item: WishlistItem
  onRemove: (roomId: string) => void
  isRemoving: boolean
}

function WishlistItemCard({ item, onRemove, isRemoving }: WishlistItemCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.images[0] || "/placeholder.jpg"}
          alt={item.roomName}
          fill
          className={cn(
            "object-cover transition-all duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
        />
        
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 animate-pulse" />
        )}

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.roomId)}
          disabled={isRemoving}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 disabled:opacity-50"
        >
          {isRemoving ? (
            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <X className="h-4 w-4 text-neutral-600" />
          )}
        </button>

        {/* Price Badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1">
          <div className="text-sm font-bold text-neutral-900">
            {item.pricePerNight.toLocaleString('vi-VN')}₫
          </div>
          <div className="text-xs text-neutral-600">per night</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Homestay Name */}
        <div className="text-xs text-neutral-500 mb-1">
          {item.homestayName}
        </div>

        {/* Room Name */}
        <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-1">
          {item.roomName}
        </h3>

        {/* Added Date */}
        <div className="flex items-center text-xs text-neutral-500 mb-3">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link href={`/room/${item.roomId}`} className="flex-1">
            <Button size="sm" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Room
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(item.roomId)}
            disabled={isRemoving}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  )
}
