import { GenreOption, SongLength } from './types';

export const GENRES: GenreOption[] = [
  { id: 'house', label: 'House', color: 'bg-blue-600 hover:bg-blue-500' },
  { id: 'techno', label: 'Techno', color: 'bg-slate-700 hover:bg-slate-600' },
  { id: 'trance', label: 'Trance', color: 'bg-cyan-600 hover:bg-cyan-500' },
  { id: 'pop', label: 'Pop', color: 'bg-pink-500 hover:bg-pink-400' },
  { id: 'kpop', label: 'K-Pop', color: 'bg-fuchsia-500 hover:bg-fuchsia-400' },
  { id: 'reggaeton', label: 'Reggaeton', color: 'bg-orange-500 hover:bg-orange-400' },
  { id: 'latin', label: 'Latin', color: 'bg-red-500 hover:bg-red-400' },
  { id: 'rock', label: 'Rock', color: 'bg-stone-700 hover:bg-stone-600' },
  { id: 'metal', label: 'Metal', color: 'bg-zinc-800 hover:bg-zinc-700' },
  { id: 'rnb', label: 'R&B', color: 'bg-violet-600 hover:bg-violet-500' },
  { id: 'soul', label: 'Soul', color: 'bg-amber-700 hover:bg-amber-600' },
  { id: 'funk', label: 'Funk', color: 'bg-yellow-600 hover:bg-yellow-500' },
  { id: 'disco', label: 'Disco', color: 'bg-yellow-500 hover:bg-yellow-400' },
  { id: 'country', label: 'Country', color: 'bg-orange-700 hover:bg-orange-600' },
  { id: 'dancehall', label: 'Dancehall', color: 'bg-yellow-600 hover:bg-yellow-500' },
  { id: 'reggae', label: 'Reggae', color: 'bg-green-600 hover:bg-green-500' },
  { id: 'dubstep', label: 'Dubstep', color: 'bg-purple-600 hover:bg-purple-500' },
  { id: 'dnb', label: 'Drum & Bass', color: 'bg-red-600 hover:bg-red-500' },
  { id: 'synthwave', label: 'Synthwave', color: 'bg-fuchsia-600 hover:bg-fuchsia-500' },
  { id: 'ambient', label: 'Ambient', color: 'bg-teal-600 hover:bg-teal-500' },
  { id: 'edm', label: 'Mainstage EDM', color: 'bg-indigo-600 hover:bg-indigo-500' },
  { id: 'hiphop', label: 'Hip Hop', color: 'bg-orange-600 hover:bg-orange-500' },
  { id: 'trap', label: 'Trap', color: 'bg-rose-600 hover:bg-rose-500' },
  { id: 'drill', label: 'Drill', color: 'bg-stone-600 hover:bg-stone-500' },
  { id: 'cinematic', label: 'Cinematic', color: 'bg-slate-500 hover:bg-slate-400' },
  { id: 'epic', label: 'Epic', color: 'bg-amber-600 hover:bg-amber-500' },
  { id: 'jazz', label: 'Jazz', color: 'bg-sky-600 hover:bg-sky-500' },
  { id: 'blues', label: 'Blues', color: 'bg-indigo-700 hover:bg-indigo-600' },
];

