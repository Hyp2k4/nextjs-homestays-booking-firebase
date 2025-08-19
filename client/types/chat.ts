export interface Message {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderType: "guest" | "host"
  content: string
  timestamp: Date
  read: boolean
}

export interface Chat {
  id: string
  bookingId: string
  guestId: string
  hostId: string
  propertyId: string
  propertyName: string
  lastMessage?: Message
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ChatParticipant {
  id: string
  name: string
  avatar?: string
  type: "guest" | "host"
}
