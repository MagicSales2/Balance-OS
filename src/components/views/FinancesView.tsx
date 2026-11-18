import React, { useMemo, useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
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
  if (currency === 'EUR') {
    return `${amount.toLocaleString('es-ES')} €`;
  }
  if (currency === 'COP') {
    return `$${amount.toLocaleString('es-CO')} COP`;
  }
  return `$${amount.toLocaleString('es-ES')}`;
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
  const [showDetails, setShowDetails] = useState(false);
  const [category, setCategory] = useState(categories[0]?.name ?? 'Operación Magia Pastelera');
  const [spaceName, setSpaceName] = useState(spaces[4]?.name ?? 'Finanzas');

  const totalIncome = movements
    .filter((m) => m.type === 'ingreso')
    .reduce((acc, m) => acc + m.amount, 0);
  const totalExpenses = movements
    .filter((m) => m.type === 'gasto')
    .reduce((acc, m) => acc + m.amount, 0);
  const monthlyBalance = totalIncome - totalExpenses;

  const computedCategories = useMemo(() => {
    return categories.map((cat) => {
      const dynamicSpent = movements
        .filter((m) => m.type === 'gasto' && m.category === cat.name)
        .reduce((sum, m) => sum + m.amount, 0);
      return {
        ...cat,
        spent: cat.spent + dynamicSpent,
      };
    });
  }, [categories, movements]);

  const hasAnyCategoryActivity = computedCategories.some(
    (c) => c.spent > 0 || c.planned > 0
  );

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
      date: 'Hoy',
      amount: Math.round(numeric),
      type,
      spaceName,
    });

    setConcept('');
    setAmount('');
    setShowDetails(false);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E5EAE8]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#172121]">
            Finanzas
          </h1>
          <p className="text-sm text-[#52605E] mt-1">
            Noviembre 2026 · Moneda {currency}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#135D66] text-white text-xs font-medium hover:bg-[#0E4950] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar movimiento</span>
        </button>
      </div>

      {/* Summary cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5EAE8] rounded-2xl p-5">
          <p className="text-xs text-[#768482]">Ingresos</p>
          <p className="mt-1.5 text-2xl font-semibold text-[#5E8371] tabular-nums font-mono">
            {formatMoney(totalIncome, currency)}
          </p>
        </div>

        <div className="bg-white border border-[#E5EAE8] rounded-2xl p-5">
          <p className="text-xs text-[#768482]">Gastos e inversión</p>
          <p className="mt-1.5 text-2xl font-semibold text-[#172121] tabular-nums font-mono">
            {formatMoney(totalExpenses, currency)}
          </p>
        </div>

        <div className="bg-white border border-[#E5EAE8] rounded-2xl p-5">
          <p className="text-xs text-[#768482]">Balance</p>
          <p
            className={`mt-1.5 text-2xl font-semibold tabular-nums font-mono ${
              monthlyBalance >= 0 ? 'text-[#135D66]' : 'text-[#9F4A4A]'
            }`}
          >
            {monthlyBalance > 0 ? '+' : ''}
            {formatMoney(monthlyBalance, currency)}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Category breakdown */}
        <section className="xl:col-span-5 bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-semibold text-[#172121]">Áreas de seguimiento</h2>

          {!hasAnyCategoryActivity ? (
            <div className="space-y-3">
              <p className="text-xs text-[#768482]">
                Aún no hay gastos ni presupuestos registrados. Categorías listas para usar:
              </p>
              <ul className="divide-y divide-[#EFF2F1]">
                {computedCategories.map((cat) => {
                  const tone = TONE_STYLES[cat.tone];
                  return (
                    <li key={cat.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-2 font-medium text-[#172121]">
                        <span className={`w-2 h-2 rounded-full ${tone.bar}`} aria-hidden="true" />
                        <span>{cat.name}</span>
                      </span>
                      <span className="font-mono text-[#768482] tabular-nums">
                        {formatMoney(0, currency)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              {computedCategories.map((cat) => {
                const denom = cat.planned > 0 ? cat.planned : Math.max(totalExpenses, cat.spent, 1);
                const pct = Math.min(Math.round((cat.spent / denom) * 100), 100);
                const tone = TONE_STYLES[cat.tone];
                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-medium text-[#172121]">{cat.name}</span>
                      <span className="font-mono text-[#52605E] tabular-nums">
                        {formatMoney(cat.spent, currency)}
                        {cat.planned > 0 ? ` / ${formatMoney(cat.planned, currency)}` : ''}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#F2F5F4] overflow-hidden">
                      <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Movements list */}
        <section className="xl:col-span-7 bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#172121]">Movimientos recientes</h2>

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
            <div className="py-10 text-center space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ECF4F5] text-[#135D66] flex items-center justify-center mx-auto">
                <Wallet className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-[#172121]">
                Aún no hay movimientos registrados
              </p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-[#ECF4F5] text-[#135D66] hover:bg-[#DFEEF0] cursor-pointer"
              >
                Registrar primer movimiento
              </button>
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
        title="Registrar movimiento"
        maxWidthClass="max-w-md"
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

          <input
            type="text"
            required
            autoFocus
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Concepto (ej. Venta Amor Perfecto o pauta Meta Ads)"
            className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
          />

          <input
            type="number"
            min={1}
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Monto en ${currency} (ej. 95000)`}
            className="w-full px-3.5 py-2.5 text-sm border border-[#E5EAE8] rounded-xl text-[#172121] focus:outline-none focus:border-[#135D66]"
          />

          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="text-xs text-[#135D66] hover:underline cursor-pointer"
          >
            {showDetails ? 'Ocultar detalles' : '+ Espacio y categoría'}
          </button>

          {showDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              {type === 'gasto' && (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E5EAE8] rounded-xl bg-white text-[#172121] focus:outline-none focus:border-[#135D66]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
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
