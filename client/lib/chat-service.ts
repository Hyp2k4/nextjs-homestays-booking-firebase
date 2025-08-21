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
  getDoc,
  type Unsubscribe,
  writeBatch,
} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "./firebase/config"
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
    const q = query(collection(db, "chats"), where("participants", "array-contains", userId))

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
    imageFile?: File,
  ): Promise<Message | null> {
    try {
      let imageUrl: string | undefined
      let messageType: "text" | "image" = "text"

      if (imageFile) {
        const storageRef = ref(storage, `chat-images/${chatId}/${Date.now()}_${imageFile.name}`)
        await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(storageRef)
        messageType = "image"
      }

      const messageData: any = {
        chatId,
        senderId,
        senderName,
        senderType,
        content: messageType === "image" ? "Image" : content,
        timestamp: serverTimestamp(),
        read: false,
        type: messageType,
      }

      if (imageUrl) {
        messageData.imageUrl = imageUrl
      }

      // Add message to subcollection
      const docRef = await addDoc(collection(db, "chats", chatId, "messages"), messageData)

      // Update chat's last message and timestamp
      const chatRef = doc(db, "chats", chatId)
      const chatDoc = await getDoc(chatRef)
      const chatData = chatDoc.data()
      const recipientId = chatData?.participants.find((p: string) => p !== senderId)

      if (recipientId) {
        const unreadCount = chatData?.unreadCount ? chatData.unreadCount[recipientId] || 0 : 0
        await updateDoc(chatRef, {
          lastMessage: {
            id: docRef.id,
            content: messageData.content,
            senderId,
            senderName,
            timestamp: serverTimestamp(),
            type: messageType,
          },
          updatedAt: serverTimestamp(),
          [`unreadCount.${recipientId}`]: unreadCount + 1,
        })
      }

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
      const messagesRef = collection(db, "chats", chatId, "messages")
      const q = query(messagesRef, where("senderId", "!=", userId), where("read", "==", false))
      const querySnapshot = await getDocs(q)

      const batch = writeBatch(db)
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true })
      })
      await batch.commit()

      const chatRef = doc(db, "chats", chatId)
      await updateDoc(chatRef, {
        [`unreadCount.${userId}`]: 0,
      })
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
        participantDetails: {},
        unreadCount: { [booking.userId]: 0, [booking.hostId]: 0 },
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

  async findOrCreateChat(
    userId1: string,
    userName1: string,
    userAvatar1: string,
    userId2: string,
    userName2: string,
    userAvatar2: string,
  ): Promise<Chat | null> {
    try {
      // Query to find an existing chat that contains the first user
      const chatsRef = collection(db, "chats")
      const q = query(chatsRef, where("participants", "array-contains", userId1))

      const querySnapshot = await getDocs(q)
      let existingChatDoc = null

      // Client-side filter to find the exact chat with both users
      for (const doc of querySnapshot.docs) {
        const participants = doc.data().participants as string[]
        if (participants.includes(userId2) && participants.length === 2) {
          existingChatDoc = doc
          break
        }
      }

      if (existingChatDoc) {
        const chatData = existingChatDoc.data()
        return {
          id: existingChatDoc.id,
          ...chatData,
          createdAt: chatData.createdAt?.toDate() || new Date(),
          updatedAt: chatData.updatedAt?.toDate() || new Date(),
        } as Chat
      }

      // If no chat exists, create a new one
      const newChatData = {
        participants: [userId1, userId2],
        participantDetails: {
          [userId1]: { name: userName1, avatar: userAvatar1 || "" },
          [userId2]: { name: userName2, avatar: userAvatar2 || "" },
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
      }

      const docRef = await addDoc(chatsRef, newChatData)
      const newChatSnap = await getDoc(docRef)
      const finalChatData = newChatSnap.data()

      return {
        id: newChatSnap.id,
        ...finalChatData,
        createdAt: new Date(), // Use current date as serverTimestamp is not resolved yet
        updatedAt: new Date(),
      } as Chat
    } catch (error) {
      console.error("Error finding or creating chat:", error)
      return null
    }
  }

  cleanup(): void {
    this.unsubscribes.forEach((unsubscribe) => unsubscribe())
    this.unsubscribes = []
  }
}

export const chatService = new ChatService()
