# 🎬 FilMatch

FilMatch is a modern, responsive movie discovery web application. It allows users to explore the latest movies, search for their favorites, save them to a personal watchlist, and give ratings to films.

This project is built with **Next.js**, **Tailwind CSS**, and uses **Supabase** for authentication and database management, powered by the **TMDB API** for movie data.

---

## ✨ Features

- **Browse & Search:** Discover trending, now playing, and popular movies. Search for specific movies easily with debounce integration.
- **Authentication:** Secure user login and registration powered by Supabase Auth.
- **Watchlist:** Save movies to your personal watchlist to watch later.
- **Ratings:** Rate movies from 1 to 10 stars and keep track of your opinions.
- **Dynamic UI:** Smooth animations, premium glassmorphism UI, and responsive design across all devices.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Backend/Auth:** [Supabase](https://supabase.com/)
- **Data Source:** [TMDB API](https://developer.themoviedb.org/docs)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/filmatch.git
cd filmatch
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root of your project and add the following:

```env
# TMDB API (Get this from https://developer.themoviedb.org/reference/intro/getting-started)
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here

# Supabase Keys (Get this from your Supabase dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Setup Supabase Database
In your Supabase Dashboard, open the **SQL Editor** and run the following commands to create the required tables:

```sql
-- Create Watchlist Table
CREATE TABLE watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  movie_id BIGINT NOT NULL,
  movie_title TEXT NOT NULL,
  movie_poster TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, movie_id)
);

-- Create Ratings Table
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  movie_id BIGINT NOT NULL,
  movie_title TEXT NOT NULL,
  score SMALLINT CHECK (score >= 1 AND score <= 10) NOT NULL,
  rated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, movie_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can only see their own watchlist" ON watchlist FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only see their own ratings" ON ratings FOR ALL USING (auth.uid() = user_id);
```

### 5. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 🌐 Deployment (Vercel)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).
1. Connect your GitHub repository to Vercel.
2. In the deployment settings, make sure to add all three environment variables (`NEXT_PUBLIC_TMDB_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Click "Deploy".

---
*Created with ❤️ for movie enthusiasts.*
