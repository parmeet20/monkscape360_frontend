import { createAuthHeaders } from "@/utils/addAuthHeaders"
import { baseUrl } from "@/utils/axiosUtils"

export const getAllMyBookings = async (userId: string, token: string) => {
    try {
        const res = await baseUrl.get(`/api/v1/booking/${userId}`, createAuthHeaders(token));
        return res;
    } catch (error) {
        return [];
    }
}

export const createBooking = async (userId: string, eventId: string, token: string) => {
    try {
        const res = await baseUrl.post(`/api/v1/booking/${eventId}/book`, { userId, eventId }, {
            headers: {
                Authorization: `Bearer ` + token
            }
        }
        );
        return res;
    } catch (error) {
        return null;
    }
}