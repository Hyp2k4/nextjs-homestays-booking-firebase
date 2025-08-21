export interface Reply {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  comment: string
  createdAt: any
}

export interface Review {
  id: string
  propertyId: string // This will be the homestayId
  roomId?: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: any
  replies?: Reply[]
  likedBy?: string[]
}
