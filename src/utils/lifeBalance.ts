import {
  LifeBalanceDimension,
  LifeBalancePeriod,
  LifeBalanceSnapshot,
  LifeBalanceSourceSignal,
} from '../types/balance';

export const SIGNAL_LABELS: Record<LifeBalanceSourceSignal, string> = {
  energia: 'Energía física y mental',
  estado_emocional: 'Estado emocional',
  actividades: 'Actividades realizadas',
  tiempo_dedicado: 'Tiempo dedicado',
  reflexiones: 'Reflexiones en biblioteca',
  finanzas: 'Registros financieros',
};

/**
 * Datos demostrativos claramente identificados como ejemplos.
 * Esta estructura está diseñada para ser reemplazada progresivamente por un cálculo real
 * derivado de los registros de energía, actividades en Planificación, tiempo por espacio,
 * finanzas y reflexiones personales del usuario.
 */
const DEMO_DIMENSIONS_BY_PERIOD: Record<LifeBalancePeriod, LifeBalanceDimension[]> = {
  semana: [
    {
      id: 'bienestar-fisico',
      label: 'Bienestar físico',
      shortLabel: 'Bienestar físico',
      presence: 74,
      color: '#5E8371',
      softBg: '#EEF4F0',
      sourceSignals: ['energia', 'actividades', 'tiempo_dedicado'],
      exampleContext:
        'Ejemplo: caminatas cortas y energía física estable durante los últimos días.',
    },
    {
      id: 'bienestar-emocional',
      label: 'Bienestar emocional',
      shortLabel: 'Bienestar emocional',
      presence: 68,
      color: '#7D71A8',
      softBg: '#F3F1F8',
      sourceSignals: ['estado_emocional', 'reflexiones'],
      exampleContext:
        'Ejemplo: registros recientes con sensación serena y pausas conscientes.',
    },
    {
      id: 'trabajo-proyectos',
      label: 'Trabajo y proyectos',
      shortLabel: 'Trabajo y proyectos',
      presence: 86,
      color: '#135D66',
      softBg: '#ECF4F5',
      sourceSignals: ['tiempo_dedicado', 'actividades'],
      exampleContext:
        'Ejemplo: concentración alta en entregas y avances del proyecto editorial.',
    },
    {
      id: 'relaciones',
      label: 'Relaciones',
      shortLabel: 'Relaciones',
      presence: 56,
      color: '#6A7B8E',
      softBg: '#F0F3F6',
      sourceSignals: ['actividades', 'tiempo_dedicado'],
      exampleContext:
        'Ejemplo: encuentros puntuales entre semana y espacio abierto para el sábado.',
    },
    {
      id: 'finanzas',
      label: 'Finanzas',
      shortLabel: 'Finanzas',
      presence: 72,
      color: '#2B6E68',
      softBg: '#ECF4F2',
      sourceSignals: ['finanzas', 'reflexiones'],
      exampleContext:
        'Ejemplo: revisión mensual al día y presupuesto claro sin tensiones.',
    },
    {
      id: 'desarrollo-personal',
      label: 'Desarrollo personal',
      shortLabel: 'Desarrollo personal',
      presence: 52,
      color: '#8D7BB3',
      softBg: '#F4F1F9',
      sourceSignals: ['reflexiones', 'actividades'],
      exampleContext:
        'Ejemplo: lectura nocturna breve con margen para explorar nuevos temas.',
    },
    {
      id: 'ocio',
      label: 'Ocio',
      shortLabel: 'Ocio',
      presence: 38,
      color: '#7B947E',
      softBg: '#F1F5F2',
      sourceSignals: ['tiempo_dedicado', 'actividades'],
      exampleContext:
        'Ejemplo: dimensión con menor presencia esta semana laboral; buen momento para reservar aire libre.',
    },
  ],
  mes: [
    {
      id: 'bienestar-fisico',
      label: 'Bienestar físico',
      shortLabel: 'Bienestar físico',
      presence: 70,
      color: '#5E8371',
      softBg: '#EEF4F0',
      sourceSignals: ['energia', 'actividades', 'tiempo_dedicado'],
      exampleContext:
        'Ejemplo mensual: ritmo constante de descanso y movimiento suave.',
    },
    {
      id: 'bienestar-emocional',
      label: 'Bienestar emocional',
      shortLabel: 'Bienestar emocional',
      presence: 72,
      color: '#7D71A8',
      softBg: '#F3F1F8',
      sourceSignals: ['estado_emocional', 'reflexiones'],
      exampleContext:
        'Ejemplo mensual: mayor calma en fines de semana y cierre consciente de jornadas.',
    },
    {
      id: 'trabajo-proyectos',
      label: 'Trabajo y proyectos',
      shortLabel: 'Trabajo y proyectos',
      presence: 82,
      color: '#135D66',
      softBg: '#ECF4F5',
      sourceSignals: ['tiempo_dedicado', 'actividades'],
      exampleContext:
        'Ejemplo mensual: foco sostenido en consultoría y cuaderno creativo.',
    },
    {
      id: 'relaciones',
      label: 'Relaciones',
      shortLabel: 'Relaciones',
      presence: 64,
      color: '#6A7B8E',
      softBg: '#F0F3F6',
      sourceSignals: ['actividades', 'tiempo_dedicado'],
      exampleContext:
        'Ejemplo mensual: presencia equilibrada en familia y amistades cercanas.',
    },
    {
      id: 'finanzas',
      label: 'Finanzas',
      shortLabel: 'Finanzas',
      presence: 78,
      color: '#2B6E68',
      softBg: '#ECF4F2',
      sourceSignals: ['finanzas', 'reflexiones'],
      exampleContext:
        'Ejemplo mensual: orden financiero y aporte constante a ahorro tranquilo.',
    },
    {
      id: 'desarrollo-personal',
      label: 'Desarrollo personal',
      shortLabel: 'Desarrollo personal',
      presence: 60,
      color: '#8D7BB3',
      softBg: '#F4F1F9',
      sourceSignals: ['reflexiones', 'actividades'],
      exampleContext:
        'Ejemplo mensual: hábitos de lectura y notas en crecimiento gradual.',
    },
    {
      id: 'ocio',
      label: 'Ocio',
      shortLabel: 'Ocio',
      presence: 48,
      color: '#7B947E',
      softBg: '#F1F5F2',
      sourceSignals: ['tiempo_dedicado', 'actividades'],
      exampleContext:
        'Ejemplo mensual: escapada de diciembre en preparación; aún queda espacio por disfrutar hoy.',
    },
  ],
  trimestre: [
    {
      id: 'bienestar-fisico',
      label: 'Bienestar físico',
      shortLabel: 'Bienestar físico',
      presence: 66,
      color: '#5E8371',
      softBg: '#EEF4F0',
      sourceSignals: ['energia', 'actividades', 'tiempo_dedicado'],
      exampleContext:
        'Ejemplo trimestral: recuperación progresiva tras semanas más exigentes.',
    },
    {
      id: 'bienestar-emocional',
      label: 'Bienestar emocional',
      shortLabel: 'Bienestar emocional',
      presence: 70,
      color: '#7D71A8',
      softBg: '#F3F1F8',
      sourceSignals: ['estado_emocional', 'reflexiones'],
      exampleContext:
        'Ejemplo trimestral: estabilidad emocional apoyada en rutinas nocturnas.',
    },
    {
      id: 'trabajo-proyectos',
      label: 'Trabajo y proyectos',
      shortLabel: 'Trabajo y proyectos',
      presence: 84,
      color: '#135D66',
      softBg: '#ECF4F5',
      sourceSignals: ['tiempo_dedicado', 'actividades'],
      exampleContext:
        'Ejemplo trimestral: dimensión con mayor volumen de horas invertidas.',
    },
    {
      id: 'relaciones',
      label: 'Relaciones',
      shortLabel: 'Relaciones',
      presence: 68,
      color: '#6A7B8E',
      softBg: '#F0F3F6',
      sourceSignals: ['actividades', 'tiempo_dedicado'],
      exampleContext:
        'Ejemplo trimestral: vínculos cuidados con regularidad.',
    },
    {
      id: 'finanzas',
      label: 'Finanzas',
      shortLabel: 'Finanzas',
      presence: 75,
      color: '#2B6E68',
      softBg: '#ECF4F2',
      sourceSignals: ['finanzas', 'reflexiones'],
      exampleContext:
        'Ejemplo trimestral: base financiera estable y predecible.',
    },
    {
      id: 'desarrollo-personal',
      label: 'Desarrollo personal',
      shortLabel: 'Desarrollo personal',
      presence: 64,
      color: '#8D7BB3',
      softBg: '#F4F1F9',
      sourceSignals: ['reflexiones', 'actividades'],
      exampleContext:
        'Ejemplo trimestral: aprendizaje constante a ritmo humano.',
    },
    {
      id: 'ocio',
      label: 'Ocio',
      shortLabel: 'Ocio',
      presence: 52,
      color: '#7B947E',
      softBg: '#F1F5F2',
      sourceSignals: ['tiempo_dedicado', 'actividades'],
      exampleContext:
        'Ejemplo trimestral: margen abierto para incorporar más descanso recreativo.',
    },
  ],
};

