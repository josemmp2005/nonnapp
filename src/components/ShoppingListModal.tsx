import React, { useState } from 'react';
import { X, Copy, CheckCircle, ShoppingCart } from 'lucide-react';
import type { IngredientItem } from '../types';
import { useToast } from '../context/ToastContext';
import { useEscapeKey } from '../hooks/useEscapeKey';

interface Props {
  ingredients: IngredientItem[];
  title: string;
  onClose: () => void;
}

const ShoppingListModal: React.FC<Props> = ({ ingredients, title, onClose }) => {
  // Init with all checked by default is usually better UX, user unchecks what they have
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set(ingredients.map((_, i) => i)));
  const { showToast } = useToast();

  useEscapeKey(onClose);

  const toggleItem = (index: number) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setCheckedItems(newSet);
  };

  const handleCopy = async () => {
    const selectedIngredients = ingredients.filter((_, i) => checkedItems.has(i));

    if (selectedIngredients.length === 0) {
        showToast('Selecciona al menos un ingrediente', 'error');
        return;
    }

    const text = `🛒 Lista de compra para "${title}":\n\n` +
                 selectedIngredients.map(i => `[ ] ${i.item} (${i.quantity})`).join('\n') +
                 `\n\nGenerado por nonnapp`;

    try {
      await navigator.clipboard.writeText(text);
      showToast('Lista copiada al portapapeles', 'success');
      onClose();
    } catch {
      showToast('No se pudo copiar la lista', 'error');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shopping-list-title"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#130F0A] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex items-center justify-between p-4 border-b bg-primary text-white">
          <h3 id="shopping-list-title" className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart aria-hidden="true" className="w-5 h-5" /> Lista de la Compra
          </h3>
          <button onClick={onClose} aria-label="Cerrar" className="text-white/80 hover:text-white bg-white/10 p-1 rounded-full hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-sm text-orange-800 dark:text-orange-200">
            Marca los ingredientes que <b>te faltan</b> y cópialos.
        </div>

        <div className="flex-grow overflow-y-auto p-2">
            {ingredients.map((ing, idx) => {
              const checked = checkedItems.has(idx);
              return (
                <button
                    type="button"
                    key={idx}
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggleItem(idx)}
                    className={`w-full flex items-start p-3 mb-1 rounded-lg cursor-pointer transition-colors select-none text-left ${checked ? 'bg-white dark:bg-[#18130D] hover:bg-[#FCF6EC] dark:hover:bg-white/5' : 'bg-[#FCF6EC] dark:bg-[#18130D]/50 opacity-60'}`}
                >
                    <div className={`w-5 h-5 rounded border flex-shrink-0 mr-3 flex items-center justify-center transition-colors mt-0.5 ${checked ? 'bg-primary border-primary' : 'border-[#241B10]/20 dark:border-[#F5E6CD]/15 bg-white dark:bg-[#221B12]'}`}>
                        {checked && <CheckCircle aria-hidden="true" className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-grow">
                        <span className={`block font-medium ${checked ? 'text-[#241B10] dark:text-[#F8F2E6]' : 'text-[#6B5D48] dark:text-[#9A8D74] line-through'}`}>{ing.item}</span>
                        <span className="text-xs text-[#6B5D48] dark:text-[#9A8D74]">{ing.quantity}</span>
                    </div>
                </button>
              );
            })}
        </div>

        <div className="p-4 border-t bg-[#FCF6EC] dark:bg-[#18130D] border-[#241B10]/10 dark:border-[#F5E6CD]/10 flex justify-between items-center">
            <span className="text-xs text-[#6B5D48] dark:text-[#9A8D74] font-medium">
                {checkedItems.size} ítems seleccionados
            </span>
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#241B10] dark:bg-[#F8F2E6] dark:text-[#241B10] text-white rounded-xl font-bold hover:bg-black dark:hover:bg-white transition shadow-lg active:scale-95"
            >
                <Copy aria-hidden="true" className="w-4 h-4" />
                Copiar Lista
            </button>
        </div>

      </div>
    </div>
  );
};

export default ShoppingListModal;