export const GENRE_BPM_RANGES: Record<string, { min: number, max: number, default: number }> = {
  house: { min: 115, max: 130, default: 124 },
  techno: { min: 125, max: 150, default: 132 },
  trance: { min: 130, max: 145, default: 138 },
  pop: { min: 90, max: 130, default: 120 },
  kpop: { min: 110, max: 140, default: 125 },
  reggaeton: { min: 80, max: 100, default: 92 },
  latin: { min: 90, max: 130, default: 105 },
  rock: { min: 110, max: 160, default: 130 },
  metal: { min: 140, max: 200, default: 160 },
  rnb: { min: 60, max: 90, default: 75 },
  soul: { min: 70, max: 110, default: 90 },
  funk: { min: 100, max: 125, default: 112 },
  disco: { min: 115, max: 130, default: 120 },
  country: { min: 70, max: 140, default: 100 },
  dancehall: { min: 90, max: 110, default: 100 },
  reggae: { min: 70, max: 90, default: 80 },
  dubstep: { min: 135, max: 145, default: 140 },
  dnb: { min: 160, max: 180, default: 174 },
  synthwave: { min: 80, max: 120, default: 100 },
  ambient: { min: 60, max: 100, default: 80 },
  edm: { min: 126, max: 132, default: 128 },
  hiphop: { min: 80, max: 100, default: 90 },
  trap: { min: 130, max: 160, default: 140 },
  drill: { min: 140, max: 145, default: 142 },
  cinematic: { min: 60, max: 90, default: 70 },
  epic: { min: 90, max: 130, default: 110 },
  jazz: { min: 80, max: 160, default: 120 },
  blues: { min: 60, max: 120, default: 80 },
};

export const SONG_LENGTHS: { id: SongLength; label: string; description: string }[] = [
  { id: 'Short', label: 'Short (~2m)', description: 'Quick punchy structure' },
  { id: 'Medium', label: 'Medium (~3-4m)', description: 'Standard radio edit' },
  { id: 'Long', label: 'Long (~5m+)', description: 'Extended club mix' },
];

export const INTRO_STYLES = [
  'Standard',
  'Extended DJ Intro (32-bar)',
  'Short & Punchy',
  'Atmospheric Build-up',
  'Acappella Start',
  'Drum Fill Intro',
  'Guitar Riff',
  'Spoken Intro'
];

export const INTRO_BUILDUPS = [
  'Standard',
  'Short',
  'Long'
];

export const OUTRO_STYLES = [
  'Standard',
  'Fade Out',
  'Hard Stop',
  'DJ Loop (Beat Outro)',
  'Deconstructed/Glitch',
  'Ambient Decay',
  'Guitar Solo Fade',
  'Acoustic Reprise'
];

export const OUTRO_FADES = [
  'Standard',
  'Slow Fade',
  'Abrupt Stop',
  'Echoing Decay'
];

export const BREAKDOWN_TYPES = [
  'Standard',
  'Melodic & Emotional',
  'High Energy Build-up',
  'Minimal & Stripped',
  'Chaotic/Intense',
  'Orchestral/Cinematic',
  'Solo Section',
  'A Capella Break'
];

export const BREAKDOWN_INTENSITIES = [
  'Standard',
  'Low',
  'Medium',
  'High'
];

