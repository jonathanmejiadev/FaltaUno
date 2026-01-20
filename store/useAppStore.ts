import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, OnboardingData, FormatEnum, Match } from '@/types';
import { mockApi } from '@/services/mockApi';

interface AppState {
  user: UserProfile | null;
  isOnboarded: boolean;
  isLoading: boolean;
  selectedFormat: FormatEnum | null;
  matches: Match[];

  setUser: (user: UserProfile | null) => void;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  setSelectedFormat: (format: FormatEnum | null) => void;
  loadStoredUser: () => Promise<void>;
  createMatch: (match: Match) => Promise<void>;
  updateMatch: (match: Match) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  respondToRequest: (matchId: string, userId: string, status: 'ACCEPTED' | 'REJECTED') => Promise<void>;
  logout: () => Promise<void>;
}

const STORAGE_KEY = '@futmatch_user';
const MATCHES_KEY = '@futmatch_matches';

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isOnboarded: false,
  isLoading: true,
  selectedFormat: null,
  matches: [],

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
    console.log('[Store] Loading stored data...');
    set({ isLoading: true });

    // 1. Load User
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const user = JSON.parse(stored) as UserProfile;
        user.birth_date = new Date(user.birth_date);
        set({ user, isOnboarded: true });
        console.log('[Store] Loaded user:', user.nickname);
      }
    } catch (error) {
      console.error('[Store] Error loading user:', error);
    }

    // 2. Load Matches
    try {
      const storedMatches = await AsyncStorage.getItem(MATCHES_KEY);
      if (storedMatches) {
        const matches = JSON.parse(storedMatches);
        // Fix dates
        matches.forEach((m: any) => m.date = new Date(m.date));
        set({ matches });
        console.log('[Store] Loaded matches:', matches.length);
      } else {
        // Initial setup with mock matches
        const initial = await mockApi.getMatches();
        set({ matches: initial });
        await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(initial));
        console.log('[Store] Initialized with mock matches');
      }
    } catch (error) {
      console.error('[Store] Error loading matches:', error);
    }

    set({ isLoading: false });
  },

  createMatch: async (match: Match) => {
    const { matches } = useAppStore.getState();
    const newMatches = [...matches, match];
    set({ matches: newMatches });
    await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(newMatches));
    console.log('[Store] Match created and persisted');
  },

  updateMatch: async (updatedMatch: Match) => {
    const { matches } = useAppStore.getState();
    const newMatches = matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
    set({ matches: newMatches });
    await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(newMatches));
    console.log('[Store] Match updated and persisted');
  },

  deleteMatch: async (matchId: string) => {
    const { matches } = useAppStore.getState();
    const newMatches = matches.filter(m => m.id !== matchId);
    set({ matches: newMatches });
    await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(newMatches));
    console.log('[Store] Match deleted and persisted');
  },

  respondToRequest: async (matchId: string, userId: string, status: 'ACCEPTED' | 'REJECTED') => {
    const { matches } = useAppStore.getState();
    const match = matches.find(m => m.id === matchId);
    if (!match || !match.requests) return;

    const requestIndex = match.requests.findIndex(r => r.user.id === userId);
    if (requestIndex === -1) return;

    const updatedMatch = { ...match };
    if (status === 'ACCEPTED') {
      const slot = updatedMatch.slots.find(s => s.filled_by.length < s.quantity_needed);
      if (slot) {
        slot.filled_by = [...slot.filled_by, userId];
      }
    }

    updatedMatch.requests = updatedMatch.requests!.filter(r => r.user.id !== userId);

    const newMatches = matches.map(m => m.id === matchId ? updatedMatch : m);
    set({ matches: newMatches });
    await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(newMatches));
    console.log('[Store] Request responded and persisted');
  },

  logout: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(MATCHES_KEY); // Opcional, dependiendo si queremos borrar partidos al salir
    set({ user: null, isOnboarded: false, matches: [] });
    console.log('[Store] User logged out');
  },
}));
