import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, OnboardingData, FormatEnum } from '@/types';
import { mockApi } from '@/services/mockApi';

interface AppState {
  user: UserProfile | null;
  isOnboarded: boolean;
  isLoading: boolean;
  selectedFormat: FormatEnum | null;
  
  setUser: (user: UserProfile | null) => void;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  setSelectedFormat: (format: FormatEnum | null) => void;
  loadStoredUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const STORAGE_KEY = '@futmatch_user';

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isOnboarded: false,
  isLoading: true,
  selectedFormat: null,

  setUser: (user) => {
    set({ user, isOnboarded: !!user });
  },

  completeOnboarding: async (data: OnboardingData) => {
    console.log('[Store] Completing onboarding...');
    set({ isLoading: true });
    
    try {
      const user = await mockApi.createUser(data);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      set({ user, isOnboarded: true, isLoading: false });
      console.log('[Store] Onboarding complete:', user.nickname);
    } catch (error) {
      console.error('[Store] Onboarding error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  setSelectedFormat: (format) => {
    set({ selectedFormat: format });
  },

  loadStoredUser: async () => {
    console.log('[Store] Loading stored user...');
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as UserProfile;
        user.birth_date = new Date(user.birth_date);
        set({ user, isOnboarded: true, isLoading: false });
        console.log('[Store] Loaded user:', user.nickname);
      } else {
        set({ isLoading: false });
        console.log('[Store] No stored user found');
      }
    } catch (error) {
      console.error('[Store] Error loading user:', error);
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ user: null, isOnboarded: false });
    console.log('[Store] User logged out');
  },
}));
