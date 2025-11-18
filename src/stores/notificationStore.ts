import { create } from 'zustand'

interface Notification {
  id: string
  type: 'story_update' | 'vote' | 'comment' | 'achievement' | 'system'
  title: string
  message: string
  read: boolean
  created_at: string
  metadata?: any
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean

  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
  }),

  addNotification: (notification) => set((state) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      read: false,
      created_at: new Date().toISOString(),
    }
    return {
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }
  }),

  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
    unreadCount: state.notifications.find((n) => n.id === id && !n.read)
      ? state.unreadCount - 1
      : state.unreadCount,
  })),

  setLoading: (isLoading) => set({ isLoading }),
}))
