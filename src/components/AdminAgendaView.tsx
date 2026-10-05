import React, { useState } from 'react';
import { Business, Appointment, Specialist } from '../types';
import { 
  Calendar as CalendarIcon, 
  LayoutGrid, 
  ListFilter, 
  Send, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  Users, 
  Sparkles, 
  Search, 
  Filter, 
  X, 
  Phone, 
  MapPin, 
  ShieldCheck,
  Check,
  CalendarDays
} from 'lucide-react';

interface AdminAgendaViewProps {
  business: Business;
  appointments: Appointment[];
  onUpdateAppointmentStatus: (id: string, newStatus: Appointment['status']) => void;
  onAddManualAppointmentClick: () => void;
  onSendWhatsAppReminder: (appt: Appointment) => void;
  formatPrice: (val: number) => string;
}

export const AdminAgendaView: React.FC<AdminAgendaViewProps> = ({
  business,
  appointments,
  onUpdateAppointmentStatus,
  onAddManualAppointmentClick,
  onSendWhatsAppReminder,
  formatPrice,
}) => {
  // View mode switcher: 'calendar' (Image 1 style) | 'cards' (Image 2 style) | 'timeline'
  const [viewMode, setViewMode] = useState<'calendar' | 'cards' | 'timeline'>('calendar');
  
  // Filters
  const [specialistFilter, setSpecialistFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calendar Date Navigation (Default: Octubre 2026)
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-based: 9 = October
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [selectedDayDate, setSelectedDayDate] = useState<string>('2026-10-23');

  // Modals & Popovers
  const [activeAppointmentDetail, setActiveAppointmentDetail] = useState<Appointment | null>(null);
  const [openMenuApptId, setOpenMenuApptId] = useState<string | null>(null);
  const [selectedDayModalDate, setSelectedDayModalDate] = useState<string | null>(null);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Filtered appointments for this business
  const businessAppointments = appointments.filter((a) => a.businessId === business.id);

  const filteredAppointments = businessAppointments.filter((a) => {
    if (specialistFilter !== 'all' && a.specialistId !== specialistFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = a.clientName.toLowerCase().includes(q);
      const matchService = a.serviceTitle.toLowerCase().includes(q);
      const matchSpecialist = a.specialistName.toLowerCase().includes(q);
      if (!matchName && !matchService && !matchSpecialist) return false;
    }
    return true;
  });

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

  // Generate 35 or 42 grid cells for the monthly calendar
  const getCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // In Argentina/ISO, Monday is 1st day. Sunday is 0 -> 6.
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; 
    const totalDays = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
    const days: {
      dayNumber: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      dateString: string;
      isWeekend: boolean;
      isPast: boolean;
    }[] = [];
    
    // Previous month filler days
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = currentMonth === 0 ? 11 : currentMonth - 1;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = (days.length + 1) % 7;
      days.push({
        dayNumber: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateString: dateStr,
        isWeekend: dayOfWeek === 6 || dayOfWeek === 0,
        isPast: true,
      });
    }
    
    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = (days.length + 1) % 7;
      days.push({
        dayNumber: d,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        dateString: dateStr,
        isWeekend: dayOfWeek === 6 || dayOfWeek === 0,
        isPast: d < 15 && currentMonth === 9 && currentYear === 2026,
      });
    }
    
    // Next month filler days (up to 35)
    const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = (days.length + 1) % 7;
      days.push({
        dayNumber: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        dateString: dateStr,
        isWeekend: dayOfWeek === 6 || dayOfWeek === 0,
        isPast: false,
      });
    }
    
    return days;
  };

  const calendarDays = getCalendarDays();

  // Helper to get appointments on a specific day
  const getAppointmentsForDay = (dateStr: string) => {
    return filteredAppointments.filter((a) => a.date === dateStr);
  };

  // Helper for status progress dashes (Image 2 style)
  const getStatusSegments = (status: Appointment['status']) => {
    switch (status) {
      case 'completado': return [true, true, true, true];
      case 'en_cabina': return [true, true, true, false];
      case 'confirmado': return [true, true, false, false];
      case 'pendiente_seña': return [true, false, false, false];
      case 'cancelado': return [false, false, false, false];
      default: return [true, true, false, false];
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmado':
        return { label: 'Confirmado', bg: 'bg-[#edf9f5]', text: 'text-[#062217]', border: 'border-[#dde4e0]' };
      case 'en_cabina':
        return { label: 'En Cabina', bg: 'bg-[#d0ef68]/20', text: 'text-[#171e00]', border: 'border-[#d0ef68]' };
      case 'completado':
        return { label: 'Completado', bg: 'bg-surface-container', text: 'text-secondary', border: 'border-surface-container-high' };
      case 'cancelado':
        return { label: 'Cancelado', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      default:
        return { label: status, bg: 'bg-surface-container', text: 'text-on-surface', border: 'border-surface-container-high' };
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* TOP BAR: HEADER, SEARCH, FILTERS & VIEW MODE SWITCHER */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
              Agenda de Pacientes & Turnos
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-xs font-bold">
              {filteredAppointments.length} turnos
            </span>
          </div>
          <p className="text-xs text-secondary mt-0.5">
            Vista adaptada para PC y tablet con distribución de cabinas, carga de especialistas y recordatorios WhatsApp.
          </p>
        </div>

        {/* Action Buttons & View Modes */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Switcher (Image 1 / Image 2 / Timeline) */}
          <div className="flex items-center p-1 bg-surface-container-low rounded-2xl border border-surface-container-high/70 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              title="Vista Calendario & Equipo (Estilo Imagen 1)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendario & Equipo</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Vista Tablero / Tarjetas (Estilo Imagen 2)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablero de Tarjetas</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              title="Vista Cronograma / Lista"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onAddManualAppointmentClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-md hover:bg-primary active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Turno Manual</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Bar (Specialist, Status, Search) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-secondary ml-1" />
          <input
            type="text"
            placeholder="Buscar por paciente, servicio o profesional..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-on-surface placeholder:text-secondary focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-secondary hover:text-on-surface p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Specialist Filter */}
          <select
            value={specialistFilter}
            onChange={(e) => setSpecialistFilter(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-xl bg-surface-container border border-surface-container-high text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Todas las Profesionales</option>
            {business.specialists.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.role})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold py-1.5 px-3 rounded-xl bg-surface-container border border-surface-container-high text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">Todos los Estados</option>
            <option value="confirmado">Confirmados (Seña MP)</option>
            <option value="en_cabina">En Cabina</option>
            <option value="completado">Completados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* ============================================================ */}
      {/* VISTA 1: CALENDARIO & EQUIPO (FIDELIDAD IMAGEN 1) */}
      {/* ============================================================ */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
          {/* Left Column: Team / Specialists Cards */}
          <div className="lg:col-span-4 xl:col-span-3.5 space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>Equipo & Profesionales</span>
              </span>
              {specialistFilter !== 'all' && (
                <button
                  onClick={() => setSpecialistFilter('all')}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  Ver todos
                </button>
              )}
            </div>

            {/* Specialist Cards */}
            <div className="space-y-3">
              {business.specialists.map((spec) => {
                const specAppointments = businessAppointments.filter((a) => a.specialistId === spec.id);
                const activeCount = specAppointments.length;
                const isSelected = specialistFilter === spec.id;

                return (
                  <div
                    key={spec.id}
                    onClick={() => setSpecialistFilter(isSelected ? 'all' : spec.id)}
                    className={`bg-surface-container-lowest rounded-3xl p-4 transition-all cursor-pointer border shadow-sm ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary-fixed/10'
                        : 'border-surface-container-high/70 hover:border-primary/40 hover:bg-surface-container-low/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={spec.avatar}
                          alt={spec.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-surface-container-high shadow-sm"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-on-surface truncate">
                          {spec.name}
                        </h4>
                        <p className="text-[11px] text-secondary truncate">
                          {spec.role}
                        </p>
                        <span className="inline-block mt-0.5 px-2 py-0.2 rounded-md bg-surface-container text-[10px] font-bold text-primary">
                          {activeCount} {activeCount === 1 ? 'turno' : 'turnos'} agendados
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Month Calendar Grid with Tiles & Striped Patterns (Image 1 style) */}
          <div className="lg:col-span-8 xl:col-span-8.5 bg-surface-container-lowest rounded-3xl p-4 sm:p-6 border border-surface-container-high/60 shadow-[0_10px_30px_rgba(6,34,23,0.04)] flex flex-col justify-between">
            <div>
              {/* Calendar Month Navigation Header */}
              <div className="flex items-center justify-between pb-4 border-b border-surface-container-high/60 gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors cursor-pointer"
                      title="Mes anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors cursor-pointer"
                      title="Mes siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-base sm:text-lg text-on-surface font-display">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentMonth(9);
                      setCurrentYear(2026);
                      setSelectedDayDate('2026-10-23');
                    }}
                    className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Hoy (Oct 2026)
                  </button>

                  {/* Legend */}
                  <div className="hidden sm:flex items-center gap-3 text-[11px] text-secondary ml-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#062217]"></span>
                      Confirmado MP
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d0ef68]"></span>
                      En Cabina
                    </span>
                  </div>
                </div>
              </div>

              {/* Days of Week Row Header */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-semibold text-secondary py-3">
                {daysLabels.map((lbl, idx) => (
                  <div
                    key={lbl}
                    className={`py-1 ${idx >= 5 ? 'text-amber-800/80 font-bold' : ''}`}
                  >
                    {lbl}
                  </div>
                ))}
              </div>

              {/* 7-column Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {calendarDays.map((day, idx) => {
                  const dayAppts = getAppointmentsForDay(day.dateString);
                  const isSelected = selectedDayDate === day.dateString;
                  const isToday = day.dateString === '2026-10-23';

                  // Diagonal striped background class for past or non-month days (Image 1 style)
                  const isHatched = !day.isCurrentMonth || day.isPast;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedDayDate(day.dateString);
                        if (dayAppts.length > 0) {
                          setSelectedDayModalDate(day.dateString);
                        }
                      }}
                      className={`min-h-[72px] sm:min-h-[88px] rounded-2xl p-1.5 sm:p-2 transition-all flex flex-col justify-between relative cursor-pointer border ${
                        isSelected
                          ? 'border-[#062217] ring-2 ring-[#062217]/20 shadow-md'
                          : 'border-surface-container-high/40 hover:border-primary/40'
                      } ${
                        isToday
                          ? 'bg-[#d0ef68]/15 border-[#d0ef68]'
                          : isHatched
                          ? 'bg-[repeating-linear-gradient(45deg,#fafcfb,#fafcfb_5px,#f3f6f5_5px,#f3f6f5_10px)] text-secondary/60'
                          : 'bg-surface-container-low/60 hover:bg-surface-container-low text-on-surface'
                      }`}
                    >
                      {/* Day number top row */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                            isToday
                              ? 'bg-[#d0ef68] text-[#171e00] shadow-sm font-extrabold'
                              : isSelected
                              ? 'bg-surface-container-high font-extrabold text-[#062217]'
                              : day.isCurrentMonth
                              ? 'text-on-surface'
                              : 'text-secondary/50'
                          }`}
                        >
                          {day.dayNumber}
                        </span>

                        {dayAppts.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-[#062217]"></span>
                        )}
                      </div>

                      {/* Appointments Horizontal Pills (Image 1 style) */}
                      <div className="mt-1 space-y-1">
                        {dayAppts.slice(0, 2).map((appt) => {
                          const isEnCabina = appt.status === 'en_cabina';
                          return (
                            <div
                              key={appt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAppointmentDetail(appt);
                              }}
                              title={`${appt.time} - ${appt.clientName}: ${appt.serviceTitle}`}
                              className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold truncate flex items-center gap-1 shadow-xs transition-transform active:scale-95 ${
                                isEnCabina
                                  ? 'bg-[#d0ef68] text-[#171e00] font-extrabold border border-[#b5d24e]'
                                  : 'bg-[#062217] text-white'
                              }`}
                            >
                              <span className="text-[9px] opacity-90">{appt.time}</span>
                              <span className="truncate">{appt.clientName.split(' ')[0]}</span>
                            </div>
                          );
                        })}

                        {dayAppts.length > 2 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDayDate(day.dateString);
                              setSelectedDayModalDate(day.dateString);
                            }}
                            className="w-full py-0.5 text-[9px] text-[#062217] font-extrabold bg-[#d0ef68]/70 hover:bg-[#d0ef68] rounded-md transition-colors cursor-pointer text-center block shadow-xs active:scale-95"
                          >
                            +{dayAppts.length - 2} más
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Agenda Inline Strip (replaces unnecessary pagination) */}
            {selectedDayDate && (
              <div className="mt-4 pt-3.5 border-t border-surface-container-high/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#062217] text-[#d0ef68] flex items-center justify-center font-bold text-xs shrink-0">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-on-surface">
                        Día {selectedDayDate}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#d0ef68] text-[#171e00] font-bold text-[10px]">
                        {getAppointmentsForDay(selectedDayDate).length} {getAppointmentsForDay(selectedDayDate).length === 1 ? 'turno' : 'turnos'}
                      </span>
                    </div>
                    <span className="text-[11px] text-secondary">
                      {getAppointmentsForDay(selectedDayDate).length > 0
                        ? `${getAppointmentsForDay(selectedDayDate).map((a) => a.time).sort().join(' • ')} hs`
                        : 'Sin turnos registrados'}
                    </span>
                  </div>
                </div>

                {getAppointmentsForDay(selectedDayDate).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedDayModalDate(selectedDayDate)}
                    className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-[#062217] hover:bg-[#1d382b] text-[#d0ef68] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Ver todos ({getAppointmentsForDay(selectedDayDate).length})</span>
                    <span className="material-symbols-outlined text-[15px]">visibility</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VISTA 2: TABLERO DE TARJETAS (FIDELIDAD IMAGEN 2) */}
      {/* ============================================================ */}
      {viewMode === 'cards' && (
        <div className="animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAppointments.map((appt) => {
              const segments = getStatusSegments(appt.status);
              const badge = getStatusBadge(appt.status);
              const isMenuOpen = openMenuApptId === appt.id;

              return (
                <div
                  key={appt.id}
                  onClick={() => setActiveAppointmentDetail(appt)}
                  className={`rounded-3xl p-4 sm:p-5 transition-all shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between relative group ${badge.bg} ${badge.border} border`}
                >
                  {/* Card Header: Service Title + 3 dots menu button */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                        {appt.serviceTitle}
                      </h4>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuApptId(isMenuOpen ? null : appt.id);
                          }}
                          className="w-7 h-7 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-slate-700 transition-colors shadow-xs"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-8 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                          >
                            <button
                              onClick={() => {
                                onSendWhatsAppReminder(appt);
                                setOpenMenuApptId(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                            >
                              <Send className="w-3.5 h-3.5 text-[#25D366]" />
                              <span>Recordatorio WhatsApp</span>
                            </button>
                            <button
                              onClick={() => {
                                onUpdateAppointmentStatus(appt.id, 'en_cabina');
                                setOpenMenuApptId(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#006b53]" />
                              <span>Marcar: En Cabina</span>
                            </button>
                            <button
                              onClick={() => {
                                onUpdateAppointmentStatus(appt.id, 'completado');
                                setOpenMenuApptId(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Marcar: Completado</span>
                            </button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button
                              onClick={() => {
                                onUpdateAppointmentStatus(appt.id, 'cancelado');
                                setOpenMenuApptId(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <X className="w-3.5 h-3.5 text-red-500" />
                              <span>Cancelar Turno</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Middle: 4-dash segmented status track (Image 2 style) */}
                    <div className="my-3.5">
                      <div className="flex items-center gap-1.5">
                        {segments.map((filled, idx) => (
                          <div
                            key={idx}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              filled ? 'bg-slate-900' : 'bg-slate-300/80'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-medium">
                        <span className="capitalize">{badge.label}</span>
                        <span>Seña MP: {formatPrice(appt.depositPaid)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Client Avatar + Name + Date/Time + WhatsApp Button */}
                  <div className="pt-2 border-t border-slate-900/10 flex items-center justify-between gap-2 mt-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-white">
                        {appt.clientName.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {appt.clientName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {appt.date} · {appt.time} hs
                        </p>
                      </div>
                    </div>

                    {/* Quick WhatsApp Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSendWhatsAppReminder(appt);
                      }}
                      title="Enviar recordatorio por WhatsApp"
                      className="w-8 h-8 rounded-full bg-white hover:bg-[#25D366] text-[#006b53] hover:text-white flex items-center justify-center shadow-sm transition-all active:scale-95 cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="p-12 text-center text-secondary text-xs bg-surface-container-lowest rounded-3xl border border-surface-container-high/60">
              No hay turnos que coincidan con los filtros seleccionados.
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* VISTA 3: LISTA CRONOLÓGICA TRADICIONAL */}
      {/* ============================================================ */}
      {viewMode === 'timeline' && (
        <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-[0_10px_30px_rgba(0,70,55,0.04)] border border-surface-container-high/60 space-y-3 animate-in fade-in duration-200">
          {filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-secondary text-xs">
              No hay turnos registrados en este momento.
            </div>
          ) : (
            filteredAppointments.map((appt) => (
              <div
                key={appt.id}
                className="p-3.5 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all border border-surface-container-high/40 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Time & Client */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest flex flex-col items-center justify-center text-primary font-bold shadow-sm border border-surface-container-high/40 shrink-0">
                    <span className="text-sm leading-none">{appt.time}</span>
                    <span className="text-[10px] text-secondary mt-0.5">{appt.durationMinutes}m</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-on-surface truncate">{appt.clientName}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-on-primary-fixed-variant">
                        Seña Pagada ✅
                      </span>
                    </div>

                    <p className="text-xs text-secondary mt-0.5 truncate">
                      {appt.serviceTitle} · Con {appt.specialistName}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1 flex-wrap">
                      <span>WhatsApp: <strong>{appt.clientPhone}</strong></span>
                      <span>·</span>
                      <span>Fecha: <strong>{appt.date}</strong></span>
                      <span>·</span>
                      <span>A cobrar: <strong className="text-primary font-bold">{formatPrice(appt.remainingBalance)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions & Status */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-surface-container-high/60">
                  <button
                    onClick={() => onSendWhatsAppReminder(appt)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                    title="Enviar recordatorio con Google Maps y saldo por WhatsApp"
                  >
                    <Send className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>

                  <select
                    value={appt.status}
                    onChange={(e) => onUpdateAppointmentStatus(appt.id, e.target.value as Appointment['status'])}
                    className="text-xs font-semibold py-2 px-3 rounded-full bg-surface-container-lowest border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary text-on-surface cursor-pointer"
                  >
                    <option value="confirmado">Confirmado</option>
                    <option value="en_cabina">En Cabina</option>
                    <option value="completado">Completado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* QUICK APPOINTMENT ACTION MODAL */}
      {/* ============================================================ */}
      {activeAppointmentDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl max-w-sm sm:max-w-md w-full p-6 text-on-surface shadow-2xl border border-surface-container-high animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-container/20 text-primary flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface leading-tight">
                    Detalles del Turno
                  </h3>
                  <span className="text-[11px] text-secondary">ID: #{activeAppointmentDetail.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveAppointmentDetail(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high/40">
                <span className="text-secondary block text-[11px]">Tratamiento</span>
                <p className="font-bold text-sm text-on-surface mt-0.5">
                  {activeAppointmentDetail.serviceTitle}
                </p>
                <div className="flex items-center gap-3 text-secondary mt-1">
                  <span>Profesional: <strong className="text-on-surface">{activeAppointmentDetail.specialistName}</strong></span>
                  <span>·</span>
                  <span>Duración: <strong className="text-on-surface">{activeAppointmentDetail.durationMinutes} min</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-surface-container-low">
                  <span className="text-secondary block text-[10px]">Fecha & Hora</span>
                  <span className="font-bold text-on-surface block mt-0.5">
                    {activeAppointmentDetail.date} · {activeAppointmentDetail.time} hs
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low">
                  <span className="text-secondary block text-[10px]">Paciente</span>
                  <span className="font-bold text-on-surface block mt-0.5 truncate">
                    {activeAppointmentDetail.clientName}
                  </span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-3 rounded-xl bg-surface-container-low/70 space-y-1.5 border border-surface-container-high/40">
                <div className="flex items-center justify-between">
                  <span className="text-secondary">Precio Total del Servicio:</span>
                  <span className="font-bold text-on-surface">{formatPrice(activeAppointmentDetail.totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-primary font-bold">
                  <span>Seña Abonada (Mercado Pago):</span>
                  <span>- {formatPrice(activeAppointmentDetail.depositPaid)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-surface-container-high/60 font-extrabold text-sm">
                  <span>Saldo a Cobrar en Local:</span>
                  <span className="text-emerald-700">{formatPrice(activeAppointmentDetail.remainingBalance)}</span>
                </div>
              </div>

              {/* Status Switcher in Modal */}
              <div>
                <label className="block text-secondary font-semibold mb-1">
                  Estado del Turno
                </label>
                <select
                  value={activeAppointmentDetail.status}
                  onChange={(e) => {
                    const next = e.target.value as Appointment['status'];
                    onUpdateAppointmentStatus(activeAppointmentDetail.id, next);
                    setActiveAppointmentDetail((prev) => prev ? { ...prev, status: next } : null);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-surface-container border border-surface-container-high font-semibold text-xs text-on-surface cursor-pointer"
                >
                  <option value="confirmado">Confirmado (Seña MP)</option>
                  <option value="en_cabina">En Cabina (Atendiendo)</option>
                  <option value="completado">Completado (Saldado)</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSendWhatsAppReminder(activeAppointmentDetail)}
                className="flex-1 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Recordatorio WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAppointmentDetail(null)}
                className="px-4 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL AGENDA COMPLETA DEL DÍA (VER TODOS LOS TURNOS) */}
      {/* ============================================================ */}
      {selectedDayModalDate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-5 sm:p-6 text-on-surface shadow-2xl border border-surface-container-high/70 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-surface-container-high/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#062217] text-[#d0ef68] flex items-center justify-center font-bold shadow-sm shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg text-on-surface font-display leading-tight">
                      Agenda del {selectedDayModalDate}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#d0ef68] text-[#171e00] font-bold text-[10px]">
                      {getAppointmentsForDay(selectedDayModalDate).length} {getAppointmentsForDay(selectedDayModalDate).length === 1 ? 'turno' : 'turnos'}
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-0.5">
                    Todos los servicios y pacientes asignados a cabina
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayModalDate(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-secondary hover:text-on-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Bar of the Day */}
            {getAppointmentsForDay(selectedDayModalDate).length > 0 && (
              <div className="grid grid-cols-3 gap-2 py-2.5 my-1 bg-surface-container-low/60 rounded-2xl p-2.5 border border-surface-container-high/40 text-center shrink-0">
                <div>
                  <span className="text-[10px] text-secondary block font-medium">Turnos</span>
                  <strong className="text-xs text-on-surface font-bold">
                    {getAppointmentsForDay(selectedDayModalDate).length}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-secondary block font-medium">Señas MP</span>
                  <strong className="text-xs text-emerald-700 font-mono font-bold">
                    {formatPrice(
                      getAppointmentsForDay(selectedDayModalDate).reduce((sum, a) => sum + a.depositPaid, 0)
                    )}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-secondary block font-medium">Saldo en Local</span>
                  <strong className="text-xs text-on-surface font-mono font-bold">
                    {formatPrice(
                      getAppointmentsForDay(selectedDayModalDate).reduce((sum, a) => sum + a.remainingBalance, 0)
                    )}
                  </strong>
                </div>
              </div>
            )}

            {/* Scrollable list of ALL appointments for that day */}
            <div className="overflow-y-auto py-2 space-y-3 flex-1 pr-1">
              {getAppointmentsForDay(selectedDayModalDate).length === 0 ? (
                <div className="py-12 text-center text-secondary">
                  <CalendarDays className="w-10 h-10 mx-auto text-secondary/40 mb-2" />
                  <p className="font-semibold text-xs text-on-surface">No hay turnos registrados en este día.</p>
                </div>
              ) : (
                [...getAppointmentsForDay(selectedDayModalDate)]
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((appt) => {
                    const isEnCabina = appt.status === 'en_cabina';
                    const isConfirmado = appt.status === 'confirmado';

                    return (
                      <div
                        key={appt.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isEnCabina
                            ? 'bg-[#d0ef68]/15 border-[#d0ef68] ring-1 ring-[#d0ef68]'
                            : 'bg-surface-container-low/70 border-surface-container-high/60 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 ${
                                isEnCabina
                                  ? 'bg-[#062217] text-[#d0ef68]'
                                  : 'bg-white text-[#062217] border border-surface-container-high shadow-xs'
                              }`}
                            >
                              <Clock className="w-3 h-3 text-[#d0ef68]" />
                              {appt.time} hs
                            </span>

                            <span className="text-[10px] text-secondary font-mono">
                              #{appt.id}
                            </span>
                          </div>

                          {/* Status Select */}
                          <select
                            value={appt.status}
                            onChange={(e) => {
                              const next = e.target.value as Appointment['status'];
                              onUpdateAppointmentStatus(appt.id, next);
                            }}
                            className={`text-[11px] font-bold py-1 px-2.5 rounded-full cursor-pointer border ${
                              isEnCabina
                                ? 'bg-[#d0ef68] text-[#171e00] border-[#b5d24e]'
                                : isConfirmado
                                ? 'bg-[#062217] text-white border-[#062217]'
                                : appt.status === 'completado'
                                ? 'bg-surface-container text-secondary border-surface-container-high'
                                : 'bg-red-100 text-red-700 border-red-200'
                            }`}
                          >
                            <option value="confirmado">Confirmado</option>
                            <option value="en_cabina">En Cabina</option>
                            <option value="completado">Completado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>

                        {/* Treatment & Specialist */}
                        <div className="mt-2.5">
                          <h4 className="font-bold text-sm text-on-surface">
                            {appt.serviceTitle}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-secondary mt-1 flex-wrap">
                            <span className="text-on-surface font-semibold">
                              Paciente: {appt.clientName}
                            </span>
                            <span>•</span>
                            <span className="text-primary font-medium">
                              Atiende: {appt.specialistName}
                            </span>
                            <span>•</span>
                            <span>{appt.durationMinutes} min</span>
                          </div>
                          {appt.clientNotes && (
                            <p className="text-[11px] text-secondary/90 italic mt-1.5 bg-white/70 p-2 rounded-xl border border-surface-container-high/40">
                              "{appt.clientNotes}"
                            </p>
                          )}
                        </div>

                        {/* Financials & Actions */}
                        <div className="mt-3 pt-2.5 border-t border-surface-container-high/40 flex items-center justify-between gap-2 flex-wrap">
                          <div className="text-xs">
                            <span className="text-secondary">Seña MP: </span>
                            <strong className="text-emerald-700 font-mono">{formatPrice(appt.depositPaid)}</strong>
                            <span className="text-secondary ml-2">Saldo: </span>
                            <strong className="text-on-surface font-mono">{formatPrice(appt.remainingBalance)}</strong>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                onSendWhatsAppReminder(appt);
                              }}
                              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs"
                              title="Enviar WhatsApp"
                            >
                              <Send className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDayModalDate(null);
                                setActiveAppointmentDetail(appt);
                              }}
                              className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white hover:bg-surface-container text-on-surface border border-surface-container-high transition-all cursor-pointer shadow-xs"
                            >
                              Ver Ficha
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-surface-container-high/60 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedDayModalDate(null);
                  onAddManualAppointmentClick();
                }}
                className="px-4 py-2 rounded-full bg-primary-container hover:bg-[#b5d24e] text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar Turno en esta fecha</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDayModalDate(null)}
                className="px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
