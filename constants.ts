
import { GenreOption, SongLength, GranularStructure, StructurePreset } from './types';

export const GENRES: GenreOption[] = [
  // --- ELECTRONIC: HOUSE ---
  { id: 'house', label: 'Classic House', color: 'bg-blue-600' },
  { id: 'deep_house', label: 'Deep House', color: 'bg-blue-800' },
  { id: 'tech_house', label: 'Tech House', color: 'bg-cyan-700' },
  { id: 'progressive_house', label: 'Progressive House', color: 'bg-sky-600' },
  { id: 'future_house', label: 'Future House', color: 'bg-emerald-600' },
  { id: 'slap_house', label: 'Slap House', color: 'bg-indigo-600' },
  { id: 'soulful_house', label: 'Soulful House', color: 'bg-amber-600' },
  { id: 'afro_house', label: 'Afro House', color: 'bg-orange-800' },
  { id: 'g_house', label: 'G-House', color: 'bg-zinc-800' },
  { id: 'electro_house', label: 'Electro House', color: 'bg-yellow-500' },

  // --- ELECTRONIC: TECHNO ---
  { id: 'techno', label: 'Techno', color: 'bg-slate-700' },
  { id: 'minimal_techno', label: 'Minimal Techno', color: 'bg-slate-800' },
  { id: 'melodic_techno', label: 'Melodic Techno', color: 'bg-indigo-900' },
  { id: 'acid_techno', label: 'Acid Techno', color: 'bg-lime-700' },
  { id: 'hard_techno', label: 'Hard Techno', color: 'bg-red-950' },
  { id: 'industrial_techno', label: 'Industrial Techno', color: 'bg-stone-900' },
  { id: 'dub_techno', label: 'Dub Techno', color: 'bg-teal-900' },
  { id: 'detroit_techno', label: 'Detroit Techno', color: 'bg-blue-900' },

  // --- ELECTRONIC: BASS & DNB ---
  { id: 'dnb', label: 'Drum and Bass', color: 'bg-red-700' },
  { id: 'liquid_dnb', label: 'Liquid DnB', color: 'bg-blue-400' },
  { id: 'neurofunk', label: 'Neurofunk', color: 'bg-zinc-900' },
  { id: 'dubstep', label: 'Dubstep', color: 'bg-purple-800' },
  { id: 'uk_garage', label: 'UK Garage', color: 'bg-amber-500' },
  { id: 'future_bass', label: 'Future Bass', color: 'bg-pink-400' },
  { id: 'trap_edm', label: 'EDM Trap', color: 'bg-rose-700' },

  // --- ELECTRONIC: TRANCE & PSY ---
  { id: 'trance', label: 'Trance', color: 'bg-cyan-500' },
  { id: 'psytrance', label: 'Psytrance', color: 'bg-purple-600' },
  { id: 'vocal_trance', label: 'Vocal Trance', color: 'bg-sky-300' },
  { id: 'uplifting_trance', label: 'Uplifting Trance', color: 'bg-blue-300' },

  // --- URBAN: HIP HOP & RAP ---
  { id: 'hiphop', label: 'Hip Hop', color: 'bg-orange-600' },
  { id: 'trap', label: 'Modern Trap', color: 'bg-rose-600' },
  { id: 'boom_bap', label: 'Boom Bap', color: 'bg-stone-800' },
  { id: 'drill', label: 'Drill', color: 'bg-zinc-900' },
  { id: 'lofi_hiphop', label: 'Lofi Hip Hop', color: 'bg-indigo-400' },
  { id: 'cloud_rap', label: 'Cloud Rap', color: 'bg-sky-200' },
  { id: 'grime', label: 'Grime', color: 'bg-lime-800' },

  // --- URBAN: R&B & SOUL ---
  { id: 'rnb', label: 'Contemporary R&B', color: 'bg-violet-800' },
  { id: 'neo_soul', label: 'Neo-Soul', color: 'bg-fuchsia-900' },
  { id: 'soul', label: 'Classic Soul', color: 'bg-red-800' },
  { id: 'funk', label: 'Funk', color: 'bg-yellow-600' },
  { id: 'disco', label: 'Disco', color: 'bg-pink-500' },

  // --- ROCK & PUNK ---
  { id: 'rock', label: 'Classic Rock', color: 'bg-stone-700' },
  { id: 'alt_rock', label: 'Alternative Rock', color: 'bg-emerald-700' },
  { id: 'indie_rock', label: 'Indie Rock', color: 'bg-green-600' },
  { id: 'punk', label: 'Punk Rock', color: 'bg-red-600' },
  { id: 'pop_punk', label: 'Pop Punk', color: 'bg-pink-600' },
  { id: 'hard_rock', label: 'Hard Rock', color: 'bg-orange-900' },
  { id: 'grunge', label: 'Grunge', color: 'bg-stone-600' },
  { id: 'psychedelic_rock', label: 'Psychedelic Rock', color: 'bg-purple-500' },
  { id: 'progressive_rock', label: 'Prog Rock', color: 'bg-cyan-800' },
  { id: 'post_rock', label: 'Post Rock', color: 'bg-slate-400' },

  // --- METAL ---
  { id: 'heavy_metal', label: 'Heavy Metal', color: 'bg-zinc-800' },
  { id: 'thrash_metal', label: 'Thrash Metal', color: 'bg-red-900' },
  { id: 'death_metal', label: 'Death Metal', color: 'bg-black' },
  { id: 'black_metal', label: 'Black Metal', color: 'bg-gray-950' },
  { id: 'power_metal', label: 'Power Metal', color: 'bg-yellow-700' },
  { id: 'doom_metal', label: 'Doom Metal', color: 'bg-purple-950' },
  { id: 'nu_metal', label: 'Nu Metal', color: 'bg-stone-900' },

  // --- REGGAE & CARIBBEAN ---
  { id: 'reggae', label: 'Reggae', color: 'bg-green-700' },
  { id: 'reggae_roots', label: 'Roots Reggae', color: 'bg-yellow-600' },
  { id: 'dub', label: 'Dub', color: 'bg-emerald-900' },
  { id: 'dancehall', label: 'Dancehall', color: 'bg-red-700' },
  { id: 'ska', label: 'Ska', color: 'bg-zinc-600' },
  { id: 'rocksteady', label: 'Rocksteady', color: 'bg-orange-500' },
  { id: 'soca', label: 'Soca', color: 'bg-pink-400' },

  // --- LATIN & WORLD ---
  { id: 'reggaeton', label: 'Reggaeton', color: 'bg-orange-400' },
  { id: 'salsa', label: 'Salsa', color: 'bg-red-500' },
  { id: 'bachata', label: 'Bachata', color: 'bg-rose-400' },
  { id: 'bossa_nova', label: 'Bossa Nova', color: 'bg-teal-400' },
  { id: 'afrobeats', label: 'Afrobeats', color: 'bg-orange-500' },
  { id: 'flamenco', label: 'Flamenco', color: 'bg-amber-900' },
  { id: 'kpop', label: 'K-Pop', color: 'bg-fuchsia-400' },
  { id: 'jpop', label: 'J-Pop', color: 'bg-blue-200' },

  // --- JAZZ & BLUES ---
  { id: 'jazz', label: 'Classic Jazz', color: 'bg-sky-700' },
  { id: 'swing', label: 'Swing', color: 'bg-yellow-300' },
  { id: 'bebop', label: 'Bebop', color: 'bg-indigo-700' },
  { id: 'jazz_fusion', label: 'Jazz Fusion', color: 'bg-cyan-600' },
  { id: 'blues', label: 'Classic Blues', color: 'bg-blue-900' },
  { id: 'rock_blues', label: 'Blues Rock', color: 'bg-slate-800' },

  // --- CLASSICAL & CINEMATIC ---
  { id: 'classical', label: 'Symphonic Classical', color: 'bg-amber-800' },
  { id: 'baroque', label: 'Baroque', color: 'bg-yellow-800' },
  { id: 'opera', label: 'Opera', color: 'bg-red-900' },
  { id: 'cinematic', label: 'Cinematic Score', color: 'bg-zinc-700' },
  { id: 'ambient', label: 'Ambient', color: 'bg-teal-600' },
  { id: 'modern_classical', label: 'Modern Classical', color: 'bg-slate-500' },

  // --- ITALIAN SCENE ---
  { id: 'trap_ita', label: 'Trap Italia', color: 'bg-red-600' },
  { id: 'rap_ita', label: 'Hip Hop ITA', color: 'bg-stone-800' },
  { id: 'cantautore', label: 'Cantautore ITA', color: 'bg-amber-700' },
  { id: 'pop_ita', label: 'Pop Italiano', color: 'bg-green-700' },
  { id: 'neomelodico', label: 'Neomelodico', color: 'bg-blue-400' },
  { id: 'indie_ita', label: 'Indie Italia', color: 'bg-emerald-800' },
  { id: 'italo_disco', label: 'Italo Disco', color: 'bg-sky-500' },

  // --- POP & OTHERS ---
  { id: 'pop', label: 'Modern Pop', color: 'bg-pink-400' },
  { id: 'synthpop', label: 'Synthpop', color: 'bg-fuchsia-500' },
  { id: 'indie_pop', label: 'Indie Pop', color: 'bg-emerald-400' },
  { id: 'hyperpop', label: 'Hyperpop', color: 'bg-lime-400' },
  { id: 'country', label: 'Country', color: 'bg-amber-700' },
  { id: 'folk', label: 'Folk', color: 'bg-stone-500' }
];

