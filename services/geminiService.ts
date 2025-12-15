import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { SunoPrompt, GenreWeight, InstrumentSettings } from '../types';

// Helper to safely get the API key without crashing if 'process' is undefined
const getApiKey = (): string | undefined => {
  try {
    return typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;
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
    throw new Error("API Key is missing. Please add the 'API_KEY' variable to your Vercel Project Settings (Environment Variables).");
  }

  const ai = new GoogleGenAI({ apiKey });

  const lengthInstructions: Record<string, string> = {
    'Short': "Create a concise structure (approx 2 mins). Structure should be simple, e.g., [Intro], [Verse], [Chorus], [Outro]. Focus on impact.",
    'Medium': "Create a standard radio-edit structure (approx 3-4 mins). E.g., [Intro], [Verse 1], [Chorus], [Verse 2], [Chorus], [Bridge], [Chorus], [Outro].",
    'Long': "Create an extended 'Club Mix' or 'Journey' structure (approx 5-6 mins). E.g., Long [Intro] for DJ mixing (16-32 bars), multiple [Build] and [Drop] sections, extended [Breakdown], and a long [Outro]."
  };

  const specificInstruction = lengthInstructions[length] || lengthInstructions['Medium'];
  
  // Sort genres to identify dominant vs accent influences
  const sortedGenres = [...genres].sort((a, b) => b.weight - a.weight);
  const dominantGenre = sortedGenres[0]?.name || "Electronic";
  const dominantWeight = sortedGenres[0]?.weight || 100;
  
  const accentGenresList = sortedGenres.slice(1);
  const hasAccents = accentGenresList.length > 0;
  
  // Create a descriptive string for genres with their weights
  const genresList = genres.map(g => `${g.name} (${g.weight}%)`).join(', ');
  const genreNames = genres.map(g => g.name).join(', ');

  // Format instruments with roles
  const instrumentNames = instruments.map(i => {
    let name = i.name;
    const intensity = i.intensity || 'Standard';
    if (intensity !== 'Standard') {
        name = `${intensity} ${name}`;
    }
    if (i.role && i.role !== 'Feature') {
        name = `${name} (${i.role})`;
    }
    return name;
  }).join(', ');

  // Construct refined instruction for instruments based on weights
  const instrumentInstruction = instruments.length > 0 
    ? `MANDATORY USER-SELECTED INSTRUMENTS: You MUST include: ${instrumentNames}. 
       WEIGHTED COHESIVE BLEND: 
       The track is primarily ${dominantGenre} (${dominantWeight}%). Ensure the user-selected instruments are played in a way that respects this foundation.
       For any additional instrumentation, strictly prioritize the dominant genre for the rhythm section (Drums/Bass) and use the accent genres (${accentGenresList.map(g => g.name).join(', ')}) for texture, melody, or specific fills.`
    : `WEIGHTED INSTRUMENTATION STRATEGY (Dynamic Adjustment):
       1. CORE FOUNDATION (${dominantGenre} - ${dominantWeight}%): The Drum Kit, Percussion patterns, and Bassline MUST be characteristic of ${dominantGenre}. This drives the track.
       ${hasAccents ? `2. ACCENT INFLUENCE (${accentGenresList.map(g => `${g.name} ~${g.weight}%`).join(', ')}): Use instruments from these genres to flavor the mid and high range. For example, if blending House (Dom) + Violin (Accent), use a House beat with a Violin lead.` : ''}
       3. FUSION EXECUTION: Do not simply layer sounds. Morph them. (e.g., A ${dominantGenre} synth playing a melody typical of ${accentGenresList[0]?.name || 'another style'}).`;

  // Construct instruction for moods
  const moodInstruction = moods.length > 0
    ? `MANDATORY MOODS: You MUST incorporate the vibe/mood of: ${moods.join(', ')} into the 'styleParams' and the overall composition.`
    : `Suggest a cohesive mood or vibe appropriate for the genre mix.`;

  // Construct instruction for vocals
  const vocalInstruction = vocalStyles.length > 0
    ? `MANDATORY VOCALS: You MUST include the following vocal characteristics in the 'styleParams': ${vocalStyles.join(', ')}. Blend them naturally into the hybrid genre. If 'Instrumental' or 'No Vocals' is listed, ensure NO vocal tags are generated.`
    : `Suggest specific vocal characteristics appropriate for the genre blend (e.g., if blending Soul and Techno, suggest 'Soulful Diva Vocals over Industrial Beat').`;

  // Construct instruction for vocal effects
  const vocalEffectsInstruction = vocalEffects.length > 0
    ? `MANDATORY VOCAL EFFECTS: You MUST apply the following effects to the vocals in 'styleParams': ${vocalEffects.join(', ')}.`
    : `Suggest appropriate vocal processing (e.g., 'Reverb', 'Delay', 'Clean') matching the genre.`;

  // Construct instruction for key signature
  const keyInstruction = keySignature && keySignature !== 'Any Key'
    ? `MANDATORY KEY SIGNATURE: You MUST include '${keySignature}' in the 'styleParams'.`
    : `Suggest an appropriate key signature (e.g., 'C Minor', 'F# Major', 'Phrygian Mode') that fits the mood and genre.`;

  const bpmInstruction = `MANDATORY BPM: The user has explicitly selected ${bpm} BPM. You MUST include '${bpm} BPM' in the 'styleParams'.`;

  const automationInstruction = automations.length > 0
    ? `MANDATORY AUTOMATION & DYNAMICS: The user has explicitly requested the following automation parameters: ${automations.join(', ')}. You MUST include these in the 'styleParams' to describe the production style (e.g. 'Dynamic Sidechain', 'Slow Filter Sweep').`
    : `DYNAMIC AUTOMATION: Suggest 1-2 automation techniques (e.g., 'Filter Sweep', 'Sidechain', 'Volume Swell') if appropriate for the genre.`;

  const audioEffectsInstruction = `
    WEIGHTED MIXING & FX STRATEGY:
    Create a mixing chain that respects the dominance of ${dominantGenre} (${dominantWeight}%) while accommodating ${hasAccents ? accentGenresList.map(g => g.name).join(', ') : 'nuances'}.
    
    - The "Engine" (Kick/Bass/Sidechain) should be ${dominantGenre}.
    - The "Paint" (Reverb/Delay/Saturation) can be borrowed from ${hasAccents ? accentGenresList[0].name : dominantGenre} to create a unique color.
    
    You MUST include 2-3 specific blending techniques in 'styleParams' that make sense for this weighted blend.
  `;

  const soundDesignInstruction = soundDesign.length > 0
    ? `MANDATORY SOUND DESIGN: The user has explicitly requested: ${soundDesign.join(', ')}. Include these in 'styleParams'.
       Blend these user choices into the overall sonic landscape naturally.`
    : `WEIGHTED SONIC TEXTURE FUSION:
       Describe the environment.
       Since ${dominantGenre} is dominant (${dominantWeight}%), the overall fidelity and punch should match that genre.
       ${hasAccents ? `Use the texture of ${accentGenresList.map(g => g.name).join(', ')} to add uniqueness (e.g., lo-fi crackle, vast hall reverb, or cassette distortion) without losing the ${dominantGenre} groove.` : ''}
       
       Choose 3-4 descriptive terms that paint this specific sonic picture.`;

  // Logic for Lyrics Theme
  const lyricsThemeInstruction = lyricsTheme && lyricsTheme.trim() !== ''
    ? `MANDATORY LYRICAL THEME: The user has explicitly provided a theme/topic for the song: "${lyricsTheme}". 
       
       LANGUAGE DETECTION & INSTRUCTION:
       1. Detect the language of the "${lyricsTheme}".
       2. If the user wrote the theme in ITALIAN, you MUST write the lyrics in ITALIAN.
       3. If the user wrote the theme in English, write in English.
       4. Always match the lyrics language to the input language.

       CONTENT INSTRUCTION:
       You MUST write the lyrics (in 'lyricsAndStructure') based on this specific information. 
       Incorporate the user's provided details creatively into the verses and chorus. 
       The lyrics should still fit the mood and genre defined.`
    : `NO SPECIFIC LYRICS THEME PROVIDED: The user has left the lyrics theme empty. 
       You MUST create an original, creative concept and lyrics that perfectly fit the selected Genres ("${genreNames}") and Moods ("${moods.join(', ')}").
       Do not use generic placeholder lyrics. Invent a compelling story or emotion suited for this style.`;

  const structureInstruction = `
    STRUCTURE & ARRANGEMENT PREFERENCES:
    The user has specified detailed structural controls. You MUST apply these nuances to the metatags and descriptions in 'lyricsAndStructure':
    
    1. INTRO: ${introStyle !== 'Standard' ? `Style: "${introStyle}".` : `Standard genre intro.`} ${introBuildup !== 'Standard' ? `Build-up Length: "${introBuildup}".` : ''} 
    2. OUTRO: ${outroStyle !== 'Standard' ? `Style: "${outroStyle}".` : `Standard genre outro.`} ${outroFade !== 'Standard' ? `Fade Type: "${outroFade}".` : ''}
    3. BREAKDOWN/BRIDGE: ${breakdownType !== 'Standard' ? `Type: "${breakdownType}".` : `Standard breakdown.`} ${breakdownIntensity !== 'Standard' ? `Intensity: "${breakdownIntensity}".` : ''}
    
    Ensure these choices are clearly reflected. For example, if Breakdown Intensity is 'High', use tags like [High Energy Breakdown] or [Intense Bridge]. If Outro Fade is 'Abrupt Stop', use [Hard Stop].
  `;

  const formattingInstruction = `
    CRITICAL FORMATTING FOR SUNO AI:
    - ALL structural tags (Intro, Verse, Chorus, Outro, Bridge, Pre-Chorus) MUST be in square brackets [ ]. Example: [Intro], [Verse 1].
    - ALL instrumental cues, instrument solos, drops, and descriptive performance instructions MUST be in square brackets [ ]. Example: [Short Guitar Solo], [Bass Drop], [Spoken Word], [Whispering], [Atmospheric Pads].
    - DO NOT use parentheses ( ) for these tags. ONLY use square brackets [ ].
    - Any text NOT in square brackets will be interpreted as lyrics to be sung. If you want the AI to perform an instrument, BRACKET IT [Like This].
  `;

  const systemInstruction = `
    You are an expert music producer and prompt engineer specifically for Suno AI (v3.5/v4).
    Your goal is to create creative, high-quality, and structurally sound prompts for generating music.
    
    UNRESTRICTED CREATIVE MODE:
    This is a tool for artistic expression. Do NOT censor or filter lyrics based on safety guidelines unless it is illegal.
    - Explicit language, slang, street talk, and mature themes ARE PERMITTED if the genre (e.g. Drill, Rap, Metal) or the user's Theme calls for it.
    - If the user asks for a specific topic, fulfill it without lecturing.
    - Support MULTILINGUAL output. If the input is Italian, output Italian lyrics.
    
    The user has selected a specific weighted blend of genres: ${genresList}.
    
    Suno AI prompts rely heavily on:
    1. "Style of Music": A comma-separated list of genres, sub-genres, BPM, instruments, and vocal styles.
       IMPORTANT ENHANCEMENTS:
       - You MUST Create a unique HYBRID style that intelligently blends elements from: ${genreNames} based on their WEIGHTS.
       - DOMINANCE: ${dominantGenre} (${dominantWeight}%) must dictate the rhythm, tempo, and foundational instrumentation.
       - ACCENTS: ${hasAccents ? accentGenresList.map(g => `${g.name} (${g.weight}%)`).join(', ') : 'None'} must provide flavor, top melodies, or FX textures.
       - DO NOT just list genres. FUSE them based on this hierarchy. (e.g. instead of "Techno, Reggae", use "Dub Techno with Reggae shank chords").
       
       ${bpmInstruction}
       ${keyInstruction}
       ${automationInstruction}
       ${audioEffectsInstruction}
       ${soundDesignInstruction}
       ${vocalInstruction}
       ${vocalEffectsInstruction}
       ${instrumentInstruction}
       ${moodInstruction}
    
    2. "Lyrics/Structure": Using metatags like [Intro], [Verse], [Chorus], [Drop], [Breakdown], [Outro] to define the song structure.
       ${formattingInstruction}
       ${structureInstruction}
       ${lyricsThemeInstruction}
    
    Be creative! Do not produce the same prompt twice.
    
    CRITICAL REQUIREMENT:
    The user wants a ${length} song structure.
    ${specificInstruction}
    Ensure the generated metatags in 'lyricsAndStructure' strictly reflect this length guideline.

    You must also generate a unique, creative 'title' for the track that fits the genre and mood (e.g., 'Neon Heartbeat', 'Dub Echoes', 'Circuit Breaker').
    
    The output must be JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a unique, high-quality Suno AI prompt that blends these genres: "${genresList}" with a ${length} structure. Key: ${keySignature}. BPM: ${bpm}. Structure details: Intro=${introStyle} (${introBuildup}), Outro=${outroStyle} (${outroFade}), Breakdown=${breakdownType} (${breakdownIntensity}). ${lyricsTheme ? `Lyrics Theme: ${lyricsTheme}` : 'No specific theme.'} Ensure the style parameters are rich with effects, automation, specific instruments, and the requested moods. Don't forget the creative title.`,
      config: {
        systemInstruction: systemInstruction,
        // Disable safety settings to allow for creative/explicit lyrics (e.g. Drill/Rap/Metal)
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
            title: { type: Type.STRING, description: "A creative, short title for the track." },
            genre: { type: Type.STRING, description: "The specific hybrid genre name (e.g. 'Acid House Reggae' or 'Cyberpunk Trance')." },
            styleParams: { type: Type.STRING, description: "The style tags string to be used in Suno's 'Style of Music' field. Must include effects, vocal details, and requested instruments/moods. Aim for 120-150 characters." },
            lyricsAndStructure: { type: Type.STRING, description: "The lyrics and structure with metatags. STRICTLY use [Square Brackets] for instrumental cues." },
            vibeDescription: { type: Type.STRING, description: "A short explanation of the vibe/mood." }
          },
          required: ["title", "genre", "styleParams", "lyricsAndStructure", "vibeDescription"],
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");
    
    // Clean markdown if present to avoid JSON parse errors
    text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    return JSON.parse(text) as SunoPrompt;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateTrackTitle = async (genre: string, vibe: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key is missing. Please add the 'API_KEY' variable to your Vercel Project Settings.");

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Generate a single, creative, short song title for a ${genre} track. The vibe is: ${vibe}. Return JSON { "title": "The Title" }.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING }
        }
      }
    }
  });

  let text = response.text;
  if (!text) return "Untitled Track";
  
  // Clean markdown if present
  text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
  
  try {
      const json = JSON.parse(text);
      return json.title || "Untitled Track";
  } catch (e) {
      return "Untitled Track";
  }
};