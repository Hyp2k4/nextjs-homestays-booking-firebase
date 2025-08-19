export interface Property {
  id: string
  title: string
  description: string
  location: {
    city: string
    district: string
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  images: string[]
  price: {
    perNight: number
    currency: string
  }
  capacity: {
    guests: number
    bedrooms: number
    bathrooms: number
    beds: number
  }
  amenities: string[]
  propertyType: "house" | "apartment" | "villa" | "cabin" | "treehouse" | "boat"
  hostId: string
  hostName: string
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
