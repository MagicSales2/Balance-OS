import React, { useState } from 'react';
import { BookOpen, Plus, Search, Trash2 } from 'lucide-react';
import { LibraryCategory, LibraryEntry, LifeSpace } from '../../types/balance';
import { Modal } from '../ui/Modal';

interface LibraryViewProps {
  entries: LibraryEntry[];
  spaces: LifeSpace[];
  onAddEntry: (entry: LibraryEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const CATEGORIES: Array<'Todas' | LibraryCategory> = [
  'Todas',
  'Idea',
  'Nota',
  'Reflexión',
  'Recurso',
];

export function LibraryView({
  entries,
  spaces,
  onAddEntry,
  onDeleteEntry,
}: LibraryViewProps) {
  const [activeCategory, setActiveCategory] = useState<'Todas' | LibraryCategory>('Todas');
  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<LibraryEntry | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LibraryCategory>('Idea');
  const [spaceName, setSpaceName] = useState(spaces[0]?.name ?? 'Desarrollo personal');
  const [content, setContent] = useState('');
  const [showSpacePicker, setShowSpacePicker] = useState(false);

  const filtered = entries.filter((item) => {
    const matchesCat = activeCategory === 'Todas' || item.category === activeCategory;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.spaceName.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddEntry({
      id: `lib-${Date.now()}`,
      title: title.trim(),
      category,
      spaceName,
      updatedAt: '18 nov 2026',
      content: content.trim(),
    });

    setTitle('');
    setContent('');
    setShowSpacePicker(false);
    setCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E5EAE8]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#172121]">
            Mi biblioteca
          </h1>
          <p className="text-sm text-[#52605E] mt-1">
            Ideas, notas, reflexiones y recursos personales
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#135D66] text-white text-xs font-medium hover:bg-[#0E4950] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva nota</span>
        </button>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-white border border-[#E5EAE8] rounded-xl w-fit">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#ECF4F5] text-[#135D66]'
                  : 'text-[#52605E] hover:text-[#172121]'
              }`}
            >
              {cat === 'Todas' ? 'Todas' : `${cat}s`.replace('Reflexións', 'Reflexiones')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#768482] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar en tu biblioteca..."
            className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-[#E5EAE8] rounded-xl text-[#172121] placeholder:text-[#768482] focus:outline-none focus:border-[#135D66]"
          />
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E5EAE8] rounded-2xl p-12 text-center space-y-3">
          <div className="w-11 h-11 rounded-2xl bg-[#F3F1F8] text-[#7D71A8] flex items-center justify-center mx-auto">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-base font-medium text-[#172121]">
            No encontramos registros con ese filtro
          </p>
          <p className="text-sm text-[#52605E] max-w-md mx-auto">
            Prueba limpiando la búsqueda o guarda una nueva idea, nota o reflexión personal.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {(search || activeCategory !== 'Todas') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setActiveCategory('Todas');
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#F2F5F4] text-[#4E5D5B] hover:text-[#172121] cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-[#135D66] text-white hover:bg-[#0E4950] cursor-pointer"
            >
              Crear nota
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((entry) => (
            <article
              key={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className="bg-white border border-[#E5EAE8] hover:border-[#C9D5D2] rounded-2xl p-6 flex flex-col justify-between gap-4 transition-colors cursor-pointer"
            >
              <div className="space-y-2.5">
                <p className="text-xs text-[#768482]">
                  {entry.category} · {entry.spaceName}
                </p>
                <h2 className="text-base font-semibold text-[#172121] leading-snug">
                  {entry.title}
                </h2>
                <p className="text-sm text-[#4E5D5B] leading-relaxed line-clamp-3">
                  {entry.content}
                </p>
              </div>

              <p className="text-xs text-[#768482] pt-3 border-t border-[#EFF2F1]">
                Actualizado el {entry.updatedAt}
              </p>
            </article>
          ))}
        </div>
      )}

      {/* Modal: Leer / Eliminar */}
      <Modal
        open={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        title={selectedEntry?.title ?? ''}
        subtitle={
          selectedEntry
            ? `${selectedEntry.category} · ${selectedEntry.spaceName} · ${selectedEntry.updatedAt}`
            : ''
        }
      >
        {selectedEntry && (
          <div className="space-y-6">
            <p className="text-[15px] leading-relaxed text-[#172121] whitespace-pre-line">
              {selectedEntry.content}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-[#EFF2F1]">
              <button
                type="button"
                onClick={() => {
                  onDeleteEntry(selectedEntry.id);
                  setSelectedEntry(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#8C4A4A] hover:bg-[#FAF1F1] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar nota</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#ECF4F5] text-[#135D66] hover:bg-[#DFEEF0] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Nueva entrada */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nueva nota"
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {(['Idea', 'Nota', 'Reflexión', 'Recurso'] as LibraryCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-[#ECF4F5] text-[#135D66]'
                    : 'bg-[#F7F8F7] text-[#52605E] hover:text-[#172121]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título breve..."
            className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
          />

          <textarea
            rows={4}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe aquí tu idea o nota..."
            className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
          />

          <button
            type="button"
            onClick={() => setShowSpacePicker((v) => !v)}
            className="text-xs text-[#135D66] hover:underline cursor-pointer"
          >
            {showSpacePicker ? 'Ocultar espacio' : `+ Asociar a espacio (${spaceName})`}
          </button>

          {showSpacePicker && (
            <select
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-[#E5EAE8] rounded-xl bg-white text-[#172121] focus:outline-none focus:border-[#135D66]"
            >
              {spaces.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-3.5 py-2 text-xs font-medium text-[#52605E] hover:text-[#172121] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-[#135D66] text-white rounded-xl hover:bg-[#0E4950] transition-colors cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
