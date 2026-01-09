import { create } from 'zustand';
import { bookingSteps, mockBookings, generateId } from '../utils/mockData';

export const useBookingStore = create((set, get) => ({
  activeBooking: {
    ...mockBookings[0],
    driver: {
      name: 'Arjun Mehta',
      rating: 4.9,
      vehicle: 'DL 10 AB 4321',
      contact: '+91 98200 11223',
      photo: 'https://i.pravatar.cc/72?img=12',
    },
    progressIndex: 2,
  },
  bookingHistory: mockBookings.slice(1),
  currentStep: 0,
  steps: bookingSteps,
  isCreating: false,
  etaCountdown: 12,
  livePath: [
    { lat: 28.4595, lng: 77.0266 },
    { lat: 28.46, lng: 77.04 },
  ],
  createBooking: async (payload) => {
    set({ isCreating: true });
    return new Promise((resolve) => {
      setTimeout(() => {
        const newBooking = {
          id: generateId('bk'),
          ...payload,
          status: 'Request Received',
          eta: '15 mins',
          cost: 2500,
        };
        set((state) => ({
          activeBooking: {
            ...newBooking,
            driver: null,
            progressIndex: 0,
          },
          bookingHistory: [state.activeBooking, ...state.bookingHistory],
          currentStep: 0,
          isCreating: false,
        }));
        resolve(newBooking);
      }, 1300);
    });
  },
  updateBookingStatus: (status) => {
    const idx = bookingSteps.indexOf(status);
    set((state) => ({
      activeBooking: {
        ...state.activeBooking,
        status,
        progressIndex: idx,
      },
      currentStep: idx,
    }));
  },
  advanceStep: () => {
    const { currentStep } = get();
    if (currentStep >= bookingSteps.length - 1) return;
    const next = currentStep + 1;
    get().updateBookingStatus(bookingSteps[next]);
  },
  resetBooking: () => {
    set({
      currentStep: 0,
      activeBooking: null,
    });
  },
  tickCountdown: () => {
    set((state) => ({
      etaCountdown: Math.max(0, state.etaCountdown - 1),
    }));
  },
}));

