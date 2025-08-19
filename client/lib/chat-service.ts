import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase/config"
import type { Chat, Message } from "@/types/chat"
import type { Booking } from "@/types/booking"

class ChatService {
  private listeners: ((chats: Chat[]) => void)[] = []
  private unsubscribes: Unsubscribe[] = []

  private notifyListeners(chats: Chat[]) {
    this.listeners.forEach((listener) => listener(chats))
  }

  subscribe(listener: (chats: Chat[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", userId),
        orderBy("updatedAt", "desc"),
      )

      const querySnapshot = await getDocs(q)
      const chats: Chat[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        chats.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Chat)
      })

      return chats
    } catch (error) {
      console.error("Error getting user chats:", error)
      return []
    }
  }

  subscribeToUserChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc"),
    )

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chats: Chat[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        chats.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Chat)
      })
      callback(chats)
    })

    this.unsubscribes.push(unsubscribe)
    return unsubscribe
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    try {
      const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"))

      const querySnapshot = await getDocs(q)
      const messages: Message[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Message)
      })

      return messages
    } catch (error) {
      console.error("Error getting chat messages:", error)
      return []
    }
  }

  subscribeToChatMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages: Message[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as Message)
      })
      callback(messages)
    })

    return unsubscribe
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    senderType: "guest" | "host",
    content: string,
  ): Promise<Message | null> {
    try {
      const messageData = {
        chatId,
        senderId,
        senderName,
        senderType,
        content,
        timestamp: serverTimestamp(),
        read: false,
      }

      // Add message to subcollection
      const docRef = await addDoc(collection(db, "chats", chatId, "messages"), messageData)

      // Update chat's last message and timestamp
      const chatRef = doc(db, "chats", chatId)
      await updateDoc(chatRef, {
        lastMessage: {
          id: docRef.id,
          content,
          senderId,
          senderName,
          timestamp: new Date(),
        },
        updatedAt: serverTimestamp(),
      })

      return {
        id: docRef.id,
        ...messageData,
        timestamp: new Date(),
      } as Message
    } catch (error) {
      console.error("Error sending message:", error)
      return null
    }
  }

  async markAsRead(chatId: string, userId: string): Promise<void> {
    try {
      // This would require a more complex query to update multiple documents
      // For now, we'll implement this as a batch operation or cloud function
      console.log("Marking messages as read for chat:", chatId, "user:", userId)
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  async createChatFromBooking(booking: Booking): Promise<Chat | null> {
    try {
      // Check if chat already exists
      const q = query(collection(db, "chats"), where("bookingId", "==", booking.id))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const existingChat = querySnapshot.docs[0]
        const data = existingChat.data()
        return {
          id: existingChat.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Chat
      }

      // Create new chat
      const chatData = {
        bookingId: booking.id,
        guestId: booking.userId,
        hostId: booking.hostId,
        propertyId: booking.propertyId,
        propertyName: booking.propertyTitle,
        participants: [booking.userId, booking.hostId],
        unreadCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "chats"), chatData)

      return {
        id: docRef.id,
        ...chatData,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Chat
    } catch (error) {
      console.error("Error creating chat from booking:", error)
      return null
    }
  }

  cleanup(): void {
    this.unsubscribes.forEach((unsubscribe) => unsubscribe())
    this.unsubscribes = []
  }
}

export const chatService = new ChatService()
