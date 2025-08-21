"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QRCodeCanvas } from "qrcode.react"

interface BookingQrModalProps {
  isOpen: boolean
  onClose: () => void
  bookingId: string | null
}

export function BookingQrModal({ isOpen, onClose, bookingId }: BookingQrModalProps) {
  if (!bookingId) return null

  const bookingUrl = `${window.location.origin}/booking-details/${bookingId}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking Confirmed!</DialogTitle>
          <DialogDescription>
            Scan this QR code to view your booking details.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex items-center justify-center">
          <QRCodeCanvas value={bookingUrl} size={256} />
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