const PERIOD_LABELS: Record<LifeBalancePeriod, string> = {
  semana: 'Esta semana (ejemplo)',
  mes: 'Este mes (ejemplo)',
  trimestre: 'Últimos 3 meses (ejemplo)',
};

const PERIOD_NOTES: Record<LifeBalancePeriod, string> = {
  semana:
    'En esta vista demostrativa, el foco laboral y el cuidado físico sostienen la semana, mientras el ocio y el desarrollo personal quedan con margen para crecer sin prisa.',
  mes:
    'En la vista mensual de ejemplo se observa un reparto más armónico entre trabajo, finanzas y bienestar emocional, con oportunidad de dar más lugar al ocio.',
  trimestre:
    'A lo largo de tres meses ilustrativos, las bases laborales, financieras y relacionales lucen estables; abrir espacios de disfrute espontáneo ayudaría a equilibrar aún más el conjunto.',
};

/**
 * Construye una instantánea de balance de vida para un periodo.
 * Nota de arquitectura: cuando existan registros históricos reales en la aplicación,
 * esta función recibirá (registrosEnergía, compromisos, espacios, reflexiones) para calcular
 * cada dimensión sin emitir juicios ni puntuaciones globales.
 */
export function buildLifeBalanceSnapshot(period: LifeBalancePeriod): LifeBalanceSnapshot {
  return {
    period,
    periodLabel: PERIOD_LABELS[period],
    isDemoData: true,
    dimensions: DEMO_DIMENSIONS_BY_PERIOD[period],
    summaryNote: PERIOD_NOTES[period],
  };
}

export function extractBalanceHighlights(dimensions: LifeBalanceDimension[]) {
  const sorted = [...dimensions].sort((a, b) => b.presence - a.presence);
  const higherAttention = sorted.slice(0, 2);
  const needsMoreSpace = [...sorted].reverse().slice(0, 2);
  return { higherAttention, needsMoreSpace };
}
