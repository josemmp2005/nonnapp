/**
 * Modal con la lista de la compra de una receta: ingredientes marcables, todos
 * marcados al abrir para desmarcar los que ya se tienen.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Copy, CheckCircle, ShoppingCart } from 'lucide-react';
import type { IngredientItem } from '../types';
import { useToast } from '../context/ToastContext';
import { Modal } from './ui/Modal';

interface Props {
  ingredients: IngredientItem[];
  title: string;
  onClose: () => void;
}

const ShoppingListModal: React.FC<Props> = ({ ingredients, title, onClose }) => {
  const { t } = useTranslation();
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

  const handleCopy = async () => {
    const selectedIngredients = ingredients.filter((_, i) => checkedItems.has(i));

    if (selectedIngredients.length === 0) {
        showToast(t('app.shoppingList.toastSelectOne'), 'error');
        return;
    }

    const text = `${t('app.shoppingList.copyHeader', { title })}\n\n` +
                 selectedIngredients.map(i => `[ ] ${i.item} (${i.quantity})`).join('\n') +
                 `\n\n${t('app.recipeDisplay.copyFooter')}`;

    try {
      await navigator.clipboard.writeText(text);
      showToast(t('app.shoppingList.toastCopied'), 'success');
      onClose();
    } catch {
      showToast(t('app.shoppingList.toastCopyError'), 'error');
    }
  };

  return (
    <Modal
      onClose={onClose}
      labelledBy="shopping-list-title"
      panelClassName="bg-white dark:bg-cream-dark rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
    >
        <div className="flex items-center justify-between p-4 border-b bg-primary text-white">
          <h3 id="shopping-list-title" className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart aria-hidden="true" className="w-5 h-5" /> {t('app.shoppingList.title')}
          </h3>
          <button onClick={onClose} aria-label={t('app.shoppingList.closeAria')} className="text-white/80 hover:text-white bg-white/10 p-1 rounded-full hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 text-sm text-orange-800 dark:text-orange-200">
            {t('app.shoppingList.hintBefore')} <b>{t('app.shoppingList.hintBold')}</b> {t('app.shoppingList.hintAfter')}
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
                    className={`w-full flex items-start p-3 mb-1 rounded-lg cursor-pointer transition-colors select-none text-left ${checked ? 'bg-white dark:bg-surface-dark hover:bg-cream dark:hover:bg-white/5' : 'bg-cream dark:bg-surface-dark/50 opacity-60'}`}
                >
                    <div className={`w-5 h-5 rounded border flex-shrink-0 mr-3 flex items-center justify-center transition-colors mt-0.5 ${checked ? 'bg-primary border-primary' : 'border-ink/20 dark:border-ink-light/15 bg-white dark:bg-[#221B12]'}`}>
                        {checked && <CheckCircle aria-hidden="true" className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-grow">
                        <span className={`block font-medium ${checked ? 'text-ink dark:text-[#F8F2E6]' : 'text-muted dark:text-muted-dark line-through'}`}>{ing.item}</span>
                        <span className="text-xs text-muted dark:text-muted-dark">{ing.quantity}</span>
                    </div>
                </button>
              );
            })}
        </div>

        <div className="p-4 border-t bg-cream dark:bg-surface-dark border-ink/10 dark:border-ink-light/10 flex justify-between items-center">
            <span className="text-xs text-muted dark:text-muted-dark font-medium">
                {t('app.shoppingList.itemsSelected', { count: checkedItems.size })}
            </span>
            <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-6 py-2.5 bg-ink dark:bg-[#F8F2E6] dark:text-ink text-white rounded-xl font-bold hover:bg-black dark:hover:bg-white transition shadow-lg active:scale-95"
            >
                <Copy aria-hidden="true" className="w-4 h-4" />
                {t('app.shoppingList.copyList')}
            </button>
        </div>
    </Modal>
  );
};

export default ShoppingListModal;