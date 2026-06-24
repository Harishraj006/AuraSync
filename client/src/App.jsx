import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);

  // Auto-login session recovery across browser refreshes
  // client/src/App.jsx - ஓபன் பண்ணி உங்க மத்த useEffect-க்கு உள்ளே அல்லது பக்கத்துல போடுங்க
useEffect(() => {
  const hash = window.location.hash;
  if (hash && hash.includes('access_token=')) {
    const params = new URLSearchParams(hash.replace('#', '?'));
    const accessToken = params.get('access_token');
    const tokenType = params.get('token_type');

    if (accessToken) {
      // 🌟 டைரெக்டா சுபாபேஸ்ல இருந்து யூசர் டேட்டாவை எடுத்து லாகின் சக்சஸ் பண்றோம்!
      fetch('https://ycbufimsypopisgcwmzu.supabase.co/auth/v1/user', {
        headers: {
          'Authorization': `${tokenType} ${accessToken}`,
          'apiKey': 'YOUR_SUPABASE_ANON_KEY' 
        }
      })
      .then(res => res.json())
      .then(userData => {
        if (userData && userData.email) {
          // 🚀 லாகின் பேஜ்ஜை பைபாஸ் பண்ணி நேரடியா மெயின் ஸ்டேட்டை அப்டேட் பண்ணிடுறோம்!
          setUser(userData); // உங்க ஆப்ல லாகின் சக்சஸ் ஆனா என்ன ஸ்டேட் மாறுமோ (e.g., setUser) அதை இங்க போடுங்க boss
          window.location.hash = ''; // URL-ஐ கிளீன் பண்ணிடுறோம்
        }
      })
      .catch(err => console.error("Google Sync Core Crash:", err));
    }
  }
}, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('aurasync_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('aurasync_user');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <header className="border-b border-neutral-900 bg-neutral-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">A</div>
            <span className="font-bold tracking-tight text-lg text-neutral-100">AuraSync <span className="text-xs text-indigo-400 font-medium px-2 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20 ml-1">OS</span></span>
          </div>
        </div>
      </header>

      {/* Dynamic View Injection Based on Auth Context State */}
      <main className="py-6">
        {user ? (
          <Dashboard user={user} onLogout={handleLogout} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
    </div>
  );
}