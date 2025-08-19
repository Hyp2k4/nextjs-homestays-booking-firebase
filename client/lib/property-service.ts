import { db } from "../lib/firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
} from "firebase/firestore";
import type { Property, SearchFilters } from "@/types/property";

export const PropertyService = {
  async searchProperties(
    filters: SearchFilters = {}
  ): Promise<{ properties: Property[] }> {
    try {
      const propertiesRef = collection(db, "homestays");
      const queryConstraints: QueryConstraint[] = [];

      // Lọc theo thành phố
      if (filters.location) {
        queryConstraints.push(where("location.city", "==", filters.location));
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
          where("price.perNight", ">=", filters.priceRange.min),
          where("price.perNight", "<=", filters.priceRange.max),
          orderBy("price.perNight", "asc")
        );
      }

      // Nếu không có constraint nào thì chỉ query với limit
      const q =
        queryConstraints.length > 0
          ? query(propertiesRef, ...queryConstraints, limit(100))
          : query(propertiesRef, limit(100));

      const querySnapshot = await getDocs(q);

      const properties: Property[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Property, "id">),
      }));

      // Lọc thêm phía client
      let filtered = properties;

      if (filters.amenities?.length) {
        filtered = filtered.filter((p) =>
          filters.amenities?.every((a) => p.amenities.includes(a))
        );
      }

      if (filters.guests) {
        filtered = filtered.filter((p) => p.capacity.guests >= filters.guests);
      }

      return { properties: filtered };
    } catch (error) {
      console.error("Error fetching properties:", error);
      return { properties: [] };
    }
  },
};
