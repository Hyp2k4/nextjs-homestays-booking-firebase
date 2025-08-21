import { collection, getDocs, query, where, doc, updateDoc, getDoc } from "firebase/firestore"
import { adminDb } from "@/lib/firebase/admin-config"
import { Booking } from "@/types/booking";
import { User } from "@/types/auth";

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

export const getAdminDashboardStats = async () => {
  const bookingsSnap = await getDocs(collection(adminDb, "bookings"));
  const hostsSnap = await getDocs(query(collection(adminDb, "users"), where("role", "==", "host")));
  const homestaysSnap = await getDocs(collection(adminDb, "homestays"));

  const totalRevenue = bookingsSnap.docs.reduce((acc, doc) => acc + (doc.data().totalPrice || 0), 0);
  const totalBookings = bookingsSnap.size;
  const totalHosts = hostsSnap.size;
  const totalHomestays = homestaysSnap.size;

  // Get recent bookings for a simple chart
  const recentBookings = bookingsSnap.docs
    .map(doc => {
        const data = doc.data();
        return { ...data, id: doc.id } as Booking;
    })
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    .slice(0, 5);

  return {
    totalRevenue,
    totalBookings,
    totalHosts,
    totalHomestays,
    recentBookings,
  };
};

export const getHosts = async () => {
  const usersCollection = collection(adminDb, "users")
  const hostQuery = query(usersCollection, where("role", "==", "host"))
  const hostSnapshot = await getDocs(hostQuery)
  return hostSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const getUsers = async (): Promise<User[]> => {
    const usersCollection = collection(adminDb, "users");
    const usersSnapshot = await getDocs(usersCollection);
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

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
  const host = { ...hostDoc.data(), id: hostDoc.id }

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
