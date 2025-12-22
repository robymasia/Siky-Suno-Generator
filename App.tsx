
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Music, Wand2, RefreshCw, Zap, Disc, Piano, Dices, Layers, Sparkles, Sliders, Mic, X, Save, Trash2, FolderOpen, Settings2, GanttChartSquare, ChevronDown, ChevronUp, PenTool, AlertCircle, Search, ZapOff, Languages, Loader2, Plus, Sparkle, Smile, Mic2, Waves, Trophy, Check, Timer, Filter, MessageSquareQuote } from 'lucide-react';
import { GENRES, SONG_LENGTHS, LENGTH_PRESETS, GENRE_INSTRUMENTS, GENRE_BPM_RANGES, GENRE_SOUND_DESIGN, GENRE_MIX_MASTER, GENERIC_AUTOMATIONS, PRO_MIX_TECHNIQUES, MASTERING_STYLES, INTRO_STYLES, INTRO_BUILDUPS, ARRANGEMENT_TYPES, BRIDGE_STYLES, SECTION_ENERGY, OUTRO_STYLES, OUTRO_FADES, BREAKDOWN_TYPES, BREAKDOWN_INTENSITIES, MOODS, VOCAL_STYLES, VOCAL_EFFECTS, INSTRUMENT_ROLES, MUSICAL_KEYS, INSTRUMENT_INTENSITIES, ROLE_DESCRIPTIONS, VOCAL_STYLE_DESCRIPTIONS, STRUCTURE_DESCRIPTIONS } from './constants';
import { generateSunoPrompt, generateTrackTitle, generateLyricSuggestions } from './services/geminiService';
import { SunoPrompt, GenreOption, SongLength, GenreWeight, InstrumentSettings, Preset, LengthPreset } from './types';
import { Button, CopyButton, LoadingSpinner, Tooltip } from './components/UiComponents';
import { TRANSLATIONS, Language } from './translations';

