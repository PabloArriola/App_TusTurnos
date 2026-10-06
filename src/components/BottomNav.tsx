import React from 'react';
import { Compass, CalendarDays, Plus, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount?: number;
  hasSelectedService?: boolean;
  onAttemptCalendarWithoutService?: () => void;
  isMobileFrame?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingCount = 1,
  hasSelectedService = false,
  onAttemptCalendarWithoutService,
  isMobileFrame = false,
}) => {
  const isExplorarActive = activeTab === 'servicios';
  const isReservarActive = activeTab === 'reservar-cita' || activeTab === 'confirmar-reserva';
  const isMisTurnosActive = activeTab === 'mis-turnos';
  const isPerfilActive = activeTab === 'perfil-clinico';

  const handleReserveClick = () => {
    if (isReservarActive) {
      return;
    }
    if (!hasSelectedService) {
      if (onAttemptCalendarWithoutService) {
        onAttemptCalendarWithoutService();
      } else {
        onTabChange('servicios');
      }
      return;
    }
    onTabChange('reservar-cita');
  };

  return (
    <div 
      className={`${
        isMobileFrame ? 'absolute' : 'fixed'
      } bottom-0 inset-x-0 z-50 w-full flex justify-center pointer-events-none`}
    >
      <nav 
        aria-label="Navegación principal"
        className={`pointer-events-auto w-full ${
          isMobileFrame ? 'max-w-[480px]' : 'max-w-[520px]'
        } min-h-[88px] sm:min-h-[92px] px-2 sm:px-3 pt-2 pb-[max(0.85rem,env(safe-area-inset-bottom,0.85rem))] grid grid-cols-4 items-end bg-white/95 backdrop-blur-[18px] border-t border-[#d8e2de]/80 shadow-[0_-10px_30px_rgba(18,60,50,0.08)] transition-all`}
      >
        {/* Tab 1: Explorar */}
        {isExplorarActive ? (
          <button
            onClick={() => onTabChange('servicios')}
            aria-label="Explorar servicios"
            className="justify-self-center w-[84px] min-[360px]:w-[92px] min-[390px]:w-[102px] sm:w-[114px] h-[76px] sm:h-[82px] -mt-[38px] sm:-mt-[44px] rounded-[28px] sm:rounded-[32px] bg-[#123c32] text-white border-[5px] sm:border-[6px] border-white shadow-[0_13px_30px_rgba(18,60,50,0.28)] flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer relative z-20 group"
          >
            <div className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <span className="text-[10.5px] min-[360px]:text-[11px] sm:text-[12px] font-bold tracking-tight text-white leading-tight whitespace-nowrap px-1">
              Explorar
            </span>
          </button>
        ) : (
          <button
            onClick={() => onTabChange('servicios')}
            aria-label="Explorar servicios"
            className="justify-self-center w-full flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-[#66716d] hover:text-[#123c32] transition-all cursor-pointer relative z-10 group"
          >
            <div className="w-6 h-6 flex items-center justify-center text-[#66716d] group-hover:text-[#123c32] group-hover:scale-105 transition-all">
              <Compass className="w-[19px] h-[19px] stroke-[1.8]" />
            </div>
            <span className="text-[10.5px] sm:text-[11px] tracking-tight font-medium text-[#66716d] group-hover:text-[#123c32] transition-colors whitespace-nowrap">
              Explorar
            </span>
          </button>
        )}

        {/* Tab 2: Reservar turno */}
        {isReservarActive ? (
          <button
            onClick={handleReserveClick}
            aria-label="Reservar turno"
            className="justify-self-center w-[84px] min-[360px]:w-[92px] min-[390px]:w-[102px] sm:w-[114px] h-[76px] sm:h-[82px] -mt-[38px] sm:-mt-[44px] rounded-[28px] sm:rounded-[32px] bg-[#123c32] text-white border-[5px] sm:border-[6px] border-white shadow-[0_13px_30px_rgba(18,60,50,0.28)] flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer relative z-20 group"
          >
            {hasSelectedService && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#d9f56a] border-2 border-white shadow-sm flex items-center justify-center text-[9px] text-[#123c32] font-extrabold animate-pulse">
                ✓
              </span>
            )}
            <div className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-white stroke-[2.4]" />
            </div>
            <span className="text-[10px] min-[360px]:text-[10.5px] min-[390px]:text-[11px] sm:text-[12px] font-bold tracking-tight text-white leading-tight whitespace-nowrap px-0.5">
              Reservar
            </span>
          </button>
        ) : (
          <button
            onClick={handleReserveClick}
            aria-label="Reservar turno"
            className="justify-self-center w-full flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-[#66716d] hover:text-[#123c32] transition-all cursor-pointer relative z-10 group"
          >
            <div className="relative w-6 h-6 flex items-center justify-center text-[#66716d] group-hover:text-[#123c32] group-hover:scale-105 transition-all">
              <Plus className="w-[19px] h-[19px] stroke-[1.8]" />
              {hasSelectedService && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#d9f56a] border-2 border-white shadow-xs animate-pulse"></span>
              )}
            </div>
            <span className="text-[10.5px] sm:text-[11px] tracking-tight font-medium text-[#66716d] group-hover:text-[#123c32] transition-colors whitespace-nowrap">
              Reservar
            </span>
          </button>
        )}

        {/* Tab 3: Mis turnos */}
        {isMisTurnosActive ? (
          <button
            onClick={() => onTabChange('mis-turnos')}
            aria-label="Mis turnos"
            className="justify-self-center w-[84px] min-[360px]:w-[92px] min-[390px]:w-[102px] sm:w-[114px] h-[76px] sm:h-[82px] -mt-[38px] sm:-mt-[44px] rounded-[28px] sm:rounded-[32px] bg-[#123c32] text-white border-[5px] sm:border-[6px] border-white shadow-[0_13px_30px_rgba(18,60,50,0.28)] flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer relative z-20 group"
          >
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full bg-[#d9f56a] text-[#123c32] text-[9px] font-extrabold border-2 border-white shadow-sm">
                {pendingCount}
              </span>
            )}
            <div className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <span className="text-[10.5px] min-[360px]:text-[11px] sm:text-[12px] font-bold tracking-tight text-white leading-tight whitespace-nowrap px-1">
              Mis turnos
            </span>
          </button>
        ) : (
          <button
            onClick={() => onTabChange('mis-turnos')}
            aria-label="Mis turnos"
            className="justify-self-center w-full flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-[#66716d] hover:text-[#123c32] transition-all cursor-pointer relative z-10 group"
          >
            <div className="relative w-6 h-6 flex items-center justify-center text-[#66716d] group-hover:text-[#123c32] group-hover:scale-105 transition-all">
              <CalendarDays className="w-[19px] h-[19px] stroke-[1.8]" />
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#d9f56a] border-2 border-white"></span>
              )}
            </div>
            <span className="text-[10.5px] sm:text-[11px] tracking-tight font-medium text-[#66716d] group-hover:text-[#123c32] transition-colors whitespace-nowrap">
              Mis turnos
            </span>
          </button>
        )}

        {/* Tab 4: Perfil */}
        {isPerfilActive ? (
          <button
            onClick={() => onTabChange('perfil-clinico')}
            aria-label="Perfil"
            className="justify-self-center w-[84px] min-[360px]:w-[92px] min-[390px]:w-[102px] sm:w-[114px] h-[76px] sm:h-[82px] -mt-[38px] sm:-mt-[44px] rounded-[28px] sm:rounded-[32px] bg-[#123c32] text-white border-[5px] sm:border-[6px] border-white shadow-[0_13px_30px_rgba(18,60,50,0.28)] flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer relative z-20 group"
          >
            <div className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform">
              <User className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <span className="text-[10.5px] min-[360px]:text-[11px] sm:text-[12px] font-bold tracking-tight text-white leading-tight whitespace-nowrap px-1">
              Perfil
            </span>
          </button>
        ) : (
          <button
            onClick={() => onTabChange('perfil-clinico')}
            aria-label="Perfil"
            className="justify-self-center w-full flex flex-col items-center justify-center gap-1.5 py-2 px-1 text-[#66716d] hover:text-[#123c32] transition-all cursor-pointer relative z-10 group"
          >
            <div className="w-6 h-6 flex items-center justify-center text-[#66716d] group-hover:text-[#123c32] group-hover:scale-105 transition-all">
              <User className="w-[19px] h-[19px] stroke-[1.8]" />
            </div>
            <span className="text-[10.5px] sm:text-[11px] tracking-tight font-medium text-[#66716d] group-hover:text-[#123c32] transition-colors whitespace-nowrap">
              Perfil
            </span>
          </button>
        )}
      </nav>
    </div>
  );
};
