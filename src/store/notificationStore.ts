import { create } from 'zustand';

type Notification = {
  message: string;
  timestamp: string;
};

type NotificationStore = {
  notifications: Notification[];
  addNotification: (notif: Notification) => void;
  clearNotifications: () => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notif) =>
    set((state) => {
      return {
        notifications: [notif, ...state.notifications],
      };
    }),
  clearNotifications: () => set({ notifications: [] }),
}));