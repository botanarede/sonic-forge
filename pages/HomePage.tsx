
import React from 'react';
import Visualizer from '../components/Visualizer';
import Equalizer from '../components/Equalizer';
import { AudioState } from '../types';

interface HomePageProps {
  audioState: AudioState;
  hasFile: boolean;
  togglePlay: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDownloadProcessed: () => void;
  formatTime: (time: number) => string;
}

const HomePage: React.FC<HomePageProps> = ({
  audioState,
  hasFile,
  togglePlay,
  handleSeek,
  handleDownloadProcessed,
  formatTime
}) => {
  if (!hasFile) {
    return null; // Upload handled in App.tsx
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gray-900/30 backdrop-blur rounded-2xl p-1 border border-gray-800/50">
        <Visualizer />
        <div className="p-4 flex items-center gap-4">
          <button 
            onClick={togglePlay}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-neon-blue text-black hover:bg-white hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,243,255,0.4)]"
          >
            {audioState.isPlaying ? (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
            ) : (
              <svg className="w-5 h-5 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-400 mb-1 font-mono">
              <span>{formatTime(audioState.currentTime)}</span>
              <span>{formatTime(audioState.duration)}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max={audioState.duration} 
              value={audioState.currentTime} 
              onChange={handleSeek}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-neon-blue"
            />
          </div>
          <div className="hidden md:block text-right">
            <div className="text-xs text-white font-bold truncate max-w-[150px]">{audioState.fileName}</div>
            <div className="text-[10px] text-gray-500">{audioState.fileSize}</div>
          </div>
        </div>
      </div>

      <Equalizer />

      <div className="flex justify-end">
        <button 
          onClick={handleDownloadProcessed}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Baixar Mixagem (EQ)
        </button>
      </div>
    </div>
  );
};

export default HomePage;
