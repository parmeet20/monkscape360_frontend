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
import { useState, useEffect } from "react";
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
import { useNotificationStore } from "@/store/notificationStore";

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
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  const router = useRouter();

  // Notification store
  const { notifications, clearNotifications } = useNotificationStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Debug auth and notifications
  useEffect(() => {
    console.log("[Navbar] User:", user, "Token:", token);
    console.log("[Navbar] Notifications:", notifications);
    // Subscribe to store updates
    const unsubscribe = useNotificationStore.subscribe((state) =>
      console.log("[Navbar] Store updated:", state.notifications)
    );
    return () => unsubscribe();
  }, [user, token, notifications]);

  // Initialize auth with session persistence
  useEffect(() => {
    const initAuth = async () => {
      let storedToken = localStorage.getItem("token");
      if (!storedToken) {
        console.log("[Navbar] No token in localStorage");
        useAuthStore.setState({ user: null, token: null });
        return;
      }

      // Parse token if stored as JSON string
      try {
        storedToken = JSON.parse(storedToken);
      } catch (e) {
        console.warn("[Navbar] Failed to parse token from localStorage, using as-is", e);
      }

      if (!storedToken) {
        console.log("[Navbar] Token is empty after parsing");
        useAuthStore.setState({ user: null, token: null });
        return;
      }

      // Set token in store immediately
      setToken(storedToken);
      console.log("[Navbar] Token set in store:", storedToken);

      try {
        const fetchedUser = await getUserFromToken(storedToken);
        setUser(fetchedUser);
        console.log("[Navbar] User fetched successfully:", fetchedUser);
      } catch (err) {
        console.error("[Navbar] Failed to fetch user from token:", err);
        if (err) {
          console.log("[Navbar] Invalid token, clearing session");
          localStorage.removeItem("token");
          logout();
        } else {
          console.log("[Navbar] Non-401 error, preserving token");
        }
      }
    };

    // Run only if user and token are not already set
    if (!user && !token) {
      initAuth();
    }
  }, [setToken, setUser, logout, user, token]);

  const handleLogout = () => {
    console.log("[Navbar] Logging out");
    localStorage.removeItem("token");
    logout();
    clearNotifications();
    router.push("/login");
  };

  const handleDeleteNotification = (index: number) => {
    console.log("[Navbar] Deleting notification at index:", index);
    useNotificationStore.setState((state) => ({
      notifications: state.notifications.filter((_, i) => i !== index),
    }));
  };

  const menuItems = [
    { name: "Home", link: "/" },
    { name: "Monastery", link: "/monastery" },
    { name: "Events", link: "/event" },
    { name: "Communities", link: "/post" },
  ];

  return (
    <div className="fixed w-full z-50">
      <Navbar>
        <NavBody>
          {/* Logo */}
          <div className="navbar-logo">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
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

            {/* Show notification bell if token exists */}
            {token ? (
              <>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen} key={notifications.length}>
                  <SheetTrigger asChild>
                    <button
                      aria-label="Open notifications"
                      className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-white dark:focus:ring-offset-slate-950"
                      onClick={() => console.log("[Navbar] Opening notification sheet")}
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
                            onClick={() => console.log("[Navbar] Closing notification sheet")}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </SheetClose>
                      </div>
                    </SheetHeader>

                    <div className="mt-4 overflow-y-auto max-h-[60vh]">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-500">No notifications</p>
                      ) : (
                        notifications.map((notif, index) => (
                          <div
                            key={index}
                            className="border-b border-gray-200 dark:border-gray-700 py-2 flex justify-between items-start"
                          >
                            <div>
                              <p className="font-semibold">{notif.message || "Notification"}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {new Date(notif.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteNotification(index)}
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

                {user ? (
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
                ) : (
                  <Button className="rounded-full">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <Button className="rounded-full">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
              </Button>
            )}
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
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
                <span className="text-neutral-600 dark:text-neutral-300">Toggle Theme</span>
              </div>

              {token ? (
                <>
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen} key={notifications.length}>
                    <SheetTrigger asChild>
                      <div className="flex items-center gap-4">
                        <button
                          aria-label="Open notifications"
                          className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-white dark:focus:ring-offset-slate-950"
                          onClick={() => console.log("[Navbar] Opening mobile notification sheet")}
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
                              onClick={() => console.log("[Navbar] Closing mobile notification sheet")}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </SheetClose>
                        </div>
                      </SheetHeader>

                      <div className="mt-4 overflow-y-auto max-h-[60vh]">
                        {notifications.length === 0 ? (
                          <p className="text-center text-gray-500">No notifications</p>
                        ) : (
                          notifications.map((notif, index) => (
                            <div
                              key={index}
                              className="border-b border-gray-200 dark:border-gray-700 py-2 flex justify-between items-start"
                            >
                              <div>
                                <p className="font-semibold">{notif.message || "Notification"}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {new Date(notif.timestamp).toLocaleString()}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteNotification(index)}
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

                  {user ? (
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
                  ) : (
                    <Button className="rounded-full">
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        Login
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <Button className="rounded-full">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}