const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  activeCount?: number;
  onRandomize?: (e: React.MouseEvent) => void;
  accentColor?: string;
}> = ({ title, icon: Icon, children, defaultOpen = false, activeCount = 0, onRandomize, accentColor = "text-green-500" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg mb-2 shadow-sm relative z-10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-900/20 hover:bg-zinc-800/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2 font-semibold text-zinc-300 text-xs uppercase tracking-wide">
          <Icon size={14} className={isOpen || activeCount > 0 ? accentColor : "text-zinc-500"} />
          {title}
        </div>
        <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className={`text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 ${accentColor.replace('text-', 'text- opacity-80')}`}>
                {activeCount}
              </span>
            )}
            {onRandomize && (
              <div 
                onClick={(e) => { e.stopPropagation(); onRandomize(e); }}
                className="p-1.5 text-zinc-500 hover:text-yellow-400 transition-all rounded hover:bg-zinc-800 active:scale-90"
                title="Randomizza Sezione"
              >
                <Dices size={14} />
              </div>
            )}
            {isOpen ? <ChevronUp size={14} className="text-zinc-600" /> : <ChevronDown size={14} className="text-zinc-600" />}
        </div>
      </button>
      {isOpen && (
        <div className="p-3 border-t border-zinc-800/50 bg-black/20 rounded-b-lg overflow-visible">
          {children}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  // --- States ---
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('siky_lang');
    return (saved as Language) || 'it';
  });

  const t = TRANSLATIONS[lang];

  const [selectedGenres, setSelectedGenres] = useState<GenreOption[]>([GENRES[0]]);
  const [genreWeights, setGenreWeights] = useState<Record<string, number>>({ [GENRES[0].id]: 100 });
  const [selectedLength, setSelectedLength] = useState<SongLength>('Medium');
  const [selectedLengthPresetId, setSelectedLengthPresetId] = useState<string>('');
  const [selectedInstruments, setSelectedInstruments] = useState<InstrumentSettings[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedVocals, setSelectedVocals] = useState<string[]>([]);
  const [selectedVocalEffects, setSelectedVocalEffects] = useState<string[]>([]);
  const [selectedSoundDesign, setSelectedSoundDesign] = useState<string[]>([]);
  const [selectedAutomations, setSelectedAutomations] = useState<string[]>([]);
  const [selectedMasteringStyle, setSelectedMasteringStyle] = useState<string>('Standard');
  
  const [selectedIntroStyle, setSelectedIntroStyle] = useState<string>('Standard');
  const [selectedIntroBuildup, setSelectedIntroBuildup] = useState<string>('Standard');
  const [selectedArrangement, setSelectedArrangement] = useState<string>(ARRANGEMENT_TYPES[0]);
  const [selectedBridgeStyle, setSelectedBridgeStyle] = useState<string>(BRIDGE_STYLES[0]);
  const [verseEnergy, setVerseEnergy] = useState<string>('Steady');
  const [chorusEnergy, setChorusEnergy] = useState<string>('Rising');
  const [selectedOutroStyle, setSelectedOutroStyle] = useState<string>('Standard');
  const [selectedOutroFade, setSelectedOutroFade] = useState<string>('Standard');
  const [selectedBreakdownType, setSelectedBreakdownType] = useState<string>('Standard');
  const [selectedBreakdownIntensity, setSelectedBreakdownIntensity] = useState<string>('Standard');

  const [lyricsTheme, setLyricsTheme] = useState<string>('');
  const [lyricSuggestions, setLyricSuggestions] = useState<string[]>([]);
  const [isSuggestingLyrics, setIsSuggestingLyrics] = useState(false);
  
  const [selectedKey, setSelectedKey] = useState<string>('Any Key');
  const [bpm, setBpm] = useState<number>(124);
  const [isManualBpm, setIsManualBpm] = useState(false);
  const [promptData, setPromptData] = useState<SunoPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegeneratingTitle, setIsRegeneratingTitle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  const [showInstrumentLibrary, setShowInstrumentLibrary] = useState(false);
  const [instrumentSearch, setInstrumentSearch] = useState('');
  const [customInstrumentName, setCustomInstrumentName] = useState('');

  // --- Preset States ---
  const [presets, setPresets] = useState<Preset[]>(() => {
    const saved = localStorage.getItem('siky_presets');
    return saved ? JSON.parse(saved) : [];
  });
  const [newPresetName, setNewPresetName] = useState('');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('siky_lang', lang);
  }, [lang]);

  useEffect(() => {
    const storedAuth = localStorage.getItem('siky_auth');
    if (storedAuth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Sikymusic25') {
      setIsAuthenticated(true);
      setLoginError(false);
      localStorage.setItem('siky_auth', 'true');
    } else {
      setLoginError(true);
      setPasswordInput('');
    }
  };

  useEffect(() => {
    if (!isManualBpm && selectedGenres.length > 0) {
      const primaryGenreId = selectedGenres[0].id;
      const range = GENRE_BPM_RANGES[primaryGenreId];
      if (range) setBpm(range.default);
    }
  }, [selectedGenres, isManualBpm]);

  // --- Memos ---
  const allAvailableInstruments = useMemo(() => Array.from(new Set(Object.values(GENRE_INSTRUMENTS).flat())).sort(), []);
  
  const filteredInstruments = useMemo(() => {
    if (!instrumentSearch) return allAvailableInstruments;
    const search = instrumentSearch.toLowerCase();
    return allAvailableInstruments.filter(i => i.toLowerCase().includes(search));
  }, [allAvailableInstruments, instrumentSearch]);

  const getWeightedSuggestions = useCallback((record: Record<string, string[]>) => {
    const scores: Record<string, number> = {};
    selectedGenres.forEach(genre => {
      const weight = genreWeights[genre.id] || 50;
      const normalizedWeight = Math.pow(weight / 100, 2) * 100;
      const items = record[genre.id] || [];
      items.forEach(item => {
        const synergyBonus = scores[item] ? 1.5 : 1.0;
        scores[item] = (scores[item] || 0) + (normalizedWeight * synergyBonus);
      });
    });
    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1]) 
      .map(entry => entry[0]);
  }, [selectedGenres, genreWeights]);

  const suggestedInstruments = useMemo(() => getWeightedSuggestions(GENRE_INSTRUMENTS), [getWeightedSuggestions]);
  const suggestedSoundDesign = useMemo(() => getWeightedSuggestions(GENRE_SOUND_DESIGN), [getWeightedSuggestions]);

  const allAvailableSoundDesign = useMemo(() => Array.from(new Set(Object.values(GENRE_SOUND_DESIGN).flat())).sort(), []);
  const allAvailableAutomations = useMemo(() => Array.from(new Set([...Object.values(GENRE_MIX_MASTER).flat(), ...GENERIC_AUTOMATIONS])).sort(), []);

  // --- Handlers ---
  const toggleGenre = (genre: GenreOption) => {
    const isAlreadySelected = selectedGenres.some(g => g.id === genre.id);
    if (isAlreadySelected) {
      if (selectedGenres.length === 1) return;
      setSelectedGenres(prev => prev.filter(g => g.id !== genre.id));
      setGenreWeights(prev => { const next = { ...prev }; delete next[genre.id]; return next; });
    } else {
      if (selectedGenres.length >= 3) return;
      setSelectedGenres(prev => [...prev, genre]);
      setGenreWeights(prev => ({ ...prev, [genre.id]: 100 }));
    }
  };

  const applyLengthPreset = (preset: LengthPreset) => {
    setSelectedLengthPresetId(preset.id);
    setSelectedLength(preset.length);
    if (preset.arrangement) setSelectedArrangement(preset.arrangement);
    if (preset.intro) setSelectedIntroStyle(preset.intro);
    if (preset.outro) setSelectedOutroStyle(preset.outro);
    if (preset.breakdown) setSelectedBreakdownType(preset.breakdown);
  };

  const updateGenreWeight = (id: string, weight: number) => {
    setGenreWeights(prev => ({ ...prev, [id]: weight }));
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]);
  };

  const toggleVocal = (vocal: string) => {
    setSelectedVocals(prev => prev.includes(vocal) ? prev.filter(v => v !== vocal) : [...prev, vocal]);
  };

  const toggleVocalEffect = (effect: string) => {
    setSelectedVocalEffects(prev => prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]);
  };

  const updateInstrumentRole = (instName: string, role: string) => {
    setSelectedInstruments(prev => prev.map(i => i.name === instName ? { ...i, role } : i));
  };

  const updateInstrumentIntensity = (instName: string, intensityValue: string) => {
    setSelectedInstruments(prev => prev.map(i => i.name === instName ? { ...i, intensity: intensityValue } : i));
  };

  const getIntensityLabel = (value: string) => {
    const v = parseInt(value);
    switch(v) {
      case 1: return "Ghostly/Background";
      case 2: return "Subtle/Support";
      case 3: return "Standard/Balanced";
      case 4: return "Prominent/Main";
      case 5: return "Lead/Feature";
      default: return "Standard";
    }
  };

  const addInstrument = (name: string) => {
    const isAlreadySelected = selectedInstruments.some(i => i.name.toLowerCase() === name.toLowerCase());
    if (!isAlreadySelected) {
      setSelectedInstruments(prev => [...prev, { 
        name: name.trim(), 
        role: name.toLowerCase().includes('bass') ? 'Bass' : (name.toLowerCase().includes('lead') ? 'Lead' : 'Feature'), 
        intensity: '3' 
      }]);
    }
  };

  const addCustomInstrument = () => {
    if (!customInstrumentName.trim()) return;
    addInstrument(customInstrumentName);
    setCustomInstrumentName('');
  };

  const autoFillInstruments = () => {
    const topSuggestions = suggestedInstruments.slice(0, 4);
    const newInstruments = topSuggestions.map(name => ({
      name,
      role: name.toLowerCase().includes('bass') ? 'Bass' : (name.toLowerCase().includes('lead') ? 'Lead' : 'Feature'),
      intensity: '4'
    }));
    setSelectedInstruments(newInstruments);
  };

  const randomizeGenres = useCallback(() => {
    const shuffled = [...GENRES].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 3) + 1;
    const randoms = shuffled.slice(0, count);
    const weights: Record<string, number> = {};
    randoms.forEach(g => weights[g.id] = Math.floor(Math.random() * 60) + 40);
    setSelectedGenres(randoms);
    setGenreWeights(weights);
  }, []);

  const randomizeSettings = useCallback(() => {
    const primaryGenreId = selectedGenres[0]?.id || 'house';
    const range = GENRE_BPM_RANGES[primaryGenreId] || { min: 80, max: 140, default: 120 };
    setSelectedLength(SONG_LENGTHS[Math.floor(Math.random() * SONG_LENGTHS.length)].id);
    setSelectedLengthPresetId('');
    setSelectedKey(MUSICAL_KEYS[Math.floor(Math.random() * MUSICAL_KEYS.length)]);
    setBpm(Math.floor(Math.random() * (range.max - range.min)) + range.min);
    setIsManualBpm(true);
  }, [selectedGenres]);

  const randomizeTheme = useCallback(() => {
    const themes = ["Digital love in a cyberpunk Tokyo", "Ocean waves crashing on a distant planet", "A mysterious forest at midnight", "Summer sunset at a rooftop party"];
    setLyricsTheme(themes[Math.floor(Math.random() * themes.length)]);
    setLyricSuggestions([]);
  }, []);

  const randomizeMoods = useCallback(() => {
    const shuffled = [...MOODS].sort(() => 0.5 - Math.random());
    setSelectedMoods(shuffled.slice(0, Math.floor(Math.random() * 4) + 1));
  }, []);

  const randomizeVocals = useCallback(() => {
    const shuffledVocals = [...VOCAL_STYLES].sort(() => 0.5 - Math.random());
    setSelectedVocals(shuffledVocals.slice(0, Math.floor(Math.random() * 2) + 1));
    const shuffledFx = [...VOCAL_EFFECTS].sort(() => 0.5 - Math.random());
    setSelectedVocalEffects(shuffledFx.slice(0, Math.floor(Math.random() * 3)));
  }, []);

  const randomizeSoundDesign = useCallback(() => {
    const shuffled = [...suggestedSoundDesign].sort(() => 0.5 - Math.random());
    setSelectedSoundDesign(shuffled.slice(0, Math.floor(Math.random() * 3) + 1));
  }, [suggestedSoundDesign]);

  const randomizeAutomation = useCallback(() => {
    const shuffled = [...PRO_MIX_TECHNIQUES, ...allAvailableAutomations].sort(() => 0.5 - Math.random());
    setSelectedAutomations(shuffled.slice(0, Math.floor(Math.random() * 3) + 1));
  }, [allAvailableAutomations]);

  const randomizeStructure = useCallback(() => {
    const primaryGenreId = selectedGenres[0]?.id || 'house';
    const isElectronic = ['house', 'techno', 'trance', 'dubstep', 'dnb', 'synthwave', 'edm'].includes(primaryGenreId);
    const isUrban = ['reggaeton', 'dancehall', 'hiphop', 'trap', 'drill'].includes(primaryGenreId);
    const isAcoustic = ['rock', 'metal', 'country', 'jazz', 'blues', 'latin', 'soul', 'funk', 'disco', 'rnb'].includes(primaryGenreId);
    const isCinematic = ['ambient', 'cinematic', 'epic'].includes(primaryGenreId);

    const filterByGenre = (array: string[], genreMatch: string[], prob: number = 0.7) => {
      const match = array.filter(item => genreMatch.some(g => item.toLowerCase().includes(g.toLowerCase())));
      return Math.random() < prob && match.length > 0 
        ? match[Math.floor(Math.random() * match.length)] 
        : array[Math.floor(Math.random() * array.length)];
    };

    if (isElectronic) setSelectedIntroStyle(filterByGenre(INTRO_STYLES, ['DJ Intro', 'Atmospheric', 'Drum Fill']));
    else if (isUrban) setSelectedIntroStyle(filterByGenre(INTRO_STYLES, ['Acappella', 'Spoken', 'Short']));
    else if (isAcoustic) setSelectedIntroStyle(filterByGenre(INTRO_STYLES, ['Guitar Riff', 'Drum Fill', 'Standard']));
    else setSelectedIntroStyle(INTRO_STYLES[Math.floor(Math.random() * INTRO_STYLES.length)]);

    if (isElectronic || isCinematic) setSelectedIntroBuildup(filterByGenre(INTRO_BUILDUPS, ['Long', 'Medium']));
    else setSelectedIntroBuildup(filterByGenre(INTRO_BUILDUPS, ['Short', 'Standard']));

    if (isElectronic) setSelectedArrangement(filterByGenre(ARRANGEMENT_TYPES, ['Club', 'Progressive']));
    else if (isCinematic) setSelectedArrangement(filterByGenre(ARRANGEMENT_TYPES, ['Trailer', 'Linear']));
    else if (isAcoustic) setSelectedArrangement(filterByGenre(ARRANGEMENT_TYPES, ['Acoustic', 'Pop Classic']));
    else setSelectedArrangement(ARRANGEMENT_TYPES[Math.floor(Math.random() * ARRANGEMENT_TYPES.length)]);

    setSelectedBridgeStyle(BRIDGE_STYLES[Math.floor(Math.random() * BRIDGE_STYLES.length)]);
    setVerseEnergy(SECTION_ENERGY[Math.floor(Math.random() * SECTION_ENERGY.length)]);
    setChorusEnergy(SECTION_ENERGY[Math.floor(Math.random() * SECTION_ENERGY.length)]);

    if (isElectronic) setSelectedOutroStyle(filterByGenre(OUTRO_STYLES, ['DJ Loop', 'Ambient Decay']));
    else if (isUrban) setSelectedOutroStyle(filterByGenre(OUTRO_STYLES, ['Hard Stop', 'Glitch']));
    else setSelectedOutroStyle(OUTRO_STYLES[Math.floor(Math.random() * OUTRO_STYLES.length)]);

    setSelectedOutroFade(OUTRO_FADES[Math.floor(Math.random() * OUTRO_FADES.length)]);

    if (isElectronic) setSelectedBreakdownType(filterByGenre(BREAKDOWN_TYPES, ['Energy Build', 'Stripped']));
    else if (isCinematic) setSelectedBreakdownType(filterByGenre(BREAKDOWN_TYPES, ['Orchestral', 'Melodic']));
    else setSelectedBreakdownType(BREAKDOWN_TYPES[Math.floor(Math.random() * BREAKDOWN_TYPES.length)]);

    if (isElectronic || isCinematic) setSelectedBreakdownIntensity(filterByGenre(BREAKDOWN_INTENSITIES, ['High', 'Medium']));
    else setSelectedBreakdownIntensity(filterByGenre(BREAKDOWN_INTENSITIES, ['Low', 'Standard']));
  }, [selectedGenres]);

  const randomizeInstruments = useCallback(() => {
    const source = suggestedInstruments.length > 0 ? suggestedInstruments : allAvailableInstruments;
    const shuffled = [...source].sort(() => 0.5 - Math.random());
    setSelectedInstruments(shuffled.slice(0, Math.floor(Math.random() * 3) + 2).map(name => ({
      name,
      role: INSTRUMENT_ROLES[Math.floor(Math.random() * INSTRUMENT_ROLES.length)],
      intensity: (Math.floor(Math.random() * 5) + 1).toString()
    })));
  }, [allAvailableInstruments, suggestedInstruments]);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const weightedGenres: GenreWeight[] = selectedGenres.map(g => ({
        name: g.label,
        weight: genreWeights[g.id] || 50
      }));
      const result = await generateSunoPrompt(
        weightedGenres, selectedLength, selectedInstruments, selectedMoods, selectedVocals, selectedVocalEffects,
        selectedKey, bpm, selectedSoundDesign, selectedAutomations, selectedIntroStyle, selectedIntroBuildup,
        selectedOutroStyle, selectedOutroFade, selectedBreakdownType, selectedBreakdownIntensity, 
        selectedArrangement, selectedBridgeStyle, verseEnergy, chorusEnergy, lyricsTheme, selectedMasteringStyle
      );
      setPromptData(result);
    } catch (err: any) {
      setError(err?.message || "Errore imprevisto nella generazione.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedGenres, selectedLength, selectedInstruments, selectedMoods, selectedVocals, selectedVocalEffects, genreWeights, selectedKey, bpm, selectedSoundDesign, selectedAutomations, selectedIntroStyle, selectedIntroBuildup, selectedOutroStyle, selectedOutroFade, selectedBreakdownType, selectedBreakdownIntensity, selectedArrangement, selectedBridgeStyle, verseEnergy, chorusEnergy, lyricsTheme, selectedMasteringStyle]);

  const handleRandomizeAll = useCallback(() => {
    randomizeGenres();
    randomizeSettings();
    randomizeTheme();
    randomizeMoods();
    randomizeVocals();
    randomizeSoundDesign();
    randomizeAutomation();
    randomizeStructure();
    randomizeInstruments();
    setSelectedMasteringStyle(MASTERING_STYLES[Math.floor(Math.random() * MASTERING_STYLES.length)]);
    setTimeout(() => handleGenerate(), 100);
  }, [randomizeGenres, randomizeSettings, randomizeTheme, randomizeMoods, randomizeVocals, randomizeSoundDesign, randomizeAutomation, randomizeStructure, randomizeInstruments, handleGenerate]);

  const handleRegenerateTitle = useCallback(async () => {
    if (!promptData) return;
    setIsRegeneratingTitle(true);
    try {
      const newTitle = await generateTrackTitle(promptData.genre, promptData.vibeDescription);
      setPromptData(prev => prev ? { ...prev, title: newTitle } : null);
    } catch (err) {
      console.error("Errore nella rigenerazione del titolo:", err);
    } finally {
      setIsRegeneratingTitle(false);
    }
  }, [promptData]);

  const handleGetLyricSuggestions = useCallback(async () => {
    setIsSuggestingLyrics(true);
    try {
      const genres = selectedGenres.map(g => g.label);
      const suggestions = await generateLyricSuggestions(genres, selectedMoods, lyricsTheme);
      setLyricSuggestions(suggestions);
    } catch (err) {
      console.error("Error getting suggestions:", err);
    } finally {
      setIsSuggestingLyrics(false);
    }
  }, [selectedGenres, selectedMoods, lyricsTheme]);

  const appendLyricSuggestion = (suggestion: string) => {
    setLyricsTheme(prev => prev ? prev + "\n\n" + suggestion : suggestion);
    setLyricSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const savePreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: Preset = {
      id: Date.now().toString(), name: newPresetName, selectedGenres, genreWeights, selectedLength, selectedInstruments,
      selectedMoods, selectedVocals, selectedVocalEffects, selectedSoundDesign, selectedAutomations, selectedIntroStyle,
      selectedIntroBuildup, selectedArrangement, selectedBridgeStyle, verseEnergy, chorusEnergy, selectedOutroStyle,
      selectedOutroFade, selectedBreakdownType, selectedBreakdownIntensity, selectedKey, selectedBpm: bpm, lyricsTheme,
      selectedMasteringStyle, selectedLengthPresetId
    };
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('siky_presets', JSON.stringify(updatedPresets));
    setNewPresetName('');
  };

  const loadPreset = (preset: Preset) => {
    setSelectedGenres(preset.selectedGenres); setGenreWeights(preset.genreWeights); setSelectedLength(preset.selectedLength);
    setSelectedInstruments(preset.selectedInstruments); setSelectedMoods(preset.selectedMoods); setSelectedVocals(preset.selectedVocals);
    setSelectedVocalEffects(preset.selectedVocalEffects); setSelectedSoundDesign(preset.selectedSoundDesign || []);
    setSelectedAutomations(preset.selectedAutomations || []); setSelectedIntroStyle(preset.selectedIntroStyle || 'Standard');
    setSelectedIntroBuildup(preset.selectedIntroBuildup || 'Standard'); setSelectedArrangement(preset.selectedArrangement || ARRANGEMENT_TYPES[0]);
    setSelectedBridgeStyle(preset.selectedBridgeStyle || BRIDGE_STYLES[0]); setVerseEnergy(preset.verseEnergy || 'Steady');
    setChorusEnergy(preset.chorusEnergy || 'Rising'); setSelectedOutroStyle(preset.selectedOutroStyle || 'Standard');
    setSelectedOutroFade(preset.selectedOutroFade || 'Standard'); setSelectedBreakdownType(preset.selectedBreakdownType || 'Standard');
    setSelectedBreakdownIntensity(preset.selectedBreakdownIntensity || 'Standard'); setSelectedKey(preset.selectedKey || 'Any Key');
    setBpm(preset.selectedBpm || 120); setIsManualBpm(true); setLyricsTheme(preset.lyricsTheme || '');
    setSelectedMasteringStyle(preset.selectedMasteringStyle || 'Standard');
    setSelectedLengthPresetId(preset.selectedLengthPresetId || '');
  };

  const deletePreset = (id: string) => {
    const updatedPresets = presets.filter(p => p.id !== id);
    setPresets(updatedPresets);
    localStorage.setItem('siky_presets', JSON.stringify(updatedPresets));
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-2 md:p-6 relative font-sans overflow-x-hidden">
       <div className="fixed inset-0 z-0 pointer-events-none bg-black">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-green-900/10 blur-[140px] rounded-full mix-blend-screen" />
          <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[140px] rounded-full mix-blend-screen" />
       </div>

      {!isAuthenticated ? (
        <div className="h-screen flex items-center justify-center relative z-50 px-4">
          <div className="max-w-md w-full bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl backdrop-blur-xl shadow-2xl">
            <div className="text-center mb-8">
              <Disc className="w-12 h-12 text-green-500 mx-auto mb-4 animate-spin-slow" />
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-red-500 mb-2">SIKY Suno</h1>
              <p className="text-zinc-500 text-sm">{t.login_desc}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-center tracking-widest outline-none focus:border-green-500 transition-all uppercase" placeholder={t.access_key} />
              <Button onClick={() => {}} className="w-full uppercase tracking-widest text-sm font-black">{t.unlock}</Button>
              {loginError && <p className="text-red-500 text-xs text-center font-bold">{t.login_error}</p>}
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto relative z-10">
          <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl"><Disc className="w-10 h-10 text-green-500 animate-spin-slow" /></div>
              <div>
                <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-yellow-400 to-red-600 tracking-tight">{t.app_title}</h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{t.app_subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl shadow-xl backdrop-blur-md">
                 {(['en', 'it', 'es', 'fr'] as Language[]).map((l) => (
                   <button key={l} onClick={() => setLang(l)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${lang === l ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>{l}</button>
                 ))}
               </div>
               <button onClick={handleRandomizeAll} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 border border-yellow-400/30 rounded-2xl text-black font-black uppercase tracking-tighter transition-all active:scale-95 shadow-lg shadow-yellow-500/10 text-sm group">
                  <Dices size={20} className="group-hover:rotate-12 transition-transform" /> {t.randomize_all}
               </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 space-y-3">
              <CollapsibleSection title={t.presets} icon={FolderOpen} activeCount={presets.length}>
                <div className="space-y-4 overflow-visible">
                  <div className="flex items-center gap-2 bg-black/40 border border-zinc-800 p-2 rounded-xl">
                    <input type="text" value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} placeholder="Nome nuovo preset..." className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs flex-1 focus:border-green-500 outline-none transition-all" />
                    <button onClick={savePreset} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-[10px] font-black uppercase rounded-lg transition-colors"><Save size={14} /> {t.save_preset}</button>
                  </div>
                  {presets.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                      {presets.map(p => (
                        <div key={p.id} className="group flex items-center justify-between gap-2 bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 hover:border-zinc-700 transition-all hover:bg-zinc-800/20">
                          <span className="text-[11px] font-bold text-zinc-300 truncate flex-1 uppercase tracking-tight">{p.name}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => loadPreset(p)} className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black text-zinc-400 hover:text-white rounded-lg uppercase tracking-tighter transition-colors">{t.load}</button>
                            <button onClick={() => deletePreset(p.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors bg-black/20 rounded-lg"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-[10px] text-zinc-600 text-center py-4 border border-dashed border-zinc-800 rounded-xl uppercase font-bold italic">Nessun preset salvato</p>}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.genres} icon={Music} defaultOpen={true} activeCount={selectedGenres.length} onRandomize={randomizeGenres}>
                <div className="space-y-4 overflow-visible">
                  <div className="grid grid-cols-3 gap-1.5 overflow-visible">
                    {GENRES.map(g => (
                      <Tooltip key={g.id} content={g.description || 'Stile musicale per la base Suno.'}>
                        <button onClick={() => toggleGenre(g)} className={`w-full px-2 py-2 rounded-lg text-[10px] font-black border uppercase tracking-tighter transition-all truncate ${selectedGenres.some(sg => sg.id === g.id) ? 'bg-green-600 border-transparent text-white shadow-lg shadow-green-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}>{g.label}</button>
                      </Tooltip>
                    ))}
                  </div>
                  {selectedGenres.length > 1 && (
                    <div className="space-y-3 pt-3 border-t border-zinc-800/50">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block pl-1">Bilanciamento Cross-Genre</span>
                      {selectedGenres.map(g => (
                        <div key={g.id} className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight"><span className="text-zinc-400">{g.label}</span><span className="text-green-500">{genreWeights[g.id] || 50}%</span></div>
                          <input type="range" min="10" max="100" value={genreWeights[g.id] || 50} onChange={(e) => updateGenreWeight(g.id, parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.base_params} icon={Settings2} defaultOpen={true} onRandomize={randomizeSettings}>
                <div className="space-y-4 overflow-visible">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block pl-1">{t.length_presets}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {LENGTH_PRESETS.map(preset => (
                        <button 
                          key={preset.id} 
                          onClick={() => applyLengthPreset(preset)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] border font-black uppercase transition-all ${selectedLengthPresetId === preset.id ? 'bg-zinc-800 border-green-500 text-green-400' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                        >
                          <Timer size={12} />
                          <span className="truncate">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/30">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block pl-1">{t.length}</label>
                        <select 
                          value={selectedLength} 
                          onChange={(e) => {
                            setSelectedLength(e.target.value as SongLength);
                            setSelectedLengthPresetId(''); 
                          }} 
                          className="w-full bg-black border border-zinc-800 text-xs rounded-xl p-2.5 outline-none hover:border-zinc-700 transition-colors font-bold uppercase"
                        >
                          {SONG_LENGTHS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block pl-1">{t.key}</label>
                        <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} className="w-full bg-black border border-zinc-800 text-xs rounded-xl p-2.5 outline-none hover:border-zinc-700 transition-colors font-bold uppercase">{MUSICAL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}</select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1"><label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">{t.bpm}</label><span className="text-xs font-mono text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-lg border border-green-500/20">{bpm}</span></div>
                    <input type="range" min="60" max="220" value={bpm} onChange={(e) => { setBpm(parseInt(e.target.value)); setIsManualBpm(true); }} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500" />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.mastering_polish} icon={Trophy} accentColor="text-amber-500" defaultOpen={false}>
                <div className="grid grid-cols-1 gap-2 overflow-visible">
                  {MASTERING_STYLES.map(style => (
                    <button 
                      key={style} 
                      onClick={() => setSelectedMasteringStyle(style)} 
                      className={`px-3 py-2.5 rounded-xl text-[10px] border font-black uppercase text-left transition-all relative overflow-hidden group/m ${selectedMasteringStyle === style ? 'bg-amber-600 border-transparent text-white shadow-lg shadow-amber-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-amber-700/50'}`}
                    >
                      <div className="relative z-10 flex items-center justify-between">
                        <span>{style}</span>
                        {selectedMasteringStyle === style && <Check size={12} />}
                      </div>
                      {selectedMasteringStyle === style && <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent" />}
                    </button>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.theme_lyrics} icon={PenTool} onRandomize={randomizeTheme} defaultOpen={false}>
                <div className="space-y-4">
                  <textarea value={lyricsTheme} onChange={(e) => setLyricsTheme(e.target.value)} placeholder={t.theme_placeholder} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-xs h-28 outline-none focus:border-green-500 resize-none transition-all placeholder:text-zinc-700 font-medium" />
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleGetLyricSuggestions} 
                      disabled={isSuggestingLyrics}
                      className="flex items-center justify-center gap-2 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-[10px] font-black uppercase rounded-xl transition-all border border-zinc-700"
                    >
                      {isSuggestingLyrics ? <RefreshCw className="w-3 h-3 animate-spin" /> : <MessageSquareQuote size={14} className="text-yellow-500" />}
                      {t.get_lyric_suggestions}
                    </button>
                    
                    {lyricSuggestions.length > 0 && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        {lyricSuggestions.map((suggestion, idx) => (
                          <div key={idx} className="group relative bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 hover:border-zinc-600 transition-all">
                            <p className="text-[10px] text-zinc-400 font-medium italic mb-2 leading-relaxed">"{suggestion}"</p>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => appendLyricSuggestion(suggestion)}
                                className="text-[9px] font-black text-green-500 uppercase flex items-center gap-1 hover:text-green-400 transition-colors"
                              >
                                <Plus size={10} /> {t.add_suggestion}
                              </button>
                              <button 
                                onClick={() => setLyricSuggestions(prev => prev.filter((_, i) => i !== idx))}
                                className="text-[9px] font-black text-zinc-600 uppercase flex items-center gap-1 hover:text-red-500 transition-colors"
                              >
                                <X size={10} /> {t.dismiss}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-zinc-600 italic px-1">{t.theme_helper}</p>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.mood} icon={Smile} activeCount={selectedMoods.length} onRandomize={randomizeMoods} defaultOpen={false}>
                <div className="flex flex-wrap gap-1.5 overflow-visible">
                  {MOODS.map(mood => (
                    <button 
                      key={mood} 
                      onClick={() => toggleMood(mood)} 
                      className={`px-2.5 py-1.5 rounded-lg text-[9px] border font-black uppercase transition-all ${selectedMoods.includes(mood) ? 'bg-yellow-600 border-transparent text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.vocals} icon={Mic2} activeCount={selectedVocals.length} onRandomize={randomizeVocals} defaultOpen={false}>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5 overflow-visible">
                    {VOCAL_STYLES.map(vocal => (
                      <Tooltip key={vocal} content={VOCAL_STYLE_DESCRIPTIONS[vocal] || vocal}>
                        <button 
                          onClick={() => toggleVocal(vocal)} 
                          className={`px-2.5 py-1.5 rounded-lg text-[9px] border font-black uppercase transition-all ${selectedVocals.includes(vocal) ? 'bg-fuchsia-600 border-transparent text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                        >
                          {vocal}
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.vocal_effects} icon={Waves} activeCount={selectedVocalEffects.length} defaultOpen={false}>
                <div className="grid grid-cols-2 gap-2 overflow-visible">
                  {VOCAL_EFFECTS.map(effect => (
                    <button 
                      key={effect} 
                      onClick={() => toggleVocalEffect(effect)} 
                      className={`px-2.5 py-2 rounded-lg text-[10px] border font-black uppercase transition-all ${selectedVocalEffects.includes(effect) ? 'bg-indigo-600 border-transparent text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                    >
                      {effect}
                    </button>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.structure} icon={GanttChartSquare} onRandomize={randomizeStructure} defaultOpen={false}>
                <div className="space-y-6 overflow-visible">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">{t.arrangement}</label>
                      <select value={selectedArrangement} onChange={(e) => setSelectedArrangement(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-[10px] font-bold uppercase outline-none mb-2">
                        {ARRANGEMENT_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                   </div>
                   <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">{t.intro_design}</label>
                      <select value={selectedIntroStyle} onChange={(e) => setSelectedIntroStyle(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-[10px] font-bold uppercase outline-none mb-2">{INTRO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[8px] font-black text-zinc-600 uppercase pl-1">Intro Build-up Length</span>
                        <div className="flex bg-black rounded-xl p-1 border border-zinc-800">
                          {INTRO_BUILDUPS.filter(b => b !== 'Standard').map(b => (
                            <button key={b} onClick={() => setSelectedIntroBuildup(b)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedIntroBuildup === b ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800/50">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">{t.energy_verse}</label>
                        <select value={verseEnergy} onChange={(e) => setVerseEnergy(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-2 text-[10px] font-bold uppercase outline-none">
                          {SECTION_ENERGY.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">{t.energy_chorus}</label>
                        <select value={chorusEnergy} onChange={(e) => setChorusEnergy(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-2 text-[10px] font-bold uppercase outline-none">
                          {SECTION_ENERGY.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                   </div>
                   <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">{t.bridge_style}</label>
                      <select value={selectedBridgeStyle} onChange={(e) => setSelectedBridgeStyle(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-[10px] font-bold uppercase outline-none">
                        {BRIDGE_STYLES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                   </div>
                   <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">{t.breakdown_style}</label>
                      <select value={selectedBreakdownType} onChange={(e) => setSelectedBreakdownType(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-[10px] font-bold uppercase outline-none mb-2">{BREAKDOWN_TYPES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[8px] font-black text-zinc-600 uppercase pl-1">Breakdown {t.intensity}</span>
                        <div className="flex bg-black rounded-xl p-1 border border-zinc-800">
                          {BREAKDOWN_INTENSITIES.filter(i => i !== 'Standard').map(i => (
                            <button key={i} onClick={() => setSelectedBreakdownIntensity(i)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedBreakdownIntensity === i ? 'bg-red-900/40 text-red-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
                              {i}
                            </button>
                          ))}
                        </div>
                      </div>
                   </div>
                   <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">{t.outro_design}</label>
                      <select value={selectedOutroStyle} onChange={(e) => setSelectedOutroStyle(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-[10px] font-bold uppercase outline-none mb-2">{OUTRO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[8px] font-black text-zinc-600 uppercase pl-1">Outro Fade Type</span>
                        <div className="flex bg-black rounded-xl p-1 border border-zinc-800">
                          {OUTRO_FADES.filter(f => f !== 'Standard').map(f => (
                            <button key={f} onClick={() => setSelectedOutroFade(f)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedOutroFade === f ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                              {f.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                   </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.mix_automation} icon={Sliders} activeCount={selectedAutomations.length} onRandomize={randomizeAutomation} defaultOpen={false}>
                <div className="space-y-6 overflow-visible">
                  <div className="space-y-2">
                    <span className="text-[9px] text-cyan-400 uppercase font-black tracking-widest block pl-1">Pro Mix Bus & Master</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PRO_MIX_TECHNIQUES.map(tech => (
                        <button 
                          key={tech} 
                          onClick={() => setSelectedAutomations(prev => prev.includes(tech) ? prev.filter(i => i !== tech) : [...prev, tech])}
                          className={`px-2.5 py-2 rounded-lg text-[9px] border font-black uppercase transition-all ${selectedAutomations.includes(tech) ? 'bg-cyan-600 border-transparent text-white shadow-lg shadow-cyan-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-cyan-700/50'}`}
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-zinc-800/50">
                    <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest block pl-1">General Automations</span>
                    <div className="flex flex-wrap gap-1.5">
                      {allAvailableAutomations.filter(a => !PRO_MIX_TECHNIQUES.includes(a)).map(a => (
                        <Tooltip key={a} content="Tecnica di mixaggio o automazione dinamica.">
                          <button 
                            onClick={() => setSelectedAutomations(prev => prev.includes(a) ? prev.filter(i => i !== a) : [...prev, a])} 
                            className={`px-2.5 py-1.5 rounded-lg text-[9px] border font-black uppercase transition-all ${selectedAutomations.includes(a) ? 'bg-zinc-700 border-transparent text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                          >
                            {a}
                          </button>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.instruments} icon={Piano} activeCount={selectedInstruments.length} onRandomize={randomizeInstruments} defaultOpen={true}>
                <div className="space-y-5 overflow-visible">
                  <div className="flex gap-2">
                    <button onClick={autoFillInstruments} className="flex-1 py-2 bg-green-900/20 border border-green-800/40 text-green-400 text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-2 hover:bg-green-900/30 transition-all"><Sparkle size={12}/> {t.suggested}</button>
                    <button 
                      onClick={() => setShowInstrumentLibrary(!showInstrumentLibrary)} 
                      className={`flex-1 py-2 border text-[10px] font-black uppercase rounded-xl flex items-center justify-center gap-2 transition-all ${showInstrumentLibrary ? 'bg-zinc-100 text-black border-zinc-100' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                    >
                      <Filter size={12}/> {t.instrument_library}
                    </button>
                  </div>
                  {showInstrumentLibrary && (
                    <div className="space-y-3 bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input 
                          type="text" 
                          value={instrumentSearch} 
                          onChange={(e) => setInstrumentSearch(e.target.value)} 
                          placeholder={t.search_instruments} 
                          className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs font-bold outline-none focus:border-green-500" 
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto pr-1 scrollbar-thin flex flex-wrap gap-1.5">
                        {filteredInstruments.map(inst => (
                          <button 
                            key={inst} 
                            onClick={() => addInstrument(inst)}
                            disabled={selectedInstruments.some(si => si.name === inst)}
                            className={`px-2.5 py-1.5 rounded-lg text-[9px] border font-black uppercase transition-all ${selectedInstruments.some(si => si.name === inst) ? 'bg-zinc-800 border-zinc-700 text-zinc-600 cursor-not-allowed' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-green-500 hover:text-green-400'}`}
                          >
                            {inst}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedInstruments.length > 0 && (
                    <div className="space-y-4 mb-6 overflow-visible">
                       {selectedInstruments.map(inst => (
                         <div key={inst.name} className="flex flex-col gap-3 bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl shadow-xl relative overflow-visible group/inst">
                           <div className="flex items-center justify-between"><span className="text-[12px] font-black uppercase text-zinc-100 tracking-tight">{inst.name}</span><button onClick={() => setSelectedInstruments(prev => prev.filter(i => i.name !== inst.name))} className="text-zinc-600 hover:text-red-400 transition-colors p-1.5 bg-zinc-900 rounded-lg"><X size={14} /></button></div>
                           <div className="space-y-3 overflow-visible">
                             <div className="flex flex-col gap-1.5"><label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest pl-1">Ruolo</label><select value={inst.role} onChange={(e) => updateInstrumentRole(inst.name, e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase rounded-xl px-3 py-2 outline-none">{INSTRUMENT_ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                             <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center px-1"><label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Intensità Granulare (1-5)</label><span className="text-[8px] font-black text-green-400 uppercase tracking-widest bg-green-400/10 px-1.5 py-0.5 rounded border border-green-400/20">{getIntensityLabel(inst.intensity || '3')}</span></div>
                                <input type="range" min="1" max="5" step="1" value={inst.intensity || '3'} onChange={(e) => updateInstrumentIntensity(inst.name, e.target.value)} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500 mt-1" />
                             </div>
                           </div>
                         </div>
                       ))}
                       <button onClick={() => setSelectedInstruments([])} className="w-full py-2 bg-red-900/10 border border-red-900/20 text-red-500 text-[9px] font-black uppercase rounded-xl hover:bg-red-900/20 transition-all">Clear All</button>
                    </div>
                  )}
                  <div className="space-y-3 pt-3 border-t border-zinc-800/50">
                    <div className="flex flex-col gap-2">
                      <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest pl-1">Aggiungi Libero</label>
                      <div className="flex gap-2">
                        <input type="text" value={customInstrumentName} onChange={(e) => setCustomInstrumentName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustomInstrument()} placeholder="es: Mandolino, Theremin..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-green-500" />
                        <button onClick={addCustomInstrument} className="px-3 bg-zinc-800 border border-zinc-700 rounded-xl text-green-500 hover:bg-zinc-700 transition-all"><Plus size={16}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
              <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button onClick={handleGenerate} disabled={isLoading} className="w-full h-14 text-sm font-black uppercase tracking-widest group">{isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 size={20} className="group-hover:scale-110 transition-transform" />} {t.generate}</Button>
                  <Button variant="secondary" onClick={handleRandomizeAll} disabled={isLoading} className="w-full h-14 text-sm font-black uppercase tracking-widest"><Zap size={20} /> {t.random}</Button>
              </div>
            </div>
            <div className="lg:col-span-8">
              {error ? <div className="bg-red-900/10 border border-red-900/30 p-12 rounded-3xl text-center shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95"><AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" /><h2 className="text-2xl font-black text-red-400 mb-2 uppercase tracking-tight">Errore Generazione</h2><p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">{error}</p></div> : promptData ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-500 via-yellow-500 to-red-500" />
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 relative z-10">
                      <div className="flex-1 space-y-2">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">{t.suggested_title}</span>
                        <div className="flex items-center gap-3"><h2 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tighter">{promptData.title}</h2><div className="flex items-center gap-2"><CopyButton text={promptData.title} /><button onClick={handleRegenerateTitle} disabled={isRegeneratingTitle} className={`p-2 bg-zinc-800 rounded-xl border border-zinc-700 transition-all ${isRegeneratingTitle ? 'animate-pulse' : 'hover:scale-105 active:scale-95'}`}><RefreshCw size={20} className={isRegeneratingTitle ? 'animate-spin' : 'text-yellow-500'} /></button></div></div>
                        <div className="flex items-center gap-3 mt-4"><span className="bg-zinc-800 text-zinc-400 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-zinc-700">{promptData.genre}</span><p className="text-xs text-zinc-500 italic font-medium">{promptData.vibeDescription}</p><span className="text-[10px] text-zinc-600 uppercase font-bold border border-zinc-800 px-2 py-0.5 rounded-lg">{selectedLength}</span></div>
                      </div>
                      <CopyButton text={`${promptData.styleParams}\n\n${promptData.lyricsAndStructure}`} />
                    </div>
                    <div className="space-y-8 relative z-10">
                      <div className="space-y-3"><div className="flex items-center justify-between pl-1"><label className="text-[10px] text-green-500 font-black uppercase tracking-widest block">Style Descriptor</label><CopyButton text={promptData.styleParams} /></div><div className="p-5 bg-black/60 border border-zinc-800 rounded-2xl font-mono text-[13px] text-green-400 leading-relaxed shadow-inner border-l-4 border-l-green-600/50">{promptData.styleParams}</div></div>
                      <div className="space-y-3"><div className="flex items-center justify-between pl-1"><label className="text-[10px] text-yellow-500 font-black uppercase tracking-widest block">Liriche & Struttura</label><CopyButton text={promptData.lyricsAndStructure} /></div><div className="p-6 bg-black/60 border border-zinc-800 rounded-3xl font-mono text-[13px] text-zinc-300 whitespace-pre-wrap max-h-[600px] overflow-y-auto scrollbar-thin leading-relaxed shadow-inner border-l-4 border-l-yellow-600/50">{promptData.lyricsAndStructure}</div></div>
                    </div>
                  </div>
                </div>
              ) : isLoading ? <LoadingSpinner /> : (
                <div className="h-[600px] border-4 border-dotted border-zinc-900/50 rounded-[3rem] flex flex-col items-center justify-center text-zinc-800 space-y-6"><div className="p-8 bg-zinc-900/20 rounded-full border border-zinc-800/30"><RefreshCw className="w-20 h-20 text-zinc-900 animate-spin-slow" /></div><div className="text-center space-y-2"><p className="text-xl font-black uppercase tracking-widest">{t.waiting_input}</p><p className="max-w-xs text-xs uppercase tracking-widest font-bold leading-relaxed opacity-40">{t.waiting_desc}</p></div></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
