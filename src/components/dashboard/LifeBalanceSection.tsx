import React, { useMemo, useState } from 'react';
import { LifeBalanceDimension, LifeBalancePeriod } from '../../types/balance';
import {
  buildLifeBalanceSnapshot,
  extractBalanceHighlights,
  LiveBalanceInput,
  SIGNAL_LABELS,
} from '../../utils/lifeBalance';

const PERIOD_OPTIONS: { id: LifeBalancePeriod; label: string }[] = [
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'trimestre', label: 'Últimos 3 meses' },
];

interface LifeBalanceSectionProps {
  balanceInput: LiveBalanceInput;
}

export function LifeBalanceSection({ balanceInput }: LifeBalanceSectionProps) {
  const [period, setPeriod] = useState<LifeBalancePeriod>('semana');
  const [selectedDimensionId, setSelectedDimensionId] = useState<string | null>(null);

  const snapshot = useMemo(
    () => buildLifeBalanceSnapshot(period, balanceInput),
    [period, balanceInput]
  );
  const { higherAttention, needsMoreSpace } = useMemo(
    () => extractBalanceHighlights(snapshot.dimensions),
    [snapshot.dimensions]
  );

  const activeDimension: LifeBalanceDimension | null = useMemo(() => {
    if (!selectedDimensionId) return null;
    return snapshot.dimensions.find((d) => d.id === selectedDimensionId) ?? null;
  }, [selectedDimensionId, snapshot.dimensions]);

  const size = 440;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 126;
  const labelRadius = 158;
  const levels = [0.25, 0.5, 0.75, 1];
  const count = snapshot.dimensions.length;

  const getPoint = (index: number, ratio: number, radius = maxRadius) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    return {
      x: cx + Math.cos(angle) * radius * ratio,
      y: cy + Math.sin(angle) * radius * ratio,
    };
  };

  const polygonPoints = snapshot.dimensions
    .map((dim, idx) => {
      const pt = getPoint(idx, dim.presence / 100);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <section
      aria-labelledby="life-balance-heading"
      className="bg-white border border-[#E5EAE8] rounded-2xl p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2
            id="life-balance-heading"
            className="text-lg font-semibold tracking-tight text-[#172121]"
          >
            Mi balance de vida
          </h2>
          <p className="text-xs text-[#768482] mt-0.5">
            {snapshot.hasHistoricalData
              ? 'Estado actual · Pulsa una dimensión para ver detalle'
              : 'Configuración inicial sin histórico previo · Pulsa una dimensión'}
          </p>
        </div>

        <div
          className="inline-flex items-center gap-1 p-1 bg-[#F7F8F7] border border-[#E5EAE8] rounded-xl w-fit shrink-0"
          role="tablist"
          aria-label="Periodo del balance"
        >
          {PERIOD_OPTIONS.map((opt) => {
            const active = period === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPeriod(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-white text-[#135D66] shadow-xs'
                    : 'text-[#52605E] hover:text-[#172121]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-[430px]">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-auto overflow-visible select-none"
              role="img"
              aria-label="Gráfico radial de Mi balance de vida"
            >
              {levels.map((lvl) => {
                const ringPoints = snapshot.dimensions
                  .map((_, idx) => {
                    const p = getPoint(idx, lvl);
                    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={lvl}
                    points={ringPoints}
                    fill="none"
                    stroke={lvl === 1 ? '#DCE3E0' : '#EDF1F0'}
                    strokeWidth="1"
                  />
                );
              })}

              {snapshot.dimensions.map((dim, idx) => {
                const outer = getPoint(idx, 1);
                return (
                  <line
                    key={`axis-${dim.id}`}
                    x1={cx}
                    y1={cy}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#E7ECEA"
                    strokeWidth="1"
                  />
                );
              })}

              <polygon
                points={polygonPoints}
                fill="#135D66"
                fillOpacity="0.12"
                stroke="#135D66"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {snapshot.dimensions.map((dim, idx) => {
                const vertex = getPoint(idx, dim.presence / 100);
                const labelPt = getPoint(idx, 1, labelRadius);
                const isSelected = activeDimension?.id === dim.id;

                const dx = labelPt.x - cx;
                let textAnchor: 'start' | 'middle' | 'end' = 'middle';
                if (dx > 24) textAnchor = 'start';
                else if (dx < -24) textAnchor = 'end';

                const dy = labelPt.y - cy;
                const verticalOffset = dy > 24 ? 10 : dy < -24 ? -4 : 3;

                const words = dim.shortLabel.split(' ');
                const shouldWrap = words.length >= 2 && Math.abs(dx) > 20;
                const firstLine = shouldWrap ? words[0] : dim.shortLabel;
                const secondLine = shouldWrap ? words.slice(1).join(' ') : '';

                return (
                  <g
                    key={dim.id}
                    className="cursor-pointer group"
                    onClick={() =>
                      setSelectedDimensionId((prev) => (prev === dim.id ? null : dim.id))
                    }
                  >
                    {isSelected && (
                      <circle
                        cx={vertex.x}
                        cy={vertex.y}
                        r="11"
                        fill={dim.color}
                        fillOpacity="0.16"
                      />
                    )}
                    <circle
                      cx={vertex.x}
                      cy={vertex.y}
                      r={isSelected ? '6.5' : '5'}
                      fill="#FFFFFF"
                      stroke={dim.color}
                      strokeWidth="2.5"
                    />
                    <text
                      x={labelPt.x}
                      y={labelPt.y + verticalOffset}
                      textAnchor={textAnchor}
                      className={`text-[12px] transition-colors ${
                        isSelected
                          ? 'fill-[#172121] font-semibold'
                          : 'fill-[#4E5D5B] font-medium group-hover:fill-[#172121]'
                      }`}
                    >
                      <tspan x={labelPt.x} dy="0">
                        {firstLine}
                      </tspan>
                      {secondLine && (
                        <tspan x={labelPt.x} dy="14">
                          {secondLine}
                        </tspan>
                      )}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <p className="text-sm leading-relaxed text-[#4E5D5B]">{snapshot.summaryNote}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="p-3.5 rounded-xl bg-[#F7F8F7] space-y-1.5">
              <p className="text-xs font-semibold text-[#135D66]">Mayor presencia</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {higherAttention.map((dim) => (
                  <button
                    key={dim.id}
                    type="button"
                    onClick={() => setSelectedDimensionId(dim.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#172121] hover:underline cursor-pointer"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: dim.color }}
                      aria-hidden="true"
                    />
                    <span>{dim.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F8F7] space-y-1.5">
              <p className="text-xs font-semibold text-[#7D71A8]">Pide más espacio</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {needsMoreSpace.map((dim) => (
                  <button
                    key={dim.id}
                    type="button"
                    onClick={() => setSelectedDimensionId(dim.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#172121] hover:underline cursor-pointer"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: dim.color }}
                      aria-hidden="true"
                    />
                    <span>{dim.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeDimension && (
            <div className="pt-3 border-t border-[#EFF2F1] space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-[#172121]">
                  {activeDimension.label}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedDimensionId(null)}
                  className="text-xs text-[#768482] hover:text-[#172121] cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
              <p className="text-xs text-[#4E5D5B]">{activeDimension.exampleContext}</p>
              <p className="text-[11px] text-[#768482]">
                Fuentes: {activeDimension.sourceSignals.map((s) => SIGNAL_LABELS[s]).join(' · ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
