import { create } from 'zustand';
import { mockIncidents, generateId } from '../utils/mockData';

const filterOptions = ['Today', 'Last 2 Hours', 'High Priority', 'Open Cases'];

export const usePoliceStore = create((set) => ({
  incidents: mockIncidents,
  filterOptions,
  activeFilter: 'Today',
  highlightId: null,
  addIncident: (incident) =>
    set((state) => ({
      incidents: [
        {
          id: generateId('inc'),
          severity: 'medium',
          status: 'Open',
          time: 'Just now',
          ...incident,
        },
        ...state.incidents,
      ],
      highlightId: incident.id ?? null,
    })),
  markIncident: (incidentId, status) =>
    set((state) => ({
      incidents: state.incidents.map((inc) =>
        inc.id === incidentId ? { ...inc, status } : inc
      ),
    })),
  setFilter: (filter) => set({ activeFilter: filter }),
}));

