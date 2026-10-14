import React from 'react';
import { Bell, CheckCircle2, Clock, Calendar, Sparkles } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAppointments: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onViewAppointments,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Seña confirmada con éxito',
      desc: 'Tu pago de $4.500 para Lifting de Pestañas fue acreditado vía Mercado Pago.',
      time: 'Hace 10 min',
      icon: CheckCircle2,
      color: 'text-primary bg-primary-container/15',
    },
    {
      id: 'notif-2',
      title: 'Recordatorio de Turno Próximo',
      desc: 'Tenés cita confirmada para el Miércoles 23 a las 11:30 hs con Camila Rossi.',
      time: 'Hace 2 horas',
      icon: Clock,
      color: 'text-amber-600 bg-amber-500/10',
    },
    {
      id: 'notif-3',
      title: 'Ganaste 300 Puntos Aura',
      desc: 'Por completar tu ficha médica y consentimiento informado.',
      time: 'Ayer',
      icon: Sparkles,
      color: 'text-violet-600 bg-violet-500/10',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-aesthetic max-w-sm w-full p-6 text-[#2F3E3A] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#A8BDA3]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#D9E6D3] text-[#2F3E3A] flex items-center justify-center border border-[#D9E6D3]/40">
              <Bell className="w-4 h-4 text-[#2F3E3A]" />
            </div>
            <h3 className="font-bold text-base text-[#2F3E3A]">Notificaciones</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-[#E8EFE5] hover:bg-[#A8BDA3] text-[#6F8A78] flex items-center justify-center font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="py-3 space-y-2.5">
          {notifications.map((n) => {
            const Icon = n.icon;
            return (
              <div key={n.id} className="p-3 rounded-[18px] bg-[#F6F0E6] flex items-start gap-3 border border-[#A8BDA3]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-[#2F3E3A]">{n.title}</h4>
                    <span className="text-[10px] text-[#6F8A78] font-semibold">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-[#6F8A78] mt-0.5 leading-snug">{n.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => {
              onClose();
              onViewAppointments();
            }}
            className="w-full py-3 px-4 rounded-[16px] bg-[#2F3E3A] hover:bg-[#6F8A78] text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Ver Mis Turnos
          </button>
          <button
            onClick={onClose}
            className="text-xs text-[#6F8A78] hover:text-[#2F3E3A] text-center font-semibold cursor-pointer py-1"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
