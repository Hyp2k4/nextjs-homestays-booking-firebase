import { collection, getDocs, query, where, doc, updateDoc, getDoc, onSnapshot, type Unsubscribe } from "firebase/firestore"
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
    .sort((a, b) => {
      const ad = (a.createdAt as any);
      const bd = (b.createdAt as any);
      const aTime = typeof ad?.toMillis === 'function' ? ad.toMillis() : Date.parse(ad);
      const bTime = typeof bd?.toMillis === 'function' ? bd.toMillis() : Date.parse(bd);
      return bTime - aTime;
    })
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

// Realtime admin analytics subscription
export type AdminAnalyticsSnapshot = {
  revenue: { current: number; previous: number; change: number };
  bookings: { current: number; previous: number; change: number };
  users: { current: number; previous: number; change: number };
  properties: { current: number; previous: number; change: number };
};

type TimeRange = "7d" | "30d" | "90d" | "1y";

function getRangeDates(range: TimeRange) {
  const now = new Date();
  const end = now;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevEnd = start;
  const prevStart = new Date(start.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end, prevStart, prevEnd };
}

function parseToDate(val: any): Date | null {
  try {
    if (!val) return null;
    if (typeof val?.toDate === "function") return val.toDate();
    if (typeof val === "string") return new Date(val);
    if (typeof val?.seconds === "number") return new Date(val.seconds * 1000);
    return null;
  } catch {
    return null;
  }
}

function percentChange(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
}

export function subscribeToAdminAnalytics(
  range: TimeRange,
  cb: (data: AdminAnalyticsSnapshot) => void
): Unsubscribe {
  const { start, end, prevStart, prevEnd } = getRangeDates(range);

  let bookingsData: any[] = [];
  let usersData: any[] = [];
  let homestaysData: any[] = [];

  const computeAndEmit = () => {
    // Bookings
    const inRangeBookings = bookingsData.filter(b => {
      const d = parseToDate((b as any).createdAt);
      return d && d >= start && d <= end;
    });
    const prevRangeBookings = bookingsData.filter(b => {
      const d = parseToDate((b as any).createdAt);
      return d && d >= prevStart && d <= prevEnd;
    });

    const revenueCurr = inRangeBookings.reduce((sum, b: any) => sum + (b.totalPrice || 0), 0);
    const revenuePrev = prevRangeBookings.reduce((sum, b: any) => sum + (b.totalPrice || 0), 0);

    const bookingsCurr = inRangeBookings.length;
    const bookingsPrev = prevRangeBookings.length;

    // Users (createdAt is ISO string per auth-context)
    const inRangeUsers = usersData.filter(u => {
      const d = parseToDate((u as any).createdAt);
      return d && d >= start && d <= end;
    });
    const prevRangeUsers = usersData.filter(u => {
      const d = parseToDate((u as any).createdAt);
      return d && d >= prevStart && d <= prevEnd;
    });

    const usersCurr = inRangeUsers.length;
    const usersPrev = prevRangeUsers.length;

    // Properties/Homestays — if createdAt missing, fall back to totals (change 0)
    const inRangeHomes = homestaysData.filter(h => {
      const d = parseToDate((h as any).createdAt);
      return d && d >= start && d <= end;
    });
    const prevRangeHomes = homestaysData.filter(h => {
      const d = parseToDate((h as any).createdAt);
      return d && d >= prevStart && d <= prevEnd;
    });

    const propsCurr = inRangeHomes.length || homestaysData.length;
    const propsPrev = prevRangeHomes.length || homestaysData.length;

    cb({
      revenue: { current: revenueCurr, previous: revenuePrev, change: percentChange(revenueCurr, revenuePrev) },
      bookings: { current: bookingsCurr, previous: bookingsPrev, change: percentChange(bookingsCurr, bookingsPrev) },
      users: { current: usersCurr, previous: usersPrev, change: percentChange(usersCurr, usersPrev) },
      properties: { current: propsCurr, previous: propsPrev, change: percentChange(propsCurr, propsPrev) },
    });
  };

  const unsubBookings = onSnapshot(collection(adminDb, "bookings"), (snap) => {
    bookingsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    computeAndEmit();
  });
  const unsubUsers = onSnapshot(collection(adminDb, "users"), (snap) => {
    usersData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    computeAndEmit();
  });
  const unsubHomes = onSnapshot(collection(adminDb, "homestays"), (snap) => {
    homestaysData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    computeAndEmit();
  });

  return () => {
    unsubBookings();
    unsubUsers();
    unsubHomes();
  };
}
