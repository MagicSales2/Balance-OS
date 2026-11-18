import {
  Commitment,
  DailyIntention,
  EnergyState,
  LifeSpace,
  UserPreferences,
} from '../types/balance';

export type AdaptiveScope = 'day' | 'week';

export type ProposalActionType =
  | 'mantener'
  | 'reprogramar'
  | 'dividir'
  | 'aplazar'
  | 'descanso';

export interface ReorganizationSuggestion {
  id: string;
  actionType: ProposalActionType;
  targetType: 'intention' | 'commitment' | 'new_rest';
  targetId?: string;
  spaceId: string;
  spaceName: string;
  originalTitle: string;
  proposedTitle: string;
  proposedTimeWindow: string;
  proposedDayIndex?: number;
  proposedDateLabel?: string;
  steps?: string[];
  reason: string;
  status: 'accepted' | 'discarded';
}

export interface AdaptiveContextSnapshot {
  userName: string;
  energy: EnergyState;
  pendingIntentions: DailyIntention[];
  todayCommitments: Commitment[];
  weekCommitments: Commitment[];
  relevantGoals: LifeSpace[];
  personalMotto: string;
}

export interface AdaptivePlanProposal {
  assistantReply: string;
  suggestions: ReorganizationSuggestion[];
}

const HEAVY_MOODS = new Set([
  'Algo desanimado',
  'Triste',
  'Estresado',
  'Ansioso',
  'Frustrado',
  'Cansado',
]);

export function buildAdaptiveContextSnapshot(params: {
  preferences: UserPreferences;
  energy: EnergyState;
  intentions: DailyIntention[];
  commitments: Commitment[];
  spaces: LifeSpace[];
}): AdaptiveContextSnapshot {
  const { preferences, energy, intentions, commitments, spaces } = params;

  const pendingIntentions = intentions.filter((i) => !i.completed && !i.postponedTo);
  const todayCommitments = commitments.filter((c) => c.dayIndex === 2 && !c.completed);
  const weekCommitments = commitments.filter((c) => !c.completed);
  const relevantGoals = spaces.filter(
    (s) => !s.archived && (s.rhythm === 'En foco' || s.rhythm === 'Activo')
  );

  return {
    userName: preferences.name,
    energy,
    pendingIntentions,
    todayCommitments,
    weekCommitments,
    relevantGoals: relevantGoals.slice(0, 4),
    personalMotto: preferences.personalMotto,
  };
}

