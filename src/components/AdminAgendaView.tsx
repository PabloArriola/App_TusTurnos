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
  CalendarDays,
  User,
  Copy,
  MessageCircle,
  CheckCheck,
  History
} from 'lucide-react';

interface AdminAgendaViewProps {
  business: Business;
  appointments: Appointment[];
  onUpdateAppointmentStatus: (id: string, newStatus: Appointment['status']) => void;
  onAddManualAppointmentClick: () => void;
  onSendWhatsAppReminder: (appt: Appointment) => void;
  formatPrice: (val: number) => string;
}

export type AppointmentCategory = 'proximo' | 'en_cabina' | 'atendido' | 'cancelado';

export const AdminAgendaView: React.FC<AdminAgendaViewProps> = ({
  business,
  appointments,
  onUpdateAppointmentStatus,
  onAddManualAppointmentClick,
  onSendWhatsAppReminder,
  formatPrice,
}) => {
  // View mode switcher: 'calendar' | 'cards' | 'timeline'
  const [viewMode, setViewMode] = useState<'calendar' | 'cards' | 'timeline'>('calendar');
  
  // Real-time dynamic today
  const today = new Date();
  const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Filters
  const [specialistFilter, setSpecialistFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'upcoming_only' | 'past_only'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calendar Date Navigation
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [selectedDayDate, setSelectedDayDate] = useState<string>(todayDateString);

  // Modals & Popovers
  const [activeAppointmentDetail, setActiveAppointmentDetail] = useState<Appointment | null>(null);
  const [openMenuApptId, setOpenMenuApptId] = useState<string | null>(null);
  const [selectedDayModalDate, setSelectedDayModalDate] = useState<string | null>(null);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Helper: determine if an appointment is upcoming, in cabin, attended or cancelled
  const getAppointmentCategory = (appt: Appointment, referenceTodayStr = todayDateString): AppointmentCategory => {
    if (appt.status === 'cancelado') return 'cancelado';
    if (appt.status === 'en_cabina') return 'en_cabina';
    if (appt.status === 'completado') return 'atendido';

    // If date is before reference day, it has already passed -> Atendido
    if (appt.date < referenceTodayStr) return 'atendido';

    // If it's today, check if time + duration has finished
    if (appt.date === referenceTodayStr) {
      const [h, m] = (appt.time || '00:00').split(':').map(Number);
      const endMinutes = (h || 0) * 60 + (m || 0) + (appt.durationMinutes || 45);
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (currentMinutes > endMinutes) {
        return 'atendido';
      }
    }

    return 'proximo';
  };

  // Filtered appointments for this business
  const businessAppointments = appointments.filter((a) => a.businessId === business.id);

  // Count active upcoming vs historical attended across business
  const totalActiveUpcoming = businessAppointments.filter(
    (a) => getAppointmentCategory(a) === 'proximo' || getAppointmentCategory(a) === 'en_cabina'
  ).length;
  const totalAttendedPast = businessAppointments.filter(
    (a) => getAppointmentCategory(a) === 'atendido'
  ).length;

  const filteredAppointments = businessAppointments.filter((a) => {
    if (specialistFilter !== 'all' && a.specialistId !== specialistFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;

    const cat = getAppointmentCategory(a);
    if (scopeFilter === 'upcoming_only') {
      if (cat !== 'proximo' && cat !== 'en_cabina') return false;
    } else if (scopeFilter === 'past_only') {
      if (cat !== 'atendido') return false;
    }

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
        isPast: dateStr < todayDateString,
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
        isPast: dateStr < todayDateString,
      });
    }
    
    // Next month filler days (up to 35 or 42)
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
        isPast: dateStr < todayDateString,
      });
    }

    return days;
  };

  const calendarDays = getCalendarDays();

  // Helper to get appointments on a specific day
  const getAppointmentsForDay = (dateStr: string) => {
    return filteredAppointments.filter((a) => a.date === dateStr);
  };

  // Helper for status progress dashes
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

  const getStatusBadge = (status: Appointment['status'], category: AppointmentCategory) => {
    if (category === 'atendido') {
      return { 
        label: 'Ya Atendido', 
        bg: 'bg-slate-100/90', 
        text: 'text-slate-600', 
        border: 'border-slate-200' 
      };
    }
    switch (status) {
      case 'confirmado':
        return { label: 'Confirmado MP', bg: 'bg-[#edf9f5]', text: 'text-[#062217]', border: 'border-[#dde4e0]' };
      case 'en_cabina':
        return { label: 'En Cabina Ahora', bg: 'bg-[#d0ef68]/25', text: 'text-[#171e00]', border: 'border-[#d0ef68]' };
      case 'completado':
        return { label: 'Completado', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' };
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
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
              Agenda de Pacientes & Turnos
            </h2>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#D9E6D3] text-[#2F3E3A] text-xs font-bold border border-[#A8BDA3]/60 flex items-center gap-1 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#2F3E3A]"></span>
                {totalActiveUpcoming} {totalActiveUpcoming === 1 ? 'próximo por atender' : 'próximos por atender'}
              </span>
              {totalAttendedPast > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200 flex items-center gap-1">
                  <CheckCheck className="w-3 h-3 text-slate-400" />
                  {totalAttendedPast} ya atendidos
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-secondary mt-0.5">
            Los turnos próximos se destacan en verde prioritario. Los turnos ya atendidos o de fechas pasadas se muestran en gris neutro para no distraer.
          </p>
        </div>

        {/* Action Buttons & View Modes */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-surface-container-low rounded-2xl border border-surface-container-high/70 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              title="Vista Calendario & Equipo"
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
              title="Vista Tablero de Tarjetas"
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

      {/* Quick Filter Bar (Scope, Specialist, Status, Search) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-sm">
        {/* Scope quick buttons (Solo Activos / Todos / Ya Atendidos) */}
        <div className="flex items-center p-0.5 bg-surface-container rounded-xl gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setScopeFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              scopeFilter === 'all'
                ? 'bg-white text-on-surface shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            Todos ({businessAppointments.length})
          </button>
          <button
            type="button"
            onClick={() => setScopeFilter('upcoming_only')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              scopeFilter === 'upcoming_only'
                ? 'bg-[#2F3E3A] text-white shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D9E6D3]"></span>
            <span>Solo Próximos ({totalActiveUpcoming})</span>
          </button>
          <button
            type="button"
            onClick={() => setScopeFilter('past_only')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              scopeFilter === 'past_only'
                ? 'bg-slate-200 text-slate-800 shadow-xs'
                : 'text-secondary hover:text-on-surface'
            }`}
          >
            <History className="w-3 h-3 text-slate-500" />
            <span>Ya Atendidos ({totalAttendedPast})</span>
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-secondary ml-1 shrink-0" />
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

        {/* Dropdown Filters */}
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

            {/* Specialist Cards with Active Upcoming vs Attended breakdown */}
            <div className="space-y-3">
              {business.specialists.map((spec) => {
                const specAppointments = businessAppointments.filter((a) => a.specialistId === spec.id);
                const specUpcoming = specAppointments.filter(
                  (a) => getAppointmentCategory(a) === 'proximo' || getAppointmentCategory(a) === 'en_cabina'
                ).length;
                const specAttended = specAppointments.filter(
                  (a) => getAppointmentCategory(a) === 'atendido'
                ).length;

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
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white ${
                          specUpcoming > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                        }`}></span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-on-surface truncate">
                          {spec.name}
                        </h4>
                        <p className="text-[11px] text-secondary truncate">
                          {spec.role}
                        </p>
                        
                        {/* Active vs Attended breakdown */}
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            specUpcoming > 0
                              ? 'bg-[#D9E6D3] text-[#2F3E3A] border border-[#A8BDA3]/60'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {specUpcoming > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#2F3E3A]"></span>}
                            <span>{specUpcoming} {specUpcoming === 1 ? 'activo por atender' : 'activos por atender'}</span>
                          </span>
                          
                          {specAttended > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium">
                              · {specAttended} atendidos
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Month Calendar Grid with Tiles & Visual Distinction */}
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

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentMonth(today.getMonth());
                      setCurrentYear(today.getFullYear());
                      setSelectedDayDate(todayDateString);
                    }}
                    className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Hoy
                  </button>

                  {/* Legend distinguishing Active vs In Cabin vs Attended */}
                  <div className="hidden sm:flex items-center gap-2.5 text-[11px] text-secondary ml-2 flex-wrap">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2F3E3A]"></span>
                      Por Atender
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d0ef68] border border-[#b5d24e]"></span>
                      En Cabina
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-500">
                      <span className="w-2.5 h-2.5 rounded-md bg-slate-200 border border-slate-300 flex items-center justify-center text-[8px] font-bold">✓</span>
                      Ya Atendido (Neutro)
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
                  const isToday = day.dateString === todayDateString;

                  // Determine if day has upcoming appointments vs only past appointments
                  const hasUpcoming = dayAppts.some(
                    (a) => getAppointmentCategory(a) === 'proximo' || getAppointmentCategory(a) === 'en_cabina'
                  );
                  const hasOnlyAttended = dayAppts.length > 0 && !hasUpcoming;

                  // Past or other-month background style
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
                          ? 'border-[#2F3E3A] ring-2 ring-[#2F3E3A]/20 shadow-md'
                          : 'border-surface-container-high/40 hover:border-primary/40'
                      } ${
                        isToday
                          ? 'bg-[#D9E6D3]/40 border-[#A8BDA3]'
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
                              ? 'bg-[#2F3E3A] text-white shadow-sm font-extrabold'
                              : isSelected
                              ? 'bg-surface-container-high font-extrabold text-[#2F3E3A]'
                              : day.isCurrentMonth
                              ? 'text-on-surface'
                              : 'text-secondary/50'
                          }`}
                        >
                          {day.dayNumber}
                        </span>

                        {/* Status dot indicator for the day */}
                        {hasUpcoming && (
                          <span className="w-2 h-2 rounded-full bg-[#2F3E3A]" title="Tiene turnos próximos por atender"></span>
                        )}
                        {hasOnlyAttended && (
                          <span className="w-2 h-2 rounded-full bg-slate-300" title="Turnos ya atendidos en historial"></span>
                        )}
                      </div>

                      {/* Appointments Horizontal Pills (Visual differentiation) */}
                      <div className="mt-1 space-y-1">
                        {dayAppts.slice(0, 2).map((appt) => {
                          const cat = getAppointmentCategory(appt);
                          const isEnCabina = cat === 'en_cabina';
                          const isAtendido = cat === 'atendido';
                          const isCancelado = cat === 'cancelado';

                          return (
                            <div
                              key={appt.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveAppointmentDetail(appt);
                              }}
                              title={`${appt.time} - ${appt.clientName}: ${appt.serviceTitle} (${isAtendido ? 'Ya Atendido' : isEnCabina ? 'En Cabina' : 'Próximo'})`}
                              className={`px-1.5 py-0.5 rounded-lg text-[10px] truncate flex items-center gap-1 shadow-xs transition-all active:scale-95 ${
                                isEnCabina
                                  ? 'bg-[#d0ef68] text-[#171e00] font-extrabold border border-[#b5d24e]'
                                  : isAtendido
                                  ? 'bg-slate-100/90 text-slate-500 border border-slate-200/90 font-medium opacity-80 hover:opacity-100 hover:bg-slate-200/70'
                                  : isCancelado
                                  ? 'bg-stone-100 text-stone-400 line-through opacity-50 border border-stone-200'
                                  : 'bg-[#2F3E3A] text-white font-bold hover:bg-[#3d4f4a]'
                              }`}
                            >
                              {/* Icon indicator */}
                              {isAtendido && (
                                <span className="text-[9px] font-bold text-slate-400 shrink-0">✓</span>
                              )}
                              {isEnCabina && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#171e00] animate-pulse shrink-0"></span>
                              )}
                              {!isAtendido && !isEnCabina && !isCancelado && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D9E6D3] shrink-0"></span>
                              )}

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
                            className={`w-full py-0.5 text-[9px] font-extrabold rounded-md transition-colors cursor-pointer text-center block shadow-xs active:scale-95 ${
                              hasUpcoming
                                ? 'text-[#2F3E3A] bg-[#D9E6D3] hover:bg-[#A8BDA3]'
                                : 'text-slate-600 bg-slate-200/80 hover:bg-slate-300'
                            }`}
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

            {/* Selected Day Agenda Inline Strip */}
            {selectedDayDate && (() => {
              const dayAppts = getAppointmentsForDay(selectedDayDate);
              const count = dayAppts.length;

              return (
                <div className="mt-4 pt-3.5 border-t border-surface-container-high/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      count > 0 ? 'bg-[#2F3E3A] text-[#D9E6D3]' : 'bg-surface-container text-secondary'
                    }`}>
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-on-surface">
                          Día {selectedDayDate}
                        </span>
                        {count > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#D9E6D3] text-[#2F3E3A] font-bold text-[10px] border border-[#A8BDA3]/60">
                            {count} {count === 1 ? 'turno' : 'turnos'}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-secondary mt-0.5 block">
                        {count > 0
                          ? dayAppts.map((a) => `${a.time} hs (${a.clientName.split(' ')[0]})`).sort().join(' · ')
                          : 'Sin turnos agendados en este día'}
                      </span>
                    </div>
                  </div>

                  {count > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedDayModalDate(selectedDayDate)}
                      className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-[#2F3E3A] hover:bg-[#3d4f4a] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>Ver todos ({count})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })()}
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
              const cat = getAppointmentCategory(appt);
              const isAtendido = cat === 'atendido';
              const segments = getStatusSegments(appt.status);
              const badge = getStatusBadge(appt.status, cat);
              const isMenuOpen = openMenuApptId === appt.id;

              return (
                <div
                  key={appt.id}
                  onClick={() => setActiveAppointmentDetail(appt)}
                  className={`rounded-3xl p-4 sm:p-5 transition-all cursor-pointer flex flex-col justify-between relative group border ${
                    isAtendido 
                      ? 'bg-slate-50/80 border-slate-200 opacity-80 hover:opacity-100 hover:shadow-sm' 
                      : `${badge.bg} ${badge.border} shadow-sm hover:shadow-md`
                  }`}
                >
                  {/* Card Header: Service Title + 3 dots menu button */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold mb-1.5 ${
                          isAtendido
                            ? 'bg-slate-200 text-slate-600'
                            : cat === 'en_cabina'
                            ? 'bg-[#d0ef68] text-[#171e00]'
                            : 'bg-[#D9E6D3] text-[#2F3E3A]'
                        }`}>
                          {isAtendido && <span>✓ Ya Atendido</span>}
                          {cat === 'en_cabina' && <span>⚡ En Cabina</span>}
                          {cat === 'proximo' && <span>⏳ Por Atender</span>}
                          {cat === 'cancelado' && <span>✕ Cancelado</span>}
                        </span>

                        <h4 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                          {appt.serviceTitle}
                        </h4>
                      </div>

                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuApptId(isMenuOpen ? null : appt.id);
                          }}
                          className="w-7 h-7 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-slate-700 transition-colors shadow-xs"
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

                    {/* Middle: 4-dash segmented status track */}
                    <div className="my-3.5">
                      <div className="flex items-center gap-1.5">
                        {segments.map((filled, idx) => (
                          <div
                            key={idx}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              filled ? (isAtendido ? 'bg-slate-400' : 'bg-slate-900') : 'bg-slate-200'
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
      {/* VISTA 3: LISTA CRONOLÓGICA */}
      {/* ============================================================ */}
      {viewMode === 'timeline' && (
        <div className="bg-surface-container-lowest rounded-3xl p-4 shadow-[0_10px_30px_rgba(0,70,55,0.04)] border border-surface-container-high/60 space-y-3 animate-in fade-in duration-200">
          {filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-secondary text-xs">
              No hay turnos registrados en este momento.
            </div>
          ) : (
            filteredAppointments.map((appt) => {
              const cat = getAppointmentCategory(appt);
              const isAtendido = cat === 'atendido';

              return (
                <div
                  key={appt.id}
                  className={`p-3.5 rounded-2xl transition-all border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isAtendido
                      ? 'bg-slate-50/70 border-slate-200 opacity-80 hover:opacity-100'
                      : 'bg-surface-container-low hover:bg-surface-container border-surface-container-high/40'
                  }`}
                >
                  {/* Time & Client */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm border shrink-0 ${
                      isAtendido
                        ? 'bg-slate-100 text-slate-500 border-slate-200'
                        : 'bg-surface-container-lowest text-primary border-surface-container-high/40'
                    }`}>
                      <span className="text-sm leading-none">{appt.time}</span>
                      <span className="text-[10px] text-secondary mt-0.5">{appt.durationMinutes}m</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-on-surface truncate">{appt.clientName}</h4>
                        {isAtendido ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 flex items-center gap-1">
                            <CheckCheck className="w-3 h-3 text-slate-500" />
                            <span>Ya Atendido</span>
                          </span>
                        ) : cat === 'en_cabina' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#d0ef68] text-[#171e00]">
                            ⚡ En Cabina
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D9E6D3] text-[#2F3E3A]">
                            ⏳ Por Atender
                          </span>
                        )}
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
                      title="Enviar recordatorio por WhatsApp"
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
              );
            })
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DETALLE DE TURNO SELECCIONADO (ESTILO BOUTIQUE SPA) */}
      {/* ============================================================ */}
      {activeAppointmentDetail && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white text-[#2F3E3A] rounded-[32px] max-w-sm sm:max-w-md w-full p-5 sm:p-6 shadow-[0_25px_60px_rgba(47,62,58,0.25)] border border-[#A8BDA3]/50 animate-in zoom-in-95 duration-200 space-y-3.5 my-auto relative overflow-hidden">
            {/* Subtle luxury glow accent */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#D9E6D3]/35 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#A8BDA3]/40 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#2F3E3A] text-[#D9E6D3] flex items-center justify-center shadow-md shadow-[#2F3E3A]/20 shrink-0">
                  <CalendarDays className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#2F3E3A] leading-tight">
                    Detalles del Turno
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-xs font-semibold text-[#6F8A78]">
                      #{activeAppointmentDetail.id}
                    </span>
                    <span className="text-[10px] text-[#A8BDA3]">·</span>
                    {(() => {
                      const cat = getAppointmentCategory(activeAppointmentDetail);
                      if (cat === 'atendido') {
                        return (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            ✓ Ya Atendido
                          </span>
                        );
                      }
                      if (cat === 'en_cabina') {
                        return (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#d0ef68] text-[#171e00] border border-[#b5d24e]">
                            ⚡ En Cabina
                          </span>
                        );
                      }
                      if (cat === 'cancelado') {
                        return (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            ✕ Cancelado
                          </span>
                        );
                      }
                      return (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D9E6D3] text-[#2F3E3A] border border-[#A8BDA3]/50">
                          ⏳ Próximo a Atender
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveAppointmentDetail(null)}
                className="w-8 h-8 rounded-full bg-[#F6F0E6] hover:bg-[#D9E6D3] text-[#2F3E3A] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Treatment & Professional Card */}
            <div className="p-3.5 rounded-[22px] bg-[#F6F0E6] border border-[#A8BDA3]/50 space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6F8A78] block">
                Tratamiento
              </span>
              <p className="font-bold text-sm sm:text-base text-[#2F3E3A] leading-snug">
                {activeAppointmentDetail.serviceTitle}
              </p>
              <div className="flex items-center justify-between text-xs text-[#6F8A78] pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#6F8A78]">Profesional:</span>
                  <strong className="text-[#2F3E3A] font-semibold">{activeAppointmentDetail.specialistName}</strong>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[11px] font-bold text-[#2F3E3A] border border-[#A8BDA3]/40 shadow-xs">
                  <Clock className="w-3 h-3 text-[#6F8A78]" />
                  <span>{activeAppointmentDetail.durationMinutes} min</span>
                </div>
              </div>
            </div>

            {/* Date, Time & Patient 2-Column Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-[#F6F0E6]/70 border border-[#A8BDA3]/40 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F8A78] flex items-center gap-1 mb-1">
                    <CalendarDays className="w-3 h-3 text-[#6F8A78]" />
                    <span>Fecha & Hora</span>
                  </span>
                  <span className="font-bold text-xs text-[#2F3E3A] block">
                    {activeAppointmentDetail.date}
                  </span>
                </div>
                <span className="inline-block mt-1 font-mono font-extrabold text-sm text-[#2F3E3A]">
                  {activeAppointmentDetail.time} hs
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F6F0E6]/70 border border-[#A8BDA3]/40 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F8A78] flex items-center gap-1 mb-1">
                    <User className="w-3 h-3 text-[#6F8A78]" />
                    <span>Paciente</span>
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-[#2F3E3A] block truncate" title={activeAppointmentDetail.clientName}>
                    {activeAppointmentDetail.clientName}
                  </span>
                </div>
                {activeAppointmentDetail.clientPhone && (
                  <a
                    href={`https://wa.me/${activeAppointmentDetail.clientPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#25D366] hover:underline mt-1 truncate"
                    title="Chatear por WhatsApp"
                  >
                    <Phone className="w-3 h-3 shrink-0" />
                    <span className="truncate">{activeAppointmentDetail.clientPhone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Client Notes (if available) */}
            {activeAppointmentDetail.clientNotes && (
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-[#2F3E3A] leading-relaxed">
                <span className="font-bold text-amber-900 block mb-0.5">Nota de la paciente:</span>
                <span className="italic">"{activeAppointmentDetail.clientNotes}"</span>
              </div>
            )}

            {/* Financial Breakdown */}
            <div className="p-3.5 rounded-[22px] bg-[#F6F0E6] border border-[#A8BDA3]/50 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#6F8A78]">
                <span>Precio Total del Servicio:</span>
                <span className="font-mono font-bold text-xs text-[#2F3E3A]">{formatPrice(activeAppointmentDetail.totalPrice)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6F8A78] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Seña Abonada (Mercado Pago):</span>
                </span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  - {formatPrice(activeAppointmentDetail.depositPaid)}
                </span>
              </div>

              {/* Outstanding Balance Highlight Box */}
              <div className="mt-2 p-3 rounded-xl bg-white border border-[#A8BDA3]/60 flex items-center justify-between shadow-xs">
                <div>
                  <span className="font-bold text-xs text-[#2F3E3A] block">
                    Saldo a Cobrar en Local
                  </span>
                  <span className="text-[10px] text-[#6F8A78] block">
                    Abonar en efectivo o transferencia
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-black font-mono text-[#2F3E3A] tracking-tight">
                  {formatPrice(activeAppointmentDetail.remainingBalance)}
                </span>
              </div>
            </div>

            {/* Status Switcher (Interactive Pills) */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6F8A78] block mb-1.5">
                Estado del Turno
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { value: 'confirmado', label: 'Confirmado', icon: Check },
                  { value: 'en_cabina', label: 'En Cabina', icon: Sparkles },
                  { value: 'completado', label: 'Completado', icon: CheckCircle2 },
                  { value: 'cancelado', label: 'Cancelado', icon: X },
                ].map((st) => {
                  const isSelected = activeAppointmentDetail.status === st.value;
                  const Icon = st.icon;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => {
                        const next = st.value as Appointment['status'];
                        onUpdateAppointmentStatus(activeAppointmentDetail.id, next);
                        setActiveAppointmentDetail((prev) => (prev ? { ...prev, status: next } : null));
                      }}
                      className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? st.value === 'cancelado'
                            ? 'bg-red-600 text-white shadow-xs scale-[1.02]'
                            : 'bg-[#2F3E3A] text-[#D9E6D3] shadow-xs scale-[1.02]'
                          : 'bg-[#F6F0E6] hover:bg-[#D9E6D3]/60 text-[#6F8A78]'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSendWhatsAppReminder(activeAppointmentDetail)}
                className="flex-1 py-3.5 px-4 rounded-[18px] bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Recordatorio WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAppointmentDetail(null)}
                className="px-5 py-3.5 rounded-[18px] bg-[#F6F0E6] hover:bg-[#D9E6D3] text-[#2F3E3A] border border-[#A8BDA3]/50 font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
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
                <div className="w-10 h-10 rounded-2xl bg-[#2F3E3A] text-[#D9E6D3] flex items-center justify-center font-bold shadow-sm shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg text-on-surface font-display leading-tight">
                      Agenda del {selectedDayModalDate}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#D9E6D3] text-[#2F3E3A] font-bold text-[10px] border border-[#A8BDA3]/60">
                      {getAppointmentsForDay(selectedDayModalDate).length} {getAppointmentsForDay(selectedDayModalDate).length === 1 ? 'turno' : 'turnos'}
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-0.5">
                    Distribución de cabinas y profesionales para este día
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
                    const cat = getAppointmentCategory(appt);
                    const isEnCabina = cat === 'en_cabina';
                    const isAtendido = cat === 'atendido';

                    return (
                      <div
                        key={appt.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isEnCabina
                            ? 'bg-[#d0ef68]/15 border-[#d0ef68] ring-1 ring-[#d0ef68]'
                            : isAtendido
                            ? 'bg-slate-50/80 border-slate-200 opacity-80'
                            : 'bg-surface-container-low/70 border-surface-container-high/60 hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 ${
                                isEnCabina
                                  ? 'bg-[#062217] text-[#d0ef68]'
                                  : isAtendido
                                  ? 'bg-slate-200 text-slate-700'
                                  : 'bg-white text-[#2F3E3A] border border-surface-container-high shadow-xs'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {appt.time} hs
                            </span>

                            {/* Tag */}
                            {isAtendido && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                                ✓ Ya Atendido
                              </span>
                            )}
                            {isEnCabina && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#d0ef68] text-[#171e00]">
                                ⚡ En Cabina
                              </span>
                            )}
                            {cat === 'proximo' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D9E6D3] text-[#2F3E3A]">
                                ⏳ Por Atender
                              </span>
                            )}

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
                                : appt.status === 'confirmado'
                                ? 'bg-[#2F3E3A] text-white border-[#2F3E3A]'
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
                            <span>·</span>
                            <span className="text-primary font-medium">
                              Atiende: {appt.specialistName}
                            </span>
                            <span>·</span>
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

            {/* Close footer */}
            <div className="pt-3 border-t border-surface-container-high/60 shrink-0 text-right">
              <button
                type="button"
                onClick={() => setSelectedDayModalDate(null)}
                className="px-5 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs transition-colors cursor-pointer"
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
