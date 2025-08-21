export interface Message {
  id:string
  chatId: string
  senderId: string
  senderName: string
  senderType: "guest" | "host"
  content: string
  timestamp: Date
  read: boolean
  type: "text" | "image"
  imageUrl?: string
}

export interface Chat {
  id: string
  participants: string[]
  participantDetails: {
    [key: string]: {
      name: string
      avatar: string
    }
  }
  bookingId?: string
  guestId?: string
  hostId?: string
  propertyId?: string
  propertyName?: string
  lastMessage?: Message
  unreadCount?: { [key: string]: number }
  createdAt: Date
  updatedAt: Date
}

export interface ChatParticipant {
  id: string
  name: string
  avatar?: string
  type: "guest" | "host"
}
