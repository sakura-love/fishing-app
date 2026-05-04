import { create } from 'zustand';
import { CatchRecord } from '../services/types';
import * as storage from '../services/storage';

interface CatchStore {
  records: CatchRecord[];
  fishCounts: Record<string, number>;
  stats: {
    totalCatches: number;
    uniqueSpecies: number;
    maxLength: number;
    maxWeight: number;
  };
  loading: boolean;

  loadRecords: () => Promise<void>;
  addRecord: (record: CatchRecord) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  getRecordsByFish: (fishSpeciesId: string) => CatchRecord[];
}

export const useCatches = create<CatchStore>((set, get) => ({
  records: [],
  fishCounts: {},
  stats: { totalCatches: 0, uniqueSpecies: 0, maxLength: 0, maxWeight: 0 },
  loading: false,

  loadRecords: async () => {
    set({ loading: true });
    try {
      const [records, fishCounts, stats] = await Promise.all([
        storage.getAllCatchRecords(),
        storage.getFishCatchCounts(),
        storage.getCatchStats(),
      ]);
      set({ records, fishCounts, stats, loading: false });
    } catch (error) {
      console.error('Failed to load records:', error);
      set({ loading: false });
    }
  },

  addRecord: async (record: CatchRecord) => {
    await storage.insertCatchRecord(record);
    await get().loadRecords();
  },

  deleteRecord: async (id: string) => {
    await storage.deleteCatchRecord(id);
    await get().loadRecords();
  },

  getRecordsByFish: (fishSpeciesId: string) => {
    return get().records.filter((r) => r.fishSpeciesId === fishSpeciesId);
  },
}));
