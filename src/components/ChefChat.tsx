import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import type { AIRecipeResponse } from '../types';
import { askChefAboutRecipe } from '../services/gemini-edge';

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
    { role: 'model', text: '¡Hola! Soy tu asistente de cocina. ¿Tienes alguna duda sobre esta receta?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // Filter messages for history to avoid sending too much context if not needed, 
    // though Gemini handles context well.
    const responseText = await askChefAboutRecipe(userMsg, recipe, messages);

    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gray-900 dark:bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
      >
        <MessageCircle className="w-7 h-7 group-hover:rotate-12 transition-transform" />
        <span className="absolute right-0 top-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 md:right-6 z-40 w-[90vw] md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 h-[500px] max-h-[80vh]">
      
      {/* Header */}
      <div className="p-4 bg-gray-900 dark:bg-gray-950 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/10 rounded-lg">
                <Bot className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-sm">Chef Assistant</h3>
                <p className="text-xs text-gray-400">En línea</p>
            </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-white" />
                </div>
            )}
            <div 
                className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user' 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-bl-none shadow-sm'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
            <div className="flex justify-start gap-2">
               <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-white" />
                </div>
               <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
               </div>
            </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta algo..."
          className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-600 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
        <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="p-2.5 bg-primary text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};

export default ChefChat;