import React, { useState, useEffect } from 'react';
import { X, Settings, AlertCircle, UtensilsCrossed } from 'lucide-react';
import type { UserProfile as UserProfileType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileType;
  setProfile: (p: UserProfileType) => void;
  initialSection?: string; 
}

const UserProfile: React.FC<Props> = ({ isOpen, onClose, profile, setProfile, initialSection = 'preferences' }) => {
  const [activeTab, setActiveTab] = useState('preferences');

  useEffect(() => {
    if (isOpen && initialSection) {
      if (initialSection === 'allergies') setActiveTab('allergies');
      else if (initialSection === 'utensils') setActiveTab('utensils');
      else setActiveTab('preferences');
    }
  }, [isOpen, initialSection]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-[#241B10]">Mi Perfil Culinario</h3>
          <button onClick={onClose} className="text-[#8C7C63] hover:text-[#5C4E3A]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-[#241B10]/10 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 px-4 whitespace-nowrap transition-colors ${activeTab === 'preferences' ? 'text-primary border-b-2 border-primary bg-orange-50/50' : 'text-[#8C7C63] hover:bg-[#FCF6EC]'}`}
          >
            <Settings className="w-4 h-4" />
            Preferencias
          </button>
          <button 
            onClick={() => setActiveTab('allergies')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 px-4 whitespace-nowrap transition-colors ${activeTab === 'allergies' ? 'text-primary border-b-2 border-primary bg-orange-50/50' : 'text-[#8C7C63] hover:bg-[#FCF6EC]'}`}
          >
            <AlertCircle className="w-4 h-4" />
            Intolerancias
          </button>
          <button 
            onClick={() => setActiveTab('utensils')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 px-4 whitespace-nowrap transition-colors ${activeTab === 'utensils' ? 'text-primary border-b-2 border-primary bg-orange-50/50' : 'text-[#8C7C63] hover:bg-[#FCF6EC]'}`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            Utensilios
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {activeTab === 'preferences' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-medium text-[#3A2E1D] mb-1">
                  Nivel de Habilidad
                </label>
                <select
                  value={profile.cooking_skill}
                  onChange={(e) => setProfile({ ...profile, cooking_skill: e.target.value as any })}
                  className="w-full p-3 rounded-lg border border-[#241B10]/20 dark:border-[#F5E6CD]/20 focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="beginner">Principiante (Instrucciones simples)</option>
                  <option value="intermediate">Intermedio (Cocinero casero)</option>
                  <option value="advanced">Chef Avanzado (Técnicas complejas)</option>
                </select>
                <p className="text-xs text-[#8C7C63] mt-2">
                  Esto ajusta la complejidad de las recetas generadas.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'allergies' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-medium text-[#3A2E1D] mb-1">
                  Alergias y Restricciones
                </label>
                <textarea
                  className="w-full p-3 rounded-lg border border-[#241B10]/20 dark:border-[#F5E6CD]/20 focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-32 resize-none"
                  placeholder="Ej: Celiaquía, Alergia a los frutos secos, Dieta Vegana..."
                  value={profile.allergies}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                />
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mt-2 flex gap-2 items-start">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  La IA será estricta evitando estos ingredientes.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'utensils' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-medium text-[#3A2E1D] mb-1">
                  Ingredientes que NO te gustan
                </label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg border border-[#241B10]/20 dark:border-[#F5E6CD]/20 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Ej: Cilantro, Cebolla, Hígado..."
                  value={profile.disliked_ingredients}
                  onChange={(e) => setProfile({ ...profile, disliked_ingredients: e.target.value })}
                />
              </div>
              
              <div className="pt-4 border-t border-[#241B10]/10">
                <label className="block text-sm font-medium text-[#8C7C63] mb-2 cursor-not-allowed">
                  Utensilios Disponibles (Próximamente)
                </label>
                <div className="flex flex-wrap gap-2 opacity-50 pointer-events-none">
                  <span className="px-3 py-1 bg-[#241B10]/5 rounded-full text-xs">Batidora</span>
                  <span className="px-3 py-1 bg-[#241B10]/5 rounded-full text-xs">Horno</span>
                  <span className="px-3 py-1 bg-[#241B10]/5 rounded-full text-xs">Air Fryer</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-[#FCF6EC] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;