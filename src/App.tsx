import React, { useMemo, useState } from 'react';
import { AiAssistantDrawer } from './components/ai/AiAssistantDrawer';
import { AdaptivePlanningModal } from './components/dashboard/AdaptivePlanningModal';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { EvolutionView } from './components/views/EvolutionView';
import { FinancesView } from './components/views/FinancesView';
import { HomeView } from './components/views/HomeView';
import { LibraryView } from './components/views/LibraryView';
import { PlanningView } from './components/views/PlanningView';
import { SettingsView } from './components/views/SettingsView';
import { SpacesView } from './components/views/SpacesView';
import {
  AdaptiveScope,
  buildAdaptiveContextSnapshot,
  ReorganizationSuggestion,
} from './utils/adaptivePlanning';
import {
  INITIAL_ACTIVITY,
  INITIAL_COMMITMENTS,
  INITIAL_ENERGY,
  INITIAL_EVOLUTION,
  INITIAL_FINANCE_CATEGORIES,
  INITIAL_FINANCE_MOVEMENTS,
  INITIAL_INTENTIONS,
  INITIAL_LIBRARY,
  INITIAL_PREFERENCES,
  INITIAL_SPACES,
} from './data/mockData';
import {
  ActivityEntry,
  Commitment,
  DailyIntention,
  EnergyState,
  EvolutionPoint,
  FinanceMovement,
  LibraryEntry,
  LifeSpace,
  NavSection,
  UserPreferences,
} from './types/balance';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('inicio');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);

  const [adaptiveOpen, setAdaptiveOpen] = useState(false);
  const [adaptiveScope, setAdaptiveScope] = useState<AdaptiveScope>('day');
  const [hasWellbeingCheckIn, setHasWellbeingCheckIn] = useState(false);
  const [reorganizationNotice, setReorganizationNotice] = useState(false);

  const [preferences, setPreferences] = useState<UserPreferences>(INITIAL_PREFERENCES);
  const [energy, setEnergy] = useState<EnergyState>(INITIAL_ENERGY);
  const [spaces, setSpaces] = useState<LifeSpace[]>(INITIAL_SPACES);
  const [intentions, setIntentions] = useState<DailyIntention[]>(INITIAL_INTENTIONS);
  const [activity, setActivity] = useState<ActivityEntry[]>(INITIAL_ACTIVITY);
  const [commitments, setCommitments] = useState<Commitment[]>(INITIAL_COMMITMENTS);
  const [evolution, setEvolution] = useState<EvolutionPoint[]>(INITIAL_EVOLUTION);
  const [movements, setMovements] = useState<FinanceMovement[]>(INITIAL_FINANCE_MOVEMENTS);
  const [library, setLibrary] = useState<LibraryEntry[]>(INITIAL_LIBRARY);

  const adaptiveContext = useMemo(
    () =>
      buildAdaptiveContextSnapshot({
        preferences,
        energy,
        intentions,
        commitments,
        spaces,
      }),
    [preferences, energy, intentions, commitments, spaces]
  );

  const balanceInput = useMemo(
    () => ({
      energy,
      hasWellbeingCheckIn,
      spaces,
      intentions,
      commitments,
      evolution,
      movements,
      library,
    }),
    [energy, hasWellbeingCheckIn, spaces, intentions, commitments, evolution, movements, library]
  );

  const logActivity = (description: string, spaceName: string) => {
    setActivity((prev) => [
      {
        id: `act-${Date.now()}`,
        description,
        spaceName,
        timeLabel: 'Ahora',
      },
      ...prev.slice(0, 5),
    ]);
  };

  const handleUpdateEnergy = (next: EnergyState) => {
    setEnergy(next);
    setHasWellbeingCheckIn(true);
    setReorganizationNotice(false);
  };

  const openAdaptiveModal = (scope: AdaptiveScope) => {
    setAdaptiveScope(scope);
    setAdaptiveOpen(true);
  };

  const handleApplyReorganization = (
    accepted: ReorganizationSuggestion[],
    scope: AdaptiveScope
  ) => {
    setIntentions((prev) => {
      let updated = [...prev];

      accepted.forEach((sug) => {
        if (sug.targetType === 'intention' && sug.targetId) {
          updated = updated.map((item) => {
            if (item.id !== sug.targetId) return item;
            if (sug.actionType === 'aplazar') {
              return {
                ...item,
                postponedTo: sug.proposedTimeWindow,
              };
            }
            return {
              ...item,
              title: sug.proposedTitle,
              timeWindow: sug.proposedTimeWindow,
              steps: sug.steps,
              postponedTo: undefined,
            };
          });
        } else if (sug.targetType === 'new_rest' && scope === 'day') {
          const alreadyExists = updated.some(
            (i) => i.isRest && i.title === sug.proposedTitle
          );
          if (!alreadyExists) {
            updated.push({
              id: `rest-${Date.now()}`,
              title: sug.proposedTitle,
              spaceId: sug.spaceId,
              spaceName: sug.spaceName,
              timeWindow: sug.proposedTimeWindow,
              completed: false,
              isRest: true,
            });
          }
        }
      });

      return updated;
    });

    setCommitments((prev) => {
      let updated = prev.map((com) => {
        const match = accepted.find(
          (s) => s.targetType === 'commitment' && s.targetId === com.id
        );
        if (!match) return com;
        return {
          ...com,
          title: match.proposedTitle,
          startTime: match.proposedTimeWindow,
          dayIndex: match.proposedDayIndex ?? com.dayIndex,
          dateLabel: match.proposedDateLabel ?? com.dateLabel,
        };
      });

      if (scope === 'week') {
        accepted
          .filter((s) => s.targetType === 'new_rest')
          .forEach((rest) => {
            updated = [
              ...updated,
              {
                id: `com-rest-${Date.now()}`,
                title: rest.proposedTitle,
                spaceId: rest.spaceId,
                spaceName: rest.spaceName,
                dayIndex: rest.proposedTimeWindow.includes('Domingo') ? 6 : 3,
                dateLabel: rest.proposedTimeWindow.includes('Domingo')
                  ? 'Domingo 22 nov'
                  : 'Jueves 19 nov',
                startTime: rest.proposedTimeWindow.includes('17:00') ? '17:00' : '10:00',
                duration: '60 min',
                kind: 'Bienestar',
                completed: false,
              },
            ];
          });
      }

      return updated;
    });

    logActivity(
      scope === 'week'
        ? `Reorganizaste tu semana con ${accepted.length} ajuste${accepted.length > 1 ? 's' : ''}.`
        : `Adaptaste tu día con ${accepted.length} ajuste${accepted.length > 1 ? 's' : ''}.`,
      'Bienestar'
    );
    setAdaptiveOpen(false);
    setReorganizationNotice(true);
  };

  const handleToggleIntention = (id: string) => {
    setIntentions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleAddIntention = (title: string, spaceId: string) => {
    const space = spaces.find((s) => s.id === spaceId);
    const created: DailyIntention = {
      id: `int-${Date.now()}`,
      title,
      spaceId,
      spaceName: space?.name ?? 'Bienestar',
      timeWindow: 'Hoy',
      completed: false,
    };
    setIntentions((prev) => [...prev, created]);
    logActivity(`Añadiste en Mi día: "${title}".`, created.spaceName);
  };

  const handleUpdateSpace = (updated: LifeSpace) => {
    setSpaces((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    logActivity(`Actualizaste "${updated.name}".`, updated.name);
  };

  const handleAddSpace = (space: LifeSpace) => {
    setSpaces((prev) => [...prev, space]);
    logActivity(`Creaste el espacio "${space.name}".`, space.name);
  };

  const handleArchiveSpace = (id: string, archived: boolean) => {
    const target = spaces.find((s) => s.id === id);
    setSpaces((prev) =>
      prev.map((s) => (s.id === id ? { ...s, archived, visible: !archived } : s))
    );
    if (target) {
      logActivity(
        archived
          ? `Archivaste "${target.name}".`
          : `Restauraste "${target.name}".`,
        target.name
      );
    }
  };

  const handleDeleteSpace = (id: string) => {
    const target = spaces.find((s) => s.id === id);
    setSpaces((prev) => prev.filter((s) => s.id !== id));
    if (target) {
      logActivity(`Eliminaste "${target.name}".`, 'Mis espacios');
    }
  };

  const handleMoveSpace = (id: string, direction: 'prev' | 'next') => {
    setSpaces((prev) => {
      const target = prev.find((s) => s.id === id);
      if (!target) return prev;
      const sameGroup = prev
        .filter((s) => s.archived === target.archived)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = sameGroup.findIndex((s) => s.id === id);
      const swapIdx = direction === 'prev' ? idx - 1 : idx + 1;
      if (idx === -1 || swapIdx < 0 || swapIdx >= sameGroup.length) return prev;

      const current = sameGroup[idx];
      const neighbor = sameGroup[swapIdx];
      return prev.map((s) => {
        if (s.id === current.id) return { ...s, sortOrder: neighbor.sortOrder };
        if (s.id === neighbor.id) return { ...s, sortOrder: current.sortOrder };
        return s;
      });
    });
  };

  const handleToggleCommitment = (id: string) => {
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  const handleAddCommitment = (commitment: Commitment) => {
    setCommitments((prev) => [...prev, commitment]);
    logActivity(`Reservaste "${commitment.title}".`, commitment.spaceName);
  };

  const handleAddEvolutionPoint = (point: EvolutionPoint) => {
    setEvolution((prev) => [...prev, point]);
    logActivity('Registraste un nuevo momento en Mi evolución.', 'Bienestar');
  };

  const handleAddMovement = (movement: FinanceMovement) => {
    setMovements((prev) => [movement, ...prev]);
    logActivity(`Registraste "${movement.concept}".`, 'Finanzas');
  };

  const handleAddLibraryEntry = (entry: LibraryEntry) => {
    setLibrary((prev) => [entry, ...prev]);
    logActivity(`Guardaste "${entry.title}" en Mi biblioteca.`, entry.spaceName);
  };

  const handleDeleteLibraryEntry = (id: string) => {
    setLibrary((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAskAi = (prompt: string) => {
    setAiInitialPrompt(prompt);
    setAiOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-[#F7F8F7] text-[#172121]">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        userName={preferences.name}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          activeSection={activeSection}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAi={() => setAiOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-8 py-7 sm:py-8 max-w-[1260px] w-full mx-auto pb-24">
          {activeSection === 'inicio' && (
            <HomeView
              preferences={preferences}
              energy={energy}
              onUpdateEnergy={handleUpdateEnergy}
              hasWellbeingCheckIn={hasWellbeingCheckIn}
              onOpenAdaptivePlanning={() => openAdaptiveModal('day')}
              reorganizationNotice={reorganizationNotice}
              intentions={intentions}
              onToggleIntention={handleToggleIntention}
              onAddIntention={handleAddIntention}
              spaces={spaces}
              commitments={commitments}
              recentActivity={activity}
              balanceInput={balanceInput}
              onNavigate={setActiveSection}
              onAskAi={handleAskAi}
            />
          )}

          {activeSection === 'espacios' && (
            <SpacesView
              spaces={spaces}
              intentions={intentions}
              commitments={commitments}
              library={library}
              movements={movements}
              activity={activity}
              onUpdateSpace={handleUpdateSpace}
              onAddSpace={handleAddSpace}
              onArchiveSpace={handleArchiveSpace}
              onDeleteSpace={handleDeleteSpace}
              onMoveSpace={handleMoveSpace}
              onNavigate={setActiveSection}
            />
          )}

          {activeSection === 'planificacion' && (
            <PlanningView
              commitments={commitments}
              spaces={spaces}
              onToggleCommitment={handleToggleCommitment}
              onAddCommitment={handleAddCommitment}
              onOpenAdaptiveWeek={() => openAdaptiveModal('week')}
              onOpenAdaptiveDay={() => openAdaptiveModal('day')}
            />
          )}

          {activeSection === 'evolucion' && (
            <EvolutionView points={evolution} onAddPoint={handleAddEvolutionPoint} />
          )}

          {activeSection === 'finanzas' && (
            <FinancesView
              categories={INITIAL_FINANCE_CATEGORIES}
              movements={movements}
              spaces={spaces}
              currency={preferences.currency}
              onAddMovement={handleAddMovement}
            />
          )}

          {activeSection === 'biblioteca' && (
            <LibraryView
              entries={library}
              spaces={spaces}
              onAddEntry={handleAddLibraryEntry}
              onDeleteEntry={handleDeleteLibraryEntry}
            />
          )}

          {activeSection === 'configuracion' && (
            <SettingsView
              preferences={preferences}
              onSavePreferences={setPreferences}
            />
          )}
        </main>
      </div>

      <AiAssistantDrawer
        open={aiOpen}
        onToggle={() => setAiOpen((prev) => !prev)}
        onClose={() => setAiOpen(false)}
        activeSection={activeSection}
        preferences={preferences}
        energy={energy}
        initialPrompt={aiInitialPrompt}
        onClearInitialPrompt={() => setAiInitialPrompt(null)}
        onOpenAdaptivePlanning={openAdaptiveModal}
        onQuickAddIntention={handleAddIntention}
      />

      <AdaptivePlanningModal
        open={adaptiveOpen}
        scope={adaptiveScope}
        onClose={() => setAdaptiveOpen(false)}
        context={adaptiveContext}
        onApplyReorganization={handleApplyReorganization}
      />
    </div>
  );
}
