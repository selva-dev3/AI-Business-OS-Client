"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { auth } from "@/lib/auth";
import { toast } from "sonner";

let socket: Socket | null = null;

export function useWebSocket() {
  const { user } = useAuthStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!user) return;

    socket = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001", {
      auth: { token: auth.getAccessToken() },
      transports: ["websocket"],
    });

    socket.on("notification", (notification) => {
      addNotification(notification);
      toast(notification.title, { description: notification.message });
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket error:", err);
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [user?.id, addNotification]);

  return { socket };
}
