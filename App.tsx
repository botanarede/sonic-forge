
import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AiPage from './pages/AiPage';
import { audioService } from './services/audioService';
import { AudioState } from './types';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
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
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', onLocationChange);
    return () => {
      window.removeEventListener('popstate', onLocationChange);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
      if (audioService.isPlaying()) {
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

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const renderPage = () => {
    if (!hasFile) {
      return (
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
      );
    }

    switch (currentPath) {
      case '/':
        return <HomePage {...{ audioState, hasFile, togglePlay, handleSeek, handleDownloadProcessed, formatTime }} />;
      case '/ai':
        return <AiPage audioBuffer={audioService.getRawBuffer()} />;
      default:
        return <HomePage {...{ audioState, hasFile, togglePlay, handleSeek, handleDownloadProcessed, formatTime }} />;
    }
  };

  return (
    <Layout>
      {
        hasFile && (
          <nav className="flex justify-center mb-4">
            <button onClick={() => navigate('/')} className={`px-4 py-2 ${currentPath === '/' ? 'text-neon-blue' : ''}`}>Equalizer</button>
            <button onClick={() => navigate('/ai')} className={`px-4 py-2 ${currentPath === '/ai' ? 'text-neon-blue' : ''}`}>AI</button>
          </nav>
        )
      }
      {renderPage()}
      {
        hasFile && (
            <div className="text-center">
              <button 
                onClick={() => window.location.reload()}
                className="text-gray-500 hover:text-red-400 text-xs underline mt-8"
              >
                Carregar novo arquivo
              </button>
            </div>
        )
      }
    </Layout>
  );
};

export default App;
