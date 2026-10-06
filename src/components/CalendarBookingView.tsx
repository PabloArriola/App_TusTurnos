import React, { useState, useEffect } from 'react';
import { Business, Service, Specialist, Appointment, BookedServiceItem } from '../types';
import { 
  ArrowLeft, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  X,
  Sparkles,
  Check
} from 'lucide-react';

interface CalendarBookingViewProps {
  business: Business;
  selectedServices?: Service[];
  selectedService?: Service;
  selectedSpecialist: Specialist;
  onBackToServices: () => void;
  onProceedToCheckout: (bookedItem: BookedServiceItem) => void;
  onAddAnotherService?: (bookedItem: BookedServiceItem) => void;
  initialDate?: string;
  initialTime?: string;
  reschedulingAppointment?: Appointment | null;
  bookedItems?: BookedServiceItem[];
}

export const CalendarBookingView: React.FC<CalendarBookingViewProps> = ({
  business,
  selectedServices,
  selectedService,
  selectedSpecialist,
  onBackToServices,
  onProceedToCheckout,
  onAddAnotherService,
  initialDate,
  initialTime,
  reschedulingAppointment,
  bookedItems = [],
}) => {
  // Current active service to book (single service at a time)
  const currentService: Service = selectedService || (selectedServices && selectedServices[0]) || business.services[0];

  // Two-phase step: First select day, then select time
  const [bookingStep, setBookingStep] = useState<'select-day' | 'select-time'>('select-day');
  const [showAskAnotherModal, setShowAskAnotherModal] = useState(false);

  // Reset to first step (select day) whenever current service changes
  useEffect(() => {
    setBookingStep('select-day');
    setShowAskAnotherModal(false);
  }, [currentService?.id]);

  // Calendar date state
  const [currentYear, setCurrentYear] = useState<number>(() => {
    if (initialDate) {
      const [y] = initialDate.split('-');
      if (!isNaN(Number(y))) return Number(y);
    }
    return 2026;
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    if (initialDate) {
      const [, m] = initialDate.split('-');
      if (!isNaN(Number(m))) return Math.max(0, Math.min(11, Number(m) - 1));
    }
    return 9; // Octubre (0-indexed: 9)
  });

  const [selectedDay, setSelectedDay] = useState<number>(() => {
    if (initialDate) {
      const [, , d] = initialDate.split('-');
      if (!isNaN(Number(d))) return Number(d);
    }
    return 23;
  });

  const [activeShift, setActiveShift] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(initialTime || '15:30');

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const MONTH_SHORT = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const currentMonthName = `${MONTH_NAMES[currentMonth]} ${currentYear}`;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Days in month calculation
  const daysInMonthCount = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const leadingBlanks = (firstDayOfWeek + 6) % 7; // Monday-first

  // Trailing and leading days calculation to match the reference calendar grid (complete 5 or 6 rows of 7 days)
  const prevMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate();
  const prevMonthDays = Array.from({ length: leadingBlanks }, (_, i) => prevMonthDaysCount - leadingBlanks + 1 + i);
  const totalGridCells = (leadingBlanks + daysInMonthCount > 35) ? 42 : 35;
  const trailingBlanksCount = totalGridCells - (leadingBlanks + daysInMonthCount);
  const nextMonthDays = Array.from({ length: trailingBlanksCount }, (_, i) => i + 1);

  // Safe active day within current month
  const activeDay = Math.min(selectedDay, daysInMonthCount);

  // Formatted date string
  const selectedDateObj = new Date(currentYear, currentMonth, activeDay);
  const selectedDayOfWeekName = DAY_NAMES_SHORT[selectedDateObj.getDay()];
  const selectedMonthShortName = MONTH_SHORT[currentMonth];
  const formattedDate = `${selectedDayOfWeekName} ${activeDay} ${selectedMonthShortName}`;
  const pad = (n: number) => n.toString().padStart(2, '0');
  const fullDate = `${currentYear}-${pad(currentMonth + 1)}-${pad(activeDay)}`;

  const isPastDate = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    const today = new Date(2026, 9, 1);
    return d < today;
  };

  const isOpenDay = (day: number) => {
    const dow = new Date(currentYear, currentMonth, day).getDay();
    const openDays = business.availableDays && business.availableDays.length > 0
      ? business.availableDays
      : [1, 2, 3, 4, 5, 6];
    return openDays.includes(dow);
  };

  const isDayAvailable = (day: number) => {
    if (isPastDate(day)) return false;
    return isOpenDay(day);
  };

  // Slots according to shift
  const slotsByShift = {
    morning: [
      { time: '09:00', status: 'available' },
      { time: '09:45', status: 'available' },
      { time: '10:30', status: 'booked' },
      { time: '11:15', status: 'available' },
    ],
    afternoon: [
      { time: '14:15', status: 'available' },
      { time: '15:30', status: 'available' },
      { time: '16:45', status: 'available' },
      { time: '18:00', status: 'available' },
      { time: '19:15', status: 'available' },
      { time: '20:00', status: 'booked' },
    ],
    evening: [
      { time: '19:45', status: 'available' },
      { time: '20:30', status: 'available' },
      { time: '21:15', status: 'booked' },
    ],
  };

  const calculateEndTime = (startTimeStr: string, durationMinutes: number): string => {
    const [hStr, mStr] = startTimeStr.split(':');
    const totalMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10) + durationMinutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

  const estimatedEndTime = calculateEndTime(selectedTimeSlot, currentService.durationMinutes);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  const depositAmount = Math.round((currentService.price * (currentService.depositPercentage || business.defaultDepositPercentage || 30)) / 100);

  const currentBookedItem: BookedServiceItem = {
    id: `item-${Date.now()}`,
    service: currentService,
    specialist: selectedSpecialist,
    date: fullDate,
    formattedDate,
    time: selectedTimeSlot,
    endTime: estimatedEndTime,
  };

  const handleConfirmTime = () => {
    if (reschedulingAppointment) {
      onProceedToCheckout(currentBookedItem);
    } else {
      setShowAskAnotherModal(true);
    }
  };

  if (!currentService) {
    return (
      <div className="flex flex-col w-full max-w-[520px] mx-auto px-3.5 sm:px-4 space-y-4 pb-36 text-center py-8 animate-in fade-in duration-200">
        <div className="card-aesthetic p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-[#edf2ef] text-[#123c32] flex items-center justify-center mx-auto mb-4 shadow-xs">
            <span className="material-symbols-outlined text-[32px]">spa</span>
          </div>
          <h2 className="text-xl font-bold text-[#123c32]">Seleccioná un servicio primero</h2>
          <p className="text-xs sm:text-sm text-[#66716d] max-w-sm mx-auto leading-relaxed mt-1">
            Elegí un servicio en el catálogo para ver los días y horarios libres.
          </p>
          <button
            onClick={onBackToServices}
            className="mt-6 py-4 px-6 rounded-[18px] bg-[#123c32] hover:bg-[#195344] text-white font-bold text-xs sm:text-sm shadow-[0_10px_24px_rgba(18,60,50,0.18)] mx-auto active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Ir al Catálogo de Servicios</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[520px] mx-auto px-3.5 sm:px-4 space-y-4 pb-36 animate-in fade-in duration-200">
      {/* Rescheduling Top Banner */}
      {reschedulingAppointment && (
        <div className="p-4 rounded-[22px] bg-[#123c32] text-white flex items-center gap-3 border border-[#d9f56a]/40 shadow-lg animate-in fade-in duration-200">
          <div className="w-9 h-9 rounded-full bg-white/10 text-[#d9f56a] flex items-center justify-center shrink-0">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-[#d9f56a]">
              Reprogramando Turno #{reschedulingAppointment.id}
            </p>
            <p className="text-[11px] text-white/80 mt-0.5">
              Elegí tu nueva fecha y horario. Tu seña ya abonada de {formatPrice(reschedulingAppointment.depositPaid)} se conserva intacta.
            </p>
          </div>
        </div>
      )}

      {/* TOP HEADER ROW */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => {
            if (bookingStep === 'select-time') {
              setBookingStep('select-day');
            } else {
              onBackToServices();
            }
          }}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-[#123c32] border border-[#d8e2de]/80 shadow-[0_8px_22px_rgba(18,60,50,0.08)] active:scale-95 transition-all cursor-pointer hover:scale-105"
          aria-label="Volver"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
        </button>

        <div className="text-center">
          <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-[#eaf2ed] text-[#123c32] mb-0.5">
            {bookingStep === 'select-day' ? 'PASO 1 DE 2: ELEGIR DÍA' : 'PASO 2 DE 2: ELEGIR HORARIO'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#123c32] tracking-tight">
            {bookingStep === 'select-day' ? 'Seleccionar Día' : 'Seleccionar Horario'}
          </h2>
        </div>

        <div className="w-11 h-11"></div>
      </div>

      {/* SERVICE SUMMARY CARD */}
      <div className="card-aesthetic p-5 sm:p-6 flex flex-col gap-3 transition-transform duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#eaf2ed] flex items-center justify-center text-[#123c32] shrink-0 border border-[#d8e2de]">
              <span className="material-symbols-outlined text-[24px]">
                {currentService.iconName || 'spa'}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-bold text-[#18211f] truncate">
                  {currentService.title}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#edf2ef] text-[#66716d] text-[11px] shrink-0 font-bold">
                  ◷ {currentService.durationMinutes} min
                </span>
              </div>
              <p className="text-xs text-[#66716d] truncate mt-0.5">
                Atiende: <strong className="text-[#123c32]">{selectedSpecialist.name}</strong> • {business.name}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0 pl-2">
            <span className="text-lg sm:text-xl font-bold text-[#123c32]">
              {formatPrice(currentService.price)}
            </span>
            <span className="text-[10px] text-[#195344] font-bold bg-[#efffc5] px-2 py-0.5 rounded-full mt-0.5">
              Seña: {formatPrice(depositAmount)}
            </span>
          </div>
        </div>

        {/* Existing booked items badge if adding second service */}
        {bookedItems.length > 0 && (
          <div className="pt-2 border-t border-[#d8e2de] flex items-center justify-between text-xs text-[#195344]">
            <span className="font-semibold">
              Ya tenés {bookedItems.length} {bookedItems.length === 1 ? 'servicio' : 'servicios'} sumado(s) a tu reserva
            </span>
            <span className="font-bold text-[#123c32]">
              Servicio #{bookedItems.length + 1}
            </span>
          </div>
        )}
      </div>

      {/* PHASE 1: SELECT DAY (CALENDAR) */}
      {bookingStep === 'select-day' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="card-aesthetic p-5 sm:p-6">
            {/* Month Navigation Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#66716d] block">
                  Calendario de Turnos
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#123c32] tracking-tight">
                  {currentMonthName}
                </h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Mes anterior"
                  className="w-9 h-9 rounded-full bg-[#edf2ef] text-[#123c32] flex items-center justify-center hover:bg-[#d8e2de] active:scale-90 transition-all cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Mes siguiente"
                  className="w-9 h-9 rounded-full bg-[#edf2ef] text-[#123c32] flex items-center justify-center hover:bg-[#d8e2de] active:scale-90 transition-all cursor-pointer shadow-xs"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Weekday Labels (Mon-Fri slate, Sat-Sun terracotta/coral matching reference) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center mb-2 px-0.5">
              {[
                { label: 'Lun', isWeekend: false },
                { label: 'Mar', isWeekend: false },
                { label: 'Mié', isWeekend: false },
                { label: 'Jue', isWeekend: false },
                { label: 'Vie', isWeekend: false },
                { label: 'Sáb', isWeekend: true },
                { label: 'Dom', isWeekend: true },
              ].map(({ label, isWeekend }) => (
                <span
                  key={label}
                  className={`text-[11px] sm:text-xs tracking-wider font-bold ${
                    isWeekend ? 'text-[#e07a5f]' : 'text-[#64748b]'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Month Day Grid (Card squares matching reference model) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Previous Month Overflow Days (Diagonal striped hatched cells) */}
              {prevMonthDays.map((prevDay, i) => {
                const isWeekend = i === 5 || i === 6;
                return (
                  <div
                    key={`prev-${prevDay}`}
                    className={`h-12 sm:h-16 rounded-[12px] sm:rounded-[16px] p-1.5 sm:p-2 flex flex-col justify-between items-start text-left relative overflow-hidden select-none opacity-60 ${
                      isWeekend ? 'cal-cell-striped-warm' : 'cal-cell-striped-gray'
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs font-medium text-gray-400 leading-none">
                      {prevDay}
                    </span>
                  </div>
                );
              })}

              {/* Current Month Days */}
              {daysInMonth.map((dayNum) => {
                const colIdx = (leadingBlanks + dayNum - 1) % 7;
                const isWeekend = colIdx === 5 || colIdx === 6;
                const isSelected = activeDay === dayNum;
                const available = isDayAvailable(dayNum);
                const isPast = isPastDate(dayNum);

                if (isSelected) {
                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setSelectedDay(dayNum)}
                      className="h-12 sm:h-16 rounded-[12px] sm:rounded-[16px] p-1.5 sm:p-2 flex flex-col justify-between items-start text-left relative overflow-hidden select-none bg-[#f6c344] text-[#1c1917] shadow-[0_6px_18px_rgba(246,195,68,0.45)] ring-2 ring-[#eab308]/70 cursor-pointer active:scale-95 transition-all scale-[1.02]"
                    >
                      <div className="w-full flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-[#1c1917] leading-none">
                          {dayNum}
                        </span>
                        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white/95 flex items-center justify-center text-[#1c1917] shadow-xs">
                          <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                        </div>
                      </div>
                      <div className="w-full truncate">
                        <span className="text-[9px] sm:text-[10px] font-extrabold text-[#1c1917] tracking-tight block truncate">
                          Turno
                        </span>
                      </div>
                    </button>
                  );
                }

                if (available) {
                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setSelectedDay(dayNum)}
                      className="h-12 sm:h-16 rounded-[12px] sm:rounded-[16px] p-1.5 sm:p-2 flex flex-col justify-between items-start text-left relative overflow-hidden select-none bg-[#f2f4f3] hover:bg-[#e7eee9] active:scale-95 transition-all cursor-pointer group border border-transparent hover:border-[#123c32]/15"
                    >
                      <div className="w-full flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-semibold text-[#18211f] group-hover:font-bold leading-none">
                          {dayNum}
                        </span>
                      </div>
                      <div className="w-full">
                        <span className="text-[8px] sm:text-[9px] font-semibold text-[#123c32]/50 group-hover:text-[#123c32] block truncate">
                          Libre
                        </span>
                      </div>
                    </button>
                  );
                }

                return (
                  <div
                    key={dayNum}
                    title={isPast ? 'Fecha anterior' : 'Día cerrado'}
                    className={`h-12 sm:h-16 rounded-[12px] sm:rounded-[16px] p-1.5 sm:p-2 flex flex-col justify-between items-start text-left relative overflow-hidden select-none cursor-not-allowed opacity-75 ${
                      isWeekend ? 'cal-cell-striped-warm' : 'cal-cell-striped-gray'
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs font-medium text-gray-400 leading-none">
                      {dayNum}
                    </span>
                  </div>
                );
              })}

              {/* Next Month Overflow Days (Diagonal striped hatched cells) */}
              {nextMonthDays.map((nextDay, i) => {
                const colIdx = (leadingBlanks + daysInMonthCount + i) % 7;
                const isWeekend = colIdx === 5 || colIdx === 6;
                return (
                  <div
                    key={`next-${nextDay}`}
                    className={`h-12 sm:h-16 rounded-[12px] sm:rounded-[16px] p-1.5 sm:p-2 flex flex-col justify-between items-start text-left relative overflow-hidden select-none opacity-60 ${
                      isWeekend ? 'cal-cell-striped-warm' : 'cal-cell-striped-gray'
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs font-medium text-gray-400 leading-none">
                      {nextDay}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Event / Status Capsule Pills inspired by user reference model */}
            <div className="mt-3.5 pt-3.5 border-t border-[#d8e2de]/70 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef9c3] border border-[#fde047] text-[#854d0e] text-[11px] sm:text-xs font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#eab308]"></span>
                <span>Turno seleccionado: <strong>{formattedDate}</strong></span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4f7f5] border border-[#d8e2de] text-[#123c32] text-[11px] sm:text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-[#123c32]"></span>
                <span>Atención: {business.availableDays?.length ? 'Lunes a Sábados' : 'Lun a Sáb'} ({business.schedule || '09:00 - 20:30'})</span>
              </div>
            </div>
          </div>

          {/* Action Button: Proceed to Step 2 (Select Time) */}
          <div className="w-full pt-1">
            <button
              type="button"
              onClick={() => setBookingStep('select-time')}
              className="w-full py-4 px-5 rounded-[18px] bg-[#123c32] text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(18,60,50,0.18)] hover:bg-[#195344] hover:-translate-y-0.5 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Continuar a Elegir Horario ({formattedDate})</span>
              <span className="text-lg">→</span>
            </button>
            <p className="text-center text-xs text-[#66716d] mt-2 font-medium">
              Elegí el día y luego podrás ver los turnos disponibles por franja horaria
            </p>
          </div>
        </div>
      )}

      {/* PHASE 2: SELECT TIME (SHIFTS & SLOTS) */}
      {bookingStep === 'select-time' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Day selection reminder chip */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setBookingStep('select-day')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#d8e2de] text-xs font-bold text-[#123c32] hover:bg-[#edf2ef] transition-colors cursor-pointer shadow-xs"
            >
              <span>← Cambiar fecha</span>
            </button>

            <span className="text-xs font-bold text-[#123c32] bg-[#efffc5] px-3 py-1 rounded-full border border-[#d9f56a]/40">
              Fecha elegida: {formattedDate}
            </span>
          </div>

          {/* Shifts filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-base font-bold text-[#123c32]">Franja Horaria</span>
              <span className="text-xs font-bold text-[#66716d]">
                {slotsByShift[activeShift].filter((s) => s.status === 'available').length} turnos libres
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-full bg-white shadow-xs border border-[#d8e2de]">
              <button
                type="button"
                onClick={() => setActiveShift('morning')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                  activeShift === 'morning'
                    ? 'bg-[#123c32] text-white shadow-sm font-bold'
                    : 'text-[#66716d] hover:text-[#18211f]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">light_mode</span>
                <span className="text-xs font-bold">Mañana</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveShift('afternoon')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                  activeShift === 'afternoon'
                    ? 'bg-[#123c32] text-white shadow-sm font-bold'
                    : 'text-[#66716d] hover:text-[#18211f]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">wb_sunny</span>
                <span className="text-xs font-bold">Tarde</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveShift('evening')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                  activeShift === 'evening'
                    ? 'bg-[#123c32] text-white shadow-sm font-bold'
                    : 'text-[#66716d] hover:text-[#18211f]'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">bedtime</span>
                <span className="text-xs font-bold">Noche</span>
              </button>
            </div>
          </div>

          {/* Time Slots Card */}
          <div className="card-aesthetic p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#123c32]">Horarios Disponibles</span>
              <span className="text-xs font-bold text-[#66716d] uppercase tracking-wider bg-[#edf2ef] px-2.5 py-0.5 rounded-full">
                {formattedDate}
              </span>
            </div>

            {/* Pill Time Chips */}
            <div className="grid grid-cols-3 gap-2">
              {slotsByShift[activeShift].map((slot) => {
                const isSelected = selectedTimeSlot === slot.time;
                const isBooked = slot.status === 'booked';

                if (isBooked) {
                  return (
                    <div
                      key={slot.time}
                      className="py-2.5 px-3 rounded-full bg-[#f7faf7] text-[#66716d]/50 text-xs font-semibold text-center cursor-not-allowed select-none border border-[#d8e2de]/50 flex items-center justify-center"
                    >
                      Agotado
                    </div>
                  );
                }

                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => setSelectedTimeSlot(slot.time)}
                    className={`py-2.5 px-3 rounded-full transition-all active:scale-95 text-center font-bold text-xs sm:text-sm cursor-pointer ${
                      isSelected
                        ? 'bg-[#123c32] text-white shadow-[0_6px_16px_rgba(18,60,50,0.25)] scale-[1.02]'
                        : 'bg-[#edf2ef] text-[#18211f] hover:bg-[#d8e2de]'
                    }`}
                  >
                    {slot.time} hs
                  </button>
                );
              })}
            </div>

            {/* Range Indicator Box */}
            <div className="pt-2 border-t border-[#edf2ef]">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#f7faf7] border border-[#d8e2de] rounded-2xl p-3 flex flex-col">
                  <span className="text-[11px] text-[#66716d] font-medium">Inicio seleccionado</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base font-bold text-[#123c32]">
                      {selectedTimeSlot} hs
                    </span>
                    <span className="material-symbols-outlined text-[#123c32] text-[18px]">schedule</span>
                  </div>
                </div>

                <div className="bg-[#f7faf7] border border-[#d8e2de] rounded-2xl p-3 flex flex-col">
                  <span className="text-[11px] text-[#66716d] font-medium">Fin estimado</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base font-bold text-[#123c32]">
                      {estimatedEndTime} hs
                    </span>
                    <span className="material-symbols-outlined text-[#66716d] text-[18px]">update</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button: Confirm Time Slot */}
          <div className="w-full pt-1">
            <button
              type="button"
              onClick={handleConfirmTime}
              className="w-full py-4 px-5 rounded-[18px] bg-[#123c32] text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(18,60,50,0.18)] hover:bg-[#195344] hover:-translate-y-0.5 transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>Confirmar Horario ({selectedTimeSlot} hs)</span>
              <span className="text-lg">→</span>
            </button>
            <p className="text-center text-xs text-[#66716d] mt-2.5 flex items-center justify-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[15px] text-[#123c32]">verified_user</span>
              Cancelación gratuita hasta 24 hs previas al turno
            </p>
          </div>
        </div>
      )}

      {/* PHASE 3: MODAL "¿DESEÁS RESERVAR OTRO SERVICIO?" */}
      {showAskAnotherModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="card-aesthetic max-w-[430px] w-full p-6 text-center animate-in zoom-in-95 duration-200 relative my-auto shadow-2xl">
            {/* Close modal X button */}
            <button
              type="button"
              onClick={() => setShowAskAnotherModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#edf2ef] hover:bg-[#d8e2de] text-[#66716d] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Success icon */}
            <div className="w-14 h-14 rounded-full bg-[#123c32] text-[#d9f56a] flex items-center justify-center mx-auto mb-3.5 shadow-lg shadow-[#123c32]/25">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-[#efffc5] text-[#123c32] border border-[#d9f56a]/40 mb-1.5">
              ¡HORARIO ASIGNADO!
            </span>

            <h3 className="text-xl sm:text-2xl font-bold text-[#123c32] tracking-tight">
              ¿Deseás reservar otro servicio?
            </h3>
            <p className="text-xs text-[#66716d] mt-1 leading-relaxed max-w-xs mx-auto">
              Podés sumar otro tratamiento para el mismo día o en otra fecha antes de realizar el pago de la seña.
            </p>

            {/* Current Service Details Box */}
            <div className="mt-4 p-4 rounded-[20px] bg-[#f7faf7] border border-[#d8e2de] text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#123c32] truncate max-w-[220px]">
                  {currentService.title}
                </span>
                <span className="text-xs font-bold text-[#123c32]">
                  {formatPrice(currentService.price)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#66716d]">
                <CalendarIcon className="w-3.5 h-3.5 text-[#123c32]" />
                <span className="font-semibold text-[#18211f]">
                  {formattedDate} · {selectedTimeSlot} hs
                </span>
                <span>•</span>
                <span>{selectedSpecialist.name}</span>
              </div>

              <div className="pt-2 border-t border-[#d8e2de] flex justify-between text-xs font-bold text-[#195344]">
                <span>Seña correspondiente:</span>
                <span>{formatPrice(depositAmount)}</span>
              </div>
            </div>

            {/* Two Action Buttons */}
            <div className="mt-5 space-y-2.5">
              {/* Option 1: Yes, add another service */}
              <button
                type="button"
                onClick={() => {
                  setShowAskAnotherModal(false);
                  if (onAddAnotherService) {
                    onAddAnotherService(currentBookedItem);
                  } else {
                    onBackToServices();
                  }
                }}
                className="w-full py-4 px-4 rounded-[18px] bg-[#efffc5] hover:bg-[#d9f56a] text-[#123c32] font-bold text-xs sm:text-sm border border-[#d9f56a]/70 shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#123c32] stroke-[2.5]" />
                <span>Sí, quiero reservar otro servicio</span>
              </button>

              {/* Option 2: No, proceed to checkout */}
              <button
                type="button"
                onClick={() => {
                  setShowAskAnotherModal(false);
                  onProceedToCheckout(currentBookedItem);
                }}
                className="w-full py-4 px-4 rounded-[18px] bg-[#123c32] hover:bg-[#195344] text-white font-bold text-xs sm:text-sm shadow-[0_10px_24px_rgba(18,60,50,0.18)] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>No, continuar al pago de la reserva</span>
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
