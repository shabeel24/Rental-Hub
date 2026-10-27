import { Equipment } from './api';

// Shown only when the backend cannot be reached, so the design is still visible.
export const SAMPLE: Equipment[] = [
  { id: 1, name: 'Plastic Chair', description: 'Stackable white chair', category: 'Furniture', pricePerDay: 5, depositAmount: 2, totalStock: 200, active: true },
  { id: 2, name: 'Round Table', description: 'Six-seater round table', category: 'Furniture', pricePerDay: 40, depositAmount: 20, totalStock: 40, active: true },
  { id: 3, name: 'Tent 20x20', description: 'Weatherproof event tent', category: 'Tents', pricePerDay: 1500, depositAmount: 500, totalStock: 6, active: true },
  { id: 4, name: 'PA Speaker Set', description: 'Two speakers with mixer', category: 'Sound', pricePerDay: 1200, depositAmount: 800, totalStock: 8, active: true },
  { id: 5, name: 'LED Par Light', description: 'RGB stage light', category: 'Lighting', pricePerDay: 250, depositAmount: 100, totalStock: 30, active: true },
];
