import React, { useState, useEffect, useRef } from 'react';
import Visualizer from './components/Visualizer';
import Equalizer from './components/Equalizer';
import AiModifier from './components/AiModifier';
import { audioService } from './services/audioService';
import { AudioState } from './types';

const App: React.FC = () => {
  const [hasFile, setHasFile] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    fileName: null,
    fileSize: null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const updateTime = () => {
      if (audioState.isPlaying) {
        setAudioState(prev => ({
          ...prev,
          currentTime: audioService.getCurrentTime()
        }));
        rafRef.current = requestAnimationFrame(updateTime);
      }
    };

    if (audioState.isPlaying) {
      updateTime();
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [audioState.isPlaying]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await audioService.loadFile(file);
        setHasFile(true);
        setAudioState(prev => ({
          ...prev,
          fileName: file.name,
          fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          duration: audioService.getDuration()
        }));
      } catch (err) {
        console.error("Error loading file", err);
        alert("Erro ao carregar áudio.");
      }
    }
  };

  const togglePlay = () => {
    if (audioState.isPlaying) {
      audioService.pause();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audioService.play(audioService.getCurrentTime());
      setAudioState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    audioService.seek(time);
    setAudioState(prev => ({ ...prev, currentTime: time }));
  };

  const handleDownloadProcessed = async () => {
    const blob = await audioService.exportProcessedAudio();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sonicforge_eq_${audioState.fileName?.replace('.mp3', '') || 'track'}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans p-4 md:p-8 flex flex-col items-center">
      
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-white to-neon-purple">
          SONIC<span className="font-thin">FORGE</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base">Web Audio EQ & Generative AI Transformation</p>
      </header>

      {/* Main Interface */}
      <main className="w-full max-w-5xl space-y-6">
        
        {/* Upload Section */}
        {!hasFile && (
          <div className="border-2 border-dashed border-gray-800 rounded-2xl p-12 text-center hover:border-neon-blue transition-colors group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="mb-4 text-6xl group-hover:scale-110 transition-transform duration-300">💿</div>
            <h2 className="text-2xl font-bold mb-2 text-white">Carregue seu Áudio</h2>
            <p className="text-gray-500">MP3, WAV suportados</p>
            <input 
              type="file" 
              accept="audio/*" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </div>
        )}

        {hasFile && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Player Controls & Visualizer */}
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

            {/* EQ Section */}
            <Equalizer />

            {/* Download EQ Button */}
            <div className="flex justify-end">
               <button 
                 onClick={handleDownloadProcessed}
                 className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                 Baixar Mixagem (EQ)
               </button>
            </div>

            {/* AI Section */}
            <AiModifier />
            
            <div className="text-center">
              <button 
                onClick={() => window.location.reload()}
                className="text-gray-500 hover:text-red-400 text-xs underline mt-8"
              >
                Carregar novo arquivo
              </button>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;
