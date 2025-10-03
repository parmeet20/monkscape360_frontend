import { Event } from "@/types";
import { createAuthHeaders } from "@/utils/addAuthHeaders";
import { baseUrl } from "@/utils/axiosUtils";

export const getEvents = async (): Promise<Event[]> => {
    const res = await baseUrl.get('/api/v1/event');
    return res.data.events;
};

export const getEventById = async (id: string): Promise<Event> => {
    const res = await baseUrl.get(`/api/v1/event/${id}`);
    return res.data.event;
};

export const createEvent = async (event: Partial<Event>, token: string): Promise<Event> => {
    event.reserved = 0;
    const res = await baseUrl.post('/api/v1/event/create', event, createAuthHeaders(token));
    return res.data.event;
};

export const deleteEvent = async (id: string, token: string) => {
    await baseUrl.delete(`/api/v1/event/${id}`, createAuthHeaders(token));
};