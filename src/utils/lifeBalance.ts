import {
  Commitment,
  DailyIntention,
  EnergyState,
  EvolutionPoint,
  FinanceMovement,
  LibraryEntry,
  LifeBalanceDimension,
  LifeBalancePeriod,
  LifeBalanceSnapshot,
  LifeBalanceSourceSignal,
  LifeSpace,
} from '../types/balance';

export const SIGNAL_LABELS: Record<LifeBalanceSourceSignal, string> = {
  energia: 'Energía física y mental',
  estado_emocional: 'Estado emocional',
  actividades: 'Pendientes y actividades',
  tiempo_dedicado: 'Agenda y espacios',
  reflexiones: 'Notas en biblioteca',
  finanzas: 'Movimientos financieros',
};

export interface LiveBalanceInput {
  energy: EnergyState;
  hasWellbeingCheckIn: boolean;
  spaces: LifeSpace[];
  intentions: DailyIntention[];
  commitments: Commitment[];
  evolution: EvolutionPoint[];
  movements: FinanceMovement[];
  library: LibraryEntry[];
}

const PERIOD_LABELS: Record<LifeBalancePeriod, string> = {
  semana: 'Esta semana',
  mes: 'Este mes',
  trimestre: 'Últimos 3 meses',
};

function clamp(n: number, min = 15, max = 95): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Calcula las 7 dimensiones directamente desde el estado real en sesión.
 * No inventa registros históricos cuando aún no existen datos cargados.
 */
