import axios from "axios";
import {config}from "@/lib/config";

export const baseUrl = axios.create({
    baseURL: config.backendUrl,
})