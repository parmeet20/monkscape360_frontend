"use client";

import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { config } from "@/lib/config";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { Bell, X } from "lucide-react";
import { getUserFromToken } from "@/service/user/registerUser";
import { getNotifications, deleteNotification } from "@/service/notification/notification";
import { Loader2 } from "lucide-react";
import { Notification } from "@/types";

function ModeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="rounded-full p-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:scale-105 transition-all duration-200 focus:outline-none"
            style={{
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {theme === "dark" ? (
                <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            ) : (
                <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            )}
        </button>
    );
}

export default function VirtualTourNavbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, setUser, setToken, logout, token } = useAuthStore();
    const [loadingUser, setLoadingUser] = useState(true);
    const router = useRouter();

    // Notifications state & WS ref
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const cleanToken = token ? token.replace(/^"(.*)"$/, "$1") : token!;

    // Init auth
    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem("token");
            if (storedToken && !user) {
                try {
                    setToken(storedToken);
                    const fetchedUser = await getUserFromToken(cleanToken);
                    setUser(fetchedUser);
                } catch (err) {
                    console.error("Failed to fetch user from token", err);
                    logout();
                }
            }
            setLoadingUser(false);
        };
        initAuth();
    }, [setToken, setUser, logout, user]);

    useEffect(() => {
        if (!token) return;
        const fetchNotifications = async () => {
            setLoadingNotifications(true);
            try {
                const data = await getNotifications(cleanToken);
                setNotifications(data);
            } catch (error) {
                console.error("Failed to load notifications:", error);
            } finally {
                setLoadingNotifications(false);
            }
        };
        fetchNotifications();
    }, [token, isSheetOpen]);

    // Setup WebSocket & live notifications
    useEffect(() => {
        if (!token) return;
        const cleanToken = token.replace(/^"(.*)"$/, "$1");
        const wsUrl = new URL(config.wsUrl);
        wsUrl.searchParams.append("token", cleanToken);

        const socket = new WebSocket(wsUrl.toString());
        wsRef.current = socket;

        socket.onopen = () => {
            console.log("[WS] Connected");
        };

        socket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "notification") {
                    const newNotification: Notification = {
                        id: `ws-${Date.now()}`,
                        userId: (msg.data.userId as string) || `ws-${Date.now()}`,
                        message: msg.data.message || "New notification",
                        createdAt: msg.data.timestamp || new Date().toISOString(),
                    };

                    console.log("[WS] New notification:", newNotification);
                    setNotifications((prev) => {
                        const exists = prev.some((n) => n.id === newNotification.id);
                        if (exists) return prev;
                        return [newNotification, ...prev];
                    });
                }
            } catch (error) {
                console.error("Failed to parse WS message:", error);
            }
        };

        socket.onerror = (error) => {
            console.error("[WS] Error", error);
        };

        socket.onclose = () => {
            console.log("[WS] Disconnected");
        };

        return () => {
            socket.close();
        };
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        logout();
        router.push("/login");
    };

    const handleDeleteNotification = async (id: string) => {
        if (!token) return;
        try {
            await deleteNotification(id, token);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const menuItems = [
        { name: "Home", link: "/" },
        { name: "Monastery", link: "/monastery" },
        { name: "Events", link: "/event" },
        { name: "Posts", link: "/post" },
    ];

    return (
        <div className="fixed w-full z-50">
            <Navbar>
                <NavBody>
                    {/* Logo */}
                    <div className="navbar-logo">
                        <Link
                            href="/"
                            className="text-2xl bg-gradient-to-r from-orange-400 to-orange-500 font-extrabold bg-clip-text text-transparent hover:scale-105 transition-all duration-300"
                        >
                            MonkScape360
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <NavItems
                        items={menuItems.map((item) => ({
                            name: item.name,
                            link: item.link,
                        }))}
                    />

                    <div className="flex items-center gap-4 relative" style={{ zIndex: 50 }}>
                        <ModeToggle />

                        {user && token && (
                            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                <SheetTrigger asChild>
                                    <button
                                        aria-label="Open notifications"
                                        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-white dark:focus:ring-offset-slate-950"
                                    >
                                        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                        {notifications.length > 0 && (
                                            <span className="absolute -top-1 -right-1 rounded-full bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center font-bold">
                                                {notifications.length}
                                            </span>
                                        )}
                                    </button>
                                </SheetTrigger>

                                <SheetContent side="right" className="w-96 p-4">
                                    <SheetHeader>
                                        <div className="flex justify-between items-center">
                                            <SheetTitle>Notifications</SheetTitle>
                                            <SheetClose asChild>
                                                <button
                                                    aria-label="Close notifications"
                                                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </SheetClose>
                                        </div>
                                    </SheetHeader>

                                    <div className="mt-4 overflow-y-auto max-h-[60vh]">
                                        {loadingNotifications ? (
                                            <Loader2 className="mx-auto animate-spin text-gray-500" />
                                        ) : notifications.length === 0 ? (
                                            <p className="text-center text-gray-500">No notifications</p>
                                        ) : (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className="border-b border-gray-200 dark:border-gray-700 py-2 flex justify-between items-start"
                                                >
                                                    <div>
                                                        <p className="font-semibold">
                                                            {notif.message || "Notification"}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {new Date(notif.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteNotification(notif.id)}
                                                        aria-label="Delete notification"
                                                        className="text-red-500 hover:text-red-700 ml-4"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </SheetContent>
                            </Sheet>
                        )}

                        {loadingUser ? (
                            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                        ) : !user ? (
                            <Button className="rounded-full">
                                <Link href={"/login"}>Login</Link>
                            </Button>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="rounded-full">{user.username}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => router.push("/profile")}
                                        className="cursor-pointer"
                                    >
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer text-red-500"
                                    >
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </NavBody>

                <MobileNav>
                    <MobileNavHeader>
                        <Link
                            href="/"
                            className="text-2xl bg-gradient-to-r from-orange-400 to-orange-500 font-extrabold bg-clip-text text-transparent hover:scale-105 transition-all duration-300"
                        >
                            MonkScape360
                        </Link>
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        />
                    </MobileNavHeader>

                    <MobileNavMenu
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    >
                        {menuItems.map((item, idx) => (
                            <Link
                                key={`mobile-link-${idx}`}
                                href={item.link}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="relative text-neutral-600 dark:text-neutral-300 py-3"
                            >
                                <span className="block">{item.name}</span>
                            </Link>
                        ))}
                        <div className="flex flex-col gap-3 py-3">
                            <div className="flex items-center gap-4">
                                <ModeToggle />
                                <span className="text-neutral-600 dark:text-neutral-300">
                                    Toggle Theme
                                </span>
                            </div>

                            {user && token && (
                                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                    <SheetTrigger asChild>
                                        <div className="flex items-center gap-4">
                                            <button
                                                aria-label="Open notifications"
                                                className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-white dark:focus:ring-offset-slate-950"
                                            >
                                                <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                                {notifications.length > 0 && (
                                                    <span className="absolute -top-1 -right-1 rounded-full bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center font-bold">
                                                        {notifications.length}
                                                    </span>
                                                )}
                                            </button>
                                            <span className="text-neutral-600 dark:text-neutral-300">
                                                Notifications
                                            </span>
                                        </div>
                                    </SheetTrigger>

                                    <SheetContent side="right" className="w-96 p-4">
                                        <SheetHeader>
                                            <div className="flex justify-between items-center">
                                                <SheetTitle>Notifications</SheetTitle>
                                                <SheetClose asChild>
                                                    <button
                                                        aria-label="Close notifications"
                                                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </SheetClose>
                                            </div>
                                        </SheetHeader>

                                        <div className="mt-4 overflow-y-auto max-h-[60vh]">
                                            {loadingNotifications ? (
                                                <Loader2 className="mx-auto animate-spin text-gray-500" />
                                            ) : notifications.length === 0 ? (
                                                <p className="text-center text-gray-500">
                                                    No notifications
                                                </p>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className="border-b border-gray-200 dark:border-gray-700 py-2 flex justify-between items-start"
                                                    >
                                                        <div>
                                                            <p className="font-semibold">
                                                                {notif.message || "Notification"}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                                {new Date(notif.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteNotification(notif.id)
                                                            }
                                                            aria-label="Delete notification"
                                                            className="text-red-500 hover:text-red-700 ml-4"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            )}

                            {loadingUser ? (
                                <div className="flex items-center gap-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                                    <span className="text-neutral-600 dark:text-neutral-300">
                                        Loading...
                                    </span>
                                </div>
                            ) : !user ? (
                                <Button className="rounded-full">
                                    <Link href={"/login"}>Login</Link>
                                </Button>
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="rounded-full">{user.username}</Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => router.push("/profile")}
                                            className="cursor-pointer"
                                        >
                                            Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="cursor-pointer text-red-500"
                                        >
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>
        </div>
    );
}