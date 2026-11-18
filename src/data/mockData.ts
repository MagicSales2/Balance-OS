import {
  ActivityEntry,
  Commitment,
  DailyIntention,
  EnergyState,
  EvolutionPoint,
  FinanceCategory,
  FinanceMovement,
  LibraryEntry,
  LifeSpace,
  UserPreferences,
} from '../types/balance';

export const INITIAL_PREFERENCES: UserPreferences = {
  name: '',
  email: 'magiapastelera2@gmail.com',
  city: 'Medellín, Colombia',
  role: 'Diseñador gráfico y publicista · Marketing digital y estrategia de contenidos',
  personalMotto:
    'No se trata de hacer más cosas. Se trata de construir una vida que realmente quieras vivir.',
  currency: 'COP',
  weekStart: 'Lunes',
  morningCheckIn: true,
  weeklyDigest: true,
  gentleReminders: true,
  aiTone: 'Directo y sereno',
};

export const INITIAL_ENERGY: EnergyState = {
  physical: 0,
  mental: 0,
  emotionalLabel: 'Neutral',
  emotionalOptions: [
    'Muy bien',
    'Bien',
    'Neutral',
    'Algo desanimado',
    'Triste',
    'Estresado',
    'Ansioso',
    'Frustrado',
    'Cansado',
    'Otro',
  ],
  customMoodText: '',
};

export const INITIAL_SPACES: LifeSpace[] = [
  {
    id: 'trabajo',
    slug: 'trabajo-y-negocio',
    name: 'Trabajo y negocio',
    intention:
      'Mi actividad comercial actual y las responsabilidades relacionadas con Magia Pastelera.',
    rhythm: 'En foco',
    tone: 'petrol',
    iconName: 'Briefcase',
    objectives: [
      'Reducir progresivamente mi dependencia diaria de Magia Pastelera',
      'Automatizar procesos y atención comercial por WhatsApp',
      'Mejorar la rentabilidad, conversión y campañas en Meta Ads',
    ],
    activeNotes: 2,
    weeklyFocusShare: 0,
    visible: true,
    archived: false,
    sortOrder: 0,
  },
  {
    id: 'proyectos',
    slug: 'proyectos',
    name: 'Proyectos',
    intention:
      'Mis proyectos digitales, experimentos de negocio, automatizaciones y desarrollos con inteligencia artificial.',
    rhythm: 'Activo',
    tone: 'lavender',
    iconName: 'Compass',
    objectives: [
      'Explorar negocios digitales y automatizaciones con inteligencia artificial',
    ],
    activeNotes: 1,
    weeklyFocusShare: 0,
    visible: true,
    archived: false,
    sortOrder: 1,
  },
  {
    id: 'bienestar',
    slug: 'bienestar',
    name: 'Bienestar',
    intention:
      'Mi bienestar físico y emocional, energía, descanso, hábitos y actividades que me hacen sentir bien.',
    rhythm: 'Activo',
    tone: 'sage',
    iconName: 'Heart',
    objectives: [],
    activeNotes: 0,
    weeklyFocusShare: 0,
    visible: true,
    archived: false,
    sortOrder: 2,
  },
  {
    id: 'relaciones',
    slug: 'relaciones-y-conexiones',
    name: 'Relaciones y conexiones',
    intention:
      'Amistades, encuentros, actividades sociales y construcción de relaciones significativas.',
    rhythm: 'En calma',
    tone: 'sand',
    iconName: 'Users',
    objectives: [],
    activeNotes: 0,
    weeklyFocusShare: 0,
    visible: true,
    archived: false,
    sortOrder: 3,
  },
  {
    id: 'finanzas',
    slug: 'finanzas',
    name: 'Finanzas',
    intention:
      'Seguimiento de ingresos, gastos, presupuestos, inversiones en proyectos y decisiones de compra.',
    rhythm: 'En calma',
    tone: 'slate',
    iconName: 'Wallet',
    objectives: [],
    activeNotes: 0,
    weeklyFocusShare: 0,
    visible: true,
    archived: false,
    sortOrder: 4,
  },
  {
    id: 'desarrollo',
    slug: 'desarrollo-personal',
    name: 'Desarrollo personal',
    intention:
      'Aprendizaje, habilidades profesionales, inteligencia artificial, tecnología y crecimiento personal.',
    rhythm: 'Activo',
    tone: 'lavender',
    iconName: 'BookOpen',
    objectives: [],
    activeNotes: 1,
    weeklyFocusShare: 0,
    visible: true,
    archived: false,
    sortOrder: 5,
  },
  {
    id: 'vida-disfrute',
    slug: 'vida-y-disfrute',
    name: 'Vida y disfrute',
    intention:
      'Planes, naturaleza, caminatas, salidas, experiencias, viajes y actividades que quiero disfrutar.',
    rhythm: 'En pausa consciente',
    tone: 'sage',
    iconName: 'Sun',
    objectives: [],
    activeNotes: 0,
    weeklyFocusShare: 0,
    visible: true,
    archived: false,
    sortOrder: 6,
  },
];