export const GENRE_INSTRUMENTS: Record<string, string[]> = {
  house: ['Korg M1 Piano', '909 Drums', 'Deep Sub Bass', 'Rhodes Piano', 'Diva Vocals', 'Funky Guitar', 'Saxophone', 'Disco Strings', 'Violin Solo', 'Orchestra Hit', 'Trumpet'],
  techno: ['Roland 909 Kick', 'Rumble Bass', 'TB-303 Acid', 'Modular Bleeps', 'Industrial Percussion', 'Dissonant Stabs', 'Hypnotic Loops', 'Dark Strings'],
  trance: ['Supersaw Leads', 'Plucked Synths', 'Arpeggiated Bass', 'Atmospheric Pads', 'Female Vocal Chops', 'Snare Rolls', 'Gate Effect', 'Orchestral Breakdown', 'Epic Strings', 'Cello'],
  pop: ['Polished Synths', 'Electric Guitar', 'Acoustic Guitar', 'Snap Percussion', '808 Bass', 'Drum Machine', 'Piano', 'String Section', 'Catchy Vocal Chops', 'Flute', 'Accordion'],
  kpop: ['High-Energy Synths', 'Trap Beats', 'Funk Guitar', 'Deep Bass', 'Group Vocals', 'Rap Verse FX', 'Bright Brass', 'Glassy Pads'],
  reggaeton: ['Dembow Beat', 'Synth Bass Pluck', 'Spanish Guitar', 'Steel Drums', 'Air Horn', 'Synthesized Mallets', 'Marimba', 'Sub Bass'],
  latin: ['Nylon Guitar', 'Trumpet Section', 'Congas', 'Timbales', 'Bongos', 'Piano Montuno', 'Upright Bass', 'Accordion', 'Guiro'],
  rock: ['Distorted Electric Guitar', 'Overdriven Bass', 'Acoustic Drums', 'Crash Cymbals', 'Power Chords', 'Guitar Solo', 'Hammond Organ', 'Bagpipes'],
  metal: ['Down-tuned Guitar', 'Double Kick Drum', 'Distorted Bass', 'Screaming Vocals', 'Pinch Harmonics', 'Blast Beats', 'Symphonic Strings'],
  rnb: ['Rhodes Piano', 'Finger Snaps', 'Deep Moog Bass', 'Slow Jam Drums', 'Smooth Strings', 'Saxophone', 'Harp', 'Wind Chimes'],
  soul: ['Hammond B3 Organ', 'Horn Section', 'Clean Electric Guitar', 'Upright Bass', 'Vintage Drum Kit', 'Grand Piano', 'Gospel Choir', 'Tambourine'],
  funk: ['Slap Bass', 'Wah-Wah Guitar', 'Clavinet', 'Brass Section', 'Tight Snare', 'Cowbell', 'Congas', 'Synth Lead'],
  disco: ['Funky Rhythm Guitar', 'Octave Bassline', 'String Machine', 'Four-on-the-Floor Kick', 'Open Hi-Hats', 'Electric Piano', 'Brass Stabs', 'Syndrums'],
  country: ['Acoustic Guitar', 'Pedal Steel', 'Fiddle', 'Banjo', 'Telecaster Twang', 'Harmonica', 'Brushed Snare', 'Mandolin', 'Accordion', 'Bagpipes'],
  dancehall: ['Sleng Teng Bass', 'Off-beat Keys', 'Electronic Drums', 'Air Horn', 'Steel Pan', 'Marimba', '808 Sub', 'Brass Stabs'],
  reggae: ['Shank Guitar', 'Bubble Organ', 'Walking Bassline', 'Brass Section', 'Rimshot', 'Timbales', 'Clavinet', 'Trombone'],
  dubstep: ['Wobble Bass', 'Growl Bass', 'Sub Drop', 'Snare with Reverb', 'Arpeggiators', 'Glitch Effects', '140 BPM Drums', 'Cinematic Strings', 'Brass Braams'],
  dnb: ['Reese Bass', 'Amen Break', '808 Sub', 'Hoover Synth', 'Liquid Pads', 'Fast Hi-Hats', 'Atmospheric FX', 'Jazz Samples', 'Saxophone', 'Double Bass'],
  synthwave: ['Juno-106 Chords', 'Linndrum', 'Analog Bass Arp', 'Gated Reverb Snare', 'Yamaha DX7 Bells', 'Neon Pads', 'Electric Guitar Solo'],
  ambient: ['Field Recordings', 'Drone Synths', 'Granular Synthesis', 'Tape Loops', 'Soft Piano', 'Singing Bowls', 'Rain Sounds', 'Cello Drone', 'Flute', 'Harp'],
  edm: ['Big Room Kick', 'Pryda Snare', 'White Noise Risers', 'Pitch Risers', 'Drop Synths', 'Layered Leads', 'Hardstyle Kick', 'Orchestral Hits'],
  hiphop: ['MPC Drums', '808 Bass', 'Sampled Piano', 'Funky Bassline', 'Scratches', 'Brass Stabs', 'Vinyl Strings', 'Orchestral Hits', 'Violin Sample', 'Cello Sample'],
  trap: ['808 Sub', 'Fast Hi-Hats', 'Synthesized Brass', 'Plucked Leads', 'Snare Rolls', 'Hard Kick', 'Gothic Choir', 'Dark Strings', 'Tubular Bells'],
  drill: ['Sliding 808s', 'Hi-Hat Triplets', 'Dark Piano', 'Bell Chords', 'Snare Rolls', 'Vocal Chops', 'Violin Melody'],
  cinematic: ['Orchestral Strings', 'Taiko Drums', 'Grand Piano', 'French Horns', 'Choir', 'Timpani', 'Cello Solo', 'Violin Solo', 'Harp', 'Woodwinds', 'Tubular Bells', 'Gong', 'Full Orchestra', 'Spiccato Strings', 'Oboe', 'Clarinet', 'Flute', 'Bagpipes'],
  epic: ['Hybrid Trailer FX', 'Massive Brass', 'Thunderous Percussion', 'Ostinato Strings', 'Braams', 'Electric Cello', 'War Drums', 'Epic Choir', 'Orchestra Hit', 'Wagner Tuba', 'Full Orchestra'],
  jazz: ['Upright Bass', 'Grand Piano', 'Saxophone', 'Trumpet', 'Brushes Drum Kit', 'Hollow Body Guitar', 'Vibraphone', 'Clarinet', 'Trombone', 'String Quartet', 'Flute', 'Accordion'],
  blues: ['Electric Guitar', 'Harmonica', 'Slide Guitar', 'Hammond Organ', 'Bass Guitar', 'Drum Kit', 'Acoustic Guitar', 'Piano', 'Brass Section'],
};

