import React, { useMemo, useState } from 'react';
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Edit3,
  Plus,
  SlidersHorizontal,
  Target,
  Trash2,
} from 'lucide-react';
import {
  AccentTone,
  ActivityEntry,
  Commitment,
  DailyIntention,
  FinanceMovement,
  LibraryEntry,
  LifeSpace,
  NavSection,
  SpaceIconName,
  SpaceRhythm,
} from '../../types/balance';
import { Modal } from '../ui/Modal';
import {
  SPACE_ICON_OPTIONS,
  SpaceIcon,
  TONE_OPTIONS,
  TONE_STYLES,
} from '../ui/SpaceIcon';

interface SpacesViewProps {
  spaces: LifeSpace[];
  intentions: DailyIntention[];
  commitments: Commitment[];
  library: LibraryEntry[];
  movements: FinanceMovement[];
  activity: ActivityEntry[];
  onUpdateSpace: (updated: LifeSpace) => void;
  onAddSpace: (space: LifeSpace) => void;
  onArchiveSpace: (id: string, archived: boolean) => void;
  onDeleteSpace: (id: string) => void;
  onMoveSpace: (id: string, direction: 'prev' | 'next') => void;
  onNavigate: (section: NavSection) => void;
}

const RHYTHM_FILTERS: Array<'Todos' | SpaceRhythm> = [
  'Todos',
  'En foco',
  'Activo',
  'En calma',
  'En pausa consciente',
];

