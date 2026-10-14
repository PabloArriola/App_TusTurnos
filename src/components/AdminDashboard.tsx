import React, { useState, useRef } from 'react';
import { Business, Appointment, Service, Specialist, BlockedSlot } from '../types';
import { AdminAgendaView } from './AdminAgendaView';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Send, 
  Plus, 
  Check, 
  Share2, 
  Clock, 
  ShieldCheck, 
  Phone, 
  TrendingUp,
  Settings,
  Sparkles,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  Lock,
  AlertCircle,
  MapPin,
  X,
  Tag,
  Percent,
  CheckCircle2,
  CalendarDays,
  Upload,
  Camera
} from 'lucide-react';

interface AdminDashboardProps {
  business: Business;
  appointments: Appointment[];
  onUpdateAppointmentStatus: (id: string, newStatus: Appointment['status']) => void;
  onAddManualAppointment: (appointment: Appointment) => void;
  onUpdateServices: (services: Service[]) => void;
  onUpdateBusiness: (fields: Partial<Business>) => void;
  onOpenBusinessSettings?: () => void;
  onSwitchToClientMode: () => void;
  onLogoutAdmin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  business,
  appointments,
  onUpdateAppointmentStatus,
  onAddManualAppointment,
  onUpdateServices,
  onUpdateBusiness,
  onSwitchToClientMode,
  onLogoutAdmin,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'agenda' | 'servicios' | 'horarios' | 'equipo' | 'ajustes'>('agenda');
  const [selectedDayFilter, setSelectedDayFilter] = useState<'today' | 'tomorrow' | 'all'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Manual booking modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualClientName, setManualClientName] = useState('');
  const [manualClientPhone, setManualClientPhone] = useState('');
  const [manualServiceId, setManualServiceId] = useState(business.services[0]?.id || '');
  const [manualDate, setManualDate] = useState('2026-10-31');
  const [manualTime, setManualTime] = useState('16:00');

  // Service Edit / Create Modal state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [srvTitle, setSrvTitle] = useState('');
  const [srvCategory, setSrvCategory] = useState('Pestañas');
  const [srvPrice, setSrvPrice] = useState<number | string>(20000);
  const [srvDepositPercentage, setSrvDepositPercentage] = useState(30);
  const [srvDurationMinutes, setSrvDurationMinutes] = useState(60);
  const [srvDescription, setSrvDescription] = useState('');
  const [srvTag, setSrvTag] = useState('');
  const [srvPopular, setSrvPopular] = useState(false);

  // Blocked slot form state
  const [blockDate, setBlockDate] = useState('2026-11-01');
  const [blockAllDay, setBlockAllDay] = useState(true);
  const [blockTime, setBlockTime] = useState('14:00 - 17:00');
  const [blockReason, setBlockReason] = useState('Capacitación & Limpieza de Cabina');

  // Business Settings state
  const [bizName, setBizName] = useState(business.name);
  const [bizHeaderSubtitle, setBizHeaderSubtitle] = useState(business.headerSubtitle || 'Servicios & Especialistas');
  const [bizCategory, setBizCategory] = useState(business.category);
  const [bizTagline, setBizTagline] = useState(business.tagline);
  const [bizLogo, setBizLogo] = useState(business.logo);
  const [bizAddress, setBizAddress] = useState(business.address);
  const [bizCity, setBizCity] = useState(business.city);
  const [bizWhatsapp, setBizWhatsapp] = useState(business.phoneWhatsapp || '3794825713');
  const [bizInstagram, setBizInstagram] = useState(business.instagram);
  const [bizAlias, setBizAlias] = useState(business.aliasCbu);
  const [bizBank, setBizBank] = useState(business.bankName);
  const [bizDepositDefault, setBizDepositDefault] = useState<number | string>(business.defaultDepositPercentage || 30);
  const [bizCancelHours, setBizCancelHours] = useState<number | string>(business.cancellationNoticeHours || 24);
  const [bizOpeningTime, setBizOpeningTime] = useState(business.openingTime || '09:00');
  const [bizClosingTime, setBizClosingTime] = useState(business.closingTime || '20:00');
  const [bizBufferMinutes, setBizBufferMinutes] = useState(business.bufferMinutes || 15);
  const [bizAvailableDays, setBizAvailableDays] = useState<number[]>(business.availableDays || [1, 2, 3, 4, 5, 6]);
  const [bizAuthorizedAdmins, setBizAuthorizedAdmins] = useState<string[]>(() =>
    Array.from(new Set([...(business.authorizedAdmins || []), 'arriolapablo.a@gmail.com']))
  );
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (business.phoneWhatsapp) {
      setBizWhatsapp(business.phoneWhatsapp);
    }
    if (business.authorizedAdmins) {
      setBizAuthorizedAdmins(
        Array.from(new Set([...business.authorizedAdmins, 'arriolapablo.a@gmail.com']))
      );
    }
  }, [business.phoneWhatsapp, business.authorizedAdmins]);

  const handleAddAuthorizedAdmin = () => {
    const clean = newAdminEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) return;
    const updated = Array.from(new Set([...bizAuthorizedAdmins, clean, 'arriolapablo.a@gmail.com']));
    setBizAuthorizedAdmins(updated);
    setNewAdminEmail('');
    onUpdateBusiness({ authorizedAdmins: updated });
  };

  const handleRemoveAuthorizedAdmin = (emailToRemove: string) => {
    if (emailToRemove.toLowerCase() === 'arriolapablo.a@gmail.com') return;
    const updated = bizAuthorizedAdmins.filter(
      (e) => e.toLowerCase() !== emailToRemove.toLowerCase()
    );
    setBizAuthorizedAdmins(updated);
    onUpdateBusiness({ authorizedAdmins: updated });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setBizLogo(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Specialist state
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
  const [editingSpecialistId, setEditingSpecialistId] = useState<string | null>(null);
  const [specName, setSpecName] = useState('');
  const [specRole, setSpecRole] = useState('Master Lash Artist');
  const [specMatricula, setSpecMatricula] = useState('');
  const [specAvatar, setSpecAvatar] = useState('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80');
  const specModalFileInputRef = useRef<HTMLInputElement>(null);

  // Helper to compress images client-side for fast loading & Firestore limits
  const compressImage = (file: File, maxWidth = 400, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxWidth) {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Direct image change handler from specialist card
  const handleUpdateSpecialistImageDirect = async (specialistId: string, file: File) => {
    try {
      if (file.size > 8 * 1024 * 1024) {
        alert('Por favor elegí una imagen menor a 8MB.');
        return;
      }
      const base64 = await compressImage(file, 400, 0.85);
      const updated = business.specialists.map((s) => {
        if (s.id === specialistId) {
          return { ...s, avatar: base64 };
        }
        return s;
      });
      onUpdateBusiness({ specialists: updated });
    } catch (err) {
      console.error('Error al actualizar la foto del profesional:', err);
      alert('Hubo un problema al procesar la imagen.');
    }
  };

  // Business specific appointments
  const businessAppointments = appointments.filter((a) => a.businessId === business.id);

  // Financial calculations
  const totalBookings = businessAppointments.length;
  const totalRevenue = businessAppointments.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const totalDeposits = businessAppointments.reduce((acc, curr) => acc + curr.depositPaid, 0);
  const totalPendingInCabin = businessAppointments.reduce((acc, curr) => acc + curr.remainingBalance, 0);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard?.writeText(`https://auraturnos.com/${business.slug}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const sendWhatsAppReminder = (appt: Appointment) => {
    const msg = `¡Hola ${appt.clientName}! Te recordamos desde *${business.name}* tu turno para *${appt.serviceTitle}* el día *${appt.date} a las ${appt.time} hs*.\n\n📍 Te esperamos en: ${business.address}\n💳 Seña abonada por MP: ${formatPrice(appt.depositPaid)}.\n💵 Saldo restante a abonar en el local: ${formatPrice(appt.remainingBalance)}.\n\nPor favor confirmá respondiendo este mensaje. ¡Muchas gracias!`;
    const cleanPhone = appt.clientPhone.replace(/\+/g, '').replace(/\s+/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Create manual appointment
  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualClientName.trim() || !manualClientPhone.trim()) return;

    const chosenService = business.services.find((s) => s.id === manualServiceId) || business.services[0];
    const deposit = Math.round((chosenService.price * chosenService.depositPercentage) / 100);

    const newAppt: Appointment = {
      id: `TK-MANUAL-${Math.floor(1000 + Math.random() * 9000)}`,
      businessId: business.id,
      serviceId: chosenService.id,
      serviceTitle: chosenService.title,
      specialistId: business.specialists[0]?.id || 'spec_1',
      specialistName: business.specialists[0]?.name || 'Profesional de Turno',
      specialistAvatar: business.specialists[0]?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80',
      date: manualDate,
      time: manualTime,
      durationMinutes: chosenService.durationMinutes,
      totalPrice: chosenService.price,
      depositPaid: deposit,
      remainingBalance: chosenService.price - deposit,
      status: 'confirmado',
      paymentMethod: 'mercadopago',
      paymentStatus: 'pagado',
      clientName: manualClientName,
      clientPhone: manualClientPhone,
      clientEmail: 'manual@cliente.com',
      clientNotes: 'Agendado manualmente por administración',
      createdAt: new Date().toISOString(),
    };

    onAddManualAppointment(newAppt);
    setShowAddModal(false);
    setManualClientName('');
    setManualClientPhone('');
  };

  // Service Management
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setSrvTitle('');
    setSrvCategory('Pestañas');
    setSrvPrice('');
    setSrvDepositPercentage(30);
    setSrvDurationMinutes(60);
    setSrvDescription('');
    setSrvTag('');
    setSrvPopular(false);
    setShowServiceModal(true);
  };

  const handleOpenEditService = (srv: Service) => {
    setEditingServiceId(srv.id);
    setSrvTitle(srv.title);
    setSrvCategory(srv.category);
    setSrvPrice(srv.price);
    setSrvDepositPercentage(srv.depositPercentage);
    setSrvDurationMinutes(srv.durationMinutes);
    setSrvDescription(srv.description);
    setSrvTag(srv.tag || '');
    setSrvPopular(!!srv.popular);
    setShowServiceModal(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvTitle.trim()) return;

    const finalPrice = typeof srvPrice === 'number' ? srvPrice : (parseInt(String(srvPrice).replace(/\D/g, ''), 10) || 0);
    if (finalPrice <= 0) return;

    if (editingServiceId) {
      // Edit existing
      const updated = business.services.map((s) => {
        if (s.id === editingServiceId) {
          return {
            ...s,
            title: srvTitle.trim(),
            category: srvCategory,
            price: finalPrice,
            depositPercentage: Number(srvDepositPercentage),
            durationMinutes: Number(srvDurationMinutes),
            description: srvDescription.trim(),
            tag: srvTag.trim() || undefined,
            popular: srvPopular,
          };
        }
        return s;
      });
      onUpdateServices(updated);
    } else {
      // Create new
      const newSrv: Service = {
        id: `srv_${Date.now()}`,
        title: srvTitle.trim(),
        category: srvCategory,
        price: finalPrice,
        depositPercentage: Number(srvDepositPercentage),
        durationMinutes: Number(srvDurationMinutes),
        description: srvDescription.trim() || 'Servicio profesional personalizado.',
        tag: srvTag.trim() || undefined,
        popular: srvPopular,
        isActive: true,
      };
      onUpdateServices([newSrv, ...business.services]);
    }
    setShowServiceModal(false);
  };

  const handleToggleServiceActive = (serviceId: string) => {
    const updated = business.services.map((s) => {
      if (s.id === serviceId) {
        return { ...s, isActive: s.isActive === false ? true : false };
      }
      return s;
    });
    onUpdateServices(updated);
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('¿Estás seguro de que deseás eliminar este servicio del catálogo?')) {
      const updated = business.services.filter((s) => s.id !== serviceId);
      onUpdateServices(updated);
    }
  };

  // Schedule & Block management
  const handleToggleDay = (dayIndex: number) => {
    const currentDays = bizAvailableDays;
    let nextDays: number[];
    if (currentDays.includes(dayIndex)) {
      nextDays = currentDays.filter((d) => d !== dayIndex);
    } else {
      nextDays = [...currentDays, dayIndex].sort();
    }
    setBizAvailableDays(nextDays);
    onUpdateBusiness({ availableDays: nextDays });
  };

  const handleSaveSchedules = () => {
    onUpdateBusiness({
      openingTime: bizOpeningTime,
      closingTime: bizClosingTime,
      bufferMinutes: Number(bizBufferMinutes),
      availableDays: bizAvailableDays,
    });
  };

  const handleAddBlockedSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate || !blockReason.trim()) return;

    const newBlocked: BlockedSlot = {
      id: `block_${Date.now()}`,
      date: blockDate,
      time: blockAllDay ? undefined : blockTime,
      reason: blockReason.trim(),
      allDay: blockAllDay,
    };

    const currentBlocks = business.blockedSlots || [];
    onUpdateBusiness({ blockedSlots: [newBlocked, ...currentBlocks] });
    setBlockReason('');
  };

  const handleRemoveBlockedSlot = (id: string) => {
    const currentBlocks = business.blockedSlots || [];
    onUpdateBusiness({ blockedSlots: currentBlocks.filter((b) => b.id !== id) });
  };

  // Save general settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBusiness({
      name: bizName.trim(),
      headerSubtitle: bizHeaderSubtitle.trim(),
      category: bizCategory.trim(),
      tagline: bizTagline.trim(),
      logo: bizLogo,
      address: bizAddress.trim(),
      city: bizCity.trim(),
      phoneWhatsapp: bizWhatsapp.trim(),
      instagram: bizInstagram.trim(),
      aliasCbu: bizAlias.trim(),
      bankName: bizBank.trim(),
      defaultDepositPercentage: Number(bizDepositDefault),
      cancellationNoticeHours: Number(bizCancelHours),
      authorizedAdmins: bizAuthorizedAdmins,
    });
  };

  // Specialist Management Handlers
  const handleOpenAddSpecialist = () => {
    setEditingSpecialistId(null);
    setSpecName('');
    setSpecRole('Master Lash Artist');
    setSpecMatricula('');
    setSpecAvatar('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80');
    setShowSpecialistModal(true);
  };

  const handleOpenEditSpecialist = (spec: Specialist) => {
    setEditingSpecialistId(spec.id);
    setSpecName(spec.name);
    setSpecRole(spec.role);
    setSpecMatricula(spec.registrationNumber || '');
    setSpecAvatar(spec.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80');
    setShowSpecialistModal(true);
  };

  const handleModalSpecImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Por favor elegí una imagen menor a 8MB.');
        return;
      }
      try {
        const base64 = await compressImage(file, 400, 0.85);
        setSpecAvatar(base64);
      } catch (err) {
        console.error('Error al cargar la imagen:', err);
      }
    }
  };

  const handleSaveSpecialist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specName.trim()) return;

    if (editingSpecialistId) {
      const updated = business.specialists.map((s) => {
        if (s.id === editingSpecialistId) {
          return {
            ...s,
            name: specName.trim(),
            role: specRole.trim(),
            registrationNumber: specMatricula.trim() || 'Cert. Profesional',
            avatar: specAvatar,
          };
        }
        return s;
      });
      onUpdateBusiness({ specialists: updated });
    } else {
      const newSpec: Specialist = {
        id: `spec_${Date.now()}`,
        name: specName.trim(),
        role: specRole.trim(),
        registrationNumber: specMatricula.trim() || 'Cert. Profesional',
        avatar: specAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80',
        rating: 5.0,
        reviewCount: 1,
        experienceYears: 3,
        patientCount: '100+',
        status: 'disponible',
      };
      onUpdateBusiness({ specialists: [...business.specialists, newSpec] });
    }

    setShowSpecialistModal(false);
    setEditingSpecialistId(null);
    setSpecName('');
    setSpecMatricula('');
  };

  const handleDeleteSpecialist = (specId: string) => {
    if (business.specialists.length <= 1) {
      alert('Debe haber al menos un especialista en el equipo.');
      return;
    }
    if (confirm('¿Estás seguro de que deseás eliminar este profesional del equipo?')) {
      const updated = business.specialists.filter((s) => s.id !== specId);
      onUpdateBusiness({ specialists: updated });
    }
  };

  const daysLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-3 sm:px-6 pb-28 space-y-5 animate-in fade-in duration-200">
      {/* Top Banner with Business Pitch & Share Link */}
      <div className="bg-gradient-to-r from-[#062217] via-[#132e22] to-[#062217] rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#d0ef68]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[#d0ef68] font-bold text-[10px] uppercase tracking-wider">
                Panel del Dueño / Admin
              </span>
              <span className="text-white/60 text-xs">Plan Pro</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                {business.name}
              </h1>
              <button
                type="button"
                onClick={() => setActiveTab('ajustes')}
                title="Modificar nombre y título de la empresa"
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-[#d0ef68] flex items-center justify-center transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {business.headerSubtitle && (
              <span className="inline-block px-2 py-0.5 rounded-md bg-white/10 text-[#d0ef68] text-[11px] font-bold uppercase tracking-wider mt-1">
                {business.headerSubtitle}
              </span>
            )}
            <p className="text-xs text-white/80 mt-1">
              Link de reservas: <strong className="text-[#d0ef68]">tusturnos.app/{business.slug}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToClientMode}
              className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
            >
              Ver como Cliente
            </button>
            {onLogoutAdmin && (
              <button
                onClick={onLogoutAdmin}
                className="px-3.5 py-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-white font-semibold text-xs border border-red-500/30 transition-all cursor-pointer"
              >
                Cerrar Sesión
              </button>
            )}
          </div>
        </div>

        {/* Business Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/15">
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <span className="text-[11px] text-white/70 block font-medium">Turnos Agendados</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{totalBookings}</span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <span className="text-[11px] text-[#d0ef68] block font-medium">Señas Cobradas (MP)</span>
            <span className="text-xl font-bold text-[#d0ef68] mt-0.5 block">{formatPrice(totalDeposits)}</span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <span className="text-[11px] text-white/70 block font-medium">Saldo en Cabina</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{formatPrice(totalPendingInCabin)}</span>
          </div>

          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <span className="text-[11px] text-white/70 block font-medium">Facturación Estimada</span>
            <span className="text-xl font-bold text-white mt-0.5 block">{formatPrice(totalRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Admin Interactive Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-2xl border border-surface-container-high/60 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'agenda'
              ? 'bg-primary-container text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Agenda & Turnos</span>
        </button>

        <button
          onClick={() => setActiveTab('servicios')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'servicios'
              ? 'bg-primary-container text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Servicios & Señas</span>
        </button>

        <button
          onClick={() => setActiveTab('horarios')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'horarios'
              ? 'bg-primary-container text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Horarios & Bloqueos</span>
        </button>

        <button
          onClick={() => setActiveTab('equipo')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'equipo'
              ? 'bg-primary-container text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Especialistas</span>
        </button>

        <button
          onClick={() => setActiveTab('ajustes')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'ajustes'
              ? 'bg-primary-container text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Ajustes del Estudio</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: AGENDA & TURNOS (ADAPTADA A PC / TABLET) */}
      {/* ============================================================ */}
      {activeTab === 'agenda' && (
        <AdminAgendaView
          business={business}
          appointments={appointments}
          onUpdateAppointmentStatus={onUpdateAppointmentStatus}
          onAddManualAppointmentClick={() => setShowAddModal(true)}
          onSendWhatsAppReminder={sendWhatsAppReminder}
          formatPrice={formatPrice}
        />
      )}

      {/* ============================================================ */}
      {/* TAB 2: SERVICIOS & SEÑAS */}
      {/* ============================================================ */}
      {activeTab === 'servicios' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-on-surface">Catálogo de Servicios & Señas</h2>
              <p className="text-xs text-secondary">
                Editá precios, duración de turnos y el porcentaje de seña de Mercado Pago.
              </p>
            </div>
            <button
              onClick={handleOpenAddService}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nuevo Servicio</span>
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,70,55,0.04)] border border-surface-container-high/60 divide-y divide-surface-container-low">
            {business.services.map((srv) => {
              const depositAmount = Math.round((srv.price * srv.depositPercentage) / 100);
              const isPaused = srv.isActive === false;

              return (
                <div key={srv.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`font-bold text-sm ${isPaused ? 'text-secondary line-through' : 'text-on-surface'}`}>
                        {srv.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-secondary text-[10px] font-bold">
                        {srv.category}
                      </span>
                      {srv.popular && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 text-[10px] font-bold">
                          Destacado ⭐
                        </span>
                      )}
                      {isPaused && (
                        <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-[10px] font-bold">
                          Pausado
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-secondary mt-1 line-clamp-1">
                      {srv.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-secondary mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        {srv.durationMinutes} min
                      </span>
                      <span>·</span>
                      <span>
                        Seña: <strong className="text-primary font-semibold">{srv.depositPercentage}%</strong> ({formatPrice(depositAmount)})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="text-right mr-2">
                      <span className="font-bold text-sm text-primary block">{formatPrice(srv.price)}</span>
                      <span className="text-[10px] text-secondary">Total servicio</span>
                    </div>

                    {/* Pause / Resume */}
                    <button
                      onClick={() => handleToggleServiceActive(srv.id)}
                      title={isPaused ? 'Reactivar servicio' : 'Pausar temporalmente'}
                      className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
                    >
                      {isPaused ? <PlayCircle className="w-4 h-4 text-emerald-600" /> : <PauseCircle className="w-4 h-4 text-amber-600" />}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleOpenEditService(srv)}
                      title="Editar servicio"
                      className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-primary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      title="Eliminar servicio"
                      className="w-8 h-8 rounded-full bg-surface-container hover:bg-error-container text-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: HORARIOS & BLOQUEOS */}
      {/* ============================================================ */}
      {activeTab === 'horarios' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-bold text-on-surface">Horarios de Atención & Bloqueos</h2>
            <p className="text-xs text-secondary">
              Definí días de apertura, franjas horarias y bloqueá turnos por vacaciones o capacitación.
            </p>
          </div>

          {/* Días y Horarios */}
          <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,70,55,0.04)] border border-surface-container-high/60 space-y-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span>Días Laborables</span>
            </h3>

            {/* Day toggles */}
            <div className="grid grid-cols-7 gap-1.5">
              {daysLabels.map((lbl, idx) => {
                const isSelected = bizAvailableDays.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleDay(idx)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                      isSelected
                        ? 'bg-primary-container text-on-primary shadow-sm'
                        : 'bg-surface-container text-secondary hover:bg-surface-container-high'
                    }`}
                  >
                    {lbl}
                  </button>
                );
              })}
            </div>

            {/* Opening / Closing times */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Apertura</label>
                <input
                  type="time"
                  value={bizOpeningTime}
                  onChange={(e) => setBizOpeningTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Cierre</label>
                <input
                  type="time"
                  value={bizClosingTime}
                  onChange={(e) => setBizClosingTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Margen entre turnos</label>
                <select
                  value={bizBufferMinutes}
                  onChange={(e) => setBizBufferMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                >
                  <option value={0}>0 minutos</option>
                  <option value={10}>10 minutos (rápido)</option>
                  <option value={15}>15 minutos (recomendado)</option>
                  <option value={20}>20 minutos</option>
                  <option value={30}>30 minutos (desinfección)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveSchedules}
                className="px-4 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-sm hover:bg-primary transition-all"
              >
                Guardar Horarios
              </button>
            </div>
          </div>

          {/* Bloquear Turno o Día Libre */}
          <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,70,55,0.04)] border border-surface-container-high/60 space-y-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-primary" />
              <span>Bloquear Franja Horaria o Día Libre</span>
            </h3>

            <form onSubmit={handleAddBlockedSlot} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Fecha</label>
                <input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Tipo de Bloqueo</label>
                <div className="flex items-center gap-2 h-9">
                  <label className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={blockAllDay}
                      onChange={(e) => setBlockAllDay(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span>Todo el día</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Motivo</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ej: Feriado, Médico..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  required
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-sm hover:bg-primary transition-all"
                >
                  Bloquear en Agenda
                </button>
              </div>
            </form>

            {/* List of active blocked slots */}
            {(business.blockedSlots || []).length > 0 && (
              <div className="mt-3 pt-3 border-t border-surface-container-high/60 space-y-2">
                <span className="text-xs font-bold text-secondary block">Bloqueos Activos:</span>
                {business.blockedSlots!.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low text-xs">
                    <div>
                      <span className="font-bold text-on-surface">{slot.date}</span>
                      <span className="text-secondary ml-2">({slot.reason})</span>
                      {slot.allDay && <span className="ml-2 text-[10px] bg-primary-fixed text-on-primary-fixed-variant px-1.5 py-0.2 rounded font-bold">Todo el día</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlockedSlot(slot.id)}
                      className="text-xs text-error font-semibold hover:underline"
                    >
                      Desbloquear
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: ESPECIALISTAS */}
      {/* ============================================================ */}
      {activeTab === 'equipo' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-on-surface">Equipo de Profesionales</h2>
              <p className="text-xs text-secondary">
                Gestioná al staff de especialistas que atienden los turnos y sus fotos de perfil.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddSpecialist}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Profesional</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {business.specialists.map((spec) => (
              <div
                key={spec.id}
                className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,70,55,0.04)] border border-surface-container-high/60 flex items-start gap-3.5 relative group hover:border-primary/40 transition-colors"
              >
                {/* Avatar with direct photo upload badge */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container ring-2 ring-primary/20 shadow-xs relative">
                    <img src={spec.avatar} alt={spec.name} className="w-full h-full object-cover" />
                  </div>
                  {/* Quick Camera Change Button */}
                  <label
                    htmlFor={`spec-file-${spec.id}`}
                    title="Cambiar foto de este profesional"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#123c32] hover:bg-[#195344] text-[#d9f56a] flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95 border-2 border-white"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      id={`spec-file-${spec.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpdateSpecialistImageDirect(spec.id, f);
                      }}
                    />
                  </label>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-sm text-on-surface truncate">{spec.name}</h4>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5 mr-1">
                        ★ {spec.rating}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditSpecialist(spec)}
                        title="Editar datos y foto del profesional"
                        className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSpecialist(spec.id)}
                        title="Eliminar profesional"
                        className="p-1 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-primary font-medium truncate">{spec.role}</p>
                  <p className="text-[11px] text-secondary mt-0.5">{spec.registrationNumber}</p>

                  <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-surface-container-high/40">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-800">
                      En Cabina / Activa
                    </span>
                    <label
                      htmlFor={`spec-file-text-${spec.id}`}
                      className="text-[11px] font-semibold text-primary hover:text-primary/80 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      title="Subir nueva foto"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Cambiar foto</span>
                      <input
                        id={`spec-file-text-${spec.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpdateSpecialistImageDirect(spec.id, f);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: AJUSTES DEL ESTUDIO */}
      {/* ============================================================ */}
      {activeTab === 'ajustes' && (
        <form onSubmit={handleSaveSettings} className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h2 className="text-base font-bold text-on-surface">Ajustes Generales & Políticas</h2>
            <p className="text-xs text-secondary">
              Información visible para los clientes y configuración de señas por Mercado Pago.
            </p>
          </div>

          {/* Hidden input for logo upload */}
          <input
            type="file"
            ref={logoInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />

          <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,70,55,0.04)] border border-surface-container-high/60 space-y-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5 pb-2 border-b border-surface-container-high/50">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Identidad del Negocio & Cabecera</span>
            </h3>

            {/* Logo preview & upload */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-surface-container-high/50">
              <div className="relative group shrink-0">
                <img
                  src={bizLogo}
                  alt="Logo"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  title="Subir logo desde el dispositivo"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md hover:bg-primary transition-all cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-on-surface text-xs">Logo / Foto del Local</p>
                <p className="text-[11px] text-secondary mt-0.5">Se muestra en la cabecera superior y tarjetas de turnos</p>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-[11px] font-bold text-primary hover:underline mt-1 flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  <span>Subir imagen desde tu dispositivo</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="Ej: Lash & Brows Studio"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Título / Subtítulo en Cabecera *
                </label>
                <input
                  type="text"
                  value={bizHeaderSubtitle}
                  onChange={(e) => setBizHeaderSubtitle(e.target.value)}
                  placeholder="Ej: SERVICIOS & ESPECIALISTAS"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface uppercase tracking-wider"
                  required
                />
                <span className="text-[10px] text-secondary mt-0.5 block">
                  Texto en mayúsculas color verde debajo del nombre en el encabezado.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Rubro / Especialidad
                </label>
                <input
                  type="text"
                  value={bizCategory}
                  onChange={(e) => setBizCategory(e.target.value)}
                  placeholder="Ej: Pestañas & Cejas HD"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Slogan o Descripción Corta
                </label>
                <input
                  type="text"
                  value={bizTagline}
                  onChange={(e) => setBizTagline(e.target.value)}
                  placeholder="Ej: Especialistas en miradas, lifting y microblading"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-medium text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  WhatsApp de Recepción y Notificaciones
                </label>
                <input
                  type="text"
                  value={bizWhatsapp}
                  onChange={(e) => setBizWhatsapp(e.target.value)}
                  placeholder="Ej: 3794825713"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  required
                />
                <p className="text-[10px] text-on-surface-variant mt-1">
                  A este número llegarán las confirmaciones de turnos, señas y consultas de tus pacientes.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-on-surface mb-1">Dirección del Local</label>
                <input
                  type="text"
                  value={bizAddress}
                  onChange={(e) => setBizAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Ciudad</label>
                <input
                  type="text"
                  value={bizCity}
                  onChange={(e) => setBizCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Instagram (@usuario)</label>
                <input
                  type="text"
                  value={bizInstagram}
                  onChange={(e) => setBizInstagram(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-surface-container-high/60">
              <h3 className="font-bold text-xs text-on-surface mb-2">Cobro de Señas & Cancelaciones</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Alias / CVU de Cobro</label>
                  <input
                    type="text"
                    value={bizAlias}
                    onChange={(e) => setBizAlias(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">% Seña por Defecto</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="30"
                    value={bizDepositDefault}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      if (!raw) {
                        setBizDepositDefault('');
                        return;
                      }
                      const clean = raw.replace(/^0+(?=\d)/, '');
                      const num = Math.min(100, parseInt(clean, 10) || 0);
                      setBizDepositDefault(num === 0 ? '' : num);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Aviso de Cancelación (Horas)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="24"
                    value={bizCancelHours}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      if (!raw) {
                        setBizCancelHours('');
                        return;
                      }
                      const clean = raw.replace(/^0+(?=\d)/, '');
                      setBizCancelHours(clean);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-container-high/60">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-xs text-on-surface">
                  Administradores Autorizados (Acceso Exclusivo a /admin)
                </h3>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-3">
                Solo las cuentas de Google o correos en esta lista tienen permiso para ingresar al Panel de Control en <strong>/admin</strong>. Cualquier otro correo será rechazado automáticamente.
              </p>

              {/* Current authorized list */}
              <div className="space-y-2 mb-3">
                {bizAuthorizedAdmins.map((adminMail) => {
                  const isSuperAdmin = adminMail.toLowerCase() === 'arriolapablo.a@gmail.com';
                  return (
                    <div
                      key={adminMail}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-semibold text-on-surface truncate">{adminMail}</span>
                        {isSuperAdmin && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary shrink-0">
                            Principal (Fijo)
                          </span>
                        )}
                      </div>
                      {!isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAuthorizedAdmin(adminMail)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Quitar acceso de administrador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add new authorized email */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Agregar otro correo de Google autorizado (ej: socio@gmail.com)"
                  className="flex-1 px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-medium text-on-surface"
                />
                <button
                  type="button"
                  onClick={handleAddAuthorizedAdmin}
                  className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Autorizar Correo</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-md hover:bg-primary transition-all active:scale-95"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ============================================================ */}
      {/* MODAL: EDITAR / CREAR SERVICIO */}
      {/* ============================================================ */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveService}
            className="bg-surface-container-lowest rounded-3xl max-w-md w-full p-6 text-on-surface shadow-2xl border border-surface-container-high animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/60">
              <h3 className="font-bold text-base text-on-surface">
                {editingServiceId ? 'Editar Servicio' : 'Nuevo Servicio'}
              </h3>
              <button
                type="button"
                onClick={() => setShowServiceModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Nombre del Servicio *</label>
                <input
                  type="text"
                  value={srvTitle}
                  onChange={(e) => setSrvTitle(e.target.value)}
                  placeholder="Ej: Lifting de Pestañas Botox"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Categoría</label>
                  <select
                    value={srvCategory}
                    onChange={(e) => setSrvCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  >
                    <option value="Combos & Packs">Combos & Packs</option>
                    <option value="Pestañas">Pestañas</option>
                    <option value="Cejas">Cejas</option>
                    <option value="Faciales">Faciales</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Duración (minutos)</label>
                  <select
                    value={srvDurationMinutes}
                    onChange={(e) => setSrvDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min (1 h)</option>
                    <option value={80}>80 min</option>
                    <option value={90}>90 min (1.5 h)</option>
                    <option value={115}>115 min</option>
                    <option value={120}>120 min (2 h)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Precio Total ($ ARS) *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 20000"
                    value={srvPrice}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      if (!raw) {
                        setSrvPrice('');
                        return;
                      }
                      // Clean leading zeros so typing e.g. "1000" won't become "01000" and erasing leaves it completely clean
                      const clean = raw.replace(/^0+(?=\d)/, '');
                      setSrvPrice(clean);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-[#062217]/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Seña Mercado Pago (%)</label>
                  <select
                    value={srvDepositPercentage}
                    onChange={(e) => setSrvDepositPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  >
                    <option value={20}>20%</option>
                    <option value={30}>30% (Recomendado)</option>
                    <option value={40}>40%</option>
                    <option value={50}>50%</option>
                    <option value={100}>100% (Pago total)</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-primary-fixed/15 text-primary text-xs font-semibold flex items-center justify-between">
                <span>Monto de seña a cobrar hoy:</span>
                <span className="font-bold text-sm">
                  {formatPrice(Math.round(((typeof srvPrice === 'number' ? srvPrice : (parseInt(srvPrice || '0', 10) || 0)) * srvDepositPercentage) / 100))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={srvDescription}
                  onChange={(e) => setSrvDescription(e.target.value)}
                  placeholder="Detalles del procedimiento o materiales..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-medium text-on-surface resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">Etiqueta Promocional</label>
                  <input
                    type="text"
                    value={srvTag}
                    onChange={(e) => setSrvTag(e.target.value)}
                    placeholder="Ej: PACK AHORRO"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-on-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={srvPopular}
                      onChange={(e) => setSrvPopular(e.target.checked)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span>Marcar como Destacado ⭐</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-surface-container-high/60 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowServiceModal(false)}
                className="flex-1 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-md hover:bg-primary transition-all"
              >
                Guardar Servicio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: AGREGAR TURNO MANUAL */}
      {/* ============================================================ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateManual}
            className="bg-surface-container-lowest rounded-3xl max-w-sm w-full p-6 text-on-surface shadow-2xl border border-surface-container-high animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
              <h3 className="font-bold text-base">Agendar Turno Manual</h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)}
                className="text-secondary hover:text-on-surface text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nombre de la Clienta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofia Martínez"
                  value={manualClientName}
                  onChange={(e) => setManualClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Teléfono WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+54 9 11 4455-6677"
                  value={manualClientPhone}
                  onChange={(e) => setManualClientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Servicio *</label>
                <select
                  value={manualServiceId}
                  onChange={(e) => setManualServiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                >
                  {business.services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({formatPrice(s.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Fecha</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Hora</label>
                  <select
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high font-semibold"
                  >
                    <option value="10:00">10:00 hs</option>
                    <option value="11:30">11:30 hs</option>
                    <option value="14:00">14:00 hs</option>
                    <option value="15:30">15:30 hs</option>
                    <option value="16:00">16:00 hs</option>
                    <option value="17:30">17:30 hs</option>
                    <option value="19:00">19:00 hs</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-surface-container-low flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-secondary hover:bg-surface-container-low"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-md hover:bg-primary transition-all"
              >
                Confirmar Turno
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: AGREGAR / EDITAR ESPECIALISTA CON CARGA DE IMAGEN */}
      {/* ============================================================ */}
      {showSpecialistModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSpecialist}
            className="bg-surface-container-lowest rounded-3xl max-w-sm w-full p-6 text-on-surface shadow-2xl border border-surface-container-high animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/60">
              <h3 className="font-bold text-base text-on-surface">
                {editingSpecialistId ? 'Editar Profesional' : 'Agregar Especialista'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSpecialistModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {/* Photo Upload & Preview Section */}
              <div className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-surface-container-low border border-surface-container-high/60">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container ring-2 ring-primary/30 shadow-md">
                    <img
                      src={specAvatar}
                      alt="Foto del profesional"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => specModalFileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Cargar foto"
                  >
                    <Camera className="w-5 h-5 mb-0.5 text-[#d9f56a]" />
                    <span className="text-[10px] font-bold">Cambiar</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={specModalFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleModalSpecImageUpload}
                />

                <button
                  type="button"
                  onClick={() => specModalFileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-full bg-surface-container-high hover:bg-primary-container hover:text-on-primary text-on-surface text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{editingSpecialistId ? 'Cambiar Foto' : 'Cargar Foto'}</span>
                </button>
                <span className="text-[10px] text-secondary">
                  Subí una foto en formato JPG, PNG o WebP
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={specName}
                  onChange={(e) => setSpecName(e.target.value)}
                  placeholder="Ej: Lucía Méndez"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Especialidad / Rol *</label>
                <input
                  type="text"
                  value={specRole}
                  onChange={(e) => setSpecRole(e.target.value)}
                  placeholder="Ej: Master Lash Artist & Microblading"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">Matrícula o Certificado</label>
                <input
                  type="text"
                  value={specMatricula}
                  onChange={(e) => setSpecMatricula(e.target.value)}
                  placeholder="Ej: Lash Cert. 54.890"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-surface-container-high/60 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSpecialistModal(false)}
                className="flex-1 py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-md hover:bg-primary transition-all cursor-pointer"
              >
                {editingSpecialistId ? 'Guardar Cambios' : 'Agregar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
