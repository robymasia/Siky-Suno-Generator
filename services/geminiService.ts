
import { GoogleGenAI, Type } from "@google/genai";
import { SunoPrompt, GenreWeight, InstrumentSettings, GranularStructure } from '../types';

async function withRetry<T>(task: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await task();
    } catch (err: any) {
      lastError = err;
      const isRetryable = err.status === 'UNKNOWN' || err.code === 500 || err.message?.includes('Rpc failed');
      if (!isRetryable || i === maxRetries - 1) break;
      const delay = Math.pow(2, i) * 1000 + Math.random() * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

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
  mixStyleDirective: string = '',
  masterTargetDirective: string = '',
  introBuildup: string = 'Standard',
  outroFade: string = 'Standard',
  breakdownType: string = 'Standard',
  arrangement: string = 'Standard',
  lyricsTheme: string = '',
  granularStructure?: GranularStructure,
  isInstrumental: boolean = false
): Promise<SunoPrompt> => {
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isTechnoSelected = genres.some(g => g.name.toLowerCase().includes('techno'));
  const genreBlendDescription = genres
    .map(g => `${g.weight}% ${g.name}`)
    .join(' mixed with ');

  const systemInstruction = `
    You are the "SIKY MASTER ARCHITECT" - The world's most advanced prompt engineer for Suno AI (v4/v5).
    
    --- MANDATORY PREFIXES (STRICT COMPLIANCE) ---
    1. The 'styleParams' output MUST START with: ///***///
    2. The 'lyricsAndStructure' output MUST START with: [Is_MAX_MODE: MAX](MAX) [QUALITY: MAX](MAX) [REALISM: MAX](MAX) [REAL_INSTRUMENTS: MAX](MAX) [REAL_VOCALS: MAX](MAX)

    --- SPECIAL PROTOCOL: TECHNO BLEND ---
    ${isTechnoSelected ? `
    - GENRE DETECTED: TECHNO FAMILY. Priority: HYPNOTIC MINIMALISM & SONIC TEXTURE.
    - LYRICS: Must be extremely minimal. Max 2 short lines per section. Focus on rhythmic repetition, atmospheric whispers, or industrial echoes.
    - MUSIC: Hyper-detailed technical instructions are MANDATORY. Describe: [VCF Filter Sweeps], [303 Resonant Squelch], [Sidechain Ducking], [Modular FM Modulation], [Rumble Kick processing], [Delay Feedback Swells].
    - Focus on the slow progression of filter cutoff and automation over time.
    ` : `
    - PRIORITY: Professional Narrative. Create compelling lyrics with a logical story arc and real-life emotional weight.
    `}

    --- HYBRID GENRE ALCHEMY ---
    - Seamlessly blend: ${genreBlendDescription}.
    - Explain the interaction: e.g. "The industrial weight of ${genres[0].name} meets the soulful warmth of ${genres[1]?.name || 'the sub-style'}".
    - Instrumentation should reflect the percentage weights provided.

    --- CRITICAL FORMATTING ---
    - ALL technical/musical tags MUST be in SQUARE BRACKETS: [TAG].
    - ALL backing vocals/harmonies MUST be in PARENTHESES: (Vocal).
    - NEVER let the AI include instructions like "Intro:" as singable text.

    --- OUTPUT SCHEMA ---
    Return JSON only with fields: title, genre, styleParams, lyricsAndStructure, vibeDescription.
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate a masterpiece track with these details:
      Genres & Weights: ${JSON.stringify(genres)}
      Moods: ${moods.join(', ')}
      Instruments: ${JSON.stringify(instruments)}
      Mix Style: ${mixStyleDirective}
      Mastering: ${masterTargetDirective}
      Key: ${keySignature} | BPM: ${bpm}
      Theme: ${lyricsTheme || 'A cinematic soundscape of lived experience'}
      Instrumental: ${isInstrumental}`,
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
    
    const data = JSON.parse(response.text.trim());
    
    // Prefix cleaning logic
    if (!data.styleParams.startsWith('///***///')) {
      data.styleParams = `///***/// ${data.styleParams}`;
    }
    const maxHeader = `[Is_MAX_MODE: MAX](MAX) [QUALITY: MAX](MAX) [REALISM: MAX](MAX) [REAL_INSTRUMENTS: MAX](MAX) [REAL_VOCALS: MAX](MAX)\n\n`;
    if (!data.lyricsAndStructure.includes('[Is_MAX_MODE: MAX]')) {
      data.lyricsAndStructure = maxHeader + data.lyricsAndStructure;
    }

    return data as SunoPrompt;
  });
};

