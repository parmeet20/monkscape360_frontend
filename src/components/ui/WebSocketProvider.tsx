"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    ReactNode,
} from "react";
import { config } from "@/lib/config";
import { useAuthStore } from "@/store/userStore";

type WebSocketContextType = {
    socket: WebSocket | null;
    sendMessage: (msg: string) => void;
    isConnected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
    const [isConnected, setIsConnected] = useState(false);
    const { token } = useAuthStore();
    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!token) return;

        let isMounted = true;
        const cleanToken = token.replace(/^"(.*)"$/, "$1");
        const url = new URL(config.wsUrl);
        url.searchParams.append("token", cleanToken);

        const connect = () => {
            if (!isMounted) return;

            const socket = new WebSocket(url.toString());
            socketRef.current = socket;

            socket.onopen = () => {
                console.log("[WS] Connected ✅");
                setIsConnected(true);
            };

            socket.onclose = (event) => {
                console.warn(`[WS] Disconnected (code: ${event.code}). Reconnecting in 3s...`);
                setIsConnected(false);
                if (isMounted) {
                    reconnectTimeout.current = setTimeout(connect, 3000);
                }
            };

            socket.onerror = (err) => {
                console.error("[WS] Error:", err);
            };

            socket.onmessage = (event) => {
                console.log("[WS] Message:", event.data);
            };
        };

        connect();

        return () => {
            isMounted = false;
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
            socketRef.current?.close();
        };
    }, [token]);

    const sendMessage = (msg: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(msg);
        }
    };

    return (
        <WebSocketContext.Provider
            value={{ socket: socketRef.current, sendMessage, isConnected }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) throw new Error("useWebSocket must be used within WebSocketProvider");
    return context;
};
