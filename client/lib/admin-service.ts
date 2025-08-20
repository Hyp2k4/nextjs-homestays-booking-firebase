import { collection, getDocs, query, where, doc, updateDoc, getDoc } from "firebase/firestore"
import { adminDb } from "@/lib/firebase/admin-config"
import { Booking } from "@/types/booking"

export const getRooms = async () => {
  const roomsCollection = collection(adminDb, "rooms")
  const roomsSnapshot = await getDocs(roomsCollection)
  return roomsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getHomestays = async () => {
  const homestaysCollection = collection(adminDb, "homestays")
  const homestaysSnapshot = await getDocs(homestaysCollection)
  return homestaysSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getBookings = async () => {
  const bookingsCollection = collection(adminDb, "bookings")
  const bookingsSnapshot = await getDocs(bookingsCollection)
  return bookingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getHosts = async () => {
  const usersCollection = collection(adminDb, "users")
  const hostQuery = query(usersCollection, where("role", "==", "host"))
  const hostSnapshot = await getDocs(hostQuery)
  return hostSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getPendingHomestays = async () => {
  const homestaysCollection = collection(adminDb, "homestays")
  const pendingQuery = query(homestaysCollection, where("status", "==", "pending"))
  const pendingSnapshot = await getDocs(pendingQuery)
  return pendingSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const updateHomestayStatus = async (homestayId: string, status: "approved" | "denied") => {
  const homestayDoc = doc(adminDb, "homestays", homestayId)
  await updateDoc(homestayDoc, { status })
}

export const updateUserStatus = async (userId: string, isBanned: boolean) => {
  const userDoc = doc(adminDb, "users", userId)
  await updateDoc(userDoc, { isBanned })
}

export const getHomestayDetails = async (homestayId: string) => {
  // Get host info
  const homestayDoc = await getDoc(doc(adminDb, "homestays", homestayId))
  const hostId = homestayDoc.data()?.hostId
  const hostDoc = await getDoc(doc(adminDb, "users", hostId))
  const host = { id: hostDoc.id, ...hostDoc.data() }

  // Get rooms
  const roomsQuery = query(collection(adminDb, "rooms"), where("homestayId", "==", homestayId))
  const roomsSnapshot = await getDocs(roomsQuery)
  const rooms = roomsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  // Get bookings and calculate revenue
  const bookingsQuery = query(collection(adminDb, "bookings"), where("homestayId", "==", homestayId))
  const bookingsSnapshot = await getDocs(bookingsQuery)
  const bookings = bookingsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Booking[]
  const revenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0)

  return { host, rooms, bookings, revenue }
}
