import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AbacusBotProps {
  userId?: string;
  salaId?: string;
}

export function AbacusBot({ userId, salaId }: AbacusBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: '👋 Hola, soy Abacus, tu asistente IA de PARTTH. Puedo ayudarte con:\n\n• Calcular tarifas y comisiones\n• Explicar el sistema de Hold\n• Revisar el estado de tus salas\n• Mediar disputas\n• Validar evidencias\n\n¿En qué puedo ayudarte?',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for global open-abacus events (from notification toasts)
  useEffect(() => {
    const handleOpenAbacus = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setIsOpen(true);
      if (detail?.message) {
        // Pre-populate a contextual message from Abacus
        const contextMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `🔔 ${detail.message}\n\n¿Necesitas que te ayude con algo relacionado?`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, contextMsg]);
      }
    };
    window.addEventListener('open-abacus', handleOpenAbacus);
    return () => window.removeEventListener('open-abacus', handleOpenAbacus);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !userId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1c8a6aaa/webhooks/abacus-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            message: inputValue,
            salaId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al comunicarse con Abacus');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply || 'Lo siento, no pude procesar tu mensaje.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error enviando mensaje a Abacus:', error);
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '❌ Error de conexión. Verifica que n8n esté configurado correctamente.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!userId) return null;

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] shadow-lg shadow-[#00F2A6]/50 hover:shadow-xl hover:shadow-[#00F2A6]/70 transition-all duration-300 flex items-center justify-center group"
          aria-label="Abrir Abacus Bot"
        >
          <Bot className="w-8 h-8 text-black group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#00F2A6] rounded-full animate-ping" />
        </button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-black border-2 border-[#00F2A6]/30 rounded-2xl shadow-2xl shadow-[#00F2A6]/20 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00F2A6] to-[#0EA5E9] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-black text-lg">Abacus</h3>
                <p className="text-xs text-black/70">Asistente IA de PARTTH</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-black/20 hover:bg-black/30 flex items-center justify-center transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-black to-[#0A0A0A]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] text-black'
                      : 'bg-zinc-900 text-white border border-[#00F2A6]/20'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-black/60' : 'text-zinc-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 border border-[#00F2A6]/20 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#00F2A6] animate-spin" />
                  <span className="text-sm text-zinc-400">Abacus está pensando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-zinc-900 border-t border-[#00F2A6]/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className="flex-1 bg-black border border-[#00F2A6]/30 rounded-xl px-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-[#00F2A6] focus:ring-2 focus:ring-[#00F2A6]/20 transition-all disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2A6] to-[#0EA5E9] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#00F2A6]/50 transition-all"
                aria-label="Enviar mensaje"
              >
                <Send className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}