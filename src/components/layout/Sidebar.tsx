import React from 'react';
import {
  Activity,
  BookMarked,
  CalendarDays,
  Home,
  LayoutGrid,
  Settings,
  Wallet,
  X,
} from 'lucide-react';
import { NavSection } from '../../types/balance';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  userName: string;
}

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'espacios', label: 'Mis espacios', icon: LayoutGrid },
  { id: 'planificacion', label: 'Planificación', icon: CalendarDays },
  { id: 'evolucion', label: 'Mi evolución', icon: Activity },
  { id: 'finanzas', label: 'Finanzas', icon: Wallet },
  { id: 'biblioteca', label: 'Mi biblioteca', icon: BookMarked },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  mobileOpen,
  onCloseMobile,
  userName,
}: SidebarProps) {
  const handleNav = (id: NavSection) => {
    onSelectSection(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E5EAE8] w-[256px]">
      <div className="flex items-center justify-between px-6 h-16 border-b border-[#E5EAE8] shrink-0">
        <button
          type="button"
          onClick={() => handleNav('inicio')}
          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135D66] rounded-md cursor-pointer"
        >
          <span className="font-display text-[17px] font-semibold tracking-tight text-[#172121] whitespace-nowrap">
            BALANCE OS
          </span>
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Cerrar menú"
          className="lg:hidden p-2 -mr-2 rounded-lg text-[#52605E] hover:bg-[#F2F5F4]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-colors cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#135D66] ${
                isActive
                  ? 'bg-[#ECF4F5] text-[#135D66]'
                  : 'text-[#4E5D5B] hover:bg-[#F2F5F4] hover:text-[#172121]'
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 ${
                  isActive ? 'text-[#135D66]' : 'text-[#768482]'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-5 border-t border-[#E5EAE8] space-y-3 shrink-0">
        <p className="text-[12px] leading-relaxed text-[#52605E]">
          “No se trata de hacer más cosas. Se trata de construir una vida que realmente quieras vivir.”
        </p>
        <div className="flex items-center gap-2.5 pt-1">
          <div className="w-8 h-8 rounded-full bg-[#EEF4F0] text-[#5E8371] flex items-center justify-center text-xs font-semibold shrink-0">
            {(userName.trim() || 'B').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#172121] truncate">
              {userName.trim() || 'Perfil personal'}
            </p>
            <p className="text-[11px] text-[#768482] truncate">Medellín, Colombia</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0">{navContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#172121]/25 backdrop-blur-[1px]"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">{navContent}</div>
        </div>
      )}
    </>
  );
}
