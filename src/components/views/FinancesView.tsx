import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  FinanceCategory,
  FinanceMovement,
  LifeSpace,
  UserPreferences,
} from '../../types/balance';
import { Modal } from '../ui/Modal';
import { TONE_STYLES } from '../ui/SpaceIcon';

interface FinancesViewProps {
  categories: FinanceCategory[];
  movements: FinanceMovement[];
  spaces: LifeSpace[];
  currency: UserPreferences['currency'];
  onAddMovement: (movement: FinanceMovement) => void;
}

function formatMoney(amount: number, currency: UserPreferences['currency']): string {
  const multiplier = currency === 'COP' ? 4000 : 1;
  const val = amount * multiplier;
  if (currency === 'EUR') {
    return `${val.toLocaleString('es-ES')} €`;
  }
  if (currency === 'COP') {
    return `$${val.toLocaleString('es-CO')} COP`;
  }
  return `$${val.toLocaleString('es-ES')}`;
}

export function FinancesView({
  categories,
  movements,
  spaces,
  currency,
  onAddMovement,
}: FinancesViewProps) {
  const [filterType, setFilterType] = useState<'todos' | 'ingreso' | 'gasto'>('todos');
  const [modalOpen, setModalOpen] = useState(false);

  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'ingreso' | 'gasto'>('gasto');
  const [category, setCategory] = useState(categories[0]?.name ?? 'Alimentación y bienestar');
  const [spaceName, setSpaceName] = useState(spaces[0]?.name ?? 'Finanzas');

  const totalIncome = movements
    .filter((m) => m.type === 'ingreso')
    .reduce((acc, m) => acc + m.amount, 0);
  const totalExpenses = movements
    .filter((m) => m.type === 'gasto')
    .reduce((acc, m) => acc + m.amount, 0);
  const monthlyBalance = totalIncome - totalExpenses;

  const filteredMovements =
    filterType === 'todos' ? movements : movements.filter((m) => m.type === filterType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(amount);
    if (!concept.trim() || Number.isNaN(numeric) || numeric <= 0) return;

    onAddMovement({
      id: `fm-${Date.now()}`,
      concept: concept.trim(),
      category: type === 'ingreso' ? 'Ingresos' : category,
      date: '18 nov',
      amount: Math.round(numeric),
      type,
      spaceName,
    });

    setConcept('');
    setAmount('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5EAE8]">
        <div className="space-y-1.5 max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#172121]">
            Finanzas
          </h1>
          <p className="text-sm text-[#4E5D5B]">
            Claridad mensual sobre tus ingresos, gastos y tranquilidad financiera. Noviembre 2026 (datos ficticios de demostración).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#135D66] text-white text-sm font-medium hover:bg-[#0E4950] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar movimiento</span>
        </button>
      </div>

      {/* Summary cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#E5EAE8] rounded-2xl p-6">
          <p className="text-xs text-[#768482]">Ingresos del mes</p>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold text-[#5E8371] tabular-nums font-mono">
            {formatMoney(totalIncome, currency)}
          </p>
          <p className="mt-1.5 text-xs text-[#52605E]">
            {movements.filter((m) => m.type === 'ingreso').length} entradas registradas
          </p>
        </div>

        <div className="bg-white border border-[#E5EAE8] rounded-2xl p-6">
          <p className="text-xs text-[#768482]">Gastos y ahorro asignado</p>
          <p className="mt-2 text-2xl sm:text-3xl font-semibold text-[#172121] tabular-nums font-mono">
            {formatMoney(totalExpenses, currency)}
          </p>
          <p className="mt-1.5 text-xs text-[#52605E]">
            Incluye transferencia a fondo de tranquilidad
          </p>
        </div>

        <div className="bg-white border border-[#E5EAE8] rounded-2xl p-6">
          <p className="text-xs text-[#768482]">Balance mensual disponible</p>
          <p
            className={`mt-2 text-2xl sm:text-3xl font-semibold tabular-nums font-mono ${
              monthlyBalance >= 0 ? 'text-[#135D66]' : 'text-[#9F4A4A]'
            }`}
          >
            {monthlyBalance >= 0 ? '+' : ''}
            {formatMoney(monthlyBalance, currency)}
          </p>
          <p className="mt-1.5 text-xs text-[#52605E]">
            Margen libre para imprevistos o disfrute
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Category breakdown */}
        <section className="xl:col-span-5 bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-[#172121]">Distribución por áreas</h2>
            <p className="text-xs text-[#768482] mt-0.5">
              Ejecutado frente a lo previsto para este mes
            </p>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => {
              const pct = Math.min(Math.round((cat.spent / cat.planned) * 100), 100);
              const tone = TONE_STYLES[cat.tone];
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-medium text-[#172121]">{cat.name}</span>
                    <span className="font-mono text-[#52605E] tabular-nums">
                      {formatMoney(cat.spent, currency)} / {formatMoney(cat.planned, currency)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F2F5F4] overflow-hidden">
                    <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Movements list */}
        <section className="xl:col-span-7 bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#172121]">Movimientos recientes</h2>
              <p className="text-xs text-[#768482] mt-0.5">
                Registro claro conectado con tus espacios
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#F7F8F7] border border-[#E5EAE8] rounded-xl w-fit">
              {(['todos', 'ingreso', 'gasto'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterType(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                    filterType === tab
                      ? 'bg-white text-[#135D66] shadow-xs'
                      : 'text-[#52605E] hover:text-[#172121]'
                  }`}
                >
                  {tab === 'todos' ? 'Todos' : tab === 'ingreso' ? 'Ingresos' : 'Gastos'}
                </button>
              ))}
            </div>
          </div>

          {filteredMovements.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-medium text-[#172121]">
                No hay movimientos en esta categoría
              </p>
              <p className="text-xs text-[#768482]">
                Registra un movimiento de demostración para visualizarlo aquí.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EFF2F1]">
              {filteredMovements.map((mov) => (
                <div
                  key={mov.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#172121] truncate">{mov.concept}</p>
                    <p className="text-xs text-[#768482] mt-0.5">
                      {mov.category} · {mov.spaceName} · {mov.date}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-sm font-medium tabular-nums shrink-0 ${
                      mov.type === 'ingreso' ? 'text-[#5E8371]' : 'text-[#172121]'
                    }`}
                  >
                    {mov.type === 'ingreso' ? '+' : '−'}
                    {formatMoney(mov.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal: Registrar movimiento */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Registrar movimiento de demostración"
        subtitle="Añade un ingreso o gasto ficticio para probar el balance mensual."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F7F8F7] rounded-xl border border-[#E5EAE8]">
            <button
              type="button"
              onClick={() => setType('gasto')}
              className={`py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                type === 'gasto' ? 'bg-white text-[#172121] shadow-xs' : 'text-[#52605E]'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('ingreso')}
              className={`py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                type === 'ingreso' ? 'bg-white text-[#5E8371] shadow-xs' : 'text-[#52605E]'
              }`}
            >
              Ingreso
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#4E5D5B]">Concepto</label>
            <input
              type="text"
              required
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej. Cena tranquila o proyecto freelance"
              className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#4E5D5B]">
                Monto base ({currency === 'COP' ? 'en miles de USD eq.' : currency})
              </label>
              <input
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="120"
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#4E5D5B]">Espacio</label>
              <select
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl bg-white text-[#172121] focus:outline-none focus:border-[#135D66]"
              >
                {spaces.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {type === 'gasto' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#4E5D5B]">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl bg-white text-[#172121] focus:outline-none focus:border-[#135D66]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[#52605E] hover:text-[#172121] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-[#135D66] text-white rounded-xl hover:bg-[#0E4950] transition-colors cursor-pointer"
            >
              Guardar movimiento
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
