import React, { useState } from 'react';
import { Business, Service, Specialist, BookedServiceItem } from '../types';
import { Search, Clock, ArrowRight, Calendar, Trash2 } from 'lucide-react';

interface ServicesViewProps {
  business: Business;
  selectedSpecialist: Specialist;
  onSelectSpecialist: (specialist: Specialist) => void;
  onSelectServiceToBook: (service: Service) => void;
  bookedItems?: BookedServiceItem[];
  onProceedToCheckoutWithBookedItems?: () => void;
  onRemoveBookedItem?: (id: string) => void;
  // Optional backwards compatibility
  selectedServices?: Service[];
  onToggleService?: (service: Service) => void;
  onClearServices?: () => void;
  onProceedToCalendar?: (services: Service[]) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  business,
  selectedSpecialist,
  onSelectSpecialist,
  onSelectServiceToBook,
  bookedItems = [],
  onProceedToCheckoutWithBookedItems,
  onRemoveBookedItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Combos & Packs', ...Array.from(new Set(business.services.map((s) => s.category))).filter((c) => c !== 'Combos & Packs')];

  // Combos list
  const comboPacks = business.services.filter((s) => s.isCombo || s.category === 'Combos & Packs');

  // Filtered list
  const filteredServices = business.services.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
  };

  const totalBookedDeposit = Math.round(
    bookedItems.reduce(
      (sum, item) => sum + (item.service.price * (item.service.depositPercentage || business.defaultDepositPercentage || 30)) / 100,
      0
    )
  );

  return (
    <div className="flex flex-col w-full max-w-[520px] mx-auto px-3.5 sm:px-4 space-y-4 pb-36 animate-in fade-in duration-200">
      {/* BANNER DE SERVICIOS YA AGENDADOS (SI EL USUARIO ELIGIÓ "RESERVAR OTRO SERVICIO") */}
      {bookedItems.length > 0 && (
        <div className="card-aesthetic p-4 sm:p-5 bg-[#edf7f2] border-2 border-[#2F3E3A]/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#2F3E3A] text-[#D9E6D3] flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                ✓
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#2F3E3A]">
                  {bookedItems.length} {bookedItems.length === 1 ? 'servicio agendado' : 'servicios agendados'} en tu reserva
                </h4>
                <p className="text-[11px] text-[#6F8A78]">
                  Seña acumulada: <strong className="text-[#2F3E3A]">{formatPrice(totalBookedDeposit)}</strong>
                </p>
              </div>
            </div>

            {onProceedToCheckoutWithBookedItems && (
              <button
                type="button"
                onClick={onProceedToCheckoutWithBookedItems}
                className="py-2 px-3.5 rounded-full bg-[#2F3E3A] text-white text-xs font-bold hover:bg-[#6F8A78] transition-all active:scale-95 shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Ir a Pagar</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D9E6D3]" />
              </button>
            )}
          </div>

          {/* List of currently booked items */}
          <div className="space-y-1.5 pt-1 border-t border-[#A8BDA3]/60">
            {bookedItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white border border-[#A8BDA3] shadow-2xs"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#2F3E3A] truncate">
                      #{idx + 1} {item.service.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6F8A78] flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-[#2F3E3A]" />
                    {item.formattedDate} · {item.time} hs ({item.specialist.name})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-[#2F3E3A] text-xs">
                    {formatPrice(item.service.price)}
                  </span>
                  {onRemoveBookedItem && (
                    <button
                      type="button"
                      onClick={() => onRemoveBookedItem(item.id)}
                      title="Quitar este turno"
                      className="w-6 h-6 rounded-full bg-[#E8EFE5] hover:bg-rose-50 hover:text-rose-600 text-[#6F8A78] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1 text-[11px] text-[#6F8A78]">
            Seleccioná tu próximo servicio a continuación para sumarlo a la sesión:
          </div>
        </div>
      )}

      {/* SPECIALIST CARD (User design fidelity) */}
      <article className="card-aesthetic p-5 sm:p-6 relative overflow-hidden transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-bold tracking-wide bg-[#D9E6D3] text-[#2F3E3A]">
                ESPECIALISTA
              </span>
              <span className="text-[#6F8A78] text-xs font-semibold">
                ♢ {selectedSpecialist.registrationNumber || 'Lash Cert. 48.112'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#2F3E3A] mt-3 tracking-tight">
              {selectedSpecialist.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#6F8A78] mt-1 line-clamp-2 leading-relaxed">
              {selectedSpecialist.bio || 'Especialista en miradas de autor, diseño de pestañas y cejas de alta definición.'}
            </p>
          </div>

          <div className="relative shrink-0">
            <img
              src={selectedSpecialist.avatar}
              alt={selectedSpecialist.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow-[0_8px_20px_rgba(18,60,50,0.15)] ring-2 ring-[#A8BDA3]"
            />
            <span
              className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white bg-[#4c9c35]"
              title="Disponible para turnos"
            />
          </div>
        </div>

        {/* Staff Switcher Section (Symmetrical Layout) */}
        {business.specialists.length > 1 && (
          <div className="w-full space-y-2 mt-4 pt-3.5 border-t border-[#E8EFE5]">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[#6F8A78] text-xs font-semibold">
                Especialistas del staff
              </span>
              <span className="text-[11px] text-[#2F3E3A] font-bold bg-[#D9E6D3] px-2 py-0.5 rounded-full border border-[#D9E6D3]/40">
                {business.specialists.length} profesionales
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              {business.specialists.map((sp) => {
                const isActive = selectedSpecialist.id === sp.id;
                const firstName = sp.name.split(' ')[0];
                const initial = firstName.charAt(0).toUpperCase();

                return (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => onSelectSpecialist(sp)}
                    className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer w-full text-center ${
                      isActive
                        ? 'bg-[#2F3E3A] text-white shadow-[0_6px_16px_rgba(18,60,50,0.18)] ring-2 ring-[#D9E6D3]/60 scale-[1.01]'
                        : 'bg-[#E8EFE5] text-[#6F8A78] hover:bg-[#e2eae6] hover:text-[#2F3E3A]'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      isActive ? 'bg-[#8eaa9b] text-white' : 'bg-[#d4e0d8] text-[#2F3E3A]'
                    }`}>
                      {initial}
                    </span>
                    <span className="truncate">{firstName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </article>

      {/* COMBOS & PACKS SECTION */}
      {comboPacks.length > 0 && (selectedCategory === 'all' || selectedCategory === 'Combos & Packs') && (
        <div className="space-y-4 pt-1">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#2F3E3A] text-[#D9E6D3] flex items-center justify-center text-sm font-bold shadow-xs">
                ✦
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#2F3E3A] tracking-tight">
                  Packs & Promos Exclusivas
                </h3>
                <p className="text-xs text-[#6F8A78]">
                  Tratamientos integrales combinados con descuento
                </p>
              </div>
            </div>
            <span className="shrink-0 bg-[#D9E6D3] text-[#2F3E3A] py-2.5 px-3 rounded-[17px] text-[10px] font-bold leading-tight text-center border border-[#D9E6D3]/40 shadow-xs">
              ♢ AHORRO<br />ESPECIAL
            </span>
          </div>

          {/* Pack Cards List */}
          <div className="space-y-4">
            {comboPacks.map((pack) => {
              const savings = pack.originalPrice ? pack.originalPrice - pack.price : 4500;
              const originalPrice = pack.originalPrice || (pack.price + savings);

              return (
                <article
                  key={pack.id}
                  className="card-aesthetic p-5 sm:p-6 transition-all relative hover:border-[#2F3E3A]/40"
                >
                  {/* Pack Meta: Badges + Lightning Bolt */}
                  <div className="flex items-center gap-2 relative pr-12 flex-wrap">
                    <span className="inline-flex items-center rounded-full py-2 px-3 text-[11px] font-bold bg-[#D9E6D3] text-[#2F3E3A]">
                      ★ PACK MÁS ELEGIDO
                    </span>

                    <span className="inline-flex items-center rounded-full py-2 px-3 text-[11px] font-bold bg-[#E8EFE5] text-[#6F8A78]">
                      ◷ {pack.durationMinutes} min
                    </span>

                    <div className="absolute right-0 top-0 w-9 h-9 rounded-full flex items-center justify-center bg-[#fff8ec] text-[#d9a441] text-lg font-bold shadow-xs">
                      ϟ
                    </div>
                  </div>

                  <h2 className="text-[#2F3E3A] mt-4 mb-2 text-xl sm:text-2xl font-bold leading-snug tracking-tight">
                    {pack.title}
                  </h2>

                  <p className="m-0 text-[#6F8A78] text-sm sm:text-base leading-relaxed">
                    {pack.description}
                  </p>

                  {/* Price Row */}
                  <div className="flex items-baseline flex-wrap gap-2.5 mt-4">
                    <strong className="text-[#2F3E3A] text-3xl sm:text-4xl font-bold tracking-tight">
                      {formatPrice(pack.price)}
                    </strong>
                    <del className="text-[#6F8A78] text-sm font-normal">
                      {formatPrice(originalPrice)}
                    </del>
                    <span className="bg-[#D9E6D3] text-[#6F8A78] rounded-full py-1.5 px-3 text-xs font-bold">
                      Ahorrás {formatPrice(savings)}
                    </span>
                  </div>

                  <div className="h-[1px] bg-[#A8BDA3] my-4"></div>

                  {/* Included Items List */}
                  <div className="grid gap-2.5 text-[#35564b] text-xs font-medium">
                    {pack.comboItems && pack.comboItems.length > 0 ? (
                      pack.comboItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className="text-[#4c9c35] font-bold">✓</span>
                          <span>{item}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#4c9c35] font-bold">✓</span>
                          <span>Lifting de Pestañas con Keratina</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#4c9c35] font-bold">✓</span>
                          <span>Laminado & Diseño de Cejas HD</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#4c9c35] font-bold">✓</span>
                          <span>Tinte Henna Orgánica</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Direct Action Button: Go directly to Calendar to pick Day */}
                  <button
                    type="button"
                    onClick={() => onSelectServiceToBook(pack)}
                    className="w-full mt-5 py-4 px-5 rounded-[18px] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(18,60,50,0.18)] hover:-translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer bg-[#2F3E3A] hover:bg-[#6F8A78] text-white"
                  >
                    <span>Reservar este pack (Elegir día)</span>
                    <span className="text-lg">→</span>
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Catalog Section Header & Filter */}
      <div id="catalogo-procedimientos" className="pt-4 px-1 scroll-mt-20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h3 className="text-xl sm:text-2xl font-bold text-[#2F3E3A] tracking-tight">
              Catálogo de Servicios Individuales
            </h3>
            <p className="text-xs text-[#6F8A78]">
              Elegí un servicio para ver y seleccionar el día en el calendario
            </p>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F3E3A] bg-[#D9E6D3] px-3 py-1 rounded-full border border-[#D9E6D3]/50">
            {filteredServices.length} Disponibles
          </span>
        </div>

        {/* Search & Categories */}
        <div className="space-y-2 mt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6F8A78] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar servicio (pestañas, cejas, lifting, combos...)"
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-full bg-white border border-[#A8BDA3] focus:outline-none focus:ring-2 focus:ring-[#2F3E3A] text-[#2F3E3A] placeholder:text-[#6F8A78]/70 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#2F3E3A] text-white shadow-sm'
                    : 'bg-white text-[#6F8A78] hover:bg-[#E8EFE5] border border-[#A8BDA3]'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Service Cards List */}
      <div className="space-y-3.5">
        {filteredServices.map((service) => {
          const depositAmount = Math.round((service.price * service.depositPercentage) / 100);

          return (
            <div
              key={service.id}
              className="card-aesthetic p-5 transition-all relative hover:border-[#2F3E3A]/40"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {service.popular && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D9E6D3] text-[#2F3E3A] text-[11px] font-bold">
                      ★ POPULAR
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8EFE5] text-[#6F8A78] text-[11px] font-medium">
                    <Clock className="w-3 h-3" />
                    {service.durationMinutes} min
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectServiceToBook(service)}
                  aria-label="Reservar servicio"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer bg-[#E8EFE5] text-[#2F3E3A] hover:bg-[#2F3E3A] hover:text-[#D9E6D3]"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-[#2F3E3A]">
                {service.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#6F8A78] mt-1 leading-relaxed">
                {service.description}
              </p>

              <div className="mt-2 text-xs text-[#6F8A78] flex items-center gap-2">
                <span>Seña requerida ({service.depositPercentage}%):</span>
                <span className="font-semibold text-[#2F3E3A]">{formatPrice(depositAmount)}</span>
              </div>

              <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-[#E8EFE5]">
                <div>
                  <span className="text-[10px] text-[#6F8A78] uppercase block font-semibold">
                    Inversión
                  </span>
                  <span className="text-lg sm:text-xl text-[#2F3E3A] font-bold tracking-tight">
                    {formatPrice(service.price)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectServiceToBook(service)}
                  className="px-4 py-2 rounded-full text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer bg-[#2F3E3A] text-white hover:bg-[#6F8A78]"
                >
                  <span>Solicitar turno →</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
