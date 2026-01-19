export enum PositionEnum {
  GK = 'GK',
  DEF = 'DEF',
  MID = 'MID',
  FWD = 'FWD',
  ANY = 'ANY',
}

export enum FootEnum {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  BOTH = 'BOTH',
}

export enum FormatEnum {
  F5 = 'F5',
  F7 = 'F7',
  F11 = 'F11',
}

export enum MatchTypeEnum {
  CHILL = 'CHILL',
  COMPETITIVE = 'COMPETITIVE',
}

export interface StatsRadar {
  pace: number;
  shooting: number;
  passing: number;
  defense: number;
  physical: number;
  stamina: number;
}

export interface FootballSpecs {
  main_position: PositionEnum;
  specific_role: string;
  dominant_foot: FootEnum;
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar_url: string;
  birth_date: Date;
  category: string;
  is_versatile: boolean;
  football_specs: FootballSpecs;
  stats_radar: StatsRadar;
}

export interface MatchSlot {
  id: string;
  role: PositionEnum;
  quantity_needed: number;
  filled_by: string[];
}

export interface MatchLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Match {
  id: string;
  title: string;
  format: FormatEnum;
  location: MatchLocation;
  date: Date;
  type: MatchTypeEnum;
  slots: MatchSlot[];
  organizer_id: string;
  price: number;
}

export interface OnboardingData {
  nickname: string;
  avatar_url: string;
  birth_date: Date | null;
  main_position: PositionEnum;
  specific_role: string;
  is_versatile: boolean;
  dominant_foot: FootEnum;
  stats_radar: StatsRadar;
}

export const POSITION_LABELS: Record<PositionEnum, string> = {
  [PositionEnum.GK]: 'Arquero',
  [PositionEnum.DEF]: 'Defensa',
  [PositionEnum.MID]: 'Mediocampista',
  [PositionEnum.FWD]: 'Delantero',
  [PositionEnum.ANY]: 'Cualquiera',
};

export const FOOT_LABELS: Record<FootEnum, string> = {
  [FootEnum.LEFT]: 'Zurdo',
  [FootEnum.RIGHT]: 'Diestro',
  [FootEnum.BOTH]: 'Ambidiestro',
};

export const FORMAT_LABELS: Record<FormatEnum, string> = {
  [FormatEnum.F5]: 'Fútbol 5',
  [FormatEnum.F7]: 'Fútbol 7',
  [FormatEnum.F11]: 'Fútbol 11',
};

export const FORMAT_PLAYERS: Record<FormatEnum, number> = {
  [FormatEnum.F5]: 10,
  [FormatEnum.F7]: 14,
  [FormatEnum.F11]: 22,
};

export const MATCH_TYPE_LABELS: Record<MatchTypeEnum, string> = {
  [MatchTypeEnum.CHILL]: 'Amistoso',
  [MatchTypeEnum.COMPETITIVE]: 'Competitivo',
};
