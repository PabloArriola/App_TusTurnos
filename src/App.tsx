/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_BUSINESSES, 
  INITIAL_CLIENT_PROFILE, 
  INITIAL_APPOINTMENTS,
  INITIAL_PAYMENT_TRANSACTIONS
} from './data/mockData';
import { Business, Service, Specialist, Appointment, ClientProfile, SavedCard, BillingInfo, PaymentTransaction, BookedServiceItem } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ServicesView } from './components/ServicesView';
import { CalendarBookingView } from './components/CalendarBookingView';
import { CheckoutView } from './components/CheckoutView';
import { AppointmentsView } from './components/AppointmentsView';
import { ProfileView } from './components/ProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { MedicalConsentModal } from './components/MedicalConsentModal';
import { LoyaltyModal } from './components/LoyaltyModal';
import { NotificationsModal } from './components/NotificationsModal';
import { PaymentMethodsModal } from './components/PaymentMethodsModal';

export default function App() {
  // Persistence with localStorage
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem('aura_businesses');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESSES;
  });

  const [currentBusiness, setCurrentBusiness] = useState<Business>(() => {
    const saved = localStorage.getItem('aura_current_business');
    return saved ? JSON.parse(saved) : (businesses[0] || INITIAL_BUSINESSES[0]);
  });

  const [clientProfile, setClientProfile] = useState<ClientProfile>(() => {
    const saved = localStorage.getItem('aura_client_profile');
    return saved ? JSON.parse(saved) : INITIAL_CLIENT_PROFILE;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('aura_is_logged_in') !== 'false';
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('aura_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem('aura_transactions');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_TRANSACTIONS;
  });

  // Navigation and view modes
  const [activeTab, setActiveTab] = useState<string>('servicios');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // Booking process flow state (one service at a time)
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist>(() => {
    return currentBusiness.specialists[0];
  });

  const [bookedItems, setBookedItems] = useState<BookedServiceItem[]>([]);
  const [currentServiceToBook, setCurrentServiceToBook] = useState<Service | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);

  const [checkoutData, setCheckoutData] = useState<{
    services: Service[];
    specialist: Specialist;
    date: string;
    formattedDate: string;
    time: string;
    endTime: string;
    reschedulingAppointment?: Appointment | null;
  } | null>(null);

  // Modals state
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Auto-dismiss toast notice after 4s
  useEffect(() => {
    if (toastNotice) {
      const timer = setTimeout(() => setToastNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotice]);

  // Update specialist whenever currentBusiness changes
  useEffect(() => {
    if (currentBusiness && currentBusiness.specialists.length > 0) {
      setSelectedSpecialist(currentBusiness.specialists[0]);
    }
  }, [currentBusiness]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('aura_current_business', JSON.stringify(currentBusiness));
  }, [currentBusiness]);

  useEffect(() => {
    localStorage.setItem('aura_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('aura_client_profile', JSON.stringify(clientProfile));
  }, [clientProfile]);

  useEffect(() => {
    localStorage.setItem('aura_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleUpdateServices = (updatedServices: Service[]) => {
    setCurrentBusiness((prev) => ({
      ...prev,
      services: updatedServices,
    }));
    setToastNotice('Catálogo de servicios y señas actualizado con éxito.');
  };

  const handleUpdateBusiness = (updatedFields: Partial<Business>) => {
    setCurrentBusiness((prev) => ({
      ...prev,
      ...updatedFields,
    }));
    setToastNotice('Configuración del estudio guardada con éxito.');
  };

  // Handlers
  const handleSelectBusiness = (b: Business) => {
    setCurrentBusiness(b);
    setSelectedSpecialist(b.specialists[0]);
    setSelectedServices([]);
    setBookedItems([]);
    setCurrentServiceToBook(null);
    setReschedulingAppointment(null);
    setCheckoutData(null);
    setActiveTab('servicios');
  };

  const handleToggleService = (service: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  // 1-service-at-a-time handlers
  const handleSelectServiceToBook = (service: Service) => {
    setCurrentServiceToBook(service);
    setSelectedServices([service]);
    setReschedulingAppointment(null);
    setActiveTab('reservar-cita');
  };

  const handleAddAnotherService = (bookedItem: BookedServiceItem) => {
    setBookedItems((prev) => [...prev, bookedItem]);
    setCurrentServiceToBook(null);
    setSelectedServices([]);
    setActiveTab('servicios');
    setToastNotice(`¡Turno guardado para ${bookedItem.service.title}! Elegí el próximo servicio que querés sumar.`);
  };

  const handleProceedToCheckoutFromCalendar = (bookedItem: BookedServiceItem) => {
    const allItems = [...bookedItems, bookedItem];
    setBookedItems(allItems);
    setCheckoutData({
      services: allItems.map((item) => item.service),
      specialist: bookedItem.specialist,
      date: bookedItem.date,
      formattedDate: bookedItem.formattedDate,
      time: bookedItem.time,
      endTime: bookedItem.endTime,
      reschedulingAppointment: reschedulingAppointment,
    });
    setActiveTab('confirmar-reserva');
  };

  const handleProceedToCheckoutWithBookedItems = () => {
    if (bookedItems.length === 0) return;
    const lastItem = bookedItems[bookedItems.length - 1];
    setCheckoutData({
      services: bookedItems.map((item) => item.service),
      specialist: lastItem.specialist,
      date: lastItem.date,
      formattedDate: lastItem.formattedDate,
      time: lastItem.time,
      endTime: lastItem.endTime,
      reschedulingAppointment: null,
    });
    setActiveTab('confirmar-reserva');
  };

  const handleRemoveBookedItem = (id: string) => {
    setBookedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleProceedToCalendar = (services: Service[]) => {
    setSelectedServices(services);
    if (services.length > 0) {
      setCurrentServiceToBook(services[0]);
    }
    setReschedulingAppointment(null);
    setActiveTab('reservar-cita');
  };

  const handleProceedToCheckout = (bookingDetails: {
    services: Service[];
    specialist: Specialist;
    date: string;
    formattedDate: string;
    time: string;
    endTime: string;
    reschedulingAppointment?: Appointment | null;
  }) => {
    setCheckoutData(bookingDetails);
    setActiveTab('confirmar-reserva');
  };

  const handleBookingSuccess = (newAppt: Appointment, allAppts?: Appointment[]) => {
    if (reschedulingAppointment) {
      // Update existing appointment in place without duplicating or recharging deposit
      setAppointments((prev) =>
        prev.map((a) => (a.id === reschedulingAppointment.id ? newAppt : a))
      );
      setReschedulingAppointment(null);
    } else if (allAppts && allAppts.length > 0) {
      setAppointments((prev) => [...allAppts, ...prev]);

      // Automatically generate official receipts for each booking deposit
      const newTxns: PaymentTransaction[] = allAppts.map((appt) => ({
        id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        appointmentId: appt.id,
        concept: `Seña ${currentBusiness.defaultDepositPercentage || 30}% · ${appt.serviceTitle}`,
        serviceTitle: appt.serviceTitle,
        amount: appt.depositPaid,
        totalServicePrice: appt.totalPrice,
        remainingBalance: appt.remainingBalance,
        date: appt.date,
        time: appt.time,
        paymentMethod: appt.paymentMethod === 'mercadopago' ? 'Mercado Pago (Dinero en cuenta)' : 'Tarjeta Débito/Crédito',
        status: 'aprobado',
        mpOperationNumber: String(Math.floor(8000000000 + Math.random() * 1999999999)),
        businessName: currentBusiness.name,
        businessAddress: currentBusiness.address,
        businessCuit: '30-71649201-9',
        clientName: appt.clientName || clientProfile.name,
        clientEmail: appt.clientEmail || clientProfile.email,
        clientDni: clientProfile.billingInfo?.cuitCuil || '27-38834190-4',
      }));
      setTransactions((prev) => [...newTxns, ...prev]);

      // Reward points for bookings
      setClientProfile((prev) => ({
        ...prev,
        loyaltyPoints: prev.loyaltyPoints + 150 * allAppts.length,
        loyaltyCashBalance: prev.loyaltyCashBalance + 1500 * allAppts.length,
      }));
    } else {
      setAppointments((prev) => [newAppt, ...prev]);

      // Automatically generate a new official receipt for this booking deposit
      const newTxn: PaymentTransaction = {
        id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        appointmentId: newAppt.id,
        concept: `Seña ${currentBusiness.defaultDepositPercentage || 30}% · ${newAppt.serviceTitle}`,
        serviceTitle: newAppt.serviceTitle,
        amount: newAppt.depositPaid,
        totalServicePrice: newAppt.totalPrice,
        remainingBalance: newAppt.remainingBalance,
        date: newAppt.date,
        time: newAppt.time,
        paymentMethod: newAppt.paymentMethod === 'mercadopago' ? 'Mercado Pago (Dinero en cuenta)' : 'Tarjeta Débito/Crédito',
        status: 'aprobado',
        mpOperationNumber: String(Math.floor(8000000000 + Math.random() * 1999999999)),
        businessName: currentBusiness.name,
        businessAddress: currentBusiness.address,
        businessCuit: '30-71649201-9',
        clientName: newAppt.clientName || clientProfile.name,
        clientEmail: newAppt.clientEmail || clientProfile.email,
        clientDni: clientProfile.billingInfo?.cuitCuil || '27-38834190-4',
      };
      setTransactions((prev) => [newTxn, ...prev]);

      // Reward points for booking
      setClientProfile((prev) => ({
        ...prev,
        loyaltyPoints: prev.loyaltyPoints + 150,
        loyaltyCashBalance: prev.loyaltyCashBalance + 1500,
      }));
    }

    // Reset flow items
    setBookedItems([]);
    setCurrentServiceToBook(null);
    setSelectedServices([]);
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelado' } : a))
    );
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    setToastNotice('Registro eliminado de tu historial con éxito.');
  };

  const handleUpdateAppointmentStatus = (id: string, newStatus: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const handleAddManualAppointment = (newAppt: Appointment) => {
    setAppointments((prev) => [newAppt, ...prev]);
  };

  const handleApplyDiscount = (amount: number, code: string) => {
    setClientProfile((prev) => ({
      ...prev,
      loyaltyPoints: Math.max(0, prev.loyaltyPoints - 500),
    }));
  };

  const handleSaveMedicalSheet = (updated: ClientProfile) => {
    setClientProfile(updated);
  };

  const handleSaveCard = (card: SavedCard) => {
    setClientProfile((prev) => {
      const existing = prev.savedCards || [];
      const updated = card.isDefault
        ? existing.map((c) => ({ ...c, isDefault: false }))
        : existing;
      return {
        ...prev,
        savedCards: [card, ...updated],
      };
    });
    setToastNotice(`Tarjeta ${card.brand.toUpperCase()} **** ${card.last4} guardada con éxito.`);
  };

  const handleDeleteCard = (id: string) => {
    setClientProfile((prev) => ({
      ...prev,
      savedCards: (prev.savedCards || []).filter((c) => c.id !== id),
    }));
    setToastNotice('Tarjeta eliminada.');
  };

  const handleSetDefaultCard = (id: string) => {
    setClientProfile((prev) => ({
      ...prev,
      savedCards: (prev.savedCards || []).map((c) => ({ ...c, isDefault: c.id === id })),
    }));
    setToastNotice('Tarjeta establecida como principal.');
  };

  const handleSaveBillingInfo = (info: BillingInfo) => {
    setClientProfile((prev) => ({
      ...prev,
      billingInfo: info,
    }));
    setToastNotice('Datos de facturación actualizados.');
  };

  const handleUpdateProfile = (updated: Partial<ClientProfile>) => {
    setClientProfile((prev) => ({
      ...prev,
      ...updated,
    }));
    setToastNotice('Perfil y foto actualizados con éxito.');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('aura_is_logged_in', 'false');
    setToastNotice('Sesión cerrada correctamente.');
  };

  const handleLogin = (userData?: Partial<ClientProfile>) => {
    setIsLoggedIn(true);
    localStorage.setItem('aura_is_logged_in', 'true');
    if (userData) {
      setClientProfile((prev) => ({ ...prev, ...userData }));
    }
    setToastNotice('¡Bienvenida a tu cuenta!');
  };

  return (
    <div className={`min-h-screen bg-[#e9eeeb] text-[#18211f] flex flex-col items-center antialiased selection:bg-[#d9f56a] selection:text-[#123c32] ${
      isMobileFrame ? 'h-screen overflow-hidden justify-center p-2 sm:p-4' : 'justify-start'
    }`}>
      {/* Container wrapper: mobile-first boutique aesthetic (min(100%, 520px) matching user code) */}
      <div 
        className={`w-full ${
          isMobileFrame 
            ? 'max-w-[480px] h-full max-h-[880px] rounded-[44px] shadow-2xl ring-8 ring-slate-800 overflow-hidden app-canvas flex flex-col relative' 
            : isAdminMode
              ? 'max-w-7xl bg-[#f7faf7] min-h-screen flex flex-col relative'
              : 'max-w-[520px] app-canvas min-h-screen flex flex-col relative shadow-[0_16px_40px_rgba(18,60,50,0.08)]'
        }`}
      >
        {/* Sticky App Header */}
        <Header
          currentBusiness={currentBusiness}
          allBusinesses={businesses}
          onSelectBusiness={handleSelectBusiness}
          activeTab={activeTab}
          clientProfile={clientProfile}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          isAdminMode={isAdminMode}
          onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
          onOpenNotifications={() => setShowNotificationsModal(true)}
          onNavigateToTab={(tab) => {
            setIsAdminMode(false);
            setActiveTab(tab);
          }}
          onUpdateBusiness={handleUpdateBusiness}
        />

        {/* Toast Alert Notice (Fidelity to user CSS .toast) */}
        {toastNotice && (
          <div className={`${isMobileFrame ? 'absolute' : 'fixed'} z-50 left-1/2 bottom-[104px] -translate-x-1/2 w-[calc(100%-40px)] max-w-[440px] py-3.5 px-4 rounded-[15px] bg-[#123c32] text-white text-center text-xs sm:text-[13px] font-semibold shadow-[0_12px_30px_rgba(18,60,50,0.22)] flex items-center justify-between animate-in fade-in slide-in-from-bottom-3 duration-200`}>
            <div className="flex items-center gap-2 text-left">
              <span className="text-[#d9f56a] font-bold text-sm">✓</span>
              <span>{toastNotice}</span>
            </div>
            <button 
              onClick={() => setToastNotice(null)} 
              className="text-white/70 hover:text-white font-bold ml-2 text-sm cursor-pointer"
              aria-label="Cerrar aviso"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main View Area */}
        <main className={`flex-1 w-full pt-4 pb-32 ${
          isMobileFrame ? 'overflow-y-auto overflow-x-hidden relative overscroll-contain' : ''
        }`}>
          {isAdminMode ? (
            /* Business Owner / Salon Admin View */
            <AdminDashboard
              business={currentBusiness}
              appointments={appointments}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onAddManualAppointment={handleAddManualAppointment}
              onUpdateServices={handleUpdateServices}
              onUpdateBusiness={handleUpdateBusiness}
              onOpenBusinessSettings={() => alert('Configuración de negocio')}
              onSwitchToClientMode={() => setIsAdminMode(false)}
            />
          ) : (
            /* Client Experience Flow */
            <>
              {activeTab === 'servicios' && (
                <ServicesView
                  business={currentBusiness}
                  selectedSpecialist={selectedSpecialist}
                  onSelectSpecialist={setSelectedSpecialist}
                  onSelectServiceToBook={handleSelectServiceToBook}
                  bookedItems={bookedItems}
                  onProceedToCheckoutWithBookedItems={handleProceedToCheckoutWithBookedItems}
                  onRemoveBookedItem={handleRemoveBookedItem}
                  selectedServices={selectedServices}
                  onToggleService={handleToggleService}
                  onClearServices={() => setSelectedServices([])}
                  onProceedToCalendar={handleProceedToCalendar}
                />
              )}

              {activeTab === 'reservar-cita' && (
                <CalendarBookingView
                  business={currentBusiness}
                  selectedService={currentServiceToBook || (selectedServices.length > 0 ? selectedServices[0] : currentBusiness.services[0])}
                  selectedServices={selectedServices}
                  selectedSpecialist={selectedSpecialist}
                  reschedulingAppointment={reschedulingAppointment}
                  bookedItems={bookedItems}
                  onBackToServices={() => setActiveTab('servicios')}
                  onAddAnotherService={handleAddAnotherService}
                  onProceedToCheckout={handleProceedToCheckoutFromCalendar}
                />
              )}

              {activeTab === 'confirmar-reserva' && checkoutData && (
                <CheckoutView
                  business={currentBusiness}
                  services={checkoutData.services}
                  specialist={checkoutData.specialist}
                  dateStr={checkoutData.date}
                  formattedDate={checkoutData.formattedDate}
                  time={checkoutData.time}
                  endTime={checkoutData.endTime}
                  reschedulingAppointment={checkoutData.reschedulingAppointment}
                  clientProfile={clientProfile}
                  bookedItems={bookedItems}
                  onBack={() => {
                    if (bookedItems.length > 0) {
                      setActiveTab('servicios');
                    } else {
                      setActiveTab('reservar-cita');
                    }
                  }}
                  onBookingSuccess={handleBookingSuccess}
                  onViewAppointments={() => setActiveTab('mis-turnos')}
                />
              )}

              {activeTab === 'mis-turnos' && (
                <AppointmentsView
                  appointments={appointments}
                  businesses={businesses}
                  onCancelAppointment={handleCancelAppointment}
                  onDeleteAppointment={handleDeleteAppointment}
                  onRescheduleAppointment={(appt) => {
                    const foundBiz = businesses.find((b) => b.id === appt.businessId) || currentBusiness;
                    setCurrentBusiness(foundBiz);
                    const foundSpecialist = foundBiz.specialists.find((s) => s.id === appt.specialistId) || foundBiz.specialists[0];
                    setSelectedSpecialist(foundSpecialist);
                    const foundService = foundBiz.services.find((s) => s.id === appt.serviceId) || foundBiz.services[0];
                    setSelectedServices([foundService]);
                    setReschedulingAppointment(appt);
                    setActiveTab('reservar-cita');
                  }}
                  onNewBookingClick={() => {
                    setReschedulingAppointment(null);
                    setActiveTab('servicios');
                  }}
                />
              )}

              {activeTab === 'perfil-clinico' && (
                <ProfileView
                  clientProfile={clientProfile}
                  appointments={appointments}
                  currentBusiness={currentBusiness}
                  transactions={transactions}
                  isLoggedIn={isLoggedIn}
                  onNavigateToTab={setActiveTab}
                  onOpenMedicalSheet={() => setShowMedicalModal(true)}
                  onOpenLoyaltyModal={() => setShowLoyaltyModal(true)}
                  onOpenPaymentMethodsModal={() => setShowPaymentMethodsModal(true)}
                  onUpdateProfile={handleUpdateProfile}
                  onLogout={handleLogout}
                  onLogin={handleLogin}
                />
              )}
            </>
          )}
        </main>

        {/* Floating Capsule Bottom Nav for mobile frame */}
        {!isAdminMode && isMobileFrame && (
          <BottomNav
            activeTab={activeTab}
            isMobileFrame={true}
            hasSelectedService={Boolean(currentServiceToBook || bookedItems.length > 0 || selectedServices.length > 0)}
            onAttemptCalendarWithoutService={() => {
              setToastNotice('Elegí un servicio o pack del catálogo para elegir el día en el calendario.');
              setActiveTab('servicios');
              const el = document.getElementById('catalogo-procedimientos');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            onTabChange={(tab) => {
              if (tab === 'reservar-cita') {
                if (bookedItems.length > 0 && !currentServiceToBook) {
                  handleProceedToCheckoutWithBookedItems();
                  return;
                }
              }
              setActiveTab(tab);
            }}
            pendingCount={appointments.filter((a) => a.status === 'confirmado').length}
          />
        )}
      </div>

      {/* Floating Capsule Bottom Nav for fullscreen / standard mode (outside container so fixed is 100% attached to viewport) */}
      {!isAdminMode && !isMobileFrame && (
        <BottomNav
          activeTab={activeTab}
          isMobileFrame={false}
          hasSelectedService={Boolean(currentServiceToBook || bookedItems.length > 0 || selectedServices.length > 0)}
          onAttemptCalendarWithoutService={() => {
            setToastNotice('Elegí un servicio o pack del catálogo para elegir el día en el calendario.');
            setActiveTab('servicios');
            const el = document.getElementById('catalogo-procedimientos');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onTabChange={(tab) => {
            if (tab === 'reservar-cita') {
              if (bookedItems.length > 0 && !currentServiceToBook) {
                handleProceedToCheckoutWithBookedItems();
                return;
              }
            }
            setActiveTab(tab);
          }}
          pendingCount={appointments.filter((a) => a.status === 'confirmado').length}
        />
      )}

      {/* Global Modals */}
      <MedicalConsentModal
        clientProfile={clientProfile}
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
        onSave={handleSaveMedicalSheet}
      />

      <LoyaltyModal
        clientProfile={clientProfile}
        isOpen={showLoyaltyModal}
        onClose={() => setShowLoyaltyModal(false)}
        onApplyDiscount={handleApplyDiscount}
      />

      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onViewAppointments={() => {
          setIsAdminMode(false);
          setActiveTab('mis-turnos');
        }}
      />

      <PaymentMethodsModal
        isOpen={showPaymentMethodsModal}
        onClose={() => setShowPaymentMethodsModal(false)}
        savedCards={clientProfile.savedCards || []}
        onSaveCard={handleSaveCard}
        onDeleteCard={handleDeleteCard}
        onSetDefaultCard={handleSetDefaultCard}
        billingInfo={clientProfile.billingInfo}
        onSaveBillingInfo={handleSaveBillingInfo}
      />
    </div>
  );
}
