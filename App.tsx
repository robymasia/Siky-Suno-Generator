import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Music, Wand2, RefreshCw, Zap, Disc, Clock, Piano, Dices, Layers, Sparkles, Sliders, Mic, X, Save, Trash2, FolderOpen, Activity, Hash, Gauge, Waves, Settings2, GanttChartSquare, ChevronDown, ChevronUp, PlayCircle, Lock, CreditCard, PenTool, AlertCircle, Filter, List, Trash, Search, ZapOff } from 'lucide-react';
import { GENRES, SONG_LENGTHS, GENRE_INSTRUMENTS, GENRE_BPM_RANGES, GENRE_SOUND_DESIGN, GENRE_MIX_MASTER, GENERIC_AUTOMATIONS, INTRO_STYLES, INTRO_BUILDUPS, OUTRO_STYLES, OUTRO_FADES, BREAKDOWN_TYPES, BREAKDOWN_INTENSITIES, PLACEHOLDER_PROMPT, MOODS, VOCAL_STYLES, VOCAL_EFFECTS, INSTRUMENT_ROLES, MUSICAL_KEYS, INSTRUMENT_INTENSITIES, ROLE_DESCRIPTIONS, VOCAL_STYLE_DESCRIPTIONS, STRUCTURE_DESCRIPTIONS } from './constants';
import { generateSunoPrompt, generateTrackTitle } from './services/geminiService';
import { SunoPrompt, GenreOption, SongLength, GenreWeight, InstrumentSettings, Preset } from './types';
import { Button, CopyButton, LoadingSpinner, Tooltip } from './components/UiComponents';

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
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-lg mb-2 shadow-sm relative z-10">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-900/20 hover:bg-zinc-800/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2 font-semibold text-zinc-300 text-xs uppercase tracking-wide">
          <Icon size={14} className={isOpen || activeCount > 0 ? "text-green-500" : "text-zinc-500"} />
          {title}
        </div>
        <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <span className="text-[10px] font-mono bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30">
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
  const [selectedGenres, setSelectedGenres] = useState<GenreOption[]>([GENRES[0]]);
  const [genreWeights, setGenreWeights] = useState<Record<string, number>>({ [GENRES[0].id]: 100 });
  const [selectedLength, setSelectedLength] = useState<SongLength>('Medium');
  const [selectedInstruments, setSelectedInstruments] = useState<InstrumentSettings[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedVocals, setSelectedVocals] = useState<string[]>([]);
  const [selectedVocalEffects, setSelectedVocalEffects] = useState<string[]>([]);
  const [selectedSoundDesign, setSelectedSoundDesign] = useState<string[]>([]);
  const [selectedAutomations, setSelectedAutomations] = useState<string[]>([]);
  
  const [selectedIntroStyle, setSelectedIntroStyle] = useState<string>('Standard');
  const [selectedIntroBuildup, setSelectedIntroBuildup] = useState<string>('Standard');
  const [selectedOutroStyle, setSelectedOutroStyle] = useState<string>('Standard');
  const [selectedOutroFade, setSelectedOutroFade] = useState<string>('Standard');
  const [selectedBreakdownType, setSelectedBreakdownType] = useState<string>('Standard');
  const [selectedBreakdownIntensity, setSelectedBreakdownIntensity] = useState<string>('Standard');

  const [lyricsTheme, setLyricsTheme] = useState<string>('');
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
  const [showAllInstruments, setShowAllInstruments] = useState(false);

  // --- Preset States ---
  const [presets, setPresets] = useState<Preset[]>(() => {
    const saved = localStorage.getItem('siky_presets');
    return saved ? JSON.parse(saved) : [];
  });
  const [newPresetName, setNewPresetName] = useState('');

  // --- Effects ---
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
  
  const suggestedInstruments = useMemo(() => {
    const scores: Record<string, number> = {};
    selectedGenres.forEach(genre => {
      const weight = genreWeights[genre.id] || 50;
      const instruments = GENRE_INSTRUMENTS[genre.id] || [];
      instruments.forEach(inst => {
        scores[inst] = (scores[inst] || 0) + weight;
      });
    });
    return Object.entries(scores)
      .sort((a, b) => b[1] - a[1]) 
      .map(entry => entry[0]);
  }, [selectedGenres, genreWeights]);

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

  const updateGenreWeight = (id: string, weight: number) => {
    setGenreWeights(prev => ({ ...prev, [id]: weight }));
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]);
  };

  const updateInstrumentRole = (instName: string, role: string) => {
    setSelectedInstruments(prev => prev.map(i => i.name === instName ? { ...i, role } : i));
  };

  const updateInstrumentIntensity = (instName: string, intensity: string) => {
    setSelectedInstruments(prev => prev.map(i => i.name === instName ? { ...i, intensity } : i));
  };

  // --- Randomization Handlers ---
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
    setSelectedKey(MUSICAL_KEYS[Math.floor(Math.random() * MUSICAL_KEYS.length)]);
    setBpm(Math.floor(Math.random() * (range.max - range.min)) + range.min);
    setIsManualBpm(true);
  }, [selectedGenres]);

  const randomizeTheme = useCallback(() => {
    const themes = [
      "Digital love in a cyberpunk Tokyo", "Ocean waves crashing on a distant planet", 
      "A mysterious forest at midnight", "Summer sunset at a rooftop party", 
      "The rush of a high-speed car chase", "Heartbreak under neon city lights", 
      "A futuristic dance floor in space", "Ancient rituals with modern beats",
      "Finding hope in a rainy city", "The silence of the desert moon"
    ];
    setLyricsTheme(themes[Math.floor(Math.random() * themes.length)]);
  }, []);

  const randomizeMoods = useCallback(() => {
    const shuffled = [...MOODS].sort(() => 0.5 - Math.random());
    setSelectedMoods(shuffled.slice(0, Math.floor(Math.random() * 4) + 1));
  }, []);

  const randomizeVocals = useCallback(() => {
    setSelectedVocals([VOCAL_STYLES[Math.floor(Math.random() * VOCAL_STYLES.length)]]);
    const shuffledFx = [...VOCAL_EFFECTS].sort(() => 0.5 - Math.random());
    setSelectedVocalEffects(shuffledFx.slice(0, Math.floor(Math.random() * 3)));
  }, []);

  const randomizeSoundDesign = useCallback(() => {
    const shuffled = [...allAvailableSoundDesign].sort(() => 0.5 - Math.random());
    setSelectedSoundDesign(shuffled.slice(0, Math.floor(Math.random() * 3) + 1));
  }, [allAvailableSoundDesign]);

  const randomizeAutomation = useCallback(() => {
    const shuffled = [...allAvailableAutomations].sort(() => 0.5 - Math.random());
    setSelectedAutomations(shuffled.slice(0, Math.floor(Math.random() * 2) + 1));
  }, [allAvailableAutomations]);

  const randomizeStructure = useCallback(() => {
    setSelectedIntroStyle(INTRO_STYLES[Math.floor(Math.random() * INTRO_STYLES.length)]);
    setSelectedIntroBuildup(INTRO_BUILDUPS[Math.floor(Math.random() * INTRO_BUILDUPS.length)]);
    setSelectedOutroStyle(OUTRO_STYLES[Math.floor(Math.random() * OUTRO_STYLES.length)]);
    setSelectedOutroFade(OUTRO_FADES[Math.floor(Math.random() * OUTRO_FADES.length)]);
    setSelectedBreakdownType(BREAKDOWN_TYPES[Math.floor(Math.random() * BREAKDOWN_TYPES.length)]);
    setSelectedBreakdownIntensity(BREAKDOWN_INTENSITIES[Math.floor(Math.random() * BREAKDOWN_INTENSITIES.length)]);
  }, []);

  const randomizeInstruments = useCallback(() => {
    const source = showAllInstruments ? allAvailableInstruments : suggestedInstruments;
    const shuffled = [...source].sort(() => 0.5 - Math.random());
    setSelectedInstruments(shuffled.slice(0, Math.floor(Math.random() * 3) + 2).map(name => ({
      name,
      role: INSTRUMENT_ROLES[Math.floor(Math.random() * INSTRUMENT_ROLES.length)],
      intensity: INSTRUMENT_INTENSITIES[Math.floor(Math.random() * INSTRUMENT_INTENSITIES.length)]
    })));
  }, [allAvailableInstruments, suggestedInstruments, showAllInstruments]);

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
    
    setTimeout(() => {
      handleGenerate();
    }, 100);
  }, [randomizeGenres, randomizeSettings, randomizeTheme, randomizeMoods, randomizeVocals, randomizeSoundDesign, randomizeAutomation, randomizeStructure, randomizeInstruments]);

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
        selectedOutroStyle, selectedOutroFade, selectedBreakdownType, selectedBreakdownIntensity, lyricsTheme
      );
      setPromptData(result);
    } catch (err: any) {
      setError(err?.message || "Errore imprevisto nella generazione.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedGenres, selectedLength, selectedInstruments, selectedMoods, selectedVocals, selectedVocalEffects, genreWeights, selectedKey, bpm, selectedSoundDesign, selectedAutomations, selectedIntroStyle, selectedIntroBuildup, selectedOutroStyle, selectedOutroFade, selectedBreakdownType, selectedBreakdownIntensity, lyricsTheme]);

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

  // --- Preset Logic ---
  const savePreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: Preset = {
      id: Date.now().toString(),
      name: newPresetName,
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
      lyricsTheme
    };
    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);
    localStorage.setItem('siky_presets', JSON.stringify(updatedPresets));
    setNewPresetName('');
  };

  const loadPreset = (preset: Preset) => {
    setSelectedGenres(preset.selectedGenres);
    setGenreWeights(preset.genreWeights);
    setSelectedLength(preset.selectedLength);
    setSelectedInstruments(preset.selectedInstruments);
    setSelectedMoods(preset.selectedMoods);
    setSelectedVocals(preset.selectedVocals);
    setSelectedVocalEffects(preset.selectedVocalEffects);
    setSelectedSoundDesign(preset.selectedSoundDesign || []);
    setSelectedAutomations(preset.selectedAutomations || []);
    setSelectedIntroStyle(preset.selectedIntroStyle || 'Standard');
    setSelectedIntroBuildup(preset.selectedIntroBuildup || 'Standard');
    setSelectedOutroStyle(preset.selectedOutroStyle || 'Standard');
    setSelectedOutroFade(preset.selectedOutroFade || 'Standard');
    setSelectedBreakdownType(preset.selectedBreakdownType || 'Standard');
    setSelectedBreakdownIntensity(preset.selectedBreakdownIntensity || 'Standard');
    setSelectedKey(preset.selectedKey || 'Any Key');
    setBpm(preset.selectedBpm || 120);
    setIsManualBpm(true);
    setLyricsTheme(preset.lyricsTheme || '');
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
              <p className="text-zinc-500 text-sm">Inserisci la chiave di accesso per sbloccare il sistema</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-center tracking-widest outline-none focus:border-green-500 transition-all" 
                placeholder="ACCESS KEY" 
              />
              <Button onClick={() => {}} className="w-full uppercase tracking-widest text-sm font-black">Sblocca Sistema</Button>
              {loginError && <p className="text-red-500 text-xs text-center font-bold">Chiave di accesso errata.</p>}
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto relative z-10">
          <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl">
                <Disc className="w-10 h-10 text-green-500 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-500 via-yellow-400 to-red-600 tracking-tight">SIKY SUNO PRO</h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Advanced Prompt Engineering System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                onClick={handleRandomizeAll} 
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 border border-yellow-400/30 rounded-2xl text-black font-black uppercase tracking-tighter transition-all active:scale-95 shadow-lg shadow-yellow-500/10 text-sm group"
               >
                  <Dices size={20} className="group-hover:rotate-12 transition-transform" /> Randomize All
               </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 space-y-3">
              {/* Preset Area */}
              <CollapsibleSection title="Gestione Presets" icon={FolderOpen} activeCount={presets.length}>
                <div className="space-y-4 overflow-visible">
                  <div className="flex items-center gap-2 bg-black/40 border border-zinc-800 p-2 rounded-xl">
                    <input 
                      type="text" 
                      value={newPresetName} 
                      onChange={(e) => setNewPresetName(e.target.value)} 
                      placeholder="Nome nuovo preset..."
                      className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs flex-1 focus:border-green-500 outline-none transition-all"
                    />
                    <button onClick={savePreset} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-[10px] font-black uppercase rounded-lg transition-colors">
                        <Save size={14} /> Salva
                    </button>
                  </div>
                  
                  {presets.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                      {presets.map(p => (
                        <div key={p.id} className="group flex items-center justify-between gap-2 bg-zinc-900/40 border border-zinc-800 rounded-xl p-2.5 hover:border-zinc-700 transition-all hover:bg-zinc-800/20">
                          <span className="text-[11px] font-bold text-zinc-300 truncate flex-1 uppercase tracking-tight">{p.name}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => loadPreset(p)} className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black text-zinc-400 hover:text-white rounded-lg uppercase tracking-tighter transition-colors">
                              Load
                            </button>
                            <button onClick={() => deletePreset(p.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors bg-black/20 rounded-lg">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-600 text-center py-4 border border-dashed border-zinc-800 rounded-xl uppercase font-bold italic">Nessun preset salvato</p>
                  )}
                </div>
              </CollapsibleSection>

              {/* Configuration Cards */}
              <CollapsibleSection title="Generi" icon={Music} defaultOpen={true} activeCount={selectedGenres.length} onRandomize={randomizeGenres}>
                <div className="space-y-4 overflow-visible">
                  <div className="grid grid-cols-3 gap-1.5 overflow-visible">
                    {GENRES.map(g => (
                      <Tooltip key={g.id} content={g.description || 'Stile musicale per la base Suno.'}>
                        <button 
                          onClick={() => toggleGenre(g)} 
                          className={`w-full px-2 py-2 rounded-lg text-[10px] font-black border uppercase tracking-tighter transition-all truncate ${selectedGenres.some(sg => sg.id === g.id) ? 'bg-green-600 border-transparent text-white shadow-lg shadow-green-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                        >
                          {g.label}
                        </button>
                      </Tooltip>
                    ))}
                  </div>
                  
                  {selectedGenres.length > 1 && (
                    <div className="space-y-3 pt-3 border-t border-zinc-800/50">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block pl-1">Bilanciamento Cross-Genre</span>
                      {selectedGenres.map(g => (
                        <div key={g.id} className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                            <span className="text-zinc-400">{g.label}</span>
                            <span className="text-green-500">{genreWeights[g.id] || 50}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" max="100" 
                            value={genreWeights[g.id] || 50} 
                            onChange={(e) => updateGenreWeight(g.id, parseInt(e.target.value))}
                            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Parametri Base" icon={Settings2} defaultOpen={true} onRandomize={randomizeSettings}>
                <div className="space-y-4 overflow-visible">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block pl-1">Lunghezza</label>
                        <select value={selectedLength} onChange={(e) => setSelectedLength(e.target.value as SongLength)} className="w-full bg-black border border-zinc-800 text-xs rounded-xl p-2.5 outline-none hover:border-zinc-700 transition-colors font-bold uppercase">{SONG_LENGTHS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block pl-1">Tonalità</label>
                        <select value={selectedKey} onChange={(e) => setSelectedKey(e.target.value)} className="w-full bg-black border border-zinc-800 text-xs rounded-xl p-2.5 outline-none hover:border-zinc-700 transition-colors font-bold uppercase">{MUSICAL_KEYS.map(k => <option key={k} value={k}>{k}</option>)}</select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Tempo (BPM)</label>
                      <span className="text-xs font-mono text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-lg border border-green-500/20">{bpm}</span>
                    </div>
                    <input type="range" min="60" max="220" value={bpm} onChange={(e) => { setBpm(parseInt(e.target.value)); setIsManualBpm(true); }} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-green-500" />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Tema & Liriche" icon={PenTool} onRandomize={randomizeTheme} defaultOpen={true}>
                <textarea 
                  value={lyricsTheme} 
                  onChange={(e) => setLyricsTheme(e.target.value)} 
                  placeholder="Di cosa parla la canzone? Descrivi l'emozione, la scena o il tema narrativo..." 
                  className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-xs h-24 outline-none focus:border-green-500 resize-none transition-all placeholder:text-zinc-700 font-medium" 
                />
              </CollapsibleSection>

              <CollapsibleSection title="Atmosfera & Mood" icon={Sparkles} activeCount={selectedMoods.length} onRandomize={randomizeMoods}>
                <div className="flex flex-wrap gap-1.5 overflow-visible">
                  {MOODS.map(m => (
                    <button 
                      key={m} 
                      onClick={() => toggleMood(m)} 
                      className={`px-2.5 py-1 rounded-lg text-[10px] border font-bold uppercase tracking-tight transition-all ${selectedMoods.includes(m) ? 'bg-red-600 border-transparent text-white shadow-lg shadow-red-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Vocalità & Effetti" icon={Mic} activeCount={selectedVocals.length + selectedVocalEffects.length} onRandomize={randomizeVocals}>
                 <div className="space-y-4 overflow-visible">
                    <div>
                      <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest block mb-2 pl-1">Stile Vocale</span>
                      <div className="flex flex-wrap gap-1.5 overflow-visible">
                         {VOCAL_STYLES.map(v => (
                          <Tooltip key={v} content={VOCAL_STYLE_DESCRIPTIONS[v] || 'Modifica il timbro e l\'espressione del canto.'}>
                            <button onClick={() => setSelectedVocals(prev => prev.includes(v) ? prev.filter(i => i !== v) : [...prev, v])} className={`px-2.5 py-1 rounded-lg text-[10px] border font-bold uppercase transition-all ${selectedVocals.includes(v) ? 'bg-green-600 border-transparent text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{v}</button>
                          </Tooltip>
                         ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-zinc-800/50">
                       <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest block mb-2 pl-1">Effetti Voce</span>
                       <div className="flex flex-wrap gap-1.5 overflow-visible">
                         {VOCAL_EFFECTS.map(v => (
                           <Tooltip key={v} content={`Applica l'effetto ${v} per una voce più caratterizzata.`}>
                             <button onClick={() => setSelectedVocalEffects(prev => prev.includes(v) ? prev.filter(i => i !== v) : [...prev, v])} className={`px-2.5 py-1 rounded-lg text-[10px] border font-bold uppercase transition-all ${selectedVocalEffects.includes(v) ? 'bg-yellow-600 border-transparent text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{v}</button>
                           </Tooltip>
                         ))}
                       </div>
                    </div>
                 </div>
              </CollapsibleSection>

              <CollapsibleSection title="Sound Design & FX" icon={Layers} activeCount={selectedSoundDesign.length} onRandomize={randomizeSoundDesign}>
                <div className="flex flex-wrap gap-1.5 overflow-visible">
                  {allAvailableSoundDesign.map(sd => (
                    <Tooltip key={sd} content="Elemento di sound design per arricchire la texture sonora.">
                      <button onClick={() => setSelectedSoundDesign(prev => prev.includes(sd) ? prev.filter(i => i !== sd) : [...prev, sd])} className={`px-2.5 py-1.5 rounded-lg text-[9px] border font-bold uppercase transition-all ${selectedSoundDesign.includes(sd) ? 'bg-blue-600 border-transparent text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{sd}</button>
                    </Tooltip>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Mix & Automation" icon={Sliders} activeCount={selectedAutomations.length} onRandomize={randomizeAutomation}>
                <div className="flex flex-wrap gap-1.5 overflow-visible">
                  {allAvailableAutomations.map(a => (
                    <Tooltip key={a} content="Tecnica di mixaggio o automazione dinamica per il brano.">
                      <button onClick={() => setSelectedAutomations(prev => prev.includes(a) ? prev.filter(i => i !== a) : [...prev, a])} className={`px-2.5 py-1.5 rounded-lg text-[9px] border font-bold uppercase transition-all ${selectedAutomations.includes(a) ? 'bg-cyan-600 border-transparent text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{a}</button>
                    </Tooltip>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Struttura Avanzata" icon={GanttChartSquare} onRandomize={randomizeStructure}>
                <div className="space-y-6 overflow-visible">
                   <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1">Intro Design</label>
                      </div>
                      <select value={selectedIntroStyle} onChange={(e) => setSelectedIntroStyle(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-[10px] font-bold uppercase outline-none mb-2">{INTRO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[8px] font-black text-zinc-600 uppercase pl-1">Buildup Size</span>
                        <div className="flex bg-black rounded-xl p-1 border border-zinc-800">
                          {INTRO_BUILDUPS.map(b => (
                            <Tooltip key={b} content={STRUCTURE_DESCRIPTIONS[b] || 'Scegli la durata del buildup.'} className="flex-1">
                              <button 
                                onClick={() => setSelectedIntroBuildup(b)}
                                className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedIntroBuildup === b ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                {b}
                              </button>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">Breakdown Style</label>
                      <select value={selectedBreakdownType} onChange={(e) => setSelectedBreakdownType(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-[10px] font-bold uppercase outline-none mb-2">{BREAKDOWN_TYPES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[8px] font-black text-zinc-600 uppercase pl-1">Breakdown Intensity</span>
                        <div className="flex bg-black rounded-xl p-1 border border-zinc-800">
                          {BREAKDOWN_INTENSITIES.map(i => (
                            <Tooltip key={i} content={STRUCTURE_DESCRIPTIONS[i] || 'Scegli l\'intensità del breakdown.'} className="flex-1">
                              <button 
                                onClick={() => setSelectedBreakdownIntensity(i)}
                                className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedBreakdownIntensity === i ? 'bg-red-900/40 text-red-400 border border-red-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                {i}
                              </button>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest pl-1 block">Outro Design</label>
                      <select value={selectedOutroStyle} onChange={(e) => setSelectedOutroStyle(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-[10px] font-bold uppercase outline-none mb-2">{OUTRO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[8px] font-black text-zinc-600 uppercase pl-1">Ending Fade Style</span>
                        <div className="flex bg-black rounded-xl p-1 border border-zinc-800">
                          {OUTRO_FADES.map(f => (
                            <Tooltip key={f} content={STRUCTURE_DESCRIPTIONS[f] || 'Scegli lo stile della dissolvenza finale.'} className="flex-1">
                              <button 
                                onClick={() => setSelectedOutroFade(f)}
                                className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${selectedOutroFade === f ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                {f.split(' ')[0]}
                              </button>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                   </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Strumentazione" icon={Piano} activeCount={selectedInstruments.length} onRandomize={randomizeInstruments}>
                <div className="space-y-5 overflow-visible">
                  {selectedInstruments.length > 0 && (
                    <div className="space-y-4 mb-6 overflow-visible">
                       <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block pl-1">Strumenti Attivi</label>
                       {selectedInstruments.map(inst => (
                         <div key={inst.name} className="flex flex-col gap-3 bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl shadow-xl relative overflow-visible group/inst">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                               <span className="text-[12px] font-black uppercase text-zinc-100 tracking-tight">{inst.name}</span>
                             </div>
                             <button onClick={() => setSelectedInstruments(prev => prev.filter(i => i.name !== inst.name))} className="text-zinc-600 hover:text-red-400 transition-colors p-1.5 bg-zinc-900 rounded-lg hover:bg-zinc-800 active:scale-90">
                               <X size={14} />
                             </button>
                           </div>
                           
                           <div className="space-y-3 overflow-visible">
                             <div className="flex flex-col gap-1.5">
                                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest pl-1">Ruolo Sonoro</label>
                                <Tooltip content={ROLE_DESCRIPTIONS[inst.role] || 'Specifica come lo strumento si inserisce nella traccia.'}>
                                  <select 
                                    value={inst.role} 
                                    onChange={(e) => updateInstrumentRole(inst.name, e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase rounded-xl px-3 py-2 outline-none hover:border-zinc-500 transition-all focus:ring-1 focus:ring-green-500/30"
                                  >
                                    {INSTRUMENT_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                  </select>
                                </Tooltip>
                             </div>
                             
                             <div className="flex flex-col gap-1.5">
                                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest pl-1">Intensità Presenza</label>
                                <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800/60">
                                  {INSTRUMENT_INTENSITIES.map(i => (
                                    <Tooltip key={i} content={`Imposta ${inst.name} come ${i.toLowerCase()}.`} className="flex-1">
                                      <button 
                                        onClick={() => updateInstrumentIntensity(inst.name, i)}
                                        className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${inst.intensity === i ? 'bg-green-600/20 text-green-400 border border-green-500/20 shadow-sm' : 'text-zinc-600 hover:text-zinc-400'}`}
                                      >
                                        {i.slice(0, 4)}
                                      </button>
                                    </Tooltip>
                                  ))}
                                </div>
                             </div>
                           </div>
                         </div>
                       ))}
                    </div>
                  )}

                  <div className="space-y-3 overflow-visible">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5 pl-1">
                        <label className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">
                          {showAllInstruments ? 'Libreria Globale' : 'Suggerimenti Intelligenti'}
                        </label>
                        {!showAllInstruments && suggestedInstruments.length > 0 && (
                          <span className="text-[8px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20 font-black">AI RELEVANT</span>
                        )}
                      </div>
                      <button 
                        onClick={() => setShowAllInstruments(!showAllInstruments)} 
                        className={`text-[9px] font-black uppercase flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${showAllInstruments ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                        title={showAllInstruments ? 'Torna ai suggerimenti' : 'Mostra tutti gli strumenti'}
                      >
                        {showAllInstruments ? <ZapOff size={10}/> : <Search size={10}/>}
                        {showAllInstruments ? 'Usa Suggerimenti' : 'Cerca Manuale'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-1 overflow-visible">
                      {(showAllInstruments ? allAvailableInstruments : suggestedInstruments).map((inst, idx) => {
                        const isSelected = selectedInstruments.some(i => i.name === inst);
                        const relevanceScale = !showAllInstruments ? Math.max(0.8, 1 - (idx * 0.05)) : 1;
                        
                        return (
                          <button 
                            key={inst} 
                            onClick={() => setSelectedInstruments(prev => isSelected ? prev.filter(i => i.name !== inst) : [...prev, { name: inst, role: 'Feature', intensity: 'Standard' }])} 
                            style={{ opacity: isSelected ? 1 : relevanceScale }}
                            className={`px-2.5 py-1.5 rounded-lg text-[9px] border font-black uppercase transition-all ${isSelected ? 'bg-purple-600 border-transparent text-white shadow-lg shadow-purple-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700 active:scale-95'}`}
                          >
                            {inst}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button onClick={handleGenerate} disabled={isLoading} className="w-full h-14 text-sm font-black uppercase tracking-widest group">
                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 size={20} className="group-hover:scale-110 transition-transform" />} 
                    Genera
                  </Button>
                  <Button variant="secondary" onClick={handleRandomizeAll} disabled={isLoading} className="w-full h-14 text-sm font-black uppercase tracking-widest">
                    <Zap size={20} /> Random
                  </Button>
              </div>
            </div>

            <div className="lg:col-span-8">
              {error ? (
                <div className="bg-red-900/10 border border-red-900/30 p-12 rounded-3xl text-center shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                  <h2 className="text-2xl font-black text-red-400 mb-2 uppercase tracking-tight">Sistema in Errore</h2>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">{error}</p>
                </div>
              ) : promptData ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-500 via-yellow-500 to-red-500" />
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Disc className="w-64 h-64 text-white rotate-12" />
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 relative z-10">
                      <div className="flex-1 space-y-2">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em]">Titolo Traccia Suggerito</span>
                        <div className="flex items-center gap-3">
                          <h2 className="text-5xl font-black text-white leading-none tracking-tighter">{promptData.title}</h2>
                          <button 
                            onClick={handleRegenerateTitle}
                            disabled={isRegeneratingTitle}
                            className={`p-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-xl border border-zinc-700 transition-all ${isRegeneratingTitle ? 'animate-pulse' : 'hover:scale-105 active:scale-95'}`}
                            title="Regenera solo il titolo"
                          >
                            {isRegeneratingTitle ? (
                              <RefreshCw size={20} className="text-yellow-500 animate-spin" />
                            ) : (
                              <Dices size={20} className="text-yellow-500" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                           <span className="bg-zinc-800 text-zinc-400 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-zinc-700">{promptData.genre}</span>
                           <p className="text-xs text-zinc-500 italic font-medium">{promptData.vibeDescription}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <CopyButton text={`${promptData.styleParams}\n\n${promptData.lyricsAndStructure}`} />
                      </div>
                    </div>

                    <div className="space-y-8 relative z-10">
                      <div className="space-y-3">
                        <label className="text-[10px] text-green-500 font-black uppercase tracking-widest block pl-1">Suno Style Descriptor (Tag Field)</label>
                        <div className="p-5 bg-black/60 border border-zinc-800 rounded-2xl font-mono text-sm text-green-400 selection:bg-green-500 selection:text-black leading-relaxed shadow-inner">
                          {promptData.styleParams}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] text-yellow-500 font-black uppercase tracking-widest block pl-1">Liriche & Struttura (Custom Mode)</label>
                        <div className="p-6 bg-black/60 border border-zinc-800 rounded-3xl font-mono text-sm text-zinc-300 whitespace-pre-wrap max-h-[500px] overflow-y-auto scrollbar-thin selection:bg-yellow-500 selection:text-black leading-relaxed shadow-inner">
                          {promptData.lyricsAndStructure}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center p-4 bg-zinc-900/20 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em]">Copia i campi sopra e incollali in Suno AI v4</p>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="h-[600px] flex items-center justify-center bg-zinc-900/5 rounded-3xl border border-zinc-800 border-dashed animate-pulse">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="h-[600px] border-4 border-dotted border-zinc-900/50 rounded-[3rem] flex flex-col items-center justify-center text-zinc-800 space-y-6">
                  <div className="p-8 bg-zinc-900/20 rounded-full border border-zinc-800/30 group">
                    <RefreshCw className="w-20 h-20 text-zinc-900 group-hover:rotate-180 transition-transform duration-700" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-black uppercase tracking-widest">In Attesa di Input</p>
                    <p className="max-w-xs text-xs uppercase tracking-widest font-bold leading-relaxed opacity-40">Personalizza i parametri o usa <span className="text-yellow-600">Randomize All</span> per sbloccare la creatività</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {isAuthenticated && (
        <footer className="mt-12 py-8 border-t border-zinc-900 flex justify-center items-center gap-2 opacity-30 select-none">
          <Disc size={14} className="animate-spin-slow" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Powered by Siky Music Lab</span>
        </footer>
      )}
    </div>
  );
};

export default App;