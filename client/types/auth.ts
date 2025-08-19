export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "customer" | "host" | "admin";
  phone: string;
  createdAt: string;
  emailVerified: boolean;
  homestayId?: string;
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