export const GENRE_SOUND_DESIGN: Record<string, string[]> = {
  house: ['Filter Sweeps', 'Sidechain Pump', 'Vinyl Hiss', 'Disco Stabs', 'Vocal Chops', 'Lo-Fi Texture'],
  techno: ['Rumble Kick', 'Modular Bleeps', 'Industrial Drone', 'Metallic Percussion', 'Distortion', 'Raw Analog'],
  trance: ['White Noise Risers', 'Gated Pads', 'Euphoric Plucks', 'Stereo Widening', 'Ping Pong Delay', 'Sidechain Ducking'],
  pop: ['Polished Vocal Processing', 'Crisp High-End', 'Radio-Ready Compression', 'Glistening Reverb', 'Tight Quantization', 'Stereo Spread'],
  kpop: ['Maximalist Production', 'Genre-Switching', 'Glossy Vocals', 'Impactful Drops', 'Intricate Layers', 'Hyper-Pop Textures'],
  reggaeton: ['Hard Dembow Kick', 'Vocal Stutter', 'Auto-Tune Pitch Correction', 'Tropical Reverb', 'Short Delay', 'Pump Effect'],
  latin: ['Live Room Percussion', 'Bright Brass Sections', 'Natural Reverb', 'Warm Acoustic Guitar', 'Sharp Transients'],
  rock: ['Tube Amp Distortion', 'Room Mic Bleed', 'Feedback Swells', 'Live Drum Sound', 'Raw Energy', 'Double Tracked Guitars'],
  metal: ['High Gain Distortion', 'Triggered Drums', 'Scooped Mids', 'Aggressive Compression', 'Palm Mutes', 'Dark Ambience'],
  rnb: ['Velvet Textures', 'Warm Saturation', 'Vocal Harmonies', 'Smooth Reverb Tail', 'Vinyl Crackle', 'Slow Attack'],
  soul: ['Vintage Tape Hiss', 'Warm Tube Preamp', 'Live Room Feel', 'Plate Reverb', 'Dynamic Range', 'Analog Warmth'],
  funk: ['Tight Compression', 'Envelope Filter', 'Dry Drums', 'Bright Brass', 'Percussive Guitar', 'Groove Swing'],
  disco: ['Phaser on Hi-Hats', 'String Machine Swells', 'Pump Compression', 'Shiny Highs', 'Slapback Delay', 'Retro Shine'],
  country: ['Natural Acoustic Room', 'Plate Reverb on Vocals', 'Clean Telecaster Tone', 'Warm Bass', 'Intimate Vocal'],
  dancehall: ['Air Horn', 'Siren FX', 'Rewind Sound', 'Heavy Sub', 'Gunshot Sample', 'Pitch Correction'],
  reggae: ['Spring Reverb', 'Space Echo', 'Tape Delay', 'Dub Siren', 'Phaser', 'Tube Saturation'],
  dubstep: ['Formant Shifting', 'Wobble Bass', 'Metallic Screech', 'Bitcrushed Drums', 'Laser Zaps', 'Hard Clipping'],
  dnb: ['Reese Bass', 'Time-stretch', 'Amen Chop', 'Tape Saturation', 'Glitch FX', 'Comb Filtering'],
  synthwave: ['Analog Warmth', 'VHS Flutter', 'Tape Saturation', 'Gated Reverb', 'Chorus', 'Detuned Synths'],
  ambient: ['Granular Synthesis', 'Paulstretch', 'Field Recordings', 'Shimmer Reverb', 'Binaural Beats', 'Slow Attack'],
  edm: ['Downlifters', 'CO2 Cannon', 'Crowd Noise', 'Pitch Risers', 'Drop Stabs', 'Multiband Compression'],
  hiphop: ['Vinyl Crackle', 'Sample Chopping', 'Low Pass Filter', 'Tape Saturation', 'Groove Quantize'],
  trap: ['Hard Clipping', 'Pitch Glides', 'Gross Beat', 'Saturation', 'Transient Shaping'],
  drill: ['Glide Notes', 'Half-time', 'Dark Reverb', 'Distortion', 'Stereo Width'],
  cinematic: ['Huge Hall Reverb', 'Dynamic Swells', 'Sub Booms', 'Atmos', 'Orchestral Positioning'],
  epic: ['Impact FX', 'Risers', 'Hybrid Trailer FX', 'Compression', 'Cinematic Hits'],
  jazz: ['Room Reverb', 'Warm Tube Saturation', 'Live Recording Feel', 'Tape Hiss', 'Dynamic Range'],
  blues: ['Amp Distortion', 'Spring Reverb', 'Tube Warmth', 'Live Room', 'Crunch'],
};

