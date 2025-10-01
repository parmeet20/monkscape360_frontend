"use client";

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { config } from "@/lib/config";
import { useAuthStore } from "@/store/userStore";
import { useNotificationStore } from "@/store/notificationStore";

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
  const addNotification = useNotificationStore((state) => state.addNotification);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        console.log("[WS] Notification permission:", permission);
      });
    }

    // Initialize audio for notification sound
    audioRef.current = new Audio(
      "https://notificationsounds.com/storage/sounds/file-sounds-1150-served.mp3"
    );
    audioRef.current.preload = "auto";

    if (!token) {
      console.log("[WS] No token provided, skipping WebSocket connection");
      return;
    }

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

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log("[WS] Message:", msg);

          if (msg.type === "notification") {
            const { message, timestamp } = msg.data;
            console.log("[WS] Adding notification:", { message, timestamp });
            addNotification({ message, timestamp });

            // Play notification sound
            if (audioRef.current) {
              audioRef.current.play().catch((e) => {
                console.error("[WS] Failed to play notification sound:", e);
              });
            }

            // Show browser push notification
            if (Notification.permission === "granted") {
              new Notification("New Notification", {
                body: message,
                icon: "/favicon.ico", // Replace with your app's icon
              });
            } else {
              console.warn("[WS] Push notifications not permitted");
            }

            console.log("[WS] Notification added to store");
          }
        } catch (e) {
          console.error("[WS] Invalid message", e);
        }
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
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      socketRef.current?.close();
      console.log("[WS] Closing WebSocket");
    };
  }, [token, addNotification]);

  const sendMessage = (msg: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(msg);
    } else {
      console.warn("[WS] Cannot send message, socket is not open");
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