export const MOODS = [
  'Summer Vibes', 'Tropical Breeze', 'Beach Party', 'Golden Hour', 'Poolside Chill', 'Sunset Romance',
  'Island Life', 'Carnival Energy', 'Holiday Spirit', 'Iced Coffee Mood', 'Festival Mainstage',
  'Uplifting', 'Euphoric', 'Dark', 'Moody', 'Melancholic', 'Heartbroken', 'Hopeful', 'Nostalgic',
  'Inner Peace', 'Ethereal', 'Spiritual', 'Bittersweet', 'Mysterious', 'Dreamy',
  'Aggressive', 'Industrial', 'Cyberpunk', 'Gritty', 'Savage', 'Brutal', 'Rebellious',
  'High Energy', 'Frenetic', 'Tense', 'Epic', 'Heroic', 'Warrior Spirit',
  'Calm', 'Relaxing', 'Lo-Fi Chill', 'Meditative', 'Floating', 'Soothing',
  'Nocturnal', 'Foggy Morning', 'Spacey', 'Cinematic', 'Underground Club',
  'Funky', 'Vibrant', 'Playful', 'Bouncy', 'Groovy', 'Sassy', 'Glamorous', 'Retro Future'
];

export const VOCAL_CATEGORIES: Record<string, string[]> = {
  'Italian Style 🇮🇹': [
    'Cantautore Italiano', 'Vera Voce Italiana Pop', 'Trap Italia Flow', 'Rap Crudo Italiano',
    'Indie Italia Malinconico', 'Bel Canto Opera', 'Tenore Drammatico', 'Soprano Leggero',
    'Vocalità Neomelodica', 'Rock Italiano Graffiante', 'Vocalità Mediterranea'
  ],
  'Reggae & Caribbean 🇯🇲': [
    'Jamaican Patois Vocals', 'Dancehall Toasting', 'Roots Reggae Harmony', 'Dub Poetry Style',
    'Singjaying Style', 'Rough Ragga Vocals', 'Smooth Lovers Rock Voice', 'Nyahbinghi Chants'
  ],
  'Cori & Ensemble 👥': [
    'Coro Gregoriano (Monastico)', 'Gospel Choir (Soulful)', 'Epic War Choir (Cinematic)', 
    'Bulgarian Female Choir (Folk)', 'Children Choir (Angelic)', 'Barbershop Quartet', 
    'Jazz Vocal Ensemble', 'Angelic Choral Pads', 'African Tribal Chants', 'Tibetan Monks Chant', 
    'Opera Chorus', 'Backing Vocals (Harmonized)', 'Crowd Sing-along', 'Small Chamber Choir',
    'Vocal Quintet', 'Synthesized Choirs (80s Style)'
  ],
  'Pop & International': [
    'Female Pop Star', 'Male Soul Vocals', 'Silky R&B Flow', 'Gospel Soloist',
    'Smooth Crooner', 'Husky Female Vocals', 'High-pitched Falsetto', 'Breathiness Enhanced'
  ],
  'Electronic & FX': [
    'Vocoder Robotic', 'Cybernetic AI Voice', 'Whispered ASMR Vocals', 'Sampled Vocal Chops',
    'Bitcrushed Digital Voice', 'Pitch-shifted Deep Voice', 'Android Harmony', 'Talkbox'
  ],
  'Rock & Extreme': [
    'Death Growl', 'Black Metal Scream', 'Hardcore Shout', 'Punk Snarl',
    'Grunge Raspiness', 'Classic Rock Gravel', 'Opera Rock Belting', 'Vocal Fry'
  ]
};

