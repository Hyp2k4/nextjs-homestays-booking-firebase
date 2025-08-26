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
  arrayUnion,
  arrayRemove,
  getDoc,
  onSnapshot,
  orderBy,
} from "firebase/firestore"
import type { Review, Reply } from "@/types/review"
import { NotificationService } from "@/lib/notification-service"

export const ReviewService = {
  async addReview(review: Omit<Review, "id" | "createdAt">): Promise<string> {
    const reviewCollection = collection(db, "reviews")
    const docRef = await addDoc(reviewCollection, {
      ...review,
      createdAt: serverTimestamp(),
    })

    // Update property's average rating
    const propertyRef = doc(db, "properties", review.propertyId)
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

  listenForReviews(propertyId: string, callback: (reviews: Review[]) => void) {
    const reviewCollection = collection(db, "reviews")
    const q = query(reviewCollection, where("propertyId", "==", propertyId))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reviews = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Review),
      )
      callback(reviews)
    })

    return unsubscribe
  },

  async addReplyToReview(reviewId: string, replyData: Omit<Reply, "id" | "createdAt">): Promise<void> {
    const reviewRef = doc(db, "reviews", reviewId)
    const newReply = {
      ...replyData,
      id: doc(collection(db, "dummy_replies")).id, // Generate a new unique ID
      createdAt: new Date(),
    }
    await updateDoc(reviewRef, {
      replies: arrayUnion(newReply),
    })

    // Get review details to send notification
    try {
      const reviewDoc = await getDoc(reviewRef)
      if (reviewDoc.exists()) {
        const reviewData = reviewDoc.data() as Review
        // Notify the review author that they received a reply
        if (reviewData.userId) {
          await NotificationService.notifyReviewReply(
            reviewData.userId,
            reviewId,
            "their homestay", // Could be enhanced to get actual homestay name
            replyData.userName
          )
        }
      }
    } catch (error) {
      console.error("Error sending reply notification:", error)
      // Don't throw - reply was successful, notification is optional
    }
  },

  async toggleReviewLike(reviewId: string, userId: string): Promise<void> {
    const reviewRef = doc(db, "reviews", reviewId)
    const reviewSnap = await getDoc(reviewRef)

    if (reviewSnap.exists()) {
      const reviewData = reviewSnap.data()
      const likedBy = reviewData.likedBy || []

      if (likedBy.includes(userId)) {
        // User has liked, so unlike
        await updateDoc(reviewRef, {
          likedBy: arrayRemove(userId),
        })
      } else {
        // User has not liked, so like
        await updateDoc(reviewRef, {
          likedBy: arrayUnion(userId),
        })
      }
    } else {
      throw new Error("Review not found")
    }
  },
}
