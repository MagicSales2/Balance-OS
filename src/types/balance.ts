export type NavSection =
  | 'inicio'
  | 'espacios'
  | 'planificacion'
  | 'evolucion'
  | 'finanzas'
  | 'biblioteca'
  | 'configuracion';

export type AccentTone = 'petrol' | 'sage' | 'lavender' | 'slate' | 'sand';

export type SpaceRhythm = 'En foco' | 'En calma' | 'Activo' | 'En pausa consciente';

export type SpaceIconName =
  | 'Briefcase'
  | 'Compass'
  | 'Heart'
  | 'Users'
  | 'Wallet'
  | 'BookOpen'
  | 'Sun'
  | 'Home'
  | 'Plane'
  | 'Sprout'
  | 'Music'
  | 'Coffee';

export interface LifeSpace {
  id: string;
  slug?: string;
  userId?: string;
  name: string;
  intention: string;
  rhythm: SpaceRhythm;
  tone: AccentTone;
  iconName: SpaceIconName;
  objectives: string[];
  activeNotes: number;
  weeklyFocusShare: number;
  visible: boolean;
  archived: boolean;
  sortOrder: number;
}

export type MoodOption =
  | 'Muy bien'
  | 'Bien'
  | 'Neutral'
  | 'Algo desanimado'
  | 'Triste'
  | 'Estresado'
  | 'Ansioso'
  | 'Frustrado'
  | 'Cansado'
  | 'Otro';

export interface EnergyState {
  physical: number; // 1 to 5
  mental: number; // 1 to 5
  emotionalLabel: MoodOption;
  emotionalOptions: MoodOption[];
  customMoodText: string;
}

export interface DailyIntention {
  id: string;
  title: string;
  spaceId: string;
  spaceName: string;
  timeWindow: string;
  completed: boolean;
  isSuggestedInitial?: boolean;
  cognitiveLoad?: 'suave' | 'medio' | 'alto';
  physicalLoad?: 'suave' | 'medio' | 'alto';
  steps?: string[];
  isRest?: boolean;
  postponedTo?: string;
}

export interface ActivityEntry {
  id: string;
  description: string;
  spaceName: string;
  timeLabel: string;
}

export interface Commitment {
  id: string;
  title: string;
  spaceId: string;
  spaceName: string;
  dayIndex: number; // 0 (Lun) to 6 (Dom)
  dateLabel: string;
  startTime: string;
  duration: string;
  kind: 'Enfoque' | 'Encuentro' | 'Bienestar' | 'Gestión';
  completed: boolean;
}

export interface EvolutionPoint {
  id: string;
  dateLabel: string;
  fullDate: string;
  physical: number; // 1-10
  mental: number; // 1-10
  calm: number; // 1-10
  reflection: string;
}

export interface FinanceCategory {
  id: string;
  name: string;
  spent: number;
  planned: number;
  tone: AccentTone;
}

export interface FinanceMovement {
  id: string;
  concept: string;
  category: string;
  date: string;
  amount: number;
  type: 'ingreso' | 'gasto';
  spaceName: string;
}

export type LibraryCategory = 'Idea' | 'Nota' | 'Reflexión' | 'Recurso';

export interface LibraryEntry {
  id: string;
  title: string;
  category: LibraryCategory;
  spaceName: string;
  updatedAt: string;
  content: string;
}

export interface UserPreferences {
  name: string;
  email: string;
  city?: string;
  role?: string;
  personalMotto: string;
  currency: 'USD' | 'EUR' | 'COP';
  weekStart: 'Lunes' | 'Domingo';
  morningCheckIn: boolean;
  weeklyDigest: boolean;
  gentleReminders: boolean;
  aiTone: 'Cercano y reflexivo' | 'Directo y sereno' | 'Estructurado y breve';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export type LifeBalancePeriod = 'semana' | 'mes' | 'trimestre';

export type LifeBalanceSourceSignal =
  | 'energia'
  | 'estado_emocional'
  | 'actividades'
  | 'tiempo_dedicado'
  | 'reflexiones'
  | 'finanzas';

export interface LifeBalanceDimension {
  id: string;
  label: string;
  shortLabel: string;
  /** Escala de presencia/atención relativa (0 a 100), no es una calificación moral. */
  presence: number;
  color: string;
  softBg: string;
  sourceSignals: LifeBalanceSourceSignal[];
  exampleContext: string;
}

export interface LifeBalanceSnapshot {
  period: LifeBalancePeriod;
  periodLabel: string;
  isDemoData: boolean;
  hasHistoricalData: boolean;
  dimensions: LifeBalanceDimension[];
  summaryNote: string;
}

