import { Monastery } from "@/types";
import { createAuthHeaders } from "@/utils/addAuthHeaders";
import { baseUrl } from "@/utils/axiosUtils";

export const getMonasteries = async (): Promise<Monastery[]> => {
    const res = await baseUrl.get('/api/v1/monastery');
    return res.data.monasteries;
};

export const getMonasteryById = async (id: string): Promise<Monastery> => {
    const res = await baseUrl.get(`/api/v1/monastery/${id}`);
    return res.data.monastery;
};

export const createMonastery = async (
    monastery: Partial<Monastery>,
    token: string
): Promise<Monastery | null> => {
    try {
        console.log(monastery);
        const res = await baseUrl.post(
            "/api/v1/monastery/create",
            monastery,
            createAuthHeaders(token)
        );
        console.log(res.data.monastery)
        return res.data.monastery;
    } catch (error) {
        console.log(error);
    }
    return null;
};