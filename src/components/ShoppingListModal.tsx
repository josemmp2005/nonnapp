import React, { useState } from 'react';
import { X, Copy, CheckCircle, ShoppingCart } from 'lucide-react';
import type { IngredientItem } from '../types';
import { useToast } from '../context/ToastContext';

interface Props {
  ingredients: IngredientItem[];
  title: string;
  onClose: () => void;
}

const ShoppingListModal: React.FC<Props> = ({ ingredients, title, onClose }) => {
  // Init with all checked by default is usually better UX, user unchecks what they have
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set(ingredients.map((_, i) => i)));
  const { showToast } = useToast();

  const toggleItem = (index: number) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setCheckedItems(newSet);
  };

  const handleCopy = () => {
    const selectedIngredients = ingredients.filter((_, i) => checkedItems.has(i));
    
    if (selectedIngredients.length === 0) {
        showToast('Selecciona al menos un ingrediente', 'error');
        return;
    }

    const text = `🛒 Lista de compra para "${title}":\n\n` + 
                 selectedIngredients.map(i => `[ ] ${i.item} (${i.quantity})`).join('\n') + 
                 `\n\nGenerado por nonnapp`;

    navigator.clipboard.writeText(text).then(() => {
      showToast('Lista copiada al portapapeles', 'success');
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="flex items-center justify-between p-4 border-b bg-primary text-white">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Lista de la Compra
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 p-1 rounded-full hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-sm text-orange-800 dark:text-orange-200">
            Marca los ingredientes que <b>te faltan</b> y cópialos.
        </div>

        <div className="flex-grow overflow-y-auto p-2">
            {ingredients.map((ing, idx) => (
                <div 
                    key={idx}
                    onClick={() => toggleItem(idx)}
                    className={`flex items-start p-3 mb-1 rounded-lg cursor-pointer transition-colors select-none ${checkedItems.has(idx) ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800/50 opacity-60'}`}
                >
                    <div className={`w-5 h-5 rounded border flex-shrink-0 mr-3 flex items-center justify-center transition-colors mt-0.5 ${checkedItems.has(idx) ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}>
                        {checkedItems.has(idx) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-grow">
                        <span className={`block font-medium ${checkedItems.has(idx) ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 line-through'}`}>{ing.item}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{ing.quantity}</span>
                    </div>
                </div>
            ))}
        </div>

        <div className="p-4 border-t bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {checkedItems.size} ítems seleccionados
            </span>
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-bold hover:bg-black dark:hover:bg-gray-200 transition-all shadow-lg active:scale-95"
            >
                <Copy className="w-4 h-4" />
                Copiar Lista
            </button>
        </div>

      </div>
    </div>
  );
};

export default ShoppingListModal;