import React, { useState } from 'react';
import { SavedCard, BillingInfo } from '../types';
import { 
  CreditCard, 
  X, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  RotateCw, 
  Trash2, 
  Check, 
  Plus, 
  Building2, 
  Receipt,
  Sparkles,
  Zap
} from 'lucide-react';

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedCards: SavedCard[];
  onSaveCard: (card: SavedCard) => void;
  onDeleteCard: (id: string) => void;
  onSetDefaultCard: (id: string) => void;
  billingInfo?: BillingInfo;
  onSaveBillingInfo?: (info: BillingInfo) => void;
}

export const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
  isOpen,
  onClose,
  savedCards,
  onSaveCard,
  onDeleteCard,
  onSetDefaultCard,
  billingInfo,
  onSaveBillingInfo,
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'add' | 'billing'>('add');
  
  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('VALENTINA ROSSI');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState<'debito' | 'credito'>('debito');
  const [isDefault, setIsDefault] = useState(true);
  
  // Interactive UI state
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [processingState, setProcessingState] = useState<'idle' | 'processing' | 'success'>('idle');

  // Billing state
  const [invoiceType, setInvoiceType] = useState<'B' | 'A'>(billingInfo?.invoiceType || 'B');
  const [cuit, setCuit] = useState(billingInfo?.cuitCuil || '27-38834190-4');
  const [businessName, setBusinessName] = useState(billingInfo?.businessName || 'Valentina Rossi');

  if (!isOpen) return null;

  // Detect card brand from number
  const detectBrand = (num: string): 'visa' | 'mastercard' | 'amex' | 'cabal' => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'mastercard';
    if (/^3[47]/.test(clean)) return 'amex';
    return 'visa';
  };

  const currentBrand = detectBrand(cardNumber);

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : raw);
  };

  // Format Expiry Date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiryDate(raw);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(raw);
  };

  const handleSaveCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = cardNumber.replace(/\D/g, '');
    if (cleanNumber.length < 15) {
      alert('Ingresá un número de tarjeta válido (16 dígitos).');
      return;
    }
    if (!cardholderName.trim()) {
      alert('Ingresá el nombre del titular como figura en el plástico.');
      return;
    }
    if (expiryDate.length < 5) {
      alert('Ingresá una fecha de vencimiento válida (MM/AA).');
      return;
    }
    if (cvv.length < 3) {
      alert('Ingresá los 3 o 4 dígitos de seguridad (CVV).');
      return;
    }

    setProcessingState('processing');

    setTimeout(() => {
      setProcessingState('success');

      const newCard: SavedCard = {
        id: `card-${Date.now()}`,
        cardNumber: cardNumber,
        last4: cleanNumber.slice(-4),
        cardholderName: cardholderName.trim().toUpperCase(),
        expiryDate: expiryDate,
        brand: currentBrand,
        type: cardType,
        isDefault: isDefault,
      };

      onSaveCard(newCard);

      setTimeout(() => {
        setProcessingState('idle');
        setActiveTab('cards');
      }, 1500);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="card-aesthetic w-full max-w-[440px] p-5 sm:p-6 shadow-2xl relative text-[#18211f] my-auto overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col bg-white">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d8e2de] relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#efffc5] border border-[#d9f56a]/50 flex items-center justify-center text-[#123c32]">
              <CreditCard className="w-4 h-4 text-[#123c32]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#123c32] tracking-tight">
                Métodos de Pago & Facturación
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-[#195344]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="font-semibold">Protegido con Tokenización PCI-DSS</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#edf2ef] hover:bg-[#d8e2de] text-[#66716d] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 rounded-full bg-[#f7faf7] p-1 my-3 border border-[#d8e2de] relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab('add')}
            className={`py-2 px-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'add'
                ? 'bg-[#123c32] text-white shadow-xs'
                : 'text-[#66716d] hover:text-[#123c32]'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#d9f56a]" />
            <span>Cargar</span>
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`py-2 px-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-[#123c32] text-white shadow-xs'
                : 'text-[#66716d] hover:text-[#123c32]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Tarjetas ({savedCards.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-2 px-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-[#123c32] text-white shadow-xs'
                : 'text-[#66716d] hover:text-[#123c32]'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Factura</span>
          </button>
        </div>

        {/* Processing State Overlay */}
        {processingState !== 'idle' && (
          <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            {processingState === 'processing' ? (
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-[#123c32]/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-[#123c32] border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[#123c32]">
                    <Lock className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#123c32] tracking-tight">
                  Tokenizando Tarjeta Segura...
                </h3>
                <p className="text-xs text-[#66716d] mt-1 max-w-xs leading-relaxed">
                  Conectando con la pasarela bancaria. No se realiza ningún cobro en este momento.
                </p>
                <div className="mt-4 px-3 py-1 rounded-full bg-[#efffc5] border border-[#d9f56a]/50 text-[10px] text-[#123c32] font-bold">
                  AES-256 ENCRYPTED · PCI LEVEL 1
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-[#123c32] text-[#d9f56a] flex items-center justify-center mb-4 shadow-lg shadow-[#123c32]/20">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-lg font-bold text-[#123c32] tracking-tight">
                  ¡Tarjeta Vinculada con Éxito!
                </h3>
                <p className="text-xs text-[#66716d] mt-1 max-w-xs leading-relaxed">
                  Tu tarjeta ya quedó guardada de forma segura para confirmar tus próximos turnos y señas en 1 solo clic.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal Content Scroll Area */}
        <div className="overflow-y-auto pr-0.5 space-y-4 relative z-10 flex-1">
          {/* TAB 1: ADD CARD WITH GLASSY PREVIEW */}
          {activeTab === 'add' && (
            <form onSubmit={handleSaveCardSubmit} className="space-y-4">
              {/* Card visual preview */}
              <div className="relative select-none perspective-[1000px]">
                <div 
                  className={`w-full aspect-[1.586/1] rounded-[22px] p-4 sm:p-5 relative overflow-hidden transition-all duration-700 [transform-style:preserve-3d] shadow-[0_16px_36px_rgba(18,60,50,0.25)] border border-[#a8c5b5]/40 text-white ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #123c32 0%, #195344 60%, #0d2a23 100%)',
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent pointer-events-none"></div>

                  {/* FRONT SIDE */}
                  <div className={`w-full h-full flex flex-col justify-between [backface-visibility:hidden] ${isFlipped ? 'invisible' : 'visible'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Metallic Gold EMV Chip */}
                        <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border border-amber-100/60 shadow-inner relative overflow-hidden flex items-center justify-center">
                          <div className="w-full h-[1px] bg-amber-700/40 absolute top-2.5"></div>
                          <div className="w-full h-[1px] bg-amber-700/40 absolute bottom-2.5"></div>
                          <div className="h-full w-[1px] bg-amber-700/40 absolute left-3"></div>
                          <div className="h-full w-[1px] bg-amber-700/40 absolute right-3"></div>
                        </div>

                        <span className="material-symbols-outlined text-[18px] rotate-90 text-white/80">wifi</span>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-mono tracking-widest text-[#d9f56a] font-bold uppercase drop-shadow">
                          {cardType === 'debito' ? 'STUDIO DÉBITO' : 'PLATINUM VIP'}
                        </span>
                        <span className="text-[9px] text-white/60 tracking-wider">AURA CARD</span>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="my-2">
                      <p className="font-mono text-base sm:text-lg tracking-[0.2em] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </p>
                    </div>

                    {/* Bottom: Cardholder Name + Expires + Brand */}
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[8px] font-mono text-white/60 uppercase tracking-widest">
                          Titular
                        </span>
                        <span className="text-xs font-mono font-bold text-white tracking-wider truncate uppercase">
                          {cardholderName || 'VALENTINA ROSSI'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex flex-col items-start">
                          <span className="text-[8px] font-mono text-white/60 uppercase tracking-widest">
                            Vence
                          </span>
                          <span className="text-xs font-mono font-bold text-white tracking-wider">
                            {expiryDate || 'MM/AA'}
                          </span>
                        </div>

                        <div className="font-black text-xs tracking-wider uppercase bg-white/15 px-2 py-0.5 rounded text-white border border-white/20 shadow-xs">
                          {currentBrand.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className={`absolute inset-0 p-4 sm:p-5 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] ${isFlipped ? 'visible' : 'invisible'}`}>
                    <div className="-mx-4 sm:-mx-5 mt-1 h-9 bg-black/80 border-y border-white/10 shadow-inner"></div>

                    <div className="my-auto">
                      <div className="flex items-center justify-between text-[8px] text-white/70 uppercase tracking-wider mb-1">
                        <span>Firma Autorizada</span>
                        <span>CVV / CVC</span>
                      </div>
                      <div className="flex items-center">
                        <div className="flex-1 h-7 bg-white/20 rounded-l flex items-center px-2">
                          <span className="font-serif italic text-white/60 text-[10px] tracking-widest">
                            Aura Studio Security
                          </span>
                        </div>
                        <div className="w-14 h-7 bg-white text-[#123c32] font-mono font-bold text-xs flex items-center justify-center rounded-r tracking-widest">
                          {showCvv ? cvv || '•••' : (cvv ? '•••' : '•••')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[8px] text-white/50 font-mono">
                      <span>256-BIT ENCRYPTION</span>
                      <span>ELECTRONIC USE ONLY</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="mt-2.5 mx-auto flex items-center justify-center gap-1.5 text-xs text-[#123c32] hover:text-[#195344] font-bold py-1 px-3.5 rounded-full bg-[#edf2ef] hover:bg-[#d8e2de] transition-all cursor-pointer active:scale-95"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlipped ? 'Voltear al frente' : 'Girar para ver reverso (CVV)'}</span>
                </button>
              </div>

              {/* CARD FORM INPUTS */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-[#66716d] mb-1">
                    Nombre del Titular *
                  </label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
                    placeholder="Como figura en la tarjeta"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-xs sm:text-sm text-[#18211f] font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#66716d] mb-1">
                    Número de Tarjeta *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="5645 6456 5465 3434"
                      maxLength={19}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-xs sm:text-sm text-[#18211f] font-mono tracking-wider"
                      required
                    />
                    <div className="absolute right-3 top-2.5 text-[10px] font-bold uppercase text-[#123c32] bg-[#efffc5] px-2 py-0.5 rounded-full border border-[#d9f56a]/40">
                      {currentBrand}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#66716d] mb-1">
                      Vencimiento *
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-xs sm:text-sm text-[#18211f] font-mono tracking-wider"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#66716d] mb-1">
                      CVV / CVC *
                    </label>
                    <div className="relative">
                      <input
                        type={showCvv ? 'text' : 'password'}
                        value={cvv}
                        onChange={handleCvvChange}
                        onFocus={() => setIsFlipped(true)}
                        onBlur={() => setIsFlipped(false)}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-4 py-2.5 pr-8 rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-xs sm:text-sm text-[#18211f] font-mono tracking-widest"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCvv(!showCvv)}
                        className="absolute right-3 top-3 text-[#66716d] hover:text-[#123c32]"
                      >
                        {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCardType('debito')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      cardType === 'debito'
                        ? 'bg-[#123c32] text-white border-[#123c32]'
                        : 'bg-[#f7faf7] border-[#d8e2de] text-[#66716d] hover:text-[#123c32]'
                    }`}
                  >
                    Tarjeta Débito
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardType('credito')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      cardType === 'credito'
                        ? 'bg-[#123c32] text-white border-[#123c32]'
                        : 'bg-[#f7faf7] border-[#d8e2de] text-[#66716d] hover:text-[#123c32]'
                    }`}
                  >
                    Tarjeta Crédito
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs text-[#66716d] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-[#123c32] focus:ring-[#123c32] accent-[#123c32]"
                  />
                  <span>Establecer como tarjeta principal para reservas y señas</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-4 px-5 rounded-[18px] bg-[#123c32] hover:bg-[#195344] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-[0_10px_24px_rgba(18,60,50,0.18)] transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#d9f56a]" />
                  <span>Vincular y Guardar Tarjeta Segura</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SAVED CARDS LIST */}
          {activeTab === 'cards' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#66716d] px-1">
                <span>Tarjetas asociadas a tu cuenta</span>
                <button
                  onClick={() => setActiveTab('add')}
                  className="text-[#123c32] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar otra</span>
                </button>
              </div>

              {savedCards.length === 0 ? (
                <div className="p-8 text-center bg-[#f7faf7] rounded-[22px] border border-[#d8e2de]">
                  <CreditCard className="w-10 h-10 text-[#66716d]/40 mx-auto mb-2" />
                  <p className="text-xs text-[#66716d]">No tenés tarjetas guardadas aún.</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-3 px-4 py-2 rounded-full bg-[#123c32] text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Cargar Primera Tarjeta
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      className={`p-4 rounded-[20px] border transition-all flex items-center justify-between gap-3 ${
                        card.isDefault
                          ? 'bg-[#efffc5]/30 border-[#123c32] shadow-xs'
                          : 'bg-[#f7faf7] border-[#d8e2de]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#123c32] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <CreditCard className="w-5 h-5 text-[#d9f56a]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#18211f] uppercase">
                              {card.brand} · {card.type === 'debito' ? 'Débito' : 'Crédito'}
                            </span>
                            {card.isDefault && (
                              <span className="px-2 py-0.5 rounded-full bg-[#123c32] text-white font-bold text-[9px] uppercase">
                                Principal
                              </span>
                            )}
                          </div>
                          <p className="font-mono text-xs text-[#18211f] font-semibold mt-0.5">
                            •••• •••• •••• {card.last4}
                          </p>
                          <p className="text-[10px] text-[#66716d]">
                            Vence {card.expiryDate} · {card.cardholderName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!card.isDefault && (
                          <button
                            onClick={() => onSetDefaultCard(card.id)}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-[#edf2ef] hover:bg-[#d8e2de] text-[#123c32] font-semibold transition-colors cursor-pointer"
                            title="Usar como predeterminada"
                          >
                            Hacer Principal
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('¿Eliminar esta tarjeta guardada?')) {
                              onDeleteCard(card.id);
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-[#66716d] hover:text-red-600 border border-[#d8e2de] flex items-center justify-center transition-colors cursor-pointer"
                          title="Eliminar tarjeta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Mercado Pago vinculation notice */}
              <div className="mt-4 p-3.5 rounded-[18px] bg-[#f7faf7] border border-[#d8e2de] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#009ee3] flex items-center justify-center text-white font-bold text-xs">
                    MP
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#18211f]">Mercado Pago</p>
                    <p className="text-[10px] text-[#66716d]">Cuenta vinculada para débitos automáticos</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#efffc5] text-[#123c32] font-bold text-[10px] border border-[#d9f56a]/40">
                  Activo
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: BILLING & FISCAL DATA */}
          {activeTab === 'billing' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-[18px] bg-[#f7faf7] border border-[#d8e2de]">
                <span className="text-[11px] font-bold text-[#123c32] uppercase tracking-wider block mb-2">
                  Tipo de Comprobante
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInvoiceType('B')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                      invoiceType === 'B'
                        ? 'bg-[#123c32] text-white border-[#123c32]'
                        : 'bg-white border-[#d8e2de] text-[#66716d]'
                    }`}
                  >
                    <p className="font-bold">Factura B</p>
                    <p className="text-[10px] opacity-80">Consumidor Final</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInvoiceType('A')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                      invoiceType === 'A'
                        ? 'bg-[#123c32] text-white border-[#123c32]'
                        : 'bg-white border-[#d8e2de] text-[#66716d]'
                    }`}
                  >
                    <p className="font-bold">Factura A</p>
                    <p className="text-[10px] opacity-80">Responsable Inscripto</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#66716d] mb-1">
                  {invoiceType === 'A' ? 'CUIT de la Empresa *' : 'DNI / CUIL *'}
                </label>
                <input
                  type="text"
                  value={cuit}
                  onChange={(e) => setCuit(e.target.value)}
                  placeholder="20-12345678-9"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-xs font-mono text-[#18211f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#66716d] mb-1">
                  {invoiceType === 'A' ? 'Razón Social *' : 'Nombre o Razón Social'}
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej. Valentina Rossi"
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-xs text-[#18211f]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onSaveBillingInfo) {
                    onSaveBillingInfo({
                      invoiceType,
                      cuitCuil: cuit,
                      businessName,
                    });
                  }
                  alert('Datos fiscales actualizados correctamente.');
                  onClose();
                }}
                className="w-full py-4 px-5 rounded-[18px] bg-[#123c32] hover:bg-[#195344] text-white font-bold text-xs sm:text-sm shadow-[0_10px_24px_rgba(18,60,50,0.18)] transition-all cursor-pointer mt-3"
              >
                Guardar Datos de Facturación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
