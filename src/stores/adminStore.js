import { create } from 'zustand';
import { mockAdminMetrics, mockUsers, mockAnalytics, rolesList, generateId } from '../utils/mockData';

export const useAdminStore = create((set) => ({
  metrics: mockAdminMetrics,
  users: mockUsers,
  analytics: mockAnalytics,
  settings: {
    emergencyCategories: ['Accident', 'Medical', 'Maternity', 'Transfer'],
    slaThreshold: 12,
    notifications: {
      sms: true,
      push: true,
      email: false,
    },
  },
  updateUserRole: (userId, role) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, role } : user
      ),
    })),
  toggleUserActive: (userId) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, active: !user.active } : user
      ),
    })),
  addUser: (user) =>
    set((state) => ({
      users: [
        {
          id: generateId('user'),
          role: rolesList.includes(user.role) ? user.role : 'USER',
          active: true,
          ...user,
        },
        ...state.users,
      ],
    })),
  updateSettings: (updates) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...updates,
      },
    })),
}));

