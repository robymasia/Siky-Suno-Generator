
import { GoogleGenAI, Type } from "@google/genai";
import { SunoPrompt, GenreWeight, InstrumentSettings } from '../types';

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
  arrangement: string = 'Standard',
  bridgeStyle: string = 'Standard',
  verseEnergy: string = 'Steady',
  chorusEnergy: string = 'Rising',
  lyricsTheme: string = '',
  masteringStyle: string = 'Standard'
): Promise<SunoPrompt> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    Sei il miglior Senior Music Producer e Prompt Engineer al mondo per Suno AI v4/v5.
    Il tuo obiettivo è creare un "Producer Blueprint" impeccabile, ordinato e tecnicamente avanzato.

    --- LOGICA DI STRUTTURA E ORDINE (MANDATORIA) ---
    Il campo 'lyricsAndStructure' deve essere organizzato come un vero foglio di produzione professionale:

    1. INTESTAZIONE TECNICA (Top of the text):
       # TRACK PROFILE
       # ARRANGEMENT: ${arrangement}
       # TARGET: ${length} Duration
       # KEY: [Seleziona la tonalità migliore se 'Any Key']
       # BPM: ${bpm}
       # GENRE FUSION: [Descrizione dettagliata della fusione dei generi basata sui pesi]

    2. FORMATO DELLE SEZIONI:
       Ogni sezione deve iniziare con un tag Suno ottimizzato:
       [SECTION_NAME: Sub-style, Technical details, Energy level]
       (Producer Note: Istruzioni specifiche su strumenti: ${instruments.map(i => i.name).join(', ')} e sound design: ${soundDesign.join(', ')})

    3. REGOLE DI IMPAGINAZIONE:
       - Lascia ESATTAMENTE due righe vuote tra una sezione e l'altra.
       - Il testo deve essere diviso in quartine o strofe coerenti.
       - Le note del produttore (Producer Notes) devono essere sempre tra parentesi tonde subito sotto il tag della sezione.

    --- VINCOLO LUNGHEZZA ("${length}") ---
    - "Short": ~12 righe di testo. Struttura: [Intro] -> [Verse] -> [Chorus] -> [Outro].
    - "Medium": ~25-30 righe. Struttura radio standard completa.
    - "Long": +40 righe. Struttura estesa con molteplici strofe, bridge lunghi e sezioni strumentali/breakdown ampi.

    --- LOGICA DI FUSIONE GENERI ---
    Analizza i pesi: ${JSON.stringify(genres)}.
    Specifica come i generi interagiscono (es. "Ritmica ${genres[0]?.name} con armonie ${genres[1]?.name || 'pure'}").

    --- CAMPO STYLE (STYLE PARAMS) ---
    Deve essere una stringa densa di tag per Suno (max 120-150 caratteri):
    "[Hybrid Genre Descriptor], ${bpm}BPM, [Key], [Moods], [Vocal Style], [Specific Instruments], [Mix Techniques]"

    --- LIRICHE ---
    Crea testi basati su: "${lyricsTheme}". Se vuoto, inventa un tema profondo e coerente con i generi scelti. Sii poetico.

    Rispondi esclusivamente in JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parametri Utente:
        Length: ${length}
        Genres: ${JSON.stringify(genres)}
        BPM/Key: ${bpm} / ${keySignature}
        Arrangement: ${arrangement}
        Instruments: ${JSON.stringify(instruments)}
        Theme: ${lyricsTheme}
        Vocals: ${vocalStyles.join(', ')}
        Moods: ${moods.join(', ')}`,
      config: {
        systemInstruction,
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

    const text = response.text || "{}";
    return JSON.parse(text) as SunoPrompt;
  } catch (error) {
    console.error("Gemini Production Error:", error);
    throw error;
  }
};

export const generateLyricSuggestions = async (
  genres: string[],
  moods: string[],
  theme: string
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `
    Sei un paroliere professionista. Genera 4 brevi suggerimenti lirici (massimo 2-4 righe ciascuno) basati sui generi, mood e tema forniti.
    I suggerimenti devono essere poetici, ritmici e adatti a essere incollati in una strofa o un ritornello.
    Lingua: Italiana.
    Rispondi solo con un array di stringhe JSON.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parametri: Generi: ${genres.join(', ')} | Moods: ${moods.join(', ')} | Tema: ${theme || 'Generico'}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Lyric Suggestion Error:", error);
    return [];
  }
};

export const generateTrackTitle = async (genre: string, vibe: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera un titolo artistico unico per un brano ${genre} con vibrazione ${vibe}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING }
          },
          required: ["title"]
        }
      }
    });
    const json = JSON.parse(response.text || "{}");
    return json.title || "Untitled Track";
  } catch (error) {
    console.error("Error generating track title:", error);
    return "Untitled Track";
  }
};
