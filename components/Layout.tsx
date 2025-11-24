
import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans p-4 md:p-8 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-white to-neon-purple">
          SONIC<span className="font-thin">FORGE</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base">Web Audio EQ & Generative AI Transformation</p>
      </header>
      <main className="w-full max-w-5xl space-y-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
