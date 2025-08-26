"use client"

import { useState, useEffect, useCallback } from "react"
import { WishlistService, WishlistItem } from "@/lib/wishlist-service"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export function useWishlist() {
  const { user, isAuthenticated } = useAuth()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)

  // Load wishlist when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadWishlist()
    } else {
      setWishlist([])
      setWishlistCount(0)
    }
  }, [isAuthenticated, user?.id])

  const loadWishlist = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const userWishlist = await WishlistService.getUserWishlist(user.id)
      setWishlist(userWishlist)
      setWishlistCount(userWishlist.length)
    } catch (error) {
      console.error("Error loading wishlist:", error)
      toast.error("Failed to load wishlist")
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const addToWishlist = useCallback(async (roomId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add to wishlist")
      return false
    }

    if (!user?.id) return false

    try {
      const success = await WishlistService.addToWishlist(user.id, roomId)
      
      if (success) {
        await loadWishlist() // Reload to get updated data
        toast.success("Added to wishlist")
        return true
      } else {
        toast.error("Failed to add to wishlist")
        return false
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      toast.error("Failed to add to wishlist")
      return false
    }
  }, [isAuthenticated, user?.id, loadWishlist])

  const removeFromWishlist = useCallback(async (roomId: string) => {
    if (!user?.id) return false

    try {
      const success = await WishlistService.removeFromWishlist(user.id, roomId)
      
      if (success) {
        await loadWishlist() // Reload to get updated data
        toast.success("Removed from wishlist")
        return true
      } else {
        toast.error("Failed to remove from wishlist")
        return false
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast.error("Failed to remove from wishlist")
      return false
    }
  }, [user?.id, loadWishlist])

  const toggleWishlist = useCallback(async (roomId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add to wishlist")
      return false
    }

    if (!user?.id) return false

    try {
      const isInWishlist = await WishlistService.isInWishlist(user.id, roomId)
      
      if (isInWishlist) {
        return await removeFromWishlist(roomId)
      } else {
        return await addToWishlist(roomId)
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast.error("Failed to update wishlist")
      return false
    }
  }, [isAuthenticated, user?.id, addToWishlist, removeFromWishlist])

  const isInWishlist = useCallback((roomId: string) => {
    return wishlist.some(item => item.roomId === roomId)
  }, [wishlist])

  const clearWishlist = useCallback(async () => {
    if (!user?.id) return false

    try {
      const success = await WishlistService.clearWishlist(user.id)
      
      if (success) {
        setWishlist([])
        setWishlistCount(0)
        toast.success("Wishlist cleared")
        return true
      } else {
        toast.error("Failed to clear wishlist")
        return false
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error)
      toast.error("Failed to clear wishlist")
      return false
    }
  }, [user?.id])

  return {
    wishlist,
    wishlistCount,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    loadWishlist,
  }
}

// Hook for checking if a specific room is in wishlist
export function useRoomWishlistStatus(roomId: string) {
  const { user, isAuthenticated } = useAuth()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.id && roomId) {
      checkWishlistStatus()
    } else {
      setIsInWishlist(false)
    }
  }, [isAuthenticated, user?.id, roomId])

  const checkWishlistStatus = async () => {
    if (!user?.id || !roomId) return

    try {
      setLoading(true)
      const status = await WishlistService.isInWishlist(user.id, roomId)
      setIsInWishlist(status)
    } catch (error) {
      console.error("Error checking wishlist status:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggle = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add to wishlist")
      return false
    }

    if (!user?.id || !roomId) return false

    try {
      const success = await WishlistService.toggleWishlist(user.id, roomId)
      
      if (success) {
        setIsInWishlist(!isInWishlist)
        toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist")
        return true
      } else {
        toast.error("Failed to update wishlist")
        return false
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      toast.error("Failed to update wishlist")
      return false
    }
  }

  return {
    isInWishlist,
    loading,
    toggle,
    refresh: checkWishlistStatus,
  }
}
