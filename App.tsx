import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Music, Wand2, RefreshCw, Zap, Disc, Clock, Piano, Dices, Layers, Sparkles, Sliders, Mic, X, Save, Trash2, FolderOpen, Activity, Hash, Gauge, Waves, Settings2, GanttChartSquare, ChevronDown, ChevronUp, PlayCircle, Lock, CreditCard, PenTool, AlertCircle } from 'lucide-react';
import { GENRES, SONG_LENGTHS, GENRE_INSTRUMENTS, GENRE_BPM_RANGES, GENRE_SOUND_DESIGN, GENRE_MIX_MASTER, GENERIC_AUTOMATIONS, INTRO_STYLES, INTRO_BUILDUPS, OUTRO_STYLES, OUTRO_FADES, BREAKDOWN_TYPES, BREAKDOWN_INTENSITIES, PLACEHOLDER_PROMPT, MOODS, VOCAL_STYLES, VOCAL_EFFECTS, INSTRUMENT_ROLES, MUSICAL_KEYS, INSTRUMENT_INTENSITIES } from './constants';
import { generateSunoPrompt, generateTrackTitle } from './services/geminiService';
import { SunoPrompt, GenreOption, SongLength, GenreWeight, InstrumentSettings, Preset } from './types';
import { Button, CopyButton, LoadingSpinner, Tooltip } from './components/UiComponents';

// Instrument Role Descriptions for Tooltips
const ROLE_DESCRIPTIONS: Record<string, string> = {
  'Feature': 'Main focus instrument',
  'Lead': 'Primary melody carrier',
  'Bass': 'Low-end foundation',
  'Rhythm': 'Groove and chords',
  'Pad': 'Sustained texture',
  'Atmosphere': 'Background ambience',
  'FX': 'Sound effects',
  'Fill': 'Transitional flourishes',
  'Solo': 'Featured solo section',
  'Backing': 'Supporting harmony'
};

