import { baseUrl } from "@/utils/axiosUtils";
import { UserRegisterRequest, UserLoginRequest, AuthResponse, UserResponse } from "@/types";
import { useAuthStore } from "@/store/userStore";
import { createAuthHeaders } from "@/utils/addAuthHeaders";
export const getUserFromToken = async (token: string): Promise<UserResponse> => {
    const res = await baseUrl.get('/api/v1/user', createAuthHeaders(token));
    return res.data.user;
};


export const registerUser = async (user: UserRegisterRequest): Promise<AuthResponse> => {
    const res = await baseUrl.post<AuthResponse>('/api/v1/user/register', user);
    return res.data;
};

export const loginUser = async (credentials: UserLoginRequest): Promise<AuthResponse> => {
    const res = await baseUrl.post<AuthResponse>('/api/v1/user/login', credentials);
    const data = res.data;

    // Store token and user in Zustand
    const { setToken, setUser } = useAuthStore.getState();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", JSON.stringify(data.token));

    return data;
};