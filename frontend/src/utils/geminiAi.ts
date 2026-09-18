/**
 * Google AI Studio (Gemini) Client & Agricultural Advisory Service
 * Powers multimodal crop diagnosis, bilingual (English/Kannada) queries,
 * and live intelligence for Karnataka Agro Trades.
 */
import api from './api';

export const GEMINI_STORAGE_KEY = 'google_ai_studio_api_key';
export const GEMINI_MODEL_KEY = 'google_ai_studio_model';
export const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';

export interface ChatHistoryItem {
  sender: 'user' | 'bot';
  text: string;
}

export interface GeminiResponse {
  reply: string;
  source: 'Google AI Studio (Live Gemini)' | 'Agri-Copilot Knowledge Engine';
  model: string;
}

/**
 * Retrieve active Google AI Studio API key from localStorage or Vite environment.
 */
export function getGoogleAiKey(): string {
  const localKey = localStorage.getItem(GEMINI_STORAGE_KEY);
  if (localKey && localKey.trim()) {
    return localKey.trim();
  }
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
}

/**
 * Persist user-supplied Google AI Studio key.
 */
export function setGoogleAiKey(key: string): void {
  if (key && key.trim()) {
    localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
    // Also notify backend
    api.post('/ai/save-key', { api_key: key.trim() }).catch(() => {});
  } else {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
  }
}

/**
 * Get preferred Gemini model.
 */
export function getSelectedModel(): string {
  return localStorage.getItem(GEMINI_MODEL_KEY) || DEFAULT_GEMINI_MODEL;
}

export function setSelectedModel(model: string): void {
  localStorage.setItem(GEMINI_MODEL_KEY, model);
}

/**
 * Verify if Google AI Studio API Key is valid.
 */
export async function testGoogleAiKey(key: string): Promise<{ valid: boolean; message: string }> {
  if (!key || key.length < 15) {
    return { valid: false, message: 'Key appears too short. Please paste a valid Google AI Studio key.' };
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${key.trim()}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Ping test. Reply with: OK' }] }],
      }),
    });
    if (res.ok) {
      return { valid: true, message: 'Google AI Studio Gemini 2.0 Flash connected successfully!' };
    }
    const errData = await res.json().catch(() => ({}));
    const errMsg = errData.error?.message || `HTTP ${res.status}: Verification failed.`;
    return { valid: false, message: errMsg };
  } catch (err: any) {
    return { valid: false, message: err.message || 'Network connection to Google AI Studio failed.' };
  }
}

const KARNATAKA_SYSTEM_INSTRUCTION = `You are the Karnataka Agri-Copilot, an expert agricultural AI advisor powered by Google AI Studio (Gemini 2.0 Flash) serving Karnataka farmers, APMC traders, and agrarian enterprises.
You have deep domain knowledge in:
1. Karnataka agro-climatic zones (Southern Dry Zone, Northern Dry Zone, Coastal, Malnad/Hill Zone, Central Dry Zone).
2. Major crops: Ragi (Finger Millet - varieties GPU-28, ML-365, Indaf-8), Paddy (Sona Masoori, Jaya, IR-64), Sugarcane (Co 86032, VCF 0517), Maize, Tur/Red Gram (Gulbarga Maruti, BSMR-736), Arecanut, Coffee (Robusta/Arabica), Cotton, Vegetables (Tomato, Onion, Green Chilli), and Fruits (Banana G-9, Mango Alphonso/Badami).
3. University of Agricultural Sciences (UAS Bangalore & UAS Dharwad) package of practices, soil fertility benchmarks (N, P, K, pH 6.5-7.5, organic carbon > 0.5%), and balanced fertilizer applications.
4. Organic & natural farming solutions (Jeevamrutha, Beejamrutha, Neem oil 1500ppm, Trichoderma viride, Pseudomonas fluorescens, Vermicompost).
5. Agricultural pest & plant disease diagnosis (Blast, Blight, Stem borer, Fall Armyworm, Leaf curl virus, Anthracnose, Yellow Vein Mosaic).
6. APMC Mandi market intelligence across Karnataka yards (Yeshwanthpur, Hubballi, Belagavi, Mandya, Mysuru, Vijayapura, Davangere, Shimoga) and MSP procurement policies.

Formatting rules:
- Provide structured, practical answers using markdown:
  * **Summary / Diagnosis** (Direct answer)
  * **Recommended Action / Solution** (Chemical dosage per liter of water AND organic alternatives)
  * **Preventive Measures**
  * **Local Context** (Specific to Karnataka districts and seasons)
- If the requested language is 'kn' (Kannada), write responses in natural, fluent Kannada with key scientific/agri terms transliterated clearly.
- If an image is provided, diagnose the crop leaf symptoms or pest damage visually and detail the identified condition.`;

