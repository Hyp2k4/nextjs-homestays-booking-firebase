"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Property } from "@/types/property"

interface BookingFlowProps {
  isOpen: boolean
  onClose: () => void
  property: Property
  initialCheckIn: string
  initialCheckOut: string
  initialGuests: number
}

export function BookingFlow({
  isOpen,
  onClose,
  property,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: BookingFlowProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm your booking</DialogTitle>
        </DialogHeader>
        <div>
          <p>Booking flow for {property.title}</p>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