export const GENRE_MIX_MASTER: Record<string, string[]> = {
  house: ['Sidechain Compression', 'Filter Sweep Up', 'Vocal Reverb Throw', 'Stereo Hi-Hats', 'Low-End Mono Sum', 'Pump Effect'],
  techno: ['Rumble Bass EQ', 'Industrial Distortion', 'Transient Shaping', 'Dark Reverb Automation', 'Master Limiter Clipping', 'Metallic Delay'],
  trance: ['Euphoric Reverb Swell', 'Ping-Pong Delay', 'Gated Trance Pads', 'White Noise Riser', 'Build-up Tension', 'Stereo Widening'],
  pop: ['Vocal Volume Rides', 'Parallel Drum Compression', 'Bright EQ Boost', 'Master Bus Glue', 'Widened Chorus', 'De-Essing'],
  kpop: ['Punchy Kick', 'Crisp Vocals', 'Extreme Stereo Width', 'Hard Limiting', 'Dynamic EQ', 'Vocal Chop Effects'],
  reggaeton: ['Kick-Bass Sidechain', 'Vocal Presence Boost', 'Snare Snap EQ', 'Sub Bass Saturation', 'Tight Low End', 'Bright Percussion'],
  latin: ['Natural Percussion Pan', 'Brass Brilliance', 'Acoustic Guitar Clarity', 'Vocal Warmth', 'Live Dynamic Range'],
  rock: ['Guitar Wall of Sound', 'Snare Crack Compression', 'Bass Grit', 'Vocal Aggression', 'Overhead Drum Mic Crush'],
  metal: ['Kick Drum Click EQ', 'Guitar High-Gain Clarity', 'Bass Distortion Blend', 'Vocal Screaming Limiting', 'Tight Gating'],
  rnb: ['Low-Mid Warmth', 'Silky Highs', 'Soft Knee Compression', 'Vocal Air Boost', 'Bass Guitar Definition', 'Smooth Fade-outs'],
  soul: ['Vintage Console Emulation', 'Tape Saturation', 'Mono Compatibility', 'Warm Tube EQ', 'Dynamic Vocal Rides'],
  funk: ['Bass Guitar Pop', 'Snare Ghost Notes', 'Guitar Scratch Presence', 'Horn Section Shine', 'Tight Rhythm Bus'],
  disco: ['Four-on-the-Floor Kick Punch', 'Bass Guitar Octave Blend', 'Hi-Hat Sizzle', 'String Section Spread', 'Vocal Harmony Pan'],
  country: ['Vocal Forward Mix', 'Acoustic Guitar Sparkle', 'Pedal Steel Reverb', 'Natural Drum Room', 'Warm Master'],
  dancehall: ['Bass Boost', 'Crisp High-End', 'Vocal Autotune', 'Siren FX Send', 'Punchy Kick Compression', 'Rhythm Quantize'],
  reggae: ['Spring Reverb Splash', 'Tape Echo Feedback', 'Deep Sub Bass', 'Guitar High-Pass', 'Snare Rimshot EQ', 'Space Echo'],
  dubstep: ['Multiband Compression', 'Formant Shift Automation', 'Sub-Bass Saturation', 'Hard Clipping', 'LFO Wobble Speed', 'Drop Impact'],
  dnb: ['Fast Limiter', 'Transient Snap', 'Reese Bass Widening', 'Drum Bus Compression', 'High-Pass Filter Automation', 'Liquid Filtering'],
  synthwave: ['Gated Reverb Snare', 'VHS Tape Warble', 'Analog Chorus', 'Master Tape Saturation', 'Bass Arp Filter', 'Retro EQ'],
  ambient: ['Huge Hall Reverb', 'Paulstretch', 'Binaural Panning', 'Slow Attack Volume', 'Shimmer Delay', 'Granular Freeze'],
  edm: ['Hard Limiting', 'Pitch Riser', 'Drop Volume Boost', 'Stereo Widener', 'CO2 Cannon FX', 'Sidechain Ducking'],
  hiphop: ['Parallel Compression', 'Tape Saturation', 'Vocal Presence Boost', 'Kick Transient', 'Low-Pass Filter Intro', 'Vinyl Crackle'],
  trap: ['808 Distortion', 'Hard Clipper', 'Hi-Hat Rolls Pan', 'Vocal Stutter', 'Half-time Effect', 'Sub Bass Glue'],
  drill: ['Sliding 808 Pitch', 'Dark Plate Reverb', 'Snare EQ Boost', 'Vocal Chop Delay', 'Stereo Width', 'Glide Automation'],
  cinematic: ['Dynamic Range Expansion', 'Orchestral Hall Reverb', 'Sub-Bass Boom', 'Volume Swells', 'Section Panning', 'Epic Impact'],
  epic: ['Hybrid Impact Compression', 'Brass Swell', 'Trailer Hits', 'Master Bus Glue', 'Braam Distortion', 'Risky Dynamic Range'],
  jazz: ['Room Reverb', 'Warm Tube EQ', 'Dynamic Mic Compression', 'Tape Hiss', 'Natural Panning', 'Live Room Feel'],
  blues: ['Amp Cabinet Sim', 'Spring Reverb', 'Tube Overdrive', 'Mono Room Mic', 'Vintage Compression', 'Raw Mix'],
};