/**
 * Execute Gemini Agricultural Chat Query.
 * Tries direct Google AI Studio API call first if key is present, otherwise routes to backend proxy.
 */
export async function askGeminiAgriCopilot({
  message,
  history = [],
  imageBase64,
  language = 'en',
  model,
}: {
  message: string;
  history?: ChatHistoryItem[];
  imageBase64?: string | null;
  language?: 'en' | 'kn';
  model?: string;
}): Promise<GeminiResponse> {
  const activeKey = getGoogleAiKey();
  const activeModel = model || getSelectedModel();

  // 1. Direct Google AI Studio Call if key is available in client
  if (activeKey && activeKey.length > 15) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${activeKey}`;
      
      const contents = history.map((h) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      }));

      const currentParts: any[] = [{ text: message }];

      if (imageBase64) {
        let mimeType = 'image/jpeg';
        let rawData = imageBase64;
        if (imageBase64.includes(',')) {
          const [hdr, b64] = imageBase64.split(',', 2);
          rawData = b64;
          if (hdr.includes('png')) mimeType = 'image/png';
          else if (hdr.includes('webp')) mimeType = 'image/webp';
        }
        currentParts.push({
          inline_data: {
            mime_type: mimeType,
            data: rawData,
          },
        });
      }

      contents.push({
        role: 'user',
        parts: currentParts,
      });

      const langNotice = language === 'kn' ? ' Respond primarily in Kannada (ಕನ್ನಡ).' : ' Respond in English.';

      const payload = {
        system_instruction: {
          parts: [{ text: KARNATAKA_SYSTEM_INSTRUCTION + langNotice }],
        },
        contents,
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 1200,
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0];
        const parts = candidate?.content?.parts || [];
        const text = parts.map((p: any) => p.text || '').join('');
        if (text) {
          return {
            reply: text,
            source: 'Google AI Studio (Live Gemini)',
            model: activeModel,
          };
        }
      }
    } catch (directErr) {
      console.warn('Direct Google AI Studio API call error, falling back to backend:', directErr);
    }
  }

  // 2. Fallback via backend endpoint
  try {
    const res = await api.post('/ai/chat', {
      message,
      history,
      image_base64: imageBase64,
      language,
      model: activeModel,
      api_key: activeKey,
    });
    return {
      reply: res.data.reply,
      source: activeKey ? 'Google AI Studio (Live Gemini)' : 'Agri-Copilot Knowledge Engine',
      model: res.data.model || activeModel,
    };
  } catch (err) {
    console.error('AI chat request failed:', err);
    return {
      reply:
        language === 'kn'
          ? 'ಕ್ಷಮಿಸಿ, ಜಾಲತಾಣ ಸಂಪರ್ಕದಲ್ಲಿ ತೊಂದರೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಂಟರ್ನೆಟ್ ಅಥವಾ Google AI Studio API ಕೀಲಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.'
          : 'Unable to reach the AI service right now. Please check your network connection or enter a valid Google AI Studio API key in settings.',
      source: 'Agri-Copilot Knowledge Engine',
      model: activeModel,
    };
  }
}
