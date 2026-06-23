import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Smile, Calendar, List, ChevronDown, ChevronUp, Save, CheckCircle2, LogOut, User, Activity, Flame, Target, CheckSquare, Square, Download, Sun, Moon, Brain, PieChart as PieIcon, Shield, Search, Quote, AlertCircle, Trophy } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const timeOrder = [
  "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM",
  "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"
];

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#8b5cf6', '#a855f7', '#06b6d4', '#6b7280'];

const QUOTES = [
  "Small sequential updates build massive enterprise code architectures.",
  "Your aura parameters scale exactly matching your operational hours efficiency.",
  "Horspool matching checks exceptions instantly; logic sync is king.",
  "Consistency is the core runtime thread of success. Keep logging!",
  "Clean full stack data processing ensures zero latency workspace progress."
];

export default function Dashboard({ user, onLogout }) {
  const [logId, setLogId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [happyMoment, setHappyMoment] = useState('');
  const [history, setHistory] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [activeTab, setActiveTab] = useState('today'); 
  const [saveStatus, setSaveStatus] = useState({});

  const [darkMode, setDarkMode] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ full_name: '', age: '', gender: '', phone: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuote, setActiveQuote] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [goals, setGoals] = useState([
    { id: 1, text: 'Leetcode Sessions', completed: false },
    { id: 2, text: 'Interact with parents', completed: false },
    { id: 3, text: 'Gym Session', completed: false },
    { id: 4, text: 'Post updates on LinkedIn', completed: false },
  ]);

  const todayDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const todayDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * QUOTES.length);
    setActiveQuote(QUOTES[randomIdx]);
  }, [activeTab]);

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const calculateAuraScore = () => {
    if (!slots || slots.length === 0) return 0;
    const filledSlots = slots.filter(slot => slot.activity && slot.activity.trim().length > 0).length;
    return Math.round((filledSlots / slots.length) * 100);
  };

  const getAuraBadge = (score) => {
    if (score < 30) return { title: 'Aura Beginner 🛡️', color: 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20' };
    if (score <= 70) return { title: 'Aura Knight ⚡', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' };
    return { title: 'Aura Master 🔥', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]' };
  };

  const calculateRealStreak = () => {
    if (!history || history.length === 0) return logId ? 1 : 0;
    const uniqueDates = [...new Set(history.map(item => item.log_date))].sort((a, b) => new Date(b) - new Date(a));
    let todayStr = new Date().toISOString().split('T')[0];
    let expectedDate = new Date(todayStr);
    if (!uniqueDates.includes(todayStr)) expectedDate.setDate(expectedDate.getDate() - 1);
    let streak = 0;
    for (let i = 0; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === expectedDate.toISOString().split('T')[0]) { streak++; expectedDate.setDate(expectedDate.getDate() - 1); }
      else break;
    }
    if (logId && !uniqueDates.includes(todayStr)) streak++;
    return streak || 1;
  };

  const countRealFocusHours = () => {
    if (!slots) return 0;
    return slots.filter(slot => slot.activity && slot.activity.trim().length > 0 && slot.category === 'Coding/Project').length;
  };

  const getPieData = () => {
    const counts = { 'Food': 0, 'Scrolling Reels': 0, 'Coding/Project': 0, 'Gym': 0, 'Online Games': 0, 'Listening class': 0, 'Sleep': 0, 'Cricket': 0, 'General': 0 };
    if (!slots) return [];
    slots.forEach(s => {
      if (s.activity && s.activity.trim().length > 0) {
        const cat = s.category || 'General';
        if (counts[cat] !== undefined) counts[cat] = counts[cat] + 1;
        else counts['General'] = counts['General'] + 1;
      }
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] })).filter(item => item.value > 0);
  };

  const getChartData = () => {
    if (!history || history.length === 0) return [{ name: todayDate, aura: calculateAuraScore() }];
    return [...history].reverse().map(item => {
      const filled = item.hourly_slots?.filter(s => s.activity && s.activity.trim().length > 0).length || 0;
      return { name: new Date(item.log_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), aura: Math.round((filled / 16) * 100) };
    });
  };

  const getFilteredHistory = () => {
    if (!history) return [];
    if (!searchQuery.trim()) return history;
    return history.filter(log => {
      const dStr = new Date(log.log_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).toLowerCase();
      const dayStr = log.log_day?.toLowerCase() || '';
      const incidentStr = log.happy_moment?.toLowerCase() || '';
      return dStr.includes(searchQuery.toLowerCase()) || dayStr.includes(searchQuery.toLowerCase()) || incidentStr.includes(searchQuery.toLowerCase());
    });
  };

  const fetchLeaderboardMetrics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/analytics/leaderboard');
      if (response.data) setLeaderboard(response.data);
    } catch (err) {
      console.error("Error reading leaderboard:", err);
    }
  };

  const handleAiReflect = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/ai/reflect', { slots });
      setAiSummary(res.data.reflection);
      showNotification("🤖 AI Sync Reflection analysis complete!");
    } catch (err) { console.error(err); }
    setAiLoading(false);
  };

  const handleCSVExport = () => {
    if (!history || history.length === 0) return showNotification("History logs table is empty.", "error");
    let csvContent = "data:text/csv;charset=utf-8,Date,Day,Happy Incident,Time Slot,Category,Logged Activity\n";
    history.forEach(log => {
      log.hourly_slots?.forEach(slot => {
        csvContent += `"${log.log_date}","${log.log_day}","${log.happy_moment || ''}","${slot.time_slot}","${slot.category || 'General'}","${slot.activity || ''}"\n`;
      });
    });
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", "AuraSync_Report.csv"); link.click();
    showNotification("📥 CSV Report downloaded successfully!");
  };

  const fetchTodayLogs = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/logs/today', { userId: user.id });
      if (response.data.success) {
        setLogId(response.data.log.id);
        setHappyMoment(response.data.log.happy_moment || '');
        if (response.data.slots) {
          setSlots(response.data.slots.sort((a, b) => timeOrder.indexOf(a.time_slot) - timeOrder.indexOf(b.time_slot)));
        }
      }
    } catch (err) { console.error(err); }
  };

  const handleUpdateSlot = async (slotId, activity, category) => {
    setSaveStatus(prev => ({ ...prev, [slotId]: 'saving' }));
    const response = await axios.post('http://localhost:5000/api/logs/update-slot', { slotId, activity, category });
    if (response.data.success) {
      setSaveStatus(prev => ({ ...prev, [slotId]: 'saved' }));
      setTimeout(() => setSaveStatus(prev => ({ ...prev, [slotId]: null })), 2000);
      axios.get(`http://localhost:5000/api/logs/history/${user.id}`).then(res => setHistory(res.data));
      fetchLeaderboardMetrics(); 
    }
  };

  const handleUpdateIncident = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/logs/update-incident', { logId, happyMoment });
      if (response.data.success) {
        showNotification("✨ Happy incident logged securely into Supabase!");
        axios.get(`http://localhost:5000/api/logs/history/${user.id}`).then(res => setHistory(res.data));
      }
    } catch (err) { showNotification("Failed to log happy moment.", "error"); }
  };

  useEffect(() => { 
    if (user?.id) { 
      fetchTodayLogs(); 
      axios.get(`http://localhost:5000/api/profile/${user.id}`).then(res => { if (res.data) setProfile(res.data); }); 
      axios.get(`http://localhost:5000/api/logs/history/${user.id}`).then(res => { if (res.data) setHistory(res.data); });
      fetchLeaderboardMetrics();
    } 
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/profile/update', { id: user.id, ...profile });
      if (response.data.success) { 
        setShowProfile(false); 
        showNotification("✨ Profile updated inside Supabase safely!");
        fetchLeaderboardMetrics();
      }
    } catch (err) { showNotification("Failed profile sync setup.", "error"); }
  };

  const currentBadge = getAuraBadge(calculateAuraScore());

  return (
    <div className={`min-h-screen transition-all duration-500 relative overflow-hidden ${
      darkMode 
        ? 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-indigo-950/20 text-white' 
        : 'bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 text-slate-900'
    } px-4 py-8 pb-24`}>
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* ACTION HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-6 mb-4 gap-4 border border-white/10 backdrop-blur-xl p-5 rounded-3xl bg-neutral-900/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">AuraSync Timeline OS</h1>
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border backdrop-blur-md ${currentBadge.color}`}>
                {currentBadge.title}
              </span>
            </div>
            <p className="text-neutral-500 text-xs uppercase tracking-widest mt-1.5 font-semibold">Workspace Configuration Matrix</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <button onClick={() => setActiveTab('today')} className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase border transition-all duration-3xl ${activeTab === 'today' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-[0_4px_20px_rgba(99,102,241,0.3)]' : 'bg-neutral-900/40 text-neutral-400 border-white/5'}`}>Timeline</button>
            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase border transition-all duration-3xl ${activeTab === 'history' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-transparent shadow-[0_4px_20px_rgba(99,102,241,0.3)]' : 'bg-neutral-900/40 text-neutral-400 border-white/5'}`}>History</button>
            <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 bg-neutral-900/50 border border-white/5 rounded-xl text-amber-400">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-purple-400" />}
            </button>
            <button onClick={handleCSVExport} className="p-2.5 bg-neutral-900/50 border border-white/5 rounded-xl text-neutral-400 hover:text-emerald-400"><Download className="w-4 h-4" /></button>
            <button onClick={() => setShowProfile(true)} className="p-2.5 bg-neutral-900/50 border border-white/5 rounded-xl text-indigo-400"><User className="w-4 h-4" /></button>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* QUOTE BAR */}
        <div className="px-4 py-3 rounded-2xl flex items-center gap-2.5 mb-8 text-neutral-400 text-xs border border-white/5 backdrop-blur-md bg-neutral-950/40">
          <Quote className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="italic font-semibold tracking-wide">{activeQuote}</span>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="border border-white/10 p-6 rounded-3xl relative overflow-hidden backdrop-blur-xl bg-neutral-900/30">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">Productivity Aura</p>
            <h3 className="text-4xl font-black tracking-tighter text-indigo-400">{calculateAuraScore()}%</h3>
            <div className="w-full bg-neutral-950/60 h-1.5 rounded-full mt-4 overflow-hidden border border-white/5"><div style={{ width: `${calculateAuraScore()}%` }} className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full" /></div>
          </div>
          <div className="border border-white/10 p-6 rounded-3xl relative overflow-hidden backdrop-blur-xl bg-neutral-900/30">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">Logging Streak</p>
            <h3 className="text-4xl font-black tracking-tighter text-orange-400">{calculateRealStreak() < 10 ? `0${calculateRealStreak()}` : calculateRealStreak()} Days</h3>
            <p className="text-neutral-600 text-[10px] mt-2.5 font-medium">Verified sequence execution tracker active</p>
          </div>
          <div className="border border-white/10 p-6 rounded-3xl relative overflow-hidden backdrop-blur-xl bg-neutral-900/30">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">Core Tech Hours</p>
            <h3 className="text-4xl font-black tracking-tighter text-emerald-400">{countRealFocusHours()} Hours</h3>
            <p className="text-neutral-600 text-[10px] mt-2.5 font-medium">Active entries aligned with Coding/Project metric</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div key="t" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* TIMELINE FIELDS */}
              <div className="lg:col-span-2 space-y-4">
                <div className="border border-white/10 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md bg-neutral-900/20">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-sm text-neutral-200">{todayDate}</span>
                  </div>
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 font-bold text-[10px] uppercase tracking-widest rounded-full border border-indigo-500/20">{todayDay}</span>
                </div>

                <div className="space-y-3 max-h-[72vh] overflow-y-auto pr-2 custom-scrollbar">
                  {slots?.map(slot => {
                    const isBlankTimeGap = !slot.activity || slot.activity.trim().length === 0;
                    
                    return (
                      <div key={slot.id} className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-3xl backdrop-blur-md ${
                        isBlankTimeGap ? 'bg-amber-500/[0.01] border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.02)]' : 'bg-neutral-900/50 border-white/5'
                      }`}>
                        <span className="w-20 text-xs font-black tracking-tight flex items-center gap-2 text-neutral-400 shrink-0">
                          <Clock className={`w-3.5 h-3.5 ${isBlankTimeGap ? 'text-amber-500 animate-pulse' : 'text-neutral-600'}`} /> {slot.time_slot}
                        </span>
                        
                        <input 
                          type="text" value={slot.activity} 
                          onChange={e => setSlots(slots.map(s => s.id === slot.id ? { ...s, activity: e.target.value } : s))}
                          onKeyDown={e => { if (e.key === 'Enter') handleUpdateSlot(slot.id, slot.activity, slot.category); }}
                          placeholder={isBlankTimeGap ? "⚠️ TIME GAP ALERT: Log your activity here..." : "Track your slot metrics..."}
                          className="flex-1 bg-transparent border-none text-sm placeholder:text-neutral-700 text-neutral-100 focus:ring-0 p-0"
                        />

                        <select 
                          value={slot.category || 'General'}
                          onChange={e => setSlots(slots.map(s => s.id === slot.id ? { ...s, category: e.target.value } : s))}
                          className="bg-neutral-950 border border-white/5 text-neutral-400 text-xs p-1.5 rounded-xl focus:outline-none cursor-pointer font-medium"
                        >
                          <option value="General">General</option>
                          <option value="Food">Food</option>
                          <option value="Scrolling Reels">Scrolling Reels</option>
                          <option value="Coding/Project">Coding/Project</option>
                          <option value="Gym">Gym</option>
                          <option value="Online Games">Online Games</option>
                          <option value="Listening class">Listening class</option>
                          <option value="Sleep">Sleep</option>
                          <option value="Cricket">Cricket</option>
                        </select>

                        <button onClick={() => handleUpdateSlot(slot.id, slot.activity, slot.category)} className="p-2 bg-neutral-950/80 border border-white/5 hover:border-white/20 text-neutral-400 rounded-xl shrink-0 transition-all">
                          {saveStatus[slot.id] === 'saved' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* RIGHT SIDE PANEL */}
              <div className="space-y-6">
                
                {/* REAL-TIME DATABASE LEADERBOARD */}
                <div className="border border-white/10 p-5 rounded-3xl relative overflow-hidden backdrop-blur-xl bg-neutral-900/30">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                    <Trophy className="w-4 h-4 text-amber-400 shadow-sm animate-pulse" />
                    <h3 className="font-bold text-xs text-neutral-200 uppercase tracking-widest">Real-time Leaderboard</h3>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {leaderboard?.map((rankUser, index) => {
                      const isSelf = rankUser.id === user.id;
                      return (
                        <div key={rankUser.id} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          isSelf ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-black/30 border-white/5'
                        }`}>
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-black text-neutral-500 w-4">{index + 1}.</span>
                            <p className={`text-xs font-bold truncate max-w-[120px] ${isSelf ? 'text-indigo-400' : 'text-neutral-300'}`}>
                              {rankUser.name} {isSelf && '(You)'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 text-right shrink-0">
                            <span className="text-[9px] bg-neutral-950 text-neutral-500 px-1.5 py-0.5 rounded font-bold">{rankUser.streakDays}d</span>
                            <span className="text-xs font-black text-indigo-400">{rankUser.auraScore}%</span>
                          </div>
                        </div>
                      );
                    })}
                    {(!leaderboard || leaderboard.length === 0) && <p className="text-[10px] text-neutral-600 text-center py-4">Synchronizing user rows...</p>}
                  </div>
                </div>

                {/* AI MODULE */}
                <div className="border border-white/10 p-5 rounded-3xl relative overflow-hidden backdrop-blur-xl bg-neutral-900/30">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                    <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                    <h3 className="font-bold text-xs text-neutral-200 uppercase tracking-widest">AI Aura Sync Reflection</h3>
                  </div>
                  {aiSummary ? (
                    <p className="text-xs bg-black/50 p-4 border border-white/5 rounded-2xl leading-relaxed text-purple-300 italic shadow-inner">{aiSummary}</p>
                  ) : (
                    <p className="text-xs text-neutral-500 italic leading-relaxed">Execute the dynamic AI processing analyzer model map matching your current sequence logging parameters.</p>
                  )}
                  <button onClick={handleAiReflect} disabled={aiLoading} className="w-full mt-4 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg hover:opacity-90 transition-all">
                    {aiLoading ? "Engine Analyzing..." : "Generate AI Reflection"}
                  </button>
                </div>

                {/* HAPPY INCIDENT */}
                <div className="border border-white/10 p-5 rounded-3xl backdrop-blur-xl bg-neutral-900/30">
                  <div className="flex items-center gap-2.5 border-b border-white/5 pb-3 mb-4">
                    <Smile className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-xs text-neutral-200 uppercase tracking-widest">Today's Happy Moment</h3>
                  </div>
                  <textarea 
                    value={happyMoment} 
                    onChange={(e) => setHappyMoment(e.target.value)}
                    placeholder="Record any special incidents, unexpected wins, or cheerful things that happened today..."
                    className="w-full h-24 bg-black/40 border border-white/5 rounded-2xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500/50 resize-none placeholder:text-neutral-700 transition-all"
                  />
                  <button onClick={handleUpdateIncident} className="w-full mt-3 py-2.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/20 hover:border-transparent font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md">
                    Log Happy Incident
                  </button>
                </div>

                {/* PIE CHART VISUAL */}
                <div className="border border-white/10 p-5 rounded-3xl backdrop-blur-xl bg-neutral-900/30">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-3">
                    <PieIcon className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-xs text-neutral-200 uppercase tracking-widest">Category Density Map</h3>
                  </div>
                  {getPieData().length === 0 ? (
                    <p className="text-xs text-neutral-600 text-center py-6 italic">No category payload mapped.</p>
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={getPieData()} cx="50%" cy="50%" innerRadius={42} outerRadius={60} paddingAngle={4} dataKey="value">
                            {getPieData().map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: 'rgba(255,255,255,0.1)', fontSize: '10px', borderRadius: '8px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="text-[10px] space-y-1.5 text-neutral-400 pl-2 max-h-36 overflow-y-auto custom-scrollbar">
                        {getPieData()?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 font-medium"><span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />{item.name} ({item.value})</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* CORE GOALS */}
                <div className="border border-white/10 p-5 rounded-3xl backdrop-blur-xl bg-neutral-900/30">
                  <h3 className="font-bold text-xs text-neutral-200 uppercase pb-3 mb-4 border-b border-white/5 flex items-center gap-2"><Target className="w-4 h-4 text-indigo-400" /> Core Task Matrix</h3>
                  <div className="space-y-2.5">
                    {goals.map(g => (
                      <div key={g.id} onClick={() => setGoals(goals.map(item => item.id === g.id ? { ...item, completed: !item.completed } : item))} className="flex items-start gap-3 p-3 bg-black/40 border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer select-none transition-all">
                        <div className="mt-0.5 text-neutral-600 shrink-0">{g.completed ? <CheckSquare className="w-4 h-4 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]" /> : <Square className="w-4 h-4" />}</div>
                        <p className={`text-xs leading-relaxed font-medium ${g.completed ? 'text-neutral-600 line-through' : 'text-neutral-300'}`}>{g.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* HISTORY PANEL */}
          {activeTab === 'history' && (
            <motion.div key="h" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              
              <div className="border border-white/10 p-6 rounded-3xl backdrop-blur-xl bg-neutral-900/30">
                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-indigo-400" /> Productivity Aura Trend Analyzer Chart</h3>
                <div className="w-full h-64 bg-black/40 p-2 rounded-2xl border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getChartData()} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <defs><linearGradient id="colorAura" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/><stop offset="95%" stopColor="#818cf8" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.4} />
                      <XAxis dataKey="name" stroke="#525252" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                      <YAxis stroke="#525252" domain={[0, 100]} style={{ fontSize: '10px' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: '#e5e5e5' }} />
                      <Area type="monotone" dataKey="aura" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAura)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex bg-neutral-900/50 border border-white/5 rounded-2xl px-3.5 py-2.5 items-center gap-2.5 max-w-md shadow-md backdrop-blur-md">
                <Search className="w-4 h-4 text-neutral-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter history log layers by dates or keyword nodes..." 
                  className="bg-transparent border-none p-0 text-xs text-neutral-200 placeholder:text-neutral-700 w-full focus:ring-0"
                />
              </div>

              <div className="border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl bg-neutral-900/30">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black/40 text-neutral-400 text-xs font-black uppercase tracking-widest border-b border-white/5"><th className="py-4 px-6">Date</th><th className="py-4 px-6">Day</th><th className="py-4 px-6">Special Happy Incident</th><th className="py-4 px-6 text-center">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-medium">
                      {getFilteredHistory()?.map(dayLog => (
                        <tr key={dayLog.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6 text-neutral-200">{new Date(dayLog.log_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="py-4 px-6"><span className="px-2.5 py-1 bg-neutral-800/60 text-neutral-400 text-xs font-bold rounded-lg border border-white/5">{dayLog.log_day}</span></td>
                          <td className="py-4 px-6 text-neutral-400 max-w-xs truncate italic">{dayLog.happy_moment || <span className="text-neutral-700">No incident recorded</span>}</td>
                          <td className="py-4 px-6 text-center"><button onClick={() => setExpandedRow(expandedRow === dayLog.id ? null : dayLog.id)} className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 px-3 py-2 rounded-xl border border-indigo-500/10 transition-all">{expandedRow === dayLog.id ? <><ChevronUp className="w-3.5 h-3.5" /> Close</> : <><ChevronDown className="w-3.5 h-3.5" /> Expand</>}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {expandedRow && (
                  <div className="bg-black/50 p-6 border-t border-white/5">
                    <h4 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> Expanded Hourly Matrix Layout</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {history.find(h => h.id === expandedRow)?.hourly_slots?.sort((a, b) => timeOrder.indexOf(a.time_slot) - timeOrder.indexOf(b.time_slot))?.map(hSlot => (
                        <div key={hSlot.id} className="bg-neutral-900/40 border border-white/5 rounded-2xl p-3.5 flex flex-col gap-1 shadow-sm">
                          <div className="flex justify-between items-center"><span className="text-xs text-indigo-400 font-bold tracking-wide">{hSlot.time_slot}</span><span className="text-[9px] bg-neutral-950 text-neutral-400 px-2 py-0.5 rounded-md font-black border border-white/5 uppercase tracking-wider">{hSlot.category || 'General'}</span></div>
                          <p className="text-sm text-neutral-300 min-h-[22px] mt-1 font-medium">{hSlot.activity || <span className="text-neutral-700 italic text-xs">Blank entry</span>}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {getFilteredHistory().length === 0 && <div className="text-center py-12 text-neutral-500 italic font-semibold">No history records matching search query logic parameters.</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PROFILE MODAL */}
        <AnimatePresence>
          {showProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }} className="bg-neutral-900/90 border border-white/10 w-full max-w-md rounded-3xl p-6 relative shadow-2xl text-white backdrop-blur-2xl">
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <Shield className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <h2 className="text-xl font-black bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent">User Profile Configuration</h2>
                </div>
                
                <div className="mb-4 p-3 bg-black/40 rounded-2xl border border-white/5 flex justify-between items-center text-xs">
                  <span className="text-neutral-500 font-black tracking-wider uppercase">SYNC ENGINE RANK:</span>
                  <span className={`px-2.5 py-0.5 rounded-md font-black text-[10px] border uppercase ${currentBadge.color}`}>{currentBadge.title}</span>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Full Name</label><input placeholder="Full Name" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-indigo-500 rounded-xl p-3 text-sm text-neutral-200 focus:outline-none" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Age</label><input type="number" placeholder="Age" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-indigo-500 rounded-xl p-3 text-sm text-neutral-200 focus:outline-none" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Gender</label><input placeholder="Gender" value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-indigo-500 rounded-xl p-3 text-sm text-neutral-200 focus:outline-none" /></div>
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Phone Number</label><input placeholder="Phone Number" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full bg-black/40 border border-white/5 focus:border-indigo-500 rounded-xl p-3 text-sm text-neutral-200 focus:outline-none" /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Email Node (Read-Only)</label><input value={user.email} disabled className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-sm text-neutral-500 cursor-not-allowed opacity-50" /></div>
                  
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowProfile(false)} className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 font-black rounded-xl text-xs uppercase tracking-widest border border-white/5">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 font-black rounded-xl text-xs uppercase tracking-widest text-white shadow-lg">Save Changes</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* AUTOMATED GLASSMORPHIC TOAST ANNOUNCEMENT BLOCK */}
        <AnimatePresence>
          {toast.show && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${
                toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-black tracking-wide uppercase">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}