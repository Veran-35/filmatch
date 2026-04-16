import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Memberitahu Next.js untuk mem-build HTML statis
  output: "export",
  
  // Menyesuaikan path dengan nama repository Anda
  basePath: "/filmatch",
  
  // Mematikan optimasi gambar bawaan Next.js (wajib untuk static export)
  images: {
    unoptimized: true, 
  },
  
  reactCompiler: true,
};

export default nextConfig;