export const regenerateSongTitle = async (genres: string[], moods: string[], theme: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on these genres: ${genres.join(', ')}, moods: ${moods.join(', ')}, and theme: ${theme}, suggest a single powerful, evocative, and artistic song title. Respond with only the title string.`,
  });
  return response.text.trim().replace(/^"|"$/g, '');
};

export const generateLyricSuggestions = async (genres: string[], moods: string[], vocalStyles: string[], theme: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isTechno = genres.some(g => g.toLowerCase().includes('techno'));
  
  const systemInstruction = `
    You are a professional songwriter specializing in "Lived-Life Narratives" (Vita Vissuta).
    
    Your task: Suggest 4 highly emotional and specific lyrical themes/narratives for a song.
    
    - IF TECHNO: Focus on the "Hypnotic Machine" aspect - minimal, gritty, industrial, or lonely urban landscapes.
    - IF POP/ROCK/URBAN: Create deep stories about real human experiences, broken hearts, street struggles, nostalgic memories of old cities, or late-night reflections.
    - AVOID generic clichés like "I'm dancing in the club". Use sensory details (smell of rain, neon flickering, cold concrete, warm embrace).
    - Ensure suggestions vary in emotional intensity.
    
    Return JSON only: { "suggestions": ["narrative 1", "narrative 2", "narrative 3", "narrative 4"] }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest themes for these parameters:
    Genres: ${genres.join(', ')}
    Moods: ${moods.join(', ')}
    Current Theme/Vibe: ${theme || 'Deep human emotion'}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ["suggestions"]
      }
    }
  });
  return JSON.parse(response.text.trim()).suggestions;
};

export const suggestInstruments = async (genres: GenreWeight[], moods: string[]): Promise<InstrumentSettings[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const genreStr = genres.map(g => `${g.weight}% ${g.name}`).join(' + ');
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest 5 professional instruments for a hybrid blend of ${genreStr} with a ${moods.join('/')} vibe. Include specific world or vintage instruments where appropriate.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { 
          type: Type.OBJECT, 
          properties: { 
            name: { type: Type.STRING }, 
            role: { type: Type.STRING }, 
            intensity: { type: Type.STRING } 
          }, 
          required: ['name', 'role', 'intensity'] 
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const suggestStructure = async (genres: GenreWeight[], moods: string[], length: string): Promise<GranularStructure> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest professional granular structure for a ${length} duration track in ${genres.map(g => g.name).join(' + ')}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          intro: { type: Type.OBJECT, properties: { durationSeconds: { type: Type.INTEGER }, energy: { type: Type.STRING } }, required: ['durationSeconds', 'energy'] },
          verse: { type: Type.OBJECT, properties: { durationSeconds: { type: Type.INTEGER }, energy: { type: Type.STRING } }, required: ['durationSeconds', 'energy'] },
          chorus: { type: Type.OBJECT, properties: { durationSeconds: { type: Type.INTEGER }, energy: { type: Type.STRING } }, required: ['durationSeconds', 'energy'] },
          bridge: { type: Type.OBJECT, properties: { durationSeconds: { type: Type.INTEGER }, energy: { type: Type.STRING } }, required: ['durationSeconds', 'energy'] },
          breakdown: { type: Type.OBJECT, properties: { durationSeconds: { type: Type.INTEGER }, energy: { type: Type.STRING } }, required: ['durationSeconds', 'energy'] },
          outro: { type: Type.OBJECT, properties: { durationSeconds: { type: Type.INTEGER }, energy: { type: Type.STRING } }, required: ['durationSeconds', 'energy'] }
        },
        required: ['intro', 'verse', 'chorus', 'bridge', 'breakdown', 'outro']
      }
    }
  });
  return JSON.parse(response.text.trim());
};
