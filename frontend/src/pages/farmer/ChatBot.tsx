import React, { useState, useRef } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'bot' | 'user';
  text: string;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaskara! I am your Karnataka Agri-Advisor AI assistant. How can I help you today? Ask about Ragi sowing schedules, APMC market trends, organic fertilizers, or pest control.'
    }
  ]);
  const [input, setInput] = useState('');
  const msgIdRef = useRef(2);

  const quickQuestions = [
    'Best sowing period for Ragi in Mandya?',
    'Current MSP for Paddy in Karnataka?',
    'Organic fertilizer for sugarcane?',
    'How to prevent leaf spot in tomato?'
  ];

  function sendUserMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: msgIdRef.current++, sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Simulated knowledgeable agricultural AI response
    setTimeout(() => {
      let reply = 'Based on UAS Bangalore (University of Agricultural Sciences) guidelines, ensure balanced soil nitrogen and phosphorus levels for optimal yield in Karnataka.';
      const lower = text.toLowerCase();
      if (lower.includes('ragi') || lower.includes('mandya')) {
        reply = 'For Mandya and Mysore districts, late July to mid-August (Kharif) is ideal for Ragi transplantation. Popular drought-resistant varieties include GPU-28 and ML-365.';
      } else if (lower.includes('paddy') || lower.includes('msp')) {
        reply = 'The Karnataka state procurement MSP for Grade A Paddy is ₹2,320 per quintal with an additional state incentive bonus. Check your nearest APMC for token issuance.';
      } else if (lower.includes('fertilizer') || lower.includes('sugarcane')) {
        reply = 'For Sugarcane in Mandya/Belagavi, apply Vermicompost (5 tons/acre) mixed with Trichoderma, and apply NPK in 3 split doses at 30, 60, and 90 days after planting.';
      } else if (lower.includes('tomato') || lower.includes('pest')) {
        reply = 'For early blight or leaf spot in tomatoes, spray Neem oil (3ml/L) or Copper Oxychloride (2.5g/L) during cool morning hours. Avoid excess evening sprinkler irrigation.';
      }

      const botMsg: ChatMessage = { id: msgIdRef.current++, sender: 'bot', text: reply };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
            <Bot size={22} />
          </div>
          <div>
            <h2>Karnataka Agri-Advisor AI Chat Bot</h2>
            <p>Instant answers on crop management, disease diagnosis, and APMC guidelines.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', maxWidth: '800px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '480px' }}>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {m.sender === 'bot' && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Bot size={16} />
                  </div>
                )}
                <div
                  style={{
                    background: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                    color: m.sender === 'user' ? 'white' : 'var(--text-main)',
                    border: m.sender === 'bot' ? '1px solid var(--border)' : 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.92rem',
                    lineHeight: 1.45
                  }}
                >
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', borderRadius: '1rem', padding: '0.25rem 0.6rem' }}
                onClick={() => sendUserMessage(q)}
              >
                <Sparkles size={12} style={{ marginRight: '4px' }} /> {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendUserMessage(input);
            }}
            style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}
          >
            <input
              className="input"
              type="text"
              placeholder="Type your question about crops, weather, or mandi prices..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