export function buildLifeBalanceSnapshot(
  period: LifeBalancePeriod,
  input?: LiveBalanceInput
): LifeBalanceSnapshot {
  const hasHistory = Boolean(
    input &&
      (input.evolution.length > 0 ||
        input.commitments.length > 0 ||
        input.movements.length > 0 ||
        input.hasWellbeingCheckIn)
  );

  if (!input) {
    const emptyDimensions: LifeBalanceDimension[] = [
      {
        id: 'bienestar-fisico',
        label: 'Bienestar físico',
        shortLabel: 'Bienestar físico',
        presence: 30,
        color: '#5E8371',
        softBg: '#EEF4F0',
        sourceSignals: ['energia'],
        exampleContext: 'Sin registro físico hoy.',
      },
      {
        id: 'bienestar-emocional',
        label: 'Bienestar emocional',
        shortLabel: 'Bienestar emocional',
        presence: 30,
        color: '#7D71A8',
        softBg: '#F3F1F8',
        sourceSignals: ['estado_emocional'],
        exampleContext: 'Sin registro emocional hoy.',
      },
      {
        id: 'trabajo-proyectos',
        label: 'Trabajo y proyectos',
        shortLabel: 'Trabajo y proyectos',
        presence: 65,
        color: '#135D66',
        softBg: '#ECF4F5',
        sourceSignals: ['actividades', 'reflexiones'],
        exampleContext: 'Espacios principales activos con pendientes iniciales.',
      },
      {
        id: 'relaciones',
        label: 'Relaciones',
        shortLabel: 'Relaciones',
        presence: 25,
        color: '#6A7B8E',
        softBg: '#F0F3F6',
        sourceSignals: ['tiempo_dedicado'],
        exampleContext: 'Sin actividades registradas aún.',
      },
      {
        id: 'finanzas',
        label: 'Finanzas',
        shortLabel: 'Finanzas',
        presence: 25,
        color: '#2B6E68',
        softBg: '#ECF4F2',
        sourceSignals: ['finanzas'],
        exampleContext: 'Sin movimientos registrados aún.',
      },
      {
        id: 'desarrollo-personal',
        label: 'Desarrollo personal',
        shortLabel: 'Desarrollo personal',
        presence: 40,
        color: '#8D7BB3',
        softBg: '#F4F1F9',
        sourceSignals: ['reflexiones'],
        exampleContext: 'Perfil profesional cargado en biblioteca.',
      },
      {
        id: 'ocio',
        label: 'Vida y disfrute',
        shortLabel: 'Vida y disfrute',
        presence: 20,
        color: '#7B947E',
        softBg: '#F1F5F2',
        sourceSignals: ['tiempo_dedicado'],
        exampleContext: 'Sin planes registrados aún.',
      },
    ];

    return {
      period,
      periodLabel: PERIOD_LABELS[period],
      isDemoData: false,
      hasHistoricalData: false,
      dimensions: emptyDimensions,
      summaryNote: 'Vista inicial sin histórico previo. Se actualizará con tus registros reales.',
    };
  }

  const { energy, hasWellbeingCheckIn, spaces, intentions, commitments, evolution, movements, library } =
    input;

  const countFor = (spaceIds: string[], spaceNames: string[]) => {
    const intCount = intentions.filter((i) => spaceIds.includes(i.spaceId)).length;
    const comCount = commitments.filter((c) => spaceIds.includes(c.spaceId)).length;
    const libCount = library.filter((l) => spaceNames.includes(l.spaceName)).length;
    const objCount = spaces
      .filter((s) => spaceIds.includes(s.id))
      .reduce((acc, s) => acc + s.objectives.length, 0);
    return { intCount, comCount, libCount, objCount };
  };

  const workStats = countFor(['trabajo', 'proyectos'], ['Trabajo y negocio', 'Proyectos']);
  const relStats = countFor(['relaciones'], ['Relaciones y conexiones']);
  const devStats = countFor(['desarrollo'], ['Desarrollo personal']);
  const joyStats = countFor(['vida-disfrute'], ['Vida y disfrute']);
  const wellStats = countFor(['bienestar'], ['Bienestar']);

  const physicalBase =
    energy.physical > 0
      ? energy.physical * 17
      : evolution.length > 0
        ? evolution[evolution.length - 1].physical * 8.5
        : 28;

  const mentalOrMoodBase =
    hasWellbeingCheckIn && energy.mental > 0
      ? energy.mental * 16 + (['Muy bien', 'Bien'].includes(energy.emotionalLabel) ? 10 : 0)
      : evolution.length > 0
        ? evolution[evolution.length - 1].calm * 8.5
        : 28;

  const workPresence = clamp(
    28 + workStats.intCount * 10 + workStats.comCount * 10 + workStats.objCount * 5 + workStats.libCount * 4
  );

  const relationsPresence =
    relStats.intCount + relStats.comCount + relStats.libCount + relStats.objCount === 0
      ? 22
      : clamp(24 + relStats.intCount * 14 + relStats.comCount * 14 + relStats.libCount * 8);

  const financePresence =
    movements.length === 0 ? 22 : clamp(30 + movements.length * 12);

  const devPresence = clamp(22 + devStats.intCount * 14 + devStats.comCount * 12 + devStats.libCount * 12);

  const joyPresence =
    joyStats.intCount + joyStats.comCount + joyStats.libCount + joyStats.objCount === 0
      ? 20
      : clamp(24 + joyStats.intCount * 14 + joyStats.comCount * 14 + joyStats.libCount * 8);

  const dimensions: LifeBalanceDimension[] = [
    {
      id: 'bienestar-fisico',
      label: 'Bienestar físico',
      shortLabel: 'Bienestar físico',
      presence: clamp(physicalBase + wellStats.intCount * 6),
      color: '#5E8371',
      softBg: '#EEF4F0',
      sourceSignals: ['energia', 'actividades'],
      exampleContext:
        energy.physical > 0
          ? `Energía física registrada hoy: ${energy.physical}/5.`
          : 'Aún no registras tu energía física de hoy.',
    },
    {
      id: 'bienestar-emocional',
      label: 'Bienestar emocional',
      shortLabel: 'Bienestar emocional',
      presence: clamp(mentalOrMoodBase),
      color: '#7D71A8',
      softBg: '#F3F1F8',
      sourceSignals: ['estado_emocional', 'energia'],
      exampleContext: hasWellbeingCheckIn
        ? `Estado de ánimo actual: ${energy.emotionalLabel}${energy.customMoodText ? ` (${energy.customMoodText})` : ''}.`
        : 'Aún no registras tu estado emocional de hoy.',
    },
    {
      id: 'trabajo-proyectos',
      label: 'Trabajo y proyectos',
      shortLabel: 'Trabajo y proyectos',
      presence: workPresence,
      color: '#135D66',
      softBg: '#ECF4F5',
      sourceSignals: ['actividades', 'reflexiones'],
      exampleContext: `${workStats.intCount} pendientes iniciales y ${workStats.objCount} objetivos en Magia Pastelera y Proyectos.`,
    },
    {
      id: 'relaciones',
      label: 'Relaciones',
      shortLabel: 'Relaciones',
      presence: relationsPresence,
      color: '#6A7B8E',
      softBg: '#F0F3F6',
      sourceSignals: ['tiempo_dedicado', 'actividades'],
      exampleContext:
        relStats.intCount + relStats.comCount > 0
          ? `${relStats.intCount + relStats.comCount} actividades registradas en este espacio.`
          : 'Sin actividades registradas aún en Relaciones y conexiones.',
    },
    {
      id: 'finanzas',
      label: 'Finanzas',
      shortLabel: 'Finanzas',
      presence: financePresence,
      color: '#2B6E68',
      softBg: '#ECF4F2',
      sourceSignals: ['finanzas'],
      exampleContext:
        movements.length > 0
          ? `${movements.length} movimiento(s) registrado(s) en Finanzas.`
          : 'Sin movimientos financieros registrados aún.',
    },
    {
      id: 'desarrollo-personal',
      label: 'Desarrollo personal',
      shortLabel: 'Desarrollo personal',
      presence: devPresence,
      color: '#8D7BB3',
      softBg: '#F4F1F9',
      sourceSignals: ['reflexiones', 'actividades'],
      exampleContext: `${devStats.libCount} nota(s) de perfil y aprendizaje en Mi biblioteca.`,
    },
    {
      id: 'ocio',
      label: 'Vida y disfrute',
      shortLabel: 'Vida y disfrute',
      presence: joyPresence,
      color: '#7B947E',
      softBg: '#F1F5F2',
      sourceSignals: ['tiempo_dedicado', 'actividades'],
      exampleContext:
        joyStats.intCount + joyStats.comCount > 0
          ? `${joyStats.intCount + joyStats.comCount} planes registrados para disfrutar.`
          : 'Sin planes ni salidas registradas aún en Vida y disfrute.',
    },
  ];

  const summaryNote = hasHistory
    ? 'Reflejo actual calculado con tus registros de bienestar, pendientes, agenda y movimientos.'
    : 'Vista inicial basada en tu perfil, Magia Pastelera y tus 7 espacios. Aún no hay histórico previo.';

  return {
    period,
    periodLabel: PERIOD_LABELS[period],
    isDemoData: false,
    hasHistoricalData: hasHistory,
    dimensions,
    summaryNote,
  };
}

export function extractBalanceHighlights(dimensions: LifeBalanceDimension[]) {
  const sorted = [...dimensions].sort((a, b) => b.presence - a.presence);
  const higherAttention = sorted.slice(0, 2);
  const needsMoreSpace = [...sorted].reverse().slice(0, 2);
  return { higherAttention, needsMoreSpace };
}
