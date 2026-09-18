import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Camera,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Settings,
  Languages,
  X,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Wheat,
  Activity,
  Droplets,
  DollarSign
} from 'lucide-react';
import {
  askGeminiAgriCopilot,
  getGoogleAiKey,
  setGoogleAiKey,
  testGoogleAiKey,
  getSelectedModel,
  setSelectedModel,
  DEFAULT_GEMINI_MODEL,
  ChatHistoryItem
} from '../../utils/geminiAi';
import './ChatBot.css';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  image?: string;
  source?: string;
  timestamp: string;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaskara! 🙏 I am your **Karnataka Agri-Copilot**, powered by **Google AI Studio (Gemini 2.0 Flash)**.\n\nI provide live agricultural advisory for Karnataka farmers: sowing timelines, APMC mandi rates, UAS Bangalore/Dharwad guidelines, and instant **Crop Disease Diagnosis from photos**.\n\nHow can I assist your farm today?',
      source: 'Google AI Studio',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFilename, setAttachedFilename] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'kn'>('en');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [speakingId, setSpeakingId] = useState<number | null>(null);

  // Voice Speech-to-text
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Google AI Studio settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getGoogleAiKey());
  const [selectedModelName, setSelectedModelName] = useState(() => getSelectedModel());
  const [keyTesting, setKeyTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ valid?: boolean; message?: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const msgIdRef = useRef(2);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Speech recognition initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'kn' ? 'kn-IN' : 'en-IN';

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const hasApiKey = Boolean(getGoogleAiKey() && getGoogleAiKey().length > 10);

  const quickQuestions = [
    {
      label: 'Leaf Blight Diagnosis',
      icon: <Activity size={13} />,
      query: 'How to identify and treat early blight or leaf spot on tomato crops in Karnataka?'
    },
    {
      label: 'Ragi Sowing & MSP (Mandya)',
      icon: <Wheat size={13} />,
      query: 'What is the best sowing time and high-yielding drought-resistant Ragi variety for Mandya district?'
    },
    {
      label: 'Paddy MSP & APMC Rates',
      icon: <DollarSign size={13} />,
      query: 'What is the current government MSP and APMC mandi trading price for Sona Masoori Paddy?'
    },
    {
      label: 'Sugarcane Fertilizer Dosage',
      icon: <Droplets size={13} />,
      query: 'What is the balanced NPK and bio-fertilizer schedule for Sugarcane in Karnataka?'
    }
  ];

  // Handle Photo Attachment
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo is too large. Please select an image under 5 MB.');
      return;
    }
    setAttachedFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function removeAttachedImage() {
    setAttachedImage(null);
    setAttachedFilename('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Voice recognition toggle
  function toggleVoice() {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  }

  // Text to Speech playback
  function speakMessage(id: number, text: string) {
    if (!window.speechSynthesis) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    // Clean markdown characters for voice readout
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  }

  // Copy text to clipboard
  function copyMessage(id: number, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Clear chat conversation
  function clearChat() {
    setMessages([
      {
        id: msgIdRef.current++,
        sender: 'bot',
        text: 'Chat history cleared. How can I help your farm today?',
        source: 'Google AI Studio',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    removeAttachedImage();
  }

  // Send Message handler
  async function handleSend(customText?: string) {
    const textToSend = (customText || input).trim();
    if (!textToSend && !attachedImage) return;

    const userMsg: Message = {
      id: msgIdRef.current++,
      sender: 'user',
      text: textToSend || 'Diagnose this crop photo and provide remedies.',
      image: attachedImage || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    const curImg = attachedImage;
    removeAttachedImage();
    setIsTyping(true);

    // Prepare history
    const history: ChatHistoryItem[] = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text
    }));

    try {
      const aiResponse = await askGeminiAgriCopilot({
        message: textToSend,
        history,
        imageBase64: curImg,
        language,
        model: selectedModelName
      });

      const botMsg: Message = {
        id: msgIdRef.current++,
        sender: 'bot',
        text: aiResponse.reply,
        source: aiResponse.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: msgIdRef.current++,
        sender: 'bot',
        text: 'An unexpected connection error occurred. Please try again or verify your Google AI Studio configuration.',
        source: 'Agri-Copilot Knowledge Engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  // Save and Test Google AI Studio API Key
  async function handleSaveKey() {
    setKeyTesting(true);
    setTestResult(null);
    const key = apiKeyInput.trim();
    if (!key) {
      setGoogleAiKey('');
      setSelectedModel(selectedModelName);
      setTestResult({ valid: true, message: 'API key cleared. System switched to local agricultural knowledge base.' });
      setKeyTesting(false);
      setTimeout(() => setSettingsOpen(false), 1200);
      return;
    }

    const test = await testGoogleAiKey(key);
    setKeyTesting(false);
    setTestResult(test);
    if (test.valid) {
      setGoogleAiKey(key);
      setSelectedModel(selectedModelName);
      setTimeout(() => {
        setSettingsOpen(false);
        setTestResult(null);
      }, 1500);
    }
  }

  // Format simple markdown into clean HTML paragraphs/lists
  function renderFormattedText(txt: string) {
    const lines = txt.split('\n');
    return lines.map((line, idx) => {
      // Bold replacement
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-*]\s+/, '') }} />
        );
      }
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '6px' }} />;
      }
      return <p key={idx} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  }

  return (
    <div className="agri-ai-container">
      {/* ── 1. Top Bar / Status Header ── */}
      <header className="agri-ai-header">
        <div className="agri-ai-brand">
          <div className="agri-ai-avatar-gemini" title="Google AI Studio Gemini Copilot">
            <Sparkles size={22} />
          </div>
          <div className="agri-ai-title-wrap">
            <h2>
              Karnataka Agri-Copilot
              <span className="agri-ai-badge-gemini">
                <Sparkles size={10} /> {selectedModelName.replace('gemini-', 'Gemini ')}
              </span>
            </h2>
            <p className="agri-ai-subtitle">
              Powered by Google AI Studio • Visual Crop Doctor & Mandi Intelligence
            </p>
          </div>
        </div>

        <div className="agri-ai-header-actions">
          {/* Language Toggle */}
          <button
            type="button"
            className="agri-ai-pill-btn"
            onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')}
            title="Switch Language (English / ಕನ್ನಡ)"
          >
            <Languages size={14} />
            <span>{language === 'en' ? 'English' : 'ಕನ್ನಡ'}</span>
          </button>

          {/* Google AI Studio Settings Modal trigger */}
          <button
            type="button"
            className={`agri-ai-pill-btn ${hasApiKey ? 'connected' : ''}`}
            onClick={() => setSettingsOpen(true)}
            title="Configure Google AI Studio API Key"
          >
            <Settings size={14} />
            <span>{hasApiKey ? 'AI Studio Active' : 'Connect AI Studio'}</span>
          </button>

          {/* Reset / Clear Chat */}
          <button
            type="button"
            className="agri-ai-pill-btn"
            onClick={clearChat}
            title="Clear Chat History"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* ── 2. Message History Viewport ── */}
      <main className="agri-ai-messages" role="log" aria-live="polite">
        {messages.map((m) => {
          const isBot = m.sender === 'bot';
          const isCopied = copiedId === m.id;
          const isSpeaking = speakingId === m.id;

          return (
            <div key={m.id} className={`agri-ai-message-row ${m.sender}`}>
              <div className={`agri-ai-msg-avatar ${m.sender}`}>
                {isBot ? <Bot size={18} /> : <User size={18} />}
              </div>

              <div className="agri-ai-msg-bubble">
                {/* Optional Attached Image Preview */}
                {m.image && (
                  <img
                    src={m.image}
                    alt="Attached crop sample"
                    className="agri-ai-msg-image-thumb"
                  />
                )}

                {/* Formatted Text Content */}
                <div>{renderFormattedText(m.text)}</div>

                {/* Bubble Footer & Actions */}
                <div className="agri-ai-msg-footer">
                  <span>
                    {m.timestamp} {m.source ? `• ${m.source}` : ''}
                  </span>

                  <div className="agri-ai-msg-actions">
                    {/* Read Out Aloud (TTS) */}
                    <button
                      type="button"
                      className="agri-ai-icon-btn"
                      onClick={() => speakMessage(m.id, m.text)}
                      title={isSpeaking ? 'Stop reading' : 'Read aloud'}
                      aria-label="Text to speech"
                    >
                      <Volume2 size={13} color={isSpeaking ? '#15803d' : undefined} />
                    </button>

                    {/* Copy to Clipboard */}
                    <button
                      type="button"
                      className="agri-ai-icon-btn"
                      onClick={() => copyMessage(m.id, m.text)}
                      title={isCopied ? 'Copied!' : 'Copy advice'}
                      aria-label="Copy to clipboard"
                    >
                      {isCopied ? <Check size={13} color="#15803d" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="agri-ai-message-row bot">
            <div className="agri-ai-msg-avatar bot">
              <Bot size={18} />
            </div>
            <div className="agri-ai-typing-wrap">
              <div className="agri-ai-dots">
                <span />
                <span />
                <span />
              </div>
              <span className="agri-ai-typing-text">
                {attachedImage ? 'Analyzing crop photo with Gemini 2.0 Flash...' : 'Consulting Karnataka agricultural knowledge...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* ── 3. Suggestion Chips Bar ── */}
      <div className="agri-ai-chips-container" aria-label="Quick Question Suggestions">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            className="agri-ai-chip"
            onClick={() => handleSend(q.query)}
            disabled={isTyping}
          >
            {q.icon}
            <span>{q.label}</span>
          </button>
        ))}
      </div>

      {/* ── 4. Attached Photo Preview (Staging Tray) ── */}
      {attachedImage && (
        <div className="agri-ai-preview-tray">
          <img src={attachedImage} alt="Crop preview" className="agri-ai-staged-img" />
          <div className="agri-ai-staged-info">
            <strong>Photo Ready for Gemini Visual Diagnosis</strong>
            <span>{attachedFilename || 'Crop leaf / pest image'}</span>
          </div>
          <button
            type="button"
            className="agri-ai-staged-remove"
            onClick={removeAttachedImage}
            title="Remove attachment"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── 5. Input Control Bar ── */}
      <footer className="agri-ai-input-bar">
        {/* Hidden File Input for Image Diagnosis */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {/* Camera / Image Upload Button */}
        <button
          type="button"
          className="agri-ai-tool-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Upload leaf or pest photo for Visual Crop Doctor diagnosis"
          aria-label="Upload crop photo"
        >
          <Camera size={18} />
        </button>

        {/* Voice Input (STT) Button */}
        <button
          type="button"
          className={`agri-ai-tool-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleVoice}
          title={isListening ? 'Listening... click to stop' : 'Speak your question (English / Kannada)'}
          aria-label="Voice input"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Text Input */}
        <div className="agri-ai-input-wrapper">
          <input
            type="text"
            className="agri-ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={
              attachedImage
                ? 'Ask Gemini to diagnose this leaf or pest issue...'
                : language === 'kn'
                ? 'ರೋಗಗಳು, ಬಿತ್ತನೆ ಕಾಲ, ಅಥವಾ APMC ಬೆಲೆ ಬಗ್ಗೆ ಕೇಳಿ...'
                : 'Ask about Ragi sowing, APMC mandi rates, NPK fertilizer, or crop diseases...'
            }
            disabled={isTyping}
          />
        </div>

        {/* Send Action Button */}
        <button
          type="button"
          className="agri-ai-send-btn"
          onClick={() => handleSend()}
          disabled={isTyping || (!input.trim() && !attachedImage)}
          title="Send Question"
          aria-label="Send"
        >
          <Send size={18} />
        </button>
      </footer>

      {/* ── 6. Google AI Studio Settings Modal ── */}
      {settingsOpen && (
        <div className="agri-ai-modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="agri-ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="agri-ai-modal-header">
              <h3>
                <Sparkles size={20} color="#10b981" />
                Google AI Studio Configuration
              </h3>
              <button
                type="button"
                className="agri-ai-icon-btn"
                onClick={() => setSettingsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="agri-ai-modal-body">
              <p className="agri-ai-modal-desc">
                Connect your free <strong>Google AI Studio Gemini API Key</strong> to unlock real-time Gemini 2.0 Flash multimodal reasoning, visual crop disease diagnosis, and Karnataka agricultural intelligence.
              </p>

              {/* API Key Input */}
              <div className="agri-ai-modal-field">
                <label htmlFor="ai-studio-key">Google AI Studio API Key</label>
                <input
                  id="ai-studio-key"
                  type="password"
                  className="agri-ai-modal-input"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                />
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="agri-ai-modal-link"
                >
                  Get free API key from Google AI Studio <ExternalLink size={12} />
                </a>
              </div>

              {/* Model Choice */}
              <div className="agri-ai-modal-field">
                <label htmlFor="ai-studio-model">Gemini Model</label>
                <select
                  id="ai-studio-model"
                  className="agri-ai-modal-input"
                  value={selectedModelName}
                  onChange={(e) => setSelectedModelName(e.target.value)}
                >
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended - Ultrafast & Multimodal)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Lightweight)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                </select>
              </div>

              {/* Status or Verification Result */}
              {testResult && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: testResult.valid ? '#ecfdf5' : '#fef2f2',
                    color: testResult.valid ? '#047857' : '#b91c1c',
                    border: `1px solid ${testResult.valid ? '#a7f3d0' : '#fecaca'}`
                  }}
                >
                  {testResult.valid ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            <div className="agri-ai-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSettingsOpen(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveKey}
                disabled={keyTesting}
              >
                {keyTesting ? 'Verifying...' : 'Save & Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
