import React, { useState, useEffect } from 'react';
import { BookAnalysis, UserAccount, SavedBook } from './types';
import FlowchartView from './components/FlowchartView';
import WeeklyActionPlan from './components/WeeklyActionPlan';
import PricingSection from './components/PricingSection';
import { AuthModal, UpgradeModal } from './components/AuthModals';
import { 
  BookOpen, Search, Sparkles, CheckCircle, ArrowRight, Clock, 
  User, Check, BookMarked, Lock, Landmark, Award, ShieldCheck, 
  HelpCircle, ChevronRight, RefreshCw, Star, Info, Crown, LogOut, ChevronDown 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_USER: UserAccount = {
  email: '',
  tier: 'free',
  isLoggedIn: false,
  savedBooks: []
};

// Generation status stages requested
const GENERATION_STAGES = [
  "Analyzing Book Metadata & Reviews...",
  "Extracting Core Structural Lessons...",
  "Building Flowchart & Knowledge Graph...",
  "Synthesizing 30-Day Action Plan roadmap...",
  "Assembling Premium SaaS dashboard..."
];

export default function App() {
  const [user, setUser] = useState<UserAccount>(() => {
    try {
      const stored = localStorage.getItem('b2a_user_account');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not read local user account", e);
    }
    return INITIAL_USER;
  });

  const [bookTitleQuery, setBookTitleQuery] = useState('');
  const [analysisResult, setAnalysisResult] = useState<BookAnalysis | null>(null);
  
  // Tab Switcher inside active book results
  const [activeTab, setActiveTab] = useState<'plan' | 'summary' | 'chart' | 'concepts'>('plan');

  // Load state and progress stage timers
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStageIndex, setGenerationStageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Modals view controllers
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem('b2a_user_account', JSON.stringify(user));
    } catch (e) {
      console.warn("Could not write user account data", e);
    }
  }, [user]);

  // Stage rotation effect for loading
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationStageIndex((prev) => {
          if (prev < GENERATION_STAGES.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2200);
    } else {
      setGenerationStageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Handle book analysis trigger
  const handleAnalyze = async (titleToQuery: string) => {
    const trimmedTitle = titleToQuery.trim();
    if (!trimmedTitle) return;

    setErrorMessage('');

    // check limits under free tier
    if (user.tier === 'free' && user.savedBooks.length >= 1) {
      // already simulated one book
      setIsUpgradeOpen(true);
      setErrorMessage("Free plan is limited to 1 Book analysis only. Upgrade to unlock unlimited analyses!");
      return;
    }

    setIsGenerating(true);
    setGenerationStageIndex(0);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookTitle: trimmedTitle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Check if server indicated lack of keys but offered demo
        if (response.status === 503 && errorData.isDemoOptionAvailable) {
          throw new Error("Missing Server API Configuration. Proceeding to serve localized demo dataset.");
        }
        throw new Error(errorData.error || "An irregular error happened during the analysis request.");
      }

      const analyzedJson: BookAnalysis = await response.json();
      
      // Save book with unique ID
      const newSavedBook: SavedBook = {
        id: `book_${Date.now()}`,
        title: analyzedJson.title,
        author: analyzedJson.author,
        tagline: analyzedJson.tagline,
        timestamp: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        data: analyzedJson
      };

      setUser(prev => ({
        ...prev,
        savedBooks: [newSavedBook, ...prev.savedBooks]
      }));

      setAnalysisResult(analyzedJson);
      setActiveTab('plan'); // default tab
      setBookTitleQuery('');
    } catch (err: any) {
      console.error(err);
      // Let's degrade gracefully: If there is no server config of keys, let's offer immediate demo loading instead
      setErrorMessage(err.message || "Failed to contact analysis server.");
      // Auto fallback load demo data to provide premium experience if no key is supplied
      loadDemoData();
    } finally {
      setIsGenerating(false);
    }
  };

  // View static demo habits book payload immediately
  const loadDemoData = async () => {
    setIsGenerating(true);
    setGenerationStageIndex(0);
    setErrorMessage('');

    try {
      const response = await fetch("/api/demo");
      const analyzedJson: BookAnalysis = await response.json();

      // Check if demo already exists in history to avoid duplication
      const alreadySaved = user.savedBooks.find(b => b.title.toLowerCase().includes("atomic"));
      if (!alreadySaved) {
        const newSavedBook: SavedBook = {
          id: `book_demo_${Date.now()}`,
          title: analyzedJson.title,
          author: analyzedJson.author,
          tagline: analyzedJson.tagline,
          timestamp: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          data: analyzedJson
        };

        setUser(prev => ({
          ...prev,
          savedBooks: [newSavedBook, ...prev.savedBooks]
        }));
      }

      setAnalysisResult(analyzedJson);
      setActiveTab('plan');
      setBookTitleQuery('');
    } catch (err) {
      console.error("Could not lead fallback payload", err);
      setErrorMessage("Could not load backup demo data. Check your network connector.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Sign out
  const handleSignOut = () => {
    setUser(INITIAL_USER);
    setAnalysisResult(null);
    localStorage.removeItem('b2a_user_account');
  };

  // Sign up success callback
  const handleAuthSuccess = (email: string) => {
    setUser(prev => ({
      ...prev,
      email,
      isLoggedIn: true
    }));
  };

  // Payment Upgrade Success Callback
  const handleUpgradeSuccess = () => {
    setUser(prev => ({
      ...prev,
      tier: 'premium'
    }));
  };

  const handleSavedBookClick = (book: SavedBook) => {
    setAnalysisResult(book.data);
    setActiveTab('plan');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const currentActiveBookIndexInHistory = analysisResult 
    ? user.savedBooks.findIndex(b => b.title === analysisResult.title) 
    : -1;

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans selection:bg-blue-100 bg-[#FFFFFF] text-[#111111] antialiased">
      {/* Start-Up Header Navigation Bar */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand Title */}
          <div 
            onClick={() => {
              setAnalysisResult(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="p-2 bg-brand text-white rounded-xl shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 group-hover:text-brand transition-colors">
                Book2Action
              </span>
              <span className="text-[9px] text-[#64748B] font-mono leading-none tracking-widest font-bold">
                KNOWLEDGE INTO IMPACT
              </span>
            </div>
          </div>

          {/* User Account Bar Actions */}
          <div className="flex items-center gap-3">
            {user.isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Tier display */}
                {user.tier === 'premium' ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold px-3 py-1 rounded-full shadow-sm border border-amber-400">
                    <Crown size={11} /> PRO PREMIUM
                  </span>
                ) : (
                  <button 
                    onClick={() => setIsUpgradeOpen(true)}
                    className="text-[10px] text-brand bg-blue-50 hover:bg-blue-100 font-extrabold px-3 py-1.5 rounded-full border border-blue-100 transition-colors cursor-pointer"
                  >
                    Upgrade to Pro — $5
                  </button>
                )}

                {/* Profile info block */}
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/50 p-1.5 pl-3 rounded-full">
                  <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate hidden md:inline">
                    {user.email}
                  </span>
                  <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] uppercase font-bold text-slate-700 font-mono">
                    {user.email.charAt(0)}
                  </div>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthOpen(true);
                  }}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 cursor-pointer transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setIsAuthOpen(true);
                  }}
                  className="text-xs font-extrabold bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer border-none"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Workspace Area */}
      <main className="flex-1">
        
        {/* Landing/Hero Section — Shown when no book is active or during active homepage views */}
        <AnimatePresence mode="wait">
          {!analysisResult && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16"
            >
              {/* Central Premium Hero Text with search inputs */}
              <div className="text-center space-y-6 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EFF6FF] border border-blue-100 text-[#2563EB] text-xs font-extrabold tracking-tight animate-fade-in mb-2">
                  <Sparkles size={13} />
                  <span>Powered by Gemini Artificial Intelligence</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-[#111111] tracking-tight leading-none">
                  Turn Knowledge <br className="sm:hidden" />
                  <span className="text-[#2563EB] bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Into Action</span>
                </h1>

                <p className="text-sm sm:text-lg text-[#64748B] font-light max-w-2xl mx-auto leading-relaxed">
                  Transform any nonfiction book into actionable insights, visual flowcharts, key concepts, and a personalized 30-day implementation roadmap.
                </p>

                {/* Main Instant search block with warning overlays */}
                <div className="max-w-xl mx-auto pt-4 space-y-2">
                  <div className="flex bg-white rounded-2xl border-2 border-slate-200 focus-within:border-brand shadow-sm focus-within:shadow p-1.5 transition-all">
                    <div className="flex items-center pl-3 text-slate-400">
                      <Search size={18} />
                    </div>
                    <input
                      type="text"
                      value={bookTitleQuery}
                      onChange={(e) => setBookTitleQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze(bookTitleQuery)}
                      placeholder="Enter book title (e.g. Atomic Habits, Thinking Fast and Slow)..."
                      className="w-full pl-2.5 pr-4 py-2 bg-transparent text-xs sm:text-sm font-semibold outline-none placeholder:text-slate-400"
                    />
                    <button
                      onClick={() => handleAnalyze(bookTitleQuery)}
                      className="bg-brand hover:bg-[#1D4ED8] text-white font-extrabold text-xs px-4 py-2 sm:px-5 grow-0 shrink-0 select-none rounded-xl cursor-pointer transition-all flex items-center gap-1 shrink-0 border-none"
                    >
                      <span>Analyze</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2.5 pt-2 text-xs">
                    <button 
                      onClick={loadDemoData}
                      className="text-slate-500 hover:text-brand font-bold underline transition-colors cursor-pointer"
                    >
                      View Live Demo of "Atomic Habits"
                    </button>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-400 font-light flex items-center gap-1">
                      <Clock size={12} /> Instant 3s Load
                    </span>
                  </div>

                  {errorMessage && (
                    <p className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
                      {errorMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* Graphical Process Flow diagram: Book -> AI Analysis -> Action Plan -> Results */}
              <div className="bg-[#F8FAFC]/55 rounded-3xl border border-slate-100 p-8 sm:p-12 max-w-5xl mx-auto shadow-sm">
                <span className="text-[10px] font-mono text-center block uppercase tracking-wider font-extrabold text-slate-400 mb-8">
                  Engine Architecture Protocol
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                  {/* Step 1 */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-xs flex flex-col justify-between items-start space-y-4">
                    <span className="bg-blue-50 text-brand text-xs font-extrabold h-6 w-6 rounded-lg flex items-center justify-center">1</span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">Enter Book Title</h4>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">Specify any non-fiction masterpiece, leadership journal, or case study.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-xs flex flex-col justify-between items-start space-y-4">
                    <span className="bg-[#F5F0FF] text-[#5B21B6] text-xs font-extrabold h-6 w-6 rounded-lg flex items-center justify-center">2</span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">AI Cognitive Sweep</h4>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">Gemini processes core ideas, lessons, logical progressive links, and frameworks.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-xs flex flex-col justify-between items-start space-y-4">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold h-6 w-6 rounded-lg flex items-center justify-center">3</span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">Interactive Blueprint</h4>
                      <p className="text-xs text-slate-500 font-light leading-relaxed font-normal">Generate 30-day checklist roadmaps, concept priorities, and dynamic SVG nodes.</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-xs flex flex-col justify-between items-start space-y-4">
                    <span className="bg-orange-50 text-orange-700 text-xs font-extrabold h-6 w-6 rounded-lg flex items-center justify-center">4</span>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">Take Daily Action</h4>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">Check off specific steps daily. Embed habits permanently into identity.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SaaS pricing blocks section directly on landing block */}
              <div className="pt-8">
                <PricingSection 
                  activeTier={user.tier} 
                  onUpgradeClick={() => {
                    if (!user.isLoggedIn) {
                      setAuthMode('signup');
                      setIsAuthOpen(true);
                      return;
                    }
                    setIsUpgradeOpen(true);
                  }} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic AI Generation loading view */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 sm:py-32 flex flex-col items-center justify-center max-w-xl mx-auto px-4 text-center space-y-6"
            >
              <div className="relative">
                {/* Loader animation ring */}
                <div className="h-20 w-20 rounded-full border-4 border-slate-100 border-t-brand animate-spin" />
                <span className="absolute inset-0 flex items-center justify-center text-brand">
                  <BookOpen size={24} className="animate-bounce" />
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-brand uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block">
                  AI Processing Workspace
                </span>
                <h3 className="text-lg font-extrabold text-slate-800">Synthesizing Actions</h3>
                <p className="text-xs text-slate-500 font-medium">Please stand by while Gemini extracts knowledge structures.</p>
              </div>

              {/* Progress Stage Tracker requested */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative border border-slate-200/54">
                <div 
                  className="bg-brand h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${((generationStageIndex + 1) / GENERATION_STAGES.length) * 100}%` }}
                />
              </div>

              {/* Current Stage description text animated */}
              <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-150 inline-block transition-transform">
                Stage {generationStageIndex + 1}: {GENERATION_STAGES[generationStageIndex]}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Analytical Dashboard View */}
        <AnimatePresence>
          {analysisResult && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10"
            >
              {/* Back to top banner or selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50 px-6 py-4 rounded-3xl border border-slate-200/60 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold tracking-widest bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded border border-blue-100">
                      Active Analytics
                    </span>
                    <span className="text-[10px] text-slate-400 font-light">Author: {analysisResult.author}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {analysisResult.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium italic">
                    "{analysisResult.tagline}"
                  </p>
                </div>

                {/* Query another book directly from active board */}
                <div className="flex gap-2 w-full sm:w-auto shrink-0 select-none">
                  <button
                    onClick={() => {
                      setAnalysisResult(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#EFF6FF] text-[#2563EB] hover:bg-blue-100 transition-colors border-none cursor-pointer"
                  >
                    Query Another Book
                  </button>
                </div>
              </div>

              {/* Dynamic split view containing timeline search history list (left panel) and Active Tab panel (right panel) */}
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Saved list history timelines sidebar */}
                {user.savedBooks.length > 0 && (
                  <div className="w-full lg:w-[260px] bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-4 shrink-0 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                      <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                        <BookMarked size={14} className="text-brand" /> Saved Summaries ({user.savedBooks.length})
                      </h4>
                      {user.tier === 'free' && (
                        <span className="text-[9px] font-bold text-slate-400">1 max</span>
                      )}
                    </div>

                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                      {user.savedBooks.map((savedBook) => {
                        const isActive = analysisResult.title === savedBook.title;

                        return (
                          <button
                            key={savedBook.id}
                            onClick={() => handleSavedBookClick(savedBook)}
                            className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-start gap-2.5 cursor-pointer outline-none ${
                              isActive 
                                ? 'bg-white border-brand shadow-sm text-slate-900 ring-2 ring-brand-light/20 font-bold' 
                                : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-600'
                            }`}
                          >
                            <BookOpen size={13} className={`mt-0.5 shrink-0 ${isActive ? 'text-brand' : 'text-slate-400'}`} />
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <p className="font-bold truncate leading-snug">{savedBook.title}</p>
                              <p className="text-[10px] text-slate-400 truncate font-light leading-none">{savedBook.author}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-slate-400 leading-normal bg-white p-2.5 rounded-xl border border-slate-100">
                      Your analysis sessions are automatically synced with your local personal workspace.
                    </p>
                  </div>
                )}

                {/* Dashboard primary tabs container */}
                <div className="flex-1 w-full space-y-6">
                  
                  {/* Tabs layout switcher */}
                  <div className="flex border-b border-slate-200 overflow-x-auto gap-4">
                    <button
                      onClick={() => setActiveTab('plan')}
                      className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all outline-none cursor-pointer whitespace-nowrap px-1.5 ${
                        activeTab === 'plan' 
                          ? 'border-brand text-brand font-black' 
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      30-Day Action Plan
                    </button>
                    <button
                      onClick={() => setActiveTab('summary')}
                      className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all outline-none cursor-pointer whitespace-nowrap px-1.5 flex items-center gap-1 ${
                        activeTab === 'summary' 
                          ? 'border-brand text-brand font-black' 
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Complete Book Summary
                      {user.tier === 'free' && <Lock size={12} className="text-slate-400" />}
                    </button>
                    <button
                      onClick={() => setActiveTab('chart')}
                      className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all outline-none cursor-pointer whitespace-nowrap px-1.5 flex items-center gap-1 ${
                        activeTab === 'chart' 
                          ? 'border-brand text-brand font-black' 
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Interactive Flowchart Map
                      {user.tier === 'free' && <Lock size={12} className="text-slate-400" />}
                    </button>
                    <button
                      onClick={() => setActiveTab('concepts')}
                      className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all outline-none cursor-pointer whitespace-nowrap px-1.5 flex items-center gap-1 ${
                        activeTab === 'concepts' 
                          ? 'border-brand text-brand font-black' 
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Key Concepts Analyzer
                      {user.tier === 'free' && <Lock size={12} className="text-slate-400" />}
                    </button>
                  </div>

                  {/* Tab Active Content Panel with protection walls */}
                  <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                      
                      {/* ACTION PLAN — ALWAYS AVAILABLE */}
                      {activeTab === 'plan' && (
                        <motion.div
                          key="plan"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                        >
                          <WeeklyActionPlan 
                            actionPlan={analysisResult.actionPlan} 
                            bookTitle={analysisResult.title} 
                          />
                        </motion.div>
                      )}

                      {/* COMPLETE BOOK SUMMARY */}
                      {activeTab === 'summary' && (
                        <motion.div
                          key="summary"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                        >
                          {user.tier === 'free' ? (
                            <div className="bg-slate-50 rounded-3xl border border-slate-200/60 p-8 text-center space-y-6 max-w-lg mx-auto py-12">
                              <Lock size={44} className="text-slate-400 mx-auto" />
                              <div className="space-y-2">
                                <h4 className="text-lg font-black text-slate-800">Complete Summary is Locked</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                  You are currently utilizing our free plan which disables access to premium synthesis chapters and executive frameworks.
                                </p>
                              </div>
                              <button
                                onClick={() => setIsUpgradeOpen(true)}
                                className="px-5 py-2.5 bg-brand hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl shadow cursor-pointer border-none"
                              >
                                Upgrade to Premium for $5/mo
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* Main idea block */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                                  <span className="text-[9px] uppercase font-extrabold text-brand tracking-widest bg-blue-50 px-2.5 py-1 rounded">
                                    Main Philosophical Idea
                                  </span>
                                  <p className="text-sm font-medium text-slate-700 leading-relaxed font-light">
                                    {analysisResult.summary.mainIdea}
                                  </p>
                                </div>

                                <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-3">
                                  <span className="text-[9px] uppercase font-extrabold text-[#AE7AFF] tracking-widest bg-[#F5F0FF] px-2.5 py-1 rounded">
                                    Core Thesis Focus
                                  </span>
                                  <p className="text-sm font-medium text-slate-700 leading-relaxed font-light">
                                    {analysisResult.summary.coreThesis}
                                  </p>
                                </div>
                              </div>

                              {analysisResult.summary.keyBonusQuote && (
                                <div className="bg-slate-50 border-l-4 border-brand p-5 rounded-r-2xl italic text-slate-600 font-serif text-sm">
                                  "{analysisResult.summary.keyBonusQuote}"
                                </div>
                              )}

                              {/* Executive lessons */}
                              <div className="space-y-4">
                                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">
                                  Essential Chapter Lessons Summaries
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {analysisResult.summary.keyLessons.map((lesson, idx) => (
                                    <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-1.5 hover:bg-slate-100/40 transition-colors">
                                      <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                                        <span className="h-5 w-5 bg-white rounded-md border text-[10px] text-slate-500 font-bold flex items-center justify-center">
                                          {idx + 1}
                                        </span>
                                        {lesson.title}
                                      </h4>
                                      <p className="text-xs text-slate-500 leading-normal font-light">
                                        {lesson.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Mentall Framework Model */}
                              <div className="space-y-4 pt-4">
                                <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">
                                  Strategic Mental Models & Frameworks
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                  {analysisResult.summary.importantFrameworks.map((fw, idx) => (
                                    <div key={idx} className="bg-white border-2 border-slate-200/60 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                                      <div className="space-y-1 md:max-w-xl">
                                        <h4 className="text-sm font-bold text-brand">{fw.name}</h4>
                                        <p className="text-xs text-slate-500 leading-normal font-light">{fw.description}</p>
                                      </div>
                                      <div className="bg-[#EFF6FF] border border-blue-100 p-3.5 rounded-xl md:w-80 shrink-0">
                                        <span className="text-[8px] font-bold text-brand uppercase tracking-wider block mb-1">How To Apply:</span>
                                        <p className="text-xs text-slate-700 leading-normal font-semibold font-sans">{fw.howToApply}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Takeaways */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50 space-y-3">
                                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Empirical General Insights</h4>
                                  <ul className="space-y-2.5 text-xs text-slate-600">
                                    {analysisResult.summary.practicalInsights.map((ins, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <Check size={14} className="text-[#AE7AFF] shrink-0 mt-0.5" />
                                        <span>{ins}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50 space-y-3">
                                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Immediate Daily Actionables</h4>
                                  <ul className="space-y-2.5 text-xs text-slate-600">
                                    {analysisResult.summary.actionableTakeaways.map((take, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <Check size={14} className="text-brand shrink-0 mt-0.5" />
                                        <span>{take}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* INTERACTIVE FLOWCHART MAP */}
                      {activeTab === 'chart' && (
                        <motion.div
                          key="chart"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                        >
                          {user.tier === 'free' ? (
                            <div className="bg-slate-50 rounded-3xl border border-slate-200/60 p-8 text-center space-y-6 max-w-lg mx-auto py-12">
                              <Lock size={44} className="text-slate-400 mx-auto" />
                              <div className="space-y-2">
                                <h4 className="text-lg font-black text-slate-800">Visual Flowchart is Locked</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                  You are currently utilizing our free plan. Interactive SVG mapping and hierarchy nodes expansion requires Premium plan membership.
                                </p>
                              </div>
                              <button
                                onClick={() => setIsUpgradeOpen(true)}
                                className="px-5 py-2.5 bg-brand hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl shadow cursor-pointer border-none"
                              >
                                Upgrade to Premium for $5/mo
                              </button>
                            </div>
                          ) : (
                            <FlowchartView 
                              flowchart={analysisResult.flowchart} 
                              bookTitle={analysisResult.title} 
                            />
                          )}
                        </motion.div>
                      )}

                      {/* KEY CONCEPTS ANALYZER */}
                      {activeTab === 'concepts' && (
                        <motion.div
                          key="concepts"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                        >
                          {user.tier === 'free' ? (
                            <div className="bg-slate-50 rounded-3xl border border-slate-200/60 p-8 text-center space-y-6 max-w-lg mx-auto py-12">
                              <Lock size={44} className="text-slate-400 mx-auto" />
                              <div className="space-y-2">
                                <h4 className="text-lg font-black text-slate-800">Concepts Analyzer is Locked</h4>
                                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                                  Analyze specific mental scores and priority weight matrices inside the premium platform tier.
                                </p>
                              </div>
                              <button
                                onClick={() => setIsUpgradeOpen(true)}
                                className="px-5 py-2.5 bg-brand hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl shadow cursor-pointer border-none"
                              >
                                Upgrade to Premium for $5/mo
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {analysisResult.concepts.map((concept, idx) => (
                                  <div key={idx} className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 hover:border-slate-200 transition-colors">
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                      <h4 className="font-extrabold text-base text-slate-800">
                                        {concept.conceptName}
                                      </h4>
                                      {/* Radial priority ring indicator */}
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <div className="text-right">
                                          <span className="text-[10px] text-slate-400 font-medium block leading-none">Weight</span>
                                          <span className="text-xs font-bold font-mono text-[#2563EB]">{concept.importanceScore}%</span>
                                        </div>
                                        <svg className="h-9 w-9 -rotate-90">
                                          <circle cx="18" cy="18" r="14" className="stroke-slate-100 fill-none" strokeWidth="2.5" />
                                          <circle cx="18" cy="18" r="14" className="stroke-brand fill-none" strokeWidth="3" strokeDasharray={87.9} strokeDashoffset={87.9 - (87.9 * concept.importanceScore) / 100} />
                                        </svg>
                                      </div>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                      <div>
                                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">Explanation</span>
                                        <p className="text-slate-600 leading-relaxed font-light">{concept.explanation}</p>
                                      </div>

                                      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                                        <span className="text-[9px] uppercase tracking-wider text-brand font-bold block mb-1">Practical Application</span>
                                        <p className="text-slate-700 leading-normal font-semibold">{concept.practicalApplication}</p>
                                      </div>

                                      <div className="flex flex-wrap gap-1.5 pt-2">
                                        {concept.relatedConcepts.map((tag, i) => (
                                          <span key={i} className="text-[9px] bg-[#F5F0FF] text-[#5B21B6] border border-[#E9D5FF] px-2.5 py-0.5 rounded-full font-bold">
                                            #{tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Structured SaaS Product Footer */}
      <footer className="bg-slate-50 border-t border-slate-200/60 py-10 text-xs text-slate-500 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-200/50 pb-6">
            <div className="flex items-center gap-2">
              <span className="p-1 text-slate-400 bg-slate-200 rounded">
                <BookOpen size={14} />
              </span>
              <span className="font-extrabold text-[#111111]">Book2Action</span>
            </div>
            <p className="font-light text-center sm:text-left leading-normal max-w-sm">
              Our service organizes theoretical literature ideas into structured, measurable behavior steps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-light">&copy; {new Date().getFullYear()} Book2Action. All simulated systems active.</p>
            <div className="flex items-center gap-3 font-medium">
              <span className="text-slate-400">Environment Node: Cloud Native v4.2</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">Simulated Stripe Billing Sandbox</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modals Wrapper */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={handleAuthSuccess} 
        initialMode={authMode} 
      />

      {/* Premium Upgrade Modal */}
      <UpgradeModal 
        isOpen={isUpgradeOpen} 
        onClose={() => setIsUpgradeOpen(false)} 
        onSuccess={handleUpgradeSuccess} 
      />
    </div>
  );
}
