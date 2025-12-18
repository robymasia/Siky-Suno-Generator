
export interface SunoPrompt {
  title: string;
  genre: string;
  styleParams: string;
  lyricsAndStructure: string;
  vibeDescription: string;
}

export interface GenreOption {
  id: string;
  label: string;
  color: string;
  description?: string;
}

export interface GenreWeight {
  name: string;
  weight: number;
}

export interface InstrumentSettings {
  name: string;
  role: string;
  intensity?: string;
}

export interface Preset {
  id: string;
  name: string;
  selectedGenres: GenreOption[];
  genreWeights: Record<string, number>;
  selectedLength: SongLength;
  selectedInstruments: InstrumentSettings[];
  selectedMoods: string[];
  selectedVocals: string[];
  selectedVocalEffects: string[];
  selectedSoundDesign?: string[];
  selectedAutomations?: string[];
  selectedIntroStyle?: string;
  selectedIntroBuildup?: string;
  selectedOutroStyle?: string;
  selectedOutroFade?: string;
  selectedBreakdownType?: string;
  selectedBreakdownIntensity?: string;
  selectedKey?: string;
  selectedBpm?: number;
  lyricsTheme?: string; // New field for lyrics topic
}

export type SongLength = 'Short' | 'Medium' | 'Long';