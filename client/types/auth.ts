export type UserRole = "customer" | "host" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  phone: string;
  createdAt: string;
  emailVerified: boolean;
  homestayId?: string;
  propertyWishlist?: string[];
  roomWishlist?: string[];
  isActive?: boolean;
  isBanned?: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "customer" | "host";
}
