import React, { useEffect, useState } from 'react';
import { audioService } from '../services/audioService';
import { EqualizerBand } from '../types';

const Equalizer: React.FC = () => {
  const [bands, setBands] = useState<EqualizerBand[]>([]);

  useEffect(() => {
    // Initial load
    setBands([...audioService.getBands()]);
  }, []);

  const handleGainChange = (index: number, value: number) => {
    audioService.setGain(index, value);
    // Update local state to reflect UI
    const newBands = [...bands];
    newBands[index].gain = value;
    setBands(newBands);
  };

  const handleReset = () => {
    bands.forEach((_, i) => handleGainChange(i, 0));
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur border border-gray-800 p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
          Equalizador
        </h3>
        <button 
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
        >
          Resetar
        </button>
      </div>

      <div className="grid grid-cols-5 md:grid-cols-10 gap-4 h-64">
        {bands.map((band, index) => (
          <div key={index} className="flex flex-col items-center h-full group">
            <div className="relative flex-1 w-full flex justify-center py-2 bg-gray-900 rounded-full border border-gray-800 group-hover:border-gray-700 transition-colors">
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={band.gain}
                onChange={(e) => handleGainChange(index, parseFloat(e.target.value))}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center center',
                  width: '180px', // Visual hack for vertical slider
                  height: '40px',
                  top: '50%',
                  left: '50%',
                  marginTop: '-20px',
                  marginLeft: '-90px'
                }}
              />
              {/* Visual Track */}
              <div className="absolute top-2 bottom-2 w-1 bg-gray-800 rounded-full overflow-hidden">
                 <div 
                   className="absolute bottom-1/2 w-full bg-neon-blue transition-all duration-75"
                   style={{ height: `${(band.gain / 12) * 50}%` }}
                 ></div>
                 <div 
                   className="absolute top-1/2 w-full bg-neon-purple transition-all duration-75"
                   style={{ height: `${-(band.gain / 12) * 50}%` }}
                 ></div>
              </div>
              {/* Thumb Indicator */}
              <div 
                 className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] pointer-events-none transition-all duration-75"
                 style={{ bottom: `calc(50% + ${(band.gain / 24) * 80}%)` }}
              ></div>
            </div>
            <span className="mt-3 text-[10px] md:text-xs text-gray-400 font-mono tracking-tighter">{band.label}</span>
            <span className="text-[10px] text-gray-600 font-mono">{band.gain > 0 ? '+' : ''}{band.gain}db</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Equalizer;
