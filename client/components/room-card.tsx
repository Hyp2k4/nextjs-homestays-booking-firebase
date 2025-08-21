import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { motion, Variants } from "framer-motion"
import { Star, MapPin, Users, Bed, Bath, Heart } from "lucide-react"
import type { Room } from "@/types/property"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

interface RoomCardProps {
  room: Room
}

export function RoomCard({ room }: RoomCardProps) {
  const { user, toggleRoomWishlist } = useAuth()
  const [isInWishlist, setIsInWishlist] = useState(
    user?.roomWishlist?.includes(room.id) ?? false,
  )

  useEffect(() => {
    setIsInWishlist(user?.roomWishlist?.includes(room.id) ?? false)
  }, [user?.roomWishlist, room.id])

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent link navigation
    console.log("Toggling wishlist for room:", room.id);
    if (!user || !toggleRoomWishlist) {
      console.log("User not logged in or toggle function not available.");
      toast.error("Please log in to add rooms to your wishlist.")
      return
    }

    setIsInWishlist(!isInWishlist) // Optimistic update
    const result = await toggleRoomWishlist(room.id)
    console.log("Wishlist toggle result:", result);
    if (!result.success) {
      setIsInWishlist(isInWishlist) // Revert on error
      toast.error(result.error || "Failed to update wishlist.")
    } else {
      toast.success(
        result.inWishlist
          ? "Added to your wishlist!"
          : "Removed from your wishlist.",
      )
    }
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div variants={cardVariants}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
        <div className="relative aspect-[4/3] overflow-hidden">
          {user && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 z-10 rounded-full h-8 w-8 bg-background/70 hover:bg-background/70"
              onClick={handleToggleWishlist}
            >
              <Heart
                className={`h-4 w-4 ${
                  isInWishlist ? "text-red-500 fill-red-500" : "text-foreground"
                }`}
              />
            </Button>
          )}
          <Image
            src={room.images[0] || "/placeholder.svg"}
            alt={room.roomName || "Room Image"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <CardContent className="p-4 space-y-3">
          <Link href={`/room/${room.id}`}>
            <h3 className="font-serif font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {room.roomName}
            </h3>
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{room.capacity} khách</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-foreground">{formatPrice(room.pricePerNight ?? 0)}</div>
              <div className="text-sm text-muted-foreground">/ đêm</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/room/${room.id}`} className="flex-1">
              <RainbowButton className="w-full">View details</RainbowButton>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
