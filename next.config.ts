import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tidak bisa menggunakan output: "export" karena proyek ini menggunakan
  // Supabase SSR (Server-Side Rendering) dan cookies().
  // GitHub Pages hanya mendukung Static HTML, bukan Next.js SSR.
  
  images: {
    unoptimized: true, 
  },
  
  reactCompiler: true,
};

export default nextConfig;
