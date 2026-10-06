import React, { useState, useRef } from 'react';
import { ClientProfile, Appointment, Business, PaymentTransaction } from '../types';
import { INITIAL_PAYMENT_TRANSACTIONS } from '../data/mockData';
import { ReceiptModal } from './ReceiptModal';
import { 
  Check, 
  ChevronRight, 
  CreditCard, 
  Calendar, 
  Settings, 
  Sparkles, 
  FileText, 
  Gift, 
  Edit3, 
  X, 
  Camera, 
  Upload, 
  Receipt, 
  Download, 
  ShieldCheck, 
  Clock,
  ArrowRight
} from 'lucide-react';

interface ProfileViewProps {
  clientProfile: ClientProfile;
  appointments: Appointment[];
  currentBusiness: Business;
  transactions?: PaymentTransaction[];
  isLoggedIn?: boolean;
  onNavigateToTab: (tab: string) => void;
  onOpenMedicalSheet: () => void;
  onOpenLoyaltyModal: () => void;
  onOpenPaymentMethodsModal: () => void;
  onUpdateProfile?: (updated: Partial<ClientProfile>) => void;
  onLogout?: () => void;
  onLogin?: (userData?: Partial<ClientProfile>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  clientProfile,
  appointments,
  currentBusiness,
  transactions,
  isLoggedIn = true,
  onNavigateToTab,
  onOpenMedicalSheet,
  onOpenLoyaltyModal,
  onOpenPaymentMethodsModal,
  onUpdateProfile,
  onLogout,
  onLogin,
}) => {
  const [notificationToggle, setNotificationToggle] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Profile Modal state
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [editName, setEditName] = useState(clientProfile.name);
  const [editEmail, setEditEmail] = useState(clientProfile.email);
  const [editPhone, setEditPhone] = useState(clientProfile.phone);
  const [editAvatar, setEditAvatar] = useState(clientProfile.avatar);

  // Payment History and Receipt Modal state
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState<PaymentTransaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'deposit' | 'balance'>('all');

  const userTransactions = transactions || INITIAL_PAYMENT_TRANSACTIONS;

  const filteredTransactions = userTransactions.filter((txn) => {
    if (paymentFilter === 'deposit') {
      return txn.concept.toLowerCase().includes('seña');
    }
    if (paymentFilter === 'balance') {
      return !txn.concept.toLowerCase().includes('seña');
    }
    return true;
  });

  const totalDepositsPaid = userTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Find upcoming appointment
  const upcomingAppointment = appointments.find((a) => a.status === 'confirmado') || appointments[0];
  const primaryCard = clientProfile.savedCards?.find((c) => c.isDefault) || clientProfile.savedCards?.[0];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Por favor elegí una imagen menor a 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setEditAvatar(result);
          if (onUpdateProfile) {
            onUpdateProfile({ avatar: result });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert('Ingresá tu nombre.');
      return;
    }
    if (onUpdateProfile) {
      onUpdateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        avatar: editAvatar,
      });
    }
    setIsEditProfileModalOpen(false);
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&h=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
  ];

  // If not logged in, render Aesthetic Login screen
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col w-full max-w-[520px] mx-auto px-3.5 sm:px-4 py-8 animate-in fade-in duration-200">
        <div className="card-aesthetic p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-[#123c32] text-[#d9f56a] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#123c32]/20">
            <span className="text-2xl font-bold">✦</span>
          </div>

          <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-wide bg-[#eaf2ed] text-[#123c32] mb-2">
            MI CUENTA AURA
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#123c32] tracking-tight">
            Acceso a tu Perfil
          </h2>
          <p className="text-xs sm:text-sm text-[#66716d] mt-1.5 mb-6 max-w-xs mx-auto">
            Ingresá tu WhatsApp para consultar tus reservas activas, historial de señas y ficha de consentimiento.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!loginName.trim() || !loginPhone.trim()) {
                alert('Completá tu nombre y teléfono para ingresar.');
                return;
              }
              onLogin?.({ name: loginName, phone: loginPhone });
            }}
            className="space-y-3.5 text-left"
          >
            <div>
              <label className="block text-xs font-semibold text-[#66716d] mb-1">Nombre Completo</label>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Ej. Valentina Rossi"
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#d8e2de] text-xs sm:text-sm font-medium text-[#18211f] focus:outline-none focus:ring-2 focus:ring-[#123c32]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#66716d] mb-1">WhatsApp</label>
              <input
                type="tel"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="+54 9 11 ..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#d8e2de] text-xs sm:text-sm font-medium text-[#18211f] focus:outline-none focus:ring-2 focus:ring-[#123c32]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 px-5 rounded-[18px] bg-[#123c32] hover:bg-[#195344] text-white text-sm font-bold shadow-[0_10px_24px_rgba(18,60,50,0.18)] transition-all cursor-pointer mt-2"
            >
              Iniciar Sesión
            </button>
          </form>

          <button
            type="button"
            onClick={() => onLogin?.()}
            className="mt-5 text-xs text-[#123c32] font-bold hover:underline cursor-pointer block mx-auto"
          >
            Acceder como Valentina Rossi (Cuenta Demo)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[520px] mx-auto px-3.5 sm:px-4 space-y-4 pb-36 animate-in fade-in duration-200">
      {/* Hidden File Input for Avatar Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange} 
      />

      {/* Main Profile Card (User aesthetic fidelity) */}
      <article className="card-aesthetic p-5 sm:p-6 relative overflow-hidden transition-all">
        {/* Floating Edit Button */}
        <button
          onClick={() => {
            setEditName(clientProfile.name);
            setEditEmail(clientProfile.email);
            setEditPhone(clientProfile.phone);
            setEditAvatar(clientProfile.avatar);
            setIsEditProfileModalOpen(true);
          }}
          aria-label="Editar datos de perfil"
          title="Editar perfil y foto"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#edf2ef] hover:bg-[#d8e2de] text-[#123c32] flex items-center justify-center transition-colors cursor-pointer"
          type="button"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-[#eaf2ed] text-[#123c32]">
                MI PERFIL
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#efffc5] text-[#123c32] border border-[#d9f56a]/40">
                {clientProfile.isVip ? '★ PACIENTE VIP' : 'CLIENTE FRECUENTE'}
              </span>
            </div>

            <h1 className="mt-2 text-[#123c32] font-bold text-2xl sm:text-[32px] tracking-tight leading-none">
              {clientProfile.name}
            </h1>
            <p className="mt-1 text-[#66716d] text-xs sm:text-sm font-medium truncate">
              {clientProfile.email}
            </p>
            <p className="text-[#66716d] text-xs font-semibold mt-0.5">
              WhatsApp: <span className="text-[#123c32]">{clientProfile.phone}</span>
            </p>
          </div>

          {/* Avatar with Verified Badge (Forma cuadrada con bordes redondeados) */}
          <div className="relative shrink-0 group">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-[82px] h-[82px] sm:w-[88px] sm:h-[88px] rounded-[24px] overflow-hidden bg-gradient-to-br from-[#e4ece5] to-[#c1d3c6] border-[3.5px] border-white shadow-[0_8px_24px_rgba(18,60,50,0.14)] cursor-pointer relative"
              title="Tocar para subir nueva foto"
            >
              <img
                className="w-full h-full object-cover rounded-[20px] group-hover:scale-105 transition-transform"
                src={clientProfile.avatar}
                alt={clientProfile.name}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity rounded-[20px]">
                <Camera className="w-5 h-5" />
                <span className="text-[8px] font-bold mt-0.5">Cambiar</span>
              </div>
            </div>

            {/* Verified indicator badge */}
            <div className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-lg bg-[#d9f56a] text-[#123c32] flex items-center justify-center shadow-sm font-bold text-xs pointer-events-none border-2 border-white">
              ✓
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-[#d8e2de] my-4"></div>

        {/* Puntos de Fidelidad & Cashback Panel */}
        <div 
          onClick={onOpenLoyaltyModal}
          className="bg-[#f7faf7] border border-[#d8e2de] rounded-[22px] p-4 flex items-center justify-between gap-3 cursor-pointer hover:border-[#123c32]/30 transition-all group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#efffc5] text-[#123c32] flex items-center justify-center shrink-0 border border-[#d9f56a]/40 shadow-xs">
              <Gift className="w-5 h-5 text-[#123c32]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[#123c32]">
                  Puntos & Cashback
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#d9f56a] text-[#123c32] text-[10px] font-bold">
                  {clientProfile.loyaltyPoints} pts
                </span>
              </div>
              <p className="text-xs text-[#66716d] truncate mt-0.5">
                {formatCurrency(clientProfile.loyaltyCashBalance)} acumulado para señas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLoyaltyModal();
            }}
            className="px-3.5 py-1.5 rounded-full bg-[#123c32] hover:bg-[#195344] text-white text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            Canjear
          </button>
        </div>
      </article>

      {/* Próximo Turno Card */}
      <section className="card-aesthetic p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#123c32]">
              Próximo Turno Agendado
            </h2>
            {upcomingAppointment && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#efffc5] text-[#123c32] text-[10px] font-bold border border-[#d9f56a]/40">
                Confirmado
              </span>
            )}
          </div>
          <button 
            onClick={() => onNavigateToTab('mis-turnos')}
            className="text-xs text-[#123c32] hover:underline font-bold"
          >
            Ver todos los turnos →
          </button>
        </div>

        {upcomingAppointment ? (
          <div 
            onClick={() => onNavigateToTab('mis-turnos')}
            className="bg-[#f7faf7] border border-[#d8e2de] rounded-[22px] p-4 cursor-pointer hover:border-[#123c32]/40 transition-all space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-sm sm:text-base text-[#123c32] truncate">
                {upcomingAppointment.serviceTitle}
              </h3>
              <span className="text-xs font-bold text-[#123c32] bg-[#efffc5] px-2.5 py-0.5 rounded-full border border-[#d9f56a]/30 shrink-0">
                #{upcomingAppointment.id}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#66716d] flex-wrap">
              <div className="flex items-center gap-1 font-bold text-[#123c32]">
                <Clock className="w-3.5 h-3.5 text-[#123c32]" />
                <span>{upcomingAppointment.date} · {upcomingAppointment.time} hs</span>
              </div>
              <span>•</span>
              <span>Profesional: <strong className="text-[#123c32]">{upcomingAppointment.specialistName}</strong></span>
            </div>

            <div className="pt-2 border-t border-[#d8e2de] flex justify-between text-xs">
              <span className="text-[#66716d]">Seña acreditada:</span>
              <span className="font-bold text-[#195344]">{formatCurrency(upcomingAppointment.depositPaid)} ✓</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-[#f7faf7] rounded-[22px] border border-[#d8e2de]">
            <p className="text-xs text-[#66716d]">No tenés citas pendientes en este momento.</p>
            <button 
              onClick={() => onNavigateToTab('servicios')}
              className="mt-3 px-4 py-2 rounded-full bg-[#123c32] text-white text-xs font-bold shadow-sm"
            >
              Reservar un Turno
            </button>
          </div>
        )}
      </section>

      {/* Historial & Opciones Rápidas */}
      <section className="card-aesthetic p-5 sm:p-6 space-y-2">
        <h2 className="text-base sm:text-lg font-bold text-[#123c32] mb-3">
          Accesos & Preferencias
        </h2>

        {/* Item 1: Turnos Anteriores */}
        <button
          onClick={() => onNavigateToTab('mis-turnos')}
          className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#f7faf7] transition-all group text-left w-full cursor-pointer border border-transparent hover:border-[#d8e2de]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#edf2ef] text-[#123c32] flex items-center justify-center group-hover:bg-[#123c32] group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#18211f]">
                Historial de Turnos & Citas
              </p>
              <p className="text-xs text-[#66716d]">
                Tratamientos anteriores, señas y estados
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#66716d] group-hover:text-[#123c32] group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Item 2: Historial de Pagos & Recibos */}
        <button
          onClick={() => {
            const el = document.getElementById('historial-de-pagos-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#f7faf7] transition-all group text-left w-full cursor-pointer border border-transparent hover:border-[#d8e2de]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#edf2ef] text-[#123c32] flex items-center justify-center group-hover:bg-[#123c32] group-hover:text-white transition-colors">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-[#18211f]">
                  Historial de Pagos & Recibos
                </p>
                <span className="px-2 py-0.5 rounded-full bg-[#efffc5] text-[#123c32] text-[10px] font-bold border border-[#d9f56a]/30">
                  {userTransactions.length}
                </span>
              </div>
              <p className="text-xs text-[#66716d]">
                Comprobantes oficiales de Mercado Pago
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#66716d] group-hover:text-[#123c32] group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Item 3: Métodos de Pago */}
        <button
          onClick={onOpenPaymentMethodsModal}
          className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#f7faf7] transition-all group text-left w-full cursor-pointer border border-transparent hover:border-[#d8e2de]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#edf2ef] text-[#123c32] flex items-center justify-center group-hover:bg-[#123c32] group-hover:text-white transition-colors">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#18211f]">
                Métodos de Pago & Facturación
              </p>
              <p className="text-xs text-[#66716d]">
                {primaryCard
                  ? `${primaryCard.brand.toUpperCase()} **** ${primaryCard.last4} · Mercado Pago`
                  : 'Tarjetas vinculadas y CUIT'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#66716d] group-hover:text-[#123c32] group-hover:translate-x-0.5 transition-all" />
        </button>

        {/* Item 4: Recordatorios WhatsApp */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f7faf7] text-left w-full border border-[#d8e2de]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-[#25D366] flex items-center justify-center border border-[#d8e2de]">
              <span className="font-bold text-lg">W</span>
            </div>
            <div>
              <p className="font-bold text-sm text-[#18211f]">
                Recordatorios de Turno por WhatsApp
              </p>
              <p className="text-xs text-[#66716d]">
                Avisos 24h antes para confirmar asistencia
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={notificationToggle}
            onChange={(e) => setNotificationToggle(e.target.checked)}
            className="w-5 h-5 accent-[#123c32] rounded cursor-pointer"
          />
        </div>
      </section>

      {/* Historial de Pagos y Recibos Section */}
      <section id="historial-de-pagos-section" className="card-aesthetic p-5 sm:p-6 space-y-4 scroll-mt-24">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#123c32]">
              Historial de Pagos & Señas
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#efffc5] text-[#123c32] text-[11px] font-bold border border-[#d9f56a]/40">
              {filteredTransactions.length}
            </span>
          </div>
          <span className="text-[11px] text-[#195344] font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mercado Pago Oficial</span>
          </span>
        </div>

        {/* Financial Balance Summary Banner */}
        <div className="bg-[#f7faf7] border border-[#d8e2de] rounded-[22px] p-4 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-[#66716d] font-bold uppercase tracking-wider block">Total señas abonadas</span>
            <span className="text-xl sm:text-2xl font-bold text-[#123c32] tracking-tight">
              {formatCurrency(totalDepositsPaid)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#66716d] block font-semibold">Respaldo fiscal</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#195344] bg-[#efffc5] px-2.5 py-0.5 rounded-full border border-[#d9f56a]/40 mt-0.5">
              ✓ Acreditado 100%
            </span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-white border border-[#d8e2de] shadow-xs">
          <button
            type="button"
            onClick={() => setPaymentFilter('all')}
            className={`py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              paymentFilter === 'all'
                ? 'bg-[#123c32] text-white shadow-sm'
                : 'text-[#66716d] hover:text-[#123c32]'
            }`}
          >
            Todos ({userTransactions.length})
          </button>
          <button
            type="button"
            onClick={() => setPaymentFilter('deposit')}
            className={`py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              paymentFilter === 'deposit'
                ? 'bg-[#123c32] text-white shadow-sm'
                : 'text-[#66716d] hover:text-[#123c32]'
            }`}
          >
            Señas MP ({userTransactions.filter(t => t.concept.toLowerCase().includes('seña')).length})
          </button>
          <button
            type="button"
            onClick={() => setPaymentFilter('balance')}
            className={`py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              paymentFilter === 'balance'
                ? 'bg-[#123c32] text-white shadow-sm'
                : 'text-[#66716d] hover:text-[#123c32]'
            }`}
          >
            En Cabina ({userTransactions.filter(t => !t.concept.toLowerCase().includes('seña')).length})
          </button>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map((txn) => (
            <div
              key={txn.id}
              onClick={() => {
                setSelectedReceiptTxn(txn);
                setShowReceiptModal(true);
              }}
              className="p-3.5 sm:p-4 rounded-[20px] bg-[#f7faf7] hover:bg-white border border-[#d8e2de] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-white border border-[#d8e2de] text-[#123c32] flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:scale-105 transition-transform">
                  <Receipt className="w-5 h-5 text-[#123c32]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-xs sm:text-sm text-[#18211f] group-hover:text-[#123c32] transition-colors truncate">
                      {txn.serviceTitle}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#efffc5] text-[#123c32] text-[10px] font-bold border border-[#d9f56a]/30">
                      ✓ Aprobado
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66716d] font-medium mt-0.5 truncate">
                    {txn.concept}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-[#66716d] mt-1 flex-wrap font-medium">
                    <span>{txn.date} · {txn.time} hs</span>
                    <span>•</span>
                    <span>{txn.paymentMethod}</span>
                    <span>•</span>
                    <span className="font-mono">#{txn.mpOperationNumber}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#d8e2de] shrink-0">
                <div className="text-left sm:text-right">
                  <span className="font-bold text-sm sm:text-base text-[#123c32] block leading-tight">
                    {formatCurrency(txn.amount)}
                  </span>
                  <span className="text-[10px] text-[#66716d]">
                    Op. #{txn.mpOperationNumber.slice(-4)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReceiptTxn(txn);
                    setShowReceiptModal(true);
                  }}
                  title="Ver o descargar comprobante visual"
                  className="px-3 py-1.5 rounded-full bg-[#123c32] hover:bg-[#195344] text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#d9f56a]" />
                  <span>Recibo</span>
                </button>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-[#66716d] text-xs">
              No hay transacciones registradas en este filtro.
            </div>
          )}
        </div>
      </section>

      {/* Ficha Médica & Consentimiento Digital */}
      <section className="card-aesthetic p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-[#123c32]">
            Ficha Médica & Consentimiento
          </h2>
          <span className="text-xs font-bold text-[#123c32] bg-[#efffc5] px-2.5 py-0.5 rounded-full border border-[#d9f56a]/40">
            {clientProfile.medicalSheetCompleted}% completado
          </span>
        </div>

        <div
          onClick={onOpenMedicalSheet}
          className="bg-[#f7faf7] border border-[#d8e2de] rounded-[22px] p-4 cursor-pointer group hover:border-[#123c32]/40 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-[#d8e2de] text-[#123c32] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#123c32]" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-[#18211f]">
                  Ficha Médica Digital & Alergias
                </p>
                <p className="text-[11px] text-[#66716d]">
                  Consentimiento informado y preferencias de cabina
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#123c32] flex items-center gap-1">
              <span>Editar</span>
              <span>→</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[#d8e2de] overflow-hidden mt-3">
            <div
              className="h-full bg-[#123c32] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${clientProfile.medicalSheetCompleted}%` }}
            ></div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-[#66716d] flex-wrap gap-1">
            <span className="text-[11px]">
              Alergias a cianoacrilato, retinol y tipo de piel
            </span>
            <span className="text-[#195344] font-bold text-[11px] shrink-0">
              {clientProfile.consentSigned ? 'Firmado digitalmente ✓' : 'Firma pendiente'}
            </span>
          </div>
        </div>
      </section>

      {/* Cerrar Sesión Segura */}
      <div className="pt-2">
        <button
          onClick={() => setShowLogoutConfirmModal(true)}
          className="w-full py-4 rounded-[18px] bg-white hover:bg-red-50 text-red-700 hover:border-red-300 border border-[#d8e2de] transition-colors text-xs sm:text-sm flex items-center justify-center gap-2 font-bold cursor-pointer active:scale-95 shadow-xs"
          type="button"
        >
          <span>Cerrar Sesión Segura</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="card-aesthetic max-w-xs w-full p-6 text-center animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-lg text-[#123c32]">¿Cerrar sesión?</h3>
            <p className="text-xs text-[#66716d] mt-1.5 leading-relaxed">
              Se cerrará tu sesión activa de <strong>{clientProfile.name}</strong>. Podrás volver a ingresar en cualquier momento para ver tus turnos.
            </p>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirmModal(false);
                  if (onLogout) {
                    onLogout();
                  }
                }}
                className="w-full py-3 rounded-[16px] bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Sí, Cerrar Sesión
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutConfirmModal(false)}
                className="w-full py-2.5 rounded-full text-[#66716d] hover:text-[#123c32] font-semibold text-xs transition-colors cursor-pointer"
              >
                Permanecer Conectada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile & Photo Modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="card-aesthetic max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#d8e2de]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#123c32]" />
                <h3 className="text-base font-bold text-[#123c32]">
                  Editar Datos & Foto
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#edf2ef] hover:bg-[#d8e2de] flex items-center justify-center text-[#66716d] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              {/* Photo preview & upload action */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-[22px] overflow-hidden border-2 border-white ring-4 ring-[#123c32]/20 shadow-md">
                    <img
                      src={editAvatar}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover rounded-[18px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#123c32] text-white flex items-center justify-center shadow-md hover:bg-[#195344] transition-all cursor-pointer"
                    title="Subir foto desde archivo"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#d9f56a]" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs font-semibold text-[#123c32] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Subir foto desde tu dispositivo</span>
                </button>

                {/* Preset Avatars */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] text-[#66716d] font-medium mr-1">O elegir:</span>
                  {presetAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(url)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        editAvatar === url ? 'border-[#123c32] ring-2 ring-[#123c32]/30 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[#66716d] mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-xs font-medium text-[#18211f]"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-[#66716d] mb-1">
                  Teléfono WhatsApp *
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+54 9 11 ..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-xs font-medium text-[#18211f]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#66716d] mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="tuemail@ejemplo.com"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-xs font-medium text-[#18211f]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="flex-1 py-3 rounded-full bg-[#edf2ef] hover:bg-[#d8e2de] text-[#123c32] font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-[#123c32] hover:bg-[#195344] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visual Digital Receipt Modal */}
      <ReceiptModal
        transaction={selectedReceiptTxn}
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setSelectedReceiptTxn(null);
        }}
      />
    </div>
  );
};