export const GENERIC_AUTOMATIONS = [
  'Slow Low-Pass Filter Sweep',
  'High-Pass Filter Rise',
  'Dynamic Sidechain Compression',
  'Volume Swell',
  'Automated Panning',
  'LFO Pitch Modulation',
  'Reverb Throw',
  'Delay Feedback Rise',
  'Resonance Automation',
  'Gated Volume Effect',
  'Tape Stop Effect',
  'Bitcrush Automation'
];

export const MOODS = [
  'Energetic', 'Melodic', 'Dark', 'Uplifting', 'Chill', 'Melancholic',
  'Aggressive', 'Euphoric', 'Hypnotic', 'Ethereal', 'Gritty',
  'Soulful', 'Funky', 'Industrial', 'Dreamy', 'Chaotic',
  'Intense', 'Minimal', 'Psychedelic', 'Romantic', 'Nostalgic',
  'Happy', 'Sad', 'Angry', 'Hopeful', 'Sexy', 'Groovy'
];

export const VOCAL_STYLES = [
  'Auto-tuned',
  'Chanting',
  'Choir',
  'Church Choir',
  'Crooner',
  'Duet',
  'Ethereal',
  'Falsetto',
  'Female Soprano',
  'Female Vocals',
  'Gospel',
  'Gritty',
  'Growling',
  'Instrumental (No Vocals)',
  'Italian Vocals',
  'Jamaican Patois',
  'Latin Gregorian Chants',
  'Latin Prayers',
  'Male Baritone',
  'Male Vocals',
  'Opera',
  'Pop Diva',
  'Rapping',
  'Robotic/Vocoder',
  'Screamo',
  'Shouting/Screaming',
  'Soulful',
  'Spoken Word',
  'Whispering'
];

