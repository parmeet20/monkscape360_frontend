import { Notification } from "@/types";
import { createAuthHeaders } from "@/utils/addAuthHeaders";
import { baseUrl } from "@/utils/axiosUtils";

export const getNotifications = async (token: string): Promise<Notification[]> => {
    const res = await baseUrl.get<Notification[]>('/api/v1/notification', createAuthHeaders(token));
    // @ts-ignore
    return res.data.notifications;
};

export const deleteNotification = async (id: string, token: string): Promise<void> => {
    const res = await baseUrl.delete(`/api/v1/notification/${id}`, createAuthHeaders(token));
};