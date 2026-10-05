import React, { useState } from 'react';
import { ClientProfile } from '../types';
import { ShieldCheck, Check, AlertCircle, Sparkles, FileCheck2 } from 'lucide-react';

interface MedicalConsentModalProps {
  clientProfile: ClientProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: ClientProfile) => void;
}

export const MedicalConsentModal: React.FC<MedicalConsentModalProps> = ({
  clientProfile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [skinType, setSkinType] = useState(clientProfile.skinType);
  const [hasLashAllergy, setHasLashAllergy] = useState(false);
  const [usesRetinol, setUsesRetinol] = useState(true);
  const [usesContacts, setUsesContacts] = useState(false);
  const [hasPreviousFiller, setHasPreviousFiller] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(clientProfile.consentSigned);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: ClientProfile = {
      ...clientProfile,
      skinType,
      medicalSheetCompleted: consentAccepted ? 100 : 85,
      consentSigned: consentAccepted,
      allergies: [
        hasLashAllergy ? 'Alérgica a adhesivo de pestañas / cianoacrilato' : 'Sin alergias a adhesivos cosméticos',
      ],
      sensitivities: [
        usesRetinol ? 'Uso de retinol en los últimos 7 días' : 'Sin exfoliantes fuertes recientes',
        usesContacts ? 'Usa lentes de contacto' : 'No usa lentes de contacto',
      ],
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card-aesthetic max-w-md w-full p-6 text-[#18211f] shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#d8e2de]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#efffc5] text-[#123c32] flex items-center justify-center border border-[#d9f56a]/40">
              <FileCheck2 className="w-4 h-4 text-[#123c32]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#123c32]">Ficha Clínica & Consentimiento</h3>
              <p className="text-[11px] text-[#66716d]">Aura Safety Shield · Cumplimiento Dermo-Estético</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-full bg-[#edf2ef] hover:bg-[#d8e2de] text-[#66716d] flex items-center justify-center font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {/* Info pill */}
          <div className="p-3.5 rounded-[18px] bg-[#efffc5] border border-[#d9f56a]/50 text-[#123c32] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#195344] shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              Esta ficha protege tu salud durante procedimientos de cejas, pestañas y estética. Queda guardada de forma segura para tus turnos.
            </p>
          </div>

          {/* Skin Type */}
          <div>
            <label className="block font-bold text-[#123c32] mb-1.5">Tipo de Piel / Cutis</label>
            <select
              value={skinType}
              onChange={(e) => setSkinType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#d8e2de] focus:outline-none focus:ring-2 focus:ring-[#123c32] text-[#18211f] font-medium"
            >
              <option value="Normal">Normal equilibrada</option>
              <option value="Mixta con tendencia a deshidratación">Mixta con tendencia a deshidratación</option>
              <option value="Grasa / Seborreica">Grasa con tendencia a poros dilatados</option>
              <option value="Sensible / Rosácea">Sensible, reactiva o con rosácea</option>
              <option value="Seca / Alípica">Seca o madura</option>
            </select>
          </div>

          {/* Checklist questions */}
          <div className="space-y-2">
            <span className="block font-bold text-[#123c32]">Antecedentes & Precauciones:</span>

            <label className="flex items-center justify-between p-3 rounded-[16px] bg-[#f7faf7] border border-[#d8e2de] cursor-pointer hover:bg-white transition-colors">
              <span className="text-[#18211f] font-medium">¿Has tenido alergias al pegamento de pestañas o tintes?</span>
              <input
                type="checkbox"
                checked={hasLashAllergy}
                onChange={(e) => setHasLashAllergy(e.target.checked)}
                className="w-4 h-4 accent-[#123c32] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-[16px] bg-[#f7faf7] border border-[#d8e2de] cursor-pointer hover:bg-white transition-colors">
              <span className="text-[#18211f] font-medium">¿Utilizás retinol, ácidos glicólico o salicílico actualmente?</span>
              <input
                type="checkbox"
                checked={usesRetinol}
                onChange={(e) => setUsesRetinol(e.target.checked)}
                className="w-4 h-4 accent-[#123c32] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-[16px] bg-[#f7faf7] border border-[#d8e2de] cursor-pointer hover:bg-white transition-colors">
              <span className="text-[#18211f] font-medium">¿Usas lentes de contacto durante el turno?</span>
              <input
                type="checkbox"
                checked={usesContacts}
                onChange={(e) => setUsesContacts(e.target.checked)}
                className="w-4 h-4 accent-[#123c32] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-[16px] bg-[#f7faf7] border border-[#d8e2de] cursor-pointer hover:bg-white transition-colors">
              <span className="text-[#18211f] font-medium">¿Rellenos previos de ácido hialurónico o botox?</span>
              <input
                type="checkbox"
                checked={hasPreviousFiller}
                onChange={(e) => setHasPreviousFiller(e.target.checked)}
                className="w-4 h-4 accent-[#123c32] cursor-pointer"
              />
            </label>
          </div>

          {/* Informed Consent Agreement */}
          <div className="p-3.5 rounded-[18px] bg-[#f7faf7] border border-[#d8e2de]">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="w-4 h-4 accent-[#123c32] shrink-0 mt-0.5 cursor-pointer"
              />
              <span className="text-[11px] text-[#66716d] leading-relaxed">
                Declaro bajo juramento que los datos aportados son verídicos y autorizo al profesional a realizar el procedimiento estético seleccionado bajo los protocolos de bioseguridad vigentes.
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-[#d8e2de]">
          <button
            onClick={handleSave}
            className="flex-1 py-3.5 px-4 rounded-[16px] bg-[#123c32] hover:bg-[#195344] text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Guardar y Actualizar Ficha
          </button>
          <button
            onClick={onClose}
            className="py-3.5 px-4 rounded-[16px] bg-white hover:bg-[#edf2ef] text-[#66716d] font-bold text-xs border border-[#d8e2de] transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
