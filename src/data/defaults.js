const BIDA_LO = 'Bida l\u1ed7';
const BIDA_3_BANG = 'Bida 3 b\u0103ng';
const BIDA_BANG_DAI = 'Bida b\u0103ng d\u00e0i';

export const DEFAULT_TABLES = [
  { id: 2, name: 'B\u00e0n 1', type: BIDA_LO, hourlyRate: 20000, occupied: true, startTime: '2026-07-01T15:56:49.003Z', items: [] },
  { id: 3, name: 'B\u00e0n 2', type: BIDA_3_BANG, hourlyRate: 20000, occupied: false, startTime: null, items: [] },
  { id: 4, name: 'B\u00e0n 3', type: BIDA_3_BANG, hourlyRate: 20000, occupied: false, startTime: null, items: [] },
  { id: 5, name: 'B\u00e0n 4', type: BIDA_3_BANG, hourlyRate: 20000, occupied: false, startTime: null, items: [] },
  { id: 6, name: 'B\u00e0n 5', type: BIDA_3_BANG, hourlyRate: 20000, occupied: false, startTime: null, items: [] },
];

export const DEFAULT_MENU = [
  { id: 'd1', name: 'Bia Tiger Nh\u1ecf', category: 'drink', price: 15000 },
  { id: 'd2', name: 'Pepsi', category: 'drink', price: 10000 },
  { id: 'd3', name: 'Sting', category: 'drink', price: 10000 },
  { id: 'f2', name: 'M\u1ef1c kh\u00f4', category: 'food', price: 100000 },
  { id: 'd4', name: 'Kh\u00f4ng \u0111\u1ed9', category: 'drink', price: 10000 },
  { id: 'd5', name: 'Rivai', category: 'drink', price: 10000 },
  { id: 'd6', name: 'B\u00f2 h\u00fat', category: 'drink', price: 15000 },
  { id: 'd7', name: 'Rivai chanh mu\u1ed1i', category: 'drink', price: 10000 },
  { id: 'd8', name: 'Larue Smooth', category: 'drink', price: 13000 },
  { id: 'f3', name: 'Tr\u00e1i C\u00e2y', category: 'food', price: 20000 },
];

export const TABLE_TYPES = [BIDA_LO, 'Bida carom', BIDA_3_BANG, BIDA_BANG_DAI];
