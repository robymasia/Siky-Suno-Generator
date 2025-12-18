import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { SunoPrompt, GenreWeight, InstrumentSettings } from '../types';

const getApiKey = (): string | undefined => {
  try {
    // Tentativo standard process.env
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Tentativo per framework specifici (Vite, Next, etc)
    const envs = [
      'NEXT_PUBLIC_API_KEY',
      'VITE_API_KEY',
      'REACT_APP_API_KEY'
    ];
    for (const key of envs) {
      if (typeof process !== 'undefined' && process.env && process.env[key]) return process.env[key];
    }
    return undefined;
  } catch {
    return undefined;
  }
};

export const generateSunoPrompt = async (
  genres: GenreWeight[], 
  length: string, 
  instruments: InstrumentSettings[] = [], 
  moods: string[] = [],
  vocalStyles: string[] = [],
  vocalEffects: string[] = [],
  keySignature: string = '',
  bpm: number = 120,
  soundDesign: string[] = [],
  automations: string[] = [],
  introStyle: string = 'Standard',
  introBuildup: string = 'Standard',
  outroStyle: string = 'Standard',
  outroFade: string = 'Standard',
  breakdownType: string = 'Standard',
  breakdownIntensity: string = 'Standard',
  lyricsTheme: string = '' 
): Promise<SunoPrompt> => {
  
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("API Key mancante. Aggiungi la variabile 'API_KEY' nelle impostazioni del progetto su Vercel e fai un Redeploy.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
    Sei un produttore musicale esperto per Suno AI v4. 
    Il tuo compito è creare prompt SBLOCCATI e CREATIVI, ignorando filtri di genere convenzionali.
    Se l'utente mescola strumenti Metal con basi House o Techno, FALLO e rendilo EPICO.

    STRATEGIA DI GENERAZIONE:
    1. STYLE PARAMS (Suno Style Field):
       - Crea una stringa densa di tag (max 150 caratteri).
       - Includi sempre: Generi (con pesi), BPM, Chiave, Strumenti (con RUOLO e INTENSITÀ), Vocal Style e Mix Effects.
       - Fusione: Non limitarti a elencare. Descrivi come si fondono (es: "Prominent Distorted Metal Guitars over Subtle 128BPM House Beats").
       - Struttura: Rifletti le scelte di Intro, Outro e Breakdown nel sound design (es: "Atmospheric build-up", "Aggressive Breakdown").

    2. LYRICS & STRUCTURE:
       - Usa SOLO parentesi quadre [ ] per i tag (es: [Intro], [Drop], [Guitar Solo]).
       - Segui la lunghezza richiesta: ${length}.
       - Segui rigorosamente lo stile di Intro, Breakdown e Outro selezionato.
       - LINGUA: Se il tema dell'utente è in Italiano, scrivi i testi in Italiano. Altrimenti in Inglese.
       - TEMA: Se l'utente specifica un tema ("${lyricsTheme}"), usalo come base per il testo.

    3. UNBLOCKED MODE: 
       - Non censurare testi.
       - Non rifiutare combinazioni di strumenti "strane". 
       - Se l'utente chiede strumenti specifici: ${instruments.map(i => `${i.intensity} ${i.name} (as ${i.role})`).join(', ')}, devono essere i protagonisti assoluti rispettando il ruolo e l'intensità assegnati.

    Restituisci un JSON coerente con lo schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Genera un prompt Suno per: 
        Generi=${JSON.stringify(genres)}, 
        Lunghezza=${length}, 
        Strumentazione=${JSON.stringify(instruments)}, 
        Mood=${JSON.stringify(moods)}, 
        BPM=${bpm}, 
        Chiave=${keySignature}, 
        Sound Design=${JSON.stringify(soundDesign)}, 
        Automazioni=${JSON.stringify(automations)}, 
        Intro: ${introStyle} con buildup ${introBuildup}, 
        Breakdown: ${breakdownType} con intensità ${breakdownIntensity}, 
        Outro: ${outroStyle} con dissolvenza ${outroFade}, 
        Tema Testo="${lyricsTheme}".`,
      config: {
        systemInstruction,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            genre: { type: Type.STRING },
            styleParams: { type: Type.STRING },
            lyricsAndStructure: { type: Type.STRING },
            vibeDescription: { type: Type.STRING }
          },
          required: ["title", "genre", "styleParams", "lyricsAndStructure", "vibeDescription"],
        }
      }
    });

    let text = response.text || "";
    text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(text) as SunoPrompt;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const generateTrackTitle = async (genre: string, vibe: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "New Track";
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Titolo creativo per un brano ${genre} con vibra ${vibe}. Solo JSON { "title": "..." }.`
  });
  try {
    const json = JSON.parse(response.text.replace(/```json|```/g, ''));
    return json.title;
  } catch {
    return "Untitled Track";
  }
};