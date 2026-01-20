import {
  Match,
  MatchSlot,
  UserProfile,
  PositionEnum,
  FootEnum,
  FormatEnum,
  MatchTypeEnum,
  SurfaceEnum,
  OnboardingData,
  MatchRequest,
  AgeCategoryEnum,
} from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const AVATARS = [
  require('../assets/images/avatars/sc0.png'),
  require('../assets/images/avatars/sc1.png'),
  require('../assets/images/avatars/sc2.png'),
  require('../assets/images/avatars/sc3.png'),
  require('../assets/images/avatars/sc4.png'),
  require('../assets/images/avatars/sc5.png'),
];

export const MOCK_USERS: UserProfile[] = [
  {
    id: '1',
    nickname: 'ElPibe10',
    avatar_url: AVATARS[0],
    birth_date: new Date('1995-06-24'),
    category: AgeCategoryEnum.MASTER,
    is_versatile: false,
    football_specs: {
      main_position: PositionEnum.MID,
      specific_role: 'Enganche',
      dominant_foot: FootEnum.LEFT,
    },
    stats_radar: { pace: 7, shooting: 8, passing: 9, defense: 4, physical: 5, stamina: 7 },
    media: 7.5,
  },
  {
    id: '2',
    nickname: 'Muralla',
    avatar_url: AVATARS[1],
    birth_date: new Date('1990-03-15'),
    category: AgeCategoryEnum.MASTER,
    is_versatile: false,
    football_specs: {
      main_position: PositionEnum.DEF,
      specific_role: 'Central',
      dominant_foot: FootEnum.RIGHT,
    },
    stats_radar: { pace: 5, shooting: 3, passing: 6, defense: 9, physical: 8, stamina: 7 },
    media: 6.8,
  },
  {
    id: '3',
    nickname: 'ElGato',
    avatar_url: AVATARS[2],
    birth_date: new Date('1998-11-22'),
    category: AgeCategoryEnum.MASTER,
    is_versatile: false,
    football_specs: {
      main_position: PositionEnum.GK,
      specific_role: 'Arquero',
      dominant_foot: FootEnum.RIGHT,
    },
    stats_radar: { pace: 4, shooting: 2, passing: 5, defense: 8, physical: 7, stamina: 6 },
    media: 6.2,
  },
  {
    id: '4',
    nickname: 'Goleador',
    avatar_url: AVATARS[3],
    birth_date: new Date('2000-01-10'),
    category: AgeCategoryEnum.MASTER,
    is_versatile: true,
    football_specs: {
      main_position: PositionEnum.FWD,
      specific_role: 'Killer',
      dominant_foot: FootEnum.RIGHT,
    },
    stats_radar: { pace: 9, shooting: 9, passing: 6, defense: 3, physical: 7, stamina: 8 },
    media: 8.2,
  },
  {
    id: '5',
    nickname: 'Mago',
    avatar_url: AVATARS[4],
    birth_date: new Date('1997-08-05'),
    category: AgeCategoryEnum.MASTER,
    is_versatile: false,
    football_specs: {
      main_position: PositionEnum.MID,
      specific_role: 'Playmaker',
      dominant_foot: FootEnum.BOTH,
    },
    stats_radar: { pace: 7, shooting: 7, passing: 9, defense: 5, physical: 6, stamina: 8 },
    media: 7.8,
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
    surface: SurfaceEnum.SYNTHETIC,
    slots: [
      { id: 's1', role: PositionEnum.GK, quantity_needed: 2, filled_by: ['3'] },
      { id: 's2', role: PositionEnum.ANY, quantity_needed: 8, filled_by: ['1', '2'] },
    ],
    organizer_id: '1',
    price: 5000,
    ageCategory: [AgeCategoryEnum.MASTER],
    requests: [
      {
        user: MOCK_USERS[1],
        requested_at: new Date(),
        status: 'PENDING',
      },
    ],
    waitlist: [],
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
    surface: SurfaceEnum.GRASS,
    slots: [
      { id: 's3', role: PositionEnum.GK, quantity_needed: 2, filled_by: [] },
      { id: 's4', role: PositionEnum.DEF, quantity_needed: 4, filled_by: ['2'] },
      { id: 's5', role: PositionEnum.MID, quantity_needed: 4, filled_by: ['1'] },
      { id: 's6', role: PositionEnum.FWD, quantity_needed: 4, filled_by: [] },
    ],
    organizer_id: '2',
    price: 8000,
    ageCategory: [AgeCategoryEnum.ELITE],
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
    surface: SurfaceEnum.GRASS,
    slots: [
      { id: 's7', role: PositionEnum.GK, quantity_needed: 2, filled_by: ['3'] },
      { id: 's8', role: PositionEnum.DEF, quantity_needed: 8, filled_by: ['2'] },
      { id: 's9', role: PositionEnum.MID, quantity_needed: 6, filled_by: ['1'] },
      { id: 's10', role: PositionEnum.FWD, quantity_needed: 6, filled_by: [] },
    ],
    organizer_id: '1',
    price: 12000,
    ageCategory: [AgeCategoryEnum.MASTER],
    requests: [
      {
        user: MOCK_USERS[3],
        requested_at: new Date(),
        status: 'PENDING',
      },
    ],
    waitlist: [
      {
        user: MOCK_USERS[4],
        requested_at: new Date(),
        status: 'PENDING',
      },
    ],
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
    surface: SurfaceEnum.PARQUET,
    slots: [
      { id: 's11', role: PositionEnum.ANY, quantity_needed: 10, filled_by: ['1', '2', '3'] },
    ],
    organizer_id: '3',
    price: 4500,
    ageCategory: [AgeCategoryEnum.SUB21],
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
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      nickname: data.nickname,
      avatar_url: data.avatar_url,
      birth_date: data.birth_date || new Date(),
      category: calculateAgeCategory(data.birth_date),
      is_versatile: data.is_versatile,
      football_specs: {
        main_position: data.main_position,
        specific_role: data.specific_role,
        dominant_foot: data.dominant_foot,
      },
      stats_radar: data.stats_radar,
      media: Number(
        (Object.values(data.stats_radar).reduce((a, b) => a + b, 0) / 6).toFixed(1)
      ),
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

  updateMatch: async (id: string, data: Partial<Match>): Promise<Match | null> => {
    await delay(500);
    const index = MOCK_MATCHES.findIndex((m) => m.id === id);
    if (index === -1) return null;
    MOCK_MATCHES[index] = { ...MOCK_MATCHES[index], ...data };
    console.log('[MockAPI] updateMatch:', id, MOCK_MATCHES[index]);
    return MOCK_MATCHES[index];
  },

  getMatchesByOrganizer: async (organizerId: string): Promise<Match[]> => {
    await delay(400);
    const matches = MOCK_MATCHES.filter((m) => m.organizer_id === organizerId);
    console.log('[MockAPI] getMatchesByOrganizer:', organizerId, matches.length);
    return matches;
  },

  respondToRequest: async (
    matchId: string,
    userId: string,
    status: 'ACCEPTED' | 'REJECTED'
  ): Promise<boolean> => {
    await delay(500);
    const match = MOCK_MATCHES.find((m) => m.id === matchId);
    if (!match || !match.requests) return false;

    const requestIndex = match.requests.findIndex((r) => r.user.id === userId);
    if (requestIndex === -1) return false;

    if (status === 'ACCEPTED') {
      match.requests[requestIndex].status = 'ACCEPTED';
      // Mover a filled_by en el slot correspondiente (simplificado: ANY slot)
      const slot = match.slots.find(s => s.filled_by.length < s.quantity_needed);
      if (slot) {
        slot.filled_by.push(userId);
      }
    } else {
      match.requests[requestIndex].status = 'REJECTED';
    }

    // Remover de la lista de pendientes (para la UI)
    match.requests = match.requests.filter(r => r.user.id !== userId);

    console.log('[MockAPI] respondToRequest:', matchId, userId, status);
    return true;
  },

  getAvatars: async (): Promise<string[]> => {
    await delay(200);
    return AVATARS;
  },
};

export function calculateCategory(birthDate: Date | null): string {
  if (!birthDate) return 'Master';

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 21) return 'Sub-21';
  if (age <= 30) return 'Elite';
  if (age <= 40) return 'Master';
  if (age <= 50) return 'Senior';
  return 'Leyenda';
}

export function calculateAgeCategory(birthDate: Date | null): AgeCategoryEnum {
  if (!birthDate) return AgeCategoryEnum.MASTER;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 21) return AgeCategoryEnum.SUB21;
  if (age <= 30) return AgeCategoryEnum.ELITE;
  if (age <= 40) return AgeCategoryEnum.MASTER;
  if (age <= 50) return AgeCategoryEnum.SENIOR;
  return AgeCategoryEnum.LEYENDA;
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
