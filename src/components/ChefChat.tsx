import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import type { AIRecipeResponse } from '../types';
import { askChefAboutRecipe } from '../services/ai';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { NonnaAvatar } from './ui/NonnaAvatar';

interface Props {
  recipe: AIRecipeResponse;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChefChat: React.FC<Props> = ({ recipe }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '¡Hola! Soy Nonna. ¿Tienes alguna duda sobre esta receta?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEscapeKey(() => {
    if (isOpen) setIsOpen(false);
  });

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      // Filter messages for history to avoid sending too much context if not needed,
      // though the model handles context well.
      const responseText = await askChefAboutRecipe(userMsg, recipe, messages);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'model', text: 'Tuve un problema para responder. ¿Puedes repetir la pregunta?' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Botón flotante con la cara de la Nonna (64px en escritorio, 56px en móvil)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir chat con Nonna"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-soft-lg ring-2 ring-white dark:ring-surface-dark hover:scale-105 hover:-translate-y-0.5 active:scale-[0.97] transition duration-200"
      >
        <NonnaAvatar pose="chat" alt="" className="w-full h-full" />
        <span className="absolute right-0 top-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-white dark:border-surface-dark"></span>
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Chat con Nonna"
      className="fixed bottom-6 right-4 md:right-6 z-40 w-[90vw] md:w-96 bg-surface dark:bg-surface-dark rounded-3xl shadow-2xl border border-ink/15 dark:border-ink-light/15 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 h-[500px] max-h-[80vh]"
    >

      {/* Header */}
      <div className="p-4 bg-ink dark:bg-paper-dark text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="relative">
                <NonnaAvatar pose="chat" alt="" className="w-11 h-11 ring-2 ring-white/20" />
                <span className="absolute right-0 bottom-0 w-3 h-3 bg-success rounded-full border-2 border-ink dark:border-paper-dark"></span>
            </div>
            <div>
                <h3 className="font-bold text-base leading-tight">Nonna</h3>
                <p className="text-xs text-white/60">Tu ayudante de cocina</p>
            </div>
        </div>
        <button onClick={() => setIsOpen(false)} aria-label="Cerrar chat" className="text-white/60 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-cream dark:bg-cream-dark/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <NonnaAvatar pose="chat" alt="" className="w-8 h-8 mt-0.5" />}
            <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-surface dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 text-body dark:text-ink-light rounded-bl-none shadow-sm'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
            <div className="flex justify-start gap-2" role="status" aria-live="polite">
               <NonnaAvatar pose="thinking" alt="" className="w-8 h-8 mt-0.5" />
               <div className="bg-surface dark:bg-[#221B12] border border-ink/15 dark:border-ink-light/15 px-3.5 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-2.5 items-center">
                  <div className="flex gap-1 items-center" aria-hidden="true">
                    <div className="w-1.5 h-1.5 bg-muted-dark rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-muted-dark rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-muted-dark rounded-full animate-bounce delay-150"></div>
                  </div>
                  <span className="text-xs text-muted dark:text-muted-dark">Nonna está pensando...</span>
               </div>
            </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-ink/10 dark:border-ink-light/10 bg-surface dark:bg-surface-dark flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta a Nonna..."
          className="flex-grow bg-primary/10 rounded-full px-4 py-2.5 text-sm text-ink dark:text-ink-light outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-[#2A2114] transition placeholder:text-muted"
        />
        <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Enviar pregunta"
            className="p-2.5 bg-primary text-white rounded-full hover:bg-primary-600 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};

export default ChefChat;
