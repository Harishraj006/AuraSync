import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Chrome } from 'lucide-react';
import axios from 'axios';

// Live Production Render Backend API Node Link
const API_BASE_URL = "https://aurasync-backend-4o2n.onrender.com";

export default function Login({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
    try {
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, { 
        email: email.trim(), 
        password 
      });
      if (response.data.success) {
        // Logged in successfully, pass user data up
        onLoginSuccess(response.data.user || response.data.session?.user);
      }
    } catch (error) {
      console.error("Auth Error Layer:", error);
      alert(error.response?.data?.error || "Authentication matrix failed!");
    } finally {
      setLoading(false);
    }
  };

  // 🌟 GOOGLE AUTHENTICATION INTEGRATION ROUTER REDIRECTION
  const handleGoogleLogin = () => {
    // Supabase native direct cloud OAuth url redirection node
    window.location.href = `https://your-supabase-project-id.supabase.co/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}`;
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
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-neutral-400 text-sm">
            {isSignUp ? "Sign up to track your hour-to-hour aura" : "Login to manage your daily timeline logs"}
          </p>
        </div>

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
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your secure password..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-neutral-200 placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : isSignUp ? (
              <><UserPlus className="w-5 h-5" /> Sign Up</>
            ) : (
              <><LogIn className="w-5 h-5" /> Log In</>
            )}
          </button>
        </form>

        {/* 🌟 GOOGLE OAuth SPLITTER GRID ELEMENT */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-neutral-800"></div>
          <span className="flex-shrink mx-4 text-neutral-500 font-bold text-[9px] uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-neutral-800"></div>
        </div>

        {/* 🌟 PREMIUM NEOMORPHIC GOOGLE SIGN-IN WIDGET BUTTON */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full py-3.5 flex items-center justify-center gap-2 bg-neutral-950/60 hover:bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm"
        >
          <Chrome className="w-4 h-4 text-red-400 animate-spin-slow" /> Continue with Google
        </button>

        <div className="text-center mt-6">
          <button 
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