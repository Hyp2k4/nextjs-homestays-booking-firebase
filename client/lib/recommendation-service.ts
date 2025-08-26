import { db } from "@/lib/firebase/config"
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore"
import { Property, Room } from "@/types/property"
import { Booking } from "@/types/booking"

export interface RecommendationData {
  properties: Property[]
  rooms: Room[]
  reason: string
  type: "location_based" | "price_based" | "rating_based" | "similar_properties" | "trending"
}

export class RecommendationService {
  /**
   * Get personalized recommendations for a user
   */
  static async getPersonalizedRecommendations(userId: string): Promise<RecommendationData[]> {
    try {
      const recommendations: RecommendationData[] = []

      // Get user's booking history
      const bookingHistory = await RecommendationService.getUserBookingHistory(userId)
      
      if (bookingHistory.length > 0) {
        // Location-based recommendations
        const locationRecs = await RecommendationService.getLocationBasedRecommendations(bookingHistory)
        if (locationRecs.properties.length > 0) {
          recommendations.push(locationRecs)
        }

        // Price-based recommendations
        const priceRecs = await RecommendationService.getPriceBasedRecommendations(bookingHistory)
        if (priceRecs.properties.length > 0) {
          recommendations.push(priceRecs)
        }

        // Similar properties recommendations
        const similarRecs = await RecommendationService.getSimilarPropertiesRecommendations(bookingHistory)
        if (similarRecs.properties.length > 0) {
          recommendations.push(similarRecs)
        }
      }

      // Always include trending properties for new users or as fallback
      const trendingRecs = await RecommendationService.getTrendingRecommendations()
      if (trendingRecs.properties.length > 0) {
        recommendations.push(trendingRecs)
      }

      // High-rated properties
      const ratingRecs = await RecommendationService.getHighRatedRecommendations()
      if (ratingRecs.properties.length > 0) {
        recommendations.push(ratingRecs)
      }

      return recommendations.slice(0, 3) // Return top 3 recommendation types
    } catch (error) {
      console.error("Error getting personalized recommendations:", error)
      return []
    }
  }

