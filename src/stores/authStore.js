import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rolesList } from '../utils/mockData';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: 'USER',
      isAuthenticated: false,
      isLoading: false,
      error: null,
      themeMode: 'light',
      notifications: 3,
      availableRoles: rolesList,
      login: async ({ email, role = 'USER' }) => {
        set({ isLoading: true, error: null });

        // Simulated auth request — replace with real API call.
        return new Promise((resolve) => {
          setTimeout(() => {
            const mockUser = {
              id: 'demo-user',
              name: 'Demo Operator',
              email,
              role,
            };
            set({
              user: mockUser,
              role,
              isAuthenticated: true,
              isLoading: false,
              notifications: 4,
            });
            resolve(mockUser);
          }, 1100);
        });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false, role: 'USER', notifications: 0 });
      },
      switchRole: (role) => {
        if (!rolesList.includes(role)) return;
        set({ role });
      },
      toggleTheme: () => {
        const current = get().themeMode;
        set({ themeMode: current === 'light' ? 'dark' : 'light' });
      },
      markNotificationsRead: () => set({ notifications: 0 }),
      addNotification: () =>
        set((state) => ({ notifications: state.notifications + 1 })),
    }),
    {
      name: 'emr-connect-auth',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        themeMode: state.themeMode,
      }),
    }
  )
);

