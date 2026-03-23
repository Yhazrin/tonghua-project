import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage, submitAIFeedback } from '@/services/aiAssistant';
import type { AIChatMessage, AIChatResponse, AISuggestion } from '@/services/aiAssistant';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: AISuggestion[];
  interaction_id?: number | null;
  feedback?: 'helpful' | 'not_helpful';
}

interface AIAssistantProps {
  defaultOpen?: boolean;
  context?: Record<string, unknown>;
  interactionType?: string;
}

const SESSION_ID_KEY = 'tonghua-ai-session';

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: '您好！我是童画公益的AI助手小画 ✿\n\n我可以帮您：捐献衣物、推荐可持续商品、解答售后问题，以及分享环保生活建议。\n\n请问有什么我可以帮到您的？',
};

export default function AIAssistant({ defaultOpen = false, context, interactionType = 'chat' }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const sessionId = useRef(getOrCreateSessionId());

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history: AIChatMessage[] = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response: AIChatResponse = await sendChatMessage({
        session_id: sessionId.current,
        message: text,
        interaction_type: interactionType,
        context,
        history,
      });

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        suggestions: response.suggestions || undefined,
        interaction_id: response.interaction_id,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '抱歉，AI助手暂时无法响应，请稍后再试。',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, interactionType, context]);

  const handleFeedback = useCallback(async (messageId: string, interactionId: number, feedback: 'helpful' | 'not_helpful') => {
    try {
      await submitAIFeedback(interactionId, feedback);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, feedback } : m))
      );
    } catch {
      // 反馈提交失败静默处理
    }
  }, []);

  const quickReplies = [
    { label: '如何捐献衣物？', type: 'donation_guidance' },
    { label: '推荐可持续商品', type: 'product_recommendation' },
    { label: '我的订单在哪里？', type: 'after_sales_help' },
    { label: '环保生活建议', type: 'sustainability_advice' },
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-ink text-paper flex items-center justify-center shadow-lg hover:bg-rust transition-colors duration-300 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="打开AI助手"
        title="AI助手小画"
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
        {/* Dot indicator */}
        {!isOpen && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rust rounded-full" aria-hidden="true" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-paper border border-warm-gray/30 shadow-2xl flex flex-col"
            style={{ maxHeight: 'min(580px, calc(100dvh - 8rem))' }}
            role="dialog"
            aria-modal="true"
            aria-label="AI助手小画"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-warm-gray/20 bg-ink text-paper">
              <div className="w-8 h-8 bg-rust/20 border border-rust/40 flex items-center justify-center flex-shrink-0">
                <span className="font-display text-sm text-rust">画</span>
              </div>
              <div className="flex-1">
                <p className="font-body text-sm tracking-wider">AI助手小画</p>
                <p className="font-body text-xs text-paper/60">童画公益 · 可持续时尚</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer text-paper/60 hover:text-paper transition-colors"
                aria-label="关闭AI助手"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-ink text-paper' : 'bg-warm-gray/15 text-ink'} px-3 py-2.5`}>
                    <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {/* Suggestions */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t border-warm-gray/20 pt-2">
                        {msg.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => s.path && navigate(s.path)}
                            className="cursor-pointer w-full text-left font-body text-xs text-rust hover:text-ink transition-colors flex items-center gap-1.5"
                          >
                            <span className="w-1 h-1 bg-rust rounded-full flex-shrink-0" aria-hidden="true" />
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Feedback */}
                    {msg.role === 'assistant' && msg.interaction_id && !msg.feedback && (
                      <div className="mt-2 flex gap-2 border-t border-warm-gray/20 pt-2">
                        <button
                          onClick={() => handleFeedback(msg.id, msg.interaction_id!, 'helpful')}
                          className="cursor-pointer font-body text-xs text-ink-faded hover:text-archive-brown transition-colors"
                          aria-label="有帮助"
                        >
                          👍
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, msg.interaction_id!, 'not_helpful')}
                          className="cursor-pointer font-body text-xs text-ink-faded hover:text-rust transition-colors"
                          aria-label="没帮助"
                        >
                          👎
                        </button>
                      </div>
                    )}
                    {msg.feedback && (
                      <p className="mt-1 font-body text-xs text-ink-faded">
                        {msg.feedback === 'helpful' ? '✓ 感谢反馈' : '感谢，我会继续改进'}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-warm-gray/15 px-3 py-3">
                    <div className="flex gap-1" aria-label="AI正在思考">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 bg-sepia-mid rounded-full block"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickReplies.map((qr) => (
                  <button
                    key={qr.label}
                    onClick={() => sendMessage(qr.label)}
                    className="cursor-pointer font-body text-xs text-ink border border-warm-gray/30 px-2.5 py-1 hover:bg-warm-gray/15 transition-colors"
                  >
                    {qr.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-warm-gray/20 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="输入您的问题…"
                className="flex-1 font-body text-sm bg-warm-gray/10 border border-warm-gray/30 px-3 py-2 text-ink placeholder-ink-faded/60 outline-none focus:border-ink/40 transition-colors"
                disabled={isLoading}
                aria-label="输入消息"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="cursor-pointer bg-ink text-paper px-4 py-2 font-body text-xs tracking-widest uppercase hover:bg-rust disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="发送"
              >
                发送
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
