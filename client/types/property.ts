export interface Property {
  id: string
  name: string // Changed from title
  description: string
  city: string // Flattened from location
  district: string // Flattened from location
  address: string // Flattened from location
  coordinates?: { // Optional coordinates
    lat: number
    lng: number
  }
  images: string[]
  pricePerNight: number // Changed from price.perNight
  currency?: string // Made optional
  maxGuests: number // Changed from capacity.guests
  bedrooms: number // Changed from capacity.bedrooms
  bathrooms: number // Changed from capacity.bathrooms
  beds?: number // Made optional
  amenities: Record<string, boolean>
  propertyType: "house" | "apartment" | "villa" | "cabin" | "treehouse" | "boat"
  hostId: string
  hostName: string
  hostEmail?: string
  hostPhone?: string
  hostAvatar?: string
  rating: {
    average: number
    count: number
  }
  availability: {
    startDate: string
    endDate: string
  }[]
  rules: string[]
  createdAt: string
  updatedAt: string
  isActive: boolean
  featured: boolean
  status: "pending" | "approved" | "denied";
}

export interface Room {
  id: string
  homestayId: string
  roomName: string
  roomCode: string
  roomType: string
  description: string
  images: string[]
  pricePerNight: number
  capacity: number
  amenities: Record<string, boolean>
  rules: string[]
  isActive: boolean
  createdAt: any
  updatedAt: any
}

export interface SearchFilters {
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  priceRange?: {
    min: number
    max: number
  }
  propertyTypes?: string[]
  amenities?: string[]
  rating?: number
}

export interface SearchResult {
  properties: Property[]
  total: number
  page: number
  limit: number
}
