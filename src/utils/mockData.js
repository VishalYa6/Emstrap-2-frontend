export const emergencyTypes = [
  { id: 'accident', label: 'Accident', icon: '🚨', description: 'Road or industrial accidents requiring urgent care.' },
  { id: 'medical', label: 'Medical Emergency', icon: '🩺', description: 'Cardiac arrest, stroke, or other acute conditions.' },
  { id: 'maternity', label: 'Pregnancy & Maternity', icon: '🤰', description: 'Labor support and prenatal complications.' },
  { id: 'transfer', label: 'Patient Transfer', icon: '🏥', description: 'Inter-facility transfers or scheduled transport.' },
];

export const ambulanceTypes = [
  { id: 'bls', label: 'Basic Life Support', features: ['Oxygen support', 'Basic monitoring'], price: 1500 },
  { id: 'als', label: 'Advanced Life Support', features: ['Cardiac monitor', 'Advanced airway equipment'], price: 3200 },
  { id: 'neonatal', label: 'Neonatal', features: ['Incubator', 'Neonatal specialist'], price: 4100 },
  { id: 'air', label: 'Air Ambulance', features: ['Rapid transport', 'Critical care team'], price: 15000 },
];

export const bookingSteps = [
  'Request Received',
  'Ambulance Dispatched',
  'Driver Arrived',
  'En Route to Hospital',
  'Completed',
];

export const rolesList = ['USER', 'AMBULANCE', 'HOSPITAL', 'POLICE', 'ADMIN'];

export const mockUsers = [
  { id: 'u-1', name: 'Neha Sharma', role: 'USER', active: true },
  { id: 'u-2', name: 'Dr. Manoj Singh', role: 'HOSPITAL', active: true },
  { id: 'u-3', name: 'Rahul Verma', role: 'AMBULANCE', active: true },
  { id: 'u-4', name: 'Inspector Farah Ali', role: 'POLICE', active: true },
  { id: 'u-5', name: 'Aditi Rao', role: 'ADMIN', active: true },
];

export const mockIncidents = [
  { id: 'inc-101', title: 'Multi-vehicle collision', severity: 'critical', location: 'NH48, Sector 29', time: '5 mins ago', status: 'Open' },
  { id: 'inc-102', title: 'Industrial accident', severity: 'high', location: 'IMT Manesar', time: '18 mins ago', status: 'Responding' },
  { id: 'inc-103', title: 'Fire & smoke inhalation', severity: 'medium', location: 'DLF Phase 2', time: '25 mins ago', status: 'Open' },
];

export const mockRequests = [
  { id: 'req-1', type: 'Accident', distance: '2.4 km', urgency: 'critical', patient: 'Male, 32', elapsed: '3 mins' },
  { id: 'req-2', type: 'Medical Emergency', distance: '4.8 km', urgency: 'high', patient: 'Female, 58', elapsed: '6 mins' },
  { id: 'req-3', type: 'Pregnancy', distance: '6.1 km', urgency: 'medium', patient: 'Female, 29', elapsed: '12 mins' },
];

export const mockBookings = [
  {
    id: 'bk-9001',
    type: 'Medical Emergency',
    origin: 'Cyber City, Gurugram',
    destination: 'Medanta Hospital',
    status: 'En Route to Hospital',
    eta: '12 mins',
    cost: 2800,
  },
  {
    id: 'bk-9000',
    type: 'Accident',
    origin: 'NH48 Toll Plaza',
    destination: 'Fortis Hospital',
    status: 'Completed',
    eta: '0 mins',
    cost: 3200,
  },
];

export const mockMetrics = {
  beds: 68,
  icuBeds: 12,
  ventilators: 18,
  incoming: 7,
};

export const mockKanban = {
  dispatched: [
    { id: 'case-101', patient: 'Ananya B', condition: 'Accident Trauma', eta: '8 mins' },
    { id: 'case-102', patient: 'Rohit S', condition: 'Cardiac Arrest', eta: '5 mins' },
  ],
  enRoute: [
    { id: 'case-110', patient: 'Prakash G', condition: 'Stroke', eta: '3 mins' },
  ],
  arrived: [
    { id: 'case-120', patient: 'Baby R', condition: 'NICU Transfer', eta: '0 mins' },
  ],
  admitted: [
    { id: 'case-130', patient: 'Karan L', condition: 'Polytrauma', eta: '-' },
  ],
  discharged: [],
};

export const mockAdminMetrics = {
  totalUsers: 6420,
  activeAmbulances: 128,
  registeredHospitals: 54,
  todaysEmergencies: 312,
  avgResponseTime: '11m 40s',
};

export const mockAnalytics = {
  bookings: Array.from({ length: 30 }, (_, idx) => ({
    day: `Day ${idx + 1}`,
    value: Math.round(200 + Math.random() * 120),
  })),
  emergencyBreakdown: [
    { name: 'Accident', value: 38 },
    { name: 'Medical', value: 32 },
    { name: 'Maternity', value: 18 },
    { name: 'Transfer', value: 12 },
  ],
  responseByRegion: [
    { region: 'Central', time: 9 },
    { region: 'North', time: 12 },
    { region: 'South', time: 15 },
    { region: 'East', time: 11 },
    { region: 'West', time: 14 },
  ],
};

export const mockTimeline = [
  { id: 't1', label: 'Request Received', timestamp: '16:02' },
  { id: 't2', label: 'Ambulance Dispatched', timestamp: '16:05' },
  { id: 't3', label: 'Driver Arrived', timestamp: '16:13' },
  { id: 't4', label: 'En Route to Hospital', timestamp: '16:18' },
];

export const statusColors = {
  critical: '#DC2626',
  high: '#F97316',
  medium: '#FBBF24',
  low: '#10B981',
  Completed: '#059669',
  'En Route to Hospital': '#3B82F6',
  'Ambulance Dispatched': '#0284C7',
  'Driver Arrived': '#F59E0B',
  'Request Received': '#6366F1',
};

export const generateId = (prefix = 'id') =>
  `${prefix}-${Math.random().toString(36).substring(2, 8)}`;