  /**
   * Get user's booking history
   */
  private static async getUserBookingHistory(userId: string): Promise<Booking[]> {
    try {
      const bookingsRef = collection(db, "bookings")
      const q = query(
        bookingsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(10)
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking))
    } catch (error) {
      console.error("Error fetching booking history:", error)
      return []
    }
  }

  /**
   * Get recommendations based on previously visited locations
   */
  private static async getLocationBasedRecommendations(bookings: Booking[]): Promise<RecommendationData> {
    try {
      // Extract cities from booking history
      const visitedCities = new Set<string>()
      
      for (const booking of bookings) {
        if (booking.homestayId) {
          const homestayDoc = await getDoc(doc(db, "homestays", booking.homestayId))
          if (homestayDoc.exists()) {
            const homestayData = homestayDoc.data()
            visitedCities.add(homestayData.city)
          }
        }
      }

      if (visitedCities.size === 0) {
        return { properties: [], rooms: [], reason: "", type: "location_based" }
      }

      // Find properties in visited cities
      const propertiesRef = collection(db, "homestays")
      const q = query(
        propertiesRef,
        where("city", "in", Array.from(visitedCities)),
        where("isActive", "==", true),
        orderBy("rating.average", "desc"),
        limit(6)
      )
      
      const querySnapshot = await getDocs(q)
      const properties = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Property))

      return {
        properties,
        rooms: [],
        reason: `Dựa trên các địa điểm bạn đã từng đến: ${Array.from(visitedCities).join(", ")}`,
        type: "location_based"
      }
    } catch (error) {
      console.error("Error getting location-based recommendations:", error)
      return { properties: [], rooms: [], reason: "", type: "location_based" }
    }
  }

  /**
   * Get recommendations based on price range preferences
   */
  private static async getPriceBasedRecommendations(bookings: Booking[]): Promise<RecommendationData> {
    try {
      // Calculate average price from booking history
      const prices = bookings.map(booking => booking.pricePerNight).filter(Boolean)
      if (prices.length === 0) {
        return { properties: [], rooms: [], reason: "", type: "price_based" }
      }

      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
      const priceRange = {
        min: Math.max(0, avgPrice * 0.7), // 30% below average
        max: avgPrice * 1.3 // 30% above average
      }

      const propertiesRef = collection(db, "homestays")
      const q = query(
        propertiesRef,
        where("pricePerNight", ">=", priceRange.min),
        where("pricePerNight", "<=", priceRange.max),
        where("isActive", "==", true),
        orderBy("pricePerNight", "asc"),
        limit(6)
      )

      const querySnapshot = await getDocs(q)
      const properties = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Property))

      return {
        properties,
        rooms: [],
        reason: `Phù hợp với ngân sách của bạn (${priceRange.min.toLocaleString('vi-VN')}₫ - ${priceRange.max.toLocaleString('vi-VN')}₫)`,
        type: "price_based"
      }
    } catch (error) {
      console.error("Error getting price-based recommendations:", error)
      return { properties: [], rooms: [], reason: "", type: "price_based" }
    }
  }

  /**
   * Get recommendations for similar properties
   */
  private static async getSimilarPropertiesRecommendations(bookings: Booking[]): Promise<RecommendationData> {
    try {
      // Get property types from booking history
      const propertyTypes = new Set<string>()
      
      for (const booking of bookings) {
        if (booking.homestayId) {
          const homestayDoc = await getDoc(doc(db, "homestays", booking.homestayId))
          if (homestayDoc.exists()) {
            const homestayData = homestayDoc.data()
            propertyTypes.add(homestayData.propertyType)
          }
        }
      }

      if (propertyTypes.size === 0) {
        return { properties: [], rooms: [], reason: "", type: "similar_properties" }
      }

      const propertiesRef = collection(db, "homestays")
      const q = query(
        propertiesRef,
        where("propertyType", "in", Array.from(propertyTypes)),
        where("isActive", "==", true),
        orderBy("rating.average", "desc"),
        limit(6)
      )

      const querySnapshot = await getDocs(q)
      const properties = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Property))

      return {
        properties,
        rooms: [],
        reason: `Tương tự những nơi bạn đã ở: ${Array.from(propertyTypes).join(", ")}`,
        type: "similar_properties"
      }
    } catch (error) {
      console.error("Error getting similar properties recommendations:", error)
      return { properties: [], rooms: [], reason: "", type: "similar_properties" }
    }
  }

  /**
   * Get trending properties (most booked recently)
   */
  private static async getTrendingRecommendations(): Promise<RecommendationData> {
    try {
      // Get properties with high rating and recent bookings
      const propertiesRef = collection(db, "homestays")
      const q = query(
        propertiesRef,
        where("isActive", "==", true),
        where("rating.average", ">=", 4.0),
        orderBy("rating.average", "desc"),
        orderBy("rating.count", "desc"),
        limit(6)
      )

      const querySnapshot = await getDocs(q)
      const properties = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Property))

      return {
        properties,
        rooms: [],
        reason: "Những homestay đang được yêu thích nhất",
        type: "trending"
      }
    } catch (error) {
      console.error("Error getting trending recommendations:", error)
      return { properties: [], rooms: [], reason: "", type: "trending" }
    }
  }

  /**
   * Get high-rated properties
   */
  private static async getHighRatedRecommendations(): Promise<RecommendationData> {
    try {
      const propertiesRef = collection(db, "homestays")
      const q = query(
        propertiesRef,
        where("isActive", "==", true),
        where("rating.average", "==", 5.0),
        orderBy("rating.count", "desc"),
        limit(6)
      )

      const querySnapshot = await getDocs(q)
      const properties = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Property))

      return {
        properties,
        rooms: [],
        reason: "Những homestay được đánh giá 5 sao",
        type: "rating_based"
      }
    } catch (error) {
      console.error("Error getting high-rated recommendations:", error)
      return { properties: [], rooms: [], reason: "", type: "rating_based" }
    }
  }
}
