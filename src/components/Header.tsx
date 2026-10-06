import React, { useState, useRef } from 'react';
import { Business, ClientProfile } from '../types';
import { 
  Building2, 
  ChevronDown, 
  Check, 
  CalendarDays,
  Edit2,
  Upload,
  X,
  Camera
} from 'lucide-react';

interface HeaderProps {
  currentBusiness: Business;
  allBusinesses: Business[];
  onSelectBusiness: (business: Business) => void;
  activeTab: string;
  clientProfile: ClientProfile;
  isMobileFrame?: boolean;
  onToggleMobileFrame?: () => void;
  isAdminMode?: boolean;
  onToggleAdminMode?: () => void;
  onOpenNotifications: () => void;
  onNavigateToTab: (tab: string) => void;
  onUpdateBusiness?: (fields: Partial<Business>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBusiness,
  allBusinesses,
  onSelectBusiness,
  activeTab,
  clientProfile,
  isAdminMode,
  onOpenNotifications,
  onNavigateToTab,
  onUpdateBusiness,
}) => {
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);

  // Business Name & Title Edit Modal state
  const [showEditBusinessModal, setShowEditBusinessModal] = useState(false);
  const [editName, setEditName] = useState(currentBusiness.name);
  const [editHeaderSubtitle, setEditHeaderSubtitle] = useState(currentBusiness.headerSubtitle || 'Servicios & Especialistas');
  const [editCategory, setEditCategory] = useState(currentBusiness.category);
  const [editTagline, setEditTagline] = useState(currentBusiness.tagline);
  const [editLogo, setEditLogo] = useState(currentBusiness.logo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openEditBusinessModal = () => {
    setEditName(currentBusiness.name);
    setEditHeaderSubtitle(currentBusiness.headerSubtitle || 'Servicios & Especialistas');
    setEditCategory(currentBusiness.category);
    setEditTagline(currentBusiness.tagline);
    setEditLogo(currentBusiness.logo);
    setShowEditBusinessModal(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Por favor seleccioná una imagen menor a 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setEditLogo(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBusinessIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    if (onUpdateBusiness) {
      onUpdateBusiness({
        name: editName.trim(),
        headerSubtitle: editHeaderSubtitle.trim(),
        category: editCategory.trim(),
        tagline: editTagline.trim(),
        logo: editLogo,
      });
    }
    setShowEditBusinessModal(false);
  };

  const getSubtitle = () => {
    if (isAdminMode) return 'Panel de Gestión';
    if (currentBusiness.headerSubtitle && activeTab === 'servicios') {
      return currentBusiness.headerSubtitle;
    }
    switch (activeTab) {
      case 'servicios': return currentBusiness.headerSubtitle || 'Servicios & Especialistas';
      case 'reservar-cita': return 'Reservar Turno';
      case 'confirmar-reserva': return 'Confirmar Reserva';
      case 'mis-turnos': return 'Mis Turnos';
      case 'perfil-clinico': return 'Perfil Clínico';
      default: return currentBusiness.headerSubtitle || 'Turnos Online';
    }
  };

  const presetLogos = [
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&h=200&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&h=200&q=80',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=200&h=200&q=80',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=200&h=200&q=80',
  ];

  return (
    <>
      {/* Main Stylized Topbar (Fidelity to user HTML & CSS) */}
      <header className="sticky top-0 w-full z-40 bg-surface/90 backdrop-blur-xl border-b border-[#d8e2de]/80 shadow-[0_4px_20px_rgba(18,60,50,0.05)]">
        <div className="max-w-[540px] mx-auto px-4 sm:px-5 py-3.5 flex items-center justify-between">
          {/* Brand + Business Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowBusinessMenu(!showBusinessMenu)}
                className="flex items-center gap-3 text-left group cursor-pointer"
              >
                {/* Brand Avatar with 4px forest border and gradient */}
                <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center border-4 border-[#123c32] bg-gradient-to-br from-[#d8e7dd] to-[#b4cbbb] text-[#123c32] font-bold text-xl shadow-sm shrink-0 overflow-hidden">
                  {currentBusiness.logo ? (
                    <img src={currentBusiness.logo} alt={currentBusiness.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">✦</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xl sm:text-[23px] text-[#18211f] tracking-tight leading-none">
                      {currentBusiness.name}
                    </span>
                    <span className="text-xl text-[#18211f] font-light ml-0.5 group-hover:translate-y-0.5 transition-transform">⌄</span>
                    
                    {/* Quick Edit Business Button (Visible in Admin Mode) */}
                    {isAdminMode && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditBusinessModal();
                        }}
                        title="Modificar nombre y título de la empresa"
                        className="w-5 h-5 rounded-full bg-[#123c32]/10 hover:bg-[#123c32] hover:text-white text-[#123c32] flex items-center justify-center transition-all cursor-pointer shadow-sm ml-1"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-[#123c32] uppercase tracking-[1.2px] mt-1 leading-none">
                    {getSubtitle()}
                  </span>
                </div>
              </button>

              {/* Business Switcher Dropdown */}
              {showBusinessMenu && (
                <div 
                  className="absolute left-0 top-16 w-72 bg-white rounded-3xl shadow-[0_16px_40px_rgba(18,60,50,0.16)] border border-[#d8e2de] p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setShowBusinessMenu(false)}
                >
                  <div className="px-3 py-2 text-xs font-bold text-[#66716d] uppercase tracking-wider border-b border-[#edf2ef] flex items-center justify-between">
                    <span>Cambiar de Negocio Local</span>
                    {isAdminMode && (
                      <span className="text-[10px] text-[#123c32] font-bold bg-[#d9f56a] px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 mt-1">
                    {allBusinesses.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => onSelectBusiness(b)}
                        className={`w-full flex items-center gap-3 p-2 rounded-2xl text-left transition-all ${
                          b.id === currentBusiness.id 
                            ? 'bg-[#123c32]/10 text-[#123c32] font-semibold' 
                            : 'hover:bg-[#f7faf7] text-[#18211f]'
                        }`}
                      >
                        <img 
                          src={b.logo} 
                          alt={b.name} 
                          className="w-9 h-9 rounded-full object-cover border border-[#d8e2de]" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate leading-tight">{b.name}</p>
                          <p className="text-xs text-[#66716d] truncate">{b.category}</p>
                        </div>
                        {b.id === currentBusiness.id && (
                          <Check className="w-4 h-4 text-[#123c32] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#edf2ef] px-2 space-y-2">
                    {isAdminMode && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowBusinessMenu(false);
                          openEditBusinessModal();
                        }}
                        className="w-full py-2 px-3 rounded-2xl bg-[#d9f56a] text-[#123c32] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#c2e44e] transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modificar Nombre & Título</span>
                      </button>
                    )}
                    <p className="text-[11px] text-[#66716d]">
                      💡 Cada negocio tiene su link personalizado (ej. tusturnos.app/{currentBusiness.slug}).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right actions: Notifications & Client Profile (Fidelity to user CSS .icon-button & .profile-avatar) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenNotifications}
              aria-label="Notificaciones"
              className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-[#123c32] flex items-center justify-center shadow-[0_8px_22px_rgba(18,60,50,0.09)] hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#d8e2de]/50"
            >
              <span className="material-symbols-outlined text-[23px]">notifications</span>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#d9f56a] border-2 border-white shadow-xs"></span>
            </button>

            <button
              onClick={() => onNavigateToTab('perfil-clinico')}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#a7b5e5] to-[#394d9a] text-white font-bold text-sm border-3 border-white shadow-[0_6px_18px_rgba(18,60,50,0.12)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all overflow-hidden cursor-pointer"
              title="Mi Perfil Clínico"
            >
              {clientProfile.avatar ? (
                <img
                  alt={clientProfile.name}
                  className="w-full h-full object-cover"
                  src={clientProfile.avatar}
                />
              ) : (
                <span>CR</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hidden file input for logo */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleLogoUpload}
      />

      {/* Modal: Modificar Nombre y Título de la Empresa */}
      {showEditBusinessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveBusinessIdentity}
            className="bg-surface-container-lowest rounded-3xl max-w-sm sm:max-w-md w-full p-6 text-on-surface shadow-2xl border border-surface-container-high animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-container/20 text-primary flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface leading-tight">
                    Identidad de la Empresa
                  </h3>
                  <p className="text-[11px] text-secondary">
                    Modificá el nombre y el título visible en la cabecera
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditBusinessModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              {/* Logo / Foto del local */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-surface-container-high/50">
                <div className="relative group shrink-0">
                  <img
                    src={editLogo}
                    alt="Logo"
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Subir logo desde el dispositivo"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md hover:bg-primary transition-all cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-xs">Logo / Foto del Local</p>
                  <p className="text-[11px] text-secondary mt-0.5">Se muestra en la cabecera junto al nombre</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Subir foto</span>
                    </button>
                    <span className="text-secondary text-[10px]">·</span>
                    <span className="text-[10px] text-secondary">o elegir preset:</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {presetLogos.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditLogo(url)}
                        className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                          editLogo === url ? 'ring-2 ring-primary border-primary scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nombre de la Empresa */}
              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ej: Lash & Brows Studio"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-on-surface"
                />
              </div>

              {/* Subtítulo / Título de la Cabecera */}
              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Título / Subtítulo en la Cabecera *
                </label>
                <input
                  type="text"
                  required
                  value={editHeaderSubtitle}
                  onChange={(e) => setEditHeaderSubtitle(e.target.value)}
                  placeholder="Ej: SERVICIOS & ESPECIALISTAS"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-on-surface uppercase tracking-wider"
                />
                <p className="text-[10px] text-secondary mt-1">
                  Texto en mayúsculas color verde debajo del nombre de la empresa (ej: SERVICIOS & ESPECIALISTAS o ESTUDIO DE MIRADAS HD).
                </p>
              </div>

              {/* Rubro o Categoría */}
              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Rubro / Especialidad
                </label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="Ej: Pestañas & Cejas HD"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
                />
              </div>

              {/* Slogan */}
              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Slogan o Descripción Corta
                </label>
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  placeholder="Ej: Especialistas en miradas, lifting y microblading"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-surface-container-high text-xs font-medium text-on-surface"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-surface-container-high/60 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEditBusinessModal(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-secondary hover:bg-surface-container"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-primary-container text-on-primary text-xs font-bold shadow-md hover:bg-primary transition-all active:scale-95"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
