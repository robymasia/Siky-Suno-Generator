
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Music, Wand2, RefreshCw, Disc, Piano, Dices, Mic, X, Save, Trash2, FolderOpen, Settings2, GanttChartSquare, ChevronDown, ChevronUp, PenTool, AlertCircle, Plus, Mic2, Waves, Bookmark, MessageSquareQuote, SlidersHorizontal, Heart, Gauge, Activity, Volume2, Sparkles as SparklesIcon, Scale, VolumeX, Layout, Eraser, Cpu, Zap, Timer, Search, Sliders, Copy } from 'lucide-react';
import { GENRES, SONG_LENGTHS, MOODS, VOCAL_CATEGORIES, VOCAL_EFFECTS_CATEGORIES, INSTRUMENT_CATEGORIES, GENRE_BPM_RANGES, INTRO_BUILDUPS, ARRANGEMENT_TYPES, OUTRO_FADES, BREAKDOWN_TYPES, MUSICAL_KEYS, INSTRUMENT_ROLES, INSTRUMENT_INTENSITIES, STRUCTURE_PRESETS, MASTERING_TARGETS, MIX_STYLES } from './constants';
import { generateSunoPrompt, generateLyricSuggestions, suggestInstruments, suggestStructure, regenerateSongTitle } from './services/geminiService';
import { SunoPrompt, GenreOption, SongLength, GenreWeight, InstrumentSettings, Preset, GranularStructure, SectionControl } from './types';
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
                title="Randomize Section"
              >
                <Dices size={14} />
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
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('siky_lang');
    return (saved as Language) || 'it';
  });

  const t = (TRANSLATIONS[lang] || TRANSLATIONS['en']) as any;

  // Base State
  const [selectedGenres, setSelectedGenres] = useState<GenreOption[]>([GENRES[0]]);
  const [genreWeights, setGenreWeights] = useState<Record<string, number>>({ [GENRES[0].id]: 100 });
  const [selectedLength, setSelectedLength] = useState<SongLength>('Medium');
  const [selectedKey, setSelectedKey] = useState<string>('Any Key');
  const [bpm, setBpm] = useState<number>(124);
  
  // Expanded State
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedVocals, setSelectedVocals] = useState<string[]>([]);
  const [selectedVocalEffects, setSelectedVocalEffects] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<InstrumentSettings[]>([]);
  
  // Mix & Mastering State
  const [selectedMixStyle, setSelectedMixStyle] = useState<string>(MIX_STYLES[0].id);
  const [selectedMasterTarget, setSelectedMasterTarget] = useState<string>(MASTERING_TARGETS[0].id);
  
  // Structure Settings
  const [granularStructure, setGranularStructure] = useState<GranularStructure>(STRUCTURE_PRESETS[0].structure);

  const [lyricsTheme, setLyricsTheme] = useState<string>('');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [lyricSuggestions, setLyricSuggestions] = useState<string[]>([]);
  const [isSuggestingLyrics, setIsSuggestingLyrics] = useState(false);
  const [isSuggestingInstruments, setIsSuggestingInstruments] = useState(false);
  const [isRegeneratingTitle, setIsRegeneratingTitle] = useState(false);
  
  // App State
  const [promptData, setPromptData] = useState<SunoPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  // UI Helpers
  const [instrumentSearch, setInstrumentSearch] = useState('');
  const [showInstrumentLibrary, setShowInstrumentLibrary] = useState(false);

  useEffect(() => {
    localStorage.setItem('siky_lang', lang);
  }, [lang]);

  useEffect(() => {
    const storedAuth = localStorage.getItem('siky_auth');
    if (storedAuth === 'true') setIsAuthenticated(true);
  }, []);

  // --- RANDOMIZATION LOGIC ---

  const randomizeGenres = useCallback(() => {
    const count = Math.floor(Math.random() * 2) + 1; // 1 to 2 genres
    const shuffled = [...GENRES].sort(() => 0.5 - Math.random());
    const selection = shuffled.slice(0, count);
    setSelectedGenres(selection);
    
    const weights: Record<string, number> = {};
    if (count === 1) {
      weights[selection[0].id] = 100;
    } else {
      const w1 = Math.floor(Math.random() * 41) + 40; // 40-80%
      weights[selection[0].id] = w1;
      weights[selection[1].id] = 100 - w1;
    }
    setGenreWeights(weights);
    
    // Auto-update BPM based on first genre
    const range = GENRE_BPM_RANGES[selection[0].id] || { default: 120 };
    setBpm(range.default);
  }, []);

  const randomizeMoods = useCallback(() => {
    const count = Math.floor(Math.random() * 2) + 2; // 2 to 3 moods
    const shuffled = [...MOODS].sort(() => 0.5 - Math.random());
    setSelectedMoods(shuffled.slice(0, count));
  }, []);

  const randomizeVocals = useCallback(() => {
    // Check context
    const isElectronic = selectedGenres.some(g => ['edm', 'techno', 'house', 'trap_edm'].includes(g.id));
    const isIta = selectedGenres.some(g => g.id.includes('ita') || g.id === 'cantautore');
    const isUrban = selectedGenres.some(g => ['hiphop', 'trap', 'drill', 'rnb'].includes(g.id));

    let pool: string[] = [];
    if (isIta) pool = [...pool, ...VOCAL_CATEGORIES['Italian Style 🇮🇹']];
    if (isElectronic) pool = [...pool, ...VOCAL_CATEGORIES['Electronic & FX']];
    pool = [...pool, ...VOCAL_CATEGORIES['Pop & International']];

    const shuffled = pool.sort(() => 0.5 - Math.random());
    setSelectedVocals(shuffled.slice(0, Math.floor(Math.random() * 2) + 1));
    
    // Random effects
    const effectPool = Object.values(VOCAL_EFFECTS_CATEGORIES).flat();
    setSelectedVocalEffects(effectPool.sort(() => 0.5 - Math.random()).slice(0, 2));
  }, [selectedGenres]);

  const randomizeMixAutomation = useCallback(() => {
    const isClub = selectedGenres.some(g => ['edm', 'techno', 'house', 'trap_edm'].includes(g.id));
    const target = isClub ? (Math.random() > 0.3 ? 'club' : 'spotify') : MASTERING_TARGETS[Math.floor(Math.random() * MASTERING_TARGETS.length)].id;
    const style = isClub ? (Math.random() > 0.4 ? 'sidechain' : 'clean') : MIX_STYLES[Math.floor(Math.random() * MIX_STYLES.length)].id;
    
    setSelectedMasterTarget(target);
    setSelectedMixStyle(style);
  }, [selectedGenres]);

  const randomizeInstruments = useCallback(async () => {
    setIsSuggestingInstruments(true);
    try {
      const weightedGenres: GenreWeight[] = selectedGenres.map(g => ({ name: g.label, weight: genreWeights[g.id] || 100 }));
      const suggestions = await suggestInstruments(weightedGenres, selectedMoods);
      setSelectedInstruments(suggestions);
    } catch (err) {
      // Fallback to local random if AI fails
      const categories = Object.values(INSTRUMENT_CATEGORIES);
      const randomInstruments: InstrumentSettings[] = [];
      for(let i=0; i<4; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const name = cat[Math.floor(Math.random() * cat.length)];
        randomInstruments.push({ name, role: INSTRUMENT_ROLES[Math.floor(Math.random() * INSTRUMENT_ROLES.length)], intensity: 'Standard' });
      }
      setSelectedInstruments(randomInstruments);
    } finally {
      setIsSuggestingInstruments(false);
    }
  }, [selectedGenres, selectedMoods, genreWeights]);

  const randomizeStructure = useCallback(() => {
    const preset = STRUCTURE_PRESETS[Math.floor(Math.random() * STRUCTURE_PRESETS.length)];
    setGranularStructure(preset.structure);
  }, []);

  const randomizeLyrics = useCallback(async () => {
    if (isInstrumental) {
      setIsInstrumental(false);
    }
    setIsSuggestingLyrics(true);
    try {
      const suggestions = await generateLyricSuggestions(selectedGenres.map(g => g.label), selectedMoods, selectedVocals, lyricsTheme);
      setLyricsTheme(suggestions[Math.floor(Math.random() * suggestions.length)]);
    } catch (err) {
      setLyricsTheme("Una storia di vita vissuta, tra sogni e realtà.");
    } finally {
      setIsSuggestingLyrics(false);
    }
  }, [selectedGenres, selectedMoods, selectedVocals, isInstrumental]);

  const randomizeAll = useCallback(() => {
    randomizeGenres();
    setTimeout(() => {
      randomizeMoods();
      randomizeVocals();
      randomizeMixAutomation();
      randomizeInstruments();
      randomizeStructure();
      randomizeLyrics();
    }, 100);
  }, [randomizeGenres, randomizeMoods, randomizeVocals, randomizeMixAutomation, randomizeInstruments, randomizeStructure, randomizeLyrics]);

  // --- END RANDOMIZATION LOGIC ---

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

  const toggleGenre = (genre: GenreOption) => {
    const isAlreadySelected = selectedGenres.some(g => g.id === genre.id);
    if (isAlreadySelected) {
      if (selectedGenres.length === 1) return;
      setSelectedGenres(prev => prev.filter(g => g.id !== genre.id));
    } else {
      if (selectedGenres.length >= 3) return;
      setSelectedGenres(prev => [...prev, genre]);
      setGenreWeights(prev => ({ ...prev, [genre.id]: 100 }));
    }
  };

  const updateInstrument = (index: number, field: keyof InstrumentSettings, value: string) => {
    const next = [...selectedInstruments];
    next[index] = { ...next[index], [field]: value };
    setSelectedInstruments(next);
  };

  const updateGranular = (section: keyof GranularStructure, field: keyof SectionControl, value: number | string) => {
    setGranularStructure(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const addInstrument = (name: string) => {
    if (!selectedInstruments.some(i => i.name === name)) {
      setSelectedInstruments(prev => [...prev, { name, role: 'Lead', intensity: 'Standard' }]);
    }
  };

  const handleGetInstrumentSuggestions = useCallback(async () => {
    if (selectedGenres.length === 0) return;
    setIsSuggestingInstruments(true);
    try {
      const weightedGenres: GenreWeight[] = selectedGenres.map(g => ({ name: g.label, weight: genreWeights[g.id] || 100 }));
      const suggestions = await suggestInstruments(weightedGenres, selectedMoods);
      setSelectedInstruments(prev => {
        const existingNames = prev.map(p => p.name);
        const newOnes = suggestions.filter(s => !existingNames.includes(s.name));
        return [...prev, ...newOnes];
      });
    } catch (err) { console.error(err); } finally { setIsSuggestingInstruments(false); }
  }, [selectedGenres, selectedMoods, genreWeights]);

  const handleGetLyricSuggestions = useCallback(async () => {
    if (selectedGenres.length === 0) return;
    setIsSuggestingLyrics(true);
    try {
      const suggestions = await generateLyricSuggestions(selectedGenres.map(g => g.label), selectedMoods, selectedVocals, lyricsTheme);
      setLyricSuggestions(suggestions);
    } catch (err) { console.error(err); } finally { setIsSuggestingLyrics(false); }
  }, [selectedGenres, selectedMoods, selectedVocals, lyricsTheme]);

  const handleRegenerateTitle = useCallback(async () => {
    if (!promptData) return;
    setIsRegeneratingTitle(true);
    try {
      const newTitle = await regenerateSongTitle(
        selectedGenres.map(g => g.label),
        selectedMoods,
        lyricsTheme || "Music production"
      );
      setPromptData(prev => prev ? ({ ...prev, title: newTitle }) : null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegeneratingTitle(false);
    }
  }, [promptData, selectedGenres, selectedMoods, lyricsTheme]);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const weightedGenres: GenreWeight[] = selectedGenres.map(g => ({ name: g.label, weight: genreWeights[g.id] || 100 }));
      const mixDirective = MIX_STYLES.find(s => s.id === selectedMixStyle)?.directive || '';
      const masterDirective = MASTERING_TARGETS.find(t => t.id === selectedMasterTarget)?.directive || '';
      
      const result = await generateSunoPrompt(
        weightedGenres, selectedLength, selectedInstruments, selectedMoods, selectedVocals, selectedVocalEffects,
        selectedKey, bpm, [], mixDirective, masterDirective, 'Standard', 'Standard', 'Standard', 'Standard',
        lyricsTheme, granularStructure, isInstrumental
      );
      setPromptData(result);
    } catch (err: any) { setError(err?.message || "Errore."); } finally { setIsLoading(false); }
  }, [selectedGenres, selectedLength, selectedInstruments, selectedMoods, selectedVocals, selectedVocalEffects, genreWeights, selectedKey, bpm, selectedMixStyle, selectedMasterTarget, lyricsTheme, granularStructure, isInstrumental]);

  const formatSeconds = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-2 md:p-6 relative font-sans overflow-x-hidden">
       <div className="fixed inset-0 z-0 pointer-events-none bg-black">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-green-900/10 blur-[140px] rounded-full" />
       </div>

      {!isAuthenticated ? (
        <div className="h-screen flex items-center justify-center relative z-50 px-4">
          <div className="max-w-md w-full bg-zinc-900/80 border border-zinc-800 p-8 rounded-2xl backdrop-blur-xl">
             <form onSubmit={handleLogin} className="space-y-4 text-center">
              <Disc className="w-12 h-12 text-green-500 mx-auto mb-4 animate-spin-slow" />
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-center outline-none focus:border-green-500 uppercase" placeholder={t.access_key} />
              <Button onClick={() => {}} className="w-full uppercase font-black">{t.unlock}</Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto relative z-10">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Disc className="w-10 h-10 text-green-500 animate-spin-slow" />
              <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-red-600 uppercase tracking-tighter">SIKY SUNO PRO</h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={randomizeAll}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-xl text-[10px] font-black uppercase hover:bg-yellow-500/20 transition-all active:scale-95"
              >
                <Dices size={14} />
                {t.randomize_all}
              </button>
              <div className="flex bg-zinc-900/80 border border-zinc-800 p-1 rounded-xl">
                  {(['en', 'it', 'es', 'fr'] as Language[]).map((l) => (
                    <button key={l} onClick={() => setLang(l)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${lang === l ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}>{l}</button>
                  ))}
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-3">
              <CollapsibleSection title={t.genres} icon={Music} defaultOpen={true} onRandomize={randomizeGenres}>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {GENRES.map(g => (
                    <button key={g.id} onClick={() => toggleGenre(g)} className={`px-2 py-2 rounded-lg text-[10px] font-black border uppercase transition-all truncate ${selectedGenres.some(sg => sg.id === g.id) ? 'bg-green-600 border-transparent text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{g.label}</button>
                  ))}
                </div>
                {selectedGenres.length > 0 && (
                  <div className="mt-3 space-y-2 pt-3 border-t border-zinc-800">
                    {selectedGenres.map(g => (
                      <div key={g.id} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[8px] font-black uppercase text-zinc-500">
                          <span>{g.label}</span>
                          <span>{genreWeights[g.id] || 0}%</span>
                        </div>
                        <input type="range" min="0" max="100" step="5" value={genreWeights[g.id] || 0} onChange={(e) => setGenreWeights({...genreWeights, [g.id]: parseInt(e.target.value)})} className="w-full h-1 bg-zinc-800 rounded-lg accent-green-500" />
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleSection>

              <CollapsibleSection title={t.mood} icon={Heart} activeCount={selectedMoods.length} onRandomize={randomizeMoods}>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                  {MOODS.map(m => (
                    <button key={m} onClick={() => setSelectedMoods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} className={`px-2 py-1 rounded text-[9px] font-black border uppercase transition-all ${selectedMoods.includes(m) ? 'bg-rose-600 border-transparent text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{m}</button>
                  ))}
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.vocals} icon={Mic2} activeCount={selectedVocals.length} onRandomize={randomizeVocals}>
                 <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                    {Object.entries(VOCAL_CATEGORIES).map(([cat, items]) => (
                      <div key={cat} className="space-y-1.5">
                        <span className="text-[8px] text-zinc-600 font-black uppercase px-1">{cat}</span>
                        <div className="flex flex-wrap gap-1">
                          {items.map(v => (
                            <button key={v} onClick={() => setSelectedVocals(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} className={`px-2 py-1 rounded text-[8px] font-black border transition-all ${selectedVocals.includes(v) ? 'bg-green-600 border-transparent text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>{v}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                 </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.mix_automation} icon={Sliders} activeCount={1} onRandomize={randomizeMixAutomation}>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-600 uppercase">Mastering Target</label>
                    <div className="grid grid-cols-1 gap-1">
                      {MASTERING_TARGETS.map(target => (
                        <button key={target.id} onClick={() => setSelectedMasterTarget(target.id)} className={`text-left px-3 py-2 rounded-lg text-[9px] font-bold uppercase border transition-all ${selectedMasterTarget === target.id ? 'bg-blue-600 border-transparent text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-zinc-900'}`}>{target.label}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-600 uppercase">Mix Style</label>
                    <div className="grid grid-cols-1 gap-1">
                      {MIX_STYLES.map(style => (
                        <button key={style.id} onClick={() => setSelectedMixStyle(style.id)} className={`text-left px-3 py-2 rounded-lg text-[9px] font-bold uppercase border transition-all ${selectedMixStyle === style.id ? 'bg-teal-600 border-transparent text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-zinc-900'}`}>{style.label}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.instruments} icon={Piano} activeCount={selectedInstruments.length} onRandomize={randomizeInstruments}>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button onClick={() => setShowInstrumentLibrary(!showInstrumentLibrary)} className="flex-1 py-2 bg-zinc-800 text-[10px] font-black uppercase rounded-lg border border-zinc-700">Libreria Strumenti</button>
                    {selectedInstruments.length > 0 && <button onClick={() => setSelectedInstruments([])} className="px-2 text-red-500 border border-zinc-800 rounded-lg"><Eraser size={14}/></button>}
                  </div>
                  
                  {/* Tasto Suggerimenti AI per Strumenti */}
                  <button 
                    onClick={handleGetInstrumentSuggestions} 
                    disabled={isSuggestingInstruments || selectedGenres.length === 0} 
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-yellow-600/20 to-green-600/20 border border-yellow-500/30 rounded-xl text-yellow-400 disabled:opacity-50 transition-all shadow-lg"
                  >
                    {isSuggestingInstruments ? <RefreshCw className="w-4 h-4 animate-spin" /> : <SparklesIcon size={16} />}
                    <span className="text-[10px] font-black uppercase">{t.ai_suggestions}</span>
                  </button>

                  {showInstrumentLibrary && (
                    <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg space-y-4 max-h-60 overflow-y-auto">
                      <input type="text" value={instrumentSearch} onChange={(e) => setInstrumentSearch(e.target.value)} placeholder="Cerca..." className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-[10px] outline-none mb-2" />
                      {Object.entries(INSTRUMENT_CATEGORIES).map(([cat, items]) => (
                        <div key={cat} className="space-y-1">
                           <span className="text-[8px] text-zinc-600 font-black uppercase">{cat}</span>
                           <div className="flex flex-wrap gap-1">
                             {items.filter(i => i.toLowerCase().includes(instrumentSearch.toLowerCase())).map(i => <button key={i} onClick={() => addInstrument(i)} className="px-1.5 py-0.5 text-[8px] bg-zinc-900 border border-zinc-800 rounded hover:border-zinc-500">{i}</button>)}
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-2">
                    {selectedInstruments.map((inst, idx) => (
                      <div key={idx} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-bold">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-zinc-200 uppercase">{inst.name}</span>
                           <button onClick={() => setSelectedInstruments(prev => prev.filter((_, i) => i !== idx))} className="text-zinc-600 hover:text-red-500"><X size={12}/></button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <span className="text-[7px] text-zinc-500 uppercase">Ruolo</span>
                            <select value={inst.role} onChange={(e) => updateInstrument(idx, 'role', e.target.value)} className="w-full bg-black border border-zinc-800 p-1 rounded text-[8px] outline-none">
                              {INSTRUMENT_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[7px] text-zinc-500 uppercase">Intensità</span>
                            <select value={inst.intensity} onChange={(e) => updateInstrument(idx, 'intensity', e.target.value)} className="w-full bg-black border border-zinc-800 p-1 rounded text-[8px] outline-none">
                              {INSTRUMENT_INTENSITIES.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.structure} icon={GanttChartSquare} onRandomize={randomizeStructure}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-1 mb-3">
                    {STRUCTURE_PRESETS.map(preset => (
                      <button key={preset.id} onClick={() => setGranularStructure(preset.structure)} className="text-left px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-[9px] font-black uppercase hover:bg-zinc-900 transition-colors">{preset.label}</button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {(Object.keys(granularStructure) as Array<keyof GranularStructure>).map((section) => (
                      <div key={section} className="flex flex-col gap-1 bg-zinc-950/40 p-2 rounded-lg border border-zinc-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-zinc-400 uppercase">{section}</span>
                          <span className="text-[8px] font-mono text-zinc-500">{formatSeconds(granularStructure[section].durationSeconds)}</span>
                        </div>
                        <input type="range" min="5" max="300" step="5" value={granularStructure[section].durationSeconds} onChange={(e) => updateGranular(section, 'durationSeconds', parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg accent-blue-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title={t.theme_lyrics} icon={PenTool} defaultOpen={true} onRandomize={randomizeLyrics}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[9px] font-black text-zinc-500 uppercase">{t.instrumental}</label>
                    <button onClick={() => setIsInstrumental(!isInstrumental)} className={`px-2 py-1 rounded-lg border transition-all ${isInstrumental ? 'bg-yellow-600 border-transparent text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{isInstrumental ? 'ON' : 'OFF'}</button>
                  </div>
                  {!isInstrumental && (
                    <>
                      <textarea value={lyricsTheme} onChange={(e) => setLyricsTheme(e.target.value)} placeholder={t.theme_placeholder} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-xs h-24 outline-none resize-none focus:border-green-500 transition-colors" />
                      <button onClick={handleGetLyricSuggestions} disabled={isSuggestingLyrics} className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-800 text-[10px] font-black uppercase rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all">
                        {isSuggestingLyrics ? <RefreshCw className="w-3 h-3 animate-spin" /> : <MessageSquareQuote size={14} className="text-yellow-500" />} Suggerisci Narrative
                      </button>
                      <div className="space-y-2">
                        {lyricSuggestions.map((s, idx) => <button key={idx} onClick={() => setLyricsTheme(s)} className="w-full text-left p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] italic text-zinc-400 hover:border-green-500/50 transition-colors">"{s}"</button>)}
                      </div>
                    </>
                  )}
                </div>
              </CollapsibleSection>

              <Button onClick={handleGenerate} disabled={isLoading} className="w-full h-12 uppercase mt-4">
                {isLoading ? <RefreshCw className="animate-spin" /> : <Wand2 size={18} />} GENERA PROMPT
              </Button>
            </div>

            <div className="lg:col-span-8">
              {promptData ? (
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-green-500 via-yellow-500 to-red-500" />
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{promptData.title}</h2>
                        <div className="flex gap-1">
                           <button 
                            onClick={() => {
                              navigator.clipboard.writeText(promptData.title);
                            }} 
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-green-500 rounded transition-all border border-zinc-700"
                            title="Copia Titolo"
                          >
                            <Copy size={14} />
                          </button>
                          <button 
                            onClick={handleRegenerateTitle} 
                            disabled={isRegeneratingTitle}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-yellow-500 rounded transition-all border border-zinc-700 disabled:opacity-50"
                            title="Rigenera Titolo"
                          >
                            {isRegeneratingTitle ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setPromptData(null)} className="p-2 text-zinc-500 hover:text-red-500"><Trash2 size={20}/></button>
                      <CopyButton text={`${promptData.styleParams}\n\n${promptData.lyricsAndStructure}`} />
                    </div>
                  </div>
                  <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <label className="text-[10px] text-green-500 font-black uppercase tracking-widest flex justify-between items-center">
                        Style Params
                        <CopyButton text={promptData.styleParams} size={14} className="py-1 px-2" />
                      </label>
                      <div className="p-4 bg-black/60 border border-zinc-800 rounded-xl font-mono text-[12px] text-green-400 leading-relaxed backdrop-blur-sm">{promptData.styleParams}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-yellow-500 font-black uppercase tracking-widest flex justify-between items-center">
                        Lyrics & Structure
                        <CopyButton text={promptData.lyricsAndStructure} size={14} className="py-1 px-2" />
                      </label>
                      <div className="p-4 bg-black/60 border border-zinc-800 rounded-xl font-mono text-[12px] text-zinc-300 whitespace-pre-wrap max-h-[500px] overflow-y-auto scrollbar-thin leading-relaxed backdrop-blur-sm">{promptData.lyricsAndStructure}</div>
                    </div>
                  </div>
                </div>
              ) : isLoading ? <LoadingSpinner /> : (
                <div className="h-[500px] border-2 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center text-zinc-800">
                  <Disc className="w-16 h-16 mb-4 animate-spin-slow text-zinc-900" />
                  <p className="font-black uppercase tracking-widest text-zinc-700">In attesa di input</p>
                  <p className="text-[10px] uppercase font-bold text-zinc-800 mt-2 text-center max-w-xs">Personalizza i parametri o usa Orchestrazione Smart per sbloccare la creatività</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
