import React, { useState } from 'react';
import { PaymentTransaction } from '../types';
import { 
  Download, 
  Printer, 
  Share2, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Receipt,
  Sparkles,
  Check
} from 'lucide-react';

interface ReceiptModalProps {
  transaction: PaymentTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  businessPhone?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
  businessPhone,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen || !transaction) return null;

  const formatPrice = (val?: number) => {
    if (val === undefined || val === null) return '$ 0';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Render receipt to high-res canvas and download as PNG
  const handleDownloadImage = () => {
    setDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 2x scale for crisp retina image
      const scale = 2;
      const width = 420;
      const height = 580;
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.roundRect ? ctx.roundRect(0, 0, width, height, 16) : ctx.fillRect(0, 0, width, height);
      ctx.fill();

      // Top Header Gradient Banner
      const grad = ctx.createLinearGradient(0, 0, width, 120);
      grad.addColorStop(0, '#062217');
      grad.addColorStop(1, '#132e22');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, 110);

      // Header Brand text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(transaction.businessName, width / 2, 40);

      ctx.fillStyle = '#d0ef68';
      ctx.font = '700 11px Inter, system-ui, sans-serif';
      ctx.fillText('COMPROBANTE OFICIAL DE RESERVA', width / 2, 60);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '400 10px Inter, system-ui, sans-serif';
      ctx.fillText(transaction.businessAddress, width / 2, 80);
      if (transaction.businessCuit) {
        ctx.fillText(`CUIT: ${transaction.businessCuit}`, width / 2, 95);
      }

      // Status pill
      ctx.fillStyle = '#f0f8e2';
      const pillW = 200;
      const pillH = 28;
      const pillX = (width - pillW) / 2;
      const pillY = 125;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(pillX, pillY, pillW, pillH, 14);
        ctx.fill();
      } else {
        ctx.fillRect(pillX, pillY, pillW, pillH);
      }

      ctx.fillStyle = '#171e00';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText('✓ PAGO ACREDITADO (MERCADO PAGO)', width / 2, pillY + 18);

      // Amount box
      ctx.fillStyle = '#062217';
      ctx.font = 'bold 28px Inter, system-ui, sans-serif';
      ctx.fillText(formatPrice(transaction.amount), width / 2, 185);

      ctx.fillStyle = '#424844';
      ctx.font = '500 12px Inter, system-ui, sans-serif';
      ctx.fillText(transaction.concept, width / 2, 206);

      // Dashed separator line
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(25, 225);
      ctx.lineTo(width - 25, 225);
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();
      ctx.setLineDash([]);

      // Details Table
      ctx.textAlign = 'left';
      const startY = 250;
      const rowGap = 26;
      const rows = [
        ['Nº de Operación MP', `#${transaction.mpOperationNumber}`],
        ['Fecha & Hora', `${transaction.date} · ${transaction.time} hs`],
        ['Medio de Pago', transaction.paymentMethod],
        ['Cliente / Titular', `${transaction.clientName}`],
        ['DNI / CUIT Cliente', transaction.clientDni || '27-38834190-4'],
        ['Total Tratamiento', formatPrice(transaction.totalServicePrice || transaction.amount)],
        ['Saldo Restante en Cabina', formatPrice(transaction.remainingBalance || 0)],
        ['Estado de la Seña', 'Confirmada y Asignada'],
      ];

      rows.forEach(([label, value], index) => {
        const y = startY + index * rowGap;
        ctx.fillStyle = '#64748b';
        ctx.font = '500 11px Inter, system-ui, sans-serif';
        ctx.fillText(label, 30, y);

        ctx.fillStyle = index === 7 ? '#062217' : '#0f172a';
        ctx.font = index === 7 ? 'bold 11px Inter, system-ui, sans-serif' : '600 11px Inter, system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(value, width - 30, y);
        ctx.textAlign = 'left';
      });

      // Bottom separator
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(25, 470);
      ctx.lineTo(width - 25, 470);
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();
      ctx.setLineDash([]);

      // Security footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#062217';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.fillText('TusTurnos · Sistema de Gestión y Agendamiento Online', width / 2, 495);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 9.5px Inter, system-ui, sans-serif';
      ctx.fillText(`Hash de Verificación: ${transaction.id}-MP-${Date.now().toString().slice(-6)}`, width / 2, 512);
      ctx.fillText('Comprobante válido de reserva con garantía de seña asegurada.', width / 2, 526);

      // Trigger download
      const imageURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = imageURL;
      downloadLink.download = `recibo-${transaction.id}-${transaction.date}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setTimeout(() => setDownloading(false), 800);
    } catch (err) {
      console.error('Error generating receipt image:', err);
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatWhatsAppPhone = (rawPhone?: string): string => {
    if (!rawPhone) return '5493794825713';
    const digits = rawPhone.replace(/\D/g, '');
    if (!digits) return '5493794825713';
    if (digits.startsWith('549') && digits.length >= 12) return digits;
    if (digits.startsWith('54') && !digits.startsWith('549')) return '549' + digits.slice(2);
    if (digits.startsWith('0')) return '549' + digits.slice(1);
    if (digits.length === 10) return '549' + digits;
    if (digits.length > 10) return digits;
    return '549' + digits;
  };

  const handleShareWhatsApp = () => {
    const text = `🧾 *Comprobante de Pago - TusTurnos*%0A` +
      `Estudio: ${transaction.businessName}%0A` +
      `Concepto: ${transaction.concept}%0A` +
      `Monto Abonado: ${formatPrice(transaction.amount)}%0A` +
      `Fecha: ${transaction.date} ${transaction.time} hs%0A` +
      `Operación MP: #${transaction.mpOperationNumber}%0A` +
      `Titular: ${transaction.clientName}%0A` +
      `Estado: Pago Acreditado ✓`;

    const targetPhone = formatWhatsAppPhone(businessPhone);
    window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank');
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="card-aesthetic max-w-sm sm:max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-0">
        {/* Header Bar */}
        <div className="bg-[#2F3E3A] p-4 sm:p-5 text-white relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar recibo"
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-[#D9E6D3] shadow-inner shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#D9E6D3] uppercase tracking-wider block">
                Comprobante Digital
              </span>
              <h3 className="font-bold text-sm sm:text-base text-white leading-tight">
                Recibo de Pago Oficial
              </h3>
            </div>
          </div>
        </div>

        {/* Printable/Visual Receipt Ticket Area (Scrollable so it never cuts off) */}
        <div id="printable-receipt-card" className="p-4 sm:p-5 space-y-3 bg-white text-[#2F3E3A] flex-1 overflow-y-auto overscroll-contain">
          {/* Business Meta */}
          <div className="text-center pb-2.5 border-b border-dashed border-[#A8BDA3]">
            <h4 className="font-bold text-sm sm:text-base text-[#2F3E3A] tracking-tight">
              {transaction.businessName}
            </h4>
            <p className="text-[11px] sm:text-xs text-[#6F8A78] mt-0.5">{transaction.businessAddress}</p>
            {transaction.businessCuit && (
              <p className="text-[10px] sm:text-[11px] text-[#6F8A78]">CUIT: {transaction.businessCuit}</p>
            )}
          </div>

          {/* Amount & Status Badge */}
          <div className="text-center py-0.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9E6D3] text-[#2F3E3A] text-[11px] sm:text-xs font-bold border border-[#D9E6D3]/40 mb-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6F8A78]" />
              <span>Pago Acreditado en Mercado Pago</span>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-[#2F3E3A] tracking-tight">
              {formatPrice(transaction.amount)}
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-[#6F8A78] mt-0.5">
              {transaction.concept}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="bg-[#F6F0E6] rounded-[18px] p-3.5 text-xs space-y-2 border border-[#A8BDA3]">
            <div className="flex items-center justify-between">
              <span className="text-[#6F8A78]">Nº de Operación MP</span>
              <span className="font-mono font-bold text-[#2F3E3A]">#{transaction.mpOperationNumber}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#6F8A78]">Fecha y Hora</span>
              <span className="font-bold text-[#2F3E3A]">{transaction.date} · {transaction.time} hs</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#6F8A78]">Medio de Pago</span>
              <span className="font-semibold text-[#2F3E3A] text-right ml-2">{transaction.paymentMethod}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#6F8A78]">Titular / Cliente</span>
              <span className="font-semibold text-[#2F3E3A]">{transaction.clientName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#6F8A78]">DNI / CUIT</span>
              <span className="font-mono text-[#2F3E3A]">{transaction.clientDni || '27-38834190-4'}</span>
            </div>

            <div className="h-px bg-[#A8BDA3] my-1"></div>

            <div className="flex items-center justify-between">
              <span className="text-[#6F8A78]">Valor Total Tratamiento</span>
              <span className="font-bold text-[#2F3E3A]">
                {formatPrice(transaction.totalServicePrice || transaction.amount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#6F8A78] font-bold">
              <span>Seña Abonada Online</span>
              <span>- {formatPrice(transaction.amount)}</span>
            </div>

            {transaction.remainingBalance !== undefined && transaction.remainingBalance > 0 && (
              <div className="flex items-center justify-between text-[#2F3E3A] font-medium">
                <span>Saldo a cancelar en cabina</span>
                <span className="font-bold text-[#2F3E3A]">{formatPrice(transaction.remainingBalance)}</span>
              </div>
            )}
          </div>

          {/* Security & Verification Stamp */}
          <div className="pt-1.5 flex items-center justify-between text-[11px] text-[#6F8A78] border-t border-dashed border-[#A8BDA3]">
            <div className="flex items-center gap-1.5 text-[#2F3E3A] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#2F3E3A]" />
              <span>Verificado por TusTurnos & MP</span>
            </div>
            <span className="font-mono text-[10px]">ID: {transaction.id}</span>
          </div>
        </div>

        {/* Action Buttons (Fixed at bottom of modal card) */}
        <div className="p-3.5 sm:p-4 bg-[#F6F0E6] border-t border-[#A8BDA3] space-y-2 shrink-0">
          {/* Main Download Button */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={downloading}
            className="w-full py-2.5 sm:py-3 px-4 rounded-[16px] bg-[#2F3E3A] hover:bg-[#6F8A78] text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generando imagen de recibo...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#D9E6D3]" />
                <span>Descargar Recibo Visual (PNG)</span>
              </>
            )}
          </button>

          {/* Secondary Action Row: WhatsApp & Print */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 py-2.5 px-3 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? '¡Listo!' : 'WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2.5 px-3 rounded-full bg-white hover:bg-[#E8EFE5] text-[#2F3E3A] border border-[#A8BDA3] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
