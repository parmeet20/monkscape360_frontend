import { Post } from "@/types";
import { createAuthHeaders } from "@/utils/addAuthHeaders";
import { baseUrl } from "@/utils/axiosUtils";

export const getPosts = async (): Promise<Post[]> => {
    const res = await baseUrl.get('/api/v1/post');
    return res.data.posts;
};

export const getPostById = async (id: string): Promise<Post> => {
    const res = await baseUrl.get(`/api/v1/post/${id}`);
    return res.data.post;
};

export const createPost = async (post: Partial<Post>, token: string): Promise<Post> => {
    const res = await baseUrl.post('/api/v1/post/create', post, createAuthHeaders(token));
    return res.data;
};

export const deletePost = async (id: string, token: string): Promise<void> => {
    const res = await baseUrl.delete(`/api/v1/post/${id}`, createAuthHeaders(token));
};