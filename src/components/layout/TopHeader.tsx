import React from 'react';
import { Menu } from 'lucide-react';
import { NavSection } from '../../types/balance';

interface TopHeaderProps {
  activeSection: NavSection;
  onOpenMobileMenu: () => void;
  onOpenAi: () => void;
}

const SECTION_TITLES: Record<NavSection, string> = {
  inicio: 'Inicio',
  espacios: 'Mis espacios',
  planificacion: 'Planificación',
  evolucion: 'Mi evolución',
  finanzas: 'Finanzas',
  biblioteca: 'Mi biblioteca',
  configuracion: 'Configuración',
};

export function TopHeader({ activeSection, onOpenMobileMenu, onOpenAi }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-sm border-b border-[#E5EAE8] px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Abrir menú lateral"
          className="lg:hidden p-2 -ml-2 rounded-lg text-[#4E5D5B] hover:bg-[#F2F5F4] transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm min-w-0">
          <span className="font-display font-semibold text-[#172121] lg:hidden whitespace-nowrap">
            BALANCE OS
          </span>
          <span className="text-[#CBD5D3] lg:hidden" aria-hidden="true">
            /
          </span>
          <span className="text-[#4E5D5B] font-medium truncate">
            {SECTION_TITLES[activeSection]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="hidden sm:inline text-xs text-[#768482] whitespace-nowrap">
          Miércoles, 18 de noviembre de 2026
        </span>
        <button
          type="button"
          onClick={onOpenAi}
          className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#135D66] bg-[#ECF4F5] hover:bg-[#DFEEF0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Reflexionar con IA
        </button>
      </div>
    </header>
  );
}
