import { create } from 'zustand';
import { mockRequests, mockTimeline } from '../utils/mockData';

export const useAmbulanceStore = create((set, get) => ({
  location: { lat: 28.4595, lng: 77.0266 },
  nearbyRequests: mockRequests,
  activeRide: null,
  acceptedRides: [],
  timeline: mockTimeline,
  toasts: [],
  acceptRequest: (requestId) => {
    const request = get().nearbyRequests.find((r) => r.id === requestId);
    if (!request) return;

    set((state) => ({
      activeRide: {
        ...request,
        status: 'Accepted',
        updates: ['Crew notified', 'Route generated'],
      },
      nearbyRequests: state.nearbyRequests.filter((r) => r.id !== requestId),
      acceptedRides: [request, ...state.acceptedRides],
      toasts: [
        ...state.toasts,
        { id: Date.now(), message: `Request ${request.id} accepted` },
      ],
    }));
  },
  rejectRequest: (requestId) => {
    set((state) => ({
      nearbyRequests: state.nearbyRequests.filter((r) => r.id !== requestId),
      toasts: [
        ...state.toasts,
        { id: Date.now(), message: `Request ${requestId} rejected` },
      ],
    }));
  },
  updateRideStatus: (status) => {
    set((state) => ({
      activeRide: state.activeRide
        ? { ...state.activeRide, status }
        : null,
      timeline: [
        ...state.timeline,
        { id: Date.now().toString(), label: status, timestamp: 'Now' },
      ],
    }));
  },
  updateLocation: (coords) => set({ location: coords }),
  dismissToast: (toastId) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    })),
}));

