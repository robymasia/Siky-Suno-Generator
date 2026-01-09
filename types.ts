
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

export interface SectionControl {
  durationSeconds: number; 
  energy: string;
}

export interface GranularStructure {
  intro: SectionControl;
  verse: SectionControl;
  chorus: SectionControl;
  bridge: SectionControl;
  breakdown: SectionControl;
  outro: SectionControl;
}

export interface StructurePreset {
  id: string;
  label: string;
  structure: GranularStructure;
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
  selectedMasteringStyle?: string;
  selectedKey?: string;
  selectedBpm?: number;
  lyricsTheme?: string;
  granularStructure?: GranularStructure;
  selectedIntroBuildup?: string;
  selectedOutroFade?: string;
  selectedBreakdownType?: string;
  selectedArrangement?: string;
  selectedArrangementPresetId?: string;
  isInstrumental?: boolean;
}

export type SongLength = 'Short' | 'Medium' | 'Long';
