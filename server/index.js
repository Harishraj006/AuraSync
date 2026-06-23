const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const timeOrder = [
  "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM",
  "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"
];

// ==========================================
// 👤 PROFILES ROUTES
// ==========================================
app.get('/api/profile/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId);
    if (error) throw error;
    if (!data || data.length === 0) return res.json({ full_name: '', age: '', gender: '', phone: '' });
    res.json(data[0]);
  } catch (err) { 
    res.json({ full_name: '', age: '', gender: '', phone: '' }); 
  }
});

app.post('/api/profile/update', async (req, res) => {
  const { id, full_name, age, gender, phone } = req.body;
  try {
    await supabase.from('profiles').upsert({ id, full_name, age: age ? parseInt(age) : null, gender, phone, updated_at: new Date() });
    res.json({ success: true });
  } catch (err) { 
    res.status(500).json({ error: 'Profile update failed', details: err }); 
  }
});

// ==========================================
// 🔑 AUTH ROUTES
// ==========================================
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, user: data.user });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, session: data.session, user: data.user });
});

// ==========================================
// 📅 LOG ENGINE ROUTES
// ==========================================
app.post('/api/logs/today', async (req, res) => {
  const { userId } = req.body;
  const todayDate = new Date().toISOString().split('T')[0];
  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  try {
    let { data: log } = await supabase.from('daily_logs').select('*').eq('user_id', userId).eq('log_date', todayDate).single();

    if (!log) {
      const { data: newLog } = await supabase.from('daily_logs').insert([{ user_id: userId, log_date: todayDate, log_day: dayName, happy_moment: '' }]).select().single();
      log = newLog;

      const slotInserts = timeOrder.map(slot => ({ log_id: log.id, time_slot: slot, activity: '', category: 'General' }));
      await supabase.from('hourly_slots').insert(slotInserts);
    }

    const { data: slots } = await supabase.from('hourly_slots').select('*').eq('log_id', log.id);
    const sortedSlots = slots.sort((a, b) => timeOrder.indexOf(a.time_slot) - timeOrder.indexOf(b.time_slot));

    res.json({ success: true, log, slots: sortedSlots });
  } catch (err) { 
    res.status(500).json({ error: 'Sync failed' }); 
  }
});

app.post('/api/logs/update-slot', async (req, res) => {
  const { slotId, activity, category } = req.body;
  try {
    await supabase.from('hourly_slots').update({ activity, category: category || 'General', updated_at: new Date() }).eq('id', slotId);
    res.json({ success: true });
  } catch (err) { 
    res.status(500).json({ error: 'Update failed' }); 
  }
});

app.post('/api/logs/update-incident', async (req, res) => {
  const { logId, happyMoment } = req.body;
  try {
    await supabase.from('daily_logs').update({ happy_moment: happyMoment }).eq('id', logId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Incident update failed' });
  }
});

app.get('/api/logs/history/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { data } = await supabase.from('daily_logs').select(`id, log_date, log_day, happy_moment, hourly_slots ( id, time_slot, activity, category )`).eq('user_id', userId).order('log_date', { ascending: false });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'History fetch failed' });
  }
});

// ==========================================
// 🤖 MOCK AI INSIGHTS GENERATOR
// ==========================================
app.post('/api/ai/reflect', (req, res) => {
  const { slots } = req.body;
  const filled = slots.filter(s => s.activity && s.activity.trim().length > 0);
  
  if (filled.length === 0) {
    return res.json({ reflection: "Your timeline is completely empty today. Type your hour-to-hour operations first to trigger the AuraSync AI Diagnostic Summary Engine!" });
  }

  const reflectionTexts = [
    "🔥 EXCELLENT VECTOR OVERFLOW: Today's execution indicates high focus inside your technical task matrix. Your alignment towards project goals is perfectly optimized. Keep pushing this stack sequence!",
    "⚡ BALANCED LIFECYCLE: Productive timeline tracking captured. Good mitigation between core tasks and rest blocks. To maximize aura metrics tomorrow, reduce intermittent idle gaps between 02:00 PM and 04:00 PM.",
    "🚀 AGER PATTERN DETECTED: Consistency parameters checked. Your streak is securely holding up. Continue log processing to accumulate data layers!"
  ];
  
  const chosenIndex = filled.length % reflectionTexts.length;
  res.json({ reflection: reflectionTexts[chosenIndex] });
});

// ==========================================
// 🏆 OPTIMIZED REAL-TIME LEADERBOARD ENGINE
// ==========================================
app.get('/api/analytics/leaderboard', async (req, res) => {
  try {
    // 1. Fetch all profiles
    const { data: userProfiles, error: profileErr } = await supabase
      .from('profiles')
      .select('id, full_name');
    
    if (profileErr) throw profileErr;

    // 2. Optimized: Get only slots count directly from daily_logs & hourly_slots relation
    const { data: allLogs, error: logsErr } = await supabase
      .from('daily_logs')
      .select('user_id, hourly_slots(activity)');

    if (logsErr) throw logsErr;

    // 3. Map aggregates matrix efficiently
    const leaderboardData = userProfiles.map(profile => {
      const userLogs = allLogs.filter(log => log.user_id === profile.id);
      
      let totalSlotsTracked = 0;
      let filledSlotsCount = 0;

      userLogs.forEach(log => {
        if (log.hourly_slots) {
          totalSlotsTracked += log.hourly_slots.length;
          // Security check to avoid blank or spaces counting as productive aura activity
          filledSlotsCount += log.hourly_slots.filter(s => s.activity && s.activity.trim().length > 0).length;
        }
      });

      const userAuraMetrics = totalSlotsTracked > 0 
        ? Math.round((filledSlotsCount / totalSlotsTracked) * 100) 
        : 0;

      return {
        id: profile.id,
        name: profile.full_name || 'Anonymous Engine',
        streakDays: userLogs.length || 1, // Count of daily log rows equals active tracking days
        auraScore: userAuraMetrics
      };
    });

    // Sort descending by score
    const sortedLeaderboard = leaderboardData.sort((a, b) => b.auraScore - a.auraScore);
    res.json(sortedLeaderboard);

  } catch (err) {
    console.error("Leaderboard calculation crash failure:", err);
    res.status(500).json({ error: 'Failed to aggregate leaderboard metrics data layers' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 AuraSync Ultimate Engine operating on port ${PORT}`));