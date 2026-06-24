import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = "https://aurasync-backend-4o2n.onrender.com";

export default function Login({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🌟 GOOGLE AUTH AUTOLOGIN SESSION TRACKER MATRIX
 // 🌟 GOOGLE AUTH AUTOLOGIN SESSION TRACKER MATRIX
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      setLoading(true);
      setError(''); // ⚠️ பழைய எரர்ஸ் எல்லாத்தையும் க்ளீன் பண்றோம் boss!
      
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      const tokenType = params.get('token_type');

      if (accessToken) {
        fetch('https://ycbufimsypopisgcwmzu.supabase.co/auth/v1/user', {
          headers: {
            'Authorization': `${tokenType} ${accessToken}`
          }
        })
        .then(res => res.json())
        .then(userData => {
          if (userData && userData.email) {
            onLoginSuccess(userData);
          }
        })
        .catch(err => {
          console.error("Google Session Sync Error:", err);
          setError("Google synchronization expired. Try again.");
        })
        .finally(() => setLoading(false));
      }
    }
  }, [onLoginSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, { 
        email: email.trim(), 
        password 
      });
      if (response.data && response.data.success) {
        onLoginSuccess(response.data.user || response.data.session?.user);
      } else {
        setError("Invalid login credentials. Please check again.");
      }
    } catch (err) {
      console.error("Auth Error Layer:", err);
      setError(err.response?.data?.error || "Authentication failed!");
    } finally {
      setLoading(false);
    }
  };

  // 🌟 DIRECT BYPASS REDIRECTION (MAPPED TO REAL ID: ycbufimsypopisgcwmzu)
  const handleGoogleLogin = () => {
    // லாகின் ஆன உடனே பாஸ்வேர்ட் கேட்காம நேரடியா நம்ம விண்டோ லொகேஷனுக்கே செஷனை திருப்பி விட்டுடும்!
    window.location.href = `https://ycbufimsypopisgcwmzu.supabase.co/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-neutral-400 text-sm">
            {isSignUp ? "Sign up to track your hour-to-hour aura" : "Login to manage your daily timeline logs"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl text-center uppercase tracking-wide">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="w-8 h-8 border-4 border-t-indigo-500 border-neutral-800 rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest animate-pulse">Syncing Google Vector Core...</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your secure password..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-12 pr-12 text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-all mt-4"
              >
                {isSignUp ? <><UserPlus className="w-5 h-5" /> Sign Up</> : <><LogIn className="w-5 h-5" /> Log In</>}
              </button>
            </form>

            {/* GOOGLE OAuth SPLITTER */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-neutral-800"></div>
              <span className="flex-shrink mx-4 text-neutral-500 font-bold text-[9px] uppercase tracking-widest">OR</span>
              <div className="flex-grow border-t border-neutral-800"></div>
            </div>

            {/* PREMIUM ULTRA BYPASS GOOGLE SIGN-IN */}
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3.5 flex items-center justify-center gap-2 bg-neutral-950/60 hover:bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.37 3.65 1.4 7.56l3.77 2.92C6.11 7.42 8.84 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.62l3.77 2.92c2.2-2.03 3.48-5.02 3.48-8.69z"/>
                <path fill="#FBBC05" d="M5.17 14.52c-.23-.69-.37-1.43-.37-2.2 0-.77.13-1.51.37-2.2L1.4 7.2C.51 8.93 0 10.89 0 12s.51 3.07 1.4 4.8l3.77-2.28z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.77-2.92c-1.1.74-2.52 1.19-4.19 1.19-3.16 0-5.89-2.38-6.83-5.44L1.4 15.83C3.37 19.74 7.35 23 12 23z"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <div className="text-center mt-6">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-neutral-400 hover:text-white underline underline-offset-4 decoration-neutral-800 transition-colors"
          >
            {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}