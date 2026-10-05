import React, { useState } from 'react';
import { Business, Service, Specialist, ClientProfile, Appointment, BookedServiceItem } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Store, 
  CreditCard, 
  Zap, 
  Building, 
  CheckCircle2, 
  Calendar, 
  Send, 
  Download, 
  ArrowLeft,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface CheckoutViewProps {
  business: Business;
  services?: Service[];
  specialist?: Specialist;
  dateStr?: string; // YYYY-MM-DD
  formattedDate?: string; // "Mié 23 Oct"
  time?: string; // "15:30"
  endTime?: string;
  clientProfile: ClientProfile;
  onBack: () => void;
  onBookingSuccess: (appointment: Appointment, allAppointments?: Appointment[]) => void;
  onViewAppointments: () => void;
  reschedulingAppointment?: Appointment | null;
  bookedItems?: BookedServiceItem[];
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  business,
  services = [],
  specialist,
  dateStr,
  formattedDate,
  time,
  endTime,
  clientProfile,
  onBack,
  onBookingSuccess,
  onViewAppointments,
  reschedulingAppointment,
  bookedItems = [],
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'card' | 'transfer'>('mercadopago');
  const [clientName, setClientName] = useState(clientProfile.name);
  const [clientPhone, setClientPhone] = useState(clientProfile.phone);
  const [clientEmail, setClientEmail] = useState(clientProfile.email);
  const [clientNotes, setClientNotes] = useState('');
  
  // Payment processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMercadoPagoModal, setShowMercadoPagoModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [copiedAlias, setCopiedAlias] = useState(false);

  // Rescheduling detection & deposit carry-over
  const isRescheduling = Boolean(reschedulingAppointment);
  const alreadyPaidDeposit = reschedulingAppointment ? reschedulingAppointment.depositPaid : 0;

  // Normalized booked items list
  const actualBookedItems: BookedServiceItem[] = (bookedItems && bookedItems.length > 0)
    ? bookedItems
    : (services && services.length > 0
        ? services.map((s, idx) => ({
            id: `item-${idx}`,
            service: s,
            specialist: specialist || business.specialists[0],
            date: dateStr || '2026-10-23',
            formattedDate: formattedDate || 'Mié 23 Oct',
            time: time || '15:30',
            endTime: endTime || '16:30',
          }))
        : []);

  const effectiveServices: Service[] = actualBookedItems.length > 0
    ? actualBookedItems.map((item) => item.service)
    : (services.length > 0 ? services : business.services.slice(0, 1));

  const effectiveSpecialist: Specialist = specialist || (actualBookedItems[0]?.specialist) || business.specialists[0];
  const effectiveDateStr: string = dateStr || (actualBookedItems[0]?.date) || '2026-10-23';
  const effectiveFormattedDate: string = formattedDate || (actualBookedItems[0]?.formattedDate) || 'Mié 23 Oct';
  const effectiveTime: string = time || (actualBookedItems[0]?.time) || '15:30';
  const effectiveEndTime: string = endTime || (actualBookedItems[0]?.endTime) || '16:30';

  // Financial calculations for single or multiple services
  const totalPrice = effectiveServices.reduce((sum, s) => sum + s.price, 0);
  const totalDurationMinutes = effectiveServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const calculatedDeposit = Math.round(
    actualBookedItems.length > 0
      ? actualBookedItems.reduce(
          (sum, item) => sum + (item.service.price * (item.service.depositPercentage || business.defaultDepositPercentage || 30)) / 100,
          0
        )
      : effectiveServices.reduce(
          (sum, s) => sum + (s.price * (s.depositPercentage || business.defaultDepositPercentage || 30)) / 100,
          0
        )
  );

  // If rescheduling, seña to pay today is $0!
  const depositAmount = isRescheduling ? 0 : calculatedDeposit;
  const remainingBalance = Math.max(0, totalPrice - (isRescheduling ? alreadyPaidDeposit : calculatedDeposit));

  const combinedTitle = effectiveServices.length === 1
    ? effectiveServices[0].title
    : effectiveServices.map((s) => s.title.split('+')[0].trim()).join(' + ');

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  const handlePayClick = () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor completa tu nombre y teléfono de WhatsApp.');
      return;
    }

    if (isRescheduling) {
      handleConfirmReschedule();
      return;
    }

    if (paymentMethod === 'mercadopago') {
      setShowMercadoPagoModal(true);
    } else if (paymentMethod === 'transfer') {
      setShowTransferModal(true);
    } else {
      // Direct card payment simulation
      processPaymentDirectly('card', 'pagado');
    }
  };

  const handleConfirmReschedule = () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor completa tu nombre y teléfono de WhatsApp.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const updatedAppt: Appointment = {
        id: reschedulingAppointment!.id,
        businessId: business.id,
        serviceId: effectiveServices[0].id,
        serviceTitle: combinedTitle,
        servicesList: effectiveServices.map((s) => ({
          id: s.id,
          title: s.title,
          price: s.price,
          durationMinutes: s.durationMinutes,
        })),
        specialistId: effectiveSpecialist.id,
        specialistName: effectiveSpecialist.name,
        specialistAvatar: effectiveSpecialist.avatar,
        date: effectiveDateStr,
        time: effectiveTime,
        durationMinutes: totalDurationMinutes,
        totalPrice: totalPrice,
        depositPaid: alreadyPaidDeposit,
        remainingBalance: remainingBalance,
        status: 'confirmado',
        paymentMethod: reschedulingAppointment!.paymentMethod || 'mercadopago',
        paymentStatus: 'pagado',
        clientName: clientName,
        clientPhone: clientPhone,
        clientEmail: clientEmail,
        clientNotes: clientNotes,
        createdAt: new Date().toISOString(),
      };

      setIsProcessing(false);
      setConfirmedAppointment(updatedAppt);
      onBookingSuccess(updatedAppt);
    }, 800);
  };

  const processPaymentDirectly = (method: 'mercadopago' | 'card' | 'transfer', paymentStatus: 'pagado' | 'pendiente_verificacion') => {
    setIsProcessing(true);
    setTimeout(() => {
      const apptsToCreate: Appointment[] = actualBookedItems.length > 0
        ? actualBookedItems.map((item) => ({
            id: `TK-${Math.floor(10000 + Math.random() * 90000)}`,
            businessId: business.id,
            serviceId: item.service.id,
            serviceTitle: item.service.title,
            specialistId: item.specialist.id,
            specialistName: item.specialist.name,
            specialistAvatar: item.specialist.avatar,
            date: item.date,
            time: item.time,
            durationMinutes: item.service.durationMinutes,
            totalPrice: item.service.price,
            depositPaid: Math.round((item.service.price * (item.service.depositPercentage || business.defaultDepositPercentage || 30)) / 100),
            remainingBalance: item.service.price - Math.round((item.service.price * (item.service.depositPercentage || business.defaultDepositPercentage || 30)) / 100),
            status: 'confirmado',
            paymentMethod: method,
            paymentStatus: paymentStatus,
            clientName: clientName,
            clientPhone: clientPhone,
            clientEmail: clientEmail,
            clientNotes: clientNotes,
            createdAt: new Date().toISOString(),
          }))
        : [{
            id: `TK-${Math.floor(10000 + Math.random() * 90000)}`,
            businessId: business.id,
            serviceId: effectiveServices[0].id,
            serviceTitle: combinedTitle,
            servicesList: effectiveServices.map((s) => ({
              id: s.id,
              title: s.title,
              price: s.price,
              durationMinutes: s.durationMinutes,
            })),
            specialistId: effectiveSpecialist.id,
            specialistName: effectiveSpecialist.name,
            specialistAvatar: effectiveSpecialist.avatar,
            date: effectiveDateStr,
            time: effectiveTime,
            durationMinutes: totalDurationMinutes,
            totalPrice: totalPrice,
            depositPaid: depositAmount,
            remainingBalance: remainingBalance,
            status: 'confirmado',
            paymentMethod: method,
            paymentStatus: paymentStatus,
            clientName: clientName,
            clientPhone: clientPhone,
            clientEmail: clientEmail,
            clientNotes: clientNotes,
            createdAt: new Date().toISOString(),
          }];

      const primaryAppt = apptsToCreate[0];
      setIsProcessing(false);
      setShowMercadoPagoModal(false);
      setShowTransferModal(false);
      setConfirmedAppointment(primaryAppt);
      onBookingSuccess(primaryAppt, apptsToCreate);
    }, 1200);
  };

  const copyAliasToClipboard = () => {
    navigator.clipboard?.writeText(business.aliasCbu);
    setCopiedAlias(true);
    setTimeout(() => setCopiedAlias(false), 2000);
  };

  // If already confirmed, render the success voucher screen
  if (confirmedAppointment) {
    const whatsappMsg = isRescheduling
      ? `¡Hola ${business.name}! Acabo de reprogramar mi turno #${confirmedAppointment.id} para *${combinedTitle}* el día *${effectiveFormattedDate} a las ${effectiveTime} hs*. Conservé mi seña previa de ${formatPrice(alreadyPaidDeposit)}. ¡Muchas gracias!`
      : actualBookedItems.length > 1
        ? `¡Hola ${business.name}! Acabo de reservar mis turnos para *${combinedTitle}*:\n` +
          actualBookedItems.map((item, i) => `${i + 1}. *${item.service.title}* el ${item.formattedDate} a las ${item.time} hs con ${item.specialist.name}`).join('\n') +
          `\nYa aboné la seña total de ${formatPrice(calculatedDeposit)}. ¡Gracias!`
        : `¡Hola ${business.name}! Acabo de reservar mi turno para *${combinedTitle}* el día *${effectiveFormattedDate} a las ${effectiveTime} hs* (Reserva #${confirmedAppointment.id}). Ya aboné la seña de ${formatPrice(calculatedDeposit)}. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${business.phoneWhatsapp.replace(/\+/g, '')}?text=${encodeURIComponent(whatsappMsg)}`;

    return (
      <div className="flex flex-col w-full max-w-[520px] mx-auto px-3.5 sm:px-4 space-y-4 pb-36 animate-in fade-in duration-300">
        <div className="card-aesthetic p-6 sm:p-7 text-center relative overflow-hidden mt-4">
          <div className="w-16 h-16 rounded-full bg-[#123c32] text-[#d9f56a] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#123c32]/25">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-wide bg-[#efffc5] text-[#123c32] border border-[#d9f56a]/50 mb-2">
            {isRescheduling ? '¡Turno Reprogramado con Éxito!' : '¡Reserva Confirmada con Éxito!'}
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#123c32] tracking-tight">
            Reserva #{confirmedAppointment.id}
          </h2>

          <p className="text-xs sm:text-sm text-[#66716d] mt-1.5 leading-relaxed">
            {isRescheduling ? (
              <>
                Tu turno fue actualizado para el <strong className="text-[#18211f] font-semibold">{effectiveFormattedDate} a las {effectiveTime} hs</strong>. Tu seña previa de <strong className="text-[#123c32] font-semibold">{formatPrice(alreadyPaidDeposit)}</strong> se transfirió sin cargo adicional.
              </>
            ) : (
              <>
                Se ha acreditado tu seña de <strong className="text-[#18211f] font-semibold">{formatPrice(calculatedDeposit)}</strong>. Te esperamos en <strong className="text-[#18211f] font-semibold">{business.name}</strong>.
              </>
            )}
          </p>

          {/* Details summary */}
          <div className="mt-5 p-4 rounded-2xl bg-[#f7faf7] text-left space-y-2.5 border border-[#d8e2de]">
            {actualBookedItems.length > 1 ? (
              <div className="space-y-2 pb-2 border-b border-[#d8e2de]">
                <span className="text-[11px] font-bold text-[#66716d] uppercase tracking-wider block">
                  Servicios Confirmados ({actualBookedItems.length}):
                </span>
                {actualBookedItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-[#d8e2de] text-xs">
                    <div className="flex justify-between font-bold text-[#123c32]">
                      <span>#{idx + 1} {item.service.title}</span>
                      <span>{formatPrice(item.service.price)}</span>
                    </div>
                    <div className="text-[#66716d] text-[11px] flex items-center justify-between mt-0.5">
                      <span>{item.formattedDate} · {item.time} hs</span>
                      <span>Atiende: {item.specialist.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#66716d]">Tratamiento:</span>
                  <span className="font-semibold text-[#18211f] text-right truncate max-w-[200px]">{combinedTitle}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#66716d]">Especialista:</span>
                  <span className="font-semibold text-[#18211f]">{effectiveSpecialist.name}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-[#66716d]">Fecha y Horario:</span>
                  <span className="font-bold text-[#123c32]">{effectiveFormattedDate} · {effectiveTime} hs</span>
                </div>
              </>
            )}

            <div className="flex justify-between text-xs sm:text-sm pt-1">
              <span className="text-[#66716d]">Seña Total Acreditada:</span>
              <span className="font-bold text-emerald-700">{formatPrice(isRescheduling ? alreadyPaidDeposit : calculatedDeposit)} ✓</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-[#66716d]">Dirección:</span>
              <span className="font-semibold text-[#18211f] text-right truncate max-w-[200px]">{business.address}</span>
            </div>
            <div className="pt-2 border-t border-[#d8e2de] flex justify-between text-xs sm:text-sm font-bold">
              <span className="text-[#66716d]">Saldo a abonar en el local:</span>
              <span className="text-[#123c32]">{formatPrice(remainingBalance)}</span>
            </div>
          </div>

          {/* WhatsApp Direct Action Button */}
          <div className="mt-6 space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-4 px-5 rounded-[18px] bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{isRescheduling ? 'Avisar Reprogramación por WhatsApp' : 'Enviar Confirmación por WhatsApp'}</span>
            </a>

            <button
              onClick={onViewAppointments}
              className="w-full py-4 px-5 rounded-[18px] bg-[#123c32] hover:bg-[#195344] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(18,60,50,0.18)] transition-all active:scale-95 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#d9f56a]" />
              <span>Ver en Mis Turnos</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[520px] mx-auto px-3.5 sm:px-4 space-y-4 pb-36 animate-in fade-in duration-200">
      {/* Top back button row */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBack}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-[#123c32] border border-[#d8e2de]/80 shadow-[0_8px_22px_rgba(18,60,50,0.08)] active:scale-95 transition-all cursor-pointer hover:scale-105"
          aria-label="Volver al calendario"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
        </button>
        <div className="text-center">
          <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-[#eaf2ed] text-[#123c32] mb-0.5">
            PASO 3 DE 3
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#123c32] tracking-tight">
            {isRescheduling ? 'Reprogramar Turno' : 'Confirmar Reserva'}
          </h2>
        </div>
        <div className="w-11 h-11"></div>
      </div>

      {/* Rescheduling Alert Card */}
      {reschedulingAppointment && (
        <div className="p-4 rounded-[22px] bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-emerald-950">
              Reprogramación sin Cargo Adicional
            </h3>
            <p className="text-xs text-emerald-900/90 mt-0.5 leading-relaxed">
              Tu turno anterior <strong>#{reschedulingAppointment.id}</strong> ya tiene una seña abonada de <strong>{formatPrice(alreadyPaidDeposit)}</strong>. Esta seña se traslada al 100% a esta nueva fecha, por lo que <strong>hoy abonás $0</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Service Summary Card */}
      <section className="card-aesthetic p-5 sm:p-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#efffc5] text-[#123c32] font-bold truncate border border-[#d9f56a]/40">
              {actualBookedItems.length > 1
                ? `${actualBookedItems.length} Servicios Agendados`
                : (effectiveServices[0]?.category || 'Servicio Individual')}
            </span>
            {actualBookedItems.length <= 1 && (
              <span className="text-[#66716d] text-xs font-semibold">
                · Profesional: <strong className="text-[#123c32]">{effectiveSpecialist.name}</strong>
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#18211f] leading-snug">
            {combinedTitle}
          </h2>
          <p className="text-xs text-[#66716d] truncate mt-0.5">
            {business.name} · {business.address}
          </p>
        </div>

        {/* Date & Time Chips or Multi-Service breakdown */}
        {actualBookedItems.length > 1 ? (
          <div className="mt-4 pt-3.5 space-y-2 border-t border-[#d8e2de]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#66716d] block">
              Detalle de cada servicio y horario:
            </span>
            {actualBookedItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 rounded-2xl bg-[#f7faf7] border border-[#d8e2de] flex items-center justify-between text-xs"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="font-bold text-[#123c32] truncate">
                    #{idx + 1} {item.service.title}
                  </span>
                  <span className="text-[#66716d] text-[11px] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-[#123c32]" />
                    {item.formattedDate} · {item.time} hs ({item.specialist.name})
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-[#123c32] block">
                    {formatPrice(item.service.price)}
                  </span>
                  <span className="text-[10px] text-[#195344] font-semibold">
                    Seña: {formatPrice(Math.round((item.service.price * (item.service.depositPercentage || business.defaultDepositPercentage || 30)) / 100))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 pt-3.5 bg-[#f7faf7] rounded-2xl p-3 grid grid-cols-3 gap-2 border border-[#d8e2de] text-center">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-[#66716d] uppercase font-bold">Fecha</span>
              <p className="text-xs sm:text-sm font-bold text-[#123c32] mt-0.5">{effectiveFormattedDate}</p>
            </div>

            <div className="flex flex-col items-center border-x border-[#d8e2de]">
              <span className="text-[10px] text-[#66716d] uppercase font-bold">Horario</span>
              <p className="text-xs sm:text-sm font-bold text-[#123c32] mt-0.5">{effectiveTime} hs</p>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] text-[#66716d] uppercase font-bold">Duración</span>
              <p className="text-xs sm:text-sm font-bold text-[#123c32] mt-0.5">{totalDurationMinutes} min</p>
            </div>
          </div>
        )}
      </section>

      {/* Client Information Form */}
      <section className="card-aesthetic p-5 sm:p-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#123c32] block mb-3.5">
          Tus Datos de Contacto
        </span>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#66716d] mb-1">Nombre Completo *</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej. Valentina Rossi"
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-[#18211f] font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-[#66716d] mb-1">WhatsApp (Avisos) *</label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+54 9 11 2345-6789"
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-[#18211f] font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#66716d] mb-1">Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="valentina@email.com"
                className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-[#18211f] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#66716d] mb-1">Notas o Aclaraciones (Opcional)</label>
            <input
              type="text"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="Ej. Uso lentes de contacto / piel sensible"
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-[#18211f]"
            />
          </div>
        </div>
      </section>

      {/* Price Breakdown Card */}
      <section className="card-aesthetic p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#123c32]">
            Desglose de Pago
          </span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#efffc5] text-[#123c32]">
            {isRescheduling ? 'Seña Transferida' : 'Sin recargo'}
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Itemized lines */}
          {services.map((srv) => (
            <div key={srv.id} className="flex items-center justify-between text-xs sm:text-sm text-[#66716d]">
              <span className="truncate max-w-[260px]">• {srv.title} ({srv.durationMinutes}m)</span>
              <span className="font-semibold text-[#18211f]">{formatPrice(srv.price)}</span>
            </div>
          ))}

          {/* Subtotal / Total Treatment */}
          <div className="flex items-center justify-between text-sm sm:text-base text-[#18211f] pt-2.5 border-t border-[#edf2ef]">
            <span className="font-semibold">Total del tratamiento</span>
            <span className="font-bold text-[#123c32] text-lg">{formatPrice(totalPrice)}</span>
          </div>

          {/* Deposit Box: Rescheduling ($0) vs New Booking */}
          {isRescheduling ? (
            <div className="bg-emerald-500/10 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden border border-emerald-500/30 mt-1">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-900">Seña previa transferida</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    100% Cubierta
                  </span>
                </div>
                <span className="text-xs text-emerald-800 mt-0.5">
                  Abonada en reserva #{reschedulingAppointment?.id} ({formatPrice(alreadyPaidDeposit)})
                </span>
                <span className="text-xs font-bold text-emerald-950 mt-1">
                  Seña a pagar hoy: $0
                </span>
              </div>
              <span className="text-xl font-bold text-emerald-700 tracking-tight">
                $0
              </span>
            </div>
          ) : (
            <div className="bg-[#efffc5] rounded-2xl p-4 flex items-center justify-between relative overflow-hidden border border-[#d9f56a]/70 mt-1">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#123c32]">Seña hoy para confirmar turno</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#123c32] text-white text-[10px] font-bold">
                    30%
                  </span>
                </div>
                <span className="text-xs text-[#195344] mt-0.5">
                  Se descuenta del total en recepción
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-[#123c32] tracking-tight">
                {formatPrice(calculatedDeposit)}
              </span>
            </div>
          )}

          {/* Remaining Balance in Clinic */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-[#66716d] pt-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#66716d]">storefront</span>
              <span>Saldo restante a pagar en el local</span>
            </div>
            <span className="font-bold text-[#18211f]">{formatPrice(remainingBalance)}</span>
          </div>
        </div>
      </section>

      {/* Payment Methods Selector (Only shown if NOT rescheduling) */}
      {!isRescheduling ? (
        <section className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#123c32] px-1">
            Método para Abonar la Seña
          </h3>

          <div className="flex flex-col gap-2.5">
            {/* Mercado Pago */}
            <label 
              onClick={() => setPaymentMethod('mercadopago')}
              className={`relative flex items-center justify-between p-4 rounded-2xl shadow-sm cursor-pointer transition-all duration-200 border ${
                paymentMethod === 'mercadopago'
                  ? 'bg-white border-[#123c32] ring-2 ring-[#123c32]/20'
                  : 'bg-white/80 border-[#d8e2de] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                  paymentMethod === 'mercadopago'
                    ? 'bg-[#123c32] text-[#d9f56a] shadow-sm'
                    : 'bg-[#edf2ef] text-[#123c32]'
                }`}>
                  <Zap className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-[#18211f]">Mercado Pago</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d9f56a] text-[#123c32] font-bold">
                      Instantáneo
                    </span>
                  </div>
                  <p className="text-xs text-[#66716d] mt-0.5">
                    Débito, crédito o dinero en cuenta
                  </p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                paymentMethod === 'mercadopago'
                  ? 'bg-[#123c32] text-white'
                  : 'bg-[#edf2ef] text-transparent'
              }`}>
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
            </label>

            {/* Direct Card */}
            <label 
              onClick={() => setPaymentMethod('card')}
              className={`relative flex items-center justify-between p-4 rounded-2xl shadow-sm cursor-pointer transition-all duration-200 border ${
                paymentMethod === 'card'
                  ? 'bg-white border-[#123c32] ring-2 ring-[#123c32]/20'
                  : 'bg-white/80 border-[#d8e2de] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                  paymentMethod === 'card'
                    ? 'bg-[#123c32] text-[#d9f56a] shadow-sm'
                    : 'bg-[#edf2ef] text-[#123c32]'
                }`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-[#18211f]">Tarjeta Débito / Crédito</span>
                  </div>
                  <p className="text-xs text-[#66716d] mt-0.5">
                    Visa, Mastercard, Cabal o AMEX
                  </p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                paymentMethod === 'card'
                  ? 'bg-[#123c32] text-white'
                  : 'bg-[#edf2ef] text-transparent'
              }`}>
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
            </label>

            {/* Bank Transfer */}
            <label 
              onClick={() => setPaymentMethod('transfer')}
              className={`relative flex items-center justify-between p-4 rounded-2xl shadow-sm cursor-pointer transition-all duration-200 border ${
                paymentMethod === 'transfer'
                  ? 'bg-white border-[#123c32] ring-2 ring-[#123c32]/20'
                  : 'bg-white/80 border-[#d8e2de] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                  paymentMethod === 'transfer'
                    ? 'bg-[#123c32] text-[#d9f56a] shadow-sm'
                    : 'bg-[#edf2ef] text-[#123c32]'
                }`}>
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-[#18211f]">Transferencia Bancaria</span>
                  </div>
                  <p className="text-xs text-[#66716d] mt-0.5">
                    Alias: {business.aliasCbu} · Envío de comprobante
                  </p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                paymentMethod === 'transfer'
                  ? 'bg-[#123c32] text-white'
                  : 'bg-[#edf2ef] text-transparent'
              }`}>
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
            </label>
          </div>
        </section>
      ) : null}

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          onClick={handlePayClick}
          disabled={isProcessing}
          className="w-full py-4 px-5 rounded-[18px] bg-[#123c32] hover:bg-[#195344] text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(18,60,50,0.18)] hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70"
        >
          {isProcessing ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isRescheduling ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-[#d9f56a]" />
              <span>Confirmar Reprogramación ($0 Hoy)</span>
            </>
          ) : paymentMethod === 'transfer' ? (
            <>
              <span>Continuar a Datos de Transferencia</span>
              <span className="text-lg">→</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-[#d9f56a]" />
              <span>Pagar Seña {formatPrice(calculatedDeposit)} y Confirmar</span>
            </>
          )}
        </button>
        <p className="text-center text-xs text-[#66716d] mt-2 flex items-center justify-center gap-1 font-medium">
          <span className="material-symbols-outlined text-[14px] text-[#123c32]">shield</span>
          Transacción encriptada y protegida de extremo a extremo
        </p>
      </div>

      {/* Simulated Mercado Pago Checkout Modal */}
      {showMercadoPagoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#009ee3] flex items-center justify-center text-white font-bold text-xs">
                  MP
                </div>
                <span className="font-bold text-[#009ee3] tracking-tight">Mercado Pago Checkout</span>
              </div>
              <button 
                onClick={() => setShowMercadoPagoModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Pagar Seña a</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{business.name}</h3>
              <p className="text-2xl font-black text-[#00a884] mt-2">{formatPrice(depositAmount)}</p>
              <p className="text-xs text-slate-400 mt-1 truncate max-w-[280px] mx-auto">{combinedTitle} ({formattedDate})</p>
            </div>

            <div className="space-y-2.5 my-3">
              <button 
                onClick={() => processPaymentDirectly('mercadopago', 'pagado')}
                className="w-full p-3 rounded-2xl bg-[#009ee3]/10 hover:bg-[#009ee3]/20 border border-[#009ee3]/30 flex items-center justify-between transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#009ee3] text-white flex items-center justify-center text-xs">
                    💳
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Dinero en cuenta de Mercado Pago</p>
                    <p className="text-[11px] text-slate-500">Saldo disponible: $48.200</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#009ee3]">Pagar</span>
              </button>

              <button 
                onClick={() => processPaymentDirectly('mercadopago', 'pagado')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs">
                    💳
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Tarjeta Débito / Crédito guardada</p>
                    <p className="text-[11px] text-slate-500">Visa terminada en 4092</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700">Pagar</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowMercadoPagoModal(false)}
                className="text-xs text-slate-500 hover:underline"
              >
                Cancelar y volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Transfer Instructions Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-aesthetic max-w-sm w-full p-6 text-[#18211f] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#d8e2de]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#efffc5] text-[#123c32] flex items-center justify-center border border-[#d9f56a]/40">
                  <Building className="w-4 h-4 text-[#123c32]" />
                </div>
                <h3 className="font-bold text-base text-[#123c32]">Datos para Transferencia</h3>
              </div>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="w-7 h-7 rounded-full bg-[#edf2ef] hover:bg-[#d8e2de] text-[#66716d] flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3.5 rounded-[18px] bg-[#efffc5] border border-[#d9f56a]/50">
                <p className="text-xs text-[#195344] font-medium">Monto Exacto de la Seña:</p>
                <p className="text-2xl font-extrabold text-[#123c32] tracking-tight">{formatPrice(depositAmount)}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-[16px] bg-[#f7faf7] border border-[#d8e2de]">
                  <div>
                    <span className="text-[#66716d] block text-[10px] uppercase font-bold">Alias CBU / CVU:</span>
                    <span className="font-bold text-sm text-[#123c32]">{business.aliasCbu}</span>
                  </div>
                  <button 
                    onClick={copyAliasToClipboard}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#123c32] hover:bg-[#195344] text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedAlias ? <Check className="w-3.5 h-3.5 text-[#d9f56a]" /> : <Copy className="w-3.5 h-3.5 text-[#d9f56a]" />}
                    <span>{copiedAlias ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-[16px] bg-[#f7faf7] border border-[#d8e2de]">
                  <span className="text-[#66716d] block text-[10px] uppercase font-bold">Entidad Bancaria:</span>
                  <span className="font-bold text-[#18211f]">{business.bankName}</span>
                </div>

                <div className="p-2.5 rounded-[16px] bg-[#f7faf7] border border-[#d8e2de]">
                  <span className="text-[#66716d] block text-[10px] uppercase font-bold">Titular de la cuenta:</span>
                  <span className="font-bold text-[#18211f]">{business.name}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#78520d] leading-relaxed bg-[#fff8ec] p-3 rounded-[16px] border border-[#d9a441]/30">
                ⚠️ Una vez transferido, enviá el comprobante por WhatsApp para que la recepcionista confirme tu turno automáticamente.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => processPaymentDirectly('transfer', 'pendiente_verificacion')}
                className="w-full py-3.5 px-4 rounded-[18px] bg-[#123c32] hover:bg-[#195344] text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Ya transferí, notificar al negocio
              </button>
              <button
                onClick={() => setShowTransferModal(false)}
                className="w-full py-2 text-xs text-[#66716d] hover:text-[#123c32] font-semibold text-center cursor-pointer"
              >
                Volver atrás
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
