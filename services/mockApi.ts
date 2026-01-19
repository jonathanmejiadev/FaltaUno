import {
  Match,
  MatchSlot,
  UserProfile,
  PositionEnum,
  FootEnum,
  FormatEnum,
  MatchTypeEnum,
  OnboardingData,
} from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop&crop=face',
];

const MOCK_USERS: UserProfile[] = [
  {
    id: '1',
    nickname: 'ElPibe10',
    avatar_url: AVATARS[0],
    birth_date: new Date('1995-06-24'),
    category: 'Senior',
    is_versatile: false,
    football_specs: {
      main_position: PositionEnum.MID,
      specific_role: 'Enganche',
      dominant_foot: FootEnum.LEFT,
    },
    stats_radar: { pace: 7, shooting: 8, passing: 9, defense: 4, physical: 5, stamina: 7 },
  },
  {
    id: '2',
    nickname: 'Muralla',
    avatar_url: AVATARS[1],
    birth_date: new Date('1990-03-15'),
    category: 'Senior +30',
    is_versatile: false,
    football_specs: {
      main_position: PositionEnum.DEF,
      specific_role: 'Central',
      dominant_foot: FootEnum.RIGHT,
    },
    stats_radar: { pace: 5, shooting: 3, passing: 6, defense: 9, physical: 8, stamina: 7 },
  },
  {
    id: '3',
    nickname: 'ElGato',
    avatar_url: AVATARS[2],
    birth_date: new Date('1998-11-22'),
    category: 'Sub-30',
    is_versatile: false,
    football_specs: {
      main_position: PositionEnum.GK,
      specific_role: 'Arquero',
      dominant_foot: FootEnum.RIGHT,
    },
    stats_radar: { pace: 4, shooting: 2, passing: 5, defense: 8, physical: 7, stamina: 6 },
  },
];

const MOCK_MATCHES: Match[] = [
  {
    id: 'm1',
    title: 'Picadito del Viernes',
    format: FormatEnum.F5,
    location: {
      latitude: -34.6037,
      longitude: -58.3816,
      address: 'Cancha Los Amigos, Palermo',
    },
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    type: MatchTypeEnum.CHILL,
    slots: [
      { id: 's1', role: PositionEnum.GK, quantity_needed: 2, filled_by: ['3'] },
      { id: 's2', role: PositionEnum.ANY, quantity_needed: 8, filled_by: ['1', '2'] },
    ],
    organizer_id: '1',
    price: 5000,
  },
  {
    id: 'm2',
    title: 'Liga Barrial - Fecha 3',
    format: FormatEnum.F7,
    location: {
      latitude: -34.6157,
      longitude: -58.4033,
      address: 'Complejo El Crack, Caballito',
    },
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    type: MatchTypeEnum.COMPETITIVE,
    slots: [
      { id: 's3', role: PositionEnum.GK, quantity_needed: 2, filled_by: [] },
      { id: 's4', role: PositionEnum.DEF, quantity_needed: 4, filled_by: ['2'] },
      { id: 's5', role: PositionEnum.MID, quantity_needed: 4, filled_by: ['1'] },
      { id: 's6', role: PositionEnum.FWD, quantity_needed: 4, filled_by: [] },
    ],
    organizer_id: '2',
    price: 8000,
  },
  {
    id: 'm3',
    title: 'Torneo Relámpago',
    format: FormatEnum.F11,
    location: {
      latitude: -34.5897,
      longitude: -58.4103,
      address: 'Club Atlético Barrio Norte',
    },
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    type: MatchTypeEnum.COMPETITIVE,
    slots: [
      { id: 's7', role: PositionEnum.GK, quantity_needed: 2, filled_by: ['3'] },
      { id: 's8', role: PositionEnum.DEF, quantity_needed: 8, filled_by: ['2'] },
      { id: 's9', role: PositionEnum.MID, quantity_needed: 6, filled_by: ['1'] },
      { id: 's10', role: PositionEnum.FWD, quantity_needed: 6, filled_by: [] },
    ],
    organizer_id: '1',
    price: 12000,
  },
  {
    id: 'm4',
    title: 'Fulbito Express',
    format: FormatEnum.F5,
    location: {
      latitude: -34.6237,
      longitude: -58.3716,
      address: 'Canchas San Telmo',
    },
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    type: MatchTypeEnum.CHILL,
    slots: [
      { id: 's11', role: PositionEnum.ANY, quantity_needed: 10, filled_by: ['1', '2', '3'] },
    ],
    organizer_id: '3',
    price: 4500,
  },
];

