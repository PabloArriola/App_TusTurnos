import React, { useState } from 'react';
import { ClientProfile } from '../types';
import { Gift, Sparkles, Check, Copy } from 'lucide-react';

interface LoyaltyModalProps {
  clientProfile: ClientProfile;
  isOpen: boolean;
  onClose: () => void;
  onApplyDiscount: (discountAmount: number, code: string) => void;
}

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({
  clientProfile,
  isOpen,
  onClose,
  onApplyDiscount,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const coupons = [
    {
      code: 'AURA5000',
      title: '$5.000 OFF en Seña',
      description: 'Canjeable por 500 Puntos Aura en cualquier servicio',
      costPoints: 500,
      discountVal: 5000,
    },
    {
      code: 'VIPGLOW10',
      title: '$10.000 OFF en Tratamientos VIP',
      description: 'Canjeable por 1.000 Puntos en servicios mayores a $30.000',
      costPoints: 1000,
      discountVal: 1000,
    },
    {
      code: 'FREEKERATINA',
      title: 'Nutrición Keratina de Regalo',
      description: 'Agregá nutrición botox gratis a tu turno',
      costPoints: 300,
      discountVal: 3500,
    },
  ];

  const handleRedeem = (coupon: typeof coupons[0]) => {
    if (clientProfile.loyaltyPoints < coupon.costPoints) {
      alert('No tenés suficientes puntos para canjear este cupón.');
      return;
    }
    setCopiedCode(coupon.code);
    onApplyDiscount(coupon.discountVal, coupon.code);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-aesthetic max-w-sm w-full p-6 text-[#18211f] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#d8e2de]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#efffc5] text-[#123c32] flex items-center justify-center border border-[#d9f56a]/40">
              <Gift className="w-4 h-4 text-[#123c32]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#123c32]">Puntos & Fidelidad</h3>
              <p className="text-[11px] text-[#66716d]">Programa de Recompensas Exclusivo</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-[#edf2ef] hover:bg-[#d8e2de] text-[#66716d] flex items-center justify-center font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="py-4 space-y-3.5">
          <div className="p-4 rounded-[22px] bg-[#f7faf7] border border-[#d8e2de] text-center">
            <span className="text-[11px] font-bold text-[#66716d] uppercase tracking-wider block">
              Tu Saldo Acumulado
            </span>
            <span className="text-3xl font-extrabold text-[#123c32] block mt-1 tracking-tight">
              {clientProfile.loyaltyPoints} <span className="text-sm font-semibold">PTS</span>
            </span>
            <p className="text-xs text-[#66716d] mt-1 font-medium">
              Equivalente a <strong className="text-[#195344]">$15.000</strong> de ahorro directo en citas.
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <span className="font-bold text-[#123c32] block uppercase tracking-wider text-[10px]">
              Cupones Disponibles:
            </span>

            {coupons.map((coupon) => (
              <div
                key={coupon.code}
                className="p-3.5 rounded-[18px] bg-[#f7faf7] border border-[#d8e2de] flex items-center justify-between gap-2.5"
              >
                <div>
                  <h4 className="font-bold text-[#123c32] text-xs">{coupon.title}</h4>
                  <p className="text-[11px] text-[#66716d]">{coupon.description}</p>
                  <span className="inline-block mt-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#efffc5] text-[#123c32] border border-[#d9f56a]/30">
                    {coupon.costPoints} pts
                  </span>
                </div>

                <button
                  onClick={() => handleRedeem(coupon)}
                  className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all shrink-0 active:scale-95 cursor-pointer ${
                    copiedCode === coupon.code
                      ? 'bg-[#195344] text-white'
                      : 'bg-[#123c32] hover:bg-[#195344] text-white shadow-xs'
                  }`}
                >
                  {copiedCode === coupon.code ? '✓ Canjeado' : 'Canjear'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs text-[#66716d] hover:text-[#123c32] font-semibold cursor-pointer py-1"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};