export const INITIAL_INTENTIONS: DailyIntention[] = [
  {
    id: 'int-1',
    title: 'Revisar el rendimiento de las campañas publicitarias en Meta Ads',
    spaceId: 'trabajo',
    spaceName: 'Trabajo y negocio',
    timeWindow: 'Flexible',
    completed: false,
    isSuggestedInitial: true,
    cognitiveLoad: 'medio',
    physicalLoad: 'suave',
  },
  {
    id: 'int-2',
    title: 'Mejorar la rentabilidad y conversión de Magia Pastelera',
    spaceId: 'trabajo',
    spaceName: 'Trabajo y negocio',
    timeWindow: 'Flexible',
    completed: false,
    isSuggestedInitial: true,
    cognitiveLoad: 'alto',
    physicalLoad: 'suave',
  },
  {
    id: 'int-3',
    title: 'Detectar tareas diarias de Magia Pastelera que puedan automatizarse',
    spaceId: 'trabajo',
    spaceName: 'Trabajo y negocio',
    timeWindow: 'Flexible',
    completed: false,
    isSuggestedInitial: true,
    cognitiveLoad: 'medio',
    physicalLoad: 'suave',
  },
  {
    id: 'int-4',
    title: 'Definir el siguiente paso en proyectos digitales y automatizaciones con IA',
    spaceId: 'proyectos',
    spaceName: 'Proyectos',
    timeWindow: 'Flexible',
    completed: false,
    isSuggestedInitial: true,
    cognitiveLoad: 'alto',
    physicalLoad: 'suave',
  },
];

// Sin registros históricos inventados: se irá llenando con acciones reales del usuario.
export const INITIAL_ACTIVITY: ActivityEntry[] = [];

export const WEEK_DAYS = [
  { index: 0, short: 'Lun', label: 'Lunes 16' },
  { index: 1, short: 'Mar', label: 'Martes 17' },
  { index: 2, short: 'Mié', label: 'Miércoles 18' },
  { index: 3, short: 'Jue', label: 'Jueves 19' },
  { index: 4, short: 'Vie', label: 'Viernes 20' },
  { index: 5, short: 'Sáb', label: 'Sábado 21' },
  { index: 6, short: 'Dom', label: 'Domingo 22' },
];

// Sin compromisos ni reuniones inventadas.
export const INITIAL_COMMITMENTS: Commitment[] = [];

// Sin histórico emocional ficticio.
export const INITIAL_EVOLUTION: EvolutionPoint[] = [];

export const INITIAL_FINANCE_CATEGORIES: FinanceCategory[] = [
  { id: 'fc-1', name: 'Operación Magia Pastelera', spent: 0, planned: 0, tone: 'petrol' },
  { id: 'fc-2', name: 'Publicidad y Meta Ads', spent: 0, planned: 0, tone: 'slate' },
  { id: 'fc-3', name: 'Proyectos e IA', spent: 0, planned: 0, tone: 'lavender' },
  { id: 'fc-4', name: 'Hogar y bienestar', spent: 0, planned: 0, tone: 'sage' },
  { id: 'fc-5', name: 'Ahorro e inversión', spent: 0, planned: 0, tone: 'sand' },
];

// Sin ingresos ni gastos ficticios precargados.
export const INITIAL_FINANCE_MOVEMENTS: FinanceMovement[] = [];

export const INITIAL_LIBRARY: LibraryEntry[] = [
  {
    id: 'lib-1',
    title: 'Magia Pastelera · Catálogo y operación en Medellín',
    category: 'Nota',
    spaceName: 'Trabajo y negocio',
    updatedAt: 'Configuración inicial',
    content: `Negocio en Medellín (~5 años en el mercado) dedicado a desayunos sorpresa, anchetas y regalos especiales.

Productos actuales (COP):
• Fantasía: $140.000
• Cielo Encantado: $130.000
• Amor Especial: $110.000
• Amor Perfecto: $95.000
• Día Perfecto: $95.000
• Papá Feliz: $90.000
• Feliz Día: $82.000
• Desayuno Clásico: $70.000
• Magia Rosa: $65.000
• Corazón Encantado: $65.000
• Bolso Mágico: $50.000

Cobertura: Medellín, Sabaneta, Itagüí, Envigado, Bello, Niquía y San Antonio de Prado.

Operación: venta digital, campañas en Meta Ads, atención por WhatsApp con automatizaciones, entregas a domicilio y pago contraentrega.`,
  },
  {
    id: 'lib-2',
    title: 'Transición de Magia Pastelera hacia mayor autonomía',
    category: 'Reflexión',
    spaceName: 'Trabajo y negocio',
    updatedAt: 'Configuración inicial',
    content:
      'Magia Pastelera ha sido la actividad comercial principal, pero la prioridad ahora es mejorar su rentabilidad y conversión, automatizar procesos y reducir progresivamente su dependencia diaria para no agotar tiempo ni energía.',
  },
  {
    id: 'lib-3',
    title: 'Perfil profesional y experiencia en marketing',
    category: 'Recurso',
    spaceName: 'Desarrollo personal',
    updatedAt: 'Configuración inicial',
    content:
      'Diseñador gráfico y publicista en Medellín, Colombia. Aproximadamente 7 años de experiencia en marketing digital, redes sociales, publicidad y estrategia de contenidos, trabajando con marcas como Mazda, Peugeot, DFSK, BAIC, Constructora NIO e iShop.',
  },
  {
    id: 'lib-4',
    title: 'Enfoque para proyectos digitales e inteligencia artificial',
    category: 'Idea',
    spaceName: 'Proyectos',
    updatedAt: 'Configuración inicial',
    content:
      'Construir experimentos de negocio, automatizaciones y desarrollos con IA apoyados en herramientas intuitivas, visuales, económicas y fáciles de administrar.',
  },
];
