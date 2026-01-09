import { create } from 'zustand';
import { mockMetrics, mockKanban, generateId } from '../utils/mockData';

const initialChart = Array.from({ length: 8 }, (_, idx) => ({
  hour: `${idx + 14}:00`,
  arrivals: Math.round(2 + Math.random() * 4),
}));

export const useHospitalStore = create((set, get) => ({
  metrics: mockMetrics,
  kanban: mockKanban,
  resources: {
    beds: mockMetrics.beds,
    icuBeds: mockMetrics.icuBeds,
    ventilators: mockMetrics.ventilators,
    staffReady: 32,
  },
  arrivalsChart: initialChart,
  filters: {
    search: '',
    severity: 'all',
  },
  updateResource: (key, value) =>
    set((state) => ({
      resources: {
        ...state.resources,
        [key]: value,
      },
    })),
  moveCase: (caseId, fromColumn, toColumn) => {
    const current = get().kanban;
    const card = current[fromColumn].find((c) => c.id === caseId);
    if (!card) return;
    set({
      kanban: {
        ...current,
        [fromColumn]: current[fromColumn].filter((c) => c.id !== caseId),
        [toColumn]: [card, ...current[toColumn]],
      },
    });
  },
  addIncomingCase: (payload) => {
    const newCase = {
      id: generateId('case'),
      ...payload,
      eta: payload.eta ?? '10 mins',
    };
    set((state) => ({
      kanban: {
        ...state.kanban,
        dispatched: [newCase, ...state.kanban.dispatched],
      },
    }));
  },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
}));

