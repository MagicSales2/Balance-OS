import {
  Commitment,
  DailyIntention,
  EnergyState,
  LifeSpace,
  UserPreferences,
} from '../types/balance';

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
  steps?: string[];
  reason: string;
  status: 'accepted' | 'discarded';
}

export interface AdaptiveContextSnapshot {
  userName: string;
  energy: EnergyState;
  pendingIntentions: DailyIntention[];
  todayCommitments: Commitment[];
  relevantGoals: LifeSpace[];
  personalMotto: string;
  remainingTimeLabel: string;
}

export interface AdaptivePlanProposal {
  greetingMessage: string;
  realPriorities: string[];
  suggestions: ReorganizationSuggestion[];
  closingNote: string;
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
  const relevantGoals = spaces.filter(
    (s) => s.rhythm === 'En foco' || s.rhythm === 'Activo'
  );

  return {
    userName: preferences.name,
    energy,
    pendingIntentions,
    todayCommitments,
    relevantGoals: relevantGoals.slice(0, 4),
    personalMotto: preferences.personalMotto,
    remainingTimeLabel: 'Tarde y cierre del día (13:00 – 22:00)',
  };
}

export function generateAdaptivePlanProposal(
  context: AdaptiveContextSnapshot
): AdaptivePlanProposal {
  const { userName, energy, pendingIntentions, todayCommitments, relevantGoals } = context;

  const lowPhysical = energy.physical <= 2;
  const lowMental = energy.mental <= 2;
  const highEnergy = energy.physical >= 4 && energy.mental >= 4;

  const customLower = energy.customMoodText.toLowerCase();
  const customSoundsHeavy =
    energy.emotionalLabel === 'Otro' &&
    (customLower.includes('cans') ||
      customLower.includes('agob') ||
      customLower.includes('estres') ||
      customLower.includes('trist') ||
      customLower.includes('baj') ||
      customLower.includes('satur') ||
      customLower.includes('ansie') ||
      customLower.includes('pesad'));

  const emotionallyHeavy = HEAVY_MOODS.has(energy.emotionalLabel) || customSoundsHeavy;

  const moodDescription =
    energy.emotionalLabel === 'Otro' && energy.customMoodText.trim()
      ? `"${energy.customMoodText.trim()}"`
      : energy.emotionalLabel.toLowerCase();

  const suggestions: ReorganizationSuggestion[] = [];
  const realPriorities: string[] = [];

  // Identify key pending intentions
  const walkItem = pendingIntentions.find(
    (i) => i.physicalLoad === 'medio' || i.title.toLowerCase().includes('caminata')
  );
  const heavyCognitiveItem = pendingIntentions.find((i) => i.cognitiveLoad === 'alto');
  const familyOrCallItem = pendingIntentions.find(
    (i) => i.spaceId === 'familia' || i.title.toLowerCase().includes('llamar')
  );
  const readingOrSoftItem = pendingIntentions.find(
    (i) =>
      i.id !== walkItem?.id &&
      i.id !== familyOrCallItem?.id &&
      i.id !== heavyCognitiveItem?.id &&
      (i.spaceId === 'desarrollo' || i.title.toLowerCase().includes('lectura'))
  );
  const otherPending = pendingIntentions.filter(
    (i) =>
      i.id !== walkItem?.id &&
      i.id !== heavyCognitiveItem?.id &&
      i.id !== familyOrCallItem?.id &&
      i.id !== readingOrSoftItem?.id
  );

  // Today's active commitment (e.g., Café con Laura at 18:15)
  const primaryCommitment = todayCommitments[0];

  // 1. Handle physical energy
  if (walkItem) {
    if (lowPhysical) {
      suggestions.push({
        id: 'sug-walk-postpone',
        actionType: 'reprogramar',
        targetType: 'intention',
        targetId: walkItem.id,
        spaceId: walkItem.spaceId,
        spaceName: walkItem.spaceName,
        originalTitle: walkItem.title,
        proposedTitle: 'Estiramiento suave de 8 minutos o aire fresco sentado',
        proposedTimeWindow: '16:00',
        reason:
          'Con energía física baja, conviene reemplazar la caminata larga por un movimiento suave que no te desgaste.',
        status: 'accepted',
      });
    } else if (emotionallyHeavy) {
      suggestions.push({
        id: 'sug-walk-gentle',
        actionType: 'reprogramar',
        targetType: 'intention',
        targetId: walkItem.id,
        spaceId: walkItem.spaceId,
        spaceName: walkItem.spaceName,
        originalTitle: walkItem.title,
        proposedTitle: 'Paseo sin ritmo ni objetivo de pasos (15 min)',
        proposedTimeWindow: '14:15 – 14:30',
        reason:
          'Salir unos minutos sin exigencia ayuda a despejar la mente y cambiar de aire sin convertirlo en otra obligación.',
        status: 'accepted',
      });
    } else {
      suggestions.push({
        id: 'sug-walk-keep',
        actionType: 'mantener',
        targetType: 'intention',
        targetId: walkItem.id,
        spaceId: walkItem.spaceId,
        spaceName: walkItem.spaceName,
        originalTitle: walkItem.title,
        proposedTitle: walkItem.title,
        proposedTimeWindow: walkItem.timeWindow,
        reason:
          'Tu energía física acompaña bien este movimiento ligero y te dará claridad para la tarde.',
        status: 'accepted',
      });
    }
  }

  // 2. Handle heavy cognitive task (e.g. Cuaderno editorial)
  if (heavyCognitiveItem) {
    if (lowMental && emotionallyHeavy) {
      suggestions.push({
        id: 'sug-cog-postpone',
        actionType: 'aplazar',
        targetType: 'intention',
        targetId: heavyCognitiveItem.id,
        spaceId: heavyCognitiveItem.spaceId,
        spaceName: heavyCognitiveItem.spaceName,
        originalTitle: heavyCognitiveItem.title,
        proposedTitle: heavyCognitiveItem.title,
        proposedTimeWindow: 'Jueves 19 nov · mañana',
        reason:
          'Hoy tu mente pide menos carga y el proyecto del cuaderno está pensado para disfrutarse. Moverlo a mañana protege tu ánimo.',
        status: 'accepted',
      });
    } else if (lowMental || emotionallyHeavy) {
      suggestions.push({
        id: 'sug-cog-split',
        actionType: 'dividir',
        targetType: 'intention',
        targetId: heavyCognitiveItem.id,
        spaceId: heavyCognitiveItem.spaceId,
        spaceName: heavyCognitiveItem.spaceName,
        originalTitle: heavyCognitiveItem.title,
        proposedTitle: 'Avanzar solo un esquema breve de 3 ideas del capítulo',
        proposedTimeWindow: '15:30 – 15:55',
        steps: [
          'Abrir la nota existente y releer el título (5 min)',
          'Anotar 3 viñetas clave sin redactar aún (10 min)',
          'Guardar y cerrar sin exigirte terminar el capítulo (5 min)',
        ],
        reason:
          'Dividir una tarea exigente en pasos pequeños evita la parálisis y mantiene vivo tu proyecto sin agobio.',
        status: 'accepted',
      });
    } else if (highEnergy) {
      suggestions.push({
        id: 'sug-cog-keep-high',
        actionType: 'mantener',
        targetType: 'intention',
        targetId: heavyCognitiveItem.id,
        spaceId: heavyCognitiveItem.spaceId,
        spaceName: heavyCognitiveItem.spaceName,
        originalTitle: heavyCognitiveItem.title,
        proposedTitle: heavyCognitiveItem.title,
        proposedTimeWindow: '15:30 – 16:45',
        reason:
          'Tienes buena disposición hoy. Cerrar este bloque a las 16:45 aprovecha tu foco sin invadir tu descanso de la tarde.',
        status: 'accepted',
      });
      realPriorities.push('Un bloque creativo enfocado en tu proyecto hasta las 16:45.');
    } else {
      suggestions.push({
        id: 'sug-cog-split-medium',
        actionType: 'dividir',
        targetType: 'intention',
        targetId: heavyCognitiveItem.id,
        spaceId: heavyCognitiveItem.spaceId,
        spaceName: heavyCognitiveItem.spaceName,
        originalTitle: heavyCognitiveItem.title,
        proposedTitle: 'Definir solo la estructura base del primer capítulo',
        proposedTimeWindow: '15:30 – 16:15',
        steps: [
          'Elegir los 3 subtemas principales del capítulo',
          'Dejar marcada una idea de ejemplo para retomar mañana',
        ],
        reason:
          'Acotar el bloque a 45 minutos en dos pasos concretos te permite avanzar con serenidad.',
        status: 'accepted',
      });
    }
  }

  // 3. Handle relational / family call
  if (familyOrCallItem) {
    if (emotionallyHeavy && lowPhysical) {
      suggestions.push({
        id: 'sug-call-postpone',
        actionType: 'aplazar',
        targetType: 'intention',
        targetId: familyOrCallItem.id,
        spaceId: familyOrCallItem.spaceId,
        spaceName: familyOrCallItem.spaceName,
        originalTitle: familyOrCallItem.title,
        proposedTitle: familyOrCallItem.title,
        proposedTimeWindow: 'Jueves 19 nov · 12:30',
        reason:
          'Si necesitas silencio hoy, puedes coordinar el sábado con un mensaje breve o dejar la llamada para mañana con mejor ánimo.',
        status: 'accepted',
      });
    } else {
      suggestions.push({
        id: 'sug-call-keep',
        actionType: 'mantener',
        targetType: 'intention',
        targetId: familyOrCallItem.id,
        spaceId: familyOrCallItem.spaceId,
        spaceName: familyOrCallItem.spaceName,
        originalTitle: familyOrCallItem.title,
        proposedTitle: familyOrCallItem.title,
        proposedTimeWindow: '17:15',
        reason:
          'Es una gestión corta y afectiva que cuida tu espacio familiar y queda resuelta antes de tu café.',
        status: 'accepted',
      });
      realPriorities.push('Resolver la llamada familiar antes del final de la tarde.');
    }
  }

  // 4. Existing today commitment (e.g. Café tranquilo con Laura)
  if (primaryCommitment) {
    if (lowPhysical && emotionallyHeavy) {
      suggestions.push({
        id: 'sug-comm-soft',
        actionType: 'reprogramar',
        targetType: 'commitment',
        targetId: primaryCommitment.id,
        spaceId: primaryCommitment.spaceId,
        spaceName: primaryCommitment.spaceName,
        originalTitle: primaryCommitment.title,
        proposedTitle: `${primaryCommitment.title} (encuentro breve de 40 min)`,
        proposedTimeWindow: primaryCommitment.startTime,
        reason:
          'Mantener el vínculo puede hacerte bien, pero acortarlo un poco te permite volver a casa temprano a descansar.',
        status: 'accepted',
      });
    } else {
      suggestions.push({
        id: 'sug-comm-keep',
        actionType: 'mantener',
        targetType: 'commitment',
        targetId: primaryCommitment.id,
        spaceId: primaryCommitment.spaceId,
        spaceName: primaryCommitment.spaceName,
        originalTitle: primaryCommitment.title,
        proposedTitle: primaryCommitment.title,
        proposedTimeWindow: primaryCommitment.startTime,
        reason:
          'Es un espacio de conexión personal ya reservado y alineado con tu espacio de Relaciones.',
        status: 'accepted',
      });
    }
    realPriorities.push(`Disfrutar con calma: ${primaryCommitment.title} (${primaryCommitment.startTime}).`);
  }

  // 5. Any extra user-added pending intentions
  otherPending.slice(0, 2).forEach((extra, idx) => {
    suggestions.push({
      id: `sug-extra-${extra.id}-${idx}`,
      actionType: lowMental || emotionallyHeavy ? 'aplazar' : 'mantener',
      targetType: 'intention',
      targetId: extra.id,
      spaceId: extra.spaceId,
      spaceName: extra.spaceName,
      originalTitle: extra.title,
      proposedTitle: extra.title,
      proposedTimeWindow:
        lowMental || emotionallyHeavy ? 'Mañana con mente fresca' : extra.timeWindow,
      reason:
        lowMental || emotionallyHeavy
          ? 'Diferir lo que no es urgente libera espacio mental para lo esencial de hoy.'
          : 'Encaja bien en el ritmo disponible sin saturar la tarde.',
      status: 'accepted',
    });
  });

  // 6. Incorporate intentional rest space (especially when low energy or stressed, and gently even when high energy)
  if (emotionallyHeavy || lowPhysical || lowMental) {
    suggestions.push({
      id: 'sug-rest-space',
      actionType: 'descanso',
      targetType: 'new_rest',
      spaceId: 'bienestar',
      spaceName: 'Bienestar',
      originalTitle: 'Espacio de pausa y cuidado',
      proposedTitle: 'Pausa sin pantallas: bebida caliente y 10 min de silencio',
      proposedTimeWindow: '17:35 – 17:55',
      reason:
        'Un respiro consciente antes de cerrar la tarde ayuda a soltar tensión acumulada sin culpa.',
      status: 'accepted',
    });
    realPriorities.unshift('Proteger un espacio real de descanso y bajar la exigencia hoy.');
  } else {
    suggestions.push({
      id: 'sug-rest-balance',
      actionType: 'descanso',
      targetType: 'new_rest',
      spaceId: 'bienestar',
      spaceName: 'Bienestar',
      originalTitle: 'Transición consciente de cierre',
      proposedTitle: 'Cierre de jornada y transición tranquila sin pendientes',
      proposedTimeWindow: '17:50 – 18:05',
      reason:
        'Incluso con buena energía, marcar un límite amable evita que el día se llene de tareas extra.',
      status: 'accepted',
    });
  }

  // Ensure reading/evening item stays gentle if present
  if (readingOrSoftItem && readingOrSoftItem.id !== familyOrCallItem?.id) {
    suggestions.push({
      id: 'sug-reading-keep',
      actionType: 'mantener',
      targetType: 'intention',
      targetId: readingOrSoftItem.id,
      spaceId: readingOrSoftItem.spaceId,
      spaceName: readingOrSoftItem.spaceName,
      originalTitle: readingOrSoftItem.title,
      proposedTitle: readingOrSoftItem.title,
      proposedTimeWindow: readingOrSoftItem.timeWindow,
      reason:
        'Acompaña un cierre de día sereno y nutre tu espacio de Desarrollo personal sin presión.',
      status: 'accepted',
    });
  }

  if (realPriorities.length === 0) {
    realPriorities.push('Avanzar solo en lo que hoy te aporte calma y sentido.');
  }

  const goalNames = relevantGoals.map((g) => g.name).slice(0, 3).join(', ');

  let greetingMessage = `${userName}, gracias por registrar cómo te sientes hoy (energía física ${energy.physical}/5, energía mental ${energy.mental}/5 y ánimo ${moodDescription}). `;
  if (lowPhysical || lowMental || emotionallyHeavy) {
    greetingMessage += `Considerando tus ${pendingIntentions.length} intenciones pendientes, tus compromisos de la tarde y tus espacios activos (${goalNames}), preparé una reorganización más amable para que cuides tu energía sin perder lo importante.`;
  } else if (highEnergy) {
    greetingMessage += `Tienes muy buena disposición hoy. Mirando tus compromisos y tus espacios (${goalNames}), te propongo aprovechar esta claridad en lo prioritario manteniendo límites sanos para no sobrecargar la tarde.`;
  } else {
    greetingMessage += `Con tu nivel actual y el tiempo disponible en la tarde, ajusté tus bloques para que avances con ligereza en lo esencial de tus espacios (${goalNames}).`;
  }

  return {
    greetingMessage,
    realPriorities: realPriorities.slice(0, 3),
    suggestions,
    closingNote:
      'Puedes aceptar, editar o descartar cualquier ajuste antes de aplicarlo. Nada se modificará sin tu confirmación.',
  };
}