// Helper Component for Collapsible Sections
const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  activeCount?: number;
  onRandomize?: (e: React.MouseEvent) => void;
}> = ({ title, icon: Icon, children, defaultOpen = false, activeCount = 0, onRandomize }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg mb-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-900/20 hover:bg-zinc-800/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2 font-semibold text-zinc-300 text-xs uppercase tracking-wide">
          <Icon size={14} className={isOpen || activeCount > 0 ? "text-green-500" : "text-zinc-500"} />
          {title}
        </div>
        <div className="flex items-center gap-2">
            {activeCount > 0 && <span className="text-[10px] font-mono bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">{activeCount}</span>}
            {onRandomize && (
              <div 
                onClick={(e) => { e.stopPropagation(); onRandomize(e); }}
                className="p-1 text-zinc-500 hover:text-yellow-400 transition-colors rounded hover:bg-zinc-800"
                title="Randomize Section"
              >
                <Dices size={12} />
              </div>
            )}
            {isOpen ? <ChevronUp size={14} className="text-zinc-600" /> : <ChevronDown size={14} className="text-zinc-600" />}
        </div>
      </button>
      {isOpen && (
        <div className="p-3 border-t border-zinc-800/50 bg-black/20 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [selectedGenres, setSelectedGenres] = useState<GenreOption[]>([GENRES[0]]);
  const [genreWeights, setGenreWeights] = useState<Record<string, number>>({ [GENRES[0].id]: 100 });
  const [selectedLength, setSelectedLength] = useState<SongLength>('Medium');
  const [selectedInstruments, setSelectedInstruments] = useState<InstrumentSettings[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedVocals, setSelectedVocals] = useState<string[]>([]);
  const [selectedVocalEffects, setSelectedVocalEffects] = useState<string[]>([]);
  const [selectedSoundDesign, setSelectedSoundDesign] = useState<string[]>([]);
  const [selectedAutomations, setSelectedAutomations] = useState<string[]>([]);
  
  // Structure Nuances
  const [selectedIntroStyle, setSelectedIntroStyle] = useState<string>('Standard');
  const [selectedIntroBuildup, setSelectedIntroBuildup] = useState<string>('Standard');
  const [selectedOutroStyle, setSelectedOutroStyle] = useState<string>('Standard');
  const [selectedOutroFade, setSelectedOutroFade] = useState<string>('Standard');
  const [selectedBreakdownType, setSelectedBreakdownType] = useState<string>('Standard');
  const [selectedBreakdownIntensity, setSelectedBreakdownIntensity] = useState<string>('Standard');

  // Lyrics Theme
  const [lyricsTheme, setLyricsTheme] = useState<string>('');

  const [selectedKey, setSelectedKey] = useState<string>('Any Key');
  const [bpm, setBpm] = useState<number>(124);
  const [isManualBpm, setIsManualBpm] = useState(false);
  const [promptData, setPromptData] = useState<SunoPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('siky_auth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
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

  // Preset State
  const [presets, setPresets] = useState<Preset[]>(() => {
    try {
      const saved = localStorage.getItem('siky_presets');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load presets", e);
      return [];
    }
  });
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [presetName, setPresetName] = useState('');

  // Persist presets
  useEffect(() => {
    localStorage.setItem('siky_presets', JSON.stringify(presets));
  }, [presets]);

  // Update BPM when primary genre changes, unless manually overridden
  useEffect(() => {
    if (!isManualBpm && selectedGenres.length > 0) {
      const primaryGenreId = selectedGenres[0].id;
      const range = GENRE_BPM_RANGES[primaryGenreId];
      if (range) {
        setBpm(range.default);
      }
    }
  }, [selectedGenres, isManualBpm]);

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBpm(parseInt(e.target.value));
    setIsManualBpm(true);
  };

  const resetBpmToAuto = () => {
    setIsManualBpm(false);
    if (selectedGenres.length > 0) {
      const primaryGenreId = selectedGenres[0].id;
      const range = GENRE_BPM_RANGES[primaryGenreId];
      if (range) {
        setBpm(range.default);
      }
    }
  };

  const handleRandomizeBpm = () => {
    if (selectedGenres.length > 0) {
      const primaryGenreId = selectedGenres[0].id;
      const range = GENRE_BPM_RANGES[primaryGenreId];
      if (range) {
        const randomBpm = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        setBpm(randomBpm);
        setIsManualBpm(true);
      }
    } else {
        const randomBpm = Math.floor(Math.random() * (160 - 80 + 1)) + 80;
        setBpm(randomBpm);
        setIsManualBpm(true);
    }
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetName,
      selectedGenres,
      genreWeights,
      selectedLength,
      selectedInstruments,
      selectedMoods,
      selectedVocals,
      selectedVocalEffects,
      selectedSoundDesign,
      selectedAutomations,
      selectedIntroStyle,
      selectedIntroBuildup,
      selectedOutroStyle,
      selectedOutroFade,
      selectedBreakdownType,
      selectedBreakdownIntensity,
      selectedKey,
      selectedBpm: bpm,
      lyricsTheme // Save lyrics theme
    };
    setPresets(prev => [...prev, newPreset]);
    setPresetName('');
    setIsSavingPreset(false);
  };

  const handleLoadPreset = (preset: Preset) => {
    const restoredGenres = preset.selectedGenres.map(pg => 
      GENRES.find(g => g.id === pg.id) || pg
    );

    setSelectedGenres(restoredGenres);
    setGenreWeights(preset.genreWeights);
    setSelectedLength(preset.selectedLength);
    setSelectedInstruments(preset.selectedInstruments);
    setSelectedMoods(preset.selectedMoods);
    setSelectedVocals(preset.selectedVocals);
    setSelectedVocalEffects(preset.selectedVocalEffects || []);
    setSelectedSoundDesign(preset.selectedSoundDesign || []);
    setSelectedAutomations(preset.selectedAutomations || []);
    
    setSelectedIntroStyle(preset.selectedIntroStyle || 'Standard');
    setSelectedIntroBuildup(preset.selectedIntroBuildup || 'Standard');
    setSelectedOutroStyle(preset.selectedOutroStyle || 'Standard');
    setSelectedOutroFade(preset.selectedOutroFade || 'Standard');
    setSelectedBreakdownType(preset.selectedBreakdownType || 'Standard');
    setSelectedBreakdownIntensity(preset.selectedBreakdownIntensity || 'Standard');

    setLyricsTheme(preset.lyricsTheme || ''); // Load theme

    setSelectedKey(preset.selectedKey || 'Any Key');
    if (preset.selectedBpm) {
      setBpm(preset.selectedBpm);
      setIsManualBpm(true); 
    }
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  // Derive available instruments from all selected genres, sorted alphabetically
  const currentInstruments = useMemo(() => {
    const allInstruments = selectedGenres.flatMap(g => GENRE_INSTRUMENTS[g.id] || []);
    return Array.from(new Set(allInstruments)).sort((a: string, b: string) => a.localeCompare(b));
  }, [selectedGenres]);
  
  // Derive available sound designs from all selected genres
  const currentSoundDesignOptions = useMemo(() => {
    const allOptions = selectedGenres.flatMap(g => GENRE_SOUND_DESIGN[g.id] || []);
    return Array.from(new Set(allOptions)).sort((a: string, b: string) => a.localeCompare(b));
  }, [selectedGenres]);

  // Derive available automations from selected genres + generics
  const currentAutomationOptions = useMemo(() => {
    const genreSpecific = selectedGenres.flatMap(g => GENRE_MIX_MASTER[g.id] || []);
    return Array.from(new Set([...genreSpecific, ...GENERIC_AUTOMATIONS])).sort((a: string, b: string) => a.localeCompare(b));
  }, [selectedGenres]);

  const getGenreColorValue = (genreId: string) => {
    const map: Record<string, string> = {
      house: '#2563eb',
      techno: '#334155',
      trance: '#0891b2',
      pop: '#ec4899',
      kpop: '#d946ef',
      reggaeton: '#f97316',
      latin: '#ef4444',
      rock: '#44403c',
      metal: '#27272a',
      rnb: '#7c3aed',
      soul: '#b45309',
      funk: '#ca8a04',
      disco: '#eab308',
      country: '#c2410c',
      dancehall: '#ca8a04',
      reggae: '#16a34a',
      dubstep: '#9333ea',
      dnb: '#dc2626',
      synthwave: '#c026d3',
      ambient: '#0d9488',
      edm: '#4f46e5',
      hiphop: '#ea580c',
      trap: '#e11d48',
      drill: '#57534e',
      cinematic: '#64748b',
      epic: '#d97706',
      jazz: '#0284c7',
      blues: '#4338ca',
    };
    return map[genreId] || '#52525b';
  };

  const getInstrumentGenreColor = useCallback((inst: string) => {
    const genreId = selectedGenres.find(g => GENRE_INSTRUMENTS[g.id]?.includes(inst))?.id 
      || Object.keys(GENRE_INSTRUMENTS).find(id => GENRE_INSTRUMENTS[id].includes(inst));
      
    // Let's use getGenreColorValue for the style prop
    const gid = genreId || '';
    return getGenreColorValue(gid);
  }, [selectedGenres]);

  useEffect(() => {
    setSelectedInstruments(prev => 
      prev.filter(inst => currentInstruments.includes(inst.name))
    );
  }, [selectedGenres, currentInstruments]);
  
  useEffect(() => {
    setSelectedSoundDesign(prev => 
      prev.filter(sd => currentSoundDesignOptions.includes(sd))
    );
  }, [selectedGenres, currentSoundDesignOptions]);

  // Filter selected automations when options change
  useEffect(() => {
    setSelectedAutomations(prev => 
      prev.filter(auto => currentAutomationOptions.includes(auto))
    );
  }, [selectedGenres, currentAutomationOptions]);

  const toggleGenre = (genre: GenreOption) => {
    const isAlreadySelected = selectedGenres.some(g => g.id === genre.id);

    if (isAlreadySelected) {
      if (selectedGenres.length === 1) return; // Cannot deselect last one

      // Remove Genre
      setSelectedGenres(prev => prev.filter(g => g.id !== genre.id));
      
      setGenreWeights(prev => {
        const next = { ...prev };
        delete next[genre.id];
        return next;
      });
      
      // Note: Instrument cleanup is handled by the useEffect dependent on currentInstruments

    } else {
      if (selectedGenres.length >= 3) return; // Max 3 genres

      // Add Genre
      setSelectedGenres(prev => [...prev, genre]);
      
      // Default Weight
      setGenreWeights(prev => ({ ...prev, [genre.id]: 75 }));

      // Automatically select key instruments (first 3 from list)
      const genreInsts = GENRE_INSTRUMENTS[genre.id] || [];
      const defaultInsts = genreInsts.slice(0, 3);
      
      setSelectedInstruments(prev => {
        const next = [...prev];
        defaultInsts.forEach(inst => {
           if (!next.some(i => i.name === inst)) {
             next.push({ name: inst, role: 'Feature', intensity: 'Standard' });
           }
        });
        return next;
      });
    }
  };

  const updateGenreWeight = (id: string, value: number) => {
    setGenreWeights(prev => ({ ...prev, [id]: value }));
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood)
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const toggleVocal = (vocal: string) => {
    setSelectedVocals(prev => 
      prev.includes(vocal)
        ? prev.filter(v => v !== vocal)
        : [...prev, vocal]
    );
  };

  const toggleVocalEffect = (effect: string) => {
    setSelectedVocalEffects(prev => 
      prev.includes(effect)
        ? prev.filter(v => v !== effect)
        : [...prev, effect]
    );
  };

  const toggleSoundDesign = (item: string) => {
    setSelectedSoundDesign(prev => 
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const toggleAutomation = (item: string) => {
    setSelectedAutomations(prev => 
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleGenerate = useCallback(async (
    genres: GenreOption[], 
    length: string, 
    instruments: InstrumentSettings[], 
    moods: string[], 
    vocals: string[], 
    vocalEffects: string[], 
    weights: Record<string, number>,
    keySig: string, 
    bpmVal: number,
    soundDesign: string[],
    automations: string[],
    introStyle: string,
    introBuildup: string,
    outroStyle: string,
    outroFade: string,
    breakdownType: string,
    breakdownIntensity: string,
    theme: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const weightedGenres: GenreWeight[] = genres.map(g => ({
        name: g.label,
        weight: weights[g.id] || 50
      }));

      const result = await generateSunoPrompt(
        weightedGenres, 
        length, 
        instruments, 
        moods, 
        vocals, 
        vocalEffects, 
        keySig, 
        bpmVal, 
        soundDesign, 
        automations, 
        introStyle,
        introBuildup,
        outroStyle,
        outroFade,
        breakdownType,
        breakdownIntensity,
        theme
      );
      setPromptData(result);
    } catch (err: any) {
      const errorMessage = err?.message || "Unable to generate prompt. Please try again.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRegenerateTitle = async () => {
    if (!promptData) return;
    setIsGeneratingTitle(true);
    try {
      const newTitle = await generateTrackTitle(promptData.genre, promptData.vibeDescription);
      setPromptData(prev => prev ? { ...prev, title: newTitle } : null);
    } catch (e) {
      console.error("Failed to regenerate title", e);
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleRandomizeCurrent = () => {
    handleGenerate(
      selectedGenres, 
      selectedLength, 
      selectedInstruments, 
      selectedMoods, 
      selectedVocals, 
      selectedVocalEffects, 
      genreWeights, 
      selectedKey, 
      bpm,
      selectedSoundDesign,
      selectedAutomations,
      selectedIntroStyle,
      selectedIntroBuildup,
      selectedOutroStyle,
      selectedOutroFade,
      selectedBreakdownType,
      selectedBreakdownIntensity,
      lyricsTheme
    );
  };

  const handleSurpriseMe = () => {
    const shuffledGenres = [...GENRES].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 3) + 1;
    const randomGenres = shuffledGenres.slice(0, count);

    const newWeights: Record<string, number> = {};
    randomGenres.forEach(g => {
      newWeights[g.id] = Math.floor(Math.random() * 70) + 30;
    });

    const availableInstruments = Array.from(new Set(randomGenres.flatMap(g => GENRE_INSTRUMENTS[g.id] || [])));
    const shuffledInstruments = [...availableInstruments].sort(() => 0.5 - Math.random());
    const randomInstruments: InstrumentSettings[] = shuffledInstruments
      .slice(0, Math.floor(Math.random() * 2) + 2)
      .map(name => ({ name, role: 'Feature', intensity: INSTRUMENT_INTENSITIES[Math.floor(Math.random() * INSTRUMENT_INTENSITIES.length)] }));

    const shuffledMoods = [...MOODS].sort(() => 0.5 - Math.random());
    const randomMoods = shuffledMoods.slice(0, Math.floor(Math.random() * 2) + 1);

    const shuffledVocals = [...VOCAL_STYLES].sort(() => 0.5 - Math.random());
    const randomVocals = shuffledVocals.slice(0, Math.floor(Math.random() * 2)); 

    const shuffledEffects = [...VOCAL_EFFECTS].sort(() => 0.5 - Math.random());
    const randomEffects = shuffledEffects.slice(0, Math.floor(Math.random() * 1.5)); 
    
    // Pick random Sound Design terms
    const availableSoundDesign = Array.from(new Set(randomGenres.flatMap(g => GENRE_SOUND_DESIGN[g.id] || [])));
    const shuffledSoundDesign = [...availableSoundDesign].sort(() => 0.5 - Math.random());
    const randomSoundDesign = shuffledSoundDesign.slice(0, Math.floor(Math.random() * 3));
    
    // Pick random Automation using the new genre-aware logic
    const availableAutomations = Array.from(new Set([
        ...randomGenres.flatMap(g => GENRE_MIX_MASTER[g.id] || []),
        ...GENERIC_AUTOMATIONS
    ]));
    const shuffledAutomations = [...availableAutomations].sort(() => 0.5 - Math.random());
    const randomAutomations = shuffledAutomations.slice(0, Math.floor(Math.random() * 3) + 1);
    
    // Randomize Structure
    const randomIntro = INTRO_STYLES[Math.floor(Math.random() * INTRO_STYLES.length)];
    const randomIntroBuildup = INTRO_BUILDUPS[Math.floor(Math.random() * INTRO_BUILDUPS.length)];
    
    const randomOutro = OUTRO_STYLES[Math.floor(Math.random() * OUTRO_STYLES.length)];
    const randomOutroFade = OUTRO_FADES[Math.floor(Math.random() * OUTRO_FADES.length)];
    
    const randomBreakdown = BREAKDOWN_TYPES[Math.floor(Math.random() * BREAKDOWN_TYPES.length)];
    const randomBreakdownIntensity = BREAKDOWN_INTENSITIES[Math.floor(Math.random() * BREAKDOWN_INTENSITIES.length)];

    const randomKey = Math.random() > 0.5 
      ? MUSICAL_KEYS[Math.floor(Math.random() * (MUSICAL_KEYS.length - 1)) + 1] 
      : 'Any Key';

    // Pick a random BPM based on the primary random genre
    const primaryGenreId = randomGenres[0].id;
    const bpmRange = GENRE_BPM_RANGES[primaryGenreId];
    const randomBpm = Math.floor(Math.random() * (bpmRange.max - bpmRange.min + 1)) + bpmRange.min;

    // Reset lyrics theme for surprise mode to let AI decide
    setLyricsTheme('');

    setSelectedGenres(randomGenres);
    setGenreWeights(newWeights);
    setSelectedInstruments(randomInstruments);
    setSelectedMoods(randomMoods);
    setSelectedVocals(randomVocals);
    setSelectedVocalEffects(randomEffects);
    setSelectedSoundDesign(randomSoundDesign);
    setSelectedAutomations(randomAutomations);
    
    setSelectedIntroStyle(randomIntro);
    setSelectedIntroBuildup(randomIntroBuildup);
    setSelectedOutroStyle(randomOutro);
    setSelectedOutroFade(randomOutroFade);
    setSelectedBreakdownType(randomBreakdown);
    setSelectedBreakdownIntensity(randomBreakdownIntensity);
    
    setSelectedKey(randomKey);
    setBpm(randomBpm);
    setIsManualBpm(true); 
    
    handleGenerate(
      randomGenres, 
      selectedLength, 
      randomInstruments, 
      randomMoods, 
      randomVocals, 
      randomEffects, 
      newWeights, 
      randomKey, 
      randomBpm, 
      randomSoundDesign, 
      randomAutomations,
      randomIntro, 
      randomIntroBuildup, 
      randomOutro, 
      randomOutroFade, 
      randomBreakdown,
      randomBreakdownIntensity,
      '' // Empty theme for surprise
    );
  };
  
  const randomizeGenresOnly = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const shuffledGenres = [...GENRES].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 3) + 1;
    const randomGenres = shuffledGenres.slice(0, count);

    const newWeights: Record<string, number> = {};
    randomGenres.forEach(g => {
      newWeights[g.id] = Math.floor(Math.random() * 70) + 30;
    });

    setSelectedGenres(randomGenres);
    setGenreWeights(newWeights);
    
    // Auto-select instruments for new genres to prevent empty state
    const availableInstruments = Array.from(new Set(randomGenres.flatMap(g => GENRE_INSTRUMENTS[g.id] || [])));
    const randomInstruments: InstrumentSettings[] = availableInstruments
        .slice(0, 3) 
        .map(name => ({ name, role: 'Feature', intensity: 'Standard' }));
    
    setSelectedInstruments(randomInstruments);
  };

  const randomizeStructure = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    
    // Simple heuristic for "appropriate" choices based on primary genre
    const primaryGenre = selectedGenres.length > 0 ? selectedGenres[0].id : '';
    
    const electronicGenres = ['house', 'techno', 'trance', 'dnb', 'dubstep', 'edm', 'synthwave', 'disco', 'dancehall', 'trap', 'drill', 'hiphop', 'kpop', 'pop'];
    const organicGenres = ['rock', 'metal', 'country', 'blues', 'jazz', 'funk', 'soul', 'rnb', 'reggae', 'latin', 'cinematic', 'epic'];

    let validIntros = [...INTRO_STYLES];
    let validOutros = [...OUTRO_STYLES];

    if (electronicGenres.includes(primaryGenre)) {
       // Filter out distinctly organic styles if strictly electronic
       validIntros = validIntros.filter(s => s !== 'Guitar Riff');
    } else if (organicGenres.includes(primaryGenre)) {
       // Filter out distinct DJ/Electronic styles
       validIntros = validIntros.filter(s => !s.includes('DJ'));
       validOutros = validOutros.filter(s => !s.includes('DJ') && !s.includes('Glitch'));
    }

    // Fallback
    if (validIntros.length === 0) validIntros = INTRO_STYLES;
    if (validOutros.length === 0) validOutros = OUTRO_STYLES;

    setSelectedIntroStyle(pick(validIntros));
    setSelectedIntroBuildup(pick(INTRO_BUILDUPS));
    setSelectedOutroStyle(pick(validOutros));
    setSelectedOutroFade(pick(OUTRO_FADES));
    setSelectedBreakdownType(pick(BREAKDOWN_TYPES));
    setSelectedBreakdownIntensity(pick(BREAKDOWN_INTENSITIES));
  };

  const toggleInstrument = (instName: string) => {
    setSelectedInstruments(prev => {
      const exists = prev.find(i => i.name === instName);
      if (exists) {
        return prev.filter(i => i.name !== instName);
      }
      return [...prev, { name: instName, role: 'Feature', intensity: 'Standard' }];
    });
  };

  const updateInstrumentRole = (name: string, role: string) => {
    setSelectedInstruments(prev => prev.map(i => i.name === name ? { ...i, role } : i));
  };

  const updateInstrumentIntensity = (name: string, intensity: string) => {
    setSelectedInstruments(prev => prev.map(i => i.name === name ? { ...i, intensity } : i));
  };

  const removeInstrument = (name: string) => {
    setSelectedInstruments(prev => prev.filter(i => i.name !== name));
  };

  const randomizeInstrumentsForCurrentGenres = () => {
    if (currentInstruments.length === 0) return;
    const shuffled = [...currentInstruments].sort(() => 0.5 - Math.random());
    const randomSelection = shuffled
      .slice(0, Math.floor(Math.random() * 2) + 2)
      .map(name => ({ name, role: 'Feature', intensity: INSTRUMENT_INTENSITIES[Math.floor(Math.random() * INSTRUMENT_INTENSITIES.length)] }));
    setSelectedInstruments(randomSelection);
  };

  const randomizeMoods = () => {
    const shuffled = [...MOODS].sort(() => 0.5 - Math.random());
    const randomSelection = shuffled.slice(0, Math.floor(Math.random() * 2) + 1);
    setSelectedMoods(randomSelection);
  };

  const randomizeVocals = () => {
    const shuffled = [...VOCAL_STYLES].sort(() => 0.5 - Math.random());
    const randomSelection = shuffled.slice(0, 1);
    setSelectedVocals(randomSelection);
  };

  const randomizeVocalEffects = () => {
    const shuffled = [...VOCAL_EFFECTS].sort(() => 0.5 - Math.random());
    const randomSelection = shuffled.slice(0, Math.floor(Math.random() * 2) + 1);
    setSelectedVocalEffects(randomSelection);
  };
  
  const randomizeSoundDesign = () => {
    if (currentSoundDesignOptions.length === 0) return;
    const shuffled = [...currentSoundDesignOptions].sort(() => 0.5 - Math.random());
    const randomSelection = shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
    setSelectedSoundDesign(randomSelection);
  };
  
  const randomizeAutomations = () => {
    if (currentAutomationOptions.length === 0) return;
    const shuffled = [...currentAutomationOptions].sort(() => 0.5 - Math.random());
    const randomSelection = shuffled.slice(0, Math.floor(Math.random() * 2) + 1);
    setSelectedAutomations(randomSelection);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradient Layer */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-green-900 via-yellow-900 to-red-900 opacity-60" />
        
        <div className="max-w-md w-full bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-8 backdrop-blur-md shadow-2xl relative z-10">
          <div className="flex flex-col items-center mb-8">
             <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 mb-4 shadow-lg shadow-green-900/20">
               <Lock className="w-8 h-8 text-green-500" />
             </div>
             <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-yellow-500 to-red-600 tracking-tighter">
              SIKY Suno
            </h1>
            <p className="text-zinc-500 text-sm mt-2">Private Generator Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter Access Key"
                className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder:text-zinc-600 text-center font-mono tracking-widest"
                autoFocus
              />
            </div>
            
            {loginError && (
              <div className="text-red-400 text-xs text-center font-medium animate-pulse bg-red-900/10 py-2 rounded">
                Access Denied: Incorrect Key
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 via-yellow-600 to-red-600 hover:from-green-500 hover:via-yellow-500 hover:to-red-500 text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-green-900/20 active:scale-95"
            >
              Unlock System
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs">NO ACCESS KEY?</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            <a 
              href="https://www.paypal.com/donate/?business=3SPJ8YUG276P8&amount=5&no_recurring=0&item_name=Siky+Suno+Pro&currency_code=EUR"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#0070BA] hover:bg-[#003087] text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/20 active:scale-95"
            >
              <CreditCard size={18} />
              Acquista Accesso (5€)
            </a>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[10px] text-zinc-700 font-mono">SECURE SYSTEM v2.0 // SIKY-2025</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-2 md:p-6 relative overflow-hidden font-sans">
       {/* Dynamic Background matching login theme - Enhanced for Visibility */}
       <div className="fixed inset-0 z-0 pointer-events-none bg-black">
          {/* Green Blob (Top Left) */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-green-900/40 blur-[140px] rounded-full mix-blend-screen opacity-80" />
          {/* Red Blob (Top Right) */}
          <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] bg-red-900/40 blur-[140px] rounded-full mix-blend-screen opacity-80" />
          {/* Yellow Blob (Bottom Center/Left) */}
          <div className="absolute bottom-[-10%] left-[10%] w-[60%] h-[60%] bg-yellow-900/30 blur-[140px] rounded-full mix-blend-screen opacity-80" />
       </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Compact Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Disc className="w-8 h-8 text-green-500 animate-spin-slow" style={{ animationDuration: '4s' }} />
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-yellow-500 to-red-600 tracking-tighter">
              SIKY Suno
            </h1>
          </div>
          
          {/* Preset Quick Access */}
          <div className="flex items-center gap-2">
            {isSavingPreset ? (
               <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Name..."
                    className="w-32 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:border-green-500"
                    autoFocus
                  />
                  <button onClick={handleSavePreset} className="text-green-500 hover:text-green-400"><Save size={16} /></button>
                  <button onClick={() => setIsSavingPreset(false)} className="text-zinc-500 hover:text-red-400"><X size={16} /></button>
               </div>
            ) : (
              <div className="flex items-center gap-2">
                 <button 
                   onClick={() => setIsSavingPreset(true)}
                   className="p-2 text-zinc-400 hover:text-green-500 bg-zinc-900/50 rounded-lg border border-zinc-800 transition-colors"
                   title="Save Preset"
                 >
                   <Save size={16} />
                 </button>
                 {presets.length > 0 && (
                   <div className="flex gap-1 max-w-[300px] overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pb-1 items-center">
                     {presets.map(p => (
                       <div key={p.id} className="flex items-center bg-zinc-900 border border-zinc-800 rounded shrink-0 group hover:border-zinc-700 transition-colors">
                         <button
                           onClick={() => handleLoadPreset(p)}
                           className="px-2 py-1 text-[10px] hover:text-green-400 truncate max-w-[80px]"
                           title={p.name}
                         >
                           {p.name}
                         </button>
                         <button
                           onClick={(e) => handleDeletePreset(p.id, e)}
                           className="px-1.5 py-1 border-l border-zinc-800 text-zinc-600 hover:text-red-500 hover:bg-zinc-950/50 rounded-r transition-colors"
                           title="Delete Preset"
                         >
                           <Trash2 size={10} />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Compact Controls */}
          <div className="lg:col-span-4 space-y-3">
            
            {/* 1. Genres (Now Collapsible) */}
            <CollapsibleSection 
              title="Genres & Blend" 
              icon={Music} 
              defaultOpen={true} 
              activeCount={selectedGenres.length}
              onRandomize={randomizeGenresOnly}
            >
               <div className="space-y-3">
                 <div className="grid grid-cols-3 gap-1.5">
                    {GENRES.map((g) => {
                      const isSelected = selectedGenres.some(sg => sg.id === g.id);
                      return (
                        <Tooltip key={g.id} content={`${g.label}: Click to include in the hybrid style blend.`}>
                          <button
                            onClick={() => toggleGenre(g)}
                            className={`
                              w-full px-2 py-1.5 rounded text-[10px] font-medium transition-all truncate border
                              ${isSelected
                                ? `${g.color} text-white border-transparent shadow-sm` 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}
                            `}
                          >
                            {g.label}
                          </button>
                        </Tooltip>
                      );
                    })}
                 </div>
                 
                 {/* Blend Mix */}
                 {selectedGenres.length > 1 && (
                  <div className="space-y-1 mt-3 pt-2 border-t border-zinc-800/50">
                     {selectedGenres.map(g => (
                        <div key={g.id} className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-400 w-12 truncate">{g.label}</span>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            step="5"
                            value={genreWeights[g.id] || 50}
                            onChange={(e) => updateGenreWeight(g.id, parseInt(e.target.value))}
                            className="flex-1 h-1 rounded-full appearance-none bg-zinc-800 cursor-pointer accent-zinc-500"
                          />
                          <span className="text-[10px] font-mono text-zinc-500 w-6 text-right">{genreWeights[g.id] || 50}%</span>
                        </div>
                     ))}
                  </div>
                 )}
               </div>
            </CollapsibleSection>

            {/* 2. Track Settings Group (Combined Card) */}
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg p-3 space-y-3">
               <div className="grid grid-cols-2 gap-3">
                 {/* Length */}
                 <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Length</label>
                    <div className="flex bg-zinc-950 rounded p-0.5 border border-zinc-800">
                      {SONG_LENGTHS.map((len) => (
                        <button
                          key={len.id}
                          onClick={() => setSelectedLength(len.id)}
                          className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${selectedLength === len.id ? 'bg-zinc-800 text-green-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                          {len.id}
                        </button>
                      ))}
                    </div>
                 </div>
                 {/* Key */}
                 <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Key</label>
                    <select
                      value={selectedKey}
                      onChange={(e) => setSelectedKey(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded py-1 px-2 focus:border-green-500 outline-none"
                    >
                      {MUSICAL_KEYS.map((key) => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                 </div>
               </div>
               
               {/* BPM */}
               <div>
                  <div className="flex justify-between items-center mb-1">
                     <label className="text-[10px] font-bold text-zinc-500 uppercase">BPM</label>
                     <div className="flex items-center gap-1">
                       <span className={`text-xs font-mono font-bold w-8 text-right mr-1 ${isManualBpm ? 'text-green-400' : 'text-zinc-400'}`}>{bpm}</span>
                       <Tooltip content="Randomize BPM within genre range">
                          <button onClick={handleRandomizeBpm} className="text-zinc-600 hover:text-yellow-400 transition-colors p-1"><Dices size={12} /></button>
                       </Tooltip>
                       {isManualBpm && (
                          <Tooltip content="Reset to Genre Default">
                            <button onClick={resetBpmToAuto} className="text-zinc-600 hover:text-green-500 p-1"><RefreshCw size={12} /></button>
                          </Tooltip>
                       )}
                     </div>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    value={bpm}
                    onChange={handleBpmChange}
                    className="w-full h-1.5 rounded-full appearance-none bg-zinc-800 cursor-pointer accent-blue-500"
                  />
               </div>
            </div>

            {/* 3. Collapsible Groups */}
            <div className="space-y-1">
              
              {/* Lyrics Theme */}
              <CollapsibleSection 
                 title="Lyrical Theme & Context" 
                 icon={PenTool}
                 activeCount={lyricsTheme ? 1 : 0}
              >
                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-500 mb-1">
                      Describe what the song should be about. Leave empty to let the AI decide based on genre.
                    </p>
                    <textarea
                      value={lyricsTheme}
                      onChange={(e) => setLyricsTheme(e.target.value)}
                      placeholder="E.g. A cyberpunk love story... / Es. Una storia d'amore cyberpunk..."
                      className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:border-green-500 outline-none resize-none h-20 placeholder:text-zinc-700"
                    />
                  </div>
              </CollapsibleSection>

              {/* Structure */}
              <CollapsibleSection 
                 title="Structure & Arrangement" 
                 icon={GanttChartSquare}
                 onRandomize={randomizeStructure}
              >
                  <div className="grid grid-cols-1 gap-2">
                    {/* Intro */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-3 text-[10px] text-zinc-500 text-right">Intro</label>
                      <select value={selectedIntroStyle} onChange={(e) => setSelectedIntroStyle(e.target.value)} className="col-span-6 bg-zinc-900 border border-zinc-800 text-xs rounded px-2 py-1 text-zinc-300"><option value="Standard">Standard</option>{INTRO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <select value={selectedIntroBuildup} onChange={(e) => setSelectedIntroBuildup(e.target.value)} className="col-span-3 bg-zinc-900 border border-zinc-800 text-xs rounded px-2 py-1 text-zinc-500"><option value="Standard">Len</option>{INTRO_BUILDUPS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-3 text-[10px] text-zinc-500 text-right">Break</label>
                      <select value={selectedBreakdownType} onChange={(e) => setSelectedBreakdownType(e.target.value)} className="col-span-6 bg-zinc-900 border border-zinc-800 text-xs rounded px-2 py-1 text-zinc-300"><option value="Standard">Standard</option>{BREAKDOWN_TYPES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <select value={selectedBreakdownIntensity} onChange={(e) => setSelectedBreakdownIntensity(e.target.value)} className="col-span-3 bg-zinc-900 border border-zinc-800 text-xs rounded px-2 py-1 text-zinc-500"><option value="Standard">Int</option>{BREAKDOWN_INTENSITIES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>

                    {/* Outro */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <label className="col-span-3 text-[10px] text-zinc-500 text-right">Outro</label>
                      <select value={selectedOutroStyle} onChange={(e) => setSelectedOutroStyle(e.target.value)} className="col-span-6 bg-zinc-900 border border-zinc-800 text-xs rounded px-2 py-1 text-zinc-300"><option value="Standard">Standard</option>{OUTRO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      <select value={selectedOutroFade} onChange={(e) => setSelectedOutroFade(e.target.value)} className="col-span-3 bg-zinc-900 border border-zinc-800 text-xs rounded px-2 py-1 text-zinc-500"><option value="Standard">Fade</option>{OUTRO_FADES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                  </div>
              </CollapsibleSection>

              {/* Moods */}
              <CollapsibleSection 
                title="Vibe & Moods" 
                icon={Sparkles} 
                activeCount={selectedMoods.length}
                onRandomize={randomizeMoods}
              >
                  <div className="space-y-3">
                     <div>
                        <div className="flex flex-wrap gap-1">
                          {MOODS.map(m => (
                            <Tooltip key={m} content={`Adds "${m}" to the style prompt`}>
                              <button onClick={() => toggleMood(m)} className={`text-[10px] px-2 py-0.5 rounded border ${selectedMoods.includes(m) ? 'bg-red-900/30 border-red-500 text-red-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>{m}</button>
                            </Tooltip>
                          ))}
                        </div>
                     </div>
                  </div>
              </CollapsibleSection>

              {/* Sound Design / Textures */}
              <CollapsibleSection 
                title="Sound Design & Textures" 
                icon={Layers} 
                activeCount={selectedSoundDesign.length}
                onRandomize={randomizeSoundDesign}
              >
                  <div className="space-y-3">
                     <div>
                        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto scrollbar-none">
                          {currentSoundDesignOptions.map(m => (
                            <Tooltip key={m} content={`Adds specific "${m}" texture instructions`}>
                              <button onClick={() => toggleSoundDesign(m)} className={`text-[10px] px-2 py-0.5 rounded border ${selectedSoundDesign.includes(m) ? 'bg-purple-900/30 border-purple-500 text-purple-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>{m}</button>
                            </Tooltip>
                          ))}
                        </div>
                     </div>
                  </div>
              </CollapsibleSection>

              {/* Automation */}
              <CollapsibleSection 
                title="Mix & Automation" 
                icon={Sliders} 
                activeCount={selectedAutomations.length}
                onRandomize={randomizeAutomations}
              >
                  <div className="space-y-3">
                     <div>
                        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto scrollbar-none">
                          {currentAutomationOptions.map(m => (
                             <Tooltip key={m} content={`Includes "${m}" dynamic automation`}>
                               <button onClick={() => toggleAutomation(m)} className={`text-[10px] px-2 py-0.5 rounded border ${selectedAutomations.includes(m) ? 'bg-blue-900/30 border-blue-500 text-blue-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>{m}</button>
                             </Tooltip>
                          ))}
                        </div>
                     </div>
                  </div>
              </CollapsibleSection>

              {/* Vocals */}
              <CollapsibleSection 
                title="Vocals" 
                icon={Mic} 
                activeCount={selectedVocals.length + selectedVocalEffects.length}
                onRandomize={() => { randomizeVocals(); randomizeVocalEffects(); }}
              >
                  <div className="space-y-2">
                     <div className="flex flex-wrap gap-1">
                       {VOCAL_STYLES.map(v => (
                         <Tooltip key={v} content={`Set vocal style to "${v}"`}>
                           <button onClick={() => toggleVocal(v)} className={`text-[10px] px-2 py-0.5 rounded border ${selectedVocals.includes(v) ? 'bg-green-900/30 border-green-500 text-green-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>{v}</button>
                         </Tooltip>
                       ))}
                     </div>
                     <div className="pt-2 border-t border-zinc-800/50 flex flex-wrap gap-1">
                       {VOCAL_EFFECTS.map(v => (
                         <Tooltip key={v} content={`Apply "${v}" effect to vocals`}>
                           <button onClick={() => toggleVocalEffect(v)} className={`text-[10px] px-2 py-0.5 rounded border ${selectedVocalEffects.includes(v) ? 'bg-yellow-900/30 border-yellow-500 text-yellow-200' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>{v}</button>
                         </Tooltip>
                       ))}
                     </div>
                  </div>
              </CollapsibleSection>

              {/* Instruments */}
              <CollapsibleSection 
                 title="Instruments" 
                 icon={Piano} 
                 activeCount={selectedInstruments.length}
                 onRandomize={randomizeInstrumentsForCurrentGenres}
              >
                 <div className="space-y-2">
                    {/* Active List */}
                    {selectedInstruments.length > 0 && (
                      <div className="space-y-1">
                        {selectedInstruments.map(inst => (
                           <div key={inst.name} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded px-2 py-1">
                              <span className="text-[10px] text-zinc-300 truncate w-24">{inst.name}</span>
                              <div className="flex items-center gap-1">
                                <Tooltip content="Set mix intensity">
                                  <select
                                    value={inst.intensity || 'Standard'}
                                    onChange={(e) => updateInstrumentIntensity(inst.name, e.target.value)}
                                    className="bg-black text-[9px] text-zinc-500 rounded border border-zinc-800 mr-1"
                                  >
                                    {INSTRUMENT_INTENSITIES.map(i => <option key={i} value={i}>{i}</option>)}
                                  </select>
                                </Tooltip>
                                <Tooltip content={ROLE_DESCRIPTIONS[inst.role] || "Select instrument role"}>
                                  <select value={inst.role} onChange={(e) => updateInstrumentRole(inst.name, e.target.value)} className="bg-black text-[9px] text-zinc-500 rounded border border-zinc-800"><option value="Feature">Feature</option>{INSTRUMENT_ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select>
                                </Tooltip>
                                <button onClick={() => removeInstrument(inst.name)} className="text-zinc-600 hover:text-red-400"><X size={10}/></button>
                              </div>
                           </div>
                        ))}
                      </div>
                    )}
                    {/* Picker */}
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto scrollbar-none pt-1">
                       {currentInstruments.length > 0 ? (
                         currentInstruments.map(inst => {
                            const isSelected = selectedInstruments.some(i => i.name === inst);
                            const color = getInstrumentGenreColor(inst);
                            return (
                               <Tooltip key={inst} content={`Click to force ${inst} into the generation.`}>
                                 <button onClick={() => toggleInstrument(inst)} className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${isSelected ? 'bg-zinc-800 border-zinc-600 text-zinc-400 opacity-50' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
                                    {inst}
                                 </button>
                               </Tooltip>
                            )
                         })
                       ) : <p className="text-[10px] text-zinc-600 italic">Select genres first</p>}
                    </div>
                 </div>
              </CollapsibleSection>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button 
                onClick={handleRandomizeCurrent} 
                disabled={isLoading}
                className="w-full !py-2.5 !text-sm"
                variant="primary"
              >
                {isLoading ? 'Generating...' : <><Wand2 size={16} /> Generate</>}
              </Button>

              <Button 
                variant="secondary"
                onClick={handleSurpriseMe}
                disabled={isLoading}
                className="w-full !py-2.5 !text-sm"
              >
                <Zap size={16} className="text-yellow-500" /> Surprise
              </Button>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="h-[600px] flex items-center justify-center bg-zinc-900/20 rounded-xl border border-zinc-800 border-dashed">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-red-900/10 rounded-xl border border-red-900/30 text-red-400">
                <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                <h3 className="font-bold mb-1">Configuration Error</h3>
                <p className="text-sm font-mono opacity-80 mb-4">{error}</p>
                
                {error.includes("API Key") && (
                   <div className="text-xs text-zinc-500 bg-black/20 p-4 rounded border border-zinc-800 text-left space-y-2 max-w-md">
                      <p className="font-bold text-zinc-300">How to fix in Vercel:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Go to your Vercel Project Settings</li>
                        <li>Navigate to <strong>Environment Variables</strong></li>
                        <li>Add a new variable:
                           <div className="pl-4 mt-1 font-mono text-zinc-400">
                             Key: <span className="text-green-400">API_KEY</span><br/>
                             Value: <span className="text-blue-400">Your_Gemini_API_Key</span>
                           </div>
                        </li>
                        <li>Redeploy your application (or just the latest commit)</li>
                      </ol>
                   </div>
                )}

                <button onClick={() => setError(null)} className="mt-6 text-xs text-zinc-500 hover:text-zinc-300 underline">Dismiss</button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Main Result Card */}
                <div className="bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-800 shadow-2xl overflow-hidden relative">
                  
                  {/* Decorative Header Bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" />

                  <div className="p-6">
                    {/* Title & Metadata Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b border-zinc-800/50 pb-6">
                       <div className="space-y-1 w-full">
                          <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Track Title</span>
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">{promptData?.title || PLACEHOLDER_PROMPT.title}</h2>
                            {promptData && (
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={handleRegenerateTitle}
                                  disabled={isGeneratingTitle}
                                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-yellow-400 transition-colors border border-zinc-800 text-xs font-medium ${isGeneratingTitle ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title="Generate a new creative title based on the current genre and vibe"
                                >
                                  <RefreshCw size={14} className={`transition-transform group-hover:rotate-180 ${isGeneratingTitle ? "animate-spin" : ""}`} />
                                  <span>Randomize Title</span>
                                </button>
                                <CopyButton text={promptData.title} />
                              </div>
                            )}
                          </div>
                          {promptData && <p className="text-sm text-zinc-400 italic mt-1">"{promptData.vibeDescription}"</p>}
                       </div>
                       
                       {/* Quick Badges */}
                       <div className="flex flex-wrap gap-2 md:justify-end shrink-0 mt-2 md:mt-0">
                          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-xs font-mono font-bold">{bpm} BPM</div>
                          <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-xs font-mono font-bold">{selectedKey}</div>
                          <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-300 text-xs font-mono">{selectedLength}</div>
                       </div>
                    </div>

                    {/* Style Params Box */}
                    <div className="mb-6 space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold tracking-widest text-green-500 uppercase flex items-center gap-2"><Settings2 size={12}/> Style Params</span>
                          {promptData && <CopyButton text={promptData.styleParams} />}
                       </div>
                       <div className="p-4 bg-black/40 rounded-lg border border-zinc-800/50 text-green-100/90 font-mono text-sm leading-relaxed shadow-inner">
                          {promptData?.styleParams || PLACEHOLDER_PROMPT.styleParams}
                       </div>
                    </div>

                    {/* Lyrics Box */}
                    <div className="space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold tracking-widest text-yellow-500 uppercase flex items-center gap-2"><Mic size={12}/> Structure & Lyrics</span>
                          {promptData && <CopyButton text={promptData.lyricsAndStructure} />}
                       </div>
                       <div className="relative group">
                          <div className="p-5 bg-black rounded-lg border border-zinc-800 text-zinc-300 font-mono text-xs md:text-sm whitespace-pre-wrap leading-relaxed min-h-[300px] max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                             {promptData?.lyricsAndStructure || PLACEHOLDER_PROMPT.lyricsAndStructure}
                          </div>
                          {!promptData && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                               <div className="text-center">
                                  <RefreshCw className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                                  <p className="text-xs text-zinc-600">Ready to generate</p>
                                </div>
                            </div>
                          )}
                       </div>
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;