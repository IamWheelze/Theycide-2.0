import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  modalsOpen: Record<string, boolean>
  activeTab: string

  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  toggleModal: (modalId: string) => void
  setActiveTab: (tab: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarOpen: true,
      modalsOpen: {},
      activeTab: 'overview',

      setTheme: (theme) => set({ theme }),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      openModal: (modalId) => set((state) => ({
        modalsOpen: { ...state.modalsOpen, [modalId]: true },
      })),

      closeModal: (modalId) => set((state) => ({
        modalsOpen: { ...state.modalsOpen, [modalId]: false },
      })),

      toggleModal: (modalId) => set((state) => ({
        modalsOpen: { ...state.modalsOpen, [modalId]: !state.modalsOpen[modalId] },
      })),

      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
    }
  )
)
