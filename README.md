# 🚀 AuraSync OS - Premium Hour-to-Hour Productivity Tracking Matrix

AuraSync OS is an ultra-sleek, full-stack productivity ecosystem designed to log, gamify, and optimize daily operations. Built with a stunning glassmorphic dark user interface, it features a dynamic 16-hour tracking matrix, a real-time gamified leaderboard engine, and automated behavioral analytics.

## 🛠️ The Tech Stack Grid

- **Frontend:** React.js, Tailwind CSS, Framer Motion (for liquid smooth UI transitions), Lucide React (Icons).
- **Backend:** Node.js & Express.js (Modular API routing).
- **Database Layer:** Supabase (PostgreSQL) managing user profiles, relational hourly logs, and session management.
- **Authentication:** Supabase Native Auth combined with Google OAuth integration.

---

## 🏆 Key Architectural Features

### 1. Dynamic Log Synchronization Matrix
- Automatically initializes a 16-hour tracking ledger (`07:00 AM` to `10:00 PM`) for users on their first daily authentication.
- Seamlessly handles relational upserts across tables like `daily_logs` and `hourly_slots`.

### 2. Real-Time Gamified Leaderboard Engine
- An optimized SQL aggregation pipeline that queries active profiles.
- Dynamically computes an **Aura Metric Score (%)** based on the density of filled productive slots vs. total slots to foster community building and focus.

### 3. Integrated AI Diagnostics (Mock Engine)
- A stateful analytical engine evaluating log density.
- Delivers precise diagnostic vector reflections and behavioral feedback based on your task sequences.

### 4. Advanced UI Shell
- Absolute Glassmorphism design pattern with multi-state visibility filters (e.g., Password Visibility Eye Icon Node) for premium access control.

---

## 🚀 Installation & Local Deployment Blueprint

Follow these steps to initialize the core infrastructure locally:

### 1. Clone the Repository Matrix
```bash
git clone [https://github.com/your-username/aurasync.git](https://github.com/your-username/aurasync.git)
cd aurasync
2. Configure Environment Variables
Create a .env file inside the server/ root directory:

Code snippet
PORT=5000
SUPABASE_URL=[https://ycbufimsypopisgcwmzu.supabase.co](https://ycbufimsypopisgcwmzu.supabase.co)
SUPABASE_KEY=your_supabase_service_role_or_anon_key
3. Spin up the Backend Server
Bash
cd server
npm install
npm start
4. Launch the Frontend UI Client
Bash
cd ../client
npm install
npm run dev
📝 Database Schema Blueprints (Supabase / PostgreSQL)
profiles Table
id (uuid, primary key) references auth.users

full_name (text)

aura_score (int)

daily_logs Table
id (uuid, primary key)

user_id (uuid) references profiles.id

log_date (date)

happy_moment (text)

hourly_slots Table
id (uuid, primary key)

log_id (uuid) references daily_logs.id

time_slot (text)

activity (text)

category (text)

👥 Engineering & Contributions
Developed with high focus. Feedback on data layers and routing architectures are highly welcome!

⭐ If you like this architecture, consider giving this repository a star!