export const VOCAL_EFFECTS_CATEGORIES: Record<string, string[]> = {
  'Dynamics & Pitch': [
    'Hard Autotune', 'Natural Pitch Correction', 'Heavy Compression', 'Vocal Gating',
    'Doubled Vocals', 'Triple-tracked Harmonies', 'Formant Shifting', 'Parallel Processing',
    'De-esser Pro', 'Upward Compression', 'Whisper Track Layering', 'Breath Enhancement'
  ],
  'Space & Time': [
    'Cathedral Reverb', 'Infinite Plate Reverb', 'Slapback Delay', 'Ping-pong Echo',
    'Reverse Reverb Tails', 'Spring Reverb Retro', 'Digital Shimmer', 'Gated Reverb (80s)',
    'Ethereal Diffused Delay', 'Multi-tap Rhythm Echo', 'Granular Reverb Clouds'
  ],
  'Modulation & Texture': [
    'Ensemble Chorus', 'Flanger Swirl', 'Phaser Sweep', 'Ring Modulation (Metallic)',
    'Granular Stutter', 'Vibrato Depth', 'Rotary Speaker (Leslie)', 'Tremolo Pulse'
  ],
  'Harmonics & Distortion': [
    'Analog Tape Saturation', 'Tube Drive Warmth', 'Vinyl Crackle Processing', 'Bitcrushed Distortion',
    'Exciter (High Clarity)', 'Fuzz Vocals', 'Overdriven Preamp', '12-bit Lo-fi Sample Rate'
  ],
  'Creative & Lo-Fi': [
    'Telephone Filter', 'Radio Megaphone', 'Underwater Muffled', 'Granular Vocal Synthesis',
    'Reverse Vocal Snippets', 'Frequency Shifter', 'Robotizer (Phased)', 'Cyborg Harmony'
  ]
};

