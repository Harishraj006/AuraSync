import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function Home() {
  const [diaryText, setDiaryText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState(null);

  const handleSync = async () => {
    if (!diaryText.trim()) return;
    setIsSyncing(true);
    setResult(null);
    
    try {
      // Calls the new backend route that does AI + Database Save in one step
      const response = await axios.post('http://localhost:5000/api/sync', {
        diaryText: diaryText
      });
      
      setResult(response.data.aiData);
    } catch (error) {
      console.error("Sync Error:", error);
      alert("Failed to save. Is your backend running?");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 mt-10">
      <AnimatePresence mode="wait">
        
        {/* STAGE 1: DIARY UPLOAD */}
        {!result && (
          <motion.div 
            key="upload-stage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold tracking-tight">Daily Diary</h2>
              <p className="text-neutral-400">Dump your thoughts. We'll extract your Aura and log it safely.</p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 transition duration-500"></div>
              <textarea
                value={diaryText}
                onChange={(e) => setDiaryText(e.target.value)}
                placeholder="I crushed my database exam today, but skipped the gym..."
                className="relative w-full h-64 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none placeholder:text-neutral-600 shadow-xl"
              />
            </div>

            <button
              onClick={handleSync}
              disabled={isSyncing || !diaryText.trim()}
              className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-all disabled:opacity-50"
            >
              {isSyncing ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                <><Send className="w-5 h-5" /> Save to Diary</>
              )}
            </button>
          </motion.div>
        )}

        {/* STAGE 2: SUCCESS RESULT */}
        {result && (
          <motion.div 
            key="success-stage"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 space-y-8 bg-neutral-900 rounded-2xl border border-neutral-800"
          >
            <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto" />
            <div>
              <span className="text-6xl block mb-4">{result.emoji}</span>
              <h2 className="text-3xl font-bold mb-2">Diary Logged Successfully</h2>
              <p className="text-neutral-400">AI has processed your day and saved it to the database.</p>
            </div>
            
            <div className="flex justify-center gap-12 pt-6">
              <div className="text-center">
                <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2 font-bold">Happiness</p>
                <p className="text-5xl font-bold text-indigo-400">{result.happiness}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2 font-bold">Productivity</p>
                <p className="text-5xl font-bold text-emerald-400">{result.productivity}%</p>
              </div>
            </div>

            <button 
              onClick={() => { setResult(null); setDiaryText(''); }}
              className="mt-8 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-sm font-medium transition-colors"
            >
              Write another entry
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}