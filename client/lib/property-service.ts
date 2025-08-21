import { db } from "../lib/firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  doc,
  getDoc,
} from "firebase/firestore";
import type { Property, SearchFilters, Room } from "@/types/property";
import { UserService } from "./user-service";

export const PropertyService = {
  async searchProperties(
    filters: SearchFilters = {}
  ): Promise<{ properties: Property[] }> {
    try {
      const propertiesRef = collection(db, "homestays");
      const queryConstraints: QueryConstraint[] = [];

      // Lọc theo thành phố
      if (filters.location) {
        queryConstraints.push(where("city", "==", filters.location));
      }

      // Lọc theo loại homestay
      if (filters.propertyTypes?.length && filters.propertyTypes[0] !== "all") {
        queryConstraints.push(
          where("propertyType", "in", filters.propertyTypes)
        );
      }

      // Lọc theo khoảng giá
      if (filters.priceRange) {
        queryConstraints.push(
          where("pricePerNight", ">=", filters.priceRange.min),
          where("pricePerNight", "<=", filters.priceRange.max),
          orderBy("pricePerNight", "asc")
        );
      }

      // Nếu không có constraint nào thì chỉ query với limit
      const q =
        queryConstraints.length > 0
          ? query(propertiesRef, ...queryConstraints, limit(100))
          : query(propertiesRef, limit(100));

      const querySnapshot = await getDocs(q);

      const properties: Property[] = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const propertyData = { id: doc.id, ...doc.data() } as Property;
          if (propertyData.hostId) {
            const host = await UserService.getUserById(propertyData.hostId);
            if (host) {
              propertyData.hostName = host.name;
              propertyData.hostAvatar = host.avatar;
            }
          }
          return propertyData;
        })
      );

      // Lọc thêm phía client
      let filtered = properties;

      if (filters.amenities?.length) {
        filtered = filtered.filter((p) =>
          filters.amenities?.every((a) => p.amenities[a])
        );
      }

      if (filters.guests) {
        filtered = filtered.filter((p) => p.maxGuests >= (filters.guests ?? 0));
      }

      return { properties: filtered };
    } catch (error) {
      console.error("Error fetching properties:", error);
      return { properties: [] };
    }
  },

  async getAllPublicRooms(): Promise<{ rooms: any[]; homestayById: Record<string, any> }> {
    try {
      // Fetch active rooms
      const roomsSnap = await getDocs(
        query(collection(db, "rooms"))
      )

      const rooms = roomsSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }))

      // Fetch all homestays for mapping
      const homestaysSnap = await getDocs(collection(db, "homestays"))
      const homestayById: Record<string, any> = {}
      homestaysSnap.forEach((d) => {
        homestayById[d.id] = { id: d.id, ...(d.data() as any) }
      })

      return { rooms, homestayById }
    } catch (error) {
      console.error("Error fetching rooms:", error)
      return { rooms: [], homestayById: {} }
    }
  },

  async getRoomById(roomId: string): Promise<{ room: Room | null; homestay: Property | null }> {
    try {
      const roomRef = doc(db, "rooms", roomId)
      const roomSnap = await getDoc(roomRef)

      if (!roomSnap.exists()) {
        return { room: null, homestay: null }
      }

      const room = { id: roomSnap.id, ...roomSnap.data() } as Room

      const homestayRef = doc(db, "homestays", room.homestayId)
      const homestaySnap = await getDoc(homestayRef)
      const homestay = homestaySnap.exists() ? ({ id: homestaySnap.id, ...homestaySnap.data() } as Property) : null

      return { room, homestay }
    } catch (error) {
      console.error("Error fetching room:", error)
      return { room: null, homestay: null }
    }
  },

  async getFeaturedProperties(): Promise<Property[]> {
    try {
      const propertiesRef = collection(db, "homestays")
      const q = query(
        propertiesRef,
        where("rating.average", "==", 5),
        limit(6)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Property)
      )
    } catch (error) {
      console.error("Error fetching featured properties:", error)
      return []
    }
  },

  async getPropertyById(id: string): Promise<Property | null> {
    try {
      const propertyRef = doc(db, "homestays", id);
      const propertySnap = await getDoc(propertyRef);

      if (!propertySnap.exists()) {
        return null;
      }

      const propertyData = { id: propertySnap.id, ...propertySnap.data() } as Property;

      // Fetch host details
      if (propertyData.hostId) {
        const hostRef = doc(db, "users", propertyData.hostId);
        const hostSnap = await getDoc(hostRef);
        if (hostSnap.exists()) {
          const hostData = hostSnap.data();
          propertyData.hostName = hostData.name;
          propertyData.hostEmail = hostData.email;
          propertyData.hostPhone = hostData.phone;
          propertyData.hostAvatar = hostData.avatar;
        }
      }

      return propertyData;
    } catch (error) {
      console.error("Error fetching property:", error);
      return null;
    }
  },

  async getRoomsByHomestayId(homestayId: string): Promise<Room[]> {
    try {
      const roomsRef = collection(db, "rooms");
      const q = query(roomsRef, where("homestayId", "==", homestayId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Room)
      );
    } catch (error) {
      console.error("Error fetching rooms for homestay:", error);
      return [];
    }
  },

  async getPropertiesWithCoordinates(): Promise<Property[]> {
    try {
      const propertiesRef = collection(db, "homestays");
      const q = query(propertiesRef, limit(200)); // Limit to 200 properties for performance
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Property))
        .filter((prop) => prop.coordinates); // Filter client-side
    } catch (error) {
      console.error("Error fetching properties with coordinates:", error);
      return [];
    }
  },

  async getSuggestedProperties(): Promise<Property[]> {
    try {
      const propertiesRef = collection(db, "homestays");
      const q = query(
        propertiesRef,
        where("rating.average", ">=", 4),
        limit(6)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Property)
      );
    } catch (error) {
      console.error("Error fetching suggested properties:", error);
      return [];
    }
  },

  async getSuggestedRooms(): Promise<Room[]> {
    try {
      const homestaysRef = collection(db, "homestays");
      const q = query(
        homestaysRef,
        where("rating.average", ">=", 4),
        limit(6)
      );
      const querySnapshot = await getDocs(q);
      const homestayIds = querySnapshot.docs.map((doc) => doc.id);

      if (homestayIds.length === 0) {
        return [];
      }

      const roomsRef = collection(db, "rooms");
      const roomsQuery = query(
        roomsRef,
        where("homestayId", "in", homestayIds),
        limit(6)
      );
      const roomsSnapshot = await getDocs(roomsQuery);
      return roomsSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Room)
      );
    } catch (error) {
      console.error("Error fetching suggested rooms:", error);
      return [];
    }
  },
};