export const INSTRUMENT_CATEGORIES: Record<string, string[]> = {
  'Piani & Grandi Tasti': [
    'Steinway Grand Piano', 'Yamaha C7 Concert Grand', 'Fazioli F308', 'Upright Saloon Piano',
    'Fender Rhodes MkI', 'Fender Rhodes MkII', 'Wurlitzer 200A', 'Hohner Clavinet D6',
    'Hammond B3 Organ', 'Vox Continental Organ', 'Farfisa Compact', 'Mellotron M400',
    'Celesta', 'Harpsichord', 'Toy Piano', 'Prepared Piano', 'CP-80 Electric Grand',
    'Pipe Organ (Church)', 'Harmonium', 'Accordion (Fisarmonica)'
  ],
  'Sintetizzatori Analogici': [
    'Moog Model D', 'Prophet 5 (Sequential)', 'Roland Jupiter-8', 'Roland Juno-106', 'Korg MS-20',
    'ARP Odyssey', 'Oberheim OB-Xa', 'Sequential Circuits Pro-One', 'Moog One',
    'TB-303 Acid Bassline', 'SH-101 Mono Synth', 'Matrix-12 Pads', 'VCS3 Putney',
    'Memorymoog Polyphonic', 'Polivoks (Russian Synth)'
  ],
  'Sintetizzatori Digitali': [
    'Yamaha DX7 (FM Synthesis)', 'Access Virus TI', 'Nord Lead 4', 'Korg M1', 'Roland D-50',
    'Fairlight CMI (Vintage Sampler)', 'Serum Wavetable', 'Massive X Bass', 'Omnisphere Textures',
    'Sylenth1 Lead', 'Spire Plucks', 'Arturia Pigments', 'Modular FM Rig', 'Wavestation Pads',
    'Ensoniq VFX', 'MicroFreak Digital'
  ],
  'Chitarre Elettriche': [
    'Fender Stratocaster (Clean/Jangle)', 'Fender Telecaster (Twang)', 'Gibson Les Paul (Crunch)',
    'Gibson ES-335 (Jazz/Blues)', 'Gretsch White Falcon', 'Rickenbacker 360', 'Ibanez RG (High Gain)',
    'Music Man JP', 'Danelectro Lipstick', 'Baritone Electric', 'E-Bow Guitar',
    'Double Neck Guitar', 'Fuzz Face Lead', 'Wah-Wah Funk Guitar'
  ],
  'Chitarre Acustiche & Folk': [
    'Martin D-28 Acoustic', 'Taylor 814ce', 'Nylon String Classical', '12-String Acoustic',
    'Resonator Guitar (Dobro)', 'Lap Steel Guitar', 'Pedal Steel (Country)', 'Flamenco Guitar', 
    'Ukulele', 'Banjo 5-String', 'Mandolino Napoletano', 'Bouzouki Greek', 'Lute (Liuto)'
  ],
  'Bassi & Low End': [
    'Fender Precision Bass', 'Fender Jazz Bass', 'Rickenbacker 4003', 'Music Man StingRay',
    'Hofner Violin Bass', 'Upright Double Bass (Jazz)', 'Fretless Bass', 'Slap Funk Bass',
    '808 Sub Bass (Long Tail)', 'Moog Minitaur Sub', 'Reese DnB Bass', 'Acid Bass 303',
    'Washtub Bass', 'Synthwave Bass (Moogish)'
  ],
  'Batteria Acustica': [
    'Modern Rock Kit', 'Vintage Jazz Brushes', 'Deep Studio Kit', 'Tight Funk Kit',
    'Large Arena Drums', 'Indie Lo-fi Drums', 'Speed Metal Double Kick', 'Piccolo Snare',
    'Marching Band Snare', '70s Disco Drums (Damped)'
  ],
  'Drum Machines & Beats': [
    'Roland TR-808 (Trap/Pop)', 'Roland TR-909 (House/Techno)', 'Roland TR-707', 
    'LinnDrum LM-1', 'Oberheim DMX', 'E-mu SP-1200 (Boom Bap)', 'MPC 60 Vinyl Samples', 
    'MPC Renaissance', 'Elektron Machinedrum', 'Amen Breakbeat', 'Industrial Drums',
    'Simmons SDS-V (Hexagonal Drums)', 'Casio SK-1 Lo-fi'
  ],
  'Archi (Strings)': [
    'Full Symphonic Strings', 'Chamber String Quartet', 'Solo Violin (Lyrical)',
    'Solo Cello (Deep/Dark)', 'Double Bass Section (Pizzicato)', 'Tremolo Strings (Tense)',
    'Spiccato Cello Section', 'Epic Staccato Strings', 'Electric Violin', 'Harp (Arpa)'
  ],
  'Ottone & Fiati (Brass/Wood)': [
    'Trumpet Section (Bright)', 'Muted Trumpet (Jazz)', 'Trombone Ensemble',
    'French Horn (Epic/Cinematic)', 'Tuba Solo', 'Alto Saxophone', 'Tenor Saxophone',
    'Baritone Saxophone', 'Flute Solo', 'Clarinet', 'Oboe', 'Bassoon', 'English Horn',
    'Piccolo Flute', 'Soprano Sax'
  ],
  'Etnici & Mondiali': [
    'Sitar (Indian)', 'Tabla (Indian Drums)', 'Koto (Japanese)', 'Shakuhachi Flute',
    'Oud (Arabic)', 'Ney Flute', 'Duduk (Armenian)', 'Bagpipes (Scottish)',
    'Didgeridoo', 'Kalimba (Thumb Piano)', 'Steel Pan (Caribbean)', 'Berimbau', 
    'Erhu (Chinese Violin)', 'Guzheng', 'Balalaika', 'Mbira', 'Taiko Drums'
  ],
  'Sound Design & FX': [
    'White Noise Riser', 'Cinematic Braam (Low Horn)', 'Sub-Drop Boom', 'Vinyl Crackle',
    'Radio Static/Noise', 'Mechanical Gears', 'Watery Textures', 'Glitch Artifacts',
    'Atmospheric Ethereal Pad', 'Distant Thunder', 'Birdsong/Nature', 'Heartbeat'
  ]
};