export function interpretAndPlan(
  context: AdaptiveContextSnapshot,
  userMessage: string,
  scope: AdaptiveScope
): AdaptivePlanProposal {
  const q = userMessage.toLowerCase();
  const { energy, pendingIntentions, todayCommitments, weekCommitments } = context;

  const wantsWorkOnly =
    q.includes('trabaj') ||
    q.includes('magia') ||
    q.includes('ads') ||
    q.includes('campañ') ||
    q.includes('negocio');
  const wantsProjects =
    q.includes('proyect') || q.includes('ia') || q.includes('automat');
  const wantsRest =
    q.includes('descans') ||
    q.includes('pocas cosas') ||
    q.includes('liger') ||
    q.includes('suave') ||
    q.includes('pausa') ||
    q.includes('cansad');
  const tooManyTasks =
    q.includes('demasiad') ||
    q.includes('much') ||
    q.includes('abrum') ||
    q.includes('pendient') ||
    q.includes('prioriz');

  const lowEnergy =
    (energy.physical > 0 && energy.physical <= 2) ||
    (energy.mental > 0 && energy.mental <= 2);
  const customMood = energy.customMoodText.toLowerCase();
  const customHeavyMood =
    energy.emotionalLabel === 'Otro' &&
    (customMood.includes('agot') ||
      customMood.includes('cans') ||
      customMood.includes('trist') ||
      customMood.includes('estr') ||
      customMood.includes('abrum') ||
      customMood.includes('baj') ||
      customMood.includes('mal'));
  const heavyMood = HEAVY_MOODS.has(energy.emotionalLabel) || customHeavyMood;

  const workTasks = pendingIntentions.filter((i) => i.spaceId === 'trabajo');
  const projectTasks = pendingIntentions.filter((i) => i.spaceId === 'proyectos');
  const otherTasks = pendingIntentions.filter(
    (i) => i.spaceId !== 'trabajo' && i.spaceId !== 'proyectos'
  );

  const suggestions: ReorganizationSuggestion[] = [];

  if (scope === 'week') {
    if (weekCommitments.length > 0) {
      weekCommitments.slice(0, 3).forEach((com) => {
        if (wantsRest || lowEnergy || heavyMood) {
          suggestions.push({
            id: `wk-${com.id}`,
            actionType: 'reprogramar',
            targetType: 'commitment',
            targetId: com.id,
            spaceId: com.spaceId,
            spaceName: com.spaceName,
            originalTitle: com.title,
            proposedTitle: com.title,
            proposedTimeWindow: com.startTime,
            proposedDayIndex: Math.min(com.dayIndex + 1, 5),
            proposedDateLabel: com.dateLabel,
            reason: 'Distribuye mejor la carga para dejar margen libre.',
            status: 'accepted',
          });
        } else {
          suggestions.push({
            id: `wk-${com.id}`,
            actionType: 'mantener',
            targetType: 'commitment',
            targetId: com.id,
            spaceId: com.spaceId,
            spaceName: com.spaceName,
            originalTitle: com.title,
            proposedTitle: com.title,
            proposedTimeWindow: com.startTime,
            proposedDayIndex: com.dayIndex,
            proposedDateLabel: com.dateLabel,
            reason: 'Encaja bien en tu semana actual.',
            status: 'accepted',
          });
        }
      });
    } else {
      pendingIntentions.slice(0, 3).forEach((item, idx) => {
        const dayNames = ['Jueves mañana', 'Viernes mañana', 'Sábado suave'];
        suggestions.push({
          id: `wk-int-${item.id}`,
          actionType: wantsProjects && item.spaceId === 'trabajo' ? 'aplazar' : 'reprogramar',
          targetType: 'intention',
          targetId: item.id,
          spaceId: item.spaceId,
          spaceName: item.spaceName,
          originalTitle: item.title,
          proposedTitle: item.title,
          proposedTimeWindow: dayNames[idx] ?? 'Esta semana',
          reason:
            wantsProjects && item.spaceId === 'trabajo'
              ? 'Libera espacio semanal para proyectos e IA.'
              : 'Asigna un momento concreto sin llenar toda la agenda.',
          status: 'accepted',
        });
      });
    }

    suggestions.push({
      id: 'wk-rest-open',
      actionType: 'descanso',
      targetType: 'new_rest',
      spaceId: 'vida-disfrute',
      spaceName: 'Vida y disfrute',
      originalTitle: 'Tiempo libre',
      proposedTitle: 'Bloque libre sin pendientes operativos de Magia Pastelera',
      proposedTimeWindow: 'Domingo',
      reason: 'Protege un cierre de semana sin intervención diaria en el negocio.',
      status: 'accepted',
    });

    return {
      assistantReply:
        weekCommitments.length === 0
          ? 'Como aún no tienes compromisos fijos en la agenda, distribuí tus pendientes iniciales con margen para respirar.'
          : 'Ordené tu semana priorizando foco real y dejando espacio abierto para descansar.',
      suggestions: suggestions.slice(0, 4),
    };
  }

  // DAY SCOPE
  if (wantsWorkOnly) {
    const primaryWork = workTasks[0] ?? pendingIntentions[0];
    const secondaryWork = workTasks[1];

    if (primaryWork) {
      suggestions.push({
        id: `day-w1-${primaryWork.id}`,
        actionType: 'mantener',
        targetType: 'intention',
        targetId: primaryWork.id,
        spaceId: primaryWork.spaceId,
        spaceName: primaryWork.spaceName,
        originalTitle: primaryWork.title,
        proposedTitle: primaryWork.title,
        proposedTimeWindow: 'Bloque principal de hoy',
        reason: 'Atiende primero lo de mayor impacto en Magia Pastelera.',
        status: 'accepted',
      });
    }

    if (secondaryWork) {
      suggestions.push({
        id: `day-w2-${secondaryWork.id}`,
        actionType: 'dividir',
        targetType: 'intention',
        targetId: secondaryWork.id,
        spaceId: secondaryWork.spaceId,
        spaceName: secondaryWork.spaceName,
        originalTitle: secondaryWork.title,
        proposedTitle: secondaryWork.title,
        proposedTimeWindow: 'Segundo bloque (30 min)',
        steps: [
          'Revisar 1 métrica o cuello de botella concreto',
          'Anotar una acción práctica y cerrar',
        ],
        reason: 'Acotado en tiempo para no consumir todo el día.',
        status: 'accepted',
      });
    }

    if (projectTasks[0]) {
      suggestions.push({
        id: `day-w-proj-${projectTasks[0].id}`,
        actionType: 'aplazar',
        targetType: 'intention',
        targetId: projectTasks[0].id,
        spaceId: projectTasks[0].spaceId,
        spaceName: projectTasks[0].spaceName,
        originalTitle: projectTasks[0].title,
        proposedTitle: projectTasks[0].title,
        proposedTimeWindow: 'Mañana',
        reason: 'Se mueve a mañana para mantener el foco de hoy en trabajo.',
        status: 'accepted',
      });
    }

    if (todayCommitments[0]) {
      suggestions.push({
        id: `day-com-${todayCommitments[0].id}`,
        actionType: 'mantener',
        targetType: 'commitment',
        targetId: todayCommitments[0].id,
        spaceId: todayCommitments[0].spaceId,
        spaceName: todayCommitments[0].spaceName,
        originalTitle: todayCommitments[0].title,
        proposedTitle: todayCommitments[0].title,
        proposedTimeWindow: todayCommitments[0].startTime,
        reason: 'Compromiso ya agendado para hoy.',
        status: 'accepted',
      });
    }

    return {
      assistantReply:
        'Concentré el día en lo esencial de Magia Pastelera y aparté el resto para no dispersarte.',
      suggestions: suggestions.slice(0, 4),
    };
  }

  if (wantsProjects) {
    const mainProj = projectTasks[0] ?? pendingIntentions[0];
    if (mainProj) {
      suggestions.push({
        id: `day-p1-${mainProj.id}`,
        actionType: energy.mental > 0 && energy.mental <= 2 ? 'dividir' : 'mantener',
        targetType: 'intention',
        targetId: mainProj.id,
        spaceId: mainProj.spaceId,
        spaceName: mainProj.spaceName,
        originalTitle: mainProj.title,
        proposedTitle: mainProj.title,
        proposedTimeWindow: 'Primer bloque de enfoque',
        steps:
          energy.mental > 0 && energy.mental <= 2
            ? ['Definir un alcance pequeño de 25 min', 'Dejar anotado el siguiente paso']
            : undefined,
        reason: 'Reserva tu mejor energía mental para proyectos digitales e IA.',
        status: 'accepted',
      });
    }

    workTasks.slice(0, 2).forEach((wt, index) => {
      suggestions.push({
        id: `day-pw-${wt.id}`,
        actionType: index === 0 ? 'reprogramar' : 'aplazar',
        targetType: 'intention',
        targetId: wt.id,
        spaceId: wt.spaceId,
        spaceName: wt.spaceName,
        originalTitle: wt.title,
        proposedTitle: wt.title,
        proposedTimeWindow: index === 0 ? 'Bloque corto en la tarde' : 'Mañana',
        reason:
          index === 0
            ? 'Mantén Magia Pastelera acotada a un bloque breve.'
            : 'Se mueve a mañana para evitar sobrecargar el día.',
        status: 'accepted',
      });
    });

    return {
      assistantReply:
        'Prioricé tus proyectos digitales e IA y dejé Magia Pastelera acotada para que no absorba tu energía.',
      suggestions: suggestions.slice(0, 4),
    };
  }

  if (wantsRest || tooManyTasks || lowEnergy || heavyMood) {
    const primary = pendingIntentions[0];
    if (primary) {
      suggestions.push({
        id: `day-r1-${primary.id}`,
        actionType: tooManyTasks && !wantsRest ? 'dividir' : 'reprogramar',
        targetType: 'intention',
        targetId: primary.id,
        spaceId: primary.spaceId,
        spaceName: primary.spaceName,
        originalTitle: primary.title,
        proposedTitle: primary.title,
        proposedTimeWindow: 'Solo 25 min hoy',
        steps:
          tooManyTasks && !wantsRest
            ? ['Elegir una sola acción concreta', 'Cerrar apenas termines esos 25 min']
            : undefined,
        reason: 'Un avance pequeño evita presión y cuida tu energía.',
        status: 'accepted',
      });
    }

    pendingIntentions.slice(1, 3).forEach((item) => {
      suggestions.push({
        id: `day-r-post-${item.id}`,
        actionType: 'aplazar',
        targetType: 'intention',
        targetId: item.id,
        spaceId: item.spaceId,
        spaceName: item.spaceName,
        originalTitle: item.title,
        proposedTitle: item.title,
        proposedTimeWindow: 'Mañana',
        reason: 'Queda para mañana para no saturar tu día.',
        status: 'accepted',
      });
    });

    suggestions.push({
      id: 'day-rest-pause',
      actionType: 'descanso',
      targetType: 'new_rest',
      spaceId: 'bienestar',
      spaceName: 'Bienestar',
      originalTitle: 'Descanso consciente',
      proposedTitle: 'Pausa real sin pendientes ni mensajes comerciales',
      proposedTimeWindow: 'Al cerrar la tarde',
      reason: 'Prioriza descanso y desconexión.',
      status: 'accepted',
    });

    return {
      assistantReply:
        'Dejé solo un bloque ligero para hoy, moví lo demás a mañana y reservé una pausa real para descansar.',
      suggestions: suggestions.slice(0, 4),
    };
  }

  // General balanced plan over actual tasks
  pendingIntentions.slice(0, 2).forEach((item, idx) => {
    suggestions.push({
      id: `day-bal-${item.id}`,
      actionType: idx === 0 ? 'mantener' : 'dividir',
      targetType: 'intention',
      targetId: item.id,
      spaceId: item.spaceId,
      spaceName: item.spaceName,
      originalTitle: item.title,
      proposedTitle: item.title,
      proposedTimeWindow: idx === 0 ? 'Bloque 1 (45 min)' : 'Bloque 2 (30 min)',
      steps:
        idx === 1
          ? ['Definir el resultado mínimo esperado', 'Cerrar bloque a tiempo']
          : undefined,
      reason: 'Equilibra avance práctico sin alargar la jornada.',
      status: 'accepted',
    });
  });

  if (otherTasks[0] && !suggestions.some((s) => s.targetId === otherTasks[0].id)) {
    suggestions.push({
      id: `day-other-${otherTasks[0].id}`,
      actionType: 'mantener',
      targetType: 'intention',
      targetId: otherTasks[0].id,
      spaceId: otherTasks[0].spaceId,
      spaceName: otherTasks[0].spaceName,
      originalTitle: otherTasks[0].title,
      proposedTitle: otherTasks[0].title,
      proposedTimeWindow: 'En la tarde',
      reason: 'Acompaña el día con equilibrio.',
      status: 'accepted',
    });
  }

  suggestions.push({
    id: 'day-rest-gentle',
    actionType: 'descanso',
    targetType: 'new_rest',
    spaceId: 'bienestar',
    spaceName: 'Bienestar',
    originalTitle: 'Pausa',
    proposedTitle: 'Cierre de jornada y descanso sin pantallas',
    proposedTimeWindow: 'Final del día',
    reason: 'Evita que el trabajo ocupe todo el día.',
    status: 'accepted',
  });

  return {
    assistantReply:
      'Organicé tus pendientes actuales en bloques cortos para avanzar con claridad y proteger tu tiempo.',
    suggestions: suggestions.slice(0, 4),
  };
}
