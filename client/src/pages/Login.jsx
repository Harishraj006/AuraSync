import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import axios from 'axios';

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
      const response = await axios.post(`http://localhost:5000${endpoint}`, { email, password });
      if (response.data.success) {
        // Logged in successfully, pass user data up
        onLoginSuccess(response.data.user || response.data.session.user);
      }
    } catch (error) {
      console.error("Auth Error:", error);
      alert(error.response?.data?.error || "Authentication failed!");
    } finally {
      setLoading(false);
    }
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
                placeholder="harishraj@example.com"
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
                placeholder="••••••••"
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