export const mockApi = {
  getMatches: async (filters?: { format?: FormatEnum }): Promise<Match[]> => {
    await delay(500);
    let matches = [...MOCK_MATCHES];
    if (filters?.format) {
      matches = matches.filter((m) => m.format === filters.format);
    }
    console.log('[MockAPI] getMatches:', matches.length);
    return matches;
  },

  getMatchById: async (id: string): Promise<Match | null> => {
    await delay(300);
    const match = MOCK_MATCHES.find((m) => m.id === id) || null;
    console.log('[MockAPI] getMatchById:', id, match);
    return match;
  },

  getUserById: async (id: string): Promise<UserProfile | null> => {
    await delay(300);
    const user = MOCK_USERS.find((u) => u.id === id) || null;
    console.log('[MockAPI] getUserById:', id, user);
    return user;
  },

  getUsersByIds: async (ids: string[]): Promise<UserProfile[]> => {
    await delay(400);
    const users = MOCK_USERS.filter((u) => ids.includes(u.id));
    console.log('[MockAPI] getUsersByIds:', ids, users.length);
    return users;
  },

  createUser: async (data: OnboardingData): Promise<UserProfile> => {
    await delay(600);
    const category = calculateCategory(data.birth_date);
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      nickname: data.nickname,
      avatar_url: data.avatar_url,
      birth_date: data.birth_date || new Date(),
      category,
      is_versatile: data.is_versatile,
      football_specs: {
        main_position: data.main_position,
        specific_role: data.specific_role,
        dominant_foot: data.dominant_foot,
      },
      stats_radar: data.stats_radar,
    };
    console.log('[MockAPI] createUser:', newUser);
    return newUser;
  },

  createMatch: async (match: Omit<Match, 'id'>): Promise<Match> => {
    await delay(500);
    const newMatch: Match = {
      ...match,
      id: `match_${Date.now()}`,
    };
    MOCK_MATCHES.push(newMatch);
    console.log('[MockAPI] createMatch:', newMatch);
    return newMatch;
  },

  joinMatch: async (matchId: string, slotId: string, userId: string): Promise<boolean> => {
    await delay(400);
    const match = MOCK_MATCHES.find((m) => m.id === matchId);
    if (!match) return false;
    
    const slot = match.slots.find((s) => s.id === slotId);
    if (!slot) return false;
    
    if (slot.filled_by.length >= slot.quantity_needed) return false;
    if (slot.filled_by.includes(userId)) return false;
    
    slot.filled_by.push(userId);
    console.log('[MockAPI] joinMatch:', matchId, slotId, userId);
    return true;
  },

  getAvatars: async (): Promise<string[]> => {
    await delay(200);
    return AVATARS;
  },
};

export function calculateCategory(birthDate: Date | null): string {
  if (!birthDate) return 'Libre';
  
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  if (age < 18) return 'Juvenil';
  if (age < 21) return 'Sub-21';
  if (age < 25) return 'Sub-25';
  if (age < 30) return 'Sub-30';
  if (age < 35) return 'Senior';
  if (age < 40) return 'Senior +35';
  return 'Veterano +40';
}

export function getTotalSlots(match: Match): { filled: number; total: number } {
  const total = match.slots.reduce((acc, slot) => acc + slot.quantity_needed, 0);
  const filled = match.slots.reduce((acc, slot) => acc + slot.filled_by.length, 0);
  return { filled, total };
}

export function getAvailableSlotForPosition(
  match: Match,
  position: PositionEnum
): MatchSlot | null {
  for (const slot of match.slots) {
    if (slot.filled_by.length < slot.quantity_needed) {
      if (slot.role === PositionEnum.ANY || slot.role === position) {
        return slot;
      }
    }
  }
  return null;
}