export const VOCAL_EFFECTS = [
  'Reverb', 'Delay/Echo', 'Heavy Distortion', 'Autotune', 'Vocoder',
  'Telephone Effect', 'Whisper Effect', 'Chopped', 'Stutter', 'Harmonizer',
  'Megaphone', 'Underwater', 'Bitcrushed', 'Reverse Reverb', 'Gated', 'Clean',
  'Radio Voice', 'Flanger', 'Phaser', 'Double Tracking', 'Lo-Fi',
  'Hard Pitch Correction', 'Slapback'
];

export const MUSICAL_KEYS = [
  'Any Key',
  'C Major', 'C Minor',
  'C# Major', 'C# Minor',
  'D Major', 'D Minor',
  'Eb Major', 'Eb Minor',
  'E Major', 'E Minor',
  'F Major', 'F Minor',
  'F# Major', 'F# Minor',
  'G Major', 'G Minor',
  'Ab Major', 'Ab Minor',
  'A Major', 'A Minor',
  'Bb Major', 'Bb Minor',
  'B Major', 'B Minor',
  'Phrygian Mode', 'Dorian Mode', 'Mixolydian Mode'
];

export const INSTRUMENT_ROLES = [
  'Feature', 'Lead', 'Bass', 'Rhythm', 'Pad', 'Atmosphere', 'FX', 'Fill', 'Solo', 'Backing'
];

export const INSTRUMENT_INTENSITIES = [
  'Prominent', 'Standard', 'Subtle', 'Background'
];

export const PLACEHOLDER_PROMPT = {
  title: "Neon Horizon",
  styleParams: "Uplifting Trance, 138 BPM, Ethereal Female Vocals, Sawtooth Leads, Driving Bassline, Hall Reverb, Stereo Delay, Sidechain",
  lyricsAndStructure: "[Intro]\n[Atmospheric Pads]\n\n[Verse 1]\nLost in the silence of the night\nGuiding us towards the light\n\n[Build]\nEnergy rising...\n\n[Drop]\n[High energy synth melody]",
  vibeDescription: "A peak-time trance banger focusing on euphoria and energy."
};