import React, { useState, useEffect } from 'react';
import { Appointment, Business } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  RotateCcw, 
  Trash2, 
  Plus, 
  AlertTriangle, 
  X,
  Share2
} from 'lucide-react';

interface AppointmentsViewProps {
  appointments: Appointment[];
  businesses: Business[];
  onCancelAppointment: (id: string) => void;
  onDeleteAppointment?: (id: string) => void;
  onRescheduleAppointment: (appointment: Appointment) => void;
  onNewBookingClick: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  businesses,
  onCancelAppointment,
  onDeleteAppointment,
  onRescheduleAppointment,
  onNewBookingClick,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [cancellationNotice, setCancellationNotice] = useState<string | null>(null);

  const filteredAppointments = appointments.filter((a) => {
    if (filter === 'upcoming') return a.status === 'confirmado' || a.status === 'pendiente_seña';
    if (filter === 'completed') return a.status === 'completado' || a.status === 'cancelado';
    return true;
  });

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  const getBusiness = (businessId: string) => {
    return businesses.find((b) => b.id === businessId) || businesses[0];
  };

  const checkCancellationHours = (dateStr: string, timeStr: string): number => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      const apptDate = new Date(year, month - 1, day, hours, minutes);
      const now = new Date();
      const diffMs = apptDate.getTime() - now.getTime();
      return Math.round(diffMs / (1000 * 60 * 60));
    } catch {
      return 48; // fallback
    }
  };

  useEffect(() => {
    if (cancellationNotice) {
      const timer = setTimeout(() => setCancellationNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [cancellationNotice]);

  const handleConfirmCancellation = () => {
    if (!appointmentToCancel) return;
    onCancelAppointment(appointmentToCancel.id);
    setCancellationNotice(`Tu turno #${appointmentToCancel.id} fue cancelado exitosamente.`);
    setAppointmentToCancel(null);
  };

  const handleConfirmDeletion = () => {
    if (!appointmentToDelete) return;
    if (onDeleteAppointment) {
      onDeleteAppointment(appointmentToDelete.id);
    }
    setCancellationNotice(`El registro #${appointmentToDelete.id} (${appointmentToDelete.serviceTitle}) fue eliminado de tu historial.`);
    setAppointmentToDelete(null);
  };

  const handleGoogleCalendar = (appt: Appointment) => {
    const title = encodeURIComponent(`${appt.serviceTitle} - ${appt.specialistName}`);
    const details = encodeURIComponent(`Turno confirmado en ${getBusiness(appt.businessId).name}. Seña abonada: ${formatPrice(appt.depositPaid)}. Saldo pendiente: ${formatPrice(appt.remainingBalance)}.`);
    const location = encodeURIComponent(getBusiness(appt.businessId).address);
    const cleanDate = appt.date.replace(/-/g, '');
    const cleanTime = appt.time.replace(/:/g, '') + '00';
    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${cleanDate}T${cleanTime}/${cleanDate}T${cleanTime}&details=${details}&location=${location}`;
    window.open(calUrl, '_blank');
  };

  return (
    <div className="flex flex-col w-full max-w-[520px] mx-auto px-3.5 sm:px-4 space-y-4 pb-36 animate-in fade-in duration-200">
      {/* Toast Alert Notification */}
      {cancellationNotice && (
        <div className="p-3.5 rounded-[18px] bg-[#123c32] text-white text-xs flex items-center justify-between shadow-[0_10px_25px_rgba(18,60,50,0.2)] border border-[#d9f56a]/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="text-[#d9f56a] font-bold text-sm">✓</span>
            <span className="font-semibold">{cancellationNotice}</span>
          </div>
          <button 
            onClick={() => setCancellationNotice(null)} 
            className="text-white/70 hover:text-white font-bold ml-2 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <div className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-[#eaf2ed] text-[#123c32] mb-1">
            GESTIÓN DE CITAS
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#123c32] tracking-tight leading-tight">
            Mis Turnos & Historial
          </h1>
        </div>

        <button
          onClick={onNewBookingClick}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#123c32] text-white text-xs font-bold shadow-[0_6px_16px_rgba(18,60,50,0.18)] hover:bg-[#195344] active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#d9f56a]" />
          <span>Nuevo Turno</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-white border border-[#d8e2de] shadow-xs">
        <button
          onClick={() => setFilter('upcoming')}
          className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            filter === 'upcoming'
              ? 'bg-[#123c32] text-white shadow-sm'
              : 'text-[#66716d] hover:text-[#123c32]'
          }`}
        >
          Próximos ({appointments.filter(a => a.status === 'confirmado' || a.status === 'pendiente_seña').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            filter === 'completed'
              ? 'bg-[#123c32] text-white shadow-sm'
              : 'text-[#66716d] hover:text-[#123c32]'
          }`}
        >
          Historial ({appointments.filter(a => a.status === 'completado' || a.status === 'cancelado').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#123c32] text-white shadow-sm'
              : 'text-[#66716d] hover:text-[#123c32]'
          }`}
        >
          Todos ({appointments.length})
        </button>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="card-aesthetic p-8 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-[#edf2ef] text-[#123c32] flex items-center justify-center mx-auto mb-3.5 shadow-xs">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#123c32]">No tenés turnos en esta sección</h3>
          <p className="text-xs sm:text-sm text-[#66716d] mt-1 max-w-xs mx-auto">
            Explorá el catálogo de servicios de nuestras profesionales y reservá tu horario en simples pasos.
          </p>
          <button
            onClick={onNewBookingClick}
            className="mt-5 py-3.5 px-6 rounded-[18px] bg-[#123c32] hover:bg-[#195344] text-white text-xs sm:text-sm font-bold shadow-[0_10px_24px_rgba(18,60,50,0.18)] transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
          >
            <span>Explorar Servicios</span>
            <span>→</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => {
            const biz = getBusiness(appt.businessId);
            const isUpcoming = appt.status === 'confirmado';
            const isCancelled = appt.status === 'cancelado';
            const isCompleted = appt.status === 'completado';

            const whatsappMsg = `Hola ${biz.name}, tengo una consulta sobre mi turno #${appt.id} para *${appt.serviceTitle}* del ${appt.date} a las ${appt.time} hs con ${appt.specialistName}.`;
            const whatsappUrl = `https://wa.me/${biz.phoneWhatsapp.replace(/\+/g, '')}?text=${encodeURIComponent(whatsappMsg)}`;

            return (
              <article
                key={appt.id}
                className="card-aesthetic p-5 sm:p-6 transition-all hover:border-[#123c32]/30 relative overflow-hidden"
              >
                {/* Header Status Bar */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#d8e2de]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-xs text-[#123c32] bg-[#efffc5] px-2.5 py-0.5 rounded-full border border-[#d9f56a]/40">
                      #{appt.id}
                    </span>
                    <span className="text-xs text-[#66716d] truncate">
                      Profesional: <strong className="text-[#123c32]">{appt.specialistName}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                      isUpcoming
                        ? 'bg-[#efffc5] text-[#123c32] border border-[#d9f56a]/50'
                        : isCompleted
                        ? 'bg-[#edf2ef] text-[#66716d]'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {isUpcoming ? '✓ Turno Confirmado' : isCompleted ? 'Finalizado' : 'Cancelado'}
                    </span>

                    <button
                      onClick={() => setAppointmentToDelete(appt)}
                      className="w-7 h-7 rounded-full bg-[#f7faf7] hover:bg-red-50 text-[#66716d] hover:text-red-600 flex items-center justify-center transition-colors border border-[#d8e2de] hover:border-red-200 cursor-pointer shrink-0 ml-0.5"
                      title="Eliminar este registro del historial"
                      aria-label="Eliminar registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Treatment details */}
                <div className="py-3.5">
                  <h2 className="text-lg sm:text-xl font-bold text-[#123c32] tracking-tight leading-snug">
                    {appt.serviceTitle}
                  </h2>

                  <div className="flex items-center gap-2 text-xs text-[#66716d] mt-1.5 flex-wrap">
                    <span className="bg-[#edf2ef] text-[#123c32] px-2.5 py-0.5 rounded-full font-bold">
                      ◷ {appt.durationMinutes} min
                    </span>
                    <span>•</span>
                    <span className="text-[#66716d]">{biz.name}</span>
                  </div>
                </div>

                {/* Date, Time & Financial Panel */}
                <div className="bg-[#f7faf7] border border-[#d8e2de] rounded-[22px] p-4 space-y-2.5 mb-3.5">
                  <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#d8e2de]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#123c32] border border-[#d8e2de] shrink-0">
                        <Calendar className="w-4 h-4 text-[#123c32]" />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#66716d] uppercase font-bold block">Fecha</span>
                        <span className="text-xs font-bold text-[#123c32]">{appt.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#123c32] border border-[#d8e2de] shrink-0">
                        <Clock className="w-4 h-4 text-[#123c32]" />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#66716d] uppercase font-bold block">Horario</span>
                        <span className="text-xs font-bold text-[#123c32]">{appt.time} hs</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#66716d] truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#123c32] shrink-0" />
                    <span className="truncate">{biz.address}</span>
                  </div>

                  <div className="pt-2 border-t border-[#d8e2de] space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#66716d]">Seña abonada (Mercado Pago):</span>
                      <span className="font-bold text-[#195344]">{formatPrice(appt.depositPaid)} ✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#66716d]">Saldo pendiente en recepción:</span>
                      <span className="font-bold text-[#123c32]">{formatPrice(appt.remainingBalance)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions row for upcoming appointments */}
                {isUpcoming && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#d8e2de] text-xs">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-2 rounded-[14px] bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold flex items-center justify-center gap-1.5 text-center transition-all shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => handleGoogleCalendar(appt)}
                      className="py-2.5 px-2 rounded-[14px] bg-[#edf2ef] hover:bg-[#d8e2de] text-[#123c32] font-bold flex items-center justify-center gap-1.5 text-center transition-all cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#123c32]" />
                      <span>Calendario</span>
                    </button>

                    <button
                      onClick={() => onRescheduleAppointment(appt)}
                      className="py-2.5 px-2 rounded-[14px] bg-[#efffc5] hover:bg-[#d9f56a] text-[#123c32] font-bold flex items-center justify-center gap-1.5 text-center transition-all border border-[#d9f56a]/40 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reprogramar</span>
                    </button>

                    <button
                      onClick={() => setAppointmentToCancel(appt)}
                      className="py-2.5 px-2 rounded-[14px] bg-white hover:bg-red-50 text-red-700 font-bold flex items-center justify-center gap-1.5 text-center border border-red-200 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}

                {/* Re-book button & Delete individual history for completed/cancelled appointments */}
                {!isUpcoming && (
                  <div className="pt-2 border-t border-[#d8e2de] grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={onNewBookingClick}
                      className="py-2.5 px-3.5 rounded-[16px] bg-[#edf2ef] hover:bg-[#d8e2de] text-[#123c32] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#123c32]" />
                      <span>Volver a reservar</span>
                    </button>

                    <button
                      onClick={() => setAppointmentToDelete(appt)}
                      className="py-2.5 px-3.5 rounded-[16px] bg-white hover:bg-red-50 text-red-700 hover:text-red-800 border border-red-200 hover:border-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      title="Eliminar este turno de forma individual de tu historial"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Eliminar del historial</span>
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Cancellation Warning & Confirmation Modal */}
      {appointmentToCancel && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="card-aesthetic w-full max-w-[420px] max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 my-auto">
            {/* Close button */}
            <button
              onClick={() => setAppointmentToCancel(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#edf2ef] hover:bg-[#d8e2de] text-[#66716d] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Icon Badge */}
            <div className="w-12 h-12 rounded-full bg-[#fff8ec] text-[#d9a441] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-[#123c32]">
                ¿Deseás cancelar tu turno?
              </h3>
              <p className="text-xs text-[#66716d] mt-1">
                Reserva <strong className="text-[#123c32] font-semibold">#{appointmentToCancel.id}</strong> · {appointmentToCancel.serviceTitle}
              </p>
              <p className="text-xs text-[#66716d] mt-0.5 font-medium">
                {appointmentToCancel.date} a las {appointmentToCancel.time} hs · Con {appointmentToCancel.specialistName}
              </p>
            </div>

            {/* Deposit Warning Box */}
            {appointmentToCancel.depositPaid > 0 && (
              <div className="mt-4 p-4 rounded-[22px] bg-[#fff8ec] border border-[#d9a441]/40 text-left space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#b47a16] uppercase tracking-wide">
                    Seña Abonada: {formatPrice(appointmentToCancel.depositPaid)}
                  </span>
                </div>

                <p className="text-xs text-[#78520d] leading-relaxed">
                  <strong>Política de Cancelación:</strong> Si cancelás tu turno con <strong>menos de 24 horas de anticipación</strong>, <strong>se pierde la seña abonada</strong> ya que la especialista y el box quedaron bloqueados exclusivamente para vos.
                </p>

                {checkCancellationHours(appointmentToCancel.date, appointmentToCancel.time) < 24 ? (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-[11px] text-red-900 font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-red-600 shrink-0">error</span>
                    <span>Quedan menos de 24 hs: si cancelás ahora no habrá reembolso de la seña.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#efffc5] border border-[#d9f56a]/60 flex items-center gap-2 text-[11px] text-[#123c32] font-semibold">
                    <span className="material-symbols-outlined text-[16px] text-[#195344] shrink-0">check_circle</span>
                    <span>Quedan más de 24 hs: Podés reprogramar la fecha sin perder el dinero de tu seña.</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 space-y-2.5">
              <button
                onClick={() => {
                  const appt = appointmentToCancel;
                  setAppointmentToCancel(null);
                  onRescheduleAppointment(appt);
                }}
                className="w-full py-3.5 px-4 rounded-[18px] bg-[#123c32] hover:bg-[#195344] text-white font-bold text-xs sm:text-sm shadow-[0_8px_20px_rgba(18,60,50,0.18)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#d9f56a]" />
                <span>Reprogramar Fecha (Sin Perder Seña)</span>
              </button>

              <button
                onClick={handleConfirmCancellation}
                className="w-full py-3 px-4 rounded-[18px] bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{appointmentToCancel.depositPaid > 0 ? 'Sí, Cancelar Turno (Perder Seña)' : 'Confirmar Cancelación'}</span>
              </button>

              <button
                onClick={() => setAppointmentToCancel(null)}
                className="w-full py-2.5 rounded-full text-[#66716d] hover:text-[#123c32] font-bold text-xs transition-colors cursor-pointer"
              >
                No cancelar, conservar mi turno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single History Item Modal */}
      {appointmentToDelete && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="card-aesthetic w-full max-w-[420px] max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 my-auto">
            {/* Close button */}
            <button
              onClick={() => setAppointmentToDelete(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#edf2ef] hover:bg-[#d8e2de] text-[#66716d] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Trash Warning Icon Badge */}
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 shadow-xs border border-red-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-[#123c32]">
                ¿Eliminar este registro del historial?
              </h3>
              <p className="text-xs text-[#66716d] mt-1">
                Turno <strong className="text-[#123c32] font-semibold">#{appointmentToDelete.id}</strong> · {appointmentToDelete.serviceTitle}
              </p>
              <p className="text-xs text-[#66716d] mt-0.5 font-medium">
                {appointmentToDelete.date} · {appointmentToDelete.time} hs · Con {appointmentToDelete.specialistName}
              </p>
            </div>

            {/* Clarification Box */}
            <div className="mt-4 p-4 rounded-[20px] bg-[#f7faf7] border border-[#d8e2de] text-left space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-[#123c32] font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Eliminación individual</span>
              </div>
              <p className="text-[#66716d] leading-relaxed">
                Esta acción eliminará de forma permanente esta historia/turno de tu lista personal de turnos e historial.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-5 space-y-2.5">
              <button
                onClick={handleConfirmDeletion}
                className="w-full py-3.5 px-4 rounded-[18px] bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, eliminar del historial</span>
              </button>

              <button
                onClick={() => setAppointmentToDelete(null)}
                className="w-full py-2.5 rounded-full text-[#66716d] hover:text-[#123c32] font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar y conservar registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
