import { db } from "@/lib/firebase/config"
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
  runTransaction,
} from "firebase/firestore"
import type { Review } from "@/types/review"

export const ReviewService = {
  async addReview(review: Omit<Review, "id" | "createdAt">): Promise<string> {
    const reviewCollection = collection(db, "reviews")
    const docRef = await addDoc(reviewCollection, {
      ...review,
      createdAt: serverTimestamp(),
    })

    // Update property's average rating
    const propertyRef = doc(db, "homestays", review.propertyId)
    await runTransaction(db, async (transaction) => {
      const propertyDoc = await transaction.get(propertyRef)
      if (!propertyDoc.exists()) {
        throw new Error("Property does not exist!")
      }

      const propertyData = propertyDoc.data()
      const newRatingCount = (propertyData.rating?.count || 0) + 1
      const oldRatingTotal = (propertyData.rating?.average || 0) * (propertyData.rating?.count || 0)
      const newAverageRating = (oldRatingTotal + review.rating) / newRatingCount

      transaction.update(propertyRef, {
        "rating.count": newRatingCount,
        "rating.average": newAverageRating,
      })
    })

    return docRef.id
  },

  async getReviewsForProperty(propertyId: string): Promise<Review[]> {
    const reviewCollection = collection(db, "reviews")
    const q = query(reviewCollection, where("propertyId", "==", propertyId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Review),
    )
  },
}