export const MASTERING_TARGETS = [
  { id: 'spotify', label: 'Streaming / Spotify', directive: 'Mastered for Streaming: -14 LUFS, High Dynamic Range, Crystal Clarity, Vocal Focus' },
  { id: 'club', label: 'Club / Soundsystem', directive: 'Club Master: Heavy Limiting, -7 LUFS, Punchy Low-end, Mono Compatible, High Loudness' },
  { id: 'vintage', label: 'Vintage Tape', directive: 'Analog Master: Tape Saturation, Soft Highs, Warm Mid-range, Subtle Wow/Flutter' },
  { id: 'radio', label: 'Radio Airplay', directive: 'Radio Ready: Mid-forward, Consistent Volume, Strong Presence, Saturated Transients' },
  { id: 'youtube', label: 'YouTube / Video', directive: 'YouTube Optimized: Balanced peaks, dialogue-friendly mids, enhanced stereo width' }
];

export const MIX_STYLES = [
  { id: 'clean', label: 'Ultra Clean Digital', category: 'Modern', directive: 'Surgical EQ, transparent transients, wide digital stereo image' },
  { id: 'analog', label: 'Analog Warmth', category: 'Vintage', directive: 'Tube saturation, rounded transients, harmonic rich, warm low-mids' },
  { id: 'sidechain', label: 'Heavy Sidechain', category: 'Electronic', directive: 'Rhythmic pumping effect, extreme kick-ducking clarity, aggressive movement' },
  { id: 'lofi', label: 'Lo-Fi Dusty', category: 'Urban', directive: 'Bitcrushed, muffled highs, vinyl artifacts, 12-bit texture' },
  { id: 'wall_of_sound', label: 'Wall of Sound', category: 'Rock', directive: 'Massive layering, panoramic double-tracked guitars, dense wall of distortion' }
];

