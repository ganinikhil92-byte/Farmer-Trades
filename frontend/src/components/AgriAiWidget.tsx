import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, Send, Bot, Maximize2 } from 'lucide-react';
import { askGeminiAgriCopilot } from '../utils/geminiAi';
import './AgriAiWidget.css';

interface QuickMsg {
  sender: 'user' | 'bot';
  text: string;
}

export default function AgriAiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<QuickMsg[]>([
    {
      sender: 'bot',
      text: 'Namaskara! 🙏 Need quick advice on MSP rates, crop pest diagnosis, or soil tests?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: QuickMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await askGeminiAgriCopilot({
        message: text,
        history: messages.map((m) => ({ sender: m.sender, text: m.text })),
        language: 'en'
      });

      setMessages((prev) => [...prev, { sender: 'bot', text: res.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Network connection error. Please try again or open the full Agri-Copilot page.' }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="agri-widget-trigger"
          onClick={() => setIsOpen(true)}
          title="Open Google AI Studio Agri-Copilot"
          aria-label="Open AI Copilot"
        >
          <span className="agri-widget-icon-spin">
            <Sparkles size={18} />
          </span>
          <span>Ask Agri-Copilot</span>
        </button>
      )}

      {/* Floating Panel */}
      {isOpen && (
        <div className="agri-widget-panel" role="dialog" aria-label="Agri-Copilot Quick Assistant">
          {/* Header */}
          <div className="agri-widget-header">
            <div className="agri-widget-header-title">
              <Bot size={18} color="#10b981" />
              <span>Agri-Copilot AI</span>
            </div>

            <div className="agri-widget-header-actions">
              <Link
                to="/farmer/chatbot"
                className="agri-widget-btn-icon"
                title="Expand to Full Crop Doctor Page"
                onClick={() => setIsOpen(false)}
              >
                <Maximize2 size={15} />
              </Link>

              <button
                type="button"
                className="agri-widget-btn-icon"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="agri-widget-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`agri-widget-msg ${m.sender}`}>
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="agri-widget-msg bot" style={{ fontStyle: 'italic', color: '#64748b' }}>
                Consulting Gemini 2.0 Flash...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="agri-widget-input-bar">
            <input
              type="text"
              className="agri-widget-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a quick farming question..."
              disabled={loading}
            />
            <button
              type="button"
              className="agri-widget-send-btn"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              title="Send"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
