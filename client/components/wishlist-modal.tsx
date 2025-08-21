"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { RoomService } from "@/lib/room-service"
import { Room } from "@/types/property"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface WishlistModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WishlistModal({ isOpen, onClose }: WishlistModalProps) {
  const { user, toggleRoomWishlist } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user?.roomWishlist && user.roomWishlist.length > 0) {
      const fetchWishlistRooms = async () => {
        setLoading(true)
        try {
          const fetchedRooms = await RoomService.getRoomsByIds(user.roomWishlist!)
          setRooms(fetchedRooms)
        } catch (error) {
          console.error("Failed to fetch wishlist rooms:", error)
          toast.error("Could not load your wishlist.")
        } finally {
          setLoading(false)
        }
      }
      fetchWishlistRooms()
    } else {
      setRooms([])
    }
  }, [isOpen, user?.roomWishlist])

  const handleSelectRoom = (roomId: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId],
    )
  }

  const handleSelectAll = () => {
    if (selectedRooms.length === rooms.length) {
      setSelectedRooms([])
    } else {
      setSelectedRooms(rooms.map((room) => room.id))
    }
  }

  const handleRemoveRoom = async (roomId: string) => {
    if (!toggleRoomWishlist) return
    
    // Optimistically update UI
    setRooms(prev => prev.filter(room => room.id !== roomId));
    setSelectedRooms(prev => prev.filter(id => id !== roomId));

    const result = await toggleRoomWishlist(roomId)
    if (!result.success) {
      toast.error("Failed to remove room from wishlist.")
      // Revert UI if needed, though the context should handle it
    } else {
      toast.success("Removed from wishlist.")
    }
  }

  const handleBookNow = () => {
    if (selectedRooms.length === 0) {
      toast.error("Please select at least one room to book.")
      return
    }
    onClose()
    router.push(`/bookings?rooms=${selectedRooms.join(",")}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Your Wishlist</DialogTitle>
          <DialogDescription>
            Select rooms to book or manage your wishlist.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <p>Loading...</p>
          ) : rooms.length === 0 ? (
            <p className="text-center text-muted-foreground">Your wishlist is empty.</p>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedRooms.length === rooms.length && rooms.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room, index) => (
                    <TableRow key={room.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRooms.includes(room.id)}
                          onCheckedChange={() => handleSelectRoom(room.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                          src={room.images[0] || "/placeholder.jpg"}
                          alt={room.roomName}
                          width={64}
                          height={64}
                          className="rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{room.roomName}</TableCell>
                      <TableCell className="text-right">{formatPrice(room.pricePerNight)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveRoom(room.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleBookNow}
            disabled={selectedRooms.length === 0 || loading}
          >
            Book Selected ({selectedRooms.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