export const MUSICAL_KEYS = ['Any Key', 'C Major', 'C Minor', 'G Major', 'G Minor', 'D Major', 'D Minor', 'A Major', 'A Minor', 'E Major', 'E Minor', 'F Major', 'F Minor', 'B Major', 'B Minor'];
export const INSTRUMENT_ROLES = ['Lead', 'Bass', 'Rhythm', 'Pad', 'Atmos', 'FX', 'Feature/Solo', 'Arpeggio', 'Harmony', 'Syncopated'];
export const INSTRUMENT_INTENSITIES = ['Background', 'Subtle', 'Standard', 'Prominent', 'Solo/Front', 'Aggressive', 'Dynamic'];

export const STRUCTURE_PRESETS: StructurePreset[] = [
  {
    id: 'radio_edit',
    label: 'Radio Edit',
    structure: {
      intro: { durationSeconds: 15, energy: 'Low' },
      verse: { durationSeconds: 45, energy: 'Steady' },
      chorus: { durationSeconds: 45, energy: 'Rising' },
      bridge: { durationSeconds: 20, energy: 'Steady' },
      breakdown: { durationSeconds: 20, energy: 'Low' },
      outro: { durationSeconds: 15, energy: 'Steady' },
    }
  },
  {
    id: 'extended_mix',
    label: 'Extended Club Mix',
    structure: {
      intro: { durationSeconds: 60, energy: 'Steady' },
      verse: { durationSeconds: 60, energy: 'Rising' },
      chorus: { durationSeconds: 90, energy: 'Explosive' },
      bridge: { durationSeconds: 30, energy: 'Steady' },
      breakdown: { durationSeconds: 60, energy: 'Low' },
      outro: { durationSeconds: 60, energy: 'Steady' },
    }
  },
  {
    id: 'dj_friendly',
    label: 'DJ Friendly (Long Intro/Outro)',
    structure: {
      intro: { durationSeconds: 60, energy: 'Steady' },
      verse: { durationSeconds: 45, energy: 'Steady' },
      chorus: { durationSeconds: 60, energy: 'Rising' },
      bridge: { durationSeconds: 30, energy: 'Low' },
      breakdown: { durationSeconds: 45, energy: 'Low' },
      outro: { durationSeconds: 60, energy: 'Steady' },
    }
  }
];

export const SONG_LENGTHS: { id: SongLength; label: string; description: string }[] = [
  { id: 'Short', label: 'Short (~2m)', description: 'Quick punchy structure' },
  { id: 'Medium', label: 'Medium (~3-4m)', description: 'Standard radio edit' },
  { id: 'Long', label: 'Long (~5m+)', description: 'Extended club mix' },
];

export const GENRE_BPM_RANGES: Record<string, { min: number, max: number, default: number }> = {
  house: { min: 120, max: 128, default: 124 },
  techno: { min: 126, max: 145, default: 132 },
  trap_ita: { min: 130, max: 160, default: 140 },
  rap_ita: { min: 85, max: 105, default: 92 },
  edm: { min: 126, max: 132, default: 128 },
  pop: { min: 90, max: 130, default: 115 },
  reggaeton: { min: 85, max: 105, default: 94 },
  reggae: { min: 60, max: 85, default: 72 },
  reggae_roots: { min: 60, max: 80, default: 70 }
};

export const INTRO_BUILDUPS = ['Minimal', 'Standard', 'Epic', 'Ambient Start', 'Percussive', 'Vocal Intro'];
export const OUTRO_FADES = ['Slow Fade', 'Abrupt Stop', 'Infinite Echo', 'Vinyl Stop', 'Rhythmic Trail'];
export const ARRANGEMENT_TYPES = ['Standard', 'Linear Build', 'Loop-based', 'Experimental', 'Traditional Pop'];
export const BREAKDOWN_TYPES = ['Instrumental', 'Vocal solo', 'Percussive', 'Atmospheric', 'Acoustic Strip-down'];
