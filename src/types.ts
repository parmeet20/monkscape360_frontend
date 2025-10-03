// User registration request DTO
export interface UserRegisterRequest {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName?: string;
}

// User login request DTO
export interface UserLoginRequest {
    usernameOrEmail: string;
    password: string;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    createdAt: string;
}

// User info returned from backend (response)
export interface UserResponse {
    id: string;
    username: string;
    email: string;
    fullName?: string;
    role: "admin" | "tourist" | "local_community" | "researcher";
    createdAt: string;
    updatedAt: string;
}

// Auth response
export interface AuthResponse {
    token: string;
    user: UserResponse;
}

// Monastery type
export interface Monastery {
    id: string;
    name: string;
    description?: string;
    establishedYear?: number;
    address?: string;
    geoLatitude: number;
    geoLongitude: number;
    mainImageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

// Event type
export interface Event {
    id: string;
    monasteryId: string;
    name: string;
    description?: string;
    seats: number;
    reserved: number;
    ticketPrice: number;
    imageUrl?: string;
    startDate?: string;
    endDate?: string;
    recurring: boolean;
    status: "pending" | "confirmed" | "cancelled";
    createdAt: string;
}

// Post type
export interface Post {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    userId: string;
    views: number;
    createdAt: string;
}