export function SpacesView({
  spaces,
  intentions,
  commitments,
  library,
  movements,
  activity,
  onUpdateSpace,
  onAddSpace,
  onArchiveSpace,
  onDeleteSpace,
  onMoveSpace,
  onNavigate,
}: SpacesViewProps) {
  const [customizeMode, setCustomizeMode] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [filterRhythm, setFilterRhythm] = useState<'Todos' | SpaceRhythm>('Todos');

  const [inspectingSpaceId, setInspectingSpaceId] = useState<string | null>(null);
  const [editingSpace, setEditingSpace] = useState<LifeSpace | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [creatingOpen, setCreatingOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIntention, setNewIntention] = useState('');
  const [newRhythm, setNewRhythm] = useState<SpaceRhythm>('En calma');
  const [newTone, setNewTone] = useState<AccentTone>('sage');
  const [newIcon, setNewIcon] = useState<SpaceIconName>('Sprout');
  const [newObjectiveInput, setNewObjectiveInput] = useState('');

  const [newObjectiveInDetail, setNewObjectiveInDetail] = useState('');

  const sortedSpaces = useMemo(
    () => [...spaces].sort((a, b) => a.sortOrder - b.sortOrder),
    [spaces]
  );

  const activeSpaces = useMemo(
    () => sortedSpaces.filter((s) => !s.archived),
    [sortedSpaces]
  );

  const archivedSpaces = useMemo(
    () => sortedSpaces.filter((s) => s.archived),
    [sortedSpaces]
  );

  const displayedSpaces = useMemo(() => {
    const base = showArchived ? archivedSpaces : activeSpaces;
    if (filterRhythm === 'Todos') return base;
    return base.filter((s) => s.rhythm === filterRhythm);
  }, [showArchived, archivedSpaces, activeSpaces, filterRhythm]);

  const inspectingSpace = useMemo(
    () => spaces.find((s) => s.id === inspectingSpaceId) ?? null,
    [spaces, inspectingSpaceId]
  );

  const getSpaceRelations = (space: LifeSpace) => {
    const spaceIntentions = intentions.filter(
      (i) => i.spaceId === space.id || i.spaceName === space.name
    );
    const spaceCommitments = commitments.filter(
      (c) => c.spaceId === space.id || c.spaceName === space.name
    );
    const spaceNotes = library.filter((n) => n.spaceName === space.name);
    const spaceMovements = movements.filter((m) => m.spaceName === space.name);
    const spaceActivity = activity.filter((a) => a.spaceName === space.name);

    return {
      activitiesCount: spaceIntentions.length + spaceCommitments.length,
      notesCount: spaceNotes.length,
      objectivesCount: space.objectives.length,
      recordsCount: spaceMovements.length + spaceActivity.length,
      spaceIntentions,
      spaceCommitments,
      spaceNotes,
      spaceMovements,
      spaceActivity,
    };
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpace || !editingSpace.name.trim()) return;
    onUpdateSpace({
      ...editingSpace,
      name: editingSpace.name.trim(),
      intention: editingSpace.intention.trim(),
    });
    setEditingSpace(null);
    setConfirmDeleteId(null);
  };

  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const maxOrder = spaces.reduce((max, s) => Math.max(max, s.sortOrder), -1);
    onAddSpace({
      id: `space-${Date.now()}`,
      slug: newName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
      name: newName.trim(),
      intention:
        newIntention.trim() ||
        'Una dimensión personal pensada para cuidar lo que es importante para ti.',
      rhythm: newRhythm,
      tone: newTone,
      iconName: newIcon,
      objectives: newObjectiveInput.trim() ? [newObjectiveInput.trim()] : [],
      activeNotes: 0,
      weeklyFocusShare: 5,
      visible: true,
      archived: false,
      sortOrder: maxOrder + 1,
    });
    setNewName('');
    setNewIntention('');
    setNewRhythm('En calma');
    setNewTone('sage');
    setNewIcon('Sprout');
    setNewObjectiveInput('');
    setCreatingOpen(false);
  };

  const handleAddObjectiveInDetail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingSpace || !newObjectiveInDetail.trim()) return;
    onUpdateSpace({
      ...inspectingSpace,
      objectives: [...inspectingSpace.objectives, newObjectiveInDetail.trim()],
    });
    setNewObjectiveInDetail('');
  };

  const handleRemoveObjective = (space: LifeSpace, idx: number) => {
    onUpdateSpace({
      ...space,
      objectives: space.objectives.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-6 border-b border-[#E5EAE8]">
        <div className="space-y-1.5 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#172121]">
            Mis espacios
          </h1>
          <p className="text-sm leading-relaxed text-[#4E5D5B]">
            Siete dimensiones iniciales para mirar tu vida de forma integral. Puedes renombrarlas, cambiar sus iconos y colores, reorganizar su orden o crear espacios propios a tu medida.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setCustomizeMode((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              customizeMode
                ? 'bg-[#ECF4F5] border-[#135D66]/30 text-[#135D66]'
                : 'bg-white border-[#E5EAE8] text-[#4E5D5B] hover:text-[#172121] hover:border-[#CBD5D3]'
            }`}
          >
            {customizeMode ? (
              <>
                <Check className="w-4 h-4" />
                <span>Listo de personalizar</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-4 h-4" />
                <span>Personalizar mis espacios</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCreatingOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#135D66] text-white text-sm font-medium hover:bg-[#0E4950] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear espacio</span>
          </button>
        </div>
      </div>

      {/* Customization Helper Banner when active */}
      {customizeMode && (
        <div className="bg-[#ECF4F5]/70 border border-[#135D66]/20 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[#135D66]">
            Modo personalización activo: usa las flechas en cada tarjeta para cambiar el orden, edita nombre, icono, color y descripción, o archiva los espacios que ahora no necesites.
          </p>
          <button
            type="button"
            onClick={() => setCustomizeMode(false)}
            className="text-xs font-medium text-[#135D66] hover:underline whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
          >
            Finalizar orden
          </button>
        </div>
      )}

      {/* Filter Bar: Active vs Archived + Rhythm */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-[#E5EAE8] rounded-xl w-fit max-w-full">
          {RHYTHM_FILTERS.map((rhythm) => {
            const active = filterRhythm === rhythm;
            return (
              <button
                key={rhythm}
                type="button"
                onClick={() => setFilterRhythm(rhythm)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#ECF4F5] text-[#135D66]'
                    : 'text-[#52605E] hover:text-[#172121] hover:bg-[#F7F8F7]'
                }`}
              >
                {rhythm}
              </button>
            );
          })}
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-white border border-[#E5EAE8] rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setShowArchived(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              !showArchived
                ? 'bg-[#F2F5F4] text-[#172121]'
                : 'text-[#52605E] hover:text-[#172121]'
            }`}
          >
            Activos ({activeSpaces.length})
          </button>
          <button
            type="button"
            onClick={() => setShowArchived(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              showArchived
                ? 'bg-[#F2F5F4] text-[#172121]'
                : 'text-[#52605E] hover:text-[#172121]'
            }`}
          >
            Archivados ({archivedSpaces.length})
          </button>
        </div>
      </div>

      {/* Spaces Grid */}
      {displayedSpaces.length === 0 ? (
        <div className="bg-white border border-[#E5EAE8] rounded-2xl p-12 text-center space-y-3">
          <p className="text-base font-medium text-[#172121]">
            {showArchived
              ? 'No tienes espacios archivados'
              : `No hay espacios activos en el ritmo “${filterRhythm}”`}
          </p>
          <p className="text-sm text-[#52605E] max-w-md mx-auto">
            {showArchived
              ? 'Cuando archives un espacio que ya no necesites ver en tu día a día, aparecerá aquí por si deseas recuperarlo.'
              : 'Prueba mostrando todos los espacios o crea uno nuevo adaptado a tu momento actual.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {showArchived ? (
              <button
                type="button"
                onClick={() => setShowArchived(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#ECF4F5] text-[#135D66] hover:bg-[#DFEEF0] transition-colors cursor-pointer"
              >
                Volver a espacios activos
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFilterRhythm('Todos')}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#ECF4F5] text-[#135D66] hover:bg-[#DFEEF0] transition-colors cursor-pointer"
              >
                Mostrar todos los espacios
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayedSpaces.map((space, idx) => {
            const tone = TONE_STYLES[space.tone];
            const rel = getSpaceRelations(space);
            const isFirst = idx === 0;
            const isLast = idx === displayedSpaces.length - 1;

            return (
              <article
                key={space.id}
                className="bg-white border border-[#E5EAE8] hover:border-[#CFD9D6] rounded-2xl p-6 flex flex-col justify-between gap-5 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tone.iconBg} ${tone.iconText}`}
                      >
                        <SpaceIcon name={space.iconName} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-[#172121] truncate">
                          {space.name}
                        </h2>
                        <p className="text-xs text-[#768482]">{space.rhythm}</p>
                      </div>
                    </div>

                    {!customizeMode ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSpace(space);
                          setConfirmDeleteId(null);
                        }}
                        aria-label={`Editar ${space.name}`}
                        className="p-2 -mr-1.5 rounded-lg text-[#768482] hover:text-[#172121] hover:bg-[#F2F5F4] transition-colors cursor-pointer shrink-0"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => onMoveSpace(space.id, 'prev')}
                          aria-label={`Mover ${space.name} antes`}
                          className="p-1.5 rounded-lg border border-[#E5EAE8] text-[#4E5D5B] hover:text-[#172121] hover:bg-[#F2F5F4] disabled:opacity-35 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => onMoveSpace(space.id, 'next')}
                          aria-label={`Mover ${space.name} después`}
                          className="p-1.5 rounded-lg border border-[#E5EAE8] text-[#4E5D5B] hover:text-[#172121] hover:bg-[#F2F5F4] disabled:opacity-35 cursor-pointer"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-[#4E5D5B]">
                    {space.intention}
                  </p>
                </div>

                {/* Footer: counts + access or customize actions */}
                <div className="pt-4 border-t border-[#EFF2F1] space-y-3">
                  <p className="text-xs text-[#768482] tabular-nums">
                    {rel.activitiesCount} actividades · {rel.notesCount} notas ·{' '}
                    {rel.objectivesCount} objetivos
                  </p>

                  {customizeMode ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSpace(space);
                          setConfirmDeleteId(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F7F8F7] text-[#172121] hover:bg-[#ECF4F5] hover:text-[#135D66] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onArchiveSpace(space.id, !space.archived)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#52605E] hover:text-[#172121] hover:bg-[#F2F5F4] transition-colors cursor-pointer"
                        >
                          {space.archived ? (
                            <>
                              <ArchiveRestore className="w-3.5 h-3.5" />
                              <span>Restaurar</span>
                            </>
                          ) : (
                            <>
                              <Archive className="w-3.5 h-3.5" />
                              <span>Archivar</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingSpace(space);
                            setConfirmDeleteId(space.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#8C4A4A] hover:bg-[#FAF1F1] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectingSpaceId(space.id)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium hover:underline cursor-pointer ${tone.softText}`}
                      >
                        <span>Ver actividades, notas y objetivos</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {space.archived && (
                        <button
                          type="button"
                          onClick={() => onArchiveSpace(space.id, false)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#135D66] hover:underline cursor-pointer"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                          <span>Restaurar</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal: Explorar espacio (Actividades, notas, objetivos y registros) */}
      <Modal
        open={Boolean(inspectingSpace)}
        onClose={() => {
          setInspectingSpaceId(null);
          setNewObjectiveInDetail('');
        }}
        title={inspectingSpace ? inspectingSpace.name : ''}
        subtitle={inspectingSpace ? `${inspectingSpace.rhythm} · ${inspectingSpace.intention}` : ''}
        maxWidthClass="max-w-2xl"
      >
        {inspectingSpace && (() => {
          const rel = getSpaceRelations(inspectingSpace);
          const tone = TONE_STYLES[inspectingSpace.tone];

          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#EFF2F1]">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone.iconBg} ${tone.iconText}`}
                  >
                    <SpaceIcon name={inspectingSpace.iconName} className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-[#768482]">
                    {rel.activitiesCount} actividades · {rel.notesCount} notas ·{' '}
                    {rel.recordsCount} registros
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const target = inspectingSpace;
                    setInspectingSpaceId(null);
                    setEditingSpace(target);
                    setConfirmDeleteId(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#F7F8F7] text-[#172121] hover:bg-[#ECF4F5] hover:text-[#135D66] transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Personalizar espacio</span>
                </button>
              </div>

              {/* Objetivos */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#172121]">
                  <Target className="w-4 h-4 text-[#135D66]" />
                  <span>Objetivos e intenciones</span>
                </div>
                {inspectingSpace.objectives.length === 0 ? (
                  <p className="text-xs text-[#768482]">
                    Aún no hay objetivos definidos en este espacio.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {inspectingSpace.objectives.map((obj, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#F7F8F7] text-sm text-[#172121]"
                      >
                        <span>{obj}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveObjective(inspectingSpace, idx)}
                          aria-label="Quitar objetivo"
                          className="text-xs text-[#768482] hover:text-[#8C4A4A] cursor-pointer shrink-0"
                        >
                          Quitar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <form onSubmit={handleAddObjectiveInDetail} className="flex gap-2">
                  <input
                    type="text"
                    value={newObjectiveInDetail}
                    onChange={(e) => setNewObjectiveInDetail(e.target.value)}
                    placeholder="Añadir un nuevo objetivo personal..."
                    className="flex-1 px-3 py-2 text-xs bg-white border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl text-xs font-medium bg-[#ECF4F5] text-[#135D66] hover:bg-[#DFEEF0] transition-colors cursor-pointer shrink-0"
                  >
                    Añadir
                  </button>
                </form>
              </section>

              {/* Actividades y compromisos */}
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#172121]">
                    <CalendarDays className="w-4 h-4 text-[#5E8371]" />
                    <span>Actividades y compromisos</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setInspectingSpaceId(null);
                      onNavigate('planificacion');
                    }}
                    className="text-xs font-medium text-[#135D66] hover:underline cursor-pointer"
                  >
                    Ir a Planificación
                  </button>
                </div>

                {rel.activitiesCount === 0 ? (
                  <p className="text-xs text-[#768482] bg-[#FAFBFB] rounded-xl p-3.5">
                    Sin actividades programadas por ahora en este espacio.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {rel.spaceIntentions.map((item) => (
                      <div
                        key={item.id}
                        className="px-3.5 py-2.5 rounded-xl bg-[#FAFBFB] border border-[#EFF2F1] flex items-center justify-between gap-3 text-xs"
                      >
                        <span className={item.completed ? 'line-through text-[#768482]' : 'text-[#172121]'}>
                          {item.title}
                        </span>
                        <span className="font-mono text-[#768482] shrink-0">
                          {item.timeWindow}
                        </span>
                      </div>
                    ))}
                    {rel.spaceCommitments.map((com) => (
                      <div
                        key={com.id}
                        className="px-3.5 py-2.5 rounded-xl bg-[#FAFBFB] border border-[#EFF2F1] flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="text-[#172121]">{com.title}</span>
                        <span className="font-mono text-[#135D66] shrink-0">
                          {com.dateLabel} · {com.startTime}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Notas y registros relacionados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <section className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#172121]">
                      <BookOpen className="w-4 h-4 text-[#7D71A8]" />
                      <span>Notas en biblioteca</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setInspectingSpaceId(null);
                        onNavigate('biblioteca');
                      }}
                      className="text-xs font-medium text-[#135D66] hover:underline cursor-pointer"
                    >
                      Abrir
                    </button>
                  </div>
                  {rel.spaceNotes.length === 0 ? (
                    <p className="text-xs text-[#768482] bg-[#FAFBFB] rounded-xl p-3">
                      Aún no hay notas vinculadas.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {rel.spaceNotes.map((note) => (
                        <li
                          key={note.id}
                          className="text-xs text-[#4E5D5B] bg-[#FAFBFB] rounded-xl px-3 py-2"
                        >
                          <p className="font-medium text-[#172121]">{note.title}</p>
                          <p className="text-[11px] text-[#768482] mt-0.5">
                            {note.category} · {note.updatedAt}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="space-y-2.5">
                  <p className="text-sm font-semibold text-[#172121]">
                    Registros relacionados
                  </p>
                  {rel.recordsCount === 0 ? (
                    <p className="text-xs text-[#768482] bg-[#FAFBFB] rounded-xl p-3">
                      Sin registros recientes en este espacio.
                    </p>
                  ) : (
                    <ul className="space-y-1.5">
                      {rel.spaceMovements.map((mov) => (
                        <li
                          key={mov.id}
                          className="text-xs text-[#4E5D5B] bg-[#FAFBFB] rounded-xl px-3 py-2 flex items-center justify-between gap-2"
                        >
                          <span className="truncate">{mov.concept}</span>
                          <span className="font-mono text-[#172121] shrink-0">
                            {mov.type === 'ingreso' ? '+' : '−'}${mov.amount}
                          </span>
                        </li>
                      ))}
                      {rel.spaceActivity.map((act) => (
                        <li
                          key={act.id}
                          className="text-xs text-[#4E5D5B] bg-[#FAFBFB] rounded-xl px-3 py-2"
                        >
                          <p className="text-[#172121]">{act.description}</p>
                          <p className="text-[11px] text-[#768482] mt-0.5">{act.timeLabel}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Modal: Editar / Personalizar espacio */}
      <Modal
        open={Boolean(editingSpace)}
        onClose={() => {
          setEditingSpace(null);
          setConfirmDeleteId(null);
        }}
        title={editingSpace ? `Personalizar: ${editingSpace.name}` : ''}
        subtitle="Renombra, elige icono y color sutil, o archiva este espacio."
      >
        {editingSpace && (
          <form onSubmit={handleSaveEdit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#4E5D5B]">
                Nombre del espacio
              </label>
              <input
                type="text"
                required
                value={editingSpace.name}
                onChange={(e) => setEditingSpace({ ...editingSpace, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#4E5D5B]">
                Descripción breve
              </label>
              <textarea
                rows={3}
                value={editingSpace.intention}
                onChange={(e) =>
                  setEditingSpace({ ...editingSpace, intention: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
              />
            </div>

            {/* Selector visual de icono */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#4E5D5B]">
                Icono representativo
              </label>
              <div className="grid grid-cols-6 gap-2">
                {SPACE_ICON_OPTIONS.map((opt) => {
                  const selected = editingSpace.iconName === opt.name;
                  return (
                    <button
                      key={opt.name}
                      type="button"
                      title={opt.label}
                      aria-label={opt.label}
                      onClick={() =>
                        setEditingSpace({ ...editingSpace, iconName: opt.name })
                      }
                      className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                        selected
                          ? 'border-[#135D66] bg-[#ECF4F5] text-[#135D66]'
                          : 'border-[#E5EAE8] bg-white text-[#52605E] hover:text-[#172121]'
                      }`}
                    >
                      <SpaceIcon name={opt.name} className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector visual de color sutil */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#4E5D5B]">
                Color de identificación sutil
              </label>
              <div className="flex flex-wrap gap-2">
                {TONE_OPTIONS.map((toneKey) => {
                  const style = TONE_STYLES[toneKey];
                  const selected = editingSpace.tone === toneKey;
                  return (
                    <button
                      key={toneKey}
                      type="button"
                      onClick={() => setEditingSpace({ ...editingSpace, tone: toneKey })}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                        selected
                          ? 'border-[#135D66] bg-[#F7F8F7] text-[#172121]'
                          : 'border-[#E5EAE8] bg-white text-[#52605E] hover:text-[#172121]'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: style.swatch }}
                        aria-hidden="true"
                      />
                      <span>{style.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#4E5D5B]">Ritmo actual</label>
              <select
                value={editingSpace.rhythm}
                onChange={(e) =>
                  setEditingSpace({
                    ...editingSpace,
                    rhythm: e.target.value as SpaceRhythm,
                  })
                }
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] bg-white focus:outline-none focus:border-[#135D66]"
              >
                <option value="En foco">En foco</option>
                <option value="Activo">Activo</option>
                <option value="En calma">En calma</option>
                <option value="En pausa consciente">En pausa consciente</option>
              </select>
            </div>

            {/* Archive / Delete section */}
            <div className="pt-3 border-t border-[#EFF2F1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onArchiveSpace(editingSpace.id, !editingSpace.archived);
                    setEditingSpace(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#52605E] bg-[#F7F8F7] hover:text-[#172121] cursor-pointer"
                >
                  {editingSpace.archived ? (
                    <>
                      <ArchiveRestore className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archivar</span>
                    </>
                  )}
                </button>

                {confirmDeleteId === editingSpace.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteSpace(editingSpace.id);
                      setEditingSpace(null);
                      setConfirmDeleteId(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#8C4A4A] text-white cursor-pointer"
                  >
                    Confirmar eliminación
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(editingSpace.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#8C4A4A] hover:bg-[#FAF1F1] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSpace(null);
                    setConfirmDeleteId(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-[#52605E] hover:text-[#172121] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-[#135D66] text-white rounded-xl hover:bg-[#0E4950] transition-colors cursor-pointer"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Crear nuevo espacio */}
      <Modal
        open={creatingOpen}
        onClose={() => setCreatingOpen(false)}
        title="Crear nuevo espacio"
        subtitle="Añade una nueva dimensión de tu vida y personalízala a tu manera."
      >
        <form onSubmit={handleCreateSpace} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#4E5D5B]">Nombre</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Hogar y entorno, o Creatividad"
              className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#4E5D5B]">
              Descripción breve
            </label>
            <textarea
              rows={2}
              value={newIntention}
              onChange={(e) => setNewIntention(e.target.value)}
              placeholder="¿Qué representa este espacio en tu vida?"
              className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#4E5D5B]">Icono</label>
            <div className="grid grid-cols-6 gap-2">
              {SPACE_ICON_OPTIONS.map((opt) => {
                const selected = newIcon === opt.name;
                return (
                  <button
                    key={opt.name}
                    type="button"
                    title={opt.label}
                    aria-label={opt.label}
                    onClick={() => setNewIcon(opt.name)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#135D66] bg-[#ECF4F5] text-[#135D66]'
                        : 'border-[#E5EAE8] bg-white text-[#52605E] hover:text-[#172121]'
                    }`}
                  >
                    <SpaceIcon name={opt.name} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#4E5D5B]">
              Color de identificación
            </label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((toneKey) => {
                const style = TONE_STYLES[toneKey];
                const selected = newTone === toneKey;
                return (
                  <button
                    key={toneKey}
                    type="button"
                    onClick={() => setNewTone(toneKey)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#135D66] bg-[#F7F8F7] text-[#172121]'
                        : 'border-[#E5EAE8] bg-white text-[#52605E] hover:text-[#172121]'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: style.swatch }}
                      aria-hidden="true"
                    />
                    <span>{style.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#4E5D5B]">Ritmo inicial</label>
              <select
                value={newRhythm}
                onChange={(e) => setNewRhythm(e.target.value as SpaceRhythm)}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl bg-white text-[#172121] focus:outline-none focus:border-[#135D66]"
              >
                <option value="En foco">En foco</option>
                <option value="Activo">Activo</option>
                <option value="En calma">En calma</option>
                <option value="En pausa consciente">En pausa consciente</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#4E5D5B]">
                Primer objetivo (opcional)
              </label>
              <input
                type="text"
                value={newObjectiveInput}
                onChange={(e) => setNewObjectiveInput(e.target.value)}
                placeholder="Ej. Dedicar 1 hora los sábados"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreatingOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[#52605E] hover:text-[#172121] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-[#135D66] text-white rounded-xl hover:bg-[#0E4950] transition-colors cursor-pointer"
            >
              Crear espacio
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
