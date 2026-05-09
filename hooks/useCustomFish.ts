import { create } from 'zustand';
import { FishSpecies } from '../data/fish-encyclopedia';
import * as customFishService from '../services/custom-fish';

interface CustomFishStore {
  customFish: (FishSpecies & { photoUri?: string })[];
  loading: boolean;
  
  loadCustomFish: () => Promise<void>;
  addCustomFish: (fish: FishSpecies & { photoUri?: string }) => Promise<void>;
  deleteCustomFish: (id: string) => Promise<void>;
  getCustomFishById: (id: string) => (FishSpecies & { photoUri?: string }) | undefined;
}

export const useCustomFish = create<CustomFishStore>((set, get) => ({
  customFish: [],
  loading: false,

  loadCustomFish: async () => {
    set({ loading: true });
    try {
      const fish = await customFishService.getAllCustomFish();
      set({ customFish: fish, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  addCustomFish: async (fish) => {
    await customFishService.insertCustomFish(fish);
    await get().loadCustomFish();
  },

  deleteCustomFish: async (id) => {
    await customFishService.deleteCustomFish(id);
    await get().loadCustomFish();
  },

  getCustomFishById: (id) => {
    return get().customFish.find(f => f.id === id);
  